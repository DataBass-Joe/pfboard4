<template>
  <BaseSheet3 :character="aaron"/>
</template>

<script setup>
import BaseSheet3 from 'components/BaseSheet3.vue';
import {
  computed, ref, reactive,
} from 'vue';
import {useMeta} from 'quasar';

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
  const name = ref("Frey");
  const solo = ref(true);
  const traits = ref([
    "fate's favored",
    {
      name: "reactionary",
      bonusType: "trait",
      bonus: {
        initiative: 2,
      },
    },
  ]);
  const alignment = ref("CG");

  const heritage = ref("Human");
  const heritageTraits = ref([]);
  const type = ref("humanoid");
  const subtype = ref(["human"]);
  const senses = ref([""]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("medium");
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: "Great Club",
      weaponGroup: "one handed",
      damage: -6,
      dieCount: 2,
      dieSize: 12,
      critRange: 20,
      critMult: 3,
    },
  ]);
  const charRanged = ref([]);

  const mythicTier = ref(0);
  const mythicFlag = ref(false);
  const mythicPower = ref(3 + 2 * mythicTier.value);

  const mythicPath = reactive({
    feats: {},
  });

  const charGear = reactive({
    "breastplate": {
      price: 100,
      weight: 25,
      group: "medium",
      bonusType: "armor",
      bonus: {
        ac: 6,
        ffAC: 6,
        acp: -3,
        maxDex: 4,
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
        name: "fighter",
        archetype: ["high gaurdian"],
        level: 5,
        hitDie: 10,
        bab: 1,
        first: true,
        skillRanks: 1,
        classSkills: ["Acrobatics", "Athletics"],
        favored: {
          hp: 0,
          skill: 4,
          race: {
            human: 0,
          },
        },
        saves: {
          fortitude: true,
          reflex: false,
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

  const level = computed(() =>
    introduction.class.reduce(
      (accumulator, cur) =>
        cur.gestalt ?? false
          ? Math.max(accumulator, cur.level)
          : accumulator + cur.level,
      0
    )
  );
  // TODO
  const defense = {
    defensiveAbilities: `+${Math.max(
      Math.floor((level.value - 2) / 4 + 1),
      1
    )} on Will saves against compulsion`,
    dr: "",
    resist: "",
    sr: "",
    weaknesses: "",
    saveAbilityScore: {
      fortitude: "constitution",
      reflex: "dexterity",
      will: "wisdom",
    },
  };
  const offense = {
    speed: speed.value,
    space: space.value,
    reach: reach.value,
    melee: charMelee.value,
    ranged: charRanged.value,
  };
  const tactics = "";
  const statistics = {
    abilityScore: {
      strength: {
        pointBuy: 16,
      },
      dexterity: {
        pointBuy: 13,
      },
      constitution: {
        pointBuy: 17,
      },
      intelligence: {
        pointBuy: 11,
      },
      wisdom: {
        pointBuy: 9,
      },
      charisma: {
        pointBuy: 16,
      },
    },
    feats: {
      "Intimidating Prowess": {
        bonusType: "",
        bonus: {
          influence: 4,
        },
      },
      "Weapon Focus": {
        bonusType: "",
        bonus: {
          attackRolls: 1,
        },
      },
      "Weapon Specialization": {
        bonusType: "",
        bonus: {
          weaponDamage: 2,
        },
      },
      Outflank: {
        bonusType: "",
        bonus: {},
      },
    },
    skills: {
      acrobatics: {
        ranks: 0,
        ability: "dexterity",
      },
      athletics: {
        ranks: level.value,
        ability: "strength",
      },
      finesse: {
        ranks: 0,
        ability: "dexterity",
      },
      influence: {
        ranks: level.value,
        ability: "charisma",
      },
      nature: {
        ranks: 1,
        ability: "intelligence",
      },
      perception: {
        ranks: 0,
        ability: "wisdom",
      },
      performance: {
        ranks: 0,
        ability: "charisma",
      },
      religion: {
        ranks: 1,
        ability: "intelligence",
      },
      society: {
        ranks: level.value,
        ability: "intelligence",
      },
      spellcraft: {
        ranks: 1,
        ability: "intelligence",
      },
      stealth: {
        ranks: 0,
        ability: "dexterity",
      },
      survival: {
        ranks: 1,
        ability: "wisdom",
      },
    },
    languages: "",
    specialQualities: "",
  };
  const gear = charGear;
  const ecology = "";
  // ecology: {
  //   environment: '',
  //   organization: '',
  //   treasure: '',
  // },
  const miscellaneous = "";

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
      name: "two handing",
      bonusType: "",
      duration: 2,
      active: true,
      bonus: {
        // TODO strength / 2
        weaponDamage: Math.floor(4 / 2),
      },
    },
    {
      name: "Power Attack",
      bonusType: "PowerAttack",
      active: true,
      duration: 1,
      bonus: {
        attackRolls: -Math.floor(baseAtk.value / 4) - 1,
        weaponDamage: 3 * (Math.floor(baseAtk.value / 4) + 1),
      },
    },
  ]);

  const charMods = reactive({
    human: {
      bonusType: "racial",
      bonus: {
        strength: 2,
        constitution: 2,
      },
    },
    weaponTraining: {
      bonusType: "",
      bonus: {
        attackRolls: 1,
        weaponDamage: 1,
      },
    },
    abpWeapon: {
      bonusType: "enhancement",
      bonus: {
        attackRolls: 1,
        weaponDamage: 1,
      },
    },
    abpAbilityScores: {
      bonusType: "enhancement",
      bonus: {
        strength: 2,
        dexterity: 0,
        constitution: 0,
        intelligence: 2,
        wisdom: 0,
        charisma: 0,
      },
    },
    abpResistance: {
      bonusType: "resistance",
      bonus: {
        saves: 1,
      },
    },
    abpNaturalArmor: {
      bonusType: "naturalArmorEnhancement",
      bonus: {
        ac: 0,
        ffAC: 0,
      },
    },
    abpDeflection: {
      bonusType: "deflection",
      bonus: {
        ac: 1,
        ffAC: 1,
        touchAC: 1,
      },
    },
    abpShield: {
      bonusType: "shieldEnhancement",
      bonus: {
        ac: 0,
        ffAC: 0,
      },
    },
    abpArmor: {
      bonusType: "armorEnhancement",
      bonus: {
        ac: 1,
        ffAC: 1,
      },
    },
    levelUp: {
      bonusType: "inherent",
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
        if (
          typeof myObj[button].bonus !== "undefined" &&
          myObj[button].active !== false
        ) {
          modifiersHolder.ac = modifiersHolder.ac ?? {};
          if (myObj[button].bonus.ac) {
            modifiersHolder.ac[myObj[button].bonusType] =
              modifiersHolder.ac[myObj[button].bonusType] ?? [];
            modifiersHolder.ac[myObj[button].bonusType].push(
              myObj[button].bonus.ac
            );
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

    const stackableTypes = ref(["dodge", "circumstance", "untyped"]);

    const modifiersHolderKeys = ref(Object.keys(modifiersHolder));

    modifiersHolderKeys.value.forEach((bonusTarget) => {
      const bonusTargetKeys = ref(Object.keys(modifiersHolder[bonusTarget]));
      bonusTargetKeys.value.forEach((bonusType) => {
        holder[bonusTarget] = holder[bonusTarget] ?? {};
        holder[bonusTarget][bonusType] = holder[bonusTarget][bonusType] ?? 0;
        holder[bonusTarget][bonusType] += modifiersHolder[bonusTarget][
          bonusType
          ].reduce(
          (accumulator, cur) =>
            cur >= 0 || !(bonusType in stackableTypes.value)
              ? Math.max(accumulator, cur)
              : accumulator + cur,
          0
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
        if (
          typeof myObj[button].bonus !== "undefined" &&
          myObj[button].active !== false
        ) {
          const bonusKeys = ref(Object.keys(myObj[button].bonus));
          bonusKeys.value.forEach((key) => {
            modifiersHolder[key] = modifiersHolder[key] ?? {};
            modifiersHolder[key][myObj[button].bonusType] =
              modifiersHolder[key][myObj[button].bonusType] ?? [];
            modifiersHolder[key][myObj[button].bonusType].push(
              myObj[button].bonus[key]
            );
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

    const stackableTypes = ref(["dodge", "circumstance", "untyped"]);

    const modifiersHolderKeys = ref(Object.keys(modifiersHolder));

    modifiersHolderKeys.value.forEach((bonusTarget) => {
      const bonusTargetKeys = ref(Object.keys(modifiersHolder[bonusTarget]));
      bonusTargetKeys.value.forEach((bonusType) => {
        holder[bonusTarget] = holder[bonusTarget] ?? 0;
        holder[bonusTarget] += modifiersHolder[bonusTarget][bonusType].reduce(
          (accumulator, cur) =>
            cur >= 0 && !(bonusType in stackableTypes.value)
              ? Math.max(accumulator, cur)
              : accumulator + cur,
          0
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
    let tempCMB =
      abilityMods.value.strength + baseAtk.value + sizeModifier.value;

    tempCMB += modifiers.value.attackRolls ?? 0;

    return tempCMB;
  });
  const cmd = computed(
    () =>
      10 +
      abilityMods.value.dexterity +
      abilityMods.value.strength +
      baseAtk.value +
      sizeModifier.value
  );

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
        if (classSkill === skillKey && skillRanks[skillKey].ranks >= 1)
          totalSkills[skillKey] += 3;
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

  const cr = ref("");
  const xp = ref(null);

  // eslint-disable-next-line max-len
  const initiative = computed(
    () => abilityMods.value.dexterity + (modifiers.value.initiative ?? 0)
  );

  // DEFENSE

  const ac = computed(() => {
    const tempAC = 10 + sizeModifier.value;

    return reactive({
      default: tempAC + (modifiers.value.ac ?? 0) + abilityMods.value.dexterity,
      touch:
        tempAC + (modifiers.value.touchAC ?? 0) + abilityMods.value.dexterity,
      "flat-footed": tempAC + (modifiers.value.ffAC ?? 0),
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
          hitPoints +=
            (charClass.level - 1) * Math.ceil((charClass.hitDie + 1) / 2);
        } else {
          hitPoints += charClass.level * Math.ceil((charClass.hitDie + 1) / 2);
        }
        if (typeof charClass.favored !== "undefined") {
          if (typeof charClass.favored.hp !== "undefined") {
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
        maxCharSaves[save] = charClass.saves[save] || maxCharSaves[save];
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

    if (toggle["two handing"]?.active) twoHanding = 1;

    const tempMeleeAttack = ref(
      Math.max(abilityMods.value.dexterity, abilityMods.value.strength) +
      baseAtk.value +
      sizeModifier.value
    );
    const tempMeleeDamage = ref(
      Math.floor(abilityMods.value.strength * (1 + 0.5 * twoHanding))
    );

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
      Object.keys(meleeOption).forEach((meleeAttr) => {
        option.value[meleeAttr] = meleeOption[meleeAttr];
      });
      option.value.attack += tempMeleeAttack.value;
      option.value.damage +=
        option.value.weaponGroup === "light"
          ? Math.max(tempMeleeDamage.value, tempDexDamage.value)
          : tempMeleeDamage.value;
      option.value.dieSize -= dieSizeMod.value;
      mOptions.value.push(option.value);
    });

    return mOptions.value;
  });

  const ranged = computed(() => {
    const tempRangedAttack = ref(
      Math.max(abilityMods.value.dexterity, abilityMods.value.strength) +
      baseAtk.value +
      sizeModifier.value +
      (modifiers.value.attackRolls ?? 0)
    );
    const tempRangedDamage = ref(
      abilityMods.value.strength + (modifiers.value.weaponDamage ?? 0)
    );

    const dieSizeMod = ref(sizeModifier.value);

    const rOptions = ref([]);

    offense.ranged.forEach((rangedOption) => {
      const option = ref({
        attack: 0,
        damage: 0,
      });
      Object.keys(rangedOption).forEach((rangedAttr) => {
        option.value[rangedAttr] = rangedOption[rangedAttr];
      });
      option.value.attack += tempRangedAttack.value;
      option.value.damage +=
        tempRangedDamage.value + rangedOption.weaponDamage.value;
      option.value.dieSize -= dieSizeMod.value;
      rOptions.value.push(option.value);
    });

    return rOptions.value;
  });

  const specialAttacks = "";

  const featDescriptions = ref([
    {
      name: "bodygaurd",
      type: "combat",
      header: "Bodygaurd",
      description: [
        "When an adjacent ally is attacked, you may use an attack of opportunity to attempt the aid another action to improve your ally’s AC. You may not use the aid another action to improve your ally’s attack roll with this attack.",
      ],
    },
    {
      name: "in harm's way",
      type: "combat",
      header: "In Harm's Way",
      description: [
        "While using the aid another action to improve an adjacent ally’s AC, you can intercept a successful attack against that ally as an immediate action, taking full damage from that attack and any associated effects (bleed, poison, etc.).",
        "A creature cannot benefit from this feat more than once per attack.",
      ],
    },
  ]);

  const specialAbilities = ref([
    {
      name: "difficult swings",
      type: "combat",
      header: "Difficult Swings (Weapon Mastery)",
      description: [
        "When you use all of your actions in a round to attack, you can force creatures to treat squares adjacent to you as difficult terrain until the beginning of your next turn.",
        "You can choose to allow any creature you are aware of to ignore the difficult terrain you effectively create with this feat.",
      ],
    },
    {
      name: "weapon training",
      type: "Ex",
      header: "Weapon Training (Ex)",
      description: [
        "Starting at 5th level, a fighter can select one group of weapons, as noted below. Whenever he attacks with a weapon from this group, he gains a +1 bonus on attack and damage rolls.",
      ],
    },
    {
      name: "obligation",
      type: "Ex",
      header: "Obligation (Ex)",
      description: [
        "At 1st level, a high guardian can spend 1 minute of focused concentration each day to select a single ally as his obligation, vowing to keep that person alive for that day. Once he has chosen, he can’t change his obligation until the following day.",
        "If his obligation dies, the high guardian must atone for 1 week before he can select another obligation.",
      ],
    },
    {
      name: "right hand",
      type: "Ex",
      header: "Right Hand (Ex)",
      description: [
        "At 1st level, a high guardian can take a 5-foot step as an immediate action, as long as he ends this movement adjacent to his obligation. If he takes this step, he cannot take a 5-foot step during his next turn and his total movement is reduced by 5 feet during his next turn.",
        "This ability replaces the bonus feat gained at 1st level.",
      ],
    },
    {
      name: "defender’s reflexes",
      type: "Ex",
      header: "Defender’s Reflexes (Ex)",
      description: [
        "At 2nd level, a high guardian gains Combat Reflexes as a bonus feat, and he can use his Strength modifier instead of his Dexterity modifier to determine the number of additional attacks of opportunity he can make per round. If he already has Combat Reflexes, he instead gains Stand Still as a bonus feat.",
        "This ability replaces the bonus feat gained at 2nd level.",
      ],
    },
    {
      name: "unassailable allegiance",
      type: "Ex",
      header: "Unassailable Allegiance (Ex)",
      description: [
        "At 2nd level, a high guardian gains a +1 bonus on Will saves against compulsion spells and effects. This bonus increases by 1 for every 4 fighter levels beyond 2nd.",
        "This ability replaces bravery.",
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
