# **`Core`**
Below is an index of of the **Core** [ `@agency/core` ] assets.
|Object|Type|
|-|-|
|[AgencyBase](#agencybase)|`Class`|
|[Agent](#agent)|`Class`|
|[Context](#context)|`Class`|
|[Registry](#registry)|`Class`|
|[EventList](#eventlist)|`Class`|

---

## AgencyBase [^](#core)
Every class that is meaningfully trackable extends the `AgencyBase` class.

|Property|Type|Optional|
|-|-|-|
|`id`|`UUID`|✅|
|`tags`|`Set`|✅|

---

## Agent [^](#core)
**extends [AgencyBase](#agencybase)**

The main **eventable** class within the Agency framework.  

|Property|Type|Optional|
|-|-|-|
|`state`|`Object`|✅|
|`events`|`Map`|✅|
|`config`|`Object`|✅|

	const agent = new Agent({
		id,
		state = {},
		events = {
			// Can be an Object or Entry-Array
		},
		hooks = {
			// Can be an Object or Entry-Array
		},
		config = {},
		tags = [],
	});

The event handlers within will act as *reducers*, optionally returning a new `state`.  If no state is returned, the previous state will persist.

> This **only** overwrites current state (and broadcasts an `UPDATE`) if `next !== void 0`.

Hooks are also stored in the event handlers, but executed under specific circumstances (namely `.emit`) in pre-defined locations (see below).  They are also always wrapped with the `Agent.ControlCharacter()` function, which can be optionally overridden.  This function is what determines whether an invocation is handled as an *event* or as a *hook*.

|Hook|Description|
|-|-|
|`MUTATOR`|Changes the passed `@args`, if return value is defined|
|`FILTER`|If returns `true`, immediately prevent further propagation|
|`UPDATE`|Fires when a `state` change occurs via a reducer|
|`EFFECT`|Fires at the end of any event emission|
|`BATCH`|Fires at the end of of a `.process` invocation|
|`DESTROY`|Fires when `.deconstructor` is invoked|

---

## Context [^](#core)
**extends [Agent](#agent)**

The main **grouping** class within the Agency framework, the `Context` maintains a list of registered `Agents`, upon which further event actions may be taken.

|Property|Type|Optional|
|-|-|-|
|`registry`|`Registry`|✅|

	const context = new Context(
		agents = [
			// instanceof Agent
		],
		agentObj = {
			// All Agent args are valid here
		},
	);

Through the use of *routers*, the `Context` can add a `FILTER` hook to an `Agent` that can optionally prevent further propagation in the `Agent`, but always route the event to invoke a specified (via .`addRouter`) trigger.

---

## Registry [^](#core)
**extends [AgencyBase](#agencybase)**

The `Registry` creates a `UUID` for any provided input, but will use `.id` instead if the registration entry has it already.  Under the hood, a wrapper-class called `RegistryEntry` is used to facilitate many of the helper functions present within the `Registry`.

|Property|Type|Optional|
|-|-|-|
|`registry`|`Map`|✅|

	const registry = new Registry(
		entries = [
			// any
		],
		agencyBaseObj = {
			// All AgencyBase args are valid here
		},
	);

After registration, an entry can optionally be given *alias(es)* and also an entry can be addded to a *pool*.

> The `.id` should *always* be a `UUID`, though it will still register if it isn't, as some validator functions internally use `validate(uuid)` to determine execution plan.

**Aliases** are alternative pointers (human-readable) to a given *single entry*, while a **Pool** is an alternative  pointer (human-readable) to a given *collection of entries*.  As such, a pool allows you to create selectable groupings within the `Registry`.

|Entry Type|Description|
|-|-|
|`VALUE`|Any entry that has been registered|
|`ALIAS`|A alternative key for a given VALUE|
|`POOL`|A collection of VALUES|

---

## EventList [^](#core)
**extends [AgencyBase](#agencybase)**

This is a wrapper class for an attachable set of event handlers, with optionally-pre-defined aliases.  This is meant as an abstract wrapper to a POJO, so that there is more Agency-specific behavior and reusability.  A major use for this class is in the `ECS` space.

|Property|Type|Optional|
|-|-|-|
|`events`|`Map`|✅|
|`aliases`|`Map`|✅|

	const registry = new Registry(
		events = {
			// Event handler object
		},
		aliases: {
			// Key-value string-pair object
		}
		agencyBaseObj = {
			// All AgencyBase args are valid here
		},
	);

The `EventList` class can `.attach` or `.detach` itself to an (instantiated) `Agent`, or it can be converted into a POJO via `.toEntryObject`, which can be used as a constructor parameter for new agents.