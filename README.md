# ent-comp

A light, *fast* entity-component system in TypeScript, with no dependencies.  
(Forked from [andyhall's ent-comp](https://github.com/andyhall/ent-comp)).

## Overview

An [Entity Component System](http://vasir.net/blog/game-development/how-to-build-entity-component-system-in-javascript) (ECS) is a programming construct that solves a very common problem in game programming - it lets you easily model dynamic systems whose entities are not well-suited to OO-style inheritance.

This library is the distilled result of my playing with a bunch of ECS libraries, removing what wasn't useful, and rejiggering what remained to perform well in the most important cases. Specifically it's tuned to be fast at accessing the state of a given entity/component, and looping over all states for a given component.

To get started, check the usage examples below, or the [API reference](docs/README.md).

## Installation

To use as a dependency:

```sh
npm install PandawanFr/ent-comp
```

To hack on it:

```sh
git clone https://github.com/PandawanFr/ent-comp.git
cd ent-comp
npm install
npm test         # run tests
npm run bench    # run benchmarks
npm run doc      # rebuild API docs
```

## API reference

See [docs](docs/README.md).

## Basic usage

Create the ECS, entities, and components thusly:

```js
// You might have to import the file directly rather than ent-comp
import EntComp from './ECS';
const ecs = new EntComp();

// Entities are simply integer IDs:
var playerID = ecs.createEntity() // 1
var monsterID = ecs.createEntity() // 2

// components are defined with a definition object:
ecs.createComponent({
  name: 'isPlayer'
})

// component definitions can be accessed by name
ecs.components['isPlayer']  // returns the definition object
```

Once you have some entities and components, you can add them, remove them, and check their existence:

```js
ecs.addComponent(playerID, 'isPlayer')
ecs.hasComponent(playerID, 'isPlayer') // true

ecs.removeComponent(playerID, 'isPlayer', true) // final argument means: immediately
ecs.hasComponent(playerID, 'isPlayer') // false

// when creating an entity you can pass in an array of components to add
var id = ecs.createEntity([ 'isPlayer', 'other-component' ])
```

The trivial example above implements a flag-like component, that can only be set or unset.
Most real components will also need to manage some data for each entity. This is done by
giving the component a `state` object, and using the `#getState` method.

```js
// createComponent returns the component name, for convenience
var locationComp = ecs.createComponent({
  name: 'location',
  state: { x:0, y:0, z:0 },
})

// give the player entity a location component
ecs.addComponent(playerID, locationComp)

// grab its state to update its data
var loc = ecs.getState(playerID, locationComp)
loc.y = 37

// you can also pass in initial state values when adding a component:
ecs.addComponent(monsterID, locationComp, { y: 42 })
ecs.getState(monsterID, locationComp) // { x:0, y:42, z:0 }
```

When a component is added to an entity, its state object is automatically populated with an `__id` property denoting the entity's ID.

```js
loc.__id // same as playerID
```

Components can also have `onAdd` and `onRemove` properties, which get called as any entity gains or loses the component.

```js
ecs.createComponent({
  name: 'orientation',
  state: { angle:0 },
  onAdd: function(id, state) {
    // initialize to a random direction
    state.angle = 360 * Math.random()
  },
  onRemove: function(id, state) {
    console.log('orientation removed from entity '+id)
  }
})
```

Finally, components can define `system` and/or `renderSystem` functions. When your game ticks or renders, call the appropriate library methods, and each component system function will get passed a list of state objects for all the entities that have that component.

Components can also define an `order` property (default `99`), to specify the order in which systems fire (lowest to highest).

```js
ecs.createComponent({
  name: 'hitPoints',
  state: { hp: 100 },
  order: 10,
  system: function(dt, states) {
    // states is an array of entity state objects
    states.forEach(state => {
      if (state.hp <= 0) console.log('Entity died!')
    })
  },
  renderSystem: function(dt, states) {
    states.forEach(state => {
      var id = state.__id
      var hp = state.hp
      drawTheEntityHitpoints(id, hp)
    })
  },
})

// calling tick/render triggers the systems
ecs.tick( tick_time )
ecs.render( render_time )
```

See the [API reference](docs/README.md) for details on each method.

## Note on deferred removals

By default, all "remove" APIs (anything that deletes an entity or component,
or removes a component from an entity) defer execution and happen asynchronously.
This is done since components tend to remove themselves from inside their system functions. Pass `true` as the final argument to such APIs to make them execute immediately.

## Note on Multi-Components

The original implementation supported multi-components, which provided a way for an entity to hold multiple states for one component type. 

I removed this from my TypeScript implementation because it overly-complicated the typings required and I did not find them to be particularly useful. If you want this feature back, consider adding an array of objects* inside of your component's state so that each element can represent an "instance" of that multi-component. You can also submit a Pull Request if you find a way to make it work nicely with the type system (without forcing every component method to check for `Array.isArray()`).

\* See [Caveat about complex state objects](#Caveat-about-complex-state-objects) for info on using arrays/objects in the component state.

## Further usage

If you need to query certain components many times each frame, you can create bound accessor functions to get the existence or state of a given component.
These accessors are moderately faster than `getState` and `hasComponent`.

```js
var hasLocation = ecs.getComponentAccessor('location')
hasLocation(playerID) // true

var getLocation = ecs.getStateAccessor('location')
getLocation(playerID) === loc // true
```

There's also an API for getting an array of state objects for a given component.
Though if you find yourself using this, you might want to just define a system instead.

```js
var states = ecs.getStatesList('hitPoints')
// returns the same array that gets passed to system functions
```

## Caveat about complex state objects

When you add a component to an entity, a new state object is created for that ent/comp pair. This new state object is a **shallow copy** of the component's default state, not a duplicate or deep clone. This means any non-primitive state properties will be copied by reference.

What this means to you is, state objects containing nested objects or arrays probably won't do what you intended. For example:

```js
ecs.createComponent({
  name: 'foo',
  state: {
    vector3: [0,0,0]
  }
})
```

If you create a bunch of new entities with that component, their state objects will all contain references to *the same array*. You probably want each to have its own. The right way to achieve this is by initializing non-primitives in the `onAdd` handler:

```js
ecs.createComponent({
  name: 'foo',
  state: {
    vector3: null
  },
  onAdd: function(id, state) {
    if (!state.vector3) state.vector3 = [0,0,0]
  }
})
```

Testing for the value before overwriting means that you can pass in an initial
value when adding the component, and it will still do what you expect:

```js
ecs.addComponent(id, 'foo', { vector3: [1,1,1] })
```

## Things this library doesn't do

 1. Assemblages. I can't for the life of me see how they add any value. If I'm missing something please file an issue.

 2. Provide any way of querying which entities have components A and B, but not C, and so on.
 If you need this, I think maintaining your own lists will be faster (and probably easier to use) than anything the library could do automatically.
 
## Things I might add in the future

- Multi-component **systems**. Where one system can require multiple specific components to execute. For example, an enemy system might require a health and attack component to run; instead of using getState on both of these components, it would be nice to get both of them as a map (`states: [{ healthState1, attackState1 }, { healthState2, attackState2 }]`) through the `system()` method.

## Change list

* 1.3.0
  * Add `sortByOrder` method to sort component arrays using their componentDefinition.order.
  * Add generic T type for component definitions so their methods can return custom state typings.
  * Add UnknownStateWithID for better typing (this is not used internally).
* 1.2.0
  * Add `defaultOrder` option and property; updating this value will re-sort the `systems` and `renderSystems` arrays.
* 1.1.0
  * Remove `multi`-components, they're annoying and not very usefu; just use an array within states :)
* 1.0.0
  * Rewrite in TypeScript (by Pandawan)
* 0.9.0
  * Adds `order` property to component definitions
* 0.7.0
  * Internals rebuilt and bugs fixed, should be no API changes
* 0.6.0
  * `removeComponent` changed to be deferred by default
  * `removeComponentLater` removed
  * Adds `multi`-tagged components, and `removeMultiComponent`
  * Doubles performance of `hasComponent` and `getState` (for some reason..)

----

### Authors: [andyhall](https://github.com/andyhall), [Pandawan](https://github.com/PandawanFr)

### License: MIT
