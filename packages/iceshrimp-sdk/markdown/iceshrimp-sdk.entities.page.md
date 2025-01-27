<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [iceshrimp-sdk](./iceshrimp-sdk.md) &gt; [entities](./iceshrimp-sdk.entities.md) &gt; [Page](./iceshrimp-sdk.entities.page.md)

## entities.Page type

**Signature:**

```typescript
export type Page = {
    id: ID;
    createdAt: DateString;
    updatedAt: DateString;
    userId: User["id"];
    user: User;
    content: Record<string, any>[];
    variables: Record<string, any>[];
    title: string;
    name: string;
    summary: string | null;
    hideTitleWhenPinned: boolean;
    alignCenter: boolean;
    font: string;
    script: string;
    eyeCatchingImageId: DriveFile["id"] | null;
    eyeCatchingImage: DriveFile | null;
    attachedFiles: any;
    likedCount: number;
    isLiked?: boolean;
};
```
**References:** [ID](./iceshrimp-sdk.entities.id.md)<!-- -->, [DateString](./iceshrimp-sdk.entities.datestring.md)<!-- -->, [User](./iceshrimp-sdk.entities.user.md)<!-- -->, [DriveFile](./iceshrimp-sdk.entities.drivefile.md)

