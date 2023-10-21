import { publishUserListStream } from "@/services/stream.js";
import type { User } from "@/models/entities/user.js";
import type { UserList } from "@/models/entities/user-list.js";
import { Followings, UserListJoinings, Users } from "@/models/index.js";
import type { UserListJoining } from "@/models/entities/user-list-joining.js";
import { genId } from "@/misc/gen-id.js";
import { ApiError } from "@/server/api/error.js";

export async function pushUserToUserList(target: User, list: UserList) {
	await UserListJoinings.insert({
		id: genId(),
		createdAt: new Date(),
		userId: target.id,
		userListId: list.id,
	} as UserListJoining);

	publishUserListStream(list.id, "userAdded", await Users.pack(target));
}
