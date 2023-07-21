<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [iceshrimp-js](./iceshrimp-js.md) &gt; [entities](./iceshrimp-js.entities.md) &gt; [UserDetailed](./iceshrimp-js.entities.userdetailed.md)

## entities.UserDetailed type

**Signature:**

```typescript
export declare type UserDetailed = UserLite & {
	bannerBlurhash: string | null;
	bannerColor: string | null;
	bannerUrl: string | null;
	birthday: string | null;
	createdAt: DateString;
	description: string | null;
	ffVisibility: "public" | "followers" | "private";
	fields: {
		name: string;
		value: string;
	}[];
	followersCount: number;
	followingCount: number;
	hasPendingFollowRequestFromYou: boolean;
	hasPendingFollowRequestToYou: boolean;
	isAdmin: boolean;
	isBlocked: boolean;
	isBlocking: boolean;
	isBot: boolean;
	isCat: boolean;
	isFollowed: boolean;
	isFollowing: boolean;
	isLocked: boolean;
	isModerator: boolean;
	isMuted: boolean;
	isRenoteMuted: boolean;
	isSilenced: boolean;
	isSuspended: boolean;
	lang: string | null;
	lastFetchedAt?: DateString;
	location: string | null;
	notesCount: number;
	pinnedNoteIds: ID[];
	pinnedNotes: Note[];
	pinnedPage: Page | null;
	pinnedPageId: string | null;
	publicReactions: boolean;
	securityKeys: boolean;
	twoFactorEnabled: boolean;
	updatedAt: DateString | null;
	uri: string | null;
	url: string | null;
};
```
**References:** [UserLite](./iceshrimp-js.entities.userlite.md)<!-- -->, [DateString](./iceshrimp-js.entities.datestring.md)<!-- -->, [ID](./iceshrimp-js.entities.id.md)<!-- -->, [Note](./iceshrimp-js.entities.note.md)<!-- -->, [Page](./iceshrimp-js.entities.page.md)
