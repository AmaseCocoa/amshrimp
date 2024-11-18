<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [iceshrimp-sdk](./iceshrimp-sdk.md) &gt; [Stream](./iceshrimp-sdk.stream.md)

## Stream class

**Signature:**

```typescript
export default class Stream extends EventEmitter<StreamEvents> 
```
**Extends:** EventEmitter&lt;StreamEvents&gt;

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(origin, user, options)](./iceshrimp-sdk.stream._constructor_.md) |  | Constructs a new instance of the <code>Stream</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [state](./iceshrimp-sdk.stream.state.md) |  | "initializing" \| "reconnecting" \| "connected" |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [close()](./iceshrimp-sdk.stream.close.md) |  |  |
|  [disconnectToChannel(connection)](./iceshrimp-sdk.stream.disconnecttochannel.md) |  |  |
|  [removeSharedConnection(connection)](./iceshrimp-sdk.stream.removesharedconnection.md) |  |  |
|  [removeSharedConnectionPool(pool)](./iceshrimp-sdk.stream.removesharedconnectionpool.md) |  |  |
|  [send(typeOrPayload, payload)](./iceshrimp-sdk.stream.send.md) |  |  |
|  [useChannel(channel, params, name)](./iceshrimp-sdk.stream.usechannel.md) |  |  |
