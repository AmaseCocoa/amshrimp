import { queueLogger } from "../../logger.js";
import { deleteFileSync } from "@/services/drive/delete-file.js";
import { DriveFiles } from "@/models/index.js";
import { User } from "@/models/entities/user.js";
import config from "@/config/index.js";
import { Job } from "bullmq";

const logger = queueLogger.createSubLogger("clean-remote-files");

export async function cleanRemoteFiles(
	job: Job<Record<string, unknown>>,
): Promise<string> {
	let progress = 0;
	const untilDate = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000));
	untilDate.setDate(untilDate.getDate() - (config.mediaCleanup?.maxAgeDays ?? 0));
	const avatars = !(config.mediaCleanup?.keepHeaders ?? true);
	const headers = !(config.mediaCleanup?.keepHeaders ?? true);

	const until = untilDate.toISOString().replace("T", " ").slice(0, -1);

	let target = "files";
	if (avatars)
		if (headers) target += ", avatars & headers";
		else target += " & avatars";
	else if (headers) target += " & headers";

	logger.info(`Deleting cached remote ${target} created before ${until}...`);

	let query = DriveFiles.createQueryBuilder("file")
		.where(`file.isLink = FALSE`)
		.andWhere(`file.userHost IS NOT NULL`)
		.andWhere("file.createdAt < :until", { until });

	if (!avatars || !headers) {
		query = query.andWhere((qb) => {
			let sq = qb.subQuery().from(User, "user");

			if (!avatars) sq = sq.where("file.id = user.avatarId");
			if (!headers) sq = sq.orWhere("file.id = user.bannerId");

			return `NOT EXISTS ${sq.getQuery()}`;
		});
	}

	query = query.take(8);

	const total = await query.getCount();
	logger.info(`Deleting ${total} files, please wait...`);

	while (true) {
		const files = await query.getMany();

		if (files.length === 0) {
			job.updateProgress(100);
			break;
		}

		await Promise.all(files.map((file) => deleteFileSync(file, true)));

		progress += files.length;

		job.updateProgress((progress / total) * 100);
	}

	logger.succ(`Remote media cleanup job completed successfully.`);
	return "Success";
}
