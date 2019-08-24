'use strict';

var ECS = require('../dist/ECS').default;
var tape = require('tape');

tape('Creating and deleting components', function (t) {
  var comp = { name: 'foo' };
  var ecs = new ECS();

  t.throws(function () { ecs.createComponent(); });
  t.throws(function () { ecs.createComponent({}); });
  t.throws(function () { ecs.deleteComponent(); });
  t.throws(function () { ecs.deleteComponent('foo'); });
  t.throws(function () { ecs.createComponent({ name: null }); }, 'Bad component names');
  t.throws(function () { ecs.createComponent({ name: '' }); });
  t.throws(function () { ecs.createComponent({ name: 5 }); });
  t.throws(function () { ecs.createComponent({ name: true }); });
  t.throws(function () { ecs.createComponent({ name: {} }); });

  var result;
  t.doesNotThrow(function () {
    result = ecs.createComponent(comp);
  }, 'createComponent');
  t.equals(result, comp.name, 'createComponent returns name');

  t.ok(ecs.components[comp.name], 'component exists');
  t.ok(ecs.comps[comp.name], 'comps alias works');
  t.equals(comp.name, ecs.components[comp.name].name);
  t.equals(comp.name, ecs.comps[comp.name].name);

  t.throws(function () {
    ecs.deleteComponent(comp);
  }, 'cannot delete by object');

  t.doesNotThrow(function () {
    ecs.deleteComponent(comp.name);
  }, 'deleteComponent by name');

  t.notOk(ecs.comps[comp.name], 'component deleted');

  t.end();
});

tape('Adding and removing components', function (t) {
  var comp = { name: 'foo' };
  var ecs = new ECS();
  ecs.createComponent(comp);

  t.throws(function () { ecs.addComponent(); });
  t.throws(function () { ecs.addComponent(37); });
  t.throws(function () { ecs.addComponent(37, 'bar'); });

  var id = ecs.createEntity();
  t.doesNotThrow(function () { ecs.addComponent(id, comp.name); }, 'add component');
  t.throws(function () { ecs.addComponent(id, comp.name); }, 'add component twice');

  t.throws(function () { ecs.hasComponent(id); });
  t.throws(function () { ecs.hasComponent(id, 'bar'); });
  t.ok(ecs.hasComponent(id, comp.name), 'entity has component');

  t.throws(function () { ecs.removeComponent(); });
  t.throws(function () { ecs.removeComponent(id); });
  t.throws(function () { ecs.removeComponent(id, 'bar'); });

  var id2 = ecs.createEntity();
  t.doesNotThrow(function () { ecs.addComponent(id2, comp.name, { foo: 1 }); }, 'add component with state');
  t.ok(ecs.hasComponent(id2, comp.name));

  t.doesNotThrow(function () { ecs.removeComponent(id2, comp.name); }, 'remove component, deferred');
  t.true(ecs.hasComponent(id2, comp.name), 'entity still has component');
  t.doesNotThrow(function () { ecs.removeComponent(id2, comp.name); }, 'remove component twice ok - deferred');
  t.doesNotThrow(function () { ecs.tick(); }, 'tick while removal is pending');
  t.throws(function () { ecs.removeComponent(id2, comp.name); }, 'remove already removed component');
  t.false(ecs.hasComponent(id2, comp.name), 'entity no longer has component');

  t.doesNotThrow(function () { ecs.addComponent(id2, comp.name, { foo: 1 }); }, 're-add component');
  t.ok(ecs.hasComponent(id2, comp.name));
  t.doesNotThrow(function () { ecs.removeComponent(id2, comp.name, true); }, 'remove component immediately');
  t.false(ecs.hasComponent(id2, comp.name), 'entity no longer has component');

  var id3;
  t.doesNotThrow(function () { id3 = ecs.createEntity([comp.name]); });
  t.ok(ecs.hasComponent(id3, comp.name), 'component added at entity creation');

  t.doesNotThrow(function () { ecs.deleteEntity(id3, true); });
  t.false(ecs.hasComponent(id3, comp.name), 'component removed when entity deleted');

  t.end();
});

tape('Nontrivial add/remove sequence', function (t) {
  var comp = {
    name: 'foo',
    state: { num: -1 }
  };
  var ecs = new ECS();
  ecs.createComponent(comp);
  var ids = [];
  for (var i = 0; i < 5; i++) ids.push(ecs.createEntity());
  function getState () {
    var s = '';
    for (var i = 0; i < 5; i++) {
      if (ecs.hasComponent(ids[i], comp.name)) {
        s += ecs.getState(ids[i], comp.name).num;
      } else {
        s += '-';
      }
    }
    return s;
  }

  t.equals('-----', getState());
  ecs.addComponent(ids[1], comp.name, { num: 1 });
  ecs.addComponent(ids[2], comp.name, { num: 2 });
  ecs.addComponent(ids[3], comp.name, { num: 3 });
  t.equals('-123-', getState());
  ecs.removeComponent(ids[3], comp.name, true);
  ecs.addComponent(ids[4], comp.name, { num: 4 });
  ecs.removeComponent(ids[1], comp.name, true);
  ecs.addComponent(ids[0], comp.name, { num: 0 });
  t.equals('0-2-4', getState());
  ecs.addComponent(ids[3], comp.name, { num: 3 });
  ecs.removeComponent(ids[4], comp.name, true);
  ecs.addComponent(ids[1], comp.name, { num: 1 });
  ecs.removeComponent(ids[0], comp.name, true);
  t.equals('-123-', getState());

  t.end();
});

tape('remove component deferral behavior', function (t) {
  var comp = { name: 'foo' };
  var ecs = new ECS();
  ecs.createComponent(comp);

  var id = ecs.createEntity();
  ecs.addComponent(id, comp.name);

  t.throws(function () { ecs.removeComponent(); });
  t.throws(function () { ecs.removeComponent(id); });
  t.throws(function () { ecs.removeComponent(id, 'bar'); });

  t.doesNotThrow(function () { ecs.removeComponent(id, comp.name); }, 'call removeComponent');
  t.ok(ecs.hasComponent(id, comp.name), 'entity still has component');

  t.doesNotThrow(function () { ecs.tick(); }, 'call tick');
  t.false(ecs.hasComponent(id, comp.name), 'entity no longer has component');

  ecs.addComponent(id, comp.name);
  ecs.removeComponent(id, comp.name);
  t.ok(ecs.hasComponent(id, comp.name), 'entity still has component');

  t.doesNotThrow(function () { ecs.render(); }, 'call render');
  t.false(ecs.hasComponent(id, comp.name), 'entity no longer has component');

  // removeLater should not remove during a system, but do so afterwards
  var comp2 = {
    name: 'foo2',
    state: {
      removeA: false,
      removeB: false
    },
    system: function (dt, states) {
      for (var i = 0; i < states.length; ++i) {
        var id = states[i].__id;
        if (states[i].removeA) {
          ecs.removeComponent(id, comp2.name);
        }
        t.ok(ecs.hasComponent(id, comp2.name), 'component still there during system');
      }
    },
    renderSystem: function (dt, states) {
      for (var i = 0; i < states.length; ++i) {
        var id = states[i].__id;
        if (states[i].removeB) {
          ecs.removeComponent(id, comp2.name);
        }
        t.ok(ecs.hasComponent(id, comp2.name), 'component still there during system');
      }
    }
  };
  ecs.createComponent(comp2);
  var id2 = ecs.createEntity();
  var id3 = ecs.createEntity();
  var id4 = ecs.createEntity();
  var id5 = ecs.createEntity();
  ecs.addComponent(id2, comp2.name);
  ecs.addComponent(id3, comp2.name, { removeA: true });
  ecs.addComponent(id4, comp2.name, { removeB: true });
  ecs.addComponent(id5, comp2.name);

  t.ok(ecs.hasComponent(id3, comp2.name), 'later: okay before tick');
  t.ok(ecs.hasComponent(id4, comp2.name), 'later: okay before tick');
  ecs.tick();
  t.false(ecs.hasComponent(id3, comp2.name), 'later: component removed after tick');
  t.ok(ecs.hasComponent(id4, comp2.name), 'later: component not removed after tick');
  ecs.render();
  t.false(ecs.hasComponent(id4, comp2.name), 'later: component removed after render');

  t.ok(ecs.hasComponent(id2, comp2.name), 'later: other component not removed');
  t.ok(ecs.hasComponent(id5, comp2.name), 'later: other component not removed');

  t.end();
});

tape('remove component later edge case', function (t) {
  var comp = { name: 'foo' };
  var ecs = new ECS();
  ecs.createComponent(comp);

  var id = ecs.createEntity();
  ecs.addComponent(id, comp.name);

  // immediate removal should work, even if comp is flagged for later removal
  t.doesNotThrow(function () { ecs.removeComponent(id, comp.name); }, 'queue comp for later removal');
  t.doesNotThrow(function () { ecs.removeComponent(id, comp.name, true); }, 'remove comp immediately');
  t.false(ecs.hasComponent(id, comp.name), 'component is now removed');
  t.doesNotThrow(function () { ecs.tick(); }, 'call tick');
  t.false(ecs.hasComponent(id, comp.name), 'entity still has no component');

  // removing and re-adding a comp flagged for later removal should mean it stays added
  var id2 = ecs.createEntity();
  ecs.addComponent(id2, comp.name);
  t.doesNotThrow(function () { ecs.removeComponent(id2, comp.name); }, 'queue comp for later removal');
  t.doesNotThrow(function () { ecs.removeComponent(id2, comp.name, true); }, 'remove comp immediately');
  t.doesNotThrow(function () { ecs.addComponent(id2, comp.name); }, 're-add component while flagged');
  t.ok(ecs.hasComponent(id2, comp.name), 'component is re-added');
  t.doesNotThrow(function () { ecs.tick(); }, 'call tick');
  t.ok(ecs.hasComponent(id2, comp.name), 'component remains re-added');

  t.end();
});

tape('Component state data', function (t) {
  var comp = {
    name: 'foo',
    state: {
      num: 1,
      str: 'hoge',
      arr: [1, 2, 3],
      fcn: function () { },
      obj: {
        num: 2
      }
    }
  };
  var ecs = new ECS();
  ecs.createComponent(comp);
  var id = ecs.createEntity();
  ecs.addComponent(id, comp.name);

  t.throws(function () { ecs.getState(); });
  t.throws(function () { ecs.getState(id + 37); });
  var state;
  t.doesNotThrow(function () { state = ecs.getState(id + 37, comp.name); }, 'getState is okay with bad entity');
  t.equals(state, undefined, 'getState with bad entity is undefined');

  t.doesNotThrow(function () { state = ecs.getState(id, comp.name); }, 'getState');
  t.ok(state, 'state returned');
  t.equals(state.num, comp.state.num, 'state property num');
  t.equals(state.str, comp.state.str, 'state property str');
  t.equals(state.arr, comp.state.arr, 'state property arr');
  t.equals(state.fcn, comp.state.fcn, 'state property fcn');
  t.equals(state.obj.num, comp.state.obj.num, 'state deep property');
  t.equals(state.__id, id, '__id property inserted');
  state.num = 37;
  t.equals(ecs.getState(id, comp.name).num, 37, 'state is remembered');
  t.equals(comp.state.num, 1, 'definition state not overwritten');

  ecs.removeComponent(id, comp.name, true);
  t.equals(ecs.getState(id, comp.name), undefined, 'getState undefined after removing component');

  // passing in initial state
  var id2 = ecs.createEntity();
  ecs.addComponent(id2, comp.name, {
    num: 4,
    newnum: 5,
    obj: {
      num: 6
    }
  });
  var state2 = ecs.getState(id2, comp.name);
  t.equals(state2.num, 4, 'overwritten property');
  t.equals(state2.newnum, 5, 'overwritten new property');
  t.equals(state2.obj.num, 6, 'overwritten deep property');

  t.end();
});

tape('Component states list', function (t) {
  var ecs = new ECS();
  t.throws(function () { ecs.getStatesList(); }, 'bad getStatesList');
  t.throws(function () { ecs.getStatesList('foo'); }, 'bad getStatesList');

  var comp = {
    name: 'foo',
    state: { num: 23 }
  };
  ecs.createComponent(comp);
  var arr;
  t.doesNotThrow(function () { arr = ecs.getStatesList(comp.name); }, 'getStatesList without entities');
  t.ok(arr, 'getStatesList result');
  t.equals(arr.length, 0, 'getStatesList zero entities');

  var id = ecs.createEntity();
  ecs.addComponent(id, comp.name);
  t.doesNotThrow(function () { arr = ecs.getStatesList(comp.name); }, 'getStatesList with entities');
  t.ok(arr, 'getStatesList result');
  t.equals(arr.length, 1, 'getStatesList entities');
  t.equals(arr[0].num, 23, 'getStatesList state data');

  t.end();
});

tape('Component state accessor', function (t) {
  var ecs = new ECS();
  t.throws(function () { ecs.getStateAccessor(); }, 'bad state accessor name');
  t.throws(function () { ecs.getStateAccessor('foo'); }, 'bad accessor name');

  var comp = {
    name: 'foo',
    state: { num: 23 }
  };
  ecs.createComponent(comp);
  var accessor;
  t.doesNotThrow(function () { accessor = ecs.getStateAccessor(comp.name); }, 'create accessor');
  var state;
  t.doesNotThrow(function () { state = accessor(); }, 'accessor with bad entity');
  t.equals(state, undefined, 'bad entity returns undefined state');
  t.doesNotThrow(function () { state = accessor(123); }, 'accessor with bad entity');
  t.equals(state, undefined, 'bad entity returns undefined state');

  var id = ecs.createEntity();
  ecs.addComponent(id, comp.name);
  t.doesNotThrow(function () { state = accessor(id); }, 'accessor with correct entity');
  t.ok(state, 'state object from accessor');
  t.equals(state.num, 23, 'state property from accessor');

  t.end();
});

tape('hasComponent accessor', function (t) {
  var ecs = new ECS();
  t.throws(function () { ecs.getComponentAccessor(); }, 'bad Comp accessor name');
  t.throws(function () { ecs.getComponentAccessor('foo'); }, 'bad accessor name');

  var comp = { name: 'foo' };
  ecs.createComponent(comp);
  var accessor;
  t.doesNotThrow(function () { accessor = ecs.getComponentAccessor(comp.name); }, 'create Has accessor');
  var has;
  t.doesNotThrow(function () { has = accessor(); }, 'accessor with no entity');
  t.equals(has, false, 'has == false for bad identity');
  t.doesNotThrow(function () { has = accessor(123); }, 'accessor with bad entity');
  t.equals(has, false, 'has == false for bad identity');

  var id = ecs.createEntity();
  ecs.addComponent(id, comp.name);
  t.doesNotThrow(function () { has = accessor(id); }, 'accessor with real entity');
  t.ok(has, 'correct result from accessor');

  t.end();
});

tape('Complex state objects', function (t) {
  var ecs = new ECS();

  var comp = {
    name: 'foo',
    state: {
      primitive: 1,
      obj: {}
    }
  };
  ecs.createComponent(comp);

  var id1 = ecs.createEntity([comp.name]);
  var id2 = ecs.createEntity([comp.name]);
  var state1 = ecs.getState(id1, comp.name);
  var state2 = ecs.getState(id2, comp.name);
  state2.primitive = 2;

  t.notEquals(state1.primitive, state2.primitive, 'State properties - primitives');
  t.equals(state1.obj, state2.obj, 'State properties - objects');
  state1.obj.foo = 1;
  t.equals(state2.obj.foo, 1); // !!!

  t.end();
});

tape('State param has __id property', function (t) {
  var ecs = new ECS();

  var comp = {
    name: 'foo',
    state: {}
  };
  ecs.createComponent(comp);

  var id = ecs.createEntity();
  ecs.addComponent(id, comp.name, { __id: 6666 });
  var state = ecs.getState(id, comp.name);

  t.equals(state.__id, id, 'State has correct __id');
  t.notEquals(state.__id, 6666, 'State throws away passed in __id');

  t.end();
});
