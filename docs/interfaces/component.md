**[ent-comp](../README.md)**

[Globals](../README.md) › [Component](component.md)

# Interface: Component

Component Definition

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

*Defined in [ECS.ts:10](https://github.com/PandawanFr/ent-comp/blob/5921f6c/src/ECS.ts#L10)*

Name of the component

___

### `Optional` onAdd

• **onAdd**? : *undefined | function*

*Defined in [ECS.ts:24](https://github.com/PandawanFr/ent-comp/blob/5921f6c/src/ECS.ts#L24)*

Called when the component is added to an entity.

**`param`** The entity's ID.

**`param`** The components's new state.

___

### `Optional` onExternalEvent

• **onExternalEvent**? : *undefined | function*

*Defined in [ECS.ts:40](https://github.com/PandawanFr/ent-comp/blob/5921f6c/src/ECS.ts#L40)*

Use this for any external events that need to be sent to the component.
(This is never called by ent-comp).

**`param`** The name of the event.

**`param`** The entity's ID.

**`param`** The component's current state.

___

### `Optional` onRemove

• **onRemove**? : *undefined | function*

*Defined in [ECS.ts:31](https://github.com/PandawanFr/ent-comp/blob/5921f6c/src/ECS.ts#L31)*

Called when the component is removed from an entity.

**`param`** The entity's ID.

**`param`** The components's current state.

___

### `Optional` order

• **order**? : *undefined | number*

*Defined in [ECS.ts:14](https://github.com/PandawanFr/ent-comp/blob/5921f6c/src/ECS.ts#L14)*

Order to execute the components in

___

### `Optional` renderSystem

• **renderSystem**? : *undefined | function*

*Defined in [ECS.ts:54](https://github.com/PandawanFr/ent-comp/blob/5921f6c/src/ECS.ts#L54)*

Called every tick to render that component.

**`param`** Length of one render tick in ms.

**`param`** Array of all states of this component type.

___

### `Optional` state

• **state**? : *any*

*Defined in [ECS.ts:18](https://github.com/PandawanFr/ent-comp/blob/5921f6c/src/ECS.ts#L18)*

Default state of the component

___

### `Optional` system

• **system**? : *undefined | function*

*Defined in [ECS.ts:47](https://github.com/PandawanFr/ent-comp/blob/5921f6c/src/ECS.ts#L47)*

Called every tick to process that component.

**`param`** Length of one tick in ms.

**`param`** Array of all states of this component type.