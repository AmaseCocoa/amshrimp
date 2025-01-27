<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [iceshrimp-sdk](./iceshrimp-sdk.md) &gt; [entities](./iceshrimp-sdk.entities.md) &gt; [Instance](./iceshrimp-sdk.entities.instance.md)

## entities.Instance type

**Signature:**

```typescript
export type Instance = {
    id: ID;
    caughtAt: DateString;
    host: string;
    usersCount: number;
    notesCount: number;
    followingCount: number;
    followersCount: number;
    driveUsage: number;
    driveFiles: number;
    latestRequestSentAt: DateString | null;
    latestStatus: number | null;
    latestRequestReceivedAt: DateString | null;
    lastCommunicatedAt: DateString;
    isNotResponding: boolean;
    isSuspended: boolean;
    softwareName: string | null;
    softwareVersion: string | null;
    openRegistrations: boolean | null;
    name: string | null;
    description: string | null;
    maintainerName: string | null;
    maintainerEmail: string | null;
    iconUrl: string | null;
    faviconUrl: string | null;
    themeColor: string | null;
    infoUpdatedAt: DateString | null;
};
```
**References:** [ID](./iceshrimp-sdk.entities.id.md)<!-- -->, [DateString](./iceshrimp-sdk.entities.datestring.md)

