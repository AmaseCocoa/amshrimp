import es from '../../db/elasticsearch';
import { publishMainStream, publishNotesStream } from '../stream';
import { deliver } from '../../queue';
import renderNote from '../../remote/activitypub/renderer/note';
import renderCreate from '../../remote/activitypub/renderer/create';
import renderAnnounce from '../../remote/activitypub/renderer/announce';
import { renderActivity } from '../../remote/activitypub/renderer';
import watch from './watch';
import { parse } from '../../mfm/parse';
import { resolveUser } from '../../remote/resolve-user';
import config from '../../config';
import { updateHashtag } from '../update-hashtag';
import { erase, concat } from '../../prelude/array';
import insertNoteUnread from './unread';
import { registerOrFetchInstanceDoc } from '../register-or-fetch-instance-doc';
import extractMentions from '../../misc/extract-mentions';
import extractEmojis from '../../misc/extract-emojis';
import extractHashtags from '../../misc/extract-hashtags';
import { Note } from '../../models/entities/note';
import { Mutings, Users, NoteWatchings, Followings, Notes, Instances, Polls, UserProfiles } from '../../models';
import { DriveFile } from '../../models/entities/drive-file';
import { App } from '../../models/entities/app';
import { Not } from 'typeorm';
import { User, ILocalUser, IRemoteUser } from '../../models/entities/user';
import { genId } from '../../misc/gen-id';
import { notesChart, perUserNotesChart, activeUsersChart, instanceChart } from '../chart';
import { Poll, IPoll } from '../../models/entities/poll';
import { createNotification } from '../create-notification';
import { isDuplicateKeyValueError } from '../../misc/is-duplicate-key-value-error';

type NotificationType = 'reply' | 'renote' | 'quote' | 'mention';

class NotificationManager {
	private notifier: User;
	private note: Note;
	private queue: {
		target: ILocalUser['id'];
		reason: NotificationType;
	}[];

	constructor(notifier: User, note: Note) {
		this.notifier = notifier;
		this.note = note;
		this.queue = [];
	}

	public push(notifiee: ILocalUser['id'], reason: NotificationType) {
		// 自分自身へは通知しない
		if (this.notifier.id === notifiee) return;

		const exist = this.queue.find(x => x.target === notifiee);

		if (exist) {
			// 「メンションされているかつ返信されている」場合は、メンションとしての通知ではなく返信としての通知にする
			if (reason != 'mention') {
				exist.reason = reason;
			}
		} else {
			this.queue.push({
				reason: reason,
				target: notifiee
			});
		}
	}

	public async deliver() {
		for (const x of this.queue) {
			// ミュート情報を取得
			const mentioneeMutes = await Mutings.find({
				muterId: x.target
			});

			const mentioneesMutedUserIds = mentioneeMutes.map(m => m.muteeId);

			// 通知される側のユーザーが通知する側のユーザーをミュートしていない限りは通知する
			if (!mentioneesMutedUserIds.includes(this.notifier.id)) {
				createNotification(x.target, this.notifier.id, x.reason, {
					noteId: this.note.id
				});
			}
		}
	}
}

type Option = {
	createdAt?: Date;
	name?: string;
	text?: string;
	reply?: Note;
	renote?: Note;
	files?: DriveFile[];
	geo?: any;
	poll?: IPoll;
	viaMobile?: boolean;
	localOnly?: boolean;
	cw?: string;
	visibility?: string;
	visibleUsers?: User[];
	apMentions?: User[];
	apHashtags?: string[];
	apEmojis?: string[];
	questionUri?: string;
	uri?: string;
	app?: App;
};

export default async (user: User, data: Option, silent = false) => new Promise<Note>(async (res, rej) => {
	const isFirstNote = user.notesCount === 0;

	if (data.createdAt == null) data.createdAt = new Date();
	if (data.visibility == null) data.visibility = 'public';
	if (data.viaMobile == null) data.viaMobile = false;
	if (data.localOnly == null) data.localOnly = false;

	// サイレンス
	if (user.isSilenced && data.visibility == 'public') {
		data.visibility = 'home';
	}

	if (data.visibleUsers) {
		data.visibleUsers = erase(null, data.visibleUsers);
	}

	// Renote対象が「ホームまたは全体」以外の公開範囲ならreject
	if (data.renote && data.renote.visibility != 'public' && data.renote.visibility != 'home') {
		return rej('Renote target is not public or home');
	}

	// Renote対象がpublicではないならhomeにする
	if (data.renote && data.renote.visibility != 'public' && data.visibility == 'public') {
		data.visibility = 'home';
	}

	// 返信対象がpublicではないならhomeにする
	if (data.reply && data.reply.visibility != 'public' && data.visibility == 'public') {
		data.visibility = 'home';
	}

	// ローカルのみをRenoteしたらローカルのみにする
	if (data.renote && data.renote.localOnly) {
		data.localOnly = true;
	}

	// ローカルのみにリプライしたらローカルのみにする
	if (data.reply && data.reply.localOnly) {
		data.localOnly = true;
	}

	if (data.text) {
		data.text = data.text.trim();
	}

	let tags = data.apHashtags;
	let emojis = data.apEmojis;
	let mentionedUsers = data.apMentions;

	// Parse MFM if needed
	if (!tags || !emojis || !mentionedUsers) {
		const tokens = data.text ? parse(data.text) : [];
		const cwTokens = data.cw ? parse(data.cw) : [];
		const choiceTokens = data.poll && data.poll.choices
			? concat(data.poll.choices.map(choice => parse(choice)))
			: [];

		const combinedTokens = tokens.concat(cwTokens).concat(choiceTokens);

		tags = data.apHashtags || extractHashtags(combinedTokens);

		emojis = data.apEmojis || extractEmojis(combinedTokens);

		mentionedUsers = data.apMentions || await extractMentionedUsers(user, combinedTokens);
	}

	tags = tags.filter(tag => tag.length <= 100);

	if (data.reply && (user.id !== data.reply.userId) && !mentionedUsers.some(u => u.id === data.reply.userId)) {
		mentionedUsers.push(await Users.findOne(data.reply.userId));
	}

	if (data.visibility == 'specified') {
		for (const u of data.visibleUsers) {
			if (!mentionedUsers.some(x => x.id === u.id)) {
				mentionedUsers.push(u);
			}
		}

		if (data.reply && !data.visibleUsers.some(x => x.id === data.reply.userId)) {
			data.visibleUsers.push(await Users.findOne(data.reply.userId));
		}
	}

	const note = await insertNote(user, data, tags, emojis, mentionedUsers);

	res(note);

	if (note == null) {
		return;
	}

	// 統計を更新
	notesChart.update(note, true);
	perUserNotesChart.update(user, note, true);
	// ローカルユーザーのチャートはタイムライン取得時に更新しているのでリモートユーザーの場合だけでよい
	if (Users.isRemoteUser(user)) activeUsersChart.update(user);

	// Register host
	if (Users.isRemoteUser(user)) {
		registerOrFetchInstanceDoc(user.host).then(i => {
			Instances.increment({ id: i.id }, 'notesCount', 1);
			instanceChart.updateNote(i.host, note, true);
		});
	}

	// ハッシュタグ更新
	for (const tag of tags) updateHashtag(user, tag);

	// Increment notes count (user)
	incNotesCountOfUser(user);

	// 未読通知を作成
	if (data.visibility == 'specified') {
		for (const u of data.visibleUsers) {
			insertNoteUnread(u, note, true);
		}
	} else {
		for (const u of mentionedUsers) {
			insertNoteUnread(u, note, false);
		}
	}

	if (data.reply) {
		saveReply(data.reply, note);
	}

	if (data.renote) {
		incRenoteCount(data.renote);
	}

	// Pack the note
	const noteObj = await Notes.pack(note);

	if (isFirstNote) {
		noteObj.isFirstNote = true;
	}

	publishNotesStream(noteObj);

	const nm = new NotificationManager(user, note);
	const nmRelatedPromises = [];

	createMentionedEvents(mentionedUsers, note, nm);

	const noteActivity = await renderNoteOrRenoteActivity(data, note);

	if (Users.isLocalUser(user)) {
		deliverNoteToMentionedRemoteUsers(mentionedUsers, user, noteActivity);
	}

	const profile = await UserProfiles.findOne({ userId: user.id });

	// If has in reply to note
	if (data.reply) {
		// Fetch watchers
		nmRelatedPromises.push(notifyToWatchersOfReplyee(data.reply, user, nm));

		// この投稿をWatchする
		if (Users.isLocalUser(user) && profile.autoWatch) {
			watch(user.id, data.reply);
		}

		// 通知
		if (data.reply.userHost === null) {
			nm.push(data.reply.userId, 'reply');
			publishMainStream(data.reply.userId, 'reply', noteObj);
		}
	}

	// If it is renote
	if (data.renote) {
		const type = data.text ? 'quote' : 'renote';

		// Notify
		if (data.renote.userHost === null) {
			nm.push(data.renote.userId, type);
		}

		// Fetch watchers
		nmRelatedPromises.push(notifyToWatchersOfRenotee(data.renote, user, nm, type));

		// この投稿をWatchする
		if (Users.isLocalUser(user) && profile.autoWatch) {
			watch(user.id, data.renote);
		}

		// Publish event
		if ((user.id !== data.renote.userId) && data.renote.userHost === null) {
			publishMainStream(data.renote.userId, 'renote', noteObj);
		}
	}

	if (!silent) {
		publish(user, note, data.reply, data.renote, noteActivity);
	}

	Promise.all(nmRelatedPromises).then(() => {
		nm.deliver();
	});

	// Register to search database
	index(note);
});

async function renderNoteOrRenoteActivity(data: Option, note: Note) {
	if (data.localOnly) return null;

	const content = data.renote && data.text == null && data.poll == null && (data.files == null || data.files.length == 0)
		? renderAnnounce(data.renote.uri ? data.renote.uri : `${config.url}/notes/${data.renote.id}`, note)
		: renderCreate(await renderNote(note, false), note);

	return renderActivity(content);
}

function incRenoteCount(renote: Note) {
	Notes.increment({ id: renote.id }, 'renoteCount', 1);
	Notes.increment({ id: renote.id }, 'score', 1);
}

async function publish(user: User, note: Note, reply: Note, renote: Note, noteActivity: any) {
	if (Users.isLocalUser(user)) {
		// 投稿がリプライかつ投稿者がローカルユーザーかつリプライ先の投稿の投稿者がリモートユーザーなら配送
		if (reply && reply.userHost !== null) {
			deliver(user, noteActivity, reply.userInbox);
		}

		// 投稿がRenoteかつ投稿者がローカルユーザーかつRenote元の投稿の投稿者がリモートユーザーなら配送
		if (renote && renote.userHost !== null) {
			deliver(user, noteActivity, renote.userInbox);
		}
	}

	if (['public', 'home', 'followers'].includes(note.visibility)) {
		// フォロワーに配信
		publishToFollowers(note, user, noteActivity, reply);
	}
}

async function insertNote(user: User, data: Option, tags: string[], emojis: string[], mentionedUsers: User[]) {
	const insert: Partial<Note> = {
		id: genId(data.createdAt),
		createdAt: data.createdAt,
		fileIds: data.files ? data.files.map(file => file.id) : [],
		replyId: data.reply ? data.reply.id : null,
		renoteId: data.renote ? data.renote.id : null,
		name: data.name,
		text: data.text,
		hasPoll: data.poll != null,
		cw: data.cw == null ? null : data.cw,
		tags: tags.map(tag => tag.toLowerCase()),
		emojis,
		userId: user.id,
		viaMobile: data.viaMobile,
		localOnly: data.localOnly,
		geo: data.geo || null,
		appId: data.app ? data.app.id : null,
		visibility: data.visibility as any,
		visibleUserIds: data.visibility == 'specified'
			? data.visibleUsers
				? data.visibleUsers.map(u => u.id)
				: []
			: [],

		attachedFileTypes: data.files ? data.files.map(file => file.type) : [],

		// 以下非正規化データ
		replyUserId: data.reply ? data.reply.userId : null,
		replyUserHost: data.reply ? data.reply.userHost : null,
		renoteUserId: data.renote ? data.renote.userId : null,
		renoteUserHost: data.renote ? data.renote.userHost : null,
		userHost: user.host,
		userInbox: user.inbox,
	};

	if (data.uri != null) insert.uri = data.uri;

	// Append mentions data
	if (mentionedUsers.length > 0) {
		insert.mentions = mentionedUsers.map(u => u.id);
		insert.mentionedRemoteUsers = JSON.stringify(mentionedUsers.filter(u => Users.isRemoteUser(u)).map(u => ({
			uri: (u as IRemoteUser).uri,
			username: u.username,
			host: u.host
		})));
	}

	// 投稿を作成
	try {
		const note = await Notes.save(insert);

		if (note.hasPoll) {
			await Polls.save({
				noteId: note.id,
				choices: data.poll.choices,
				expiresAt: data.poll.expiresAt,
				multiple: data.poll.multiple,
				votes: new Array(data.poll.choices.length).fill(0),
				noteVisibility: note.visibility,
				userId: user.id,
				userHost: user.host
			} as Poll);
		}

		return note;
	} catch (e) {
		// duplicate key error
		if (isDuplicateKeyValueError(e)) {
			return null;
		}

		console.error(e);

		throw 'something happened';
	}
}

function index(note: Note) {
	if (note.text == null || config.elasticsearch == null) return;

	es.index({
		index: 'misskey',
		type: 'note',
		id: note.id.toString(),
		body: {
			text: note.text
		}
	});
}

async function notifyToWatchersOfRenotee(renote: Note, user: User, nm: NotificationManager, type: NotificationType) {
	const watchers = await NoteWatchings.find({
		noteId: renote.id,
		userId: Not(user.id)
	});

	for (const watcher of watchers) {
		nm.push(watcher.userId, type);
	}
}

async function notifyToWatchersOfReplyee(reply: Note, user: User, nm: NotificationManager) {
	const watchers = await NoteWatchings.find({
		noteId: reply.id,
		userId: Not(user.id)
	});

	for (const watcher of watchers) {
		nm.push(watcher.userId, 'reply');
	}
}

async function publishToFollowers(note: Note, user: User, noteActivity: any, reply: Note) {
	const followers = await Followings.find({
		followeeId: note.userId
	});

	const queue: string[] = [];

	for (const following of followers) {
		if (following.followerHost !== null) {
			// フォロワーがリモートユーザーかつ投稿者がローカルユーザーなら投稿を配信
			if (Users.isLocalUser(user)) {
				const inbox = following.followerSharedInbox || following.followerInbox;
				if (!queue.includes(inbox)) queue.push(inbox);
			}
		}
	}

	for (const inbox of queue) {
		deliver(user as any, noteActivity, inbox);
	}
}

function deliverNoteToMentionedRemoteUsers(mentionedUsers: User[], user: ILocalUser, noteActivity: any) {
	for (const u of mentionedUsers.filter(u => Users.isRemoteUser(u))) {
		deliver(user, noteActivity, (u as IRemoteUser).inbox);
	}
}

async function createMentionedEvents(mentionedUsers: User[], note: Note, nm: NotificationManager) {
	for (const u of mentionedUsers.filter(u => Users.isLocalUser(u))) {
		const detailPackedNote = await Notes.pack(note, u, {
			detail: true
		});

		publishMainStream(u.id, 'mention', detailPackedNote);

		// Create notification
		nm.push(u.id, 'mention');
	}
}

function saveReply(reply: Note, note: Note) {
	Notes.increment({ id: reply.id }, 'repliesCount', 1);
}

function incNotesCountOfUser(user: User) {
	Users.increment({ id: user.id }, 'notesCount', 1);
	Users.update({ id: user.id }, {
		updatedAt: new Date()
	});
}

async function extractMentionedUsers(user: User, tokens: ReturnType<typeof parse>): Promise<User[]> {
	if (tokens == null) return [];

	const mentions = extractMentions(tokens);

	let mentionedUsers = await Promise.all(mentions.map(m =>
		resolveUser(m.username, m.host || user.host).catch(() => null)
	));

	mentionedUsers = mentionedUsers.filter(x => x != null);

	// Drop duplicate users
	mentionedUsers = mentionedUsers.filter((u, i, self) =>
		i === self.findIndex(u2 => u.id === u2.id)
	);

	return mentionedUsers;
}
