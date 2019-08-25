// TODO: Try to remove all <any>

/**
 * Component Definition
 */
export interface Component {
  /**
   * Name of the component
   */
  name: string;
  /**
   * Order to execute the components in
   */
  order?: number;
  /**
   * Whether or not an entity can have multiple instances of this component at once
   */
  multi?: boolean;
  /**
   * Default state of the component
   */
  state?: any;
  /**
   * Called when the component is added to an entity.
   * @param id The entity's ID.
   * @param state The components's new state.
   */
  onAdd?: (id: number, state: StateWithID) => void;

  /**
   * Called when the component is removed from an entity.
   * @param id The entity's ID.
   * @param state The components's current state.
   */
  onRemove?: (id: number, state: StateWithID) => void;

  /**
   * Called every tick to process that component.
   * @param dt Length of one tick in ms.
   * @param states Array of all states of this component type.
   */
  system?: (dt: number, states: Array<StateWithID | StateWithID[]>) => void;

  /**
   * Called every tick to render that component.
   * @param dt Length of one render tick in ms.
   * @param states Array of all states of this component type.
   */
  renderSystem?: (dt: number, states: Array<StateWithID | StateWithID[]>) => void;
}

/**
 * Component state object with an __id referring to the entity that owns it.
 */
// TODO: Add generic T support so Components can know what their types are
export interface StateWithID {
  /**
   * The id of the entity this state refers to
   */
  __id: number;
  [key: string]: any;
};

/**
 * A `getState`-like accessor function bound to a given component name.
 * @param entID The id of the entity to get from.
 * @returns The state of that entity's component.
 */
export type StateAccessor = (entID: number) => StateWithID | StateWithID[] | undefined;

/**
 * A `hasComponent`-like accessor function bound to a given component name.
 * @param entID the id of the entity to get from.
 * @returns True if that entity has that component.
 */
export type ComponentAccessor = (entID: number) => boolean;

/**
 * Object that represents a ComponentRemoval request which has been deferred.
 */
interface ComponentRemovalRequest {
  /**
   * The id of the entity to remove the component from.
   */
  id: number;
  /**
   * The name of the component to remove.
   */
  compName: string;
}

/**
 * Object that represents a MultiComponentRemoval request which has been deferred.
 */
interface MultiComponentRemovalRequest {
  /**
   * The id of the entity to remove the component from.
   */
  id: number;
  /**
   * The name of the component to remove.
   */
  compName: string;
  /**
   * The specific state to remove from the list.
   */
  state: StateWithID;
}

export default class ECS {
  /**
   * Map of component definitions
   *
   * @example
   * ```js
   * var comp = { name: 'foo' }
   * ecs.createComponent(comp)
   * ecs.components['foo'] === comp // true
   * ```
   */
  public components: { [name: string]: Component };

  public get comps (): { [name: string]: Component } {
    console.error(new Error(`Alias "comps" is ugly and deprecated. Please use "components" instead.`));
    return this.components;
  }

  /**
   * Storage for the component states
   */
  private storage: { [component: string]: Map<number, StateWithID | StateWithID[]> };

  /**
   * List of all systems, sorted by execution order
   */
  private systems: string[];

  /**
   * List of all renderSystems, sorted by execution order
   */
  private renderSystems: string[];

  /**
   * List of all entityIds waiting to be removed.
   */
  private deferredEntityRemovals: number[];

  /**
   * List of all single-components waiting to be removed.
   */
  private deferredCompRemovals: ComponentRemovalRequest[];

  /**
   * List of all multi-components waiting to be removed.
   */
  private deferredMultiCompRemovals: MultiComponentRemovalRequest[];

  /**
   * Whether or not a deferral is currently pending.
   */
  private deferralTimeoutPending: boolean;

  /**
   * Counter for entity IDs
   */
  private uid: number;

  /**
   * Default order to use if none specified
   */
  private defaultOrder: number;

  /**
   * Constructor for a new entity-component-system manager.
   * @example
   * ```js
   * // You might have to import the file directly rather than ent-comp
   * import EntComp from 'ent-comp';
   * const ecs = new EntComp();
   * ```
   */
  public constructor () {
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
  public createEntity (components?: string[]): number {
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
  public deleteEntity (entityId: number, immediately: boolean = false): ECS {
    if (immediately) {
      this.deleteEntityNow(entityId);
    } else {
      this.deferredEntityRemovals.push(entityId);
      this.makeDeferralTimeout();
    }
    return this;
  }

  /**
   * Delete an entity; simply removing all of its components.
   * @param entityId The id of the entity to delete.
   */
  private deleteEntityNow (entityId: number): void {
    for (const [name, data] of Object.entries(this.storage)) {
      if (data.has(entityId)) this.removeComponentNow(entityId, name);
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
  public createComponent (componentDefinition: Component): string {
    if (!componentDefinition) throw new Error('Missing component definition');
    var name = componentDefinition.name;
    if (!name) throw new Error('Component definition must have a name property.');
    if (typeof name !== 'string') throw new Error('Component name must be a string.');
    if (name === '') throw new Error('Component name must be a non-empty string.');
    if (this.storage[name]) throw new Error(`Component ${name} already exists.`);

    // rebuild definition object for monomorphism
    const internalDef: Component = {
      name,
      order: (!componentDefinition.order || isNaN(componentDefinition.order)) ? this.defaultOrder : componentDefinition.order,
      state: componentDefinition.state || {} as any,
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
  public deleteComponent (componentName: string): ECS {
    const componentData = this.storage[componentName];
    if (!componentData) throw new Error(`Unknown component: ${componentName}`);

    for (const [, state] of componentData) {
      const id = Array.isArray(state) ? state[0].__id : state.__id;
      this.removeComponent(id, componentName, true);
    }

    // Remove componentNames from the systems list
    const i = this.systems.indexOf(componentName);
    if (i > -1) this.systems.splice(i, 1);
    const j = this.renderSystems.indexOf(componentName);
    if (j > -1) this.renderSystems.splice(j, 1);

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
  public addComponent (entityId: number, componentName: string, state?: any): ECS {
    const componentDefinition = this.components[componentName];
    const componentData = this.storage[componentName];
    if (!componentData) throw new Error(`Unknown component: ${componentName}.`);

    // If the component is pending removal, remove it so it can be readded
    let pendingRemoval = false;
    for (const compRemoval of this.deferredCompRemovals) {
      if (compRemoval.id === entityId && compRemoval.compName === componentName) pendingRemoval = true;
    }
    if (pendingRemoval) this.doDeferredComponentRemovals();

    if (componentData.has(entityId) && !componentDefinition.multi) throw new Error(`Entity ${entityId} already has component: ${componentName}.`);

    // Create new component state object for this entity
    const newState: StateWithID = Object.assign({}, { __id: entityId }, componentDefinition.state, state);

    // Just in case passed-in state object had an __id property
    newState.__id = entityId;

    // Add to dataStore - for multi components, may already be present
    if (componentDefinition.multi) {
      let statesArr = componentData.get(entityId) as StateWithID[];
      if (!statesArr) {
        statesArr = [];
        componentData.set(entityId, statesArr);
      }
      statesArr.push(newState);
    } else {
      componentData.set(entityId, newState);
    }

    // Call handler and return
    if (componentDefinition.onAdd) componentDefinition.onAdd(entityId, newState);

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
  public hasComponent (entityId: number, componentName: string): boolean {
    const data = this.storage[componentName];
    if (!data) throw new Error(`Unknown component: ${componentName}.`);
    return (data.get(entityId) !== undefined);
  }

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
  public getAllComponents(entityId: number): string[] {
    const final = [];
    for (const componentName in this.storage) {
      if (this.storage.hasOwnProperty(componentName)) {
        const states = this.storage[componentName];
        
        if (states.has(entityId)) final.push(componentName);
      }
    }
    return final;
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
  public removeComponent (entityId: number, componentName: string, immediately: boolean = false): ECS {
    var componentDefinition = this.components[componentName];
    var componentData = this.storage[componentName];
    if (!componentData) throw new Error(`Unknown component: ${componentName}.`);

    // If component isn't present, fail silently for multi or throw otherwise
    if (!componentData.has(entityId)) {
      if (componentDefinition.multi) return this;
      else throw new Error(`Entity ${entityId} does not have component: ${componentName} to remove.`);
    }

    // Defer or remove
    if (immediately) {
      this.removeComponentNow(entityId, componentName);
    } else {
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
  private removeComponentNow (entityId: number, componentName: string): void {
    const componentDefinition = this.components[componentName];
    const componentData = this.storage[componentName];
    if (!componentData) return;
    if (!componentData.has(entityId)) return; // probably got removed twice during deferral

    // Call onRemove handler - on each instance for multi components
    const states = componentData.get(entityId);
    if (componentDefinition.onRemove && states) {
      if (componentDefinition.multi && Array.isArray(states)) {
        for (const state of states) {
          componentDefinition.onRemove(entityId, state);
        }
      } else {
        if (Array.isArray(states)) throw new Error(`Found multiple states on non-multi component: ${componentName}`);
        componentDefinition.onRemove(entityId, states);
      }
    }

    // If multi, kill the states array to hopefully free the objects
    if (componentDefinition.multi && Array.isArray(states)) states.length = 0;

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
  public removeMultiComponent (entityId: number, componentName: string, index: number, immediately: boolean = false): ECS {
    const componentDefinition = this.components[componentName];
    const componentData = this.storage[componentName];
    if (!componentData) throw new Error(`Unknown component: ${componentName}.`);
    if (!componentDefinition.multi) throw new Error('removeMultiComponent called on non-multi component');

    // throw if comp isn't present, or multicomp isn't present at index
    const statesArr = componentData.get(entityId);
    if (!statesArr || !Array.isArray(statesArr) || !statesArr[index]) {
      throw new Error(`Multicomponent ${componentName} instance not found at index ${index}`);
    }

    // index removals by object, in case indexes change later
    const stateToRemove = statesArr[index];
    if (immediately) {
      this.removeMultiComponentNow(entityId, componentName, stateToRemove);
    } else {
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
  private removeMultiComponentNow (entityId: number, componentName: string, stateObject: StateWithID): void {
    const componentDefinition = this.components[componentName];
    const componentData = this.storage[componentName];
    if (!componentData) throw new Error(`Unknown component: ${componentName}.`);

    const statesArr = componentData.get(entityId);
    if (!statesArr) return;

    const index = statesArr.indexOf(stateObject);
    if (index < 0) return;
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
  public getState (entityId: number, componentName: string): StateWithID | StateWithID[] | undefined {
    const data = this.storage[componentName];
    if (!data) throw new Error(`Unknown component: ${componentName}.`);

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
  public getStatesList (componentName: string): Array<StateWithID | StateWithID[]> {
    const data = this.storage[componentName];
    if (!data) throw new Error(`Unknown component: ${componentName}.`);
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
  public getStateAccessor (componentName: string): StateAccessor {
    const data = this.storage[componentName];
    if (!data) throw new Error(`Unknown component: ${componentName}.`);
    return function (entityId: number) {
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
  public getComponentAccessor (componentName: string): ComponentAccessor {
    const data = this.storage[componentName];
    if (!data) throw new Error(`Unknown component: ${componentName}.`);
    return function (entityId: number) {
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
  public tick (dt: number): ECS {
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
  public render (dt: number): ECS {
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
  private makeDeferralTimeout (): void {
    if (this.deferralTimeoutPending) return;
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
  private runAllDeferredRemovals (): void {
    this.doDeferredComponentRemovals();
    this.doDeferredMultiComponentRemovals();
    this.doDeferredEntityRemovals();
  }

  /**
   * Entity removal, processes the queue of entity IDs.
   */
  private doDeferredEntityRemovals (): void {
    while (this.deferredEntityRemovals.length) {
      const entityId = this.deferredEntityRemovals.pop();
      if (entityId === undefined) continue;
      this.deleteEntityNow(entityId);
    }
  }

  /**
   * Component removal, processes a queue of `{ id, compName }`
   */
  private doDeferredComponentRemovals (): void {
    while (this.deferredCompRemovals.length) {
      const removalRequest = this.deferredCompRemovals.pop();
      if (removalRequest === undefined) continue;
      this.removeComponentNow(removalRequest.id, removalRequest.compName);
    }
  }

  // multi components - queue of { id, compName, state }
  private doDeferredMultiComponentRemovals (): void {
    while (this.deferredMultiCompRemovals.length) {
      const removalRequest = this.deferredMultiCompRemovals.pop();
      if (removalRequest === undefined) continue;
      this.removeMultiComponentNow(removalRequest.id, removalRequest.compName, removalRequest.state);
      // TODO: Why was this here? Is it trying to delete the actual object?
      // removalRequest.state = undefined;
    }
  }

  // #endregion
}
