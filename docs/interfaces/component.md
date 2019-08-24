**[ent-comp](../README.md)**

[Globals](../README.md) › [Component](component.md)

# Interface: Component

Component Definition

## Hierarchy

* **Component**

## Index

### Properties

* [multi](component.md#optional-multi)
* [name](component.md#name)
* [onAdd](component.md#optional-onadd)
* [onRemove](component.md#optional-onremove)
* [order](component.md#optional-order)
* [renderSystem](component.md#optional-rendersystem)
* [state](component.md#optional-state)
* [system](component.md#optional-system)

## Properties

### `Optional` multi

• **multi**? : *undefined | false | true*

*Defined in [ECS.ts:18](https://github.com/PandawanFr/ent-comp/blob/ec7d49f/src/ECS.ts#L18)*

Whether or not an entity can have multiple instances of this component at once

___

###  name

• **name**: *string*

*Defined in [ECS.ts:10](https://github.com/PandawanFr/ent-comp/blob/ec7d49f/src/ECS.ts#L10)*

Name of the component

___

### `Optional` onAdd

• **onAdd**? : *undefined | function*

*Defined in [ECS.ts:28](https://github.com/PandawanFr/ent-comp/blob/ec7d49f/src/ECS.ts#L28)*

Called when the component is added to an entity.

**`param`** The entity's ID.

**`param`** The components's new state.

___

### `Optional` onRemove

• **onRemove**? : *undefined | function*

*Defined in [ECS.ts:35](https://github.com/PandawanFr/ent-comp/blob/ec7d49f/src/ECS.ts#L35)*

Called when the component is removed from an entity.

**`param`** The entity's ID.

**`param`** The components's current state.

___

### `Optional` order

• **order**? : *undefined | number*

*Defined in [ECS.ts:14](https://github.com/PandawanFr/ent-comp/blob/ec7d49f/src/ECS.ts#L14)*

Order to execute the components in

___

### `Optional` renderSystem

• **renderSystem**? : *undefined | function*

*Defined in [ECS.ts:49](https://github.com/PandawanFr/ent-comp/blob/ec7d49f/src/ECS.ts#L49)*

Called every tick to render that component.

**`param`** Length of one render tick in ms.

**`param`** Array of all states of this component type.

___

### `Optional` state

• **state**? : *any*

*Defined in [ECS.ts:22](https://github.com/PandawanFr/ent-comp/blob/ec7d49f/src/ECS.ts#L22)*

Default state of the component

___

### `Optional` system

• **system**? : *undefined | function*

*Defined in [ECS.ts:42](https://github.com/PandawanFr/ent-comp/blob/ec7d49f/src/ECS.ts#L42)*

Called every tick to process that component.

**`param`** Length of one tick in ms.

**`param`** Array of all states of this component type.