import * as fs from "node:fs";

import { queueLogger } from "../../logger.js";
import { addFile } from "@/services/drive/add-file.js";
import { format as dateFormat } from "date-fns";
import { getFullApAccount } from "@/misc/convert-host.js";
import { createTemp } from "@/misc/create-temp.js";
import { Users, Blockings } from "@/models/index.js";
import { MoreThan } from "typeorm";
import type { DbUserJobData } from "@/queue/types.js";
import { Job } from "bullmq";

const logger = queueLogger.createSubLogger("export-blocking");

export async function exportBlocking(
	job: Job<DbUserJobData>,
): Promise<string> {
	logger.info(`Exporting blocking of ${job.data.user.id} ...`);

	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		return "skip: User not found";
	}

	// Create temp file
	const [path, cleanup] = await createTemp();

	logger.info(`Temp file is ${path}`);

	try {
		const stream = fs.createWriteStream(path, { flags: "a" });

		let exportedCount = 0;
		let cursor: any = null;

		while (true) {
			const blockings = await Blockings.find({
				where: {
					blockerId: user.id,
					...(cursor ? { id: MoreThan(cursor) } : {}),
				},
				take: 100,
				order: {
					id: 1,
				},
			});

			if (blockings.length === 0) {
				job.updateProgress(100);
				break;
			}

			cursor = blockings[blockings.length - 1].id;

			for (const block of blockings) {
				const u = await Users.findOneBy({ id: block.blockeeId });
				if (u == null) {
					exportedCount++;
					continue;
				}

				const content = getFullApAccount(u.username, u.host);
				await new Promise<void>((res, rej) => {
					stream.write(content + "\n", (err) => {
						if (err) {
							logger.error(err);
							rej(err);
						} else {
							res();
						}
					});
				});
				exportedCount++;
			}

			const total = await Blockings.countBy({
				blockerId: user.id,
			});

			job.updateProgress(exportedCount / total);
		}

		stream.end();
		logger.succ(`Exported to: ${path}`);

		const fileName = `blocking-${dateFormat(
			new Date(),
			"yyyy-MM-dd-HH-mm-ss",
		)}.csv`;
		const driveFile = await addFile({
			user,
			path,
			name: fileName,
			force: true,
		});

		logger.succ(`Exported to: ${driveFile.id}`);
	} finally {
		cleanup();
	}

	return "Success";
}
