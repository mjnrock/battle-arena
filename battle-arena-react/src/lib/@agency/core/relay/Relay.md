# **`Relay`**
Below is an index of of the **Relay** [ `@agency/relay` ] assets.
|Object|Type|
|-|-|
|[Message](#message)|`Class`|
|[MessageCollection](#messagecollection)|`Class`|
|[Subscription](#subscription)|`Class`|
|[Channel](#channel)|`Class`|
|[Network](#network)|`Class`|

---

## Message [^](#relay)
extends **AgencyBase**

The **Message** is used to package a payload and attach relevant metadata, such as `tags` or message `type`.  The *first (1st)* tag in the set acts as the `type`.

|Property|Type|Optional|
|-|-|-|
|`data`|`any`|❌|
|`meta`|`Object`|✅|

---

## MessageCollection [^](#relay)
extends **Registry**

The **MessageCollection** is a `Registry` of `Messages`.  As such, it maintains an ordered record of inserted messages that can be iterated over or retrieved.  It is used under the hood by `Channel` to maintain a historical record of sent messages.

---

## Subscription [^](#relay)
extends **AgencyBase**

A **Subscription** is a wrapper-class that holds a *subscribor* (the object that is subscribing) and a *subscribee* (the object to which the subscribor is subscribing) and a *callback* function that can be executed on-demand via `.send`.

Optionally, a `mutator` function be passed that can alter the arguments being send to the `callback` function when invoking `.send`.

|Property|Type|Optional|
|-|-|-|
|`subscribor`|`UUID`|❌|
|`subscribee`|`UUID`|❌|
|`callback`|`fn`|❌|
|`mutator`|`fn`|✅|

---

## Channel [^](#relay)
extends **AgencyBase**

A **Channel** maintains a list of `Subscriptions` to itself, and accordingly creates *aliases* to each `subscribor` (the `UUID`) -- this allows for a subscription to be retrieved more easily.

|Property|Type|Optional|
|-|-|-|
|`config`|`Object`|✅|

### `.config` Options
|Option|Default|Description|
|-|-|-|
|`retainHistory`|`false`|Determines whether or not the channel maintains a record of messages that it sends|
|`maxHistory`|`100`|The maximum amount of messages that the channel will hold|
|`atMaxReplace`|`true`|If message size is at the maximum, should it 1) ignore the message entirely (`false`); or instead should it 2) remove the earliest message in its history (i.e. first index) and add the most recent one to the end of the stack (i.e. last index)|

---

## Network [^](#relay)
extends **Registry**

The **Network** is simply a collection of `Channels`, that additionally adds some channel-specific targeting functions to facilitate messaging to a specific channel.  Optionally, a network can broadcast to all registered channels via `.broadcast`.

|Property|Type|Optional|
|-|-|-|
|`channels`|`Array<Channel>`|✅|

---