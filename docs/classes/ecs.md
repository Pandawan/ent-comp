**[ent-comp](../README.md)**

[Globals](../README.md) › [ECS](ecs.md)

# Class: ECS

## Hierarchy

* **ECS**

## Index

### Constructors

* [constructor](ecs.md#constructor)

### Properties

* [components](ecs.md#components)
* [defaultOrder](ecs.md#private-defaultorder)
* [deferralTimeoutPending](ecs.md#private-deferraltimeoutpending)
* [deferredCompRemovals](ecs.md#private-deferredcompremovals)
* [deferredEntityRemovals](ecs.md#private-deferredentityremovals)
* [deferredMultiCompRemovals](ecs.md#private-deferredmulticompremovals)
* [renderSystems](ecs.md#private-rendersystems)
* [storage](ecs.md#private-storage)
* [systems](ecs.md#private-systems)
* [uid](ecs.md#private-uid)

### Accessors

* [comps](ecs.md#comps)

### Methods

* [addComponent](ecs.md#addcomponent)
* [createComponent](ecs.md#createcomponent)
* [createEntity](ecs.md#createentity)
* [deleteComponent](ecs.md#deletecomponent)
* [deleteEntity](ecs.md#deleteentity)
* [deleteEntityNow](ecs.md#private-deleteentitynow)
* [doDeferredComponentRemovals](ecs.md#private-dodeferredcomponentremovals)
* [doDeferredEntityRemovals](ecs.md#private-dodeferredentityremovals)
* [doDeferredMultiComponentRemovals](ecs.md#private-dodeferredmulticomponentremovals)
* [getAllComponents](ecs.md#getallcomponents)
* [getComponentAccessor](ecs.md#getcomponentaccessor)
* [getState](ecs.md#getstate)
* [getStateAccessor](ecs.md#getstateaccessor)
* [getStatesList](ecs.md#getstateslist)
* [hasComponent](ecs.md#hascomponent)
* [makeDeferralTimeout](ecs.md#private-makedeferraltimeout)
* [removeComponent](ecs.md#removecomponent)
* [removeComponentNow](ecs.md#private-removecomponentnow)
* [removeMultiComponent](ecs.md#removemulticomponent)
* [removeMultiComponentNow](ecs.md#private-removemulticomponentnow)
* [render](ecs.md#render)
* [runAllDeferredRemovals](ecs.md#private-runalldeferredremovals)
* [tick](ecs.md#tick)

## Constructors

###  constructor

\+ **new ECS**(): *[ECS](ecs.md)*

*Defined in [ECS.ts:180](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L180)*

Constructor for a new entity-component-system manager.

**`example`** 
```js
// You might have to import the file directly rather than ent-comp
import EntComp from 'ent-comp';
const ecs = new EntComp();
```

**Returns:** *[ECS](ecs.md)*

## Properties

###  components

• **components**: *object*

*Defined in [ECS.ts:130](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L130)*

Map of component definitions

**`example`** 
```js
var comp = { name: 'foo' }
ecs.createComponent(comp)
ecs.components['foo'] === comp // true
```

#### Type declaration:

* \[ **name**: *string*\]: [Component](../interfaces/component.md)

___

### `Private` defaultOrder

• **defaultOrder**: *number*

*Defined in [ECS.ts:180](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L180)*

Default order to use if none specified

___

### `Private` deferralTimeoutPending

• **deferralTimeoutPending**: *boolean*

*Defined in [ECS.ts:170](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L170)*

Whether or not a deferral is currently pending.

___

### `Private` deferredCompRemovals

• **deferredCompRemovals**: *ComponentRemovalRequest[]*

*Defined in [ECS.ts:160](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L160)*

List of all single-components waiting to be removed.

___

### `Private` deferredEntityRemovals

• **deferredEntityRemovals**: *number[]*

*Defined in [ECS.ts:155](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L155)*

List of all entityIds waiting to be removed.

___

### `Private` deferredMultiCompRemovals

• **deferredMultiCompRemovals**: *MultiComponentRemovalRequest[]*

*Defined in [ECS.ts:165](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L165)*

List of all multi-components waiting to be removed.

___

### `Private` renderSystems

• **renderSystems**: *string[]*

*Defined in [ECS.ts:150](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L150)*

List of all renderSystems, sorted by execution order

___

### `Private` storage

• **storage**: *object*

*Defined in [ECS.ts:140](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L140)*

Storage for the component states

#### Type declaration:

* \[ **component**: *string*\]: Map‹number, [StateWithID](../interfaces/statewithid.md) | [StateWithID](../interfaces/statewithid.md)[]›

___

### `Private` systems

• **systems**: *string[]*

*Defined in [ECS.ts:145](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L145)*

List of all systems, sorted by execution order

___

### `Private` uid

• **uid**: *number*

*Defined in [ECS.ts:175](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L175)*

Counter for entity IDs

## Accessors

###  comps

• **get comps**(): *object*

*Defined in [ECS.ts:132](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L132)*

**Returns:** *object*

* \[ **name**: *string*\]: [Component](../interfaces/component.md)

## Methods

###  addComponent

▸ **addComponent**(`entityId`: number, `componentName`: string, `state?`: any): *[ECS](ecs.md)*

*Defined in [ECS.ts:372](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L372)*

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

▸ **createComponent**(`componentDefinition`: [Component](../interfaces/component.md)): *string*

*Defined in [ECS.ts:289](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L289)*

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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`componentDefinition` | [Component](../interfaces/component.md) | The definition of the component to create. |

**Returns:** *string*

The newly created component's name.

___

###  createEntity

▸ **createEntity**(`components?`: string[]): *number*

*Defined in [ECS.ts:221](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L221)*

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

*Defined in [ECS.ts:334](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L334)*

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

*Defined in [ECS.ts:245](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L245)*

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

*Defined in [ECS.ts:259](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L259)*

Delete an entity; simply removing all of its components.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entityId` | number | The id of the entity to delete.  |

**Returns:** *void*

___

### `Private` doDeferredComponentRemovals

▸ **doDeferredComponentRemovals**(): *void*

*Defined in [ECS.ts:806](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L806)*

Component removal, processes a queue of `{ id, compName }`

**Returns:** *void*

___

### `Private` doDeferredEntityRemovals

▸ **doDeferredEntityRemovals**(): *void*

*Defined in [ECS.ts:795](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L795)*

Entity removal, processes the queue of entity IDs.

**Returns:** *void*

___

### `Private` doDeferredMultiComponentRemovals

▸ **doDeferredMultiComponentRemovals**(): *void*

*Defined in [ECS.ts:815](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L815)*

**Returns:** *void*

___

###  getAllComponents

▸ **getAllComponents**(`entityId`: number): *string[]*

*Defined in [ECS.ts:438](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L438)*

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

*Defined in [ECS.ts:683](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L683)*

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

▸ **getState**(`entityId`: number, `componentName`: string): *[StateWithID](../interfaces/statewithid.md) | [StateWithID](../interfaces/statewithid.md)[] | undefined*

*Defined in [ECS.ts:611](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L611)*

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

**Returns:** *[StateWithID](../interfaces/statewithid.md) | [StateWithID](../interfaces/statewithid.md)[] | undefined*

The state of the entity's component.

___

###  getStateAccessor

▸ **getStateAccessor**(`componentName`: string): *[StateAccessor](../README.md#stateaccessor)*

*Defined in [ECS.ts:658](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L658)*

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

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`componentName` | string | The name of the component to create an accessor for. |

**Returns:** *[StateAccessor](../README.md#stateaccessor)*

The state accessor function bound to the component's name.

___

###  getStatesList

▸ **getStatesList**(`componentName`: string): *Array‹[StateWithID](../interfaces/statewithid.md) | [StateWithID](../interfaces/statewithid.md)[]›*

*Defined in [ECS.ts:634](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L634)*

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

**Returns:** *Array‹[StateWithID](../interfaces/statewithid.md) | [StateWithID](../interfaces/statewithid.md)[]›*

___

###  hasComponent

▸ **hasComponent**(`entityId`: number, `componentName`: string): *boolean*

*Defined in [ECS.ts:422](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L422)*

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

*Defined in [ECS.ts:773](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L773)*

Debouncer, called whenever a deferral is queued.

**Returns:** *void*

___

###  removeComponent

▸ **removeComponent**(`entityId`: number, `componentName`: string, `immediately`: boolean): *[ECS](ecs.md)*

*Defined in [ECS.ts:462](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L462)*

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

*Defined in [ECS.ts:492](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L492)*

Actually remove a component from the given entity.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entityId` | number | The id of the entity to remove the component from. |
`componentName` | string | The name of the component to remove.  |

**Returns:** *void*

___

###  removeMultiComponent

▸ **removeMultiComponent**(`entityId`: number, `componentName`: string, `index`: number, `immediately`: boolean): *[ECS](ecs.md)*

*Defined in [ECS.ts:535](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L535)*

Removes a particular state instance of a multi-component.
Pass a final truthy argument to make this happen synchronously - but be careful,
that will splice an element out of the multi-component array,
changing the indexes of subsequent elements.

**`example`** 
```js
ecs.getState(id, 'foo')   // [ state1, state2, state3 ]
ecs.removeMultiComponent(id, 'foo', 1, true)  // true means: immediately
ecs.getState(id, 'foo')   // [ state1, state3 ]
```

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`entityId` | number | - | The id of the entity to remove from. |
`componentName` | string | - | The name of the component to remove. |
`index` | number | - | The index of the state to remove (since multi-component). |
`immediately` | boolean | false | Force immediate removal (instead of deferred).  |

**Returns:** *[ECS](ecs.md)*

___

### `Private` removeMultiComponentNow

▸ **removeMultiComponentNow**(`entityId`: number, `componentName`: string, `stateObject`: [StateWithID](../interfaces/statewithid.md)): *void*

*Defined in [ECS.ts:568](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L568)*

Remove one state from a multi-component.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entityId` | number | The id of the entity to remove from. |
`componentName` | string | Then name of the component to remove. |
`stateObject` | [StateWithID](../interfaces/statewithid.md) | The specific state to remove.  |

**Returns:** *void*

___

###  render

▸ **render**(`dt`: number): *[ECS](ecs.md)*

*Defined in [ECS.ts:753](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L753)*

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

*Defined in [ECS.ts:786](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L786)*

Ping all removal queues.
Called before and after tick/render, and after deferrals are queued.

**Returns:** *void*

___

###  tick

▸ **tick**(`dt`: number): *[ECS](ecs.md)*

*Defined in [ECS.ts:719](https://github.com/PandawanFr/ent-comp/blob/2090dc7/src/ECS.ts#L719)*

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