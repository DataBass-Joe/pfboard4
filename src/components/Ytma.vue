<template>
  <BaseSheet2 :character="flafaffiel"
              :initiative="initiative"
              :cr="cr"
              :xp="xp"
              :max-h-p="maxHP"
              :ac="ac"
              :acBonuses="acBonuses"
              :savingThrows="savingThrows"
              :melee="melee"
              :ranged="ranged"
              :baseAtk="baseAtk"
              :cmb="cmb"
              :cmd="cmd"
              :skills="skills"
              :abilityScores="abilityScores"
              :abilityMods="abilityMods"
              :special-abilities="specialAbilities"
              :toggle="toggle"
  >
  </BaseSheet2>
</template>

<script setup>
import BaseSheet2 from 'components/BaseSheet2';
import {
  computed, ref, reactive,
} from 'vue';
import { useMeta } from 'quasar';

const sizeTable = reactive({
  fine: 8,
  diminutive: 4,
  tiny: 2,
  small: 1,
  medium: 0,
  large: -1,
  huge: -2,
  gargantuan: -4,
  colossal: -8,
});

const name = ref('Flafaffiel');
const solo = ref(false);
const traits = ref([
  'fate\'s favored',
  'reactionary',
]);
const alignment = ref('LG');

const heritage = ref('suli');
const heritageTraits = ref([]);
const type = ref('Outsider');
const subtype = ref(['native']);
const senses = ref(['']);
const aura = ref('');
const speed = ref(30);

const size = ref('medium');
const sizeMod = ref(sizeTable[size.value]);
// TODO
const space = ref(5);
const reach = ref(5);

const className = ref('magus');
const classArchetype = ref(['eldritch scion']);
const classLevel = ref(13);
const classHitDie = ref(8);
const classBab = ref(3 / 4);
const classSkillRanks = ref(2);
const classSkills = ref([
  'Climb',
  'Craft',
  'Fly',
  'Intimidate',
  'Knowledge',
  'Profession',
  'Ride',
  'Spellcraft',
  'Swim',
  'Use Magic Device',
]);
const classSaves = reactive({
  fortitude: true,
  reflex: false,
  will: true,
});
const classCasterLevel = computed(() => classLevel.value);
const classCastingStyle = ref('spontaneous');
const classCastingType = ref('arcane');

const classSpellSlots = reactive({
  '4th': 3,
  '3rd': 4,
  '2nd': 5,
  '1st': 5,
});

const specialAttacks = ref('');
const spellLikeAbilities = ref('');
const supernaturalAbilities = ref('');
const extraordinaryAbilities = ref('');

const charMelee = ref([
  {
    name: 'Bastard Sword',
    weaponGroup: 'heavy',
    attack: 0,
    dieCount: 1,
    dieSize: 10,
    damage: 0,
    critRange: 19,
  },
]);
const charRanged = ref(['']);

const charGear = reactive({
  'Full-Plate Armor': {
    bonusType: 'armor',
    bonus: {
      ac: 9,
      ffAC: 9,
    },
  },
  Suli: {
    bonusType: 'racial',
    bonus: {
      strength: 2,
      intelligence: -2,
      charisma: 2,
    },
  },
});

const flafaffiel = computed(() => {
  const introduction = {
    name: name.value,
    solo: solo.value,
    heritage: heritage.value,
    heritageTraits: heritageTraits.value,
    traits: traits.value,
    class: [
      {
        archetype: classArchetype.value,
        name: className.value,
        level: classLevel.value,
        first: true,
        hitDie: classHitDie.value,
        bab: classBab.value,
        skillRanks: classSkillRanks.value,
        classSkills: classSkills.value,
        favored: {
          hp: 0,
          skill: 0,
          heritage: {
            suli: 13,
          },
        },
        saves: classSaves,
        casterLevel: classCasterLevel.value,
        castingStyle: classCastingStyle.value,
        castingType: classCastingType.value,
        spells: {
          '4th': {
            slots: classSpellSlots['4th'],
            prepared: [
              'Invisibility, Greater',
              'Dimension Door',
              'Modify Memory',
              '???',
            ],
          },
          '3rd': {
            slots: classSpellSlots['3rd'],
            prepared: [
              'Haste',
              'Glibness',
              'Major Image',
              'Charm monster',
            ],
          },
          '2nd': {
            slots: classSpellSlots['2nd'],
            prepared: [
              'Heroism',
              'Gallant Inspiration',
              'Blur',
              'Invisibility',
              'Heroic Fortune',
            ],
          },
          '1st': {
            slots: classSpellSlots['1st'],
            prepared: [
              'Fabricate Disguise',
              'Saving Finale',
              'Hideous Laughter',
              'Grease',
              'Heightened Awareness',
              'Feather Fall',
            ],
          },
          Cantrips: {
            prepared: [
              'Dancing Lights',
              'Detect Magic',
              'Prestidigitation',
              'Daze',
              'Open/Close',
              'Mage Hand',
            ],
          },

        },
      },
    ],
    alignment: alignment.value,
    size: size.value,
    sizeMod: sizeMod.value,
    type: type.value,
    subtype: subtype.value,
    senses: senses.value,
    aura: aura.value,
  };
  // TODO
  const defense = {
    defensiveAbilities: '',
    dr: '',
    resist: '',
    sr: '',
    weaknesses: '',
    saveAbilityScore: {
      fortitude: 'constitution',
      reflex: 'dexterity',
      will: 'wisdom',
    },
  };
  const offense = {
    speed: speed.value,
    space: space.value,
    reach: reach.value,
    specialAttacks: specialAttacks.value,
    spellLikeAbilities: spellLikeAbilities.value,
    supernaturalAbilities: supernaturalAbilities.value,
    extraordinaryAbilities: extraordinaryAbilities.value,
    melee: charMelee.value,
    ranged: charRanged.value,
  };
  const tactics = '';
  const statistics = {
    abilityScore: {
      strength: {
        pointBuy: 16,
      },
      dexterity: {
        pointBuy: 10,
      },
      constitution: {
        pointBuy: 10,
      },
      intelligence: {
        pointBuy: 10,
      },
      wisdom: {
        pointBuy: 10,
      },
      charisma: {
        pointBuy: 14,
      },
    },
    feats: [
      '???',
    ],
    skills: {
      acrobatics: {
        ranks: 0,
        ability: 'dexterity',
      },
      appraise: {
        ranks: 0,
        ability: 'intelligence',
      },
      bluff: {
        ranks: 0,
        ability: 'charisma',
      },
      climb: {
        ranks: 0,
        ability: 'strength',
      },
      craft: {
        ranks: 0,
        ability: 'intelligence',
      },
      diplomacy: {
        ranks: 13,
        ability: 'charisma',
      },
      'disable device': {
        ranks: 0,
        ability: 'dexterity',
      },
      disguise: {
        ranks: 0,
        ability: 'charisma',
      },
      'escape artist': {
        ranks: 0,
        ability: 'dexterity',
      },
      fly: {
        ranks: 0,
        ability: 'dexterity',
      },
      'handle animal': {
        ranks: 0,
        ability: 'charisma',
      },
      heal: {
        ranks: 0,
        ability: 'wisdom',
      },
      intimidate: {
        ranks: 13,
        ability: 'charisma',
      },
      knowledge: {
        arcana: {
          ranks: 0,
          ability: 'intelligence',
        },
        dungeoneering: {
          ranks: 0,
          ability: 'intelligence',
        },
        engineering: {
          ranks: 0,
          ability: 'intelligence',
        },
        geography: {
          ranks: 0,
          ability: 'intelligence',
        },
        history: {
          ranks: 0,
          ability: 'intelligence',
        },
        local: {
          ranks: 0,
          ability: 'intelligence',
        },
        nature: {
          ranks: 0,
          ability: 'intelligence',
        },
        nobility: {
          ranks: 0,
          ability: 'intelligence',
        },
        planes: {
          ranks: 0,
          ability: 'intelligence',
        },
        religion: {
          ranks: 0,
          ability: 'intelligence',
        },
      },
      linguistics: {
        ranks: 0,
        ability: 'intelligence',
      },
      perception: {
        ranks: 0,
        ability: 'wisdom',
      },
      perform: {
        ranks: 0,
        ability: 'charisma',
      },
      profession: {
        ranks: 0,
        ability: 'wisdom',
      },
      ride: {
        ranks: 0,
        ability: 'dexterity',
      },
      'sense motive': {
        ranks: 0,
        ability: 'wisdom',
      },
      'slight of hand': {
        ranks: 0,
        ability: 'dexterity',
      },
      spellcraft: {
        ranks: 0,
        ability: 'intelligence',
      },
      stealth: {
        ranks: 0,
        ability: 'dexterity',
      },
      survival: {
        ranks: 0,
        ability: 'wisdom',
      },
      swim: {
        ranks: 0,
        ability: 'strength',
      },
      'use magic device': {
        ranks: 0,
        ability: 'charisma',
      },
    },
    languages: '',
    specialQualities: '',
  };
  const gear = charGear;
  const ecology = '';
  // ecology: {
  //   environment: '',
  //   organization: '',
  //   treasure: '',
  // },
  const miscellaneous = '';

  return {
    introduction,
    defense,
    offense,
    tactics,
    statistics,
    gear,
    ecology,
    miscellaneous,
  };
});

const baseAtk = computed(() => {
  let bab = 0;

  let maxBAB = 0;

  const CharClasses = ref(flafaffiel.value.introduction.class);

  CharClasses.value.forEach((charClass) => {
    if (charClass.gestalt === true) {
      maxBAB = Math.max(Math.floor(charClass.level * charClass.bab), maxBAB);
    } else {
      bab += Math.floor(charClass.level * charClass.bab);
    }
  });
  bab += maxBAB;

  return bab;
});

const toggle = reactive([
  {
    name: 'Haste',
    bonusType: 'dodge',
    active: false,
    duration: 2,
    bonus: {
      attackRolls: 1,
      reflex: 1,
      ac: 1,
      touchAC: 1,
    },
  },
  {
    name: 'Power Attack',
    bonusType: 'PowerAttack',
    active: false,
    duration: 1,
    bonus: {
      attackRolls: -Math.floor(baseAtk.value / 4) - 1,
      weaponDamage: 3 * (Math.floor(baseAtk.value / 4) + 1),
    },
  },
  {
    name: 'Enhance Weapon',
    bonusType: 'Enhancement',
    active: false,
    duration: 1,
    bonus: {
      attackRolls: 4,
      weaponDamage: 4,
    },
  },
]);

const acBonuses = computed(() => {
  const modifiersHolder = reactive({});

  function modifierLoop(myObj) {
    const myObjKeys = ref(Object.keys(myObj));
    myObjKeys.value.forEach((button) => {
      if (typeof myObj[button].bonus !== 'undefined' && myObj[button].active !== false) {
        modifiersHolder.ac = modifiersHolder.ac ?? {};
        if (myObj[button].bonus.ac) {
          modifiersHolder.ac[myObj[button].bonusType] = modifiersHolder.ac[
            myObj[button].bonusType] ?? [];
          modifiersHolder.ac[myObj[button].bonusType].push(myObj[button].bonus.ac);
        }
      }
    });
  }

  modifierLoop(toggle);
  modifierLoop(flafaffiel.value.gear);
  modifierLoop(flafaffiel.value.statistics.feats);
  modifierLoop(flafaffiel.value.introduction.traits);
  modifierLoop(flafaffiel.value.introduction.heritageTraits);

  const holder = reactive({});

  const stackableTypes = ref(['dodge', 'circumstance', 'untyped']);

  const modifiersHolderKeys = ref(Object.keys(modifiersHolder));

  modifiersHolderKeys.value.forEach((bonusTarget) => {
    const bonusTargetKeys = ref(Object.keys(modifiersHolder[bonusTarget]));
    bonusTargetKeys.value.forEach((bonusType) => {
      holder[bonusTarget] = holder[bonusTarget] ?? {};
      holder[bonusTarget][
        bonusType] = holder[bonusTarget][bonusType] ?? 0;
      holder[bonusTarget][
        bonusType] += modifiersHolder[bonusTarget][
        bonusType].reduce((accumulator, cur) => ((cur >= 0 || !(bonusType in stackableTypes.value))
        ? Math.max(accumulator, cur) : accumulator + cur), 0);
    });
  });

  return holder.ac;
});

const modifiers = computed(() => {
  const modifiersHolder = reactive({});

  function modifierLoop(myObj) {
    const myObjKeys = ref(Object.keys(myObj));
    myObjKeys.value.forEach((button) => {
      if (typeof myObj[button].bonus !== 'undefined' && myObj[button].active !== false) {
        const bonusKeys = ref(Object.keys(myObj[button].bonus));
        bonusKeys.value.forEach((key) => {
          modifiersHolder[key] = modifiersHolder[key] ?? {};
          modifiersHolder[key][myObj[button].bonusType] = modifiersHolder[key][
            myObj[button].bonusType] ?? [];
          modifiersHolder[key][myObj[button].bonusType].push(myObj[button].bonus[key]);
        });
      }
    });
  }

  modifierLoop(toggle);
  modifierLoop(flafaffiel.value.gear);
  modifierLoop(flafaffiel.value.statistics.feats);
  modifierLoop(flafaffiel.value.introduction.traits);
  modifierLoop(flafaffiel.value.introduction.heritageTraits);

  const holder = reactive({});

  const stackableTypes = ref(['dodge', 'circumstance', 'untyped']);

  const modifiersHolderKeys = ref(Object.keys(modifiersHolder));

  modifiersHolderKeys.value.forEach((bonusTarget) => {
    const bonusTargetKeys = ref(Object.keys(modifiersHolder[bonusTarget]));
    bonusTargetKeys.value.forEach((bonusType) => {
      holder[bonusTarget] = holder[bonusTarget] ?? 0;
      holder[bonusTarget] += modifiersHolder[bonusTarget][
        bonusType].reduce((accumulator, cur) => ((cur >= 0 && !(bonusType in stackableTypes.value))
        ? Math.max(accumulator, cur) : accumulator + cur), 0);
    });
  });

  return holder;
});

const sizeModifier = computed(() => {
  let tempSize = flafaffiel.value.introduction.sizeMod;

  tempSize += modifiers.value.size ?? 0;

  return tempSize;
});

// STATISTICS

const abilityScores = computed(() => {
  const husk = reactive({
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  });

  const objectHusk = reactive(flafaffiel.value.statistics.abilityScore);

  const keys = ref(Object.keys(objectHusk));

  keys.value.forEach((score) => {
    const subKeyHusk = reactive({});
    const existingSubKeys = ref(Object.keys(objectHusk[score]));

    existingSubKeys.value.forEach((subScore) => {
      subKeyHusk[subScore] = objectHusk[score][subScore];
    });

    husk[score] += modifiers.value[score] ?? 0;

    const subKeys = Object.keys(subKeyHusk);

    subKeys.forEach((subScore) => {
      husk[score] += subKeyHusk[subScore];
    });
  });

  return husk;
});

const abilityMods = computed(() => {
  const husk = reactive({
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  });

  const keys = Object.keys(husk);

  keys.forEach((score) => {
    husk[score] = Math.floor((abilityScores.value[score] - 10) / 2);
  });

  return husk;
});

const cmb = computed(() => {
  let tempCMB = abilityMods.value.strength + baseAtk.value + sizeModifier.value;

  tempCMB += modifiers.value.attackRolls ?? 0;

  return tempCMB;
});
const cmd = computed(() => 10 + abilityMods.value.dexterity
  + abilityMods.value.strength + baseAtk.value
  + sizeModifier.value);
// eslint-disable-next-line max-len
const level = computed(() => flafaffiel.value.introduction.class.reduce(((accumulator, cur) => ((cur.gestalt ?? false)
  ? Math.max(accumulator, cur.level) : accumulator + cur.level)), 0));

const skills = computed(() => {
  const skillRanks = flafaffiel.value.statistics.skills;

  const totalSkills = {
    acrobatics: 0,
    appraise: 0,
    bluff: 0,
    climb: 0,
    craft: 0,
    diplomacy: 0,
    'disable device': 0,
    disguise: 0,
    'escape artist': 0,
    fly: 0,
    'handle animal': 0,
    heal: 0,
    intimidate: 0,
    knowledge: {
      arcana: 0,
      dungeoneering: 0,
      engineering: 0,
      geography: 0,
      history: 0,
      local: 0,
      nature: 0,
      nobility: 0,
      planes: 0,
      religion: 0,
    },
    linguistics: 0,
    perception: 0,
    perform: 0,
    profession: 0,
    ride: 0,
    'sense motive': 0,
    'slight of hand': 0,
    spellcraft: 0,
    stealth: 0,
    survival: 0,
    swim: 0,
    'use magic device': 0,
  };

  if (sizeModifier.value !== 0) {
    totalSkills.fly += (Math.log2(sizeModifier.value) + 1) * 2;
    totalSkills.stealth += (Math.log2(sizeModifier.value) + 1) * 4;
  }

  const tempClassSkills = ref(flafaffiel.value.introduction.class[0].classSkills);

  const { knowledge } = flafaffiel.value.statistics.skills;

  const knowledgeKeys = Object.keys(knowledge);

  const keys = Object.keys(totalSkills);

  const summarySkills = {};

  keys.forEach((skillKey) => {
    tempClassSkills.value.forEach((classSkill) => {
      if (classSkill === skillKey && skillRanks[skillKey].ranks >= 1) totalSkills[skillKey] += 3;
      if (classSkill === skillKey && classSkill === 'knowledge') {
        knowledgeKeys.forEach((knowledgeSkillKey) => {
          if (skillRanks.knowledge[knowledgeSkillKey].ranks >= 1) {
            totalSkills.knowledge[knowledgeSkillKey] += 3;
          }
        });
      }
    });
    if (skillKey === 'knowledge') {
      knowledgeKeys.forEach((knowledgeSkillKey) => {
        totalSkills.knowledge[knowledgeSkillKey] += skillRanks.knowledge[knowledgeSkillKey].ranks;
        totalSkills.knowledge[knowledgeSkillKey]
          += abilityMods.value[skillRanks.knowledge[knowledgeSkillKey].ability];
        totalSkills.knowledge[knowledgeSkillKey] += modifiers.value.skills ?? 0;

        // if (flafaffiel.value.specialAbilities.abilities?.includes('Bardic Knowledge')) {
        //   totalSkills.knowledge[knowledgeSkillKey] += level.value;
        // }
        // if (skillRanks.knowledge[knowledgeSkillKey].ranks >= 1
        // || flafaffiel.value.specialAbilities.abilities?.includes('Bardic Knowledge')) {
        //   if (!summarySkills.knowledge) summarySkills.knowledge = {};
        //   summarySkills.knowledge[knowledgeSkillKey] = totalSkills.knowledge[knowledgeSkillKey];
        // }
      });
    } else {
      totalSkills[skillKey] += skillRanks[skillKey].ranks;
      totalSkills[skillKey] += abilityMods.value[skillRanks[skillKey].ability];
      totalSkills[skillKey] += modifiers.value[skillKey] ?? 0;
      totalSkills[skillKey] += modifiers.value.skills ?? 0;

      if (skillRanks[skillKey].ranks >= 1) {
        summarySkills[skillKey] = totalSkills[skillKey];
      }
    }
  });

  return {
    totalSkills,
    summarySkills,
  };
});

// INTRODUCTION

const cr = ref('');
const xp = ref(null);

const initiative = computed(() => abilityMods.value.dexterity + (modifiers.value.initiative ?? 0));

// DEFENSE

const ac = computed(() => {
  const tempAC = 10 + sizeModifier.value;

  return reactive({
    default: tempAC + (modifiers.value.ac ?? 0) + abilityMods.value.dexterity,
    touch: tempAC + (modifiers.value.touchAC ?? 0) + abilityMods.value.dexterity,
    'flat-footed': tempAC + (modifiers.value.ffAC ?? 0),
  });
});
const maxHP = computed(() => {
  let hitPoints = 0;

  let maxHitDie = 0;

  const CharClasses = flafaffiel.value.introduction.class;

  CharClasses.forEach((charClass) => {
    if (charClass.gestalt !== true) {
      if (charClass.first) {
        hitPoints += charClass.hitDie;
        hitPoints += (charClass.level - 1) * Math.ceil((charClass.hitDie + 1) / 2);
      } else {
        hitPoints += charClass.level * Math.ceil((charClass.hitDie + 1) / 2);
      }
      if (typeof charClass.favored !== 'undefined') {
        if (typeof charClass.favored.hp !== 'undefined') {
          hitPoints += charClass.favored.hp;
        }
      }
    } else {
      maxHitDie = Math.max(charClass.hitDie, maxHitDie);
    }
  });

  if (flafaffiel.value.introduction.solo) {
    hitPoints = maxHitDie * level.value;
  }

  hitPoints += level.value * abilityMods.value.constitution;

  return hitPoints;
});
// const inputDamage = ref(0);

const savingThrows = computed(() => {
  const totalSaves = {
    fortitude: 0,
    reflex: 0,
    will: 0,
  };

  let allBonus = 0;

  allBonus += modifiers.value.saves ?? 0;

  const saveKeys = Object.keys(flafaffiel.value.defense.saveAbilityScore);

  const charClasses = ref(flafaffiel.value.introduction.class);

  const maxCharSaves = {
    fortitude: false,
    reflex: false,
    will: false,
  };

  saveKeys.forEach((save) => {
    charClasses.value.forEach((charClass) => {
      maxCharSaves[save] = (charClass.saves[save] || maxCharSaves[save]);
    });
  });

  saveKeys.forEach((save) => {
    if (maxCharSaves[save] ?? false) {
      totalSaves[save] += 2;
      totalSaves[save] += Math.floor(level.value / 2);
    } else {
      totalSaves[save] += Math.floor(level.value / 3);
    }
    totalSaves[save] += modifiers.value[save] ?? 0;
    totalSaves[save] += abilityMods.value[flafaffiel.value.defense.saveAbilityScore[save]];
    totalSaves[save] += allBonus;
  });

  return totalSaves;
});

// OFFENSE

const melee = computed(() => {
  let twoHanding = 0;

  if (toggle['two handing']?.active) twoHanding = 1;

  const tempMeleeAttack = ref(Math.max(abilityMods.value.dexterity, abilityMods.value.strength)
    + baseAtk.value
    + sizeModifier.value);
  const tempMeleeDamage = ref(Math.floor(abilityMods.value.strength * (1 + (0.5 * twoHanding))));

  // let tempDexDamage = Math.floor(abilityMods.value.dexterity);

  if (toggle['power attack']?.active) {
    tempMeleeAttack.value += -(Math.floor(baseAtk.value / 4) + 1);
    // eslint-disable-next-line no-unused-vars
    tempMeleeDamage.value += (Math.floor(baseAtk.value / 4) + 1) * (2 + twoHanding);
    // tempDexDamage += (Math.floor(baseAtk.value / 4) + 1) * 2;
  }

  const dieSizeMod = ref(sizeModifier.value);

  // let holy;

  // if (toggle.holy?.active) {
  //   holy = ' plus 2d6';
  // } else {
  //   holy = '';
  // }

  tempMeleeDamage.value += modifiers.value.weaponDamage ?? 0;
  // tempDexDamage += modifiers.value.weaponDamage ?? 0;

  tempMeleeAttack.value += modifiers.value.attackRolls ?? 0;

  const mOptions = ref([]);

  flafaffiel.value.offense.melee.forEach((meleeOption) => {
    const option = ref({});
    Object.keys(meleeOption)
      .forEach((meleeAttr) => {
        option.value[meleeAttr] = meleeOption[meleeAttr];
      });
    option.value.attack += tempMeleeAttack.value;
    option.value.damage += tempMeleeDamage.value;
    option.value.dieSize -= dieSizeMod.value;
    mOptions.value.push(option.value);
  });

  return mOptions.value;
});

const ranged = computed(() => {
  const tempRangedAttack = ref(Math.max(abilityMods.value.dexterity, abilityMods.value.strength)
    + baseAtk.value
    + sizeModifier.value + (modifiers.value.attackRolls ?? 0));
  const tempRangedDamage = ref(abilityMods.value.strength + (modifiers.value.weaponDamage ?? 0));

  const dieSizeMod = ref(sizeModifier.value);

  const rOptions = ref([]);

  flafaffiel.value.offense.ranged.forEach((rangedOption) => {
    const option = ref({});
    Object.keys(rangedOption)
      .forEach((rangedAttr) => {
        option.value[rangedAttr] = rangedOption[rangedAttr];
      });
    option.value.attack += tempRangedAttack.value;
    option.value.damage += tempRangedDamage.value;
    option.value.dieSize -= dieSizeMod.value;
    rOptions.value.push(option.value);
  });

  return rOptions.value;
});

const specialAbilities = ref([
  {
    name: 'Arcane Pool',
    type: 'Su',
    header: `Arcane Pool (Su) ${abilityMods.value.charisma + Math.floor(level.value / 2) + Math.floor(level.value / 4)}/day`,
    description: ['At 1st level, the magus gains a reservoir of mystical arcane energy that he can draw upon to fuel his powers and enhance his weapon. This arcane pool has a number of points equal to 1/2 his magus level (minimum 1) + his Intelligence modifier. The pool refreshes once per day when the magus prepares his spells.',
      'At 1st level, a magus can expend 1 point from his arcane pool as a swift action to grant any weapon he is holding a +1 enhancement bonus for 1 minute. For every four levels beyond 1st, the weapon gains another +1 enhancement bonus, to a maximum of +5 at 17th level. These bonuses can be added to the weapon, stacking with existing weapon enhancement to a maximum of +5. Multiple uses of this ability do not stack with themselves.',
      'At 5th level, these bonuses can be used to add any of the following weapon properties: dancing, flaming, flaming burst, frost, icy burst, keen, shock, shocking burst, speed, or vorpal.',
      'Adding these properties consumes an amount of bonus equal to the property’s base price modifier. These properties are added to any the weapon already has, but duplicates do not stack. If the weapon is not magical, at least a +1 enhancement bonus must be added before any other properties can be added. These bonuses and properties are decided when the arcane pool point is spent and cannot be changed until the next time the magus uses this ability. These bonuses do not function if the weapon is wielded by anyone other than the magus.',
      'A magus can only enhance one weapon in this way at one time. If he uses this ability again, the first use immediately ends.',
    ],
  },
]);

const metaData = reactive({
  title: name.value,
});
useMeta(metaData);

</script>

<style scoped>

#page {

}

</style>
