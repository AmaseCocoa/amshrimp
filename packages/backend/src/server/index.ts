/**
 * Core Server
 */

import cluster from "node:cluster";
import * as fs from "node:fs";
import * as http from "node:http";
import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import mount from "koa-mount";
import koaLogger from "koa-logger";
import * as slow from "koa-slow";

import { IsNull } from "typeorm";
import config from "@/config/index.js";
import Logger from "@/services/logger.js";
import { Users } from "@/models/index.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { genIdenticon } from "@/misc/gen-identicon.js";
import { createTemp } from "@/misc/create-temp.js";
import * as Acct from "@/misc/acct.js";
import { envOption } from "@/env.js";
import activityPub from "./activitypub.js";
import nodeinfo from "./nodeinfo.js";
import wellKnown from "./well-known.js";
import apiServer from "./api/index.js";
import fileServer from "./file/index.js";
import proxyServer from "./proxy/index.js";
import webServer from "./web/index.js";
import { initializeStreamingServer } from "./api/streaming.js";
import removeTrailingSlash from "koa-remove-trailing-slashes";
import { koaBody } from "koa-body";
import { setupEndpointsAuthRoot } from "@/server/api/mastodon/endpoints/auth.js";
import { CatchErrorsMiddleware } from "@/server/api/mastodon/middleware/catch-errors.js";
import { handleMetrics } from "@/metrics.js";
export const serverLogger = new Logger("server", "gray", false);

// Init app
const app = new Koa();
app.proxy = true;

app.use(removeTrailingSlash());

app.use(
	cors({
		origin: "*",
	}),
);

if (!["production", "test"].includes(process.env.NODE_ENV || "")) {
	// Logger
	app.use(
		koaLogger((str) => {
			serverLogger.info(str);
		}),
	);

	// Delay
	if (envOption.slow) {
		app.use(
			slow({
				delay: 3000,
			}),
		);
	}
}

// HSTS
// 6months (15552000sec)
if (config.url.startsWith("https") && !config.disableHsts) {
	app.use(async (ctx, next) => {
		ctx.set("strict-transport-security", "max-age=15552000; preload");
		await next();
	});
}

app.use(mount("/api", apiServer));
app.use(mount("/files", fileServer));
app.use(mount("/proxy", proxyServer));

// Init router
const router = new Router();
const mastoRouter = new Router();

// Routing
router.use(activityPub.routes());
router.use(nodeinfo.routes());
router.use(wellKnown.routes());

router.get("/avatar/@:acct", async (ctx) => {
	const { username, host } = Acct.parse(ctx.params.acct);
	const user = await Users.findOne({
		where: {
			usernameLower: username.toLowerCase(),
			host: host == null || host === config.host || host === config.domain ? IsNull() : host,
			isSuspended: false,
		},
		relations: ["avatar"],
	});

	if (user) {
		ctx.redirect(Users.getAvatarUrlSync(user));
	} else {
		ctx.redirect("/static-assets/user-unknown.png");
	}
});

router.get("/identicon/:x", async (ctx) => {
	const meta = await fetchMeta();
	if (meta.enableIdenticonGeneration) {
		const [temp, cleanup] = await createTemp();
		await genIdenticon(ctx.params.x, fs.createWriteStream(temp));
		ctx.set("Content-Type", "image/png");
		ctx.body = fs.createReadStream(temp).on("close", () => cleanup());
	} else {
		ctx.redirect("/static-assets/avatar.png");
	}
});

if (config.metrics?.enable) {
	router.get("/metrics", handleMetrics);
}

mastoRouter.use(
	koaBody({
		urlencoded: true,
		multipart: true,
	}),
);

mastoRouter.use(async (ctx, next) => {
	if (ctx.request.query) {
		if (!ctx.request.body || Object.keys(ctx.request.body).length === 0) {
			ctx.request.body = ctx.request.query;
		} else {
			ctx.request.body = { ...ctx.request.body, ...ctx.request.query };
		}
	}
	await next();
});

mastoRouter.use(CatchErrorsMiddleware);
setupEndpointsAuthRoot(mastoRouter);

// Register router
app.use(router.routes());
app.use(mastoRouter.routes());

app.use(mount(webServer));

function createServer() {
	return http.createServer(app.callback());
}

// For testing
export const startServer = () => {
	const server = createServer();

	initializeStreamingServer(server);

	server.listen(config.port);

	return server;
};

export default () =>
	new Promise((resolve) => {
		const server = createServer();

		initializeStreamingServer(server);

		server.on("error", (e) => {
			switch ((e as any).code) {
				case "EACCES":
					serverLogger.error(
						`You do not have permission to listen on port ${config.port}.`,
					);
					break;
				case "EADDRINUSE":
					serverLogger.error(
						`Port ${config.port} is already in use by another process.`,
					);
					break;
				default:
					serverLogger.error(e);
					break;
			}

			if (cluster.isWorker) {
				process.send!("listenFailed");
			} else {
				// disableClustering
				process.exit(1);
			}
		});

		// @ts-ignore
		server.listen(config.port, resolve);
	});
