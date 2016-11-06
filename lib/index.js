import _ from 'lodash';

const code = /`.+?`/g;
export function removeCode(text) {
  return text.replace(code, '');
}

const BASE = {
  core: true,
  slots: [
    ['Non-binary', 'Enby', 'Trans', 'Cis', 'Questioning', 'Genderfluid', 'Bigender', 'Agender', 'Genderqueer', 'Demigender', 'Queerdo'],
    ['Flexible', 'Nonconforming', 'Femmetype', 'Masctype', 'Sophisticate', 'Twinky', 'Dapper', 'High Femme', 'Hard Femme', 'Elegant', 'Soft', 'Leather', 'Androgynous'],
    ['King', 'Queen', 'Princess', 'Prince', 'Princen', 'Dandy', 'Butch', 'Dude', 'Bro', 'Shortcake', 'Otter', 'Dragon', 'Beefcake', 'Bear', 'Gentleperson']
  ],
  trigger: ['gender roll']
};
// Modifiers consist of adding and removing
const GQ = {
  core: true,
  parent: BASE,
  mods: [
    [[], ['Cis']],
    [[], []],
    [[], []]
  ],
  trigger: ['genderqueer roll', 'gender queer roll']
};
const TF = {
  core: true,
  parent: GQ,
  mods: [
    [['Self-Rescuing'], []],
    [[], ['Dapper', 'Twinky', 'Masctype']],
    [[], ['King', 'Prince', 'Bear', 'Beefcake', 'Dude', 'Bro']]
  ],
  trigger: ['transfemme roll', 'transfeminine roll']
};
const TM = {
  core: true,
  parent: GQ,
  mods: [
    [[], []],
    [[], ['High Femme', 'Hard Femme', 'Femmetype']],
    [[], ['Queen', 'Princen', 'Princess']]
  ],
  trigger: ['transmasc roll', 'transmasculine roll']
};
const NO_CAKE = {
  mods: [
    [[], []],
    [[], []],
    [[], ['Beefcake', 'Shortcake']]
  ],
  trigger: ['-cake', '--no-gluten', '-gluten', '-glutin']
};
const YES_ROBOTS = {
  mods: [
    [[], []],
    [[], []],
    [['Droid', 'Robot'], []]
  ],
  trigger: ['+robots', '+robot']
};
const YES_ROBOTS_TF = {
  requires: TF,
  mods: [
    [[], []],
    [[], []],
    [['Gynoid'], []]
  ],
  trigger: ['+robots', '+robot']
};
const NO_LEATHER = {
  mods: [
    [[], []],
    [[], ['Leather']],
    [[], []]
  ],
  trigger: ['-leather']
};
const NO_ANIMALS = {
  mods: [
    [[], []],
    [[], []],
    [[], ['Otter', 'Bear', 'Dragon']]
  ],
  trigger: ['-animal', '-animals']
};

// This should be an object, for lookups
export const ALL_ROLLS = {BASE, GQ, TF, TM, NO_CAKE, YES_ROBOTS, YES_ROBOTS_TF, NO_LEATHER, NO_ANIMALS};
// This should be a list, in case ordering is ever relevant.
export const ENABLED_ROLLS = [BASE, GQ, TF, TM, NO_CAKE, YES_ROBOTS, YES_ROBOTS_TF, NO_LEATHER, NO_ANIMALS];

export function determineRolls(text) {
  text = text.toLowerCase();
  const chosen = ENABLED_ROLLS.filter(x => _.some(x.trigger, t => text.includes(t)));
  let core = chosen.filter(x => _.has(x, 'parent') || _.has(x, 'slots'));
  if (core.length !== 1) {
    // nothing we can do here!
    return null;
  }
  const mods = _.without(chosen, core[0]);
  // expand core
  while (!_.has(core[0], 'slots')) {
    core.unshift(core[0].parent);
  }
  _.remove(mods, m => (_.has(m, 'requires') && !_.includes(core, m.requires)));
  return [core, mods];
}

// first roll in rolls must be a core one with 'slots'
export function applyModifiers(rolls) {
  const slots = _.cloneDeep(rolls.shift().slots);
  rolls.forEach(function (roll) {
    roll = roll.mods;
    [0, 1, 2].forEach(function (n) {
      const [add, remove] = roll[n];
      slots[n].push(...add);
      _.pullAll(slots[n], remove);
    });
  });
  [0, 1, 2].forEach(function (n) {
    slots[n] = _.uniq(slots[n]);
  });
  return slots;
}

export function genderRoll(text, pickerFunc = _.sample) {
  text = removeCode(text); // this way we can demonstrate sample rolls in code blocks
  const rolls = determineRolls(text);
  if (rolls === null) {
    return null;
  }
  const slots = applyModifiers(_.flatten(rolls));
  const selections = slots.map(pickerFunc);
  return selections.join(' ');
}
