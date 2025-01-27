import Redis from "ioredis";
import config from "@/config/index.js";

export function createConnection() {
	let source = config.redis;

	return new Redis({
		port: source.port,
		host: source.host,
		family: source.family ?? 0,
		password: source.pass,
		username: source.user ?? "default",
		keyPrefix: `${source.prefix}:`,
		db: source.db || 0,
		tls: source.tls,
	});
}

export const subscriber = createConnection();
subscriber.subscribe(config.redis.prefix ?? config.host);

export const redisClient = createConnection();
