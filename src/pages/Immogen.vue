<template>
  <BaseSheet2
    :character="immogen"
/>
</template>

<script setup>
import BaseSheet2 from 'components/BaseSheet2.vue';
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

const character = computed(() => {
  const name = ref('Immogen');
  const solo = ref(true);
  const traits = ref([
    'fate\'s favored',
    'reactionary',
  ]);
  const alignment = ref('CG');

  const heritage = ref('humanoid');
  const heritageTraits = ref([]);
  const type = ref('humanoid');
  const subtype = ref(['human']);
  const senses = ref(['arcane sight, darkvision 60ft., see invisibility, alignment sight']);
  const aura = ref('');
  const speed = ref(30);

  const size = ref('medium');
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: 'Stella\'s Holy Keen Impact Cutlass',
      weaponGroup: 'light',
      dieCount: 1,
      dieSize: 12,
      critRange: 15,
    },
  ]);
  const charRanged = ref([
    {
      name: 'Furies\' Flaming Burst Longbow',
      weaponGroup: 'bow',
      dieCount: 1,
      dieSize: 8,
      critRange: 20,
    },
  ]);

  const mythicTier = ref(4);
  const mythicFlag = ref(true);
  const mythicPower = ref(3 + (2 * mythicTier.value));

  const mythicPath = reactive({
    heirophant: {
      bonusType: 'mythic',
      bonus: {
        charisma: 4,
        initiative: mythicTier.value,
        hp: (4 * mythicTier.value),
      },
    },
    feats: {},
  });

  const charGear = reactive({
    'Adamantite Celestial Armor': {
      bonusType: 'armor',
      bonus: {
        ac: 6,
        ffAC: 6,
      },
    },
    'Singing Steel Buckler': {
      bonusType: 'shield',
      bonus: {
        ac: 1,
        ffAC: 1,
      },
    },
    'Mwk Thieves Tools': {
      bonusType: 'circumstance',
      bonus: {
        'disable device': 2,
      },
    },
  });
  const introduction = {
    name: name.value,
    solo: solo.value,
    heritage: heritage.value,
    heritageTraits: heritageTraits.value,
    traits: traits.value,
    class: [
      {
        archetype: ['archaeologist'],
        name: 'bard',
        level: 14,
        first: true,
        hitDie: 8,
        bab: 3 / 4,
        skillRanks: 2,
        classSkills: [
          'Acrobatics',
          'Appraise',
          'Bluff',
          'Climb',
          'Craft',
          'Diplomacy',
          'Disguise',
          'Escape Artist',
          'Intimidate',
          'Knowledge',
          'Linguistics',
          'Perception',
          'Perform',
          'Profession',
          'Sense Motive',
          'Sleight of Hand',
          'Spellcraft',
          'Stealth',
          'Use Magic Device',
        ],
        favored: {
          hp: 0,
          skill: 0,
          race: {
            human: 14,
          },
        },
        saves: {
          fortitude: false,
          reflex: true,
          will: true,
        },
        casting: 'spontaneous',
        castingStat: 'charisma',
        spells: {
          '5th': {
            slots: 2,
            prepared: [
              'Heroism, Greater',
              'Foe to Friend',
              'Persistent Image',
            ],
          },
          '4th': {
            slots: 4,
            prepared: [
              'Invisibility, Greater',
              'Dimension Door',
              'Modify Memory',
              'Shield of the Dawnflower',
              '???',
              '???',
            ],
          },
          '3rd': {
            slots: 4,
            prepared: [
              'Haste',
              'Glibness',
              'Major Image',
              'Charm monster',
              'Confusion',
              'Good Hope',
              'Charm Monster',
              'False Future',
            ],
          },
          '2nd': {
            slots: 5,
            prepared: [
              '???',
              'Cacophonous Call',
              'Gallant Inspiration',
              'Blur',
              'Invisibility',
              'Heroic Fortune',
              'Share Memory',
              'Detect Thoughts',
              'Mirror Image',
            ],
          },
          '1st': {
            slots: 5,
            prepared: [
              'Shadow Trap',
              '???',
              'Fabricate Disguise',
              'Saving Finale',
              'Hideous Laughter',
              'Grease',
              'Heightened Awareness',
              'Feather Fall',
              'Timely Inspiration',
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
              'Lullaby',
              'Message',
              'Mending',
            ],
          },

        },
        gestalt: true,
      },
      {
        archetype: ['dual-cursed'],
        name: 'oracle',
        level: 14,
        hitDie: 8,
        bab: 3 / 4,
        first: false,
        skillRanks: 2,
        classSkills: [
          'Craft',
          'Diplomacy',
          'Heal',
          // TODO
          'Knowledge (history)',
          'Knowledge (planes)',
          'Knowledge (religion)',
          'Profession',
          'Sense Motive',
          'Spellcraft',
        ],
        favored: {
          hp: 0,
          skill: 0,
          race: {
            human: 14,
          },
        },
        saves: {
          fortitude: false,
          reflex: false,
          will: true,
        },
        casting: 'spontaneous',
        castingStat: 'charisma',
        spells: {
          '7th': {
            slots: 5,
            prepared: [
              'Hymn of Peace',
            ],
          },
          '6th': {
            slots: 5,
            prepared: [
              'Heal',
              'Dispel Magic, Greater',
              'Harm',
            ],
          },
          '5th': {
            slots: 6,
            prepared: [
              'Slay Living',
              'Plane Shift',
              'Commune',
              'Flame Strike',
              'Soulswitch',
            ],
          },
          '4th': {
            slots: 6,
            prepared: [
              'Sending',
              'Dimensional Anchor',
              'Dismissal',
              'Imbue with Spell Ability',
              'Wall of Fire',
              'Freedom of Movement',
            ],
          },
          '3rd': {
            slots: 6,
            prepared: [
              'Dispel Magic',
              'Stunning Barrier',
              'Stone Shape',
              'Second Wind',
              'Shield of Wings',
              'Beacon of Luck',
            ],
          },
          '2nd': {
            slots: 6,
            prepared: [
              'Hold person',
              'Silence',
              'Resist Energy',
              'Zone of Truth',
              'Weapon of Awe',
              'Scorching Ray',
              'Detect Magic, Greater',
            ],
          },
          '1st': {
            slots: 6,
            prepared: [
              'Shield of Faith',
              'Moment of Greatness',
              'Murderous Command',
              'Lucky Number',
              'Fallback Strategy',
              'Sure casting',
              'Burning Hands',
            ],
          },
          Orisons: {
            prepared: [
              'Create Water',
              'Read Magic',
              'Stabilize',
              'Enhance Diplomacy',
              'Purify Food and Drink',
              'Mending',
              'Vigor',
              'Spark',
              '???',
              '???',
              '???',
            ],
          },

        },
        mysterySpells: [
          {
            name: 'Dual-Cursed',
            '1st': 'ill omen',
            '2nd': 'oracle\'s burden',
            '3rd': 'Bestow Curse',
          }, {
            name: 'Time',
            '4th': 'threefold aspect',
            '5th': 'permanency',
            '6th': 'contingency',
            '7th': 'disintegrate',
          },
        ],
        gestalt: true,
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

  introduction.class.forEach((charClass) => {
    charClass.casterLevel = charClass.level;
  });

  const level = computed(() => introduction.class.reduce(
    ((accumulator, cur) => ((cur.gestalt ?? false)
      ? Math.max(accumulator, cur.level) : accumulator + cur.level)), 0,
  ));
  // TODO
  const defense = {
    defensiveAbilities: ['hard to kill'],
    dr: {
      '—': 2,
    },
    resist: '',
    sr: '',
    weaknesses: ['cold'],
    saveAbilityScore: {
      fortitude: 'constitution',
      reflex: 'charisma',
      will: 'wisdom',
    },
  };
  const offense = {
    speed: speed.value,
    space: space.value,
    reach: reach.value,
    melee: charMelee.value,
    ranged: charRanged.value,
  };
  const tactics = '';
  const statistics = {
    abilityScore: {
      strength: {
        pointBuy: 11,
      },
      dexterity: {
        pointBuy: 14,

      },
      constitution: {
        pointBuy: 12,

      },
      intelligence: {
        pointBuy: 14,

      },
      wisdom: {
        pointBuy: 12,

      },
      charisma: {
        pointBuy: 16,
        levelUp: 3,
      },
    },
    feats: {
      'Auspicious Birth (Retrograde)': {
        bonusType: 'luck',
        bonus: {
          reflex: 2,
        },
      },

      'Defiant Luck': {},
      'Racial Heritage (Catfolk)': {},
      'Spellsong (Bluff)': {},
      'Black Cat': {},
      'Lingering Performance': {},
      'Inexplicable Luck': {},
      'Lucky x3': {},
      'Bestow Luck': {},
      'Lady Luck\'s Guidance': {},
      'Cosmic Gate': {},
      'Dimensional Agility': {},
      'Dimensional Step Up': {},

      'Blood of Heroes': {},
      'Hero\'s Fortune': {},
      'Luck of Heroes': {},

      'Step Up (Rogue Trick)': {},
      'Combat Reflexes (Rogue Trick)': {},
    },
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
        ranks: level.value,
        ability: 'charisma',
      },
      climb: {
        ranks: 1,
        ability: 'strength',
      },
      craft: {
        ranks: 0,
        ability: 'intelligence',
      },
      diplomacy: {
        ranks: level.value,
        ability: 'charisma',
      },
      'disable device': {
        ranks: level.value,
        ability: 'dexterity',
      },
      disguise: {
        ranks: level.value,
        ability: 'charisma',
      },
      'escape artist': {
        ranks: level.value,
        ability: 'dexterity',
      },
      fly: {
        ranks: 3,
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
        ranks: level.value,
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
        ranks: 1,
        ability: 'intelligence',
      },
      perception: {
        ranks: level.value,
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
        ranks: 1,
        ability: 'dexterity',
      },
      'sense motive': {
        ranks: level.value,
        ability: 'wisdom',
      },
      'slight of hand': {
        ranks: level.value,
        ability: 'dexterity',
      },
      spellcraft: {
        ranks: level.value,
        ability: 'intelligence',
      },
      stealth: {
        ranks: level.value,
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
        ranks: 10,
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

  const baseAtk = computed(() => {
    let bab = 0;

    let maxBAB = 0;

    const CharClasses = ref(introduction.class);

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
      name: 'heroism, greater',
      bonusType: 'morale',
      duration: 2,
      active: true,
      bonus: {
        attackRolls: 4,
        saves: 4,
        skills: 4,
      },
    },
    {
      name: 'archeologist\'s luck',
      bonusType: 'luck',
      duration: 1,
      active: true,
      bonus: {
        attackRolls: 4,
        saves: 4,
        skills: 4,
        weaponDamage: 4,
      },
    },
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
      active: true,
      duration: 1,
      bonus: {
        attackRolls: -Math.floor(baseAtk.value / 4) - 1,
        weaponDamage: 2 * (Math.floor(baseAtk.value / 4) + 1),
      },
    },
  ]);

  const charMods = reactive({
    Human: {
      bonusType: 'racial',
      bonus: {
        charisma: 2,
      },
    },
    bardicKnowledge: {
      bonusType: 'untyped',
      bonus: {
        knowledge: level.value,
      },
    },
    cleverExplorer: {
      bonusType: 'untyped',
      bonus: {
        perception: Math.floor(level.value / 2),
        'disable device': Math.floor(level.value / 2),
      },
    },
    abpWeapon: {
      bonusType: 'enhancement',
      bonus: {
        attackRolls: 3,
        weaponDamage: 3,
      },
    },
    abpAbilityScores: {
      bonusType: 'enhancement',
      bonus: {
        strength: 0,
        dexterity: 6,
        constitution: 2,
        intelligence: 0,
        wisdom: 2,
        charisma: 6,
      },
    },
    abpResistance: {
      bonusType: 'resistance',
      bonus: {
        saves: 5,
      },
    },
    abpNaturalArmor: {
      bonusType: 'naturalArmorEnhancement',
      bonus: {
        ac: 3,
        ffAC: 3,
      },
    },
    abpDeflection: {
      bonusType: 'deflection',
      bonus: {
        ac: 3,
        ffAC: 3,
        touchAC: 3,
      },
    },
    abpShield: {
      bonusType: 'shieldEnhancement',
      bonus: {
        ac: 3,
        ffAC: 3,

      },
    },
    abpArmor: {
      bonusType: 'armorEnhancement',
      bonus: {
        ac: 3,
        ffAC: 3,
      },
    },
  });

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
    modifierLoop(mythicPath);
    modifierLoop(charMods);
    modifierLoop(gear);
    modifierLoop(statistics.feats);
    modifierLoop(introduction.traits);
    modifierLoop(introduction.heritageTraits);

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
          bonusType] += modifiersHolder[bonusTarget][bonusType].reduce(
          (accumulator, cur) => ((cur >= 0 || !(bonusType in stackableTypes.value))
            ? Math.max(accumulator, cur) : accumulator + cur), 0,
        );
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
    modifierLoop(mythicPath);
    modifierLoop(charMods);
    modifierLoop(gear);
    modifierLoop(statistics.feats);
    modifierLoop(introduction.traits);
    modifierLoop(introduction.heritageTraits);

    const holder = reactive({});

    const stackableTypes = ref(['dodge', 'circumstance', 'untyped']);

    const modifiersHolderKeys = ref(Object.keys(modifiersHolder));

    modifiersHolderKeys.value.forEach((bonusTarget) => {
      const bonusTargetKeys = ref(Object.keys(modifiersHolder[bonusTarget]));
      bonusTargetKeys.value.forEach((bonusType) => {
        holder[bonusTarget] = holder[bonusTarget] ?? 0;
        holder[bonusTarget] += modifiersHolder[bonusTarget][bonusType].reduce(
          (accumulator, cur) => ((cur >= 0 && !(bonusType in stackableTypes.value))
            ? Math.max(accumulator, cur) : accumulator + cur), 0,
        );
      });
    });

    return holder;
  });

  const sizeModifier = computed(() => {
    let tempSize = introduction.sizeMod;

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

    const objectHusk = reactive(statistics.abilityScore);

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

  const skills = computed(() => {
    const skillRanks = statistics.skills;

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

    const tempClassSkills = ref(introduction.class[0].classSkills);

    const { knowledge } = statistics.skills;

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
          totalSkills.knowledge[knowledgeSkillKey] += modifiers.value.knowledge ?? 0;
          totalSkills.knowledge[knowledgeSkillKey] += modifiers.value.skills ?? 0;
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

  // eslint-disable-next-line max-len
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

    const CharClasses = introduction.class;

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

    if (introduction.solo) {
      hitPoints = maxHitDie * level.value;
    }

    hitPoints += level.value * abilityMods.value.constitution;

    hitPoints += modifiers.value.hp ?? 0;

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

    const saveKeys = Object.keys(defense.saveAbilityScore);

    const charClasses = ref(introduction.class);

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
      totalSaves[save] += abilityMods.value[defense.saveAbilityScore[save]];
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

    const tempDexDamage = ref(Math.floor(abilityMods.value.dexterity));

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
    tempDexDamage.value += modifiers.value.weaponDamage ?? 0;

    tempMeleeAttack.value += modifiers.value.attackRolls ?? 0;

    const mOptions = ref([]);

    offense.melee.forEach((meleeOption) => {
      const option = ref({
        attack: 0,
        damage: 0,
      });
      Object.keys(meleeOption)
        .forEach((meleeAttr) => {
          option.value[meleeAttr] = meleeOption[meleeAttr];
        });
      option.value.attack += tempMeleeAttack.value;
      option.value.damage += option.value.weaponGroup === 'light'
        ? Math.max(tempMeleeDamage.value, tempDexDamage.value) : tempMeleeDamage.value;
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

    offense.ranged.forEach((rangedOption) => {
      const option = ref({
        attack: 0,
        damage: 0,
      });
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

  const featDescriptions = ref([
    {
      name: 'Auspicious Birth (Apparent Retrograde)',
      type: '',
      header: 'Auspicious Birth (Apparent Retrograde)',
      description: [
        'You gain a +1 luck bonus on Reflex saves. A natural 1 on a Reflex save is not considered an automatic failure for you.',
      ],
    },
    {
      name: 'Cosmic Gate',
      type: '',
      header: 'Cosmic Gate 1/day',
      description: [
        'Once per day, you can instantly travel to a nearby location on the Material Plane; this functions as teleport except you are always considered very familiar with your destination.',
      ],
    },
    {
      name: 'Defiant Luck',
      type: '',
      header: 'Defiant Luck 8/day',
      description: [
        'Once per day, after you roll a natural 1 on a saving throw or a critical hit is confirmed against you, you can either reroll that saving throw, or force the creature that confirmed the critical hit against you to reroll the critical confirmation roll. This does not stack with other effects that allow you to reroll a saving throw or an attack roll. You may only make one reroll.',
        'If you are using the optional hero point system, you can also spend 1 hero point when a critical hit is confirmed against you to have the opponent reroll the critical hit confirmation roll.',
      ],
    },
    {
      name: 'Inexplicable Luck',
      type: '',
      header: 'Inexplicable Luck 7/day',
      description: [
        'Once per day, as a free action before a roll is made, you gain a +8 bonus on any single d20 roll. You can also use this ability after the roll is made, but if you do, this bonus is reduced to +4.',
      ],
    },
    {
      name: 'Bestow Luck',
      type: '',
      header: 'Bestow Luck',
      description: [
        'You gain an extra use per day of your Defiant Luck ability. You can also use your Inexplicable Luck ability to grant an ally that can see and hear its benefit as an immediate action.',
      ],
    },
    {
      name: 'Black Cat',
      type: 'Su',
      header: 'Black Cat (Su) 7/day',
      description: [
        'Once per day as an immediate action, when you are hit by a melee attack, you can force the opponent who made the attack to reroll it with a –4 penalty. The opponent must take the result of the second attack roll. This is a supernatural ability.',
      ],
    },

    {
      name: 'Luck of Heroes',
      type: '',
      header: 'Luck of Heroes',
      description: [
        'Whenever you spend a hero point to reroll a die roll or to grant yourself a bonus before a die roll is made, there is a chance that the hero point is not spent. Whenever you spend a hero point, roll a d20. If the result is greater than 15, the hero point is not spent. You cannot use this Feat when you use the cheat death Hero Point option.',
      ],
    },

  ]);

  const heroPointAbilities = ref([
    {
      name: 'General Info',
      type: '',
      header: 'General Info',
      description: [
        'Hero Points can be spent at any time and do not require an action to use (although the actions they modify consume part of your character’s turn as normal).',
        'You cannot spend more than 1 hero point during a single round of combat. Whenever a hero point is spent, it can have any one of the following effects.',
      ],
    },
    {
      name: 'Act Out of Turn',
      type: '',
      header: 'Act Out of Turn',
      description: [
        'You can spend a hero point to take your turn immediately. Treat this as a readied action, moving your initiative to just before the currently acting creature. You may only take a move or a standard action on this turn.',
      ],
    },
    {
      name: 'Bonus',
      type: '',
      header: 'Bonus',
      description: [
        'If used before a roll is made, a hero point grants you a +8 luck bonus to any one d20 roll. If used after a roll is made, this bonus is reduced to +4.',
        'You can use a hero point to grant this bonus to another character, as long as you are in the same location and your character can reasonably affect the outcome of the roll (such as distracting a monster, shouting words of encouragement, or otherwise aiding another with the check).',
        'Hero Points spent to aid another character grant only half the listed bonus (+4 before the roll, +2 after the roll).',
      ],
    },
    {
      name: 'Extra Action',
      type: '',
      header: 'Extra Action',
      description: [
        'You can spend a hero point on your turn to gain an additional action.',
      ],
    },
    {
      name: 'Inspiration',
      type: '',
      header: 'Inspiration',
      description: [
        'If you feel stuck at one point in the adventure, you can spend a hero point and petition the GM for a hint about what to do next. If the GM feels that there is no information to be gained, the hero point is not spent.',
      ],
    },
    {
      name: 'Recall',
      type: '',
      header: 'Recall',
      description: [
        'You can spend a hero point to recall a spell you have already cast or to gain another use of a special ability that is otherwise limited. This should only be used on spells and abilities possessed by your character that recharge on a daily basis.',
      ],
    },
    {
      name: 'Reroll',
      type: '',
      header: 'Reroll',
      description: [
        'You may spend a hero point to reroll any one d20 roll you just made. You must take the results of the second roll, even if it is worse.',
      ],
    },
    {
      name: 'Special',
      type: '',
      header: 'Special',
      description: [
        'You can petition the GM to allow a hero point to be used to attempt nearly anything that would normally be almost impossible. Such uses are not guaranteed and should be considered carefully by the GM.',
        'Possibilities include casting a single spell that is one level higher than you could normally cast (or a 1st-level spell if you are not a spellcaster), making an attack that blinds a foe or bypasses its damage reduction entirely, or attempting to use Diplomacy to convince a raging dragon to give up its attack.',
        'Regardless of the desired action, the attempt should be accompanied by a difficult check or penalty on the attack roll.',
        'No additional hero points may be spent on such an attempt, either by the character or her allies.',
      ],
    },
    {
      name: 'Cheat Death',
      type: '',
      header: 'Cheat Death',
      description: [
        'A character can spend 2 hero points to cheat death. How this plays out is up to the GM, but generally the character is left alive, with negative hit points but stable.',
        'For example, a character is about to be slain by a critical hit from an arrow. If the character spends 2 hero points, the GM decides that the arrow pierced the character’s holy symbol, reducing the damage enough to prevent him from being killed, and that he made his stabilization roll at the end of his turn.',
        'Cheating death is the only way for a character to spend more than 1 hero point in a turn. The character can spend hero points in this way to prevent the death of a familiar, animal companion, eidolon, or special mount, but not another character or NPC.',
      ],
    },

  ]);

  const revelationDC = computed(() => 10 + Math.floor(level.value / 2)
    + abilityMods.value.charisma);

  const specialAbilities = ref([
    {
      name: 'Erase from Time',
      type: 'Su',
      header: `Erase from Time (Su)
      (DC ${revelationDC.value})
       ${1 + Math.floor(level.value / 11)}/day`,
      description: [
        'As a melee touch attack, you can temporarily remove a creature from time altogether. The target creature must make a Fortitude save or vanish completely for a number of rounds equal to 1/2 your oracle level (minimum 1 round). No magic or divinations can detect the creature during this time, as it exists outside of time and space—in effect, the creature ceases to exist for the duration of this ability. At the end of the duration, the creature reappears unharmed in the space it last occupied (or the nearest possible space, if the original space is now occupied).',
        'You can use this ability once per day, plus one additional time per day at 11th level.',
      ],
    },
    {
      name: 'Rewind Time',
      type: 'Su',
      header: `Rewind Time (Su)
      (DC ${revelationDC.value})
       ${1 + Math.floor((level.value - 7) / 4)}/day`,
      description: [
        'Once per day as an immediate action, you can reroll any one d20 roll that you have just made before the results of the roll are revealed. You must take the result of the reroll, even if it’s worse than the original roll.',
        'At 11th level, and every four levels thereafter, you can use this ability an additional time per day. You must be at least 7th level to select this revelation.',
      ],
    },
    {
      name: 'Time Sight',
      type: 'Su',
      header: `Time Sight (Su)
       ${level.value} minutes/day`,
      description: [
        'You can peer through the mists of time to see things as they truly are, as if using the true seeing spell.',
        'At 15th level, this functions like moment of prescience.',
        'At 18th level, this functions like foresight.',
        'You can use this ability for a number of minutes per day equal to your oracle level, but these minutes do not need to be consecutive.',
        'You must be at least 11th level to select this revelation.',
      ],
    },
    {
      name: 'Temporal Celerity',
      type: 'Su',
      header: 'Temporal Celerity (Su)',
      description: [
        'Whenever you roll for initiative, you can roll twice and take either result. At 7th level, you can always act in the surprise round, but if you fail to notice the ambush, you act last, regardless of your initiative result (you act in the normal order in following rounds).',
        'At 11th level, you can roll for initiative three times and take any one of the results.',
      ],
    },
    {
      name: 'Misfortune',
      type: 'Ex',
      header: 'Misfortune (Ex) Once per creature/day',
      description: [
        'At 1st level, as an immediate action, you can force a creature within 30 feet to reroll any one d20 roll that it has just made before the results of the roll are revealed. The creature must take the result of the reroll, even if it’s worse than the original roll.',
        'Once a creature has suffered from your misfortune, it cannot be the target of this revelation again for 1 day.',
      ],
    },
    {
      name: 'Fortune',
      type: 'Ex',
      header: `Fortune (Ex)
       ${1 + Math.floor((level.value - 5) / 6)}/day`,
      description: [
        'You can peer through the mists of time to see things as they truly are, as if using the true seeing spell.',
        'At 15th level, this functions like moment of prescience.',
        'At 18th level, this functions like foresight.',
        'You can use this ability for a number of minutes per day equal to your oracle level, but these minutes do not need to be consecutive.',
        'You must be at least 11th level to select this revelation.',
      ],
    },

    {
      name: 'Defensive Roll',
      type: 'Ex',
      header: 'Defensive Roll (Ex)',
      description: [
        'With this advanced talent, the rogue can roll with a potentially lethal blow to take less damage from it than she otherwise would.',
        'Once per day, when she would be reduced to 0 or fewer hit points by damage in combat (from a weapon or other blow, not a spell or special ability), the rogue can attempt to roll with the damage. To use this ability, the rogue must attempt a Reflex saving throw (DC = damage dealt). If the save succeeds, she takes only half damage from the blow; if it fails, she takes full damage.',
        'She must be aware of the attack and able to react to it in order to execute her defensive roll—if she is denied her Dexterity bonus to AC, she can’t use this ability. Since this effect would not normally allow a character to make a Reflex save for half damage, the rogue’s evasion ability does not apply to the defensive roll.',

      ],
    },
  ]);

  const mythicAbilities = ref([
    {
      name: 'Hard to Kill',
      type: 'Ex',
      header: 'Hard to Kill (Ex)',
      description: [
        'Whenever you’re below 0 hit points, you automatically stabilize without needing to attempt a Constitution check. If you have an ability that allows you to act while below 0 hit points, you still lose hit points for taking actions, as specified by that ability. Bleed damage still causes you to lose hit points when below 0 hit points. In addition, you don’t die until your total number of negative hit points is equal to or greater than double your Constitution score.',
      ],
    },
    {
      name: 'Mythic Power',
      type: 'Su',
      header: `Mythic Power (Su) ${mythicPower.value}/day`,
      description: [
        'Mythic characters can draw upon a wellspring of power to accomplish amazing deeds and cheat fate. This power is used by a number of different abilities. Each day, you can expend an amount of mythic power equal to 3 plus double your mythic tier (5/day at 1st tier, 7/day at 2nd, etc.). This amount is your maximum amount of mythic power. If an ability allows you to regain uses of your mythic power, you can never have more than this amount.',
      ],
    },
    {
      name: 'Surge',
      type: 'Su',
      header: 'Surge (Su) +1d8',
      description: [
        'You can call upon your mythic power to overcome difficult challenges. You can expend one use of mythic power to increase any d20 roll you just made by rolling 1d6 and adding it to the result. Using this ability is an immediate action taken after the result of the original roll is revealed. This can change the outcome of the roll. The bonus die gained by using this ability increases to 1d8 at 4th tier, 1d10 at 7th tier, and 1d12 at 10th tier.',
      ],
    },
    {
      name: 'Hard to Kill',
      type: 'Ex',
      header: 'Hard to Kill (Ex)',
      description: [
        'Whenever you’re below 0 hit points, you automatically stabilize without needing to attempt a Constitution check. If you have an ability that allows you to act while below 0 hit points, you still lose hit points for taking actions, as specified by that ability. Bleed damage still causes you to lose hit points when below 0 hit points. In addition, you don’t die until your total number of negative hit points is equal to or greater than double your Constitution score.',
      ],
    },
    {
      name: 'Amazing Initiative',
      type: 'Ex',
      header: 'Amazing Initiative (Ex)',
      description: [
        'At 2nd tier, you gain a bonus on initiative checks equal to your mythic tier. In addition, as a free action on your turn, you can expend one use of mythic power to take an additional standard action during that turn. This additional standard action can’t be used to cast a spell. You can’t gain an extra action in this way more than once per round.',
      ],
    },
    {
      name: 'Recuperation',
      type: 'Ex',
      header: 'Recuperation (Ex)',
      description: [
        'At 3rd tier, you are restored to full hit points after 8 hours of rest so long as you aren’t dead. In addition, by expending one use of mythic power and resting for 1 hour, you regain a number of hit points equal to half your full hit points (up to a maximum of your full hit points) and regain the use of any class features that are limited to a certain number of uses per day (such as barbarian rage, bardic performance, spells per day, and so on). This rest is treated as 8 hours of sleep for such abilities. This rest doesn’t refresh uses of mythic power or any mythic abilities that are limited to a number of times per day.',
      ],
    },
    {
      name: 'Inspired Spell',
      type: 'Su',
      header: 'Inspired Spell (Su)',
      description: [
        'As a standard action, you can expend one use of mythic power to cast any one divine spell without expending a prepared spell or spell slot.',
        'The spell must be on one of your divine class spell lists (or your domain or mystery spell list), must be of a level that you can cast with that divine spellcasting class, and must have a casting time of “1 standard action” (or less). You don’t need to have the spell prepared, nor does it need to be on your list of spells known.',
        'When casting a spell in this way, you treat your caster level as 2 levels higher for the purpose of any effect dependent on level.',
        'You can apply any metamagic feats you know to this spell, but its total adjusted level can’t be greater than that of the highest-level divine spell you can cast from that spellcasting class.',
      ],
    },

  ]);

  return {
    name,
    introduction,
    defense,
    offense,
    tactics,
    statistics,
    gear,
    ecology,
    miscellaneous,
    // TODO
    initiative,
    cr,
    xp,
    maxHP,
    ac,
    acBonuses,
    savingThrows,
    melee,
    ranged,
    baseAtk,
    cmb,
    cmd,
    skills,
    abilityScores,
    abilityMods,
    featDescriptions,
    specialAbilities,
    heroPointAbilities,
    toggle,
    mythicTier,
    mythicFlag,
    mythicPower,
    mythicPath,
    mythicAbilities,
    modifiers,
  };
});

const immogen = character.value;

const metaData = reactive({
  title: character.value.name,
});
useMeta(metaData);

</script>

<style scoped>

#page {
  text-shadow: 2px 2px 4px #000000;
  color: white;
  text-align: left;
  align-items: baseline;
  padding: 1vmin;
  background: url("../assets/immogen.webp") no-repeat center center;
  justify-content: space-between;
  background-size: cover;
}

</style>
