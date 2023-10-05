import { Announcement } from "@/models/entities/announcement.js";
import { ILocalUser } from "@/models/entities/user.js";
import { awaitAll } from "@/prelude/await-all";
import { AnnouncementReads } from "@/models/index.js";
import { MfmHelpers } from "@/server/api/mastodon/helpers/mfm.js";
import mfm from "mfm-js";

export class AnnouncementConverter {
    public static encode(announcement: Announcement, isRead: boolean): MastodonEntity.Announcement {
        return {
            id: announcement.id,
            content: `<h1>${MfmHelpers.toHtml(mfm.parse(announcement.title), []) ?? 'Announcement'}</h1>${MfmHelpers.toHtml(mfm.parse(announcement.text), []) ?? ''}`,
            starts_at: null,
            ends_at: null,
            published: true,
            all_day: false,
            published_at: announcement.createdAt.toISOString(),
            updated_at: announcement.updatedAt?.toISOString() ?? announcement.createdAt.toISOString(),
            read: isRead,
            mentions: [], //FIXME
            statuses: [],
            tags: [],
            emojis: [], //FIXME
            reactions: [],
        };
    }
}