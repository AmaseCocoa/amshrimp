import { UserProfiles } from "@/models/index.js";
import { Not } from "typeorm";
import { queueLogger } from "../../logger.js";
import { verifyLink } from "@/services/fetch-rel-me.js";

const logger = queueLogger.createSubLogger("verify-links");

export async function verifyLinks(): Promise<string> {
	logger.info("Verifying links...");

	const usersToVerify = await UserProfiles.findBy({
		fields: Not(null),
		userHost: "",
	});
	for (const user of usersToVerify) {
		for (const field of user.fields) {
			if (!field || field.name === "" || field.value === "") {
				continue;
			}
			if (field.value.startsWith("http") && user.user?.username) {
				field.verified = await verifyLink(field.value, user.user.username);
			}
		}
		if (user.fields.length > 0) {
			try {
				await UserProfiles.update(user.userId, {
					fields: user.fields,
				});
			} catch (e) {
				logger.error(`Failed to update user ${user.userId} ${e}`);
				throw e;
			}
		}
	}

	logger.succ("All links successfully verified.");
	return "Success";
}
