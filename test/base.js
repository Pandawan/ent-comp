'use strict';

var ECS = require('../dist/ECS').default;
var tape = require('tape');

tape('Instantiation', function (t) {
  var ecs;

  t.doesNotThrow(function () { ecs = new ECS(); }, 'instantiation');

  t.ok(ecs, 'ecs created');

  t.end();
});

tape('Entities', function (t) {
  var ecs = new ECS();
  var id1;

  t.doesNotThrow(function () { id1 = ecs.createEntity(); }, 'createEntity');
  var id2 = ecs.createEntity();

  t.assert(id1 !== id2, 'entity ids are different');

  t.doesNotThrow(function () { ecs.deleteEntity(id1, true); }, 'deleteEntity, immediate');
  t.doesNotThrow(function () { ecs.deleteEntity(id1, true); }, 'ok to delete non-existent entities');
  t.doesNotThrow(function () { ecs.deleteEntity(123, true); }, 'ok to delete non-existent entities');

  var comp = { name: 'foo' };
  ecs.createComponent(comp);
  ecs.addComponent(id2, comp.name);
  t.doesNotThrow(function () { ecs.deleteEntity(id2); }, 'deleteEntity, deferred');
  t.assert(ecs.hasComponent(id2, comp.name), 'deferred removal not done yet');
  t.doesNotThrow(function () { ecs.tick(); }, 'tick with pending removal');
  t.false(ecs.hasComponent(id2, comp.name), 'deferred removal done');

  var id3 = ecs.createEntity([comp.name]);
  t.doesNotThrow(function () { ecs.deleteEntity(id3); }, 'deferred removal');
  t.doesNotThrow(function () { ecs.render(); }, 'render with pending removal');
  t.false(ecs.hasComponent(id3, comp.name), 'deferred removal done');

  var id4 = ecs.createEntity([comp.name]);
  t.doesNotThrow(function () { ecs.deleteEntity(id4); }, 'deferred removal');
  setTimeout(function () {
    t.false(ecs.hasComponent(id4, comp.name), 'deferred removal done with timeout');
  }, 10);

  t.end();
});

tape('States list after entity deletion', function (t) {
  var ecs = new ECS();
  ecs.createComponent({ name: 'foo' });
  var ids = [];
  for (var i = 0; i < 6; i++) ids.push(ecs.createEntity(['foo']));
  ecs.deleteEntity(ids[1]); ids[1] = 'DELETED';
  ecs.deleteEntity(ids[5]); ids[5] = 'DELETED';
  ecs.deleteEntity(ids[2]); ids[2] = 'DELETED';
  ecs.deleteEntity(ids[4]); ids[4] = 'DELETED';
  ids.push(ecs.createEntity(['foo']));
  ecs.tick(); // runs deferred deletions

  var states = ecs.getStatesList('foo');
  for (var j = 0; j < states.length; j++) {
    var id = states[j].__id;
    t.assert(ids.indexOf(id) > -1, 'Ids in state list are as expected');
  }
  t.equals(states[NaN], undefined); // sanity check

  t.end();
});

tape('Chaining', function (t) {
  var ecs = new ECS();
  var id = ecs.createEntity();
  var res;
  ecs.createComponent({ name: 'foo' });

  res = ecs.addComponent(id, 'foo');
  t.equals(res, ecs, 'chainable addComponent');

  res = ecs.removeComponent(id, 'foo');
  t.equals(res, ecs, 'chainable removeComponent');

  res = ecs.deleteComponent('foo');
  t.equals(res, ecs, 'chainable deleteComponent');

  res = ecs.deleteEntity(id);
  t.equals(res, ecs, 'chainable deleteEntity');

  res = ecs.tick();
  t.equals(res, ecs, 'chainable tick');

  res = ecs.render();
  t.equals(res, ecs, 'chainable render');

  t.end();
});
