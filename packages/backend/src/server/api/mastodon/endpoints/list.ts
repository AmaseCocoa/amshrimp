import Router from "@koa/router";
import { getClient } from "../index.js";
import { ParsedUrlQuery } from "querystring";
import {
	convertAccount,
	convertConversation,
	convertList,
	convertStatus,
} from "../converters.js";
import { convertId, IdType } from "../../index.js";
import authenticate from "@/server/api/authenticate.js";
import { TimelineHelpers } from "@/server/api/mastodon/helpers/timeline.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "@/server/api/mastodon/endpoints/timeline.js";
import { ListHelpers } from "@/server/api/mastodon/helpers/list.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";

export function setupEndpointsList(router: Router): void {
	router.get("/v1/lists", async (ctx, reply) => {
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? undefined;

			if (!user) {
				ctx.status = 401;
				return;
			}

			ctx.body = await ListHelpers.getLists(user)
				.then(p => p.map(list => convertList(list)));
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get<{ Params: { id: string } }>(
		"/v1/lists/:id",
		async (ctx, reply) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? undefined;

				if (!user) {
					ctx.status = 401;
					return;
				}

				const id = convertId(ctx.params.id, IdType.IceshrimpId);

				ctx.body = await ListHelpers.getList(user, id)
					.then(p => convertList(p));
			} catch (e: any) {
				ctx.status = 404;
			}
		},
	);
	router.post("/v1/lists", async (ctx, reply) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.createList((ctx.request.body as any).title);
			ctx.body = convertList(data.data);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.put<{ Params: { id: string } }>(
		"/v1/lists/:id",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.updateList(
					convertId(ctx.params.id, IdType.IceshrimpId),
					(ctx.request.body as any).title,
				);
				ctx.body = convertList(data.data);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.delete<{ Params: { id: string } }>(
		"/v1/lists/:id",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.deleteList(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/lists/:id/accounts",
		async (ctx, reply) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? undefined;

				if (!user) {
					ctx.status = 401;
					return;
				}

				const id = convertId(ctx.params.id, IdType.IceshrimpId);
				const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)));
				const res = await ListHelpers.getListUsers(user, id, args.max_id, args.since_id, args.min_id, args.limit);
				const accounts = await UserConverter.encodeMany(res.data);
				ctx.body = accounts.map(account => convertAccount(account));
				PaginationHelpers.appendLinkPaginationHeader(args, ctx, res);
			} catch (e: any) {
				ctx.status = 404;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/lists/:id/accounts",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.addAccountsToList(
					convertId(ctx.params.id, IdType.IceshrimpId),
					(ctx.query.account_ids as string[]).map((id) =>
						convertId(id, IdType.IceshrimpId),
					),
				);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.delete<{ Params: { id: string } }>(
		"/v1/lists/:id/accounts",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.deleteAccountsFromList(
					convertId(ctx.params.id, IdType.IceshrimpId),
					(ctx.query.account_ids as string[]).map((id) =>
						convertId(id, IdType.IceshrimpId),
					),
				);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
}
