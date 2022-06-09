# **`Relay`**
Below is an index of of the **Relay** [ `@agency/core/relay` ] assets.
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

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`data`|`any`|❌|
|`meta`|`Object`|✅|

#### Example
	const message = new Message({
		data: Date.now(),
		tags: `date`,
	});

---

## MessageCollection [^](#relay)
extends **Registry**

The **MessageCollection** is a `Registry` of `Messages`.  As such, it maintains an ordered record of inserted messages that can be iterated over or retrieved.  It is used under the hood by `Channel` to maintain a historical record of sent messages.

#### Example
	const messageCollection = new MessageCollection([
		message1,
		message2,
		message3,
	]);

---

## Subscription [^](#relay)
extends **AgencyBase**

A **Subscription** is a wrapper-class that holds a *subscribor* (the object that is subscribing) and a *subscribee* (the object to which the subscribor is subscribing) and a *callback* function that can be executed on-demand via `.send`.  If a `callback` is an `Agent`, `.send` will instead invoke `.emit(...args)` on the agent.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`subscribor`|`UUID`|❌|
|`subscribee`|`UUID`|❌|
|`callback`|`fn`|❌|
|`mutator`|`fn`|✅|

#### Example
	const subscribor = new Agent();		// Example only, not required to be an `Agent`
	const subscribee = new Agent();		// Example only, not required to be an `Agent`
	const callback = (...args) => console.log(...args);

	const subscription = new Subscription(subscribor.id, subscribee.id, callback);

> Note that `subscribor` and `subscribee` are `UUID` values, _not_ `Objects`.  If an `Object` is passed for either, the subscription will attempt to find `.id` on the object -- if it _does_, then `.id` will be used (but it still must be a valid `UUID`); if it _does not_, then the instantiation will fail with an error.  As such, `null` values are not allowed.

> For cases where this causes issues, or where the `Subscription` is being used purely as a callback wrapper, use the static method `Subscription.CreateAnonymous` method to seed randomly-generated `UUIDs`.

Optionally, a `mutator` function be passed that can alter the arguments that will be sent to the `callback` function when invoking `.send`.

---

## Channel [^](#relay)
extends **AgencyBase**

A **Channel** maintains a list of `Subscriptions` to itself as the `subscribee`, and accordingly creates *aliases* to each `subscribor` (the `UUID`) -- this allows for a subscription to be retrieved more easily.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`config`|`Object`|✅|

#### `.config` Options
|Option|Default|Description|
|-|-|-|
|`retainHistory`|`false`|Determines whether or not the channel maintains a record of messages that it sends|
|`maxHistory`|`100`|The maximum amount of messages that the channel will hold|
|`atMaxReplace`|`true`|If message size is at the maximum, should it 1) ignore the message entirely (`false`); or instead should it 2) remove the earliest message in its history (i.e. first index) and add the most recent one to the end of the stack (i.e. last index)|

#### Example
	const channel = new Channel({
		config: {
			retainHistory: false,
			maxHistory: 2,
			atMaxReplace: false,
		},
	});

---

## Network [^](#relay)
extends **Registry**

The **Network** is simply a collection of `Channels`, that additionally adds some channel-specific targeting functions to facilitate messaging to a specific channel.  Optionally, a network can broadcast to all registered channels via `.broadcast`.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`channels`|`Array<Channel>`|✅|

#### Example
	const network = new Network([
		channel1,
		channel2,
	]);

---