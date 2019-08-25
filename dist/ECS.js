"use strict";
// TODO: Try to remove all <any>
Object.defineProperty(exports, "__esModule", { value: true });
;
class ECS {
    get comps() {
        console.error(new Error(`Alias "comps" is ugly and deprecated. Please use "components" instead.`));
        return this.components;
    }
    /**
     * Constructor for a new entity-component-system manager.
     * @example
     * ```js
     * var ECS = require('ent-comp')
     * var ecs = new ECS()
     * ```
     */
    constructor() {
        this.components = {};
        this.storage = {};
        this.systems = [];
        this.renderSystems = [];
        this.deferredEntityRemovals = [];
        this.deferredCompRemovals = [];
        this.deferredMultiCompRemovals = [];
        this.deferralTimeoutPending = false;
        this.uid = 1;
        this.defaultOrder = 99;
    }
    // #region Entity Management
    /**
     * Create a new entity id (currently just an incrementing integer).
     * @param components (optional) Components to add to the entity (with default state data).
     * @returns The newly created entity's ID.
     *
     * @example
     * ```js
     * var id1 = ecs.createEntity()
     * var id2 = ecs.createEntity([ 'my-component' ])
     * ```
     */
    createEntity(components) {
        const id = this.uid++;
        if (components) {
            for (const componentName of components) {
                this.addComponent(id, componentName);
            }
        }
        return id;
    }
    /**
     * Delete an entity, which in practice just means removing all its components.
     * By default the actual removal is deferred (since entities will tend to call this
     * on themselves during event handlers, etc).
     *
     * @param entityId The id of the entity to delete.
     * @param immediately Force immediate removal (instead of deferred).
     *
     * @example
     * ```js
     * ecs.deleteEntity(id)
     * ecs.deleteEntity(id2, true) // deletes immediately
     * ```
     */
    deleteEntity(entityId, immediately = false) {
        if (immediately) {
            this.deleteEntityNow(entityId);
        }
        else {
            this.deferredEntityRemovals.push(entityId);
            this.makeDeferralTimeout();
        }
        return this;
    }
    /**
     * Delete an entity; simply removing all of its components.
     * @param entityId The id of the entity to delete.
     */
    deleteEntityNow(entityId) {
        for (const [name, data] of Object.entries(this.storage)) {
            if (data.has(entityId))
                this.removeComponentNow(entityId, name);
        }
    }
    // #endregion
    // #region Component Management
    /**
     * Create a new component from a definition object.
     * The definition must have a `name` property; all others are optional.
     * @param componentDefinition The definition of the component to create.
     * @returns The newly created component's name.
     *
     * @example
     * ```js
     * var comp = {
     *   name: 'a-unique-string',
     *   state: {},
     *   onAdd:     function(id, state){ },
     *   onRemove:  function(id, state){ },
     *   system:       function(dt, states){ },
     *   renderSystem: function(dt, states){ },
     * }
     * var name = ecs.createComponent( comp )
     * // name == 'a-unique-string'
     * ```
     */
    createComponent(componentDefinition) {
        if (!componentDefinition)
            throw new Error('Missing component definition');
        var name = componentDefinition.name;
        if (!name)
            throw new Error('Component definition must have a name property.');
        if (typeof name !== 'string')
            throw new Error('Component name must be a string.');
        if (name === '')
            throw new Error('Component name must be a non-empty string.');
        if (this.storage[name])
            throw new Error(`Component ${name} already exists.`);
        // rebuild definition object for monomorphism
        const internalDef = {
            name,
            order: (!componentDefinition.order || isNaN(componentDefinition.order)) ? this.defaultOrder : componentDefinition.order,
            state: componentDefinition.state || {},
            onAdd: componentDefinition.onAdd || undefined,
            onRemove: componentDefinition.onRemove || undefined,
            system: componentDefinition.system || undefined,
            renderSystem: componentDefinition.renderSystem || undefined,
            multi: !!componentDefinition.multi
        };
        this.components[name] = internalDef;
        this.storage[name] = new Map();
        if (internalDef.system) {
            this.systems.push(name);
            this.systems.sort((a, b) => (this.components[a].order || this.defaultOrder) - (this.components[b].order || this.defaultOrder));
        }
        if (internalDef.renderSystem) {
            this.renderSystems.push(name);
            this.renderSystems.sort((a, b) => (this.components[a].order || this.defaultOrder) - (this.components[b].order || this.defaultOrder));
        }
        return name;
    }
    /**
     * Delete the component definition with the given name.
     * First removes the component from all entities that have it.
     * @param componentName The name of the component to delete.
     *
     * @example
     * ```js
     * ecs.deleteComponent( comp.name )
     * ```
     */
    deleteComponent(componentName) {
        const componentData = this.storage[componentName];
        if (!componentData)
            throw new Error(`Unknown component: ${componentName}`);
        for (const [, state] of componentData) {
            const id = Array.isArray(state) ? state[0].__id : state.__id;
            this.removeComponent(id, componentName, true);
        }
        // Remove componentNames from the systems list
        const i = this.systems.indexOf(componentName);
        if (i > -1)
            this.systems.splice(i, 1);
        const j = this.renderSystems.indexOf(componentName);
        if (j > -1)
            this.renderSystems.splice(j, 1);
        delete this.components[componentName];
        delete this.storage[componentName];
        return this;
    }
    /**
     * Adds a component to an entity, optionally initializing the state object.
     *
     * @param entityId The id of the entity to add a component to.
     * @param componentName The name of the component to add.
     * @param state The state to set when adding the component
     *
     * @example
     * ```js
     * ecs.createComponent({
     *  name: 'foo',
     *  state: { val: 0 }
     * })
     * ecs.addComponent(id, 'foo', {val:20})
     * ecs.getState(id, 'foo').val // 20
     * ```
     */
    addComponent(entityId, componentName, state) {
        const componentDefinition = this.components[componentName];
        const componentData = this.storage[componentName];
        if (!componentData)
            throw new Error(`Unknown component: ${componentName}.`);
        // If the component is pending removal, remove it so it can be readded
        let pendingRemoval = false;
        for (const compRemoval of this.deferredCompRemovals) {
            if (compRemoval.id === entityId && compRemoval.compName === componentName)
                pendingRemoval = true;
        }
        if (pendingRemoval)
            this.doDeferredComponentRemovals();
        if (componentData.has(entityId) && !componentDefinition.multi)
            throw new Error(`Entity ${entityId} already has component: ${componentName}.`);
        // Create new component state object for this entity
        const newState = Object.assign({}, { __id: entityId }, componentDefinition.state, state);
        // Just in case passed-in state object had an __id property
        newState.__id = entityId;
        // Add to dataStore - for multi components, may already be present
        if (componentDefinition.multi) {
            let statesArr = componentData.get(entityId);
            if (!statesArr) {
                statesArr = [];
                componentData.set(entityId, statesArr);
            }
            // TODO: Cast statesArr as a StateWithID[]
            statesArr.push(newState);
        }
        else {
            componentData.set(entityId, newState);
        }
        // Call handler and return
        if (componentDefinition.onAdd)
            componentDefinition.onAdd(entityId, newState);
        return this;
    }
    /**
     * Checks if an entity has a component.
     *
     * @param entityId The id of the entity to check for.
     * @param componentName The name of the component to check for.
     *
     * @example
     * ```js
     * ecs.addComponent(id, 'comp-name')
     * ecs.hasComponent(id, 'comp-name') // true
     * ```
     */
    hasComponent(entityId, componentName) {
        const data = this.storage[componentName];
        if (!data)
            throw new Error(`Unknown component: ${componentName}.`);
        return (data.get(entityId) !== undefined);
    }
    /**
     * Removes a component from an entity, deleting any state data.
     * @param entityId The id of the entity to remove from.
     * @param componentName The name of the component to remove.
     * @param immediately Force immediate removal (instead of deferred).
     *
     * @example
     * ```js
     * ecs.removeComponent(id, 'foo')
     * ecs.hasComponent(id, 'foo') // false
     * ```
     */
    removeComponent(entityId, componentName, immediately = false) {
        var componentDefinition = this.components[componentName];
        var componentData = this.storage[componentName];
        if (!componentData)
            throw new Error(`Unknown component: ${componentName}.`);
        // If component isn't present, fail silently for multi or throw otherwise
        if (!componentData.has(entityId)) {
            if (componentDefinition.multi)
                return this;
            else
                throw new Error(`Entity ${entityId} does not have component: ${componentName} to remove.`);
        }
        // Defer or remove
        if (immediately) {
            this.removeComponentNow(entityId, componentName);
        }
        else {
            this.deferredCompRemovals.push({
                id: entityId,
                compName: componentName
            });
            this.makeDeferralTimeout();
        }
        return this;
    }
    /**
     * Actually remove a component from the given entity.
     * @param entityId The id of the entity to remove the component from.
     * @param componentName The name of the component to remove.
     */
    removeComponentNow(entityId, componentName) {
        const componentDefinition = this.components[componentName];
        const componentData = this.storage[componentName];
        if (!componentData)
            return;
        if (!componentData.has(entityId))
            return; // probably got removed twice during deferral
        // Call onRemove handler - on each instance for multi components
        const states = componentData.get(entityId);
        if (componentDefinition.onRemove && states) {
            if (componentDefinition.multi && Array.isArray(states)) {
                for (const state of states) {
                    componentDefinition.onRemove(entityId, state);
                }
            }
            else {
                if (Array.isArray(states))
                    throw new Error(`Found multiple states on non-multi component: ${componentName}`);
                componentDefinition.onRemove(entityId, states);
            }
        }
        // If multi, kill the states array to hopefully free the objects
        if (componentDefinition.multi && Array.isArray(states))
            states.length = 0;
        // Actual removal from data store
        componentData.delete(entityId);
    }
    /**
     * Removes a particular state instance of a multi-component.
     * Pass a final truthy argument to make this happen synchronously - but be careful,
     * that will splice an element out of the multi-component array,
     * changing the indexes of subsequent elements.
     * @param entityId The id of the entity to remove from.
     * @param componentName The name of the component to remove.
     * @param index The index of the state to remove (since multi-component).
     * @param immediately Force immediate removal (instead of deferred).
     *
     * @example
     * ```js
     * ecs.getState(id, 'foo')   // [ state1, state2, state3 ]
     * ecs.removeMultiComponent(id, 'foo', 1, true)  // true means: immediately
     * ecs.getState(id, 'foo')   // [ state1, state3 ]
     * ```
     */
    removeMultiComponent(entityId, componentName, index, immediately = false) {
        const componentDefinition = this.components[componentName];
        const componentData = this.storage[componentName];
        if (!componentData)
            throw new Error(`Unknown component: ${componentName}.`);
        if (!componentDefinition.multi)
            throw new Error('removeMultiComponent called on non-multi component');
        // throw if comp isn't present, or multicomp isn't present at index
        const statesArr = componentData.get(entityId);
        if (!statesArr || !Array.isArray(statesArr) || !statesArr[index]) {
            throw new Error(`Multicomponent ${componentName} instance not found at index ${index}`);
        }
        // index removals by object, in case indexes change later
        const stateToRemove = statesArr[index];
        if (immediately) {
            this.removeMultiComponentNow(entityId, componentName, stateToRemove);
        }
        else {
            this.deferredMultiCompRemovals.push({
                id: entityId,
                compName: componentName,
                state: stateToRemove
            });
        }
        return this;
    }
    /**
     * Remove one state from a multi-component.
     * @param entityId The id of the entity to remove from.
     * @param componentName Then name of the component to remove.
     * @param stateObject The specific state to remove.
     */
    removeMultiComponentNow(entityId, componentName, stateObject) {
        const componentDefinition = this.components[componentName];
        const componentData = this.storage[componentName];
        if (!componentData)
            throw new Error(`Unknown component: ${componentName}.`);
        const statesArr = componentData.get(entityId);
        if (!statesArr)
            return;
        const index = statesArr.indexOf(stateObject);
        if (index < 0)
            return;
        if (componentDefinition.onRemove) {
            componentDefinition.onRemove(entityId, stateObject);
        }
        statesArr.splice(index, 1);
        // if this leaves the states list empty, remove the whole component
        if (statesArr.length === 0) {
            this.removeComponentNow(entityId, componentName);
        }
    }
    // #endregion
    // #region State Management
    /**
     * Get the component state for a given entity.
     * It will automatically be populated with an `__id` property denoting the entity id.
     * @param entID The id of the entity to get from.
     * @param compName The name of the component to get.
     * @returns The state of the entity's component.
     *
     * @example
     * ```js
     * ecs.createComponent({
     *   name: 'foo',
     *   state: { val: 0 }
     * })
     * ecs.addComponent(id, 'foo')
     * ecs.getState(id, 'foo').val // 0
     * ecs.getState(id, 'foo').__id // equals id
     * ```
     */
    getState(entityId, componentName) {
        const data = this.storage[componentName];
        if (!data)
            throw new Error(`Unknown component: ${componentName}.`);
        const state = data.get(entityId);
        return state;
    }
    /**
     * Get an array of state objects for every entity with the given component.
     * Each one will have an `__id` property for the entity id it refers to.
     * Don't add or remove elements from the returned list!
     *
     * @param componentName The name of the component to get the states list from.
     *
     * @example
     * ```js
     * var arr = ecs.getStatesList('foo')
     * // returns something shaped like:
     * //   [ {__id:0, x:1},
     * //     {__id:7, x:2}  ]
     * ```
    */
    getStatesList(componentName) {
        const data = this.storage[componentName];
        if (!data)
            throw new Error(`Unknown component: ${componentName}.`);
        return Array.from(data.values());
    }
    /**
     * Returns a `getState`-like accessor function bound to a given component name.
     * The accessor is much faster than `getState`, so you should create an accessor
     * for any component whose state you'll be accessing a lot.
     * @param componentName The name of the component to create an accessor for.
     * @returns The state accessor function bound to the component's name.
     *
     * @example
     * ```js
     * ecs.createComponent({
     *   name: 'size',
     *   state: { val: 0 }
     * })
     * ecs.addComponent(id, 'size')
     * var getSize = ecs.getStateAccessor('size')
     * getSize(id).val // 0
     * ```
     */
    getStateAccessor(componentName) {
        const data = this.storage[componentName];
        if (!data)
            throw new Error(`Unknown component: ${componentName}.`);
        return function (entityId) {
            const state = data.get(entityId);
            return state;
        };
    }
    /**
     * Returns a `hasComponent`-like accessor function bound to a given component name.
     * The accessor is much faster than `hasComponent`.
     * @param componentName The name of the component to create an accessor for.
     * @returns The component accessor function bound to the component's name.
     *
     * @example
     * ```js
     * ecs.createComponent({
     *  name: 'foo',
     * })
     * ecs.addComponent(id, 'foo')
     * var hasFoo = ecs.getComponentAccessor('foo')
     * hasFoo(id) // true
     * ```
     */
    getComponentAccessor(componentName) {
        const data = this.storage[componentName];
        if (!data)
            throw new Error(`Unknown component: ${componentName}.`);
        return function (entityId) {
            return data.has(entityId);
        };
    }
    // #endregion
    // #region Lifecycle
    /**
     * Tells the ECS that a game tick has occurred, causing component
     * `system` functions to get called.
     *
     * @param dt The timestep to pass to the system functions.
     *
     * If components have an `order` property, they'll get called in that order
     * (lowest to highest). Component order defaults to `99`.
     *
     * @example
     * ```js
     * ecs.createComponent({
     *  name: foo,
     *  order: 1,
     *  system: function(dt, states) {
     *    // states is the same array you'd get from #getStatesList()
     *    states.forEach(state => {
     *      console.log('Entity ID: ', state.__id)
     *    })
     *  }
     * })
     * ecs.tick(30) // triggers log statements
     * ```
     */
    tick(dt) {
        this.runAllDeferredRemovals();
        for (const componentName of this.systems) {
            const list = Array.from(this.storage[componentName].values());
            const component = this.components[componentName];
            if (component.system) {
                component.system(dt, list);
            }
        }
        this.runAllDeferredRemovals();
        return this;
    }
    /**
     * Functions exactly like `tick`, but calls `renderSystem` functions.
     * this effectively gives you a second set of systems that are
     * called with separate timing, in case you want to
     * [tick and render in separate loops](http://gafferongames.com/game-physics/fix-your-timestep/)
     * (which you should!).
     *
     * @param dt The timestep to pass to the system functions.
     *
     * @example
     * ```js
     * ecs.createComponent({
     *  name: foo,
     *  order: 5,
     *  renderSystem: function(dt, states) {
     *    // states is the same array you'd get from #getStatesList()
     *  }
     * })
     * ecs.render(1000/60)
     * ```
     */
    render(dt) {
        this.runAllDeferredRemovals();
        for (const componentName of this.renderSystems) {
            const list = Array.from(this.storage[componentName].values());
            const component = this.components[componentName];
            if (component.renderSystem) {
                component.renderSystem(dt, list);
            }
        }
        this.runAllDeferredRemovals();
        return this;
    }
    // #endregion
    // #region Deferral Management
    /**
     * Debouncer, called whenever a deferral is queued.
     */
    makeDeferralTimeout() {
        if (this.deferralTimeoutPending)
            return;
        this.deferralTimeoutPending = true;
        setTimeout(() => {
            this.deferralTimeoutPending = false;
            this.runAllDeferredRemovals();
        }, 1);
    }
    /**
     * Ping all removal queues.
     * Called before and after tick/render, and after deferrals are queued.
     */
    runAllDeferredRemovals() {
        this.doDeferredComponentRemovals();
        this.doDeferredMultiComponentRemovals();
        this.doDeferredEntityRemovals();
    }
    /**
     * Entity removal, processes the queue of entity IDs.
     */
    doDeferredEntityRemovals() {
        while (this.deferredEntityRemovals.length) {
            const entityId = this.deferredEntityRemovals.pop();
            if (entityId === undefined)
                continue;
            this.deleteEntityNow(entityId);
        }
    }
    /**
     * Component removal, processes a queue of `{ id, compName }`
     */
    doDeferredComponentRemovals() {
        while (this.deferredCompRemovals.length) {
            const removalRequest = this.deferredCompRemovals.pop();
            if (removalRequest === undefined)
                continue;
            this.removeComponentNow(removalRequest.id, removalRequest.compName);
        }
    }
    // multi components - queue of { id, compName, state }
    doDeferredMultiComponentRemovals() {
        while (this.deferredMultiCompRemovals.length) {
            const removalRequest = this.deferredMultiCompRemovals.pop();
            if (removalRequest === undefined)
                continue;
            this.removeMultiComponentNow(removalRequest.id, removalRequest.compName, removalRequest.state);
            // TODO: Why was this here? Is it trying to delete the actual object?
            // removalRequest.state = undefined;
        }
    }
}
exports.default = ECS;