**[ent-comp](../README.md)**

[Globals](../README.md) › [Component](component.md)

# Interface: Component <**T**>

Component Definition

## Type parameters

▪ **T**: *[StateWithID](statewithid.md)*

## Hierarchy

* **Component**

## Index

### Properties

* [name](component.md#name)
* [onAdd](component.md#optional-onadd)
* [onExternalEvent](component.md#optional-onexternalevent)
* [onRemove](component.md#optional-onremove)
* [order](component.md#optional-order)
* [renderSystem](component.md#optional-rendersystem)
* [state](component.md#optional-state)
* [system](component.md#optional-system)

## Properties

###  name

• **name**: *string*

*Defined in [ECS.ts:8](https://github.com/PandawanFr/ent-comp/blob/3d6c7bd/src/ECS.ts#L8)*

Name of the component

___

### `Optional` onAdd

• **onAdd**? : *undefined | function*

*Defined in [ECS.ts:22](https://github.com/PandawanFr/ent-comp/blob/3d6c7bd/src/ECS.ts#L22)*

Called when the component is added to an entity.

**`param`** The entity's ID.

**`param`** The components's new state.

___

### `Optional` onExternalEvent

• **onExternalEvent**? : *undefined | function*

*Defined in [ECS.ts:38](https://github.com/PandawanFr/ent-comp/blob/3d6c7bd/src/ECS.ts#L38)*

Use this for any external events that need to be sent to the component.
(This is never called by ent-comp).

**`param`** The name of the event.

**`param`** The entity's ID.

**`param`** The component's current state.

___

### `Optional` onRemove

• **onRemove**? : *undefined | function*

*Defined in [ECS.ts:29](https://github.com/PandawanFr/ent-comp/blob/3d6c7bd/src/ECS.ts#L29)*

Called when the component is removed from an entity.

**`param`** The entity's ID.

**`param`** The components's current state.

___

### `Optional` order

• **order**? : *undefined | number*

*Defined in [ECS.ts:12](https://github.com/PandawanFr/ent-comp/blob/3d6c7bd/src/ECS.ts#L12)*

Order to execute the components in

___

### `Optional` renderSystem

• **renderSystem**? : *undefined | function*

*Defined in [ECS.ts:52](https://github.com/PandawanFr/ent-comp/blob/3d6c7bd/src/ECS.ts#L52)*

Called every tick to render that component.

**`param`** Length of one render tick in ms.

**`param`** Array of all states of this component type.

___

### `Optional` state

• **state**? : *Omit‹T, "__id"›*

*Defined in [ECS.ts:16](https://github.com/PandawanFr/ent-comp/blob/3d6c7bd/src/ECS.ts#L16)*

Default state of the component

___

### `Optional` system

• **system**? : *undefined | function*

*Defined in [ECS.ts:45](https://github.com/PandawanFr/ent-comp/blob/3d6c7bd/src/ECS.ts#L45)*

Called every tick to process that component.

**`param`** Length of one tick in ms.

**`param`** Array of all states of this component type.