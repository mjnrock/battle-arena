# Appendix
- [Appendix](#appendix)
- [Eventable](#eventable)
- [Subscribable](#subscribable)
- [Reducible](#reducible)

# Eventable
[Back to Appendix](#appendix)

A *named-event* container with listeners attached to specific events.  This is the generic "events" wrapper, providing simplistic event functionality.

Variants:
* **Class**: `Eventable`
* **Composition**: `$Eventable`

|Property|Type|Detail|
|-|-|-|
|`events`|`Map<event,Set<fn>>`|A container that holds the listeners for events|

|Method|Parameters|Detail|
|-|-|-|
|`emit`|`(event, ...args)`|Invoke a specific event and pass any arguments to each listener, invoked by their respective insertion order.|

# Subscribable
[Back to Appendix](#appendix)

A simple collection of listeners that receive data from *any* invocation.  This contrasts with the type-specific nature of an `Eventable`, whereby the `Subscribable` is non-discriminating.

Variants:
* **Class**: `Subscribable`
* **Composition**: `$Subscribable`

|Property|Type|Detail|
|-|-|-|
|`subscribers`|`Set<fn>`|A container that maintains a list of subscribers|

|Method|Parameters|Detail|
|-|-|-|
|`send`|`(index, ...args)`|Invoke a particular subscriber that occupies `@index` with `self::subscribers`|
|`broadcast`|`(...args)`|Invokes *all* subcribers indiscriminately|

# Reducible
[Back to Appendix](#appendix)

A simple *dispatch-reducer* paradigm -- with optional use of *effects* -- that can also maintain an internal state; alternatively, this can be used to facilitate reduction on another object, instead.

Variants:
* **Class**: `Reducible`
* **Composition**: `$Reducible`

|Property|Type|Detail|
|-|-|-|
|`state`|`any`|The designated state-repository for the object|
|`reducers`|`Map<action,Set<fn>>`|The state-determining reducers that will reduce sequentially based on insertion order|
|`effects`|`Map<event,Set<fn>>`|Listeners thats will fired *if and only if* a successful reduction occurs|

|Method|Parameters|Detail|
|-|-|-|
|`dispatch`|`(action, ...args)`|Dispatch a particular action, reducing `self::state` by the attached reducers of `@action`|
|`trigger`|`(target, action, ...args)`|Identicaly to `dispatch`, except that `target::state` is reduced instead|