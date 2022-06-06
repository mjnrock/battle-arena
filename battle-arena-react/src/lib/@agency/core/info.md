# Asset Repository
|Object|Type|
|-|-|
|[AgencyBase](#agencybase)|`Class`|
|[Agent](#agent)|`Class`|
|[Context](#context)|`Class`|
|[Registry](#registry)|`Class`|
|[EventList](#eventlist)|`Class`|

### AgencyBase
Every class that is meaningfully trackable extends the `AgencyBase` class.

|Property|Type|Optional|
|-|-|-|
|`id`|`UUID`|✅|
|`tags`|`Set`|✅|

### Agent
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

The event handlers within will act as *reducers*, optionally returning a new `state`.  If no state object is returned, the previous state will persist.

Hooks are also stored in the event handlers, but executed under specific circumstances (namely `.emit`) in defined locations.  They are also always wrapped with the `Agent.ControlCharacter()` function, which can be optionally overridden.

|Hook|Description|
|-|-|
|`MUTATOR`|Changes the passed `@args`, if return value is defined|
|`FILTER`|If returns `true`, immediately prevent further propagation|
|`UPDATE`|Fires when a `state` change occurs via a reducer|
|`EFFECT`|Fires at the end of any event emission|
|`BATCH`|Fires at the end of of a `.process` invocation|
|`DESTROY`|Fires when `.deconstructor` is invoked|

### Context
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

### Registry
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

> The `.id` should *always* be a `UUID`, though it will still register if it isn't.

**Aliases** are alternative pointers (human-readable) to a given *single entry*, while a **Pool** is an alternative  pointer (human-readable) to a given *collection of entries*.  As such, a pool allows you to create selectable groupings within the `Registry`.

|Entry Type|Description|
|-|-|
|`VALUE`|Any entry that has been registered|
|`ALIAS`|A alternative key for a given VALUE|
|`POOL`|A collection of VALUES|

### EventList