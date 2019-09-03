**[ent-comp](../README.md)**

[Globals](../README.md) › [Component](component.md)

# Interface: Component <**T**>

Component Definition.

**`template`** T Use the generic T parameter to describe the Component's custom state.

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

*Defined in [ECS.ts:9](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L9)*

Name of the component

___

### `Optional` onAdd

• **onAdd**? : *undefined | function*

*Defined in [ECS.ts:23](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L23)*

Called when the component is added to an entity.

**`param`** The entity's ID.

**`param`** The components's new state.

___

### `Optional` onExternalEvent

• **onExternalEvent**? : *undefined | function*

*Defined in [ECS.ts:40](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L40)*

Use this for any external events that need to be sent to the component.
(This is never called by ent-comp).

**`param`** The name of the event.

**`param`** The entity's ID.

**`param`** The component's current state.

**`returns`** Any value you want back from the event handler.

___

### `Optional` onRemove

• **onRemove**? : *undefined | function*

*Defined in [ECS.ts:30](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L30)*

Called when the component is removed from an entity.

**`param`** The entity's ID.

**`param`** The components's current state.

___

### `Optional` order

• **order**? : *undefined | number*

*Defined in [ECS.ts:13](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L13)*

Order to execute the components in

___

### `Optional` renderSystem

• **renderSystem**? : *undefined | function*

*Defined in [ECS.ts:54](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L54)*

Called every tick to render that component.

**`param`** Length of one render tick in ms.

**`param`** Array of all states of this component type.

___

### `Optional` state

• **state**? : *Omit‹T, "__id"›*

*Defined in [ECS.ts:17](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L17)*

Default state of the component

___

### `Optional` system

• **system**? : *undefined | function*

*Defined in [ECS.ts:47](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L47)*

Called every tick to process that component.

**`param`** Length of one tick in ms.

**`param`** Array of all states of this component type.