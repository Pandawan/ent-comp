"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
;
var ECS = /** @class */ (function () {
    /**
     * Constructor for a new entity-component-system manager.
     * @example
     * ```js
     * import EntComp from 'ent-comp';
     * const ecs = new EntComp();
     * // Can also use `new EntComp({ defaultOrder: 15});` to set the default component.order value.
     * ```
     */
    function ECS(options) {
        this.components = {};
        this.storage = {};
        this.systems = [];
        this.renderSystems = [];
        this.deferredEntityRemovals = [];
        this.deferredCompRemovals = [];
        this.deferredMultiCompRemovals = [];
        this.deferralTimeoutPending = false;
        this.uid = 1;
        this._defaultOrder = options && options.defaultOrder ? options.defaultOrder : 99;
    }
    Object.defineProperty(ECS.prototype, "comps", {
        /**
         * Alias for `components` property.
         * @deprecated
         */
        get: function () {
            console.error(new Error("Alias \"comps\" is ugly and deprecated. Please use \"components\" instead."));
            return this.components;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECS.prototype, "defaultOrder", {
        // #region Properties
        /**
         * The default `order` value of the components.
         */
        get: function () {
            return this._defaultOrder;
        },
        set: function (value) {
            // Set the value
            this._defaultOrder = value;
            // Sort the systems and renderSystems based on the new defaultOrder value
            if (this.systems) {
                this.sortByOrder(this.systems);
            }
            if (this.renderSystems) {
                this.sortByOrder(this.renderSystems);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sort the given list of component names using their component.order value (or the defaultOrder value).
     * NOTE: This mutates the original array, make a copy of it first if you want it immutable.
     * @param componentNames The list of component names to sort.
     */
    ECS.prototype.sortByOrder = function (componentNames) {
        var _this = this;
        return componentNames.sort(function (a, b) { return (_this.components[a].order || _this.defaultOrder) - (_this.components[b].order || _this.defaultOrder); });
    };
    // #endregion
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
    ECS.prototype.createEntity = function (components) {
        var e_1, _a;
        var id = this.uid++;
        if (components) {
            try {
                for (var components_1 = __values(components), components_1_1 = components_1.next(); !components_1_1.done; components_1_1 = components_1.next()) {
                    var componentName = components_1_1.value;
                    this.addComponent(id, componentName);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (components_1_1 && !components_1_1.done && (_a = components_1.return)) _a.call(components_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return id;
    };
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
    ECS.prototype.deleteEntity = function (entityId, immediately) {
        if (immediately === void 0) { immediately = false; }
        if (immediately) {
            this.deleteEntityNow(entityId);
        }
        else {
            this.deferredEntityRemovals.push(entityId);
            this.makeDeferralTimeout();
        }
        return this;
    };
    /**
     * Delete an entity; simply removing all of its components.
     * @param entityId The id of the entity to delete.
     */
    ECS.prototype.deleteEntityNow = function (entityId) {
        var e_2, _a;
        try {
            for (var _b = __values(Object.entries(this.storage)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), name_1 = _d[0], data = _d[1];
                if (data.has(entityId))
                    this.removeComponentNow(entityId, name_1);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
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
    ECS.prototype.createComponent = function (componentDefinition) {
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
            throw new Error("Component " + name + " already exists.");
        // rebuild definition object for monomorphism
        var internalDef = {
            name: name,
            order: (!componentDefinition.order || isNaN(componentDefinition.order)) ? this.defaultOrder : componentDefinition.order,
            multi: componentDefinition.multi === true,
            state: componentDefinition.state || {},
            onAdd: componentDefinition.onAdd || undefined,
            onRemove: componentDefinition.onRemove || undefined,
            system: componentDefinition.system || undefined,
            renderSystem: componentDefinition.renderSystem || undefined
        };
        this.components[name] = internalDef;
        this.storage[name] = new Map();
        if (internalDef.system) {
            this.systems.push(name);
            this.sortByOrder(this.systems);
        }
        if (internalDef.renderSystem) {
            this.renderSystems.push(name);
            this.sortByOrder(this.renderSystems);
        }
        return name;
    };
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
    ECS.prototype.deleteComponent = function (componentName) {
        var e_3, _a;
        var componentData = this.storage[componentName];
        if (!componentData)
            throw new Error("Unknown component: " + componentName);
        try {
            for (var componentData_1 = __values(componentData), componentData_1_1 = componentData_1.next(); !componentData_1_1.done; componentData_1_1 = componentData_1.next()) {
                var _b = __read(componentData_1_1.value, 2), state = _b[1];
                var id = Array.isArray(state) ? state[0].__id : state.__id;
                this.removeComponent(id, componentName, true);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (componentData_1_1 && !componentData_1_1.done && (_a = componentData_1.return)) _a.call(componentData_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // Remove componentNames from the systems list
        var i = this.systems.indexOf(componentName);
        if (i > -1)
            this.systems.splice(i, 1);
        var j = this.renderSystems.indexOf(componentName);
        if (j > -1)
            this.renderSystems.splice(j, 1);
        delete this.components[componentName];
        delete this.storage[componentName];
        return this;
    };
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
    ECS.prototype.addComponent = function (entityId, componentName, state) {
        var e_4, _a;
        var componentDefinition = this.components[componentName];
        var componentData = this.storage[componentName];
        if (!componentData)
            throw new Error("Unknown component: " + componentName + ".");
        // If the component is pending removal, remove it so it can be readded
        var pendingRemoval = false;
        try {
            for (var _b = __values(this.deferredCompRemovals), _c = _b.next(); !_c.done; _c = _b.next()) {
                var compRemoval = _c.value;
                if (compRemoval.id === entityId && compRemoval.compName === componentName)
                    pendingRemoval = true;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        if (pendingRemoval)
            this.doDeferredComponentRemovals();
        if (componentData.has(entityId) && !componentDefinition.multi)
            throw new Error("Entity " + entityId + " already has component: " + componentName + ".");
        // Create new component state object for this entity
        var newState = Object.assign({}, { __id: entityId }, componentDefinition.state, state);
        // Just in case passed-in state object had an __id property
        newState.__id = entityId;
        // Add to dataStore, for multi components, may already be present
        if (componentDefinition.multi === true) {
            // Create array if doesn't already exist
            if (componentData.has(entityId) === false) {
                componentData.set(entityId, []);
            }
            // Push new state to the array
            componentData.get(entityId).push(newState);
        }
        else {
            // Add to dataStore
            componentData.set(entityId, newState);
        }
        // Call handler and return
        if (componentDefinition.onAdd)
            componentDefinition.onAdd(entityId, newState);
        return this;
    };
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
    ECS.prototype.hasComponent = function (entityId, componentName) {
        var data = this.storage[componentName];
        if (!data)
            throw new Error("Unknown component: " + componentName + ".");
        return (data.get(entityId) !== undefined);
    };
    /**
     * Get all of the components attached to the given entity.
     * @param entityId The entity to get a list of components from.
     *
     * @example
     * ```js
     * ecs.addComponent(id, 'comp-name')
     * ecs.getAllComponents(id) // ['comp-name']
     * ```
     */
    ECS.prototype.getAllComponents = function (entityId) {
        var final = [];
        for (var componentName in this.storage) {
            if (this.storage.hasOwnProperty(componentName)) {
                var states = this.storage[componentName];
                if (states.has(entityId))
                    final.push(componentName);
            }
        }
        return final;
    };
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
    ECS.prototype.removeComponent = function (entityId, componentName, immediately) {
        if (immediately === void 0) { immediately = false; }
        var componentData = this.storage[componentName];
        if (!componentData)
            throw new Error("Unknown component: " + componentName + ".");
        // If component isn't present, throw 
        if (!componentData.has(entityId)) {
            // TODO: Original ent-comp fails silently for multi component, why?
            throw new Error("Entity " + entityId + " does not have component: " + componentName + " to remove.");
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
    };
    /**
     * Actually remove a component from the given entity.
     * @param entityId The id of the entity to remove the component from.
     * @param componentName The name of the component to remove.
     */
    ECS.prototype.removeComponentNow = function (entityId, componentName) {
        var e_5, _a;
        var componentDefinition = this.components[componentName];
        var componentData = this.storage[componentName];
        if (!componentData)
            return;
        if (!componentData.has(entityId))
            return; // probably got removed twice during deferral
        // Call onRemove handler
        var states = componentData.get(entityId);
        if (states !== undefined && componentDefinition.onRemove) {
            if (componentDefinition.multi && Array.isArray(states)) {
                try {
                    for (var states_1 = __values(states), states_1_1 = states_1.next(); !states_1_1.done; states_1_1 = states_1.next()) {
                        var state = states_1_1.value;
                        componentDefinition.onRemove(entityId, state);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (states_1_1 && !states_1_1.done && (_a = states_1.return)) _a.call(states_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
            else {
                componentDefinition.onRemove(entityId, states);
            }
        }
        // If multi, kill the states array to hopefully free the objects
        if (componentDefinition.multi && Array.isArray(states)) {
            states.length = 0;
        }
        // Actual removal from data store
        componentData.delete(entityId);
    };
    /**
       * Removes a particular state instance of a multi-component.
       * NOTE: This will splice an element out of the multi-component array,
     * changing the indexes of subsequent elements.
     * @param entityId The id of the entity to remove from.
     * @param componentName The name of the component to remove.
     * @param index The index of the state to remove.
     * @param immediately Force immediate removal (instead of deferred).
       *
     * @example
       * ```js
       * ecs.getState(id, 'foo')   // [ state1, state2, state3 ]
       * ecs.removeMultiComponent(id, 'foo', 1, true)  // true means: immediately
       * ecs.getState(id, 'foo')   // [ state1, state3 ]
       * ```
       */
    ECS.prototype.removeMultiComponent = function (entityId, componentName, index, immediately) {
        if (immediately === void 0) { immediately = false; }
        var componentDefinition = this.components[componentName];
        var componentData = this.storage[componentName];
        if (!componentData)
            throw new Error("Unknown component: " + componentName + ".");
        if (!componentDefinition.multi)
            throw new Error("removeMultiComponent called on non-multi component");
        var statesArray = componentData.get(entityId);
        // If component isn't present, or multicomp isn't present at index, throw 
        if (statesArray === undefined || statesArray[index] === undefined) {
            throw new Error("Entity " + entityId + " does not have multi-component " + componentName + " at index " + index + " to remove.");
        }
        var stateToRemove = statesArray[index];
        // Defer or remove
        if (immediately) {
            this.removeMultiComponentNow(entityId, componentName, stateToRemove);
        }
        else {
            this.deferredMultiCompRemovals.push({
                id: entityId,
                compName: componentName,
                state: stateToRemove
            });
            this.makeDeferralTimeout();
        }
        return this;
    };
    /**
     * Actually remove one state from a multi component from the given entity.
     * @param entityId The id of the entity to remove the component from.
     * @param componentName The name of the component to remove.
     * @param stateToRemove The state object to remove
     */
    ECS.prototype.removeMultiComponentNow = function (entityId, componentName, stateToRemove) {
        var componentDefinition = this.components[componentName];
        var componentData = this.storage[componentName];
        if (!componentData)
            return;
        if (!componentData.has(entityId))
            return; // probably got removed twice during deferral
        var statesArray = componentData.get(entityId);
        var index = statesArray.indexOf(stateToRemove);
        if (index < 0)
            return; // State obj not found in list
        if (componentDefinition.onRemove) {
            componentDefinition.onRemove(entityId, stateToRemove);
        }
        statesArray.splice(index, 1); // Remove object from array
        // If this leaves the states list empty, remove the whole component
        if (statesArray.length === 0) {
            this.removeComponentNow(entityId, componentName);
        }
    };
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
    ECS.prototype.getState = function (entityId, componentName) {
        var data = this.storage[componentName];
        if (!data)
            throw new Error("Unknown component: " + componentName + ".");
        return data.get(entityId);
    };
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
    ECS.prototype.getStatesList = function (componentName) {
        var data = this.storage[componentName];
        if (!data)
            throw new Error("Unknown component: " + componentName + ".");
        return Array.from(data.values());
    };
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
    // TODO: Find a way to infer type maybe? Kind of complex since typing is at compile time.
    ECS.prototype.getStateAccessor = function (componentName) {
        var data = this.storage[componentName];
        if (!data)
            throw new Error("Unknown component: " + componentName + ".");
        return function (entityId) {
            return data.get(entityId);
        };
    };
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
    ECS.prototype.getComponentAccessor = function (componentName) {
        var data = this.storage[componentName];
        if (!data)
            throw new Error("Unknown component: " + componentName + ".");
        return function (entityId) {
            return data.has(entityId);
        };
    };
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
    ECS.prototype.tick = function (dt) {
        var e_6, _a;
        this.runAllDeferredRemovals();
        try {
            for (var _b = __values(this.systems), _c = _b.next(); !_c.done; _c = _b.next()) {
                var componentName = _c.value;
                var list = Array.from(this.storage[componentName].values());
                var component = this.components[componentName];
                if (component.system) {
                    component.system(dt, list);
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        this.runAllDeferredRemovals();
        return this;
    };
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
    ECS.prototype.render = function (dt) {
        var e_7, _a;
        this.runAllDeferredRemovals();
        try {
            for (var _b = __values(this.renderSystems), _c = _b.next(); !_c.done; _c = _b.next()) {
                var componentName = _c.value;
                var list = Array.from(this.storage[componentName].values());
                var component = this.components[componentName];
                if (component.renderSystem) {
                    component.renderSystem(dt, list);
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        this.runAllDeferredRemovals();
        return this;
    };
    // #endregion
    // #region Deferral Management
    /**
     * Debouncer, called whenever a deferral is queued.
     */
    ECS.prototype.makeDeferralTimeout = function () {
        var _this = this;
        if (this.deferralTimeoutPending)
            return;
        this.deferralTimeoutPending = true;
        setTimeout(function () {
            _this.deferralTimeoutPending = false;
            _this.runAllDeferredRemovals();
        }, 1);
    };
    /**
     * Ping all removal queues.
     * Called before and after tick/render, and after deferrals are queued.
     */
    ECS.prototype.runAllDeferredRemovals = function () {
        this.doDeferredComponentRemovals();
        this.doDeferredMultiComponentRemovals();
        this.doDeferredEntityRemovals();
    };
    /**
     * Entity removal, processes the queue of entity IDs.
     */
    ECS.prototype.doDeferredEntityRemovals = function () {
        while (this.deferredEntityRemovals.length) {
            var entityId = this.deferredEntityRemovals.pop();
            if (entityId === undefined)
                continue;
            this.deleteEntityNow(entityId);
        }
    };
    /**
     * Component removal, processes a queue of `{ id, compName }`
     */
    ECS.prototype.doDeferredComponentRemovals = function () {
        while (this.deferredCompRemovals.length) {
            var removalRequest = this.deferredCompRemovals.pop();
            if (removalRequest === undefined)
                continue;
            this.removeComponentNow(removalRequest.id, removalRequest.compName);
        }
    };
    /**
     * Multi Component removal, processes a queue of `{ id, compName, state }`
     */
    ECS.prototype.doDeferredMultiComponentRemovals = function () {
        while (this.deferredCompRemovals.length) {
            var removalRequest = this.deferredMultiCompRemovals.pop();
            if (removalRequest === undefined)
                continue;
            if (removalRequest.state) {
                this.removeMultiComponentNow(removalRequest.id, removalRequest.compName, removalRequest.state);
            }
            removalRequest.state = undefined;
        }
    };
    return ECS;
}());
exports.default = ECS;
