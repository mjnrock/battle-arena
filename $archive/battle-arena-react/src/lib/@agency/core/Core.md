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

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`id`|`UUID`|✅|
|`tags`|`Set`|✅|

---

## Agent [^](#core)
extends **[AgencyBase](#agencybase)**

The main **eventable** class within the Agency framework.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`state`|`Object`|✅|
|`events`|`Map`|✅|
|`config`|`Object`|✅|

> Instead of reducing `state`, an `Agent` can act solely as an event bus if *all* handlers `return void 0;`.  In this case, you must then mensure that any handler on the agent does not return any state.

> `{ $eval: true, ...state }` can be added to `state` initialization (in general, any time `setState` is used) to evaluate: 1) `state` if it is a function, or 2) evaluate all _first (1st)_ level `{ key: fn }` in the `state` object.  This allows for the entire state to be dynamic, or in cases where `.Factory` is used, each iteration will receive the newly-created agent (`fn(this)`), allowing for dynamic state generation over factories.

#### `.config` Options
|Option|Default|Description|
|-|-|-|
|`isReducer`|`true`|This determines whether or not `.state` will be updated when an event is handled|
|`allowRPC`|`false`|When `true`, absent triggers will instead attempt to execute an internal function `this[ trigger ](...args)`|
|`allowMultipleHandlers`|`true`|When `false`, only the most recent addition to the handler `Set` is used|
|`queue`|`Set`|The collection of emission arguments when `isBatchProcessing` is enabled|
|`batchSize`|`1000`|The default maximum size that a batch can get to|
|`isBatchProcessing`|`false`|A flag to either process emissions in real-time (`false`) or on-demand (`true`) via `.process`|

#### Example
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

### Class Hooks
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
extends **[Agent](#agent)**

The main **grouping** class within the Agency framework, the `Context` maintains a list of registered `Agents`, upon which further event actions may be taken.  A context can also loaded routers which will execute as a `FILTER` hook, and is thus able to route a pre-determined set of events to the router -- optionally, instead (see config below).

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`registry`|`Registry`|✅|

#### `.config` Options
|Option|Default|Description|
|-|-|-|
|`preventPropagation`|`false`|If a router is present, should the router prevent further propagation (`true`) or allow the agent to process the event, as well (`false`)|
|`routers`|`Map`|A map of events to router handlers|

> When using routers, the router will be loaded as a `FILTER` hook, and is thus able to prevent further propagation.  The router function itself _cannot dictate this_, and only the `.preventPropagation` configuration setting will determine whether the filter halts propagation or not.

#### Example
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
extends **[AgencyBase](#agencybase)**

The `Registry` creates a `UUID` for any provided input, but will use `.id` instead if the registration entry has it already.  Under the hood, a wrapper-class called `RegistryEntry` is used to facilitate many of the helper functions present within the `Registry`.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`registry`|`Map`|✅|

#### Example
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

### `RegistryEntry` Types
|Entry Type|Description|
|-|-|
|`VALUE`|Any entry that has been registered|
|`ALIAS`|A alternative key for a given VALUE|
|`POOL`|A collection of VALUES|

---

## EventList [^](#core)
extends **[AgencyBase](#agencybase)**

This is a wrapper class for an attachable set of event handlers, with optionally-pre-defined aliases.  This is meant as an abstract wrapper to a POJO, so that there is more Agency-specific behavior and reusability.  While the major use for this class is in the `ECS` space, it serves just as well as an `Agent({ event })` initializer argument to aid in the creation of templates or factories.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`events`|`Map`|✅|
|`aliases`|`Map`|✅|

#### Example
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