import { URL } from "node:url";
import config from "@/config/index.js";
import punycode from "punycode/";

export function getFullApAccount(username: string, host: string | null) {
	return host
		? `${username}@${toPuny(host)}`
		: `${username}@${toPuny(config.domain)}`;
}

export function isSelfHost(host: string) {
	if (host == null) return true;
	return toPuny(config.domain) === toPuny(host) || toPuny(config.host) === toPuny(host);
}

export function extractDbHost(uri: string) {
	const url = new URL(uri);
	return toPuny(url.hostname);
}

export function toPuny(host: string) {
	return punycode.toASCII(host.toLowerCase());
}

export function toPunyNullable(host: string | null | undefined): string | null {
	if (host == null) return null;
	return punycode.toASCII(host.toLowerCase());
}
