/**
 * API Server
 */

import Koa from "koa";
import Router from "@koa/router";
import multer from "@koa/multer";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { setupMastodonApi } from "./mastodon/index.js";
import { AccessTokens, Users } from "@/models/index.js";
import config from "@/config/index.js";
import endpoints from "./endpoints.js";
import compatibility from "./compatibility.js";
import handler from "./api-handler.js";
import signup from "./private/signup.js";
import signin from "./private/signin.js";
import signupPending from "./private/signup-pending.js";
import verifyEmail from "./private/verify-email.js";
import discord from "./service/discord.js";
import github from "./service/github.js";
import twitter from "./service/twitter.js";
import { convertId, IdType } from "@/misc/convert-id.js";

// re-export native rust id conversion (function and enum)
export { IdType, convertId };

// Init app
const app = new Koa();

app.use(
	cors({
		origin: "*",
	}),
);

// No caching
app.use(async (ctx, next) => {
	ctx.set("Cache-Control", "private, max-age=0, must-revalidate");
	await next();
});

// Init router
const router = new Router();
const mastoRouter = new Router();
const errorRouter = new Router();

// Init multer instance
const upload = multer({
	storage: multer.diskStorage({}),
	limits: {
		fileSize: config.maxFileSize || 262144000,
		files: 1,
	},
});

router.use(
	bodyParser({
		// リクエストが multipart/form-data でない限りはJSONだと見なす
		detectJSON: (ctx) =>
			!(
				ctx.is("multipart/form-data") ||
				ctx.is("application/x-www-form-urlencoded")
			),
	}),
);

setupMastodonApi(mastoRouter);

/**
 * Register endpoint handlers
 */
for (const endpoint of [...endpoints, ...compatibility]) {
	if (endpoint.meta.requireFile) {
		router.post(
			`/${endpoint.name}`,
			upload.single("file"),
			handler.bind(null, endpoint),
		);
	} else {
		// 後方互換性のため
		if (endpoint.name.includes("-")) {
			router.post(
				`/${endpoint.name.replace(/-/g, "_")}`,
				handler.bind(null, endpoint),
			);

			if (endpoint.meta.allowGet) {
				router.get(
					`/${endpoint.name.replace(/-/g, "_")}`,
					handler.bind(null, endpoint),
				);
			} else {
				router.get(`/${endpoint.name.replace(/-/g, "_")}`, async (ctx) => {
					ctx.status = 405;
				});
			}
		}

		router.post(`/${endpoint.name}`, handler.bind(null, endpoint));

		if (endpoint.meta.allowGet) {
			router.get(`/${endpoint.name}`, handler.bind(null, endpoint));
		} else {
			router.get(`/${endpoint.name}`, async (ctx) => {
				ctx.status = 405;
			});
		}
	}
}

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signup-pending", signupPending);
router.post("/verify-email", verifyEmail);

router.use(discord.routes());
router.use(github.routes());
router.use(twitter.routes());

router.post("/miauth/:session/check", async (ctx) => {
	const token = await AccessTokens.findOneBy({
		session: ctx.params.session,
	});

	if (token?.session != null && !token.fetched) {
		AccessTokens.update(token.id, {
			fetched: true,
		});

		ctx.body = {
			ok: true,
			token: token.token,
			user: await Users.pack(token.userId, null, { detail: true }),
		};
	} else {
		ctx.body = {
			ok: false,
		};
	}
});

// Return 404 for unknown API
errorRouter.all("(.*)", async (ctx) => {
	ctx.status = 404;
});

// Register router
app.use(mastoRouter.routes());
app.use(mastoRouter.allowedMethods());
app.use(router.routes());
app.use(errorRouter.routes());

export default app;
