<template>
  <BaseSheet3
    :character="aaron"
  />
</template>

<script setup>
import BaseSheet3 from 'components/BaseSheet3.vue';
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
  const name = ref('Gorthor');
  const solo = ref(true);
  const traits = ref([
    'fate\'s favored',
    {
      name: 'reactionary',
      bonusType: 'trait',
      bonus: {
        initiative: 2,
      },
    },
  ]);
  const alignment = ref('CG');

  const heritage = ref('Dragonborn');
  const heritageTraits = ref([
    {
      name: 'Armored Scales',
      bonusType: 'naturalArmor',
      bonus: {
        ac: 1,
        ffAC: 1,
      },
    },
  ]);
  const type = ref('humanoid');
  const subtype = ref(['reptilian']);
  const senses = ref(['darkvision 60ft.']);
  const aura = ref('');
  const speed = ref(30);

  const size = ref('medium');
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: 'Handaxe',
      weaponGroup: 'light',
      attackCount: 0,
      attackPenalty: 0,

      dieCount: 1,
      dieSize: 6,
      critRange: 20,
      critMult: 3,
    },
  ]);
  const charRanged = ref([
    {
      name: 'Shuriken',
      weaponGroup: 'thrown',
      attackCount: 0,
      attackPenalty: 0,
      dieCount: 1,
      dieSize: 2,
      critRange: 20,
      critMult: 2,
    },
    {
      name: 'Flurry of Stars',
      weaponGroup: 'thrown',
      attackCount: 2,
      attackPenalty: -2,
      dieCount: 1,
      dieSize: 2,
      critRange: 20,
      critMult: 2,
    },
  ]);

  const mythicTier = ref(0);
  const mythicFlag = ref(false);
  const mythicPower = ref(3 + (2 * mythicTier.value));

  const mythicPath = reactive({
    feats: {},
  });

  const charGear = reactive({
    'Chain Shirt': {
      price: 100,
      weight: 25,
      group: 'light',
      bonusType: 'armor',
      bonus: {
        ac: 4,
        ffAC: 4,
        acp: -2,
        maxDex: 4,
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
        name: 'ninja',
        level: 5,
        hitDie: 8,
        bab: 3 / 4,
        first: true,
        skillRanks: 4,
        classSkills: [
          'Acrobatics',
          'Finesse',
          'Influence',
          'Perception',
          'Society',
          'Stealth',
        ],
        favored: {
          hp: 0,
          skill: 5,
          race: {
            dragonborn: 0,
          },
        },
        saves: {
          fortitude: false,
          reflex: true,
          will: false,
        },
        gestalt: false,
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
        pointBuy: 15,

      },
      constitution: {
        pointBuy: 13,

      },
      intelligence: {
        pointBuy: 12,

      },
      wisdom: {
        pointBuy: 13,

      },
      charisma: {
        pointBuy: 14,
      },
    },
    feats: {
      'Two Weapon Fighting': {
        bonusType: '',
        bonus: {
          reflex: 0,
        },
      },
      'Double Slice': {
        bonusType: '',
        bonus: {},
      },
      Outflank: {
        bonusType: '',
        bonus: {},
      },
    },
    skills: {
      acrobatics: {
        ranks: level.value,
        ability: 'dexterity',
      },
      athletics: {
        ranks: 1,
        ability: 'strength',
      },
      finesse: {
        ranks: level.value,
        ability: 'dexterity',
      },
      influence: {
        ranks: level.value,
        ability: 'charisma',
      },
      nature: {
        ranks: 1,
        ability: 'intelligence',
      },
      perception: {
        ranks: level.value,
        ability: 'wisdom',
      },
      performance: {
        ranks: 0,
        ability: 'charisma',
      },
      religion: {
        ranks: 1,
        ability: 'intelligence',
      },
      society: {
        ranks: level.value,
        ability: 'intelligence',
      },
      spellcraft: {
        ranks: 1,
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
      name: 'Two-Weapon Fighting',
      bonusType: '',
      duration: 2,
      active: true,
      bonus: {
        attackRolls: -2,
        attackCount: 1,
      },
    },
    {
      name: 'Power Attack',
      bonusType: 'PowerAttack',
      active: false,
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
        strength: 2,
      },
    },
    abpWeapon: {
      bonusType: 'enhancement',
      bonus: {
        attackRolls: 1,
        weaponDamage: 1,
      },
    },
    abpAbilityScores: {
      bonusType: 'enhancement',
      bonus: {
        strength: 0,
        dexterity: 2,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 2,
      },
    },
    abpResistance: {
      bonusType: 'resistance',
      bonus: {
        saves: 1,
      },
    },
    abpNaturalArmor: {
      bonusType: 'naturalArmorEnhancement',
      bonus: {
        ac: 0,
        ffAC: 0,
      },
    },
    abpDeflection: {
      bonusType: 'deflection',
      bonus: {
        ac: 1,
        ffAC: 1,
        touchAC: 1,
      },
    },
    abpShield: {
      bonusType: 'shieldEnhancement',
      bonus: {
        ac: 0,
        ffAC: 0,

      },
    },
    abpArmor: {
      bonusType: 'armorEnhancement',
      bonus: {
        ac: 1,
        ffAC: 1,
      },
    },
    'No Trace': {
      bonusType: 'Insight',
      bonus: {
        performance: 1,
        stealth: 1,
      },
    },
    levelUp: {
      bonusType: 'inherent',
      bonus: {
        constitution: 1,
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

  const attackCount = computed(() => {
    let tempattackCount = 1;

    tempattackCount += modifiers.value.attackCount ?? 0;

    // tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

    return tempattackCount;
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
      athletics: 0,
      finesse: 0,
      influence: 0,
      nature: 0,
      perception: 0,
      performance: 0,
      religion: 0,
      society: 0,
      spellcraft: 0,
      stealth: 0,
      survival: 0,
    };

    if (sizeModifier.value !== 0) {
      totalSkills.fly += (Math.log2(sizeModifier.value) + 1) * 2;
      totalSkills.stealth += (Math.log2(sizeModifier.value) + 1) * 4;
    }

    const tempClassSkills = ref(introduction.class[0].classSkills);

    const keys = Object.keys(totalSkills);

    const summarySkills = {};

    keys.forEach((skillKey) => {
      tempClassSkills.value.forEach((classSkill) => {
        if (classSkill === skillKey && skillRanks[skillKey].ranks >= 1) totalSkills[skillKey] += 3;
      });

      totalSkills[skillKey] += skillRanks[skillKey].ranks;
      totalSkills[skillKey] += abilityMods.value[skillRanks[skillKey].ability];
      totalSkills[skillKey] += modifiers.value[skillKey] ?? 0;
      totalSkills[skillKey] += modifiers.value.skills ?? 0;

      if (skillRanks[skillKey].ranks >= 1) {
        summarySkills[skillKey] = totalSkills[skillKey];
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
      }
      maxHitDie = Math.max(charClass.hitDie, maxHitDie);
    });

    if (introduction.solo) {
      hitPoints = maxHitDie * level.value;
    }

    hitPoints += level.value * abilityMods.value.constitution;

    hitPoints += modifiers.value.hp ?? 0;

    return hitPoints;
  });

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
    const tempRangedAttack = ref(Math.max(abilityMods.value.dexterity)
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

  const specialAttacks = reactive([
    {
      name: `sneak attack (+${Math.floor((level.value + 1) / 2)}d6`,
    },
    {
      name: `Breath Weapon (1/day) (30-ft. line, +${Math.max(Math.floor(level.value / 2), 1) + abilityMods.value.charisma}, ${level.value}d6`,
    },
  ]);

  const featDescriptions = ref([
    {
      name: 'two-weapon fighting',
      type: 'combat',
      header: 'Two-Weapon Fighting',
      description: [
        'Your penalties on attack rolls for fighting with two weapons are reduced. The penalty for your primary hand lessens by 2 and the one for your off hand lessens by 6',
      ],
    },
    {
      name: 'double slice',
      type: 'combat',
      header: 'Double Slice',
      description: [
        'Add your Strength bonus to damage rolls made with your off-hand weapon.',
      ],
    },
    {
      name: 'far shot',
      type: 'combat',
      header: 'Far Shot',
      description: [
        'You only suffer a –1 penalty per full range increment between you and your target when using a ranged weapon.',
        'Shurikens have a range increment of 10 feet',
      ],
    },
  ]);

  const specialAbilities = ref([
    {
      name: 'bleeding attack',
      type: 'Combat',
      header: 'Bleeding Attack',
      description: [
        'A ninja with this trick can cause living opponents to bleed by hitting them with a sneak attack.',
        'This attack causes the target to take an additional 2 points of bleed damage per sneak attack die',
        'If a creature takes an amount of bleed damage equal to their constitution score, the creature sustains an amount of damage equal to half their maximum HP',
      ],
    },
    {
      name: 'Sneak Attack',
      type: '',
      header: 'Sneak Attack +1d6',
      description: [
        'If a ninja can catch an opponent when he is unable to defend himself effectively from her attack, she can strike a vital spot for extra damage.',
        'The ninja’s attacks deal extra damage anytime her target would be denied a Dexterity bonus to AC (whether the target actually has a Dexterity bonus or not), or when the ninja flanks her target. This extra damage is 1d6 at 1st level, and increases by 1d6 every two ninja levels thereafter. Bonus damage from sneak attacks is precision damage. Should the ninja score a critical hit with a sneak attack, this precision damage is not multiplied. Ranged attacks count as sneak attacks only if the target is within 30 feet.',
        'With a weapon that deals nonlethal damage (such as a sap, unarmed strike, or whip), a ninja can make a sneak attack that deals nonlethal damage instead of lethal damage. She cannot use a weapon that deals lethal damage to deal nonlethal damage in a sneak attack, even with the usual –4 penalty.',
        'The ninja must be able to see the target well enough to pick out a vital spot, and must be able to reach this spot. A ninja cannot sneak attack while striking a creature that has concealment.',
      ],
    },
    {
      name: 'Breath Weapon',
      type: '',
      header: `Breath Weapon, +${Math.max(Math.floor(level.value / 2), 1) + abilityMods.value.charisma}, ${level.value}d6 (2 ki points)`,
      description: [
        'This breath weapon deals 1d6 points of damage of your energy type per sorcerer level. Those caught in the area of the breath receive a Reflex save for half damage. The DC of this save is equal to 10 + 1/2 your character level + your Charisma modifier.',
        'The shape of the breath weapon depends on your dragon type (as indicated on the above chart). At 9th level, you can use this ability twice per day. At 17th level, you can use this ability three times per day. At 20th level, you can use this ability four times per day.',
        'Alternatively, you may use 2 ki points to use the breath attack again',
      ],
    },
    {
      name: 'ki pool',
      type: 'Su',
      header: `Ki Pool (Su) +${Math.max(Math.floor(level.value / 2), 1) + abilityMods.value.charisma}/day`,
      description: [
        'At 2nd level, a ninja gains a pool of ki points, supernatural energy she can use to accomplish amazing feats. The number of points in the ninja’s ki pool is equal to 1/2 her ninja level + her Charisma modifier.',
        'As long as she has at least 1 point in her ki pool, she treats any Acrobatics skill check made to jump as if she had a running start. At 10th level, she also reduces the DC of Acrobatics skill checks made to jump by 1/2 (although she still cannot move farther than her speed allows).',
        'By spending 1 point from her ki pool, a ninja can make one additional attack during a two-weapon fighting attack. In addition, she can spend 1 point to increase her speed by 20 feet for 1 round.',
        'Finally, a ninja can spend 1 point from her ki pool to give herself a +4 insight bonus on Stealth checks for 1 round. Each of these powers is activated as a swift action. A ninja can gain additional powers that consume points from her ki pool by selecting certain ninja tricks.',
      ],
    },
    {
      name: 'vanishing trick',
      type: 'Su',
      header: 'Vanishing Trick (Su) (1 ki point)',
      description: [
        'As a single action, the ninja can disappear for 1 round per level.',
        'This ability functions as invisibility. Using this ability uses up 1 ki point.',
      ],
    },
    {
      name: 'flurry of stars',
      type: 'Ex',
      header: 'Flurry of Stars Trick (Ex) (1 ki point)',
      description: [
        'A ninja with this ability can expend 1 ki point from her ki pool and use 3 actions to attack with many shuriken.',
        'During that attack, she can throw two additional shuriken at her highest attack bonus, but all of her shuriken attacks are made at a –2 penalty, including the two extra attacks.',
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
    specialAttacks,
    baseAtk,
    cmb,
    cmd,
    skills,
    abilityScores,
    abilityMods,
    featDescriptions,
    specialAbilities,
    // heroPointAbilities,
    toggle,
    mythicTier,
    mythicFlag,
    mythicPower,
    mythicPath,
    // mythicAbilities,
    modifiers,
    attackCount,
  };
});

const aaron = character.value;

const metaData = reactive({
  title: character.value.name,
});
useMeta(metaData);

</script>

<style scoped>

#page {

}

</style>
