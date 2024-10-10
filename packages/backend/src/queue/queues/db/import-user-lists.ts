import { queueLogger } from "../../logger.js";
import * as Acct from "@/misc/acct.js";
import { resolveUser } from "@/remote/resolve-user.js";
import { pushUserToUserList } from "@/services/user-list/push.js";
import { downloadTextFile } from "@/misc/download-text-file.js";
import { isSelfHost, toPuny } from "@/misc/convert-host.js";
import {
	DriveFiles,
	Users,
	UserLists,
	UserListJoinings, Blockings, Followings,
} from "@/models/index.js";
import { genId } from "@/misc/gen-id.js";
import type { DbUserImportJobData } from "@/queue/types.js";
import { IsNull } from "typeorm";
import { Job } from "bullmq";

const logger = queueLogger.createSubLogger("import-user-lists");

export async function importUserLists(
	job: Job<DbUserImportJobData>,
): Promise<string> {
	logger.info(`Importing user lists of ${job.data.user.id} ...`);

	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		return "skip: User not found";
	}

	const file = await DriveFiles.findOneBy({
		id: job.data.fileId,
	});
	if (file == null) {
		return "skip: File not found";
	}

	const csv = await downloadTextFile(file.url);

	let linenum = 0;

	for (const line of csv.trim().split("\n")) {
		linenum++;

		try {
			const listName = line.split(",")[0].trim();
			const { username, host } = Acct.parse(line.split(",")[1].trim());

			let list = await UserLists.findOneBy({
				userId: user.id,
				name: listName,
			});

			if (list == null) {
				list = await UserLists.insert({
					id: genId(),
					createdAt: new Date(),
					userId: user.id,
					name: listName,
				}).then((x) => UserLists.findOneByOrFail(x.identifiers[0]));
			}

			let target = isSelfHost(host!)
				? await Users.findOneBy({
						host: IsNull(),
						usernameLower: username.toLowerCase(),
				  })
				: await Users.findOneBy({
						host: toPuny(host!),
						usernameLower: username.toLowerCase(),
				  });

			if (target == null) {
				target = await resolveUser(username, host);
			}

			const isBlocked = await Blockings.exist({
				where: {
					blockerId: target.id,
					blockeeId: user.id,
				},
			});
			const isFollowed = await Followings.exist({
				where: {
					followerId: user.id,
					followeeId: target.id,
				},
			});

			if (isBlocked || !isFollowed) continue;

			if (
				(await UserListJoinings.findOneBy({
					userListId: list!.id,
					userId: target.id,
				})) != null
			)
				continue;

			pushUserToUserList(target, list!);
		} catch (e) {
			logger.warn(`Error in line:${linenum} ${e}`);
		}
	}

	logger.succ("Imported");
	return "Success";
}
