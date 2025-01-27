import { LessThan } from "typeorm";
import { UserIps } from "@/models/index.js";

import { queueLogger } from "../../logger.js";

const logger = queueLogger.createSubLogger("clean");

export async function clean(): Promise<string> {
	logger.info("Cleaning...");

	await UserIps.delete({
		createdAt: LessThan(new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)),
	});

	logger.succ("Cleaned.");
	return "Success";
}
