'use strict';

var ECS = require('../dist/ECS').default;
var tape = require('tape');

tape('Multi component basics', function (t) {
  var ecs = new ECS();
  var id = ecs.createEntity();
  var normal = { name: 'normal' };
  var multi = { name: 'multi', multi: true };
  ecs.createComponent(normal);

  t.doesNotThrow(function () { ecs.createComponent(multi); }, 'create multi component');

  t.throws(function () { ecs.createComponent({ name: 'multi' }); }, 'overlapping multi/normal comps');
  t.throws(function () { ecs.createComponent({ name: 'normal', multi: true }); }, 'overlapping multi/normal comps');

  t.doesNotThrow(function () { ecs.removeComponent(id, multi.name); }, 'remove non-present multi comp');

  t.end();
});

tape('Multi component adding / removing', function (t) {
  var ecs = new ECS();
  var id = ecs.createEntity();
  var comp = {
    name: 'multi-component',
    state: { value: 37 },
    multi: true
  };
  ecs.createComponent(comp);

  var result;
  t.doesNotThrow(function () { result = ecs.getState(id, comp.name); }, 'getState on empty multi comp');
  t.ok(!result, 'getState returned falsey');

  t.doesNotThrow(function () { ecs.addComponent(id, comp.name); }, 'add multi comp');

  t.doesNotThrow(function () { result = ecs.getState(id, comp.name); }, 'getState on multi comp');
  t.ok(result, 'getState  returned truthy');
  t.equals(result.length, 1, 'getState an array[1]');
  t.equals(result[0].value, 37, 'getState returned default state');

  t.doesNotThrow(function () { ecs.removeComponent(id, comp.name, true); }, 'remove multi comp');

  t.doesNotThrow(function () { result = ecs.getState(id, comp.name); }, 'getState on empty multi comp');
  t.ok(!result, 'getState returned falsey');

  t.doesNotThrow(function () { ecs.addComponent(id, comp.name, { value: 2 }); }, 'add multi comp with state');
  t.doesNotThrow(function () { ecs.addComponent(id, comp.name, { value: 3 }); }, 'add multi comp with state');
  t.doesNotThrow(function () { result = ecs.getState(id, comp.name); }, 'getState on multi comp length 2');
  t.equals(result.length, 2, 'getState an array[2]');
  var values = result.map(o => o.value);
  t.ok(values.includes(2), 'getState array included state.value = 2');
  t.ok(values.includes(3), 'getState array included state.value = 3');

  t.end();
});

tape('Multi component remove by index', function (t) {
  var ecs = new ECS();
  var id = ecs.createEntity();
  var comp = {
    name: 'multi-component',
    state: { value: 37 },
    multi: true
  };
  ecs.createComponent(comp);

  ecs.addComponent(id, comp.name, { value: 1 });
  ecs.addComponent(id, comp.name, { value: 5 });
  ecs.addComponent(id, comp.name, { value: 9 });

  var states = ecs.getState(id, comp.name);
  t.equals(states.length, 3, 'multi comp states list');

  t.doesNotThrow(function () { ecs.removeMultiComponent(id, comp.name, 1); }, 'removeMultiComp deferred');
  t.equals(ecs.getState(id, comp.name).length, 3, 'deferred removal still pending');
  t.doesNotThrow(function () { ecs.tick(); }, 'tick with deferral');
  t.equals(ecs.getState(id, comp.name).length, 2, 'deferred removal done');

  t.doesNotThrow(function () { ecs.removeMultiComponent(id, comp.name, 0, true); }, 'removeMultiComp immediate');
  t.equals(ecs.getState(id, comp.name).length, 1, 'immediate removal done');
  t.equals(ecs.getState(id, comp.name)[0].value, 9, 'removals were correct');

  t.end();
});

tape('Complex deferred multi component removal', function (t) {
  var ecs = new ECS();
  var id = ecs.createEntity();
  var comp = {
    name: 'multi-component',
    state: { value: 37 },
    multi: true
  };
  ecs.createComponent(comp);
  for (var i = 0; i < 10; i++) ecs.addComponent(id, comp.name, { value: i });

  t.doesNotThrow(function () {
    ecs.removeMultiComponent(id, comp.name, 2);
    ecs.removeMultiComponent(id, comp.name, 6);
    ecs.removeMultiComponent(id, comp.name, 0);
    ecs.removeMultiComponent(id, comp.name, 8);
    ecs.removeMultiComponent(id, comp.name, 4);
  }, 'multi removal in mixed order');

  t.doesNotThrow(function () { ecs.tick(); }, 'tick after mixed multi removal');
  var states;
  t.doesNotThrow(function () { states = ecs.getState(id, comp.name); }, 'get states after mixed multi removal');

  var values = states.map(state => state.value);
  var ok = true;
  for (var j = 1; j < 10; j++) {
    var shouldRemain = !!(j % 2);
    if (shouldRemain !== values.includes(j)) ok = false;
  }
  t.assert(ok, 'Multi values consistent after mixed removal');

  t.end();
});

tape('Complex multi component entity removal', function (t) {
  var ecs = new ECS();
  var comp = {
    name: 'multi-component',
    state: { value: 37 },
    multi: true
  };
  ecs.createComponent(comp);

  // populate
  var ids = Array.from(Array(25)).map(($, i) => i + 1);
  ids.forEach(id => ecs.addComponent(id, comp.name, { value: id }));

  // remove some components, immediately or not
  var toRemove = [21, 6, 12, 19, 11, 23, 14, 7, 8, 18, 4, 3, 20, 10, 15, 16, 2];
  t.doesNotThrow(function () {
    toRemove.forEach((id, i) => {
      if (i % 2 === 0) {
        ecs.deleteEntity(id, true);
      } else {
        ecs.deleteEntity(id);
      }
      if (i % 4 === 0) ecs.tick();
    });
  }, `Mixed multi-comp entity deletions with tick`);

  t.doesNotThrow(function () { ecs.tick(); }, `Tick after mixed ent delete with multi-comp`);

  // check results
  var states;
  var ok = true;
  t.doesNotThrow(function () {
    ids.forEach(id => {
      states = ecs.getState(id, comp.name);
      if (toRemove.includes(id)) {
        if (states) ok = false;
      } else {
        if (!(states && (states[0].value === id))) ok = false;
      }
    });
  }, 'State accesses after mixed ent deletes with multi-comp');

  t.end();
});

tape('Multi component systems', function (t) {
  var ecs = new ECS();
  var systemAccumulator = 0;
  var renderAccumulator = 0;
  var comp = {
    name: 'multi-component',
    state: { value: 0 },
    multi: true,
    system: function (dt, stateArrays) {
      systemAccumulator = 0;
      for (var stateArr of stateArrays) {
        for (var state of stateArr) {
          systemAccumulator += state.value;
        }
      }
    },
    renderSystem: function (dt, stateArrays) {
      renderAccumulator = 0;
      for (var stateArr of stateArrays) {
        for (var state of stateArr) {
          renderAccumulator += state.value / 2;
        }
      }
    }
  };

  var id = ecs.createEntity();
  ecs.createComponent(comp);

  ecs.addComponent(id, comp.name);
  ecs.addComponent(id, comp.name, { value: 37 });
  ecs.addComponent(id, comp.name, { value: 42 });
  ecs.addComponent(id, comp.name, { value: 17 });

  t.doesNotThrow(function () { ecs.tick(1); }, 'tick with multi comp');
  t.equals(systemAccumulator, 37 + 42 + 17, 'multi comp system works');

  t.doesNotThrow(function () { ecs.render(1); }, 'render with multi comp');
  t.equals(renderAccumulator, (37 + 42 + 17) / 2, 'multi comp renderSystem works');

  t.end();
});
