<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [iceshrimp-sdk](./iceshrimp-sdk.md) &gt; [Stream](./iceshrimp-sdk.stream.md) &gt; [useChannel](./iceshrimp-sdk.stream.usechannel.md)

## Stream.useChannel() method

**Signature:**

```typescript
useChannel<C extends keyof Channels>(channel: C, params?: Channels[C]["params"], name?: string): Connection<Channels[C]>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  channel | C |  |
|  params | [Channels](./iceshrimp-sdk.channels.md)<!-- -->\[C\]\["params"\] | _(Optional)_ |
|  name | string | _(Optional)_ |

**Returns:**

[Connection](./iceshrimp-sdk.channelconnection.md)<!-- -->&lt;[Channels](./iceshrimp-sdk.channels.md)<!-- -->\[C\]&gt;
