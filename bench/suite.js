'use strict';

var ECS = require('../dist/ECS').default;
var Bench = require('fen-bench');
var windowed = (typeof window !== 'undefined');

/** ********************  SETUP  ***********************/

var ecs = new ECS();

var NUM_ENTS = 10000;
var NUM_COMPS = 1000;
var NUM_COMPS_PER_ENT = 100;

var correctCount = 0;
var correctSum = 0;
var ids = [];

console.log('Setting up tests...');
setUpECS(ecs);

function setUpECS (ecs) {
  // real component
  ecs.createComponent({
    name: 'real-comp',
    state: { num: 1 }
  });

  // filler components
  for (var i = 0; i < NUM_COMPS; i++) {
    ecs.createComponent({
      name: 'filler' + i,
      state: { a: 1, b: 2 }
    });
  }

  // entities
  ids = [];
  correctCount = 0;
  correctSum = 0;
  for (var j = 0; j < NUM_ENTS; j++) {
    var id = ecs.createEntity();
    // every entity gets filler comps
    var cnum = (j * 13) % NUM_COMPS;
    for (var k = 0; k < NUM_COMPS_PER_ENT; k++) {
      var fillerName = 'filler' + ((cnum + k) % NUM_COMPS);
      ecs.addComponent(id, fillerName);
    }
    // add real component to most but not all entities
    if (j % 8 === 0) continue;
    var num = (j * 17) % 20;
    ecs.addComponent(id, 'real-comp', { num: num });
    correctSum += num;
    correctCount++;
    ids.push(id);
  }

  // delete a few things in case that matters
  var del = i => {
    var id = ids[i];
    if (ecs.hasComponent(id, 'real-comp')) {
      correctCount--;
      correctSum -= ecs.getState(id, 'real-comp').num;
    }
    ecs.deleteEntity(ids[i], true);
    ids.splice(i, 1);
  };
  for (var di = 44; di < 55; di++) del(di);
}

/** ********************  TEST CASES  ***********************/

var bench = new Bench();
bench.testDuration = 100;
bench.pauseDuration = 10;

bench.testCases.push({
  name: 'hasComponent',
  fn: function () {
    var ct = 0;
    for (var i = 0; i < ids.length; i++) {
      if (ecs.hasComponent(ids[i], 'real-comp')) ct++;
    }
    return ct;
  }
});

bench.testCases.push({
  name: 'getState',
  fn: function () {
    var sum = 0;
    for (var i = 0; i < ids.length; i++) {
      sum += ecs.getState(ids[i], 'real-comp').num;
    }
    return sum;
  }
});

bench.testCases.push({
  name: 'stateAccessor',
  fn: function () {
    var acc = ecs.getStateAccessor('real-comp');
    var sum = 0;
    for (var i = 0; i < ids.length; i++) {
      sum += acc(ids[i]).num;
    }
    return sum;
  }
});

bench.testCases.push({
  name: 'componentAccessor',
  fn: function () {
    var acc = ecs.getComponentAccessor('real-comp');
    var ct = 0;
    for (var i = 0; i < ids.length; i++) {
      if (acc(ids[i])) ct++;
    }
    return ct;
  }
});

bench.testCases.push({
  name: 'getStatesList',
  fn: function () {
    var sum = 0;
    var list = ecs.getStatesList('real-comp');
    for (var i = 0; i < list.length; i++) {
      sum += list[i].num;
    }
    return sum;
  }
});

// sanity correctness check
bench.testCases.forEach(item => {
  var res = item.fn();
  if (res !== correctSum && res !== correctCount) throw 'Logic error!';
});

/** ********************  EXECUTE  ***********************/

if (windowed) {
  // browser
  var but = document.querySelector('#run');
  but.onclick = function () {
    if (!bench.running) bench.start();
    else bench.stop();
    but.textContent = (bench.running) ? 'RUNNING' : 'RUN';
  };

  var out = document.querySelector('#output');
  var ct = 0;
  bench.callback = function () {
    out.value = `	Runs: ${++ct}\n` + bench.report();
  };
} else {
  // node
  console.log('Running tests...');
  bench.start();
  var iter = 0;
  bench.callback = function () {
    if (iter++ < 5) return;
    console.log(bench.report() + '\n');
    iter = 0;
  };
}
