**[ent-comp](../README.md)**

[Globals](../README.md) › [ECS](ecs.md)

# Class: ECS

## Hierarchy

* **ECS**

## Index

### Constructors

* [constructor](ecs.md#constructor)

### Properties

* [_defaultOrder](ecs.md#private-_defaultorder)
* [components](ecs.md#components)
* [deferralTimeoutPending](ecs.md#private-deferraltimeoutpending)
* [deferredCompRemovals](ecs.md#private-deferredcompremovals)
* [deferredEntityRemovals](ecs.md#private-deferredentityremovals)
* [renderSystems](ecs.md#private-rendersystems)
* [storage](ecs.md#private-storage)
* [systems](ecs.md#private-systems)
* [uid](ecs.md#private-uid)

### Accessors

* [comps](ecs.md#comps)
* [defaultOrder](ecs.md#defaultorder)

### Methods

* [addComponent](ecs.md#addcomponent)
* [createComponent](ecs.md#createcomponent)
* [createEntity](ecs.md#createentity)
* [deleteComponent](ecs.md#deletecomponent)
* [deleteEntity](ecs.md#deleteentity)
* [deleteEntityNow](ecs.md#private-deleteentitynow)
* [doDeferredComponentRemovals](ecs.md#private-dodeferredcomponentremovals)
* [doDeferredEntityRemovals](ecs.md#private-dodeferredentityremovals)
* [getAllComponents](ecs.md#getallcomponents)
* [getComponentAccessor](ecs.md#getcomponentaccessor)
* [getState](ecs.md#getstate)
* [getStateAccessor](ecs.md#getstateaccessor)
* [getStatesList](ecs.md#getstateslist)
* [hasComponent](ecs.md#hascomponent)
* [makeDeferralTimeout](ecs.md#private-makedeferraltimeout)
* [removeComponent](ecs.md#removecomponent)
* [removeComponentNow](ecs.md#private-removecomponentnow)
* [render](ecs.md#render)
* [runAllDeferredRemovals](ecs.md#private-runalldeferredremovals)
* [sortByOrder](ecs.md#sortbyorder)
* [tick](ecs.md#tick)

## Constructors

###  constructor

\+ **new ECS**(`options?`: undefined | object): *[ECS](ecs.md)*

*Defined in [ECS.ts:152](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L152)*

Constructor for a new entity-component-system manager.

**`example`** 
```js
import EntComp from 'ent-comp';
const ecs = new EntComp();
// Can also use `new EntComp({ defaultOrder: 15});` to set the default component.order value.
```

**Parameters:**

Name | Type |
------ | ------ |
`options?` | undefined \| object |

**Returns:** *[ECS](ecs.md)*

## Properties

### `Private` _defaultOrder

• **_defaultOrder**: *number*

*Defined in [ECS.ts:152](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L152)*

Default order to use if none specified

___

###  components

• **components**: *object*

*Defined in [ECS.ts:107](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L107)*

Map of component definitions

**`example`** 
```js
var comp = { name: 'foo' }
ecs.createComponent(comp)
ecs.components['foo'] === comp // true
```

#### Type declaration:

* \[ **name**: *string*\]: [Component](../interfaces/component.md)‹any›

___

### `Private` deferralTimeoutPending

• **deferralTimeoutPending**: *boolean*

*Defined in [ECS.ts:142](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L142)*

Whether or not a deferral is currently pending.

___

### `Private` deferredCompRemovals

• **deferredCompRemovals**: *ComponentRemovalRequest[]*

*Defined in [ECS.ts:137](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L137)*

List of all single-components waiting to be removed.

___

### `Private` deferredEntityRemovals

• **deferredEntityRemovals**: *number[]*

*Defined in [ECS.ts:132](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L132)*

List of all entityIds waiting to be removed.

___

### `Private` renderSystems

• **renderSystems**: *string[]*

*Defined in [ECS.ts:127](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L127)*

List of all renderSystems, sorted by execution order

___

### `Private` storage

• **storage**: *object*

*Defined in [ECS.ts:117](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L117)*

Storage for the component states

#### Type declaration:

* \[ **component**: *string*\]: Map‹number, [StateWithID](../interfaces/statewithid.md)›

___

### `Private` systems

• **systems**: *string[]*

*Defined in [ECS.ts:122](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L122)*

List of all systems, sorted by execution order

___

### `Private` uid

• **uid**: *number*

*Defined in [ECS.ts:147](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L147)*

Counter for entity IDs

## Accessors

###  comps

• **get comps**(): *object*

*Defined in [ECS.ts:109](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L109)*

**Returns:** *object*

* \[ **name**: *string*\]: [Component](../interfaces/component.md)‹any›

___

###  defaultOrder

• **get defaultOrder**(): *number*

*Defined in [ECS.ts:181](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L181)*

**Returns:** *number*

• **set defaultOrder**(`value`: number): *void*

*Defined in [ECS.ts:185](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L185)*

**Parameters:**

Name | Type |
------ | ------ |
`value` | number |

**Returns:** *void*

## Methods

###  addComponent

▸ **addComponent**(`entityId`: number, `componentName`: string, `state?`: any): *[ECS](ecs.md)*

*Defined in [ECS.ts:372](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L372)*

Adds a component to an entity, optionally initializing the state object.

**`example`** 
```js
ecs.createComponent({
 name: 'foo',
 state: { val: 0 }
})
ecs.addComponent(id, 'foo', {val:20})
ecs.getState(id, 'foo').val // 20
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entityId` | number | The id of the entity to add a component to. |
`componentName` | string | The name of the component to add. |
`state?` | any | The state to set when adding the component  |

**Returns:** *[ECS](ecs.md)*

___

###  createComponent

▸ **createComponent**<**T**>(`componentDefinition`: [Component](../interfaces/component.md)‹T›): *string*

*Defined in [ECS.ts:290](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L290)*

Create a new component from a definition object.
The definition must have a `name` property; all others are optional.

**`example`** 
```js
var comp = {
  name: 'a-unique-string',
  state: {},
  onAdd:     function(id, state){ },
  onRemove:  function(id, state){ },
  system:       function(dt, states){ },
  renderSystem: function(dt, states){ },
}
var name = ecs.createComponent( comp )
// name == 'a-unique-string'
```

**Type parameters:**

▪ **T**: *[StateWithID](../interfaces/statewithid.md)*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`componentDefinition` | [Component](../interfaces/component.md)‹T› | The definition of the component to create. |

**Returns:** *string*

The newly created component's name.

___

###  createEntity

▸ **createEntity**(`components?`: string[]): *number*

*Defined in [ECS.ts:222](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L222)*

Create a new entity id (currently just an incrementing integer).

**`example`** 
```js
var id1 = ecs.createEntity()
var id2 = ecs.createEntity([ 'my-component' ])
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`components?` | string[] | (optional) Components to add to the entity (with default state data). |

**Returns:** *number*

The newly created entity's ID.

___

###  deleteComponent

▸ **deleteComponent**(`componentName`: string): *[ECS](ecs.md)*

*Defined in [ECS.ts:334](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L334)*

Delete the component definition with the given name.
First removes the component from all entities that have it.

**`example`** 
```js
ecs.deleteComponent( comp.name )
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`componentName` | string | The name of the component to delete.  |

**Returns:** *[ECS](ecs.md)*

___

###  deleteEntity

▸ **deleteEntity**(`entityId`: number, `immediately`: boolean): *[ECS](ecs.md)*

*Defined in [ECS.ts:246](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L246)*

Delete an entity, which in practice just means removing all its components.
By default the actual removal is deferred (since entities will tend to call this
on themselves during event handlers, etc).

**`example`** 
```js
ecs.deleteEntity(id)
ecs.deleteEntity(id2, true) // deletes immediately
```

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`entityId` | number | - | The id of the entity to delete. |
`immediately` | boolean | false | Force immediate removal (instead of deferred).  |

**Returns:** *[ECS](ecs.md)*

___

### `Private` deleteEntityNow

▸ **deleteEntityNow**(`entityId`: number): *void*

*Defined in [ECS.ts:260](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L260)*

Delete an entity; simply removing all of its components.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entityId` | number | The id of the entity to delete.  |

**Returns:** *void*

___

### `Private` doDeferredComponentRemovals

▸ **doDeferredComponentRemovals**(): *void*

*Defined in [ECS.ts:714](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L714)*

Component removal, processes a queue of `{ id, compName }`

**Returns:** *void*

___

### `Private` doDeferredEntityRemovals

▸ **doDeferredEntityRemovals**(): *void*

*Defined in [ECS.ts:703](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L703)*

Entity removal, processes the queue of entity IDs.

**Returns:** *void*

___

###  getAllComponents

▸ **getAllComponents**(`entityId`: number): *string[]*

*Defined in [ECS.ts:429](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L429)*

Get all of the components attached to the given entity.

**`example`** 
```js
ecs.addComponent(id, 'comp-name')
ecs.getAllComponents(id) // ['comp-name']
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entityId` | number | The entity to get a list of components from.  |

**Returns:** *string[]*

___

###  getComponentAccessor

▸ **getComponentAccessor**(`componentName`: string): *[ComponentAccessor](../README.md#componentaccessor)*

*Defined in [ECS.ts:592](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L592)*

Returns a `hasComponent`-like accessor function bound to a given component name.
The accessor is much faster than `hasComponent`.

**`example`** 
```js
ecs.createComponent({
 name: 'foo',
})
ecs.addComponent(id, 'foo')
var hasFoo = ecs.getComponentAccessor('foo')
hasFoo(id) // true
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`componentName` | string | The name of the component to create an accessor for. |

**Returns:** *[ComponentAccessor](../README.md#componentaccessor)*

The component accessor function bound to the component's name.

___

###  getState

▸ **getState**(`entityId`: number, `componentName`: string): *[StateWithID](../interfaces/statewithid.md) | undefined*

*Defined in [ECS.ts:519](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L519)*

Get the component state for a given entity.
It will automatically be populated with an `__id` property denoting the entity id.

**`example`** 
```js
ecs.createComponent({
  name: 'foo',
  state: { val: 0 }
})
ecs.addComponent(id, 'foo')
ecs.getState(id, 'foo').val // 0
ecs.getState(id, 'foo').__id // equals id
```

**Parameters:**

Name | Type |
------ | ------ |
`entityId` | number |
`componentName` | string |

**Returns:** *[StateWithID](../interfaces/statewithid.md) | undefined*

The state of the entity's component.

___

###  getStateAccessor

▸ **getStateAccessor**<**T**>(`componentName`: string): *[StateAccessor](../README.md#stateaccessor)‹T›*

*Defined in [ECS.ts:567](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L567)*

Returns a `getState`-like accessor function bound to a given component name.
The accessor is much faster than `getState`, so you should create an accessor
for any component whose state you'll be accessing a lot.

**`example`** 
```js
ecs.createComponent({
  name: 'size',
  state: { val: 0 }
})
ecs.addComponent(id, 'size')
var getSize = ecs.getStateAccessor('size')
getSize(id).val // 0
```

**Type parameters:**

▪ **T**: *[StateWithID](../interfaces/statewithid.md)*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`componentName` | string | The name of the component to create an accessor for. |

**Returns:** *[StateAccessor](../README.md#stateaccessor)‹T›*

The state accessor function bound to the component's name.

___

###  getStatesList

▸ **getStatesList**(`componentName`: string): *Array‹[StateWithID](../interfaces/statewithid.md)›*

*Defined in [ECS.ts:542](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L542)*

Get an array of state objects for every entity with the given component.
Each one will have an `__id` property for the entity id it refers to.
Don't add or remove elements from the returned list!

**`example`** 
```js
var arr = ecs.getStatesList('foo')
// returns something shaped like:
//   [ {__id:0, x:1},
//     {__id:7, x:2}  ]
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`componentName` | string | The name of the component to get the states list from.  |

**Returns:** *Array‹[StateWithID](../interfaces/statewithid.md)›*

___

###  hasComponent

▸ **hasComponent**(`entityId`: number, `componentName`: string): *boolean*

*Defined in [ECS.ts:413](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L413)*

Checks if an entity has a component.

**`example`** 
```js
ecs.addComponent(id, 'comp-name')
ecs.hasComponent(id, 'comp-name') // true
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entityId` | number | The id of the entity to check for. |
`componentName` | string | The name of the component to check for.  |

**Returns:** *boolean*

___

### `Private` makeDeferralTimeout

▸ **makeDeferralTimeout**(): *void*

*Defined in [ECS.ts:682](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L682)*

Debouncer, called whenever a deferral is queued.

**Returns:** *void*

___

###  removeComponent

▸ **removeComponent**(`entityId`: number, `componentName`: string, `immediately`: boolean): *[ECS](ecs.md)*

*Defined in [ECS.ts:453](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L453)*

Removes a component from an entity, deleting any state data.

**`example`** 
```js
ecs.removeComponent(id, 'foo')
ecs.hasComponent(id, 'foo') // false
```

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`entityId` | number | - | The id of the entity to remove from. |
`componentName` | string | - | The name of the component to remove. |
`immediately` | boolean | false | Force immediate removal (instead of deferred).  |

**Returns:** *[ECS](ecs.md)*

___

### `Private` removeComponentNow

▸ **removeComponentNow**(`entityId`: number, `componentName`: string): *void*

*Defined in [ECS.ts:481](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L481)*

Actually remove a component from the given entity.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entityId` | number | The id of the entity to remove the component from. |
`componentName` | string | The name of the component to remove.  |

**Returns:** *void*

___

###  render

▸ **render**(`dt`: number): *[ECS](ecs.md)*

*Defined in [ECS.ts:662](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L662)*

Functions exactly like `tick`, but calls `renderSystem` functions.
this effectively gives you a second set of systems that are
called with separate timing, in case you want to
[tick and render in separate loops](http://gafferongames.com/game-physics/fix-your-timestep/)
(which you should!).

**`example`** 
```js
ecs.createComponent({
 name: foo,
 order: 5,
 renderSystem: function(dt, states) {
   // states is the same array you'd get from #getStatesList()
 }
})
ecs.render(1000/60)
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`dt` | number | The timestep to pass to the system functions.  |

**Returns:** *[ECS](ecs.md)*

___

### `Private` runAllDeferredRemovals

▸ **runAllDeferredRemovals**(): *void*

*Defined in [ECS.ts:695](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L695)*

Ping all removal queues.
Called before and after tick/render, and after deferrals are queued.

**Returns:** *void*

___

###  sortByOrder

▸ **sortByOrder**(`componentNames`: string[]): *string[]*

*Defined in [ECS.ts:203](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L203)*

Sort the given list of component names using their component.order value (or the defaultOrder value).
NOTE: This mutates the original array, make a copy of it first if you want it immutable.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`componentNames` | string[] | The list of component names to sort.  |

**Returns:** *string[]*

___

###  tick

▸ **tick**(`dt`: number): *[ECS](ecs.md)*

*Defined in [ECS.ts:628](https://github.com/PandawanFr/ent-comp/blob/4377491/src/ECS.ts#L628)*

Tells the ECS that a game tick has occurred, causing component
`system` functions to get called.

**`example`** 
```js
ecs.createComponent({
 name: foo,
 order: 1,
 system: function(dt, states) {
   // states is the same array you'd get from #getStatesList()
   states.forEach(state => {
     console.log('Entity ID: ', state.__id)
   })
 }
})
ecs.tick(30) // triggers log statements
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`dt` | number | The timestep to pass to the system functions.  If components have an `order` property, they'll get called in that order (lowest to highest). Component order defaults to `99`.  |

**Returns:** *[ECS](ecs.md)*