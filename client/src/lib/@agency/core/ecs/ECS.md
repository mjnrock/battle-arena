# **`ECS`**
Below is an index of of the **Entity Component System (ECS)** [ `@agency/core/ecs` ] assets.
|Object|Type|
|-|-|
|[Struct](#struct)|`Class`|
|[Component](#component)|`Class`|
|[Entity](#entity)|`Class`|
|[System](#system)|`Class`|
|[Manager](#manager)|`Class`|
|[Environment](#environment)|`Class`|

---

## Struct [^](#ecs)
extends **AgencyBase**

A **Struct** is a smaller wrapper around a POJO that includes a variety of hooks that can be added in order to modify meta-behavior.  **All** `{ [ key ]: value }` pairs in `@state` are copied into `this`.  Any hooks must be added manually after initialization.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`state`|`Object`|✅|

#### Example
	const struct = new Struct({
		cats: 2,
		names: [
			`Meowsy`,
			`Lemew`,
		],
	});

	console.log(struct.cats);	// 2

### Class Hooks
|Hook|Description|
|-|-|
|`VIEW`|A `get` hook, allowing for accessor modifications|
|`REDUCER`|A `set` hook that will determine the value of `this[ prop ]`|
|`EFFECT`|A post-`set` hook that notifies that a reduction has taken place|
|`DELETE`|A `delete` hook that can prevent a deletion from happening by returning `false`|

---

## Component [^](#ecs)
extends **[Struct](#struct)**

The **Component** is a `Struct` that records a `name` and the _original arguments used to create it_.  As such, a component can recreate itself on-demand, returning a new instance.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`name`|`string`|❌|
|`state`|`Object`|✅|

#### Example
	const component = new Component("movement", {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
	});

	console.log(component.next() === component);	// false
	console.log(component.next().toString() === component.toString());	// true

---

## Entity [^](#ecs)
extends **Registry**

An **Entity** is a simple registry of `Components`.  As a registry, the component's `name` will be added as an alias to that component.  Accordingly, additional aliases and pools may be created.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`components`|`Array<Component>`|✅|

#### Example
	const entity = new Entity([
		movementComponent,
		physicsComponent,
	]);

---

## System [^](#ecs)
extends **Agent**

A **System** is an `Agent` that acts as a reducer to a given collection of entities.  As an agent, it should perform **all** of its reduction capacity for an `Entity` in its respective handlers.  The handler must perform **all** of the actions required, including both the select of components and assignment of resulting state to those selected components; this is intentionally left entirely to the handler(s).

> Because `System` is an `Agent`, if a handler returns a value, it will become the new system `state`.  To act as a handler only, ensure that the handlers do not return any values.

### Class Properties
|Property|Type|Optional|
|-|-|-|

#### Example
	const system = new System({
		events: {
			...componentReducers,
		},
	});

---

## Manager [^](#ecs)
extends **[System](#system)**

The **Manager** has the exact constraints as a `System`, except that it _maintains_ a `Registry<Entity>` of entities .  As such, it provides methods for selecting some or all of the registered entities onto which a dispatch may be made.

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`registry`|`Registry<Entity>`|✅|

#### Example
	const manager = new Manager([
		entity1,
		entity2,
		entity3,
	], {
		events: {
			...componentReducers,
		},
	});

---

## Environment [^](#ecs)
extends **AgencyBase**

The **Environment** is a *space* or *context* drawn around a collection of `Systems` and `Entities`.  As such, an `Environment` can act as a general repository and registry of all instantiations of a given set of systems and of entities.  Their main purpose is to act as a source-of-truth and lookup table for any given `UUID` within its domain, and to facilitate action that is contingent upon such clarity.

> **Example:** All of the **ECS** assets for a game could be universally grouped under an `Environment` registry

### Class Properties
|Property|Type|Optional|
|-|-|-|
|`systems`|`Registry<System>`|✅|
|`entities`|`Registry<Entity>`|✅|
|`config`|`Config`|✅|

#### Example
	const environment = new Environment({
		systems: [
			system1,
			system2,
			system3,
		],
		entities: [
			entity1,
			entity2,
		],
		config: {
			...config
		},
	});

---