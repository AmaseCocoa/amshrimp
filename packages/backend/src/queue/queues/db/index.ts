import { Job, Processor } from "bullmq";
import { deleteAccount } from "./delete-account.js";
import { deleteDriveFiles } from "./delete-drive-files.js";
import { exportBlocking } from "./export-blocking.js";
import { exportCustomEmojis } from "./export-custom-emojis.js";
import { exportFollowing } from "./export-following.js";
import { exportMute } from "./export-mute.js";
import { exportNotes } from "./export-notes.js";
import { exportUserLists } from "./export-user-lists.js";
import { importBlocking } from "./import-blocking.js";
import { importCustomEmojis } from "./import-custom-emojis.js";
import { importFollowing } from "./import-following.js";
import { importMuting } from "./import-muting.js";
import { importUserLists } from "./import-user-lists.js";
import { createQueue } from "../index.js";
import { ThinUser } from "@/queue/types.js";
import { DriveFile } from "@/models/entities/drive-file.js";
import config from "@/config/index.js";

const processors = {
	deleteAccount,
	deleteDriveFiles,
	exportBlocking,
	exportCustomEmojis,
	exportFollowing,
	exportMute,
	exportNotes,
	exportUserLists,
	importBlocking,
	importCustomEmojis,
	importFollowing,
	importMuting,
	importUserLists,
} as Record<string, Processor>;

async function process(job: Job<any>): Promise<string> {
	const processor = processors[job.name];
	if (processor === undefined) return "skip: unknown job name";
	return await processor(job);
}

export const [dbQueue, dbInit] =
	createQueue("db", process, { limitPerSec: 256, concurrency: 16 });

export function createDeleteDriveFilesJob(user: ThinUser) {
	return dbQueue.add(
		"deleteDriveFiles",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportCustomEmojisJob(user: ThinUser) {
	return dbQueue.add(
		"exportCustomEmojis",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportNotesJob(user: ThinUser) {
	return dbQueue.add(
		"exportNotes",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportFollowingJob(
	user: ThinUser,
	excludeMuting = false,
	excludeInactive = false,
) {
	return dbQueue.add(
		"exportFollowing",
		{
			user: user,
			excludeMuting,
			excludeInactive,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportMuteJob(user: ThinUser) {
	return dbQueue.add(
		"exportMute",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportBlockingJob(user: ThinUser) {
	return dbQueue.add(
		"exportBlocking",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportUserListsJob(user: ThinUser) {
	return dbQueue.add(
		"exportUserLists",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportFollowingJob(
	user: ThinUser,
	fileId: DriveFile["id"],
) {
	return dbQueue.add(
		"importFollowing",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportMastoPostJob(
	user: ThinUser,
	post: any,
	signatureCheck: boolean,
) {
	return dbQueue.add(
		"importMastoPost",
		{
			user: user,
			post: post,
			signatureCheck: signatureCheck,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
			attempts: config.inboxJobMaxAttempts || 8,
		},
	);
}

export function createImportCkPostJob(
	user: ThinUser,
	post: any,
	signatureCheck: boolean,
) {
	return dbQueue.add(
		"importCkPost",
		{
			user: user,
			post: post,
			signatureCheck: signatureCheck,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportMutingJob(user: ThinUser, fileId: DriveFile["id"]) {
	return dbQueue.add(
		"importMuting",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportBlockingJob(
	user: ThinUser,
	fileId: DriveFile["id"],
) {
	return dbQueue.add(
		"importBlocking",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportUserListsJob(
	user: ThinUser,
	fileId: DriveFile["id"],
) {
	return dbQueue.add(
		"importUserLists",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportCustomEmojisJob(
	user: ThinUser,
	fileId: DriveFile["id"],
) {
	return dbQueue.add(
		"importCustomEmojis",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createDeleteAccountJob(
	user: ThinUser,
	opts: { soft?: boolean } = {},
) {
	return dbQueue.add(
		"deleteAccount",
		{
			user: user,
			soft: opts.soft,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}
