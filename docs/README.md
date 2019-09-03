**[ent-comp](README.md)**

[Globals](README.md)

## Index

### Classes

* [ECS](classes/ecs.md)

### Interfaces

* [Component](interfaces/component.md)
* [StateWithID](interfaces/statewithid.md)
* [UnknownStateWithID](interfaces/unknownstatewithid.md)

### Type aliases

* [ComponentAccessor](README.md#componentaccessor)
* [StateAccessor](README.md#stateaccessor)

## Type aliases

###  ComponentAccessor

Ƭ **ComponentAccessor**: *function*

*Defined in [ECS.ts:88](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L88)*

A `hasComponent`-like accessor function bound to a given component name.

**`param`** the id of the entity to get from.

**`returns`** True if that entity has that component.

#### Type declaration:

▸ (`entID`: number): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`entID` | number |

___

###  StateAccessor

Ƭ **StateAccessor**: *function*

*Defined in [ECS.ts:81](https://github.com/PandawanFr/ent-comp/blob/74eb104/src/ECS.ts#L81)*

A `getState`-like accessor function bound to a given component name.

**`param`** The id of the entity to get from.

**`returns`** The state of that entity's component.

#### Type declaration:

▸ (`entID`: number): *T | undefined*

**Parameters:**

Name | Type |
------ | ------ |
`entID` | number |