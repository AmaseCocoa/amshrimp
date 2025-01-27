import { generateKeyPair } from "node:crypto";
import generateUserToken from "./generate-native-user-token.js";
import { User } from "@/models/entities/user.js";
import { Users, UsedUsernames } from "@/models/index.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { IsNull } from "typeorm";
import { genId } from "@/misc/gen-id.js";
import { toPunyNullable } from "@/misc/convert-host.js";
import { UserKeypair } from "@/models/entities/user-keypair.js";
import { usersChart } from "@/services/chart/index.js";
import { UsedUsername } from "@/models/entities/used-username.js";
import { db } from "@/db/postgre.js";
import config from "@/config/index.js";
import { hashPassword } from "@/misc/password.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import follow from "@/services/following/create.js";

export async function signup(opts: {
	username: User["username"];
	password?: string | null;
	passwordHash?: UserProfile["password"] | null;
	host?: string | null;
}) {
	const { username, password, passwordHash, host } = opts;
	let hash = passwordHash;

	const userCount = await Users.countBy({
		host: IsNull(),
	});

	if (config.maxUserSignups != null && userCount > config.maxUserSignups) {
		throw new Error("MAX_USERS_REACHED");
	}

	// Validate username
	if (!Users.validateLocalUsername(username)) {
		throw new Error("INVALID_USERNAME");
	}

	if (password != null && passwordHash == null) {
		// Validate password
		if (!Users.validatePassword(password)) {
			throw new Error("INVALID_PASSWORD");
		}

		// Generate hash of password
		hash = await hashPassword(password);
	}

	// Generate secret
	const secret = generateUserToken();

	// Check username duplication
	if (
		await Users.findOneBy({
			usernameLower: username.toLowerCase(),
			host: IsNull(),
		})
	) {
		throw new Error("DUPLICATED_USERNAME");
	}

	// Check deleted username duplication
	if (await UsedUsernames.findOneBy({ username: username.toLowerCase() })) {
		throw new Error("USED_USERNAME");
	}

	const keyPair = await new Promise<string[]>((res, rej) =>
		generateKeyPair(
			"rsa",
			{
				modulusLength: 4096,
				publicKeyEncoding: {
					type: "spki",
					format: "pem",
				},
				privateKeyEncoding: {
					type: "pkcs8",
					format: "pem",
					cipher: undefined,
					passphrase: undefined,
				},
			} as any,
			(err, publicKey, privateKey) =>
				err ? rej(err) : res([publicKey, privateKey]),
		),
	);

	const exist = await Users.findOneBy({
		usernameLower: username.toLowerCase(),
		host: IsNull(),
	});

	if (exist) throw new Error("The username is already in use");

	// Prepare objects
	const user = new User({
		id: genId(),
		createdAt: new Date(),
		username: username,
		usernameLower: username.toLowerCase(),
		host: toPunyNullable(host),
		token: secret,
		isAdmin:
			(await Users.countBy({
				host: IsNull(),
				isAdmin: true,
			})) === 0,
	});

	const userKeypair = new UserKeypair({
		publicKey: keyPair[0],
		privateKey: keyPair[1],
		userId: user.id,
	});

	const userProfile = new UserProfile({
		userId: user.id,
		autoAcceptFollowed: true,
		password: hash,
	});

	const usedUsername = new UsedUsername({
		createdAt: new Date(),
		username: username.toLowerCase(),
	});

	// Save the objects atomically using a db transaction, note that we should never run any code in a transaction block directly
	await db.transaction(async (transactionalEntityManager) => {
		await transactionalEntityManager.save(user);
		await transactionalEntityManager.save(userKeypair);
		await transactionalEntityManager.save(userProfile);
		await transactionalEntityManager.save(usedUsername);
	});

	const account = await Users.findOneByOrFail({ id: user.id });

	const meta = await fetchMeta();

	// If an autofollow account exists, follow it
	if (meta.autofollowedAccount) {
		const autofollowedAccount = await Users.findOneByOrFail({
			usernameLower: meta.autofollowedAccount.toLowerCase(),
			host: IsNull(),
		});

		if (autofollowedAccount) {
			await follow(account, autofollowedAccount)
		}
	}

	usersChart.update(account, true);
	return { account, secret };
}
