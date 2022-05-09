import {defineStore} from "pinia";
import {computed, reactive, ref} from "vue";

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

function acBonusesCalc(toggle, charMods, charGear, feats, traits, heritageTraits) {
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
  modifierLoop(charMods);
  modifierLoop(charGear);
  modifierLoop(feats);
  modifierLoop(traits.value);
  modifierLoop(heritageTraits.value);

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
}
function modifiersCalc(toggle, charMods, charGear, feats, traits, heritageTraits) {
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
  modifierLoop(charMods);
  modifierLoop(charGear);
  modifierLoop(feats);
  modifierLoop(traits.value);
  modifierLoop(heritageTraits.value);

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
}

function abilityScoresCalc(pointBuy, modifiers) {
  const husk = reactive({
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  });

  const objectHusk = reactive(pointBuy);

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
}
function abilityModsCalc(abilityScores) {
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
}

// STATISTICS
function cmbCalc(abilityMods, baseAtk, sizeModifier, modifiers) {
  let tempCMB =
    abilityMods.value.strength + baseAtk.value + sizeModifier.value;

  tempCMB += modifiers.value.attackRolls ?? 0;

  return tempCMB;
}
function cmdCalc(abilityMods, baseAtk, sizeModifier, modifiers, acBonuses) {
  let tempCMD = 10 +
    abilityMods.value.dexterity +
    abilityMods.value.strength +
    baseAtk.value +
    sizeModifier.value ;

  tempCMD += modifiers.value.cmd ?? 0;

  const miscMods = ['circumstance', 'deflection', 'dodge', 'insight', 'luck', 'morale', 'profane', 'sacred'];

  for (const miscModsKey of miscMods) {

    tempCMD += acBonuses.value[miscModsKey] ?? 0;

  }

  return tempCMD
}
function skillsCalc(abilityMods, sizeModifier, modifiers, skillPoints, charClasses) {
  const skillRanks = skillPoints;

  const totalSkills = {
    acrobatics: 0,
    appraise: 0,
    bluff: 0,
    climb: 0,
    craft: 0,
    diplomacy: 0,
    "disable device": 0,
    disguise: 0,
    "escape artist": 0,
    fly: 0,
    "handle animal": 0,
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
    "sense motive": 0,
    "slight of hand": 0,
    spellcraft: 0,
    stealth: 0,
    survival: 0,
    swim: 0,
    "use magic device": 0,
  };

  if (sizeModifier !== 0) {
    totalSkills.fly += (Math.log2(sizeModifier.value) + 1) * 2;
    totalSkills.stealth += (Math.log2(sizeModifier.value) + 1) * 4;
  }

  const tempClassSkills = ref(charClasses.value[0].classSkills);

  const {knowledge} = skillPoints;

  const knowledgeKeys = Object.keys(knowledge);

  const keys = Object.keys(totalSkills);

  const summarySkills = {};

  keys.forEach((skillKey) => {
    tempClassSkills.value.forEach((classSkill) => {
      if (classSkill === skillKey && skillRanks[skillKey].ranks >= 1) totalSkills[skillKey] += 3;
      if (classSkill === skillKey && classSkill === "knowledge") {
        knowledgeKeys.forEach((knowledgeSkillKey) => {
          if (skillRanks.knowledge[knowledgeSkillKey].ranks >= 1) {
            totalSkills.knowledge[knowledgeSkillKey] += 3;
          }
        });
      }
    });
    if (skillKey === "knowledge") {
      knowledgeKeys.forEach((knowledgeSkillKey) => {
        totalSkills.knowledge[knowledgeSkillKey] += skillRanks.knowledge[knowledgeSkillKey].ranks;
        totalSkills.knowledge[knowledgeSkillKey] += abilityMods.value[skillRanks.knowledge[knowledgeSkillKey].ability];
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
}
function initiativeCalc(abilityMods, modifiers) {
  return abilityMods.value.dexterity + (modifiers.value.initiative ?? 0)
}

// DEFENSE
function acCalc(abilityMods, modifiers, sizeModifier) {
  const tempAC = 10 + sizeModifier.value;

  return {
    default: tempAC + (modifiers.value.ac ?? 0) + abilityMods.value.dexterity,
    touch:
      tempAC + (modifiers.value.touchAC ?? 0) + abilityMods.value.dexterity,
    "flat-footed": tempAC + (modifiers.value.ffAC ?? 0),
  };
}
function maxHPCalc(abilityMods, modifiers, charClasses, solo, level) {
  let hitPoints = 0;

  let maxHitDie = 0;

  charClasses.value.forEach((charClasses) => {
    if (charClasses.gestalt !== true) {
      if (charClasses.first) {
        hitPoints += charClasses.hitDie;
        hitPoints +=
          (charClasses.level - 1) * Math.ceil((charClasses.hitDie + 1) / 2);
      } else {
        hitPoints += charClasses.level * Math.ceil((charClasses.hitDie + 1) / 2);
      }
      if (typeof charClasses.favored !== "undefined") {
        if (typeof charClasses.favored.hp !== "undefined") {
          hitPoints += charClasses.favored.hp;
        }
      }
    } else {
      maxHitDie = Math.max(charClasses.hitDie, maxHitDie);
    }
  });

  if (solo.value) {
    hitPoints = maxHitDie * level;
  }

  hitPoints += level.value * abilityMods.value.constitution;

  hitPoints += modifiers.value.hp ?? 0;

  return hitPoints;
}
function savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level) {
  const totalSaves = {
    fortitude: 0,
    reflex: 0,
    will: 0,
  };

  let allBonus = 0;

  allBonus += modifiers.value.saves ?? 0;

  const saveKeys = Object.keys(saveAbilityScore);

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
    totalSaves[save] += abilityMods.value[saveAbilityScore[save]];
    totalSaves[save] += allBonus;
  });

  return totalSaves;
}

// OFFENSE
function meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier) {
  let twoHanding = 0;

  const tempMeleeAttack = ref(
    Math.max(abilityMods.value.dexterity, abilityMods.value.strength) +
    baseAtk.value +
    sizeModifier.value
  );
  const tempMeleeDamage = ref(
    Math.floor(abilityMods.value.strength * (1 + 0.5 * twoHanding))
  );

  const tempDexDamage = ref(Math.floor(abilityMods.value.dexterity));

  // if (toggle["power attack"]?.active) {
  //   tempMeleeAttack.value += -(Math.floor(baseAtk.value / 4) + 1);
  //   // eslint-disable-next-line no-unused-vars
  //   tempMeleeDamage.value +=
  //     (Math.floor(baseAtk.value / 4) + 1) * (2 + twoHanding);
  //   // tempDexDamage += (Math.floor(baseAtk.value / 4) + 1) * 2;
  // }
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

  charMelee.value.forEach((meleeOption) => {
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
    mOptions.value.push(option.value);
  });

  return mOptions.value;
}
function rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier) {
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

  charRanged.value.forEach((rangedOption) => {
    const option = ref({
      attack: 0,
      damage: 0,
    });
    Object.keys(rangedOption).forEach((rangedAttr) => {
      option.value[rangedAttr] = rangedOption[rangedAttr];
    });
    option.value.attack += tempRangedAttack.value;
    option.value.damage += tempRangedDamage.value;
    option.value.dieSize -= dieSizeMod.value;
    rOptions.value.push(option.value);
  });

  return rOptions.value;
}


const rub = computed(() => {
  const name = ref("Rub");
  const solo = ref(false);
  const traits = ref([
    {
      name: "Fire Hand",
      bonusType: "racialTrait",
      bonus: {
        attackRolls: 1,
      },
    },
    {
      name: "Strength of Submission",
      bonusType: "trait",
      bonus: {
        attackRolls: 1,
        weaponDamage: 1,
      },
    },
  ]);
  const alignment = ref("CG");

  const heritage = ref("goblin");
  const heritageTraits = ref([
    "Darkvision",
    {
      name: "Over-Sized Ears",
      bonusType: "racial",
      bonus: {
        Perception: 4,
      },
    },
  ]);
  const type = ref("humanoid");
  const subtype = ref(["goblinoid"]);
  const senses = ref(["darkvision 60 ft."]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("small");
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: "Torch",
      weaponGroup: "light",
      dieCount: 1,
      dieSize: 4,
      fireDieCount: 1,
      fireDieSize: 4,
      critRange: 20,
    },
  ]);
  const charRanged = ref([
    {
      name: "generic ranged attack",
    },
  ]);

  const charGear = reactive({
    "Cracked Pale Green Prism": {
      bonusType: "competence bonus",
      cost: 4000,
      bonus: {
        saves: 1,
      },
    },
    "Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 5000,
      bonus: {
        ac: 1,
        ffAC: 1,
        touchAC: 1,
      },
    },
    "Headband of Vast Intellect +2": {
      bonusType: "enhancement",
      cost: 4000,
      bonus: {
        charisma: 2,
      },
    },
    "Belt of Con +2": {
      bonusType: "enhancement",
      cost: 4000,
      bonus: {
        constitution: 2,
      },
    },
    "Cloak of Resistance": {
      bonusType: "resistance",
      cost: 9000,
      bonus: {
        saves: 3,

      },
    },
    "Mwk Chain Shirt": {
      bonusType: "armor",
      cost: 100,
      bonus: {
        ac: 4,
        ffAC: 4,
      },
    },
    "Necklace of Natural Armor +1": {
      bonusType: "naturalArmorEnhancement",
      cost: 2000,
      bonus: {
        ac: 1,
        ffAC: 1,
      },
    },
    "Cracked Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 500,
      bonus: {
        initiative: 1,
      },
    },
    "Masterwork Tools (Bluff)": {
      bonusType: "circumstance",
      bonus: {
        bluff: 2,
      },
    },
    "Phylactery of Positive Channeling": {},
    "Snarshield, wooden": {
      bonusType: "shield",
      bonus: {
        ac: 2,
        ffAC: 2,
      },
    },
  });

  const charLevel = ref(8);

  const charClasses = ref([
    {
      archetype: ["Dual-Cursed"],
      name: "oracle",
      level: charLevel.value,
      hitDie: 8,
      bab: 3 / 4,
      first: true,
      skillRanks: 2,
      classSkills: [
        'Craft',
        'Diplomacy',
        'Heal',
        'Knowledge (history)',
        'Knowledge (planes)',
        'Knowledge (religion)',
        'Profession',
        'Sense Motive',
        'Spellcraft',
      ],
      favored: {
        hp: charLevel.value,
        skill: 0,
        race: {},
      },
      saves: {
        fortitude: false,
        reflex: false,
        will: true,
      },
      casterLevel: charLevel.value,
      casting: "spontaneous",
      castingStat: "charisma",
      spells: {
        '4th': {
          slots: 3,
          prepared: [
            'Magic Weapon, Greater',
          ],
        },
        '3rd': {
          slots: 5,
          prepared: [
            'Magic Vestment',
            'Borrow Fortune',
          ],
        },
        '2nd': {
          slots: 6,
          prepared: [
            'Eagle\'s Splendor',
            'lesser restoration',
            'Weapon of Awe',
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
          ],
        },
        Orisons: {
          prepared: [
            'Create Water',
            'Read Magic',
            'Stabilize',
            'Enhance Diplomacy',
            'Detect Magic',
            'Mending',
            'Vigor',
            'Spark',
          ],
        },

      },
      mysterySpells: [{
        name: 'Life',
        '1st': 'ill omen',
        '2nd': 'oracle\'s burden',
        '3rd': 'bestow curse',
        '4th': 'restoration',
      },
      ],
      curseSpells: [{
        name: 'Elemental Imbalance (Fire)',
        '1st': 'burning hands',
        '2nd': 'scorching ray',
      },
      ],
    },
  ]);

  const level = computed(() =>
    charClasses.value.reduce(
      (accumulator, cur) =>
        cur.gestalt ?? false
          ? Math.max(accumulator, cur.level)
          : accumulator + cur.level,
      0
    )
  );

  //DEFENSE

  const defensiveAbilities = ref("");
  const dr = ref("");
  const resist = ref("");
  const immune = ref("");
  const sr = ref(0);
  const weaknesses = ref(["cold"]);
  const saveAbilityScore = reactive({
    fortitude: "constitution",
    reflex: "dexterity",
    will: "wisdom",
  });

  // OFFENSE

  const tactics = "";

  // STATISTICS

  const pointBuy = reactive({
    strength: {
      pointBuy: 8,
    },
    dexterity: {
      pointBuy: 8,
    },
    constitution: {
      pointBuy: 13,
    },
    intelligence: {
      pointBuy: 8,
    },
    wisdom: {
      pointBuy: 10,
    },
    charisma: {
      pointBuy: 17,
    },
  });
  const feats = reactive({
    "Improved Initiative": {
      type: "combat",
      bonusType: "untyped",
      bonus: {
        initiative: 4,
      },
    },
    "Burn It Down! (Teamwork)": {
      bonusType: "morale",
      bonus: {
        weaponDamage: 3,
      },
    },
    "spell penetration": {
      bonusType: "spell penetration",
      bonus: {
        spellPenetrationCasterLevel: 2,
      },
    },
    "greater spell penetration": {
      bonusType: "greater spell penetration",
      bonus: {
        spellPenetrationCasterLevel: 2,
      },
    },
    "extra revelation": {},
    "Channeled Shield Wall": {},
    "Quick Channel": {},
    "Channeled Revival": {},
    "Extra Channel": {},
    "Selective Channeling": {},
    "Channel Smite": {},
  });
  const skillPoints = reactive({
    acrobatics: {
      ranks: 0,
      ability: "dexterity",
    },
    appraise: {
      ranks: 0,
      ability: "intelligence",
    },
    bluff: {
      ranks: level.value,
      ability: "charisma",
    },
    climb: {
      ranks: 0,
      ability: "strength",
    },
    craft: {
      ranks: 0,
      ability: "intelligence",
    },
    diplomacy: {
      ranks: level.value,
      ability: "charisma",
    },
    "disable device": {
      ranks: 0,
      ability: "dexterity",
    },
    disguise: {
      ranks: 0,
      ability: "charisma",
    },
    "escape artist": {
      ranks: 0,
      ability: "dexterity",
    },
    fly: {
      ranks: 0,
      ability: "dexterity",
    },
    "handle animal": {
      ranks: 0,
      ability: "charisma",
    },
    heal: {
      ranks: 0,
      ability: "wisdom",
    },
    intimidate: {
      ranks: 0,
      ability: "charisma",
    },
    knowledge: {
      arcana: {
        ranks: 0,
        ability: "intelligence",
      },
      dungeoneering: {
        ranks: 0,
        ability: "intelligence",
      },
      engineering: {
        ranks: 0,
        ability: "intelligence",
      },
      geography: {
        ranks: 0,
        ability: "intelligence",
      },
      history: {
        ranks: 0,
        ability: "intelligence",
      },
      local: {
        ranks: 0,
        ability: "intelligence",
      },
      nature: {
        ranks: 0,
        ability: "intelligence",
      },
      nobility: {
        ranks: 0,
        ability: "intelligence",
      },
      planes: {
        ranks: 0,
        ability: "intelligence",
      },
      religion: {
        ranks: 0,
        ability: "intelligence",
      },
    },
    linguistics: {
      ranks: 0,
      ability: "intelligence",
    },
    perception: {
      ranks: 0,
      ability: "wisdom",
    },
    perform: {
      ranks: 0,
      ability: "charisma",
    },
    profession: {
      ranks: 0,
      ability: "wisdom",
    },
    ride: {
      ranks: 1,
      ability: "dexterity",
    },
    "sense motive": {
      ranks: 0,
      ability: "wisdom",
    },
    "slight of hand": {
      ranks: 0,
      ability: "dexterity",
    },
    spellcraft: {
      ranks: level.value,
      ability: "intelligence",
    },
    stealth: {
      ranks: level.value,
      ability: "dexterity",
    },
    survival: {
      ranks: 0,
      ability: "wisdom",
    },
    swim: {
      ranks: 0,
      ability: "strength",
    },
    "use magic device": {
      ranks: 0,
      ability: "charisma",
    },
  });

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

    const CharClasses = ref(charClasses.value);

    CharClasses.value.forEach((charClasses) => {
      if (charClasses.gestalt === true) {
        maxBAB = Math.max(Math.floor(charClasses.level * charClasses.bab), maxBAB);
      } else {
        bab += Math.floor(charClasses.level * charClasses.bab);
      }
    });
    bab += maxBAB;

    return bab;
  });

  const toggle = reactive([
    {
      name: "Haste",
      bonusType: "dodge",
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
      name: "Power Attack",
      bonusType: "",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: -(Math.floor(baseAtk.value / 4) + 1),
        weaponDamage:
          (Math.floor(baseAtk.value / 4) + 1) * (2)
      },
    },
    {
      name: "Tub's Inspire Courage",
      bonusType: "competence",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 7,
        weaponDamage: 7,
        saves: 4,
      },
    },
    {
      name: "Tub's Heroism",
      bonusType: "morale",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 3,
        saves: 3,
        skills: 3,
      },
    },
    {
      name: "Rub's Channeled Shield Wall",
      bonusType: "DefelctionArmorEnhancement",
      active: false,
      duration: 2,
      bonus: {
        ac: 2,
        touchAC: 2,
        ffAC: 2,
      },
    },
    {
      name: "Rub's Magic Weapon",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 2,
        weaponDamage: 2,
      },
    },
    {
      name: "Rub's Weapon of Awe",
      bonusType: "sacred",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 2,
        weaponDamage: 2,
      },
    },
    {
      name: "Rub's Magic Vestment",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        ac: 2,
        ffAC: 2,
      },
    },
    {
      name: "Rub's Shield of Faith",
      bonusType: "deflection",
      active: false,
      duration: 2,
      bonus: {
        ac: 3,
        touchAC: 3,
        ffAC: 3,
      },
    },
    {
      name: "Eagle's Splendor",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        charisma: 4,
      },
    },
    {
      name: "Tub's Grace",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        dexterity: 4,
      },
    },
  ]);

  const charMods = reactive({
    goblin: {
      bonusType: "racial",
      bonus: {
        strength: -2,
        dexterity: 4,
        charisma: -2,
      },
    },
    levelUp: {
      bonusType: "",
      bonus: {
        charisma: 1,
        constitution: 1,
      },
    },
  });

  const acBonuses = computed(() => acBonusesCalc(toggle, charMods, charGear, feats, traits, heritageTraits));
  const modifiers = computed(() => modifiersCalc(toggle, charMods, charGear, feats, traits, heritageTraits));

  charClasses.value.forEach((charClasses) => {
    charClasses.casterLevel += modifiers.value.casterLevel ?? 0;
    charClasses.spellPenetrationCasterLevel = charClasses.level
      + (modifiers.value.casterLevel ?? 0)
      + (modifiers.value.spellPenetrationCasterLevel ?? 0);
  });
  sr.value += modifiers.value.spellResistance ?? 0;

  const sizeModifier = computed(() => {
    let tempSize = sizeMod.value;

    tempSize += modifiers.value.size ?? 0;

    return tempSize;
  });

  // STATISTICS
  const abilityScores = computed(() => abilityScoresCalc(pointBuy, modifiers));
  const abilityMods = computed(() => abilityModsCalc(abilityScores));
  const cmb = computed(() => cmbCalc(abilityMods, baseAtk, sizeModifier, modifiers));
  const cmd = computed(() => cmdCalc(abilityMods, baseAtk, sizeModifier, modifiers, acBonuses));
  const skills = computed(() => skillsCalc(abilityMods, sizeModifier, modifiers, skillPoints, charClasses));

  // INTRODUCTION
  const cr = ref("");
  const xp = ref(null);
  const initiative = computed(() =>initiativeCalc(abilityMods, modifiers));

  // DEFENSE
  const ac = computed(() => acCalc(abilityMods, modifiers, sizeModifier));
  const maxHP = computed(() => maxHPCalc(abilityMods, modifiers, charClasses, solo, level));
  const savingThrows = computed(() => savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level));

  // OFFENSE
  const melee = computed(() => meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier));
  const ranged = computed(() => rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier));

  const revelationDC = computed(
    () => 10 + Math.floor(level.value / 2) + abilityMods.value.charisma
  );

  const featDescriptions = ref([
    {
      name: "Channeled Shield Wall",
      type: "",
      header: "Channeled Shield Wall",
      description: [
        "As a swift action, you can spend a use of your channel energy to grant yourself a +2 deflection bonus while using a shield.",
        "This bonus lasts 1 minute per cleric level or effective cleric level. While you benefit from this bonus, allies with shields also gain a +2 deflection bonus while they are adjacent to you.",
      ],
    },
    {
      name: "Quick Channel",
      type: "",
      header: "Quick Channel",
      description: [
        "You may channel energy as a move action by spending 2 daily uses of that ability.",
      ],
    },
    {
      name: "Channeled Revival",
      type: "",
      header: "Channeled Revival",
      description: [
        "As a standard action that provokes attacks of opportunity, you can expend three uses of your channel energy class feature to restore a dead creature to life as if you had cast the breath of life spell."
      ],
    },
    {
      name: "Selective Channeling",
      type: "",
      header: "Selective Channeling",
      description: [
        "When you channel energy, you can choose a number of targets in the area up to your Charisma modifier. These targets are not affected by your channeled energy."
      ],
    },
    {
      name: "Channel Smite",
      type: "",
      header: `Channel Smite (DC ${revelationDC.value})`,
      description: [
        "Before you make a melee attack roll, you can choose to spend one use of your channel energy ability as a swift action.",
        "If you channel positive energy and you hit an undead creature, that creature takes an amount of additional damage equal to the damage dealt by your channel positive energy ability.",
        `Your target can make a Will save (DC ${revelationDC.value}), as normal, to halve this additional damage. If your attack misses, the channel energy ability is still expended with no effect.`,
      ],
    },
  ]);
  const heroPointAbilities = ref("");
  const mythicAbilities = ref("");


  const specialAbilities = ref([
    {
      name: "channel",
      type: "",
      header: "Channel (6d6) (9/day)",
      description: [
        "As a standard action, you may create a bond between yourself and another creature.",
        "Each round at the start of your turn, if the bonded creature is wounded for 5 or more hit points below its maximum hit points, it heals 5 hit points and you take 5 hit points of damage.",
        "You may have one bond active per oracle level.",
        "This bond continues until the bonded creature dies, you die, the distance between you and the other creature exceeds medium range, or you end it as an immediate action (if you have multiple bonds active, you may end as many as you want as part of the same immediate action)."
      ],
    },
    {
      name: "Life Link",
      type: "Su",
      header: "Life Link (Su)",
      description: [
        "As a standard action, you may create a bond between yourself and another creature.",
        "Each round at the start of your turn, if the bonded creature is wounded for 5 or more hit points below its maximum hit points, it heals 5 hit points and you take 5 hit points of damage.",
        "You may have one bond active per oracle level.",
        "This bond continues until the bonded creature dies, you die, the distance between you and the other creature exceeds medium range, or you end it as an immediate action (if you have multiple bonds active, you may end as many as you want as part of the same immediate action)."
      ],
    },
    {
      name: "Spirit Boost",
      type: "Su",
      header: "Spirit Boost (Su)",
      description: [
        "Whenever you heal a target up to its maximum hit points, any excess points persist for 1 round per level as temporary hit points (Does not stack with itself)."
      ],
    },
    {
      name: "Misfortune",
      type: "Ex",
      header: "Misfortune (Ex)",
      description: [
        "As an immediate action, you can force a creature within 30 feet to reroll any one d20 roll that it has just made before the results of the roll are revealed.",
        "The creature must take the result of the reroll, even if it’s worse than the original roll. Once a creature has suffered from your misfortune, it cannot be the target of this revelation again for 1 day."
      ],
    },
    {
      name: "Fortune",
      type: "Ex",
      header: "Fortune (Ex)",
      description: [
        "As an immediate action, you can reroll any one d20 roll that you have just made before the results of the roll are revealed.",
        "You must take the result of the reroll, even if it’s worse than the original roll.",
        "You can use this ability once per day.",
      ],
    },
    {
      name: "Tongues",
      type: "",
      header: "Curse of Tongues",
      description: [
        "Whenever you are in combat, you can only speak and understand Celestial and Infernal."
      ],
    },
  ]);

  return {
    name,
    solo,
    alignment,
    heritage,
    type,
    subtype,
    senses,
    aura,
    speed,
    level,
    charLevel,
    charClasses,
    sizeMod,
    space,
    reach,
    defensiveAbilities,
    dr,
    resist,
    immune,
    sr,
    weaknesses,
    saveAbilityScore,
    tactics,
    charGear,
    ecology,
    miscellaneous,
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
    toggle,
    modifiers,
    heroPointAbilities,
    mythicAbilities,
    revelationDC,
  };
});

export const useRub = defineStore("rub", {
  state: () => ({
    rub: rub.value,
  }),
});


const tub = computed(() => {
  const name = ref("Tub");
  const solo = ref(false);
  const traits = ref([
    {
      name: "Fire Hand",
      bonusType: "racialTrait",
      bonus: {
        attackRolls: 1,
      },
    },
    {
      name: "Strength of Submission",
      bonusType: "trait",
      bonus: {
        attackRolls: 1,
        weaponDamage: 1,
      },
    },
  ]);
  const alignment = ref("CG");

  const heritage = ref("goblin");
  const heritageTraits = ref([
    "Darkvision",
    {
      name: "Skilled",
      bonusType: "racial",
      bonus: {
        stealth: 4,
        ride: 4,
      },
    },
  ]);
  const type = ref("humanoid");
  const subtype = ref(["goblinoid"]);
  const senses = ref(["darkvision 60 ft."]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("small");
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: "Longspear",
      weaponGroup: "light",
      dieCount: 1,
      dieSize: 6,
      critRange: 20,
    },
  ]);
  const charRanged = ref([
    {
      name: "Double-Barreled Shotgun (20 ft.)",
      weaponGroup: "light",
      dieCount: 2,
      dieSize: 6,
      critRange: 20,
    },
  ]);

  const charGear = reactive({
    "Cracked Pale Green Prism": {
      bonusType: "competence bonus",
      cost: 4000,
      bonus: {
        saves: 1,
      },
    },
    "Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 5000,
      bonus: {
        ac: 1,
        ffAC: 1,
        touchAC: 1,
      },
    },
    "Banner of the Ancient Kings": {
      bonusType: "circumstance",
      cost: 4000,
      bonus: {
        initiative: 4,
      },
    },
    "Belt of Con +2": {
      bonusType: "enhancement",
      cost: 4000,
      bonus: {
        constitution: 2,
      },
    },
    "Cloak of Resistance": {
      bonusType: "resistance",
      cost: 9000,
      bonus: {
        saves: 3,

      },
    },
    "Mwk Chain Shirt": {
      bonusType: "armor",
      cost: 100,
      bonus: {
        ac: 4,
        ffAC: 4,
      },
    },
    "Necklace of Natural Armor +1": {
      bonusType: "naturalArmorEnhancement",
      cost: 2000,
      bonus: {
        ac: 1,
        ffAC: 1,
      },
    },
    "Cracked Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 500,
      bonus: {
        initiative: 1,
      },
    },
    "Masterwork Tools (Bluff)": {
      bonusType: "circumstance",
      bonus: {
        bluff: 2,
      },
    },
  });

  const charLevel = ref(8);

  const charClasses = ref([
    {
      archetype: ['songhealer'],
      name: 'bard',
      level: charLevel.value,
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
        hp: charLevel.value,
        skill: 0,
        race: {
          goblin: 0,
        },
      },
      saves: {
        fortitude: false,
        reflex: true,
        will: true,
      },
      casterLevel: charLevel.value,
      casting: 'spontaneous',
      castingStat: 'charisma',
      spells: {
        '3rd': {
          slots: 2,
          prepared: [
            'Haste',
            'Major Image',
            'Good Hope',
          ],
        },
        '2nd': {
          slots: 4,
          prepared: [
            'Gallant Inspiration',
            'Heroism',
            'Invisibility',
            'Mirror Image',
          ],
        },
        '1st': {
          slots: 4,
          prepared: [
            'Shadow Trap',
            'Saving Finale',
            'Hideous Laughter',
            'Feather Fall',
          ],
        },
        Cantrips: {
          prepared: [
            'Dancing Lights',
            'Detect Magic',
            'Prestidigitation',
            'Mage Hand',
            'Message',
            'Mending',
          ],
        },

      },
      gestalt: false
    },
  ]);

  const level = computed(() =>
    charClasses.value.reduce(
      (accumulator, cur) =>
        cur.gestalt ?? false
          ? Math.max(accumulator, cur.level)
          : accumulator + cur.level,
      0
    )
  );

  //DEFENSE

  const defensiveAbilities = ref("");
  const dr = ref("");
  const resist = ref("");
  const immune = ref("");
  const sr = ref(0);
  const weaknesses = ref("");
  const saveAbilityScore = reactive({
    fortitude: "constitution",
    reflex: "dexterity",
    will: "wisdom",
  });

  // OFFENSE

  const tactics = "";

  // STATISTICS

  const pointBuy = reactive({
    strength: {
      pointBuy: 8,
    },
    dexterity: {
      pointBuy: 15,
    },
    constitution: {
      pointBuy: 10,
    },
    intelligence: {
      pointBuy: 8,
    },
    wisdom: {
      pointBuy: 10,
    },
    charisma: {
      pointBuy: 15,
    },
  });
  const feats = reactive({
    "Improved Initiative": {
      type: "combat",
      bonusType: "untyped",
      bonus: {
        initiative: 4,
      },
    },
    "Burn It Down! (Teamwork)": {
      bonusType: "morale",
      bonus: {
        weaponDamage: 3,
      },
    },
    "Master Performer": {},
    "Grand Master Performer": {},
    "Lingering Performance": {},
    "Battle Singer": {},
    "Extra Performance": {},
    "Goblin Gunslinger": {},
    "Encouraging Spell": {},
  });
  const skillPoints = reactive({
    acrobatics: {
      ranks: level.value,
      ability: "dexterity",
    },
    appraise: {
      ranks: 0,
      ability: "intelligence",
    },
    bluff: {
      ranks: level.value,
      ability: "charisma",
    },
    climb: {
      ranks: 0,
      ability: "strength",
    },
    craft: {
      ranks: 0,
      ability: "intelligence",
    },
    diplomacy: {
      ranks: level.value,
      ability: "charisma",
    },
    "disable device": {
      ranks: 0,
      ability: "dexterity",
    },
    disguise: {
      ranks: 0,
      ability: "charisma",
    },
    "escape artist": {
      ranks: 0,
      ability: "dexterity",
    },
    fly: {
      ranks: 0,
      ability: "dexterity",
    },
    "handle animal": {
      ranks: 0,
      ability: "charisma",
    },
    heal: {
      ranks: 0,
      ability: "wisdom",
    },
    intimidate: {
      ranks: 0,
      ability: "charisma",
    },
    knowledge: {
      arcana: {
        ranks: 0,
        ability: "intelligence",
      },
      dungeoneering: {
        ranks: 0,
        ability: "intelligence",
      },
      engineering: {
        ranks: 0,
        ability: "intelligence",
      },
      geography: {
        ranks: 0,
        ability: "intelligence",
      },
      history: {
        ranks: 0,
        ability: "intelligence",
      },
      local: {
        ranks: 0,
        ability: "intelligence",
      },
      nature: {
        ranks: 0,
        ability: "intelligence",
      },
      nobility: {
        ranks: 0,
        ability: "intelligence",
      },
      planes: {
        ranks: 0,
        ability: "intelligence",
      },
      religion: {
        ranks: 0,
        ability: "intelligence",
      },
    },
    linguistics: {
      ranks: 0,
      ability: "intelligence",
    },
    perception: {
      ranks: 0,
      ability: "wisdom",
    },
    perform: {
      ranks: level.value,
      ability: "charisma",
    },
    profession: {
      ranks: 0,
      ability: "wisdom",
    },
    ride: {
      ranks: 1,
      ability: "dexterity",
    },
    "sense motive": {
      ranks: 0,
      ability: "wisdom",
    },
    "slight of hand": {
      ranks: 0,
      ability: "dexterity",
    },
    spellcraft: {
      ranks: level.value,
      ability: "intelligence",
    },
    stealth: {
      ranks: level.value,
      ability: "dexterity",
    },
    survival: {
      ranks: 0,
      ability: "wisdom",
    },
    swim: {
      ranks: 0,
      ability: "strength",
    },
    "use magic device": {
      ranks: 0,
      ability: "charisma",
    },
  });

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

    const CharClasses = ref(charClasses.value);

    CharClasses.value.forEach((charClasses) => {
      if (charClasses.gestalt === true) {
        maxBAB = Math.max(Math.floor(charClasses.level * charClasses.bab), maxBAB);
      } else {
        bab += Math.floor(charClasses.level * charClasses.bab);
      }
    });
    bab += maxBAB;

    return bab;
  });

  const toggle = reactive([
    {
      name: "Haste",
      bonusType: "dodge",
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
      name: "Power Attack",
      bonusType: "",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: -(Math.floor(baseAtk.value / 4) + 1),
        weaponDamage:
          (Math.floor(baseAtk.value / 4) + 1) * (2)
      },
    },
    {
      name: "Tub's Inspire Courage",
      bonusType: "competence",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 7,
        weaponDamage: 7,
        saves: 4,
      },
    },
    {
      name: "Tub's Heroism",
      bonusType: "morale",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 3,
        saves: 3,
        skills: 3,
      },
    },
    {
      name: "Rub's Channeled Shield Wall",
      bonusType: "DefelctionArmorEnhancement",
      active: false,
      duration: 2,
      bonus: {
        ac: 2,
        touchAC: 2,
        ffAC: 2,
      },
    },
    {
      name: "Rub's Magic Weapon",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 2,
        weaponDamage: 2,
      },
    },
    {
      name: "Rub's Weapon of Awe",
      bonusType: "sacred",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 2,
        weaponDamage: 2,
      },
    },
    {
      name: "Rub's Magic Vestment",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        ac: 2,
        ffAC: 2,
      },
    },
    {
      name: "Rub's Shield of Faith",
      bonusType: "deflection",
      active: false,
      duration: 2,
      bonus: {
        ac: 3,
        touchAC: 3,
        ffAC: 3,
      },
    },
    {
      name: "Eagle's Splendor",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        charisma: 4,
      },
    },
    {
      name: "Tub's Grace",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        dexterity: 4,
      },
    },
  ]);

  const charMods = reactive({
    goblin: {
      bonusType: "racial",
      bonus: {
        strength: -2,
        dexterity: 4,
        charisma: -2,
      },
    },
    bardicKnowledge: {
      bonusType: 'untyped',
      bonus: {
        knowledge: level.value + 5,
      },
    },
    levelUp: {
      bonusType: "",
      bonus: {
        charisma: 1,
        dexterity: 1,
      },
    },

  });

  const acBonuses = computed(() => acBonusesCalc(toggle, charMods, charGear, feats, traits, heritageTraits));
  const modifiers = computed(() => modifiersCalc(toggle, charMods, charGear, feats, traits, heritageTraits));

  charClasses.value.forEach((charClasses) => {
    charClasses.casterLevel += modifiers.value.casterLevel ?? 0;
    charClasses.spellPenetrationCasterLevel = charClasses.level
      + (modifiers.value.casterLevel ?? 0)
      + (modifiers.value.spellPenetrationCasterLevel ?? 0);
  });
  sr.value += modifiers.value.spellResistance ?? 0;

  const sizeModifier = computed(() => {
    let tempSize = sizeMod.value;

    tempSize += modifiers.value.size ?? 0;

    return tempSize;
  });

  // STATISTICS

  const abilityScores = computed(() => abilityScoresCalc(pointBuy, modifiers));

  const abilityMods = computed(() => abilityModsCalc(abilityScores));

  const cmb = computed(() => cmbCalc(abilityMods, baseAtk, sizeModifier, modifiers));
  const cmd = computed(() => cmdCalc(abilityMods, baseAtk, sizeModifier, modifiers, acBonuses));

  const skills = computed(() => skillsCalc(abilityMods, sizeModifier, modifiers, skillPoints, charClasses));


  // INTRODUCTION

  const cr = ref("");
  const xp = ref(null);
  const initiative = computed(() =>initiativeCalc(abilityMods, modifiers));

  // DEFENSE

  const ac = computed(() => acCalc(abilityMods, modifiers, sizeModifier));

  const maxHP = computed(() => maxHPCalc(abilityMods, modifiers, charClasses, solo, level));

  const savingThrows = computed(() => savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level));

  // OFFENSE

  const melee = computed(() => meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier));

  const ranged = computed(() => rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier));

  const revelationDC = computed(
    () => 10 + Math.floor(level.value / 2) + abilityMods.value.charisma
  );

  const featDescriptions = ref([
    {
      name: "Grit",
      type: "",
      header: "Grit (4/day)",
      description: [
        "At the start of each day, a gunslinger gains a number of grit points equal to her Charisma modifier (minimum 1). Her grit goes up or down throughout the day, but usually cannot go higher than her Charisma modifier (minimum 1).",
        "",
        "Critical Hit with a Firearm: Each time the gunslinger confirms a critical hit with a firearm attack while in the heat of combat, she regains 1 grit point.",
        "Confirming a critical hit on a helpless or unaware creature or on a creature that has fewer Hit Dice than half the gunslinger’s character level does not restore grit.",
        "",
        "Killing Blow with a Firearm: When the gunslinger reduces a creature to 0 or fewer hit points with a firearm attack while in the heat of combat, she regains 1 grit point.",
        "Destroying an unattended object, reducing a helpless or unaware creature to 0 or fewer hit points, or reducing a creature that has fewer Hit Dice than half the gunslinger’s character level to 0 or fewer hit points does not restore any grit."
      ],
    },
    {
      name: "Deadeye",
      type: "Ex",
      header: "Deadeye (Ex)",
      description: [
        "You can resolve an attack against touch AC instead of normal AC when firing beyond her firearm’s first range increment.",
        "Performing this deed costs 1 grit point per range increment beyond the first. The gunslinger still takes the –2 penalty on attack rolls for each range increment beyond the first when she performs this deed.",
      ],
    },
    {
      name: "Gunslinger’s Dodge",
      type: "Ex",
      header: "Gunslinger’s Dodge (Ex)",
      description: [
        "When a ranged attack is made against the gunslinger, she can spend 1 grit point to move 5 feet as an immediate action; doing so grants the gunslinger a +2 bonus to AC against the triggering attack.",
        "This movement is not a 5-foot step, and provokes attacks of opportunity.",
        "Alternatively, the gunslinger can drop prone to gain a +4 bonus to AC against the triggering attack. The gunslinger can only perform this deed while wearing medium or light armor, and while carrying no more than a light load."
      ],
    },
    {
      name: "Quick Clear",
      type: "Ex",
      header: "Quick Clear (Ex)",
      description: [
        "As a standard action, the gunslinger can remove the broken condition from a single firearm she is currently wielding, as long as that condition was gained by a firearm misfire.",
        "The gunslinger must have at least 1 grit point to perform this deed.",
        "Alternatively, if the gunslinger spends 1 grit point to perform this deed, she can perform quick clear as a move-equivalent action instead of a standard action."
      ],
    },
    {
      name: "Charming Performance",
      type: "",
      header: "Charming Performance",
      description: [
        "You can use Perform, rather than Diplomacy, to improve an NPC’s starting attitude toward you.",
        "Alternatively, by praising another character, you may use Perform to improve an NPC’s starting attitude toward another character, though the DC for doing so is increased by 5.",
        "Either use of this feat requires at least 5 minutes of performance.",
        "You can’t improve an NPC’s attitude beyond friendly in this way, but if you would have made them helpful, you gain a +2 bonus on your next normal Diplomacy check against that NPC attempted within 24 hours.",
      ],
    },
    {
      name: "Roll With It",
      type: "",
      header: "Roll With It",
      description: [
        "If you are struck by a melee weapon you can try to convert some or all of that damage into movement that sends you off in an uncontrolled bouncing roll.",
        "To do so, you must make an Acrobatics check (DC = 5 + the damage dealt from the attack) as an immediate action.",
        "If you succeed in this check, you take no damage from the actual attack but instead convert that damage into movement with each point equating to 1 foot of movement.",
        "For example, if you would have taken 6 points of damage, you would convert that into 6 feet of movement. You immediately move in a straight line in a direction of your choice this number of feet (rounded up to the nearest 5-foot-square), halting if you reach a distance equal to your actual speed.",
        "If this movement would make you strike an object or creature of your size or larger, the movement immediately ends, you take 1d4 points of damage, and fall prone in that square.",
        "This involuntary movement provokes attacks of opportunity normally if you move through threatened squares, but does not provoke an attack of opportunity from the creature that struck you in the first place.",
        "You are staggered for 1 round after you attempt to use this feat, whether or not you succeed.",
      ],
    },
  ]);
  const heroPointAbilities = ref("");
  const mythicAbilities = ref("");


  const specialAbilities = ref([
    {
      name: "Misfires",
      type: "",
      header: "Misfires (1–2)",
      description: [
        "If the natural result of your attack roll falls within a firearm’s misfire value, that shot misses, even if you would have otherwise hit the target.",
        "When a firearm misfires, it gains the broken condition.",
        "While it has the broken condition, it suffers the normal disadvantages that broken weapons do, and its misfire value increases by 4",
      ],
    },
    {
      name: "Scatter Weapon Quality",
      type: "",
      header: "Scatter Weapon Quality",
      description: [
        "A weapon with the scatter weapon quality can shoot two different types of ammunition. It can fire normal bullets that target one creature, or it can make a scattering shot, attacking all creatures within a cone.",
        "When a scatter weapon attacks all creatures within a cone, it makes a separate attack roll against each creature within the cone.",
        "Each attack roll takes a –2 penalty, and its attack damage cannot be modified by precision damage or damage-increasing feats such as Vital Strike.",
        "Effects that grant concealment, such as fog or smoke, or the blur, invisibility, or mirror image spells, do not foil a scatter attack.",
        "If any of the attack rolls threaten a critical, confirm the critical for that attack roll alone.",
        "A firearm that makes a scatter shot misfires only if all of the attack rolls made misfire.",
        "If a scatter weapon explodes on a misfire, it deals triple its damage to all creatures within the misfire radius.",
      ],
    },
    {
      name: "Enhance Healing",
      type: "Su",
      header: "Enhance Healing (Su)",
      description: [
        "A number of times per day equal to his Charisma modifier, a songhealer can cause any healing effect from a spell completion or spell trigger item to function at a caster level equal to his class level.",
      ],
    },
  ]);

  return {
    name,
    solo,
    alignment,
    heritage,
    type,
    subtype,
    senses,
    aura,
    speed,
    charLevel,
    charClasses,
    sizeMod,
    space,
    reach,
    defensiveAbilities,
    dr,
    resist,
    immune,
    sr,
    weaknesses,
    saveAbilityScore,
    tactics,
    charGear,
    ecology,
    miscellaneous,
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
    toggle,
    modifiers,
    heroPointAbilities,
    mythicAbilities,
    revelationDC,
  };
});

export const useTub = defineStore("tub", {
  state: () => ({
    tub: tub.value,
  }),
});


const bub = computed(() => {
  const name = ref("Bub");
  const solo = ref(false);
  const traits = ref([
    {
      name: "Fire Hand",
      bonusType: "racialTrait",
      bonus: {
        attackRolls: 1,
      },
    },
    {
      name: "Strength of Submission",
      bonusType: "trait",
      bonus: {
        attackRolls: 1,
        weaponDamage: 1,
      },
    },
  ]);
  const alignment = ref("CG");

  const heritage = ref("goblin");
  const heritageTraits = ref([
    "Darkvision",
    {
      name: "Skilled",
      bonusType: "racial",
      bonus: {
        stealth: 4,
        ride: 4,
      },
    },
  ]);
  const type = ref("humanoid");
  const subtype = ref(["goblinoid"]);
  const senses = ref(["darkvision 60 ft."]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("small");
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: "(Glaive) Blade of Three Fancies",
      weaponGroup: "light",
      dieCount: 1,
      dieSize: 8,
      critRange: 15,
    },
  ]);
  const charRanged = ref([
    {
      name: "generic ranged attack",
    },
  ]);

  const charGear = reactive({
    "Cracked Pale Green Prism": {
      bonusType: "competence bonus",
      cost: 4000,
      bonus: {
        saves: 1,
      },
    },
    "Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 5000,
      bonus: {
        ac: 1,
        ffAC: 1,
        touchAC: 1,
      },
    },
    "Banner of the Ancient Kings": {
      bonusType: "circumstance",
      cost: 4000,
      bonus: {
        initiative: 4,
      },
    },
    "Belt of Con +4": {
      bonusType: "enhancement",
      cost: 4000,
      bonus: {
        constitution: 4,
      },
    },
    "Cloak of Resistance": {
      bonusType: "resistance",
      cost: 9000,
      bonus: {
        saves: 3,

      },
    },
    "Mwk Chain Shirt": {
      bonusType: "armor",
      cost: 100,
      bonus: {
        ac: 4,
        ffAC: 4,
      },
    },
    "Necklace of Natural Armor +1": {
      bonusType: "naturalArmorEnhancement",
      cost: 2000,
      bonus: {
        ac: 1,
        ffAC: 1,
      },
    },
    "Cracked Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 500,
      bonus: {
        initiative: 1,
      },
    },
    "Masterwork Tools (Bluff)": {
      bonusType: "circumstance",
      bonus: {
        bluff: 2,
      },
    },
  });

  const charLevel = ref(8);

  const charClasses = ref([
    {
      archetype: ['devoted muse'],
      name: 'swashbuckler',
      level: charLevel.value,
      first: true,
      hitDie: 10,
      bab: 1,
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
        hp: charLevel.value,
        skill: 0,
        race: {
          goblin: 0,
        },
      },
      saves: {
        fortitude: false,
        reflex: true,
        will: false,
      },
      gestalt: false
    },
  ]);

  const level = computed(() =>
    charClasses.value.reduce(
      (accumulator, cur) =>
        cur.gestalt ?? false
          ? Math.max(accumulator, cur.level)
          : accumulator + cur.level,
      0
    )
  );

  //DEFENSE

  const defensiveAbilities = ref("");
  const dr = ref("");
  const resist = ref("");
  const immune = ref("");
  const sr = ref(0);
  const weaknesses = ref("");
  const saveAbilityScore = reactive({
    fortitude: "constitution",
    reflex: "dexterity",
    will: "wisdom",
  });

  // OFFENSE

  const tactics = "";

  // STATISTICS

  const pointBuy = reactive({
    strength: {
      pointBuy: 7,
    },
    dexterity: {
      pointBuy: 16,
    },
    constitution: {
      pointBuy: 12,
    },
    intelligence: {
      pointBuy: 7,
    },
    wisdom: {
      pointBuy: 7,
    },
    charisma: {
      pointBuy: 16,
    },
  });
  const feats = reactive({
    "Improved Initiative": {
      type: "combat",
      bonusType: "untyped",
      bonus: {
        initiative: 4,
      },
    },
    "Burn It Down! (Teamwork)": {
      bonusType: "morale",
      bonus: {
        weaponDamage: 3,
      },
    },
    "Master Performer": {},
    "Grand Master Performer": {},
    "Lingering Performance": {},
    "Battle Singer": {},
    "Weapon Specialization": {
      bonusType: "ws",
      bonus: {
        weaponDamage: 2,
      },
    },
    "Greater Weapon Focus": {
      bonusType: "gwf",
      bonus: {
        attackRolls: 1,
      },
    },
    "Weapon Focus": {
      bonusType: "wf",
      bonus: {
        attackRolls: 1,
      },
    },
  });
  const skillPoints = reactive({
    acrobatics: {
      ranks: level.value,
      ability: "dexterity",
    },
    appraise: {
      ranks: 0,
      ability: "intelligence",
    },
    bluff: {
      ranks: level.value,
      ability: "charisma",
    },
    climb: {
      ranks: 0,
      ability: "strength",
    },
    craft: {
      ranks: 0,
      ability: "intelligence",
    },
    diplomacy: {
      ranks: level.value,
      ability: "charisma",
    },
    "disable device": {
      ranks: 0,
      ability: "dexterity",
    },
    disguise: {
      ranks: 0,
      ability: "charisma",
    },
    "escape artist": {
      ranks: 0,
      ability: "dexterity",
    },
    fly: {
      ranks: 0,
      ability: "dexterity",
    },
    "handle animal": {
      ranks: 0,
      ability: "charisma",
    },
    heal: {
      ranks: 0,
      ability: "wisdom",
    },
    intimidate: {
      ranks: 0,
      ability: "charisma",
    },
    knowledge: {
      arcana: {
        ranks: 0,
        ability: "intelligence",
      },
      dungeoneering: {
        ranks: 0,
        ability: "intelligence",
      },
      engineering: {
        ranks: 0,
        ability: "intelligence",
      },
      geography: {
        ranks: 0,
        ability: "intelligence",
      },
      history: {
        ranks: 0,
        ability: "intelligence",
      },
      local: {
        ranks: 0,
        ability: "intelligence",
      },
      nature: {
        ranks: 0,
        ability: "intelligence",
      },
      nobility: {
        ranks: 0,
        ability: "intelligence",
      },
      planes: {
        ranks: 0,
        ability: "intelligence",
      },
      religion: {
        ranks: 0,
        ability: "intelligence",
      },
    },
    linguistics: {
      ranks: 0,
      ability: "intelligence",
    },
    perception: {
      ranks: 0,
      ability: "wisdom",
    },
    perform: {
      ranks: level.value,
      ability: "charisma",
    },
    profession: {
      ranks: 0,
      ability: "wisdom",
    },
    ride: {
      ranks: 1,
      ability: "dexterity",
    },
    "sense motive": {
      ranks: 0,
      ability: "wisdom",
    },
    "slight of hand": {
      ranks: 0,
      ability: "dexterity",
    },
    spellcraft: {
      ranks: level.value,
      ability: "intelligence",
    },
    stealth: {
      ranks: level.value,
      ability: "dexterity",
    },
    survival: {
      ranks: 0,
      ability: "wisdom",
    },
    swim: {
      ranks: 0,
      ability: "strength",
    },
    "use magic device": {
      ranks: 0,
      ability: "charisma",
    },
  });

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

    const CharClasses = ref(charClasses.value);

    CharClasses.value.forEach((charClasses) => {
      if (charClasses.gestalt === true) {
        maxBAB = Math.max(Math.floor(charClasses.level * charClasses.bab), maxBAB);
      } else {
        bab += Math.floor(charClasses.level * charClasses.bab);
      }
    });
    bab += maxBAB;

    return bab;
  });

  const toggle = reactive([
    {
      name: "Haste",
      bonusType: "dodge",
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
      name: "Power Attack",
      bonusType: "",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: -(Math.floor(baseAtk.value / 4) + 1),
        weaponDamage:
          (Math.floor(baseAtk.value / 4) + 1) * (2)
      },
    },
    {
      name: "Tub's Inspire Courage",
      bonusType: "competence",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 7,
        weaponDamage: 7,
        saves: 4,
      },
    },
    {
      name: "Tub's Heroism",
      bonusType: "morale",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 3,
        saves: 3,
        skills: 3,
      },
    },
    {
      name: "Rub's Channeled Shield Wall",
      bonusType: "DefelctionArmorEnhancement",
      active: false,
      duration: 2,
      bonus: {
        ac: 2,
        touchAC: 2,
        ffAC: 2,
      },
    },
    {
      name: "Rub's Magic Weapon",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 2,
        weaponDamage: 2,
      },
    },
    {
      name: "Rub's Weapon of Awe",
      bonusType: "sacred",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 2,
        weaponDamage: 2,
      },
    },
    {
      name: "Rub's Magic Vestment",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        ac: 2,
        ffAC: 2,
      },
    },
    {
      name: "Rub's Shield of Faith",
      bonusType: "deflection",
      active: false,
      duration: 2,
      bonus: {
        ac: 3,
        touchAC: 3,
        ffAC: 3,
      },
    },
    {
      name: "Eagle's Splendor",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        charisma: 4,
      },
    },
    {
      name: "Tub's Grace",
      bonusType: "enhancement",
      active: false,
      duration: 2,
      bonus: {
        dexterity: 4,
      },
    },
  ]);

  const charMods = reactive({
    goblin: {
      bonusType: "racial",
      bonus: {
        strength: -2,
        dexterity: 4,
        charisma: -2,
      },
    },
    levelUp: {
      bonusType: "",
      bonus: {
        dexterity: 2,
      },
    },
    "Swashbuckler Weapon Training": {
      bonusType: "swt",
      bonus: {
        attackRolls: 3,
        weaponDamage: 3,
      },
    },
    Nimble: {
      bonusType: "nimble",
      bonus: {
        ac: 2,
        touchAC: 2,
      },
    },

  });

  const acBonuses = computed(() => acBonusesCalc(toggle, charMods, charGear, feats, traits, heritageTraits));
  const modifiers = computed(() => modifiersCalc(toggle, charMods, charGear, feats, traits, heritageTraits));

  charClasses.value.forEach((charClasses) => {
    charClasses.casterLevel += modifiers.value.casterLevel ?? 0;
    charClasses.spellPenetrationCasterLevel = charClasses.level
      + (modifiers.value.casterLevel ?? 0)
      + (modifiers.value.spellPenetrationCasterLevel ?? 0);
  });
  sr.value += modifiers.value.spellResistance ?? 0;

  const sizeModifier = computed(() => {
    let tempSize = sizeMod.value;

    tempSize += modifiers.value.size ?? 0;

    return tempSize;
  });

  // STATISTICS
  const abilityScores = computed(() => abilityScoresCalc(pointBuy, modifiers));
  const abilityMods = computed(() => abilityModsCalc(abilityScores));
  const cmb = computed(() => cmbCalc(abilityMods, baseAtk, sizeModifier, modifiers));
  const cmd = computed(() => cmdCalc(abilityMods, baseAtk, sizeModifier, modifiers, acBonuses));
  const skills = computed(() => skillsCalc(abilityMods, sizeModifier, modifiers, skillPoints, charClasses));

  // INTRODUCTION
  const cr = ref("");
  const xp = ref(null);
  const initiative = computed(() =>initiativeCalc(abilityMods, modifiers));

  // DEFENSE
  const ac = computed(() => acCalc(abilityMods, modifiers, sizeModifier));
  const maxHP = computed(() => maxHPCalc(abilityMods, modifiers, charClasses, solo, level));
  const savingThrows = computed(() => savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level));

  // OFFENSE
  const melee = computed(() => meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier));
  const ranged = computed(() => rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier));


  const revelationDC = computed(
    () => 10 + Math.floor(level.value / 2) + abilityMods.value.charisma
  );

  const featDescriptions = ref([
    {
      name: "Roll With It",
      type: "",
      header: "Roll With It",
      description: [
        "If you are struck by a melee weapon you can try to convert some or all of that damage into movement that sends you off in an uncontrolled bouncing roll.",
        "To do so, you must make an Acrobatics check (DC = 5 + the damage dealt from the attack) as an immediate action.",
        "If you succeed in this check, you take no damage from the actual attack but instead convert that damage into movement with each point equating to 1 foot of movement.",
        "For example, if you would have taken 6 points of damage, you would convert that into 6 feet of movement. You immediately move in a straight line in a direction of your choice this number of feet (rounded up to the nearest 5-foot-square), halting if you reach a distance equal to your actual speed.",
        "If this movement would make you strike an object or creature of your size or larger, the movement immediately ends, you take 1d4 points of damage, and fall prone in that square.",
        "This involuntary movement provokes attacks of opportunity normally if you move through threatened squares, but does not provoke an attack of opportunity from the creature that struck you in the first place.",
        "You are staggered for 1 round after you attempt to use this feat, whether or not you succeed.",
      ],
    },
  ]);
  const heroPointAbilities = ref("");
  const mythicAbilities = ref("");


  const specialAbilities = ref([
    {
      name: "Panache",
      type: "",
      header: "Panache (4/day)",
      description: [
        "At the start of each day, a swashbuckler gains a number of panache points equal to her Charisma modifier (minimum 1). Her grit goes up or down throughout the day, but usually cannot go higher than her Charisma modifier (minimum 1).",
        "",
        "Critical Hit with a Light Weapon: Each time the swashbuckler confirms a critical hit with a Light Weapon while in the heat of combat, she regains 1 panache point.",
        "Confirming a critical hit on a helpless or unaware creature or on a creature that has fewer Hit Dice than half the swashbuckler’s character level does not restore panache.",
        "",
        "Killing Blow with a Light Weapon: When the swashbuckler reduces a creature to 0 or fewer hit points with a Light Weapon while in the heat of combat, she regains 1 panache point.",
        "Destroying an unattended object, reducing a helpless or unaware creature to 0 or fewer hit points, or reducing a creature that has fewer Hit Dice than half the swashbuckler’s character level to 0 or fewer hit points does not restore any panache."
      ],
    },
  ]);

  return {
    name,
    solo,
    alignment,
    heritage,
    type,
    subtype,
    senses,
    aura,
    speed,
    charLevel,
    charClasses,
    sizeMod,
    space,
    reach,
    defensiveAbilities,
    dr,
    resist,
    immune,
    sr,
    weaknesses,
    saveAbilityScore,
    tactics,
    charGear,
    ecology,
    miscellaneous,
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
    toggle,
    modifiers,
    heroPointAbilities,
    mythicAbilities,
    revelationDC,
  };
});

export const useBub = defineStore("sareah", {
  state: () => ({
    bub: bub.value,
  }),
});


const sareah = computed(() => {
  const name = ref("Sareah");
  const solo = ref(false);
  const traits = ref([
    {
      name: "reactionary",
      bonusType: "trait",
      bonus: {
        initiative: 2,
      },
    },
    {
      name: "bluff trait (fill this later)",
      bonusType: "trait",
      bonus: {
        bluff: 1,
      },
    },
  ]);
  const alignment = ref("NG");

  const heritage = ref("humanoid");
  const heritageTraits = ref([
    "Elven Immunities",
    "Darkvision",
    {
      name: "Elven Magic",
      bonusType: "racial",
      bonus: {
        spellPenetrationCasterLevel: 2,
      },
    },
    {
      name: "Fleet-Footed",
      bonusType: "racial",
      bonus: {
        initiative: 2,
      },
    },
  ]);
  const type = ref("humanoid");
  const subtype = ref(["human"]);
  const senses = ref(["arcane sight", "darkvision 60 ft.", "see invisibility", "mindsight"]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("medium");
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: "caestus",
      weaponGroup: "light",
      dieCount: 1,
      dieSize: 4,
      critRange: 20,
    },
  ]);
  const charRanged = ref([
    {
      name: "generic ranged attack",
    },
  ]);

  const charGear = reactive({
    "Cracked Pale Green Prism": {
      bonusType: "competence bonus",
      cost: 4000,
      bonus: {
        saves: 1,
      },
    },
    "Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 5000,
      bonus: {
        ac: 1,
        ffAC: 1,
        touchAC: 1,
      },
    },
    "Headband of Vast Intellect +6": {
      bonusType: "enhancement",
      cost: 0,
      bonus: {
        intelligence: 6,
      },
    },
    "Belt of Dex/Con +6": {
      bonusType: "enhancement",
      cost: 0,
      bonus: {
        dexterity: 6,
        constitution: 6,
      },
    },
    "Robe of the Archmagi": {
      bonusType: "resistance",
      cost: 88500,
      bonus: {
        saves: 5,
        spellPenetrationCasterLevel: 2,
        casterLevel: 1,
        spellResistance: 19,

      },
    },
    "Robe of the Archmagi armor": {
      bonusType: "armor",
      cost: 88500,
      bonus: {
        ac: 5,
        ffAC: 5,
      },
    },
    "Mythril Caster's Shield +5": {
      bonusType: "shield",
      cost: 26000,
      bonus: {
        ac: 6,
        ffAC: 6,
      },
    },
    "Ring of Protection +5": {
      bonusType: "deflection",
      cost: 2000,
      bonus: {
        ac: 5,
        ffAC: 5,
        touchAC: 5,
      },
    },
    "Cracked Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 500,
      bonus: {
        initiative: 1,
      },
    },
    "Masterwork Tools (Bluff)": {
      bonusType: "circumstance",
      bonus: {
        bluff: 2,
      },
    },
    "Blouse, Cackling Hag’s": {
      bonusType: "competence",
      bonus: {
        intimidate: 2,
      },
    },
  });

  const charLevel = ref(14);

  const charClasses = ref([
    {
      archetype: ["ley-line guardian"],
      name: "witch",
      level: charLevel.value,
      hitDie: 6,
      bab: 1 / 2,
      first: true,
      skillRanks: 2,
      classSkills: [
        "craft",
        "bluff",
        "diplomacy",
        "fly",
        "heal",
        "arcana",
        "history",
        "nature",
        "history",
        "planes",
        "profession",
        "spellcraft",
        "use magic device",
      ],
      favored: {
        hp: 4,
        skill: 0,
        race: {
          "elf": charLevel.value - 4,
        },
      },
      saves: {
        fortitude: false,
        reflex: false,
        will: true,
      },
      casterLevel: charLevel.value,
      casting: "spontaneous",
      castingStat: "intelligence",
      spells: {
        "7th": {
          slots: 3,
          prepared: ["plane shift"],
        },
        "6th": {
          slots: 5,
          prepared: ["wither limb", "fey form II", "dispel magic, greater"],
        },
        "5th": {
          slots: 6,
          prepared: [
            "hold monster",
            "teleport",
            "Curse, Major",
            "banish seeming",
            "waves of fatigue",
          ],
        },
        "4th": {
          slots: 6,
          prepared: [
            "enervation",
            "confusion",
            "demanding message",
            "hunger for flesh",
            "inveigle person",
          ],
        },
        "3rd": {
          slots: 6,
          prepared: [
            "suggestion",
            "lightning bolt",
            "bestow curse",
            "fly",
            "howling agony",
            "call the void",
          ],
        },
        "2nd": {
          slots: 6,
          prepared: [
            "lipstitch",
            "hold person",
            "web",
            "enthrall",
            "limp lash",
            "zone of truth",
            "glitterdust",
            "perceive cues",
          ],
        },
        "1st": {
          slots: 6,
          prepared: [
            "murderous command",
            "charm person",
            "mage armor",
            "ear-piercing scream",
            "beguiling gift",
            "ill omen",
            "ray of enfeeblement",
            "blend",
          ],
        },
        Cantrips: {
          prepared: [
            "mage hand",
            "detect magic",
            "light",
            "daze",
            "bleed",
            "touch of fatigue",
            "stabilize",
            "create water",
          ],
        },
      },
      patronSpells: {
        name: "jynx",
        "1st": "animate rope",
        "2nd": "mirror image",
        "3rd": "major image",
        "4th": "hallucinatory terrain",
        "5th": "mirage arcana",
        "6th": "mislead",
        "7th": "reverse gravity",
      },
    },
  ]);

  const level = computed(() =>
    charClasses.value.reduce(
      (accumulator, cur) =>
        cur.gestalt ?? false
          ? Math.max(accumulator, cur.level)
          : accumulator + cur.level,
      0
    )
  );

  //DEFENSE

  const defensiveAbilities = ref("");
  const dr = ref("");
  const resist = ref("");
  const immune = ref("sleep");
  const sr = ref(0);
  const weaknesses = ref("");
  const saveAbilityScore = reactive({
    fortitude: "constitution",
    reflex: "dexterity",
    will: "wisdom",
  });

  // OFFENSE

  const tactics = "";

  // STATISTICS

  const abilityScore = reactive({
    strength: {
      pointBuy: 9,
    },
    dexterity: {
      pointBuy: 15,
    },
    constitution: {
      pointBuy: 14,
    },
    intelligence: {
      pointBuy: 18,
    },
    wisdom: {
      pointBuy: 13,
    },
    charisma: {
      pointBuy: 13,
    },
  });
  const feats = reactive({
    "Deceitful": {
      bonusType: "untyped",
      bonus: {
        bluff: 4,
      },
    },
    "Conceal Spell": {},
    "Improved Conceal Spell": {},
    "Accursed Hex": {},
    "Improved Initiative": {
      type: "combat",
      bonusType: "untyped",
      bonus: {
        initiative: 4,
      },
    },
    "Quick Draw": {},
    "Split Hex": {},
    "spell penetration": {
      bonusType: "spell penetration",
      bonus: {
        spellPenetrationCasterLevel: 2,
      },
    },
    "greater spell penetration": {
      bonusType: "greater spell penetration",
      bonus: {
        spellPenetrationCasterLevel: 2,
      },
    },
  });
  const skillPoints = reactive({
    acrobatics: {
      ranks: level.value,
      ability: "dexterity",
    },
    appraise: {
      ranks: 0,
      ability: "intelligence",
    },
    bluff: {
      ranks: level.value,
      ability: "charisma",
    },
    climb: {
      ranks: 0,
      ability: "strength",
    },
    craft: {
      ranks: 0,
      ability: "intelligence",
    },
    diplomacy: {
      ranks: level.value,
      ability: "charisma",
    },
    "disable device": {
      ranks: 0,
      ability: "dexterity",
    },
    disguise: {
      ranks: 0,
      ability: "charisma",
    },
    "escape artist": {
      ranks: 0,
      ability: "dexterity",
    },
    fly: {
      ranks: 3,
      ability: "dexterity",
    },
    "handle animal": {
      ranks: 0,
      ability: "charisma",
    },
    heal: {
      ranks: 0,
      ability: "wisdom",
    },
    intimidate: {
      ranks: 0,
      ability: "charisma",
    },
    knowledge: {
      arcana: {
        ranks: level.value,
        ability: "intelligence",
      },
      dungeoneering: {
        ranks: 0,
        ability: "intelligence",
      },
      engineering: {
        ranks: 1,
        ability: "intelligence",
      },
      geography: {
        ranks: 1,
        ability: "intelligence",
      },
      history: {
        ranks: 1,
        ability: "intelligence",
      },
      local: {
        ranks: 1,
        ability: "intelligence",
      },
      nature: {
        ranks: 1,
        ability: "intelligence",
      },
      nobility: {
        ranks: 1,
        ability: "intelligence",
      },
      planes: {
        ranks: level.value,
        ability: "intelligence",
      },
      religion: {
        ranks: 1,
        ability: "intelligence",
      },
    },
    linguistics: {
      ranks: 1,
      ability: "intelligence",
    },
    perception: {
      ranks: level.value,
      ability: "wisdom",
    },
    perform: {
      ranks: 0,
      ability: "charisma",
    },
    profession: {
      ranks: 0,
      ability: "wisdom",
    },
    ride: {
      ranks: 1,
      ability: "dexterity",
    },
    "sense motive": {
      ranks: 0,
      ability: "wisdom",
    },
    "slight of hand": {
      ranks: 0,
      ability: "dexterity",
    },
    spellcraft: {
      ranks: level.value,
      ability: "intelligence",
    },
    stealth: {
      ranks: 0,
      ability: "dexterity",
    },
    survival: {
      ranks: 0,
      ability: "wisdom",
    },
    swim: {
      ranks: 0,
      ability: "strength",
    },
    "use magic device": {
      ranks: 0,
      ability: "charisma",
    },
  });

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

    const CharClasses = ref(charClasses.value);

    CharClasses.value.forEach((charClasses) => {
      if (charClasses.gestalt === true) {
        maxBAB = Math.max(Math.floor(charClasses.level * charClasses.bab), maxBAB);
      } else {
        bab += Math.floor(charClasses.level * charClasses.bab);
      }
    });
    bab += maxBAB;

    return bab;
  });

  const toggle = reactive([
    {
      name: "Perceive Cues",
      bonusType: "competence",
      active: true,
      duration: 1,
      bonus: {
        perception: 5,
        "sense motive": 5,
      },
    },
    {
      name: "Haste",
      bonusType: "dodge",
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
      name: "C-4PO's Skin (Barkskin)",
      bonusType: "naturalArmorEnhancement",
      active: true,
      duration: 0,
      bonus: {
        ac: 5,
        ffAC: 5,
      },
    },
    {
      name: "Fey Form II",
      bonusType: "size",
      active: false,
      duration: 1,
      bonus: {
        strength: -2,
        dexterity: 6,
      },
    },
  ]);

  const charMods = reactive({
    "elf": {
      bonusType: "racial",
      bonus: {
        intelligence: 2,
        dexterity: 2,
        constitution: -2,
      },
    },
    levelUp: {
      bonusType: "",
      bonus: {
        intelligence: 3,
      },
    },
    Wish: {
      bonusType: "inherent",
      cost: 0,
      bonus: {
        intelligence: 1,
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
    modifierLoop(charMods);
    modifierLoop(charGear);
    modifierLoop(feats);
    modifierLoop(traits.value);
    modifierLoop(heritageTraits.value);

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
    modifierLoop(charMods);
    modifierLoop(charGear);
    modifierLoop(feats);
    modifierLoop(traits.value);
    modifierLoop(heritageTraits.value);

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

  charClasses.value.forEach((charClasses) => {
    charClasses.casterLevel += modifiers.value.casterLevel ?? 0;
    charClasses.spellPenetrationCasterLevel = charClasses.level
      + (modifiers.value.casterLevel ?? 0)
      + (modifiers.value.spellPenetrationCasterLevel ?? 0);
  });
  sr.value += modifiers.value.spellResistance ?? 0;

  const sizeModifier = computed(() => {
    let tempSize = sizeMod.value;

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

    const objectHusk = reactive(abilityScore);

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
    const skillRanks = skillPoints;

    const totalSkills = {
      acrobatics: 0,
      appraise: 0,
      bluff: 0,
      climb: 0,
      craft: 0,
      diplomacy: 0,
      "disable device": 0,
      disguise: 0,
      "escape artist": 0,
      fly: 0,
      "handle animal": 0,
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
      "sense motive": 0,
      "slight of hand": 0,
      spellcraft: 0,
      stealth: 0,
      survival: 0,
      swim: 0,
      "use magic device": 0,
    };

    if (sizeModifier.value !== 0) {
      totalSkills.fly += (Math.log2(sizeModifier.value) + 1) * 2;
      totalSkills.stealth += (Math.log2(sizeModifier.value) + 1) * 4;
    }

    const tempClassSkills = ref(charClasses.value[0].classSkills);

    const {knowledge} = skillPoints;

    const knowledgeKeys = Object.keys(knowledge);

    const keys = Object.keys(totalSkills);

    const summarySkills = {};

    keys.forEach((skillKey) => {
      tempClassSkills.value.forEach((classSkill) => {
        if (classSkill === skillKey && skillRanks[skillKey].ranks >= 1)
          totalSkills[skillKey] += 3;
        if (classSkill === skillKey && classSkill === "knowledge") {
          knowledgeKeys.forEach((knowledgeSkillKey) => {
            if (skillRanks.knowledge[knowledgeSkillKey].ranks >= 1) {
              totalSkills.knowledge[knowledgeSkillKey] += 3;
            }
          });
        }
      });
      if (skillKey === "knowledge") {
        knowledgeKeys.forEach((knowledgeSkillKey) => {
          totalSkills.knowledge[knowledgeSkillKey] +=
            skillRanks.knowledge[knowledgeSkillKey].ranks;
          totalSkills.knowledge[knowledgeSkillKey] +=
            abilityMods.value[skillRanks.knowledge[knowledgeSkillKey].ability];
          totalSkills.knowledge[knowledgeSkillKey] +=
            modifiers.value.knowledge ?? 0;
          totalSkills.knowledge[knowledgeSkillKey] +=
            modifiers.value.skills ?? 0;
        });
      } else {
        totalSkills[skillKey] += skillRanks[skillKey].ranks;
        totalSkills[skillKey] +=
          abilityMods.value[skillRanks[skillKey].ability];
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

    const CharClasses = charClasses.value;

    CharClasses.forEach((charClasses) => {
      if (charClasses.gestalt !== true) {
        if (charClasses.first) {
          hitPoints += charClasses.hitDie;
          hitPoints +=
            (charClasses.level - 1) * Math.ceil((charClasses.hitDie + 1) / 2);
        } else {
          hitPoints += charClasses.level * Math.ceil((charClasses.hitDie + 1) / 2);
        }
        if (typeof charClasses.favored !== "undefined") {
          if (typeof charClasses.favored.hp !== "undefined") {
            hitPoints += charClasses.favored.hp;
          }
        }
      } else {
        maxHitDie = Math.max(charClasses.hitDie, maxHitDie);
      }
    });

    if (solo.value) {
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

    const saveKeys = Object.keys(saveAbilityScore);

    const charClasses = ref(charClasses.value);

    const maxCharSaves = {
      fortitude: false,
      reflex: false,
      will: false,
    };

    saveKeys.forEach((save) => {
      charClasses.value.forEach((charClasses) => {
        maxCharSaves[save] = charClasses.saves[save] || maxCharSaves[save];
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
      totalSaves[save] += abilityMods.value[saveAbilityScore[save]];
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

    if (toggle["power attack"]?.active) {
      tempMeleeAttack.value += -(Math.floor(baseAtk.value / 4) + 1);
      // eslint-disable-next-line no-unused-vars
      tempMeleeDamage.value +=
        (Math.floor(baseAtk.value / 4) + 1) * (2 + twoHanding);
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

    charMelee.value.forEach((meleeOption) => {
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

    charRanged.value.forEach((rangedOption) => {
      const option = ref({
        attack: 0,
        damage: 0,
      });
      Object.keys(rangedOption).forEach((rangedAttr) => {
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
      name: "Robe of the Archmagi",
      type: "",
      header: "Robe of the Archmagi",
      description: [
        "+5 armor bonus to AC",
        "Spell resistance 19 (see Archmage's Vestments)",
        "+5 resistance bonus on all saving throws",
        "+2 enhancement bonus on caster level checks made to overcome spell resistance"
      ],
    },
    {
      name: "Mithral Caster's Shield +5",
      type: "",
      header: "Mithral Caster's Shield +5",
      description: [
        "This +5 Mithral light shield has a leather strip on the back on which a spellcaster can scribe a single spell as on a scroll. A spell so scribed requires half the normal cost in raw materials.",
        "The strip cannot accommodate spells of higher than 5th level. The strip is reusable.",
        "The shield is used each morning to cast an Empowered Greater False Life (EGFL) on Sareah"
      ],
    },
    {
      name: "Archmage's Vestments",
      type: "",
      header: "Archmage's Vestments",
      description: [
        "Consisting of everything a truly legendary wizard might need to overcome his rivals, the Archmage’s Vestments enhance the wearer’s spellcasting abilities.",
        "Two-Item Benefit: While you are wearing or wielding at least two pieces of this set, your caster level for all arcane spellcasting classes you have levels in increases by 1.",
        "Three-Item Benefit: While you are wearing or wielding at least three pieces of this set, you gain one additional 3rd-level spell slot for one arcane spellcasting class you have levels in.",
        "Four-Item Benefit: While you are wearing or wielding at least four pieces of this set, you gain one additional 4th-level spell slot for one arcane spellcasting class you have levels in.",
        "NOT YET AVAILABLE (Five-Item Benefit: While you are wearing and wielding all five pieces of this set, you gain one additional 5th-level spell slot for one arcane spellcasting class you have levels in.)"
      ],
    },
    {
      name: "Ring of Evasion",
      type: "",
      header: "Ring of Evasion",
      description: [
        "This ring continually grants the wearer the ability to avoid damage as if she had evasion. Whenever she makes a Reflex saving throw to determine whether she takes half damage, a successful save results in no damage."
      ],
    },
    {
      name: "Circlet of Mindsight",
      type: "",
      header: "Circlet of Mindsight",
      description: [
        "This elaborate circlet of gold-and-platinum filigree bears tiny gems in settings that look disturbingly like human eyes.",
        "When worn, the circlet lets the wearer sense the presence of other thinking creatures in her immediate area",
        "The wearer gains the benefits of blindsense 30 feet, but only against creatures with an Intelligence score that are susceptible to mind-affecting effects.",
        "Undead, constructs, and mindless creatures like most oozes and vermin cannot be perceived when using the circlet, nor can creatures under the effects of mind blank or a ring of mind shielding.",
        "The circlet does not interfere with the wearer’s ability to see normally. If the wearer has blindsense or blindsight, he is able to differentiate creatures detected with those senses from creatures detected with the circlet of mindsight."
      ],
    },
  ]);
  const heroPointAbilities = ref("");
  const mythicAbilities = ref("");

  const hexDC = computed(
    () => 10 + Math.floor(level.value / 2) + abilityMods.value.intelligence
  );

  const specialAbilities = ref([
    {
      name: "Cackling Hag’s Blouse",
      type: "",
      header: "Cackling Hag’s Blouse",
      description: [
        "This loose-fitting blouse is adorned with grotesque fetishes and trophies, granting the wearer a +2 competence bonus on Intimidate checks.",
        "If the wearer is a witch, she gains the cackle hex. If the wearer already has the cackle hex, twice per day she can use her cackle ability as a swift action instead of a move action."
      ],
    },
    {
      name: "Metamagic Rod, Quicken",
      type: "",
      header: "Metamagic Rod, Quicken",
      description: [
        "The wielder can cast up to three spells (up to 6th level) per day that are quickened as though using the Quicken Spell feat."
      ],
    },
    {
      name: "Lesser Metamagic Rod, Quicken",
      type: "",
      header: "Lesser Metamagic Rod, Quicken",
      description: [
        "The wielder can cast up to three spells (up to 3rd level) per day that are quickened as though using the Quicken Spell feat."
      ],
    },
    {
      name: "Rod of Grasping Hexes",
      type: "",
      header: "Rod of Grasping Hexes",
      description: [
        "This rod is crafted from a gnarled branch covered in sharp thorns.",
        "Three times per day when a wielder of this rod uses a hex (but not an advanced hex or grand hex), she can use this rod’s power to double the range of the hex, so long as the hex has a range measured in feet."
      ],
    },
    {
      name: "Rod of Abrupt Hexes",
      type: "",
      header: "Rod of Abrupt Hexes",
      description: [
        "This rod is crafted from a gnarled branch covered in sharp thorns.",
        "Three times per day when a wielder of this rod uses a hex (but not an advanced hex or grand hex), she can use this rod’s power to activate the hex as swift action rather than a standard action.",
      ],
    },
    {
      name: "Metamagic Rod, Empower",
      type: "",
      header: "Metamagic Rod, Empower",
      description: [
        "The wielder can cast up to three spells (up to 6th level) per day that are empowered as though using the Empower Spell feat.",
        "One of these charges are use with the Caster's shield each morning to cast an Empowered Greater False Life (EGFL) on Sareah"
      ],
    },
    {
      name: "Ring of Counterspells",
      type: "",
      header: "Ring of Counterspells",
      description: [
        "Upon first examination, this ring seems to be a ring of spell storing. However, while it allows a single spell of 1st through 6th level to be cast into it, that spell cannot be cast out of the ring again.",
        "Instead, should that spell ever be cast upon the wearer, the spell is immediately countered, as a counterspell action, requiring no action (or even knowledge) on the wearer’s part.",
        "Once so used, the spell cast within the ring is gone. A new spell (or the same one as before) may be placed into it again.",
      ],
    },
    {
      name: "Conduit Surge",
      type: "",
      header: `Conduit Surge (Su) (${3 + abilityMods.value.charisma}/day)`,
      description: [
        "A ley line guardian is adept at channeling energy from ley lines to enhance her own spells.",
        "As a swift action, she can increase her effective caster level for the next spell she casts in that round by 1d4 levels.",
        "After performing a conduit surge, the ley line guardian must succeed at a Fortitude save (DC = 10 + level of spell cast + number of additional caster levels granted) or become staggered for a number of minutes equal to the level of the spell cast.",
        "She can use this ability a number of times per day equal to 3 + her Charisma modifier.",
      ],
    },
    {
      name: "Cackle",
      type: "Su",
      header: "Cackle (Su)",
      description: [
        "A witch can cackle madly as a move action.",
        "Any creature that is within 30 feet that is under the effects of an agony hex, charm hex, evil eye hex, fortune hex, or misfortune hex caused by the witch has the duration of that hex extended by 1 round."
      ],
    },
    {
      name: "Misfortune",
      type: "",
      header: "Misfortune (Su)",
      description: [
        "The witch can cause a creature within 30 feet to suffer grave misfortune for 1 round.",
        "Anytime the creature makes an ability check, attack roll, saving throw, or skill check, it must roll twice and take the worse result. A Will save negates this hex.",
        " At 8th level and 16th level, the duration of this hex is extended by 1 round.",
        "This hex affects all rolls the target must make while it lasts.",
        "Whether or not the save is successful, a creature cannot be the target of this hex again for 1 day."
      ],
    },
    // {
    //   name: "Cackling",
    //   type: "",
    //   header: "Cackling",
    //   description: [
    //     ""
    //   ],
    // },

  ]);

  const specialAttacks = reactive([
    {
      name: `Witch Hexes (DC ${hexDC.value})`,
      hexes: [
        "cackle",
        "misfortune",
        "evil eye",
        "slumber",
        "flight",
        "gift of consumption",
        "retribution",
        "agony",
        "???",
      ],
    },
    {
      name: "Conduit Surge (1d4)",
      usesPerDay: 3 + abilityMods.value.charisma,
    },
  ]);

  return {
    name,
    solo,
    alignment,
    heritage,
    type,
    subtype,
    senses,
    aura,
    speed,
    charLevel,
    charClasses,
    sizeMod,
    space,
    reach,
    defensiveAbilities,
    dr,
    resist,
    immune,
    sr,
    weaknesses,
    saveAbilityScore,
    tactics,
    charGear,
    ecology,
    miscellaneous,
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
    toggle,
    modifiers,
    heroPointAbilities,
    mythicAbilities,
    specialAttacks,
    hexDC,
  };
});

export const useSareah = defineStore("sareah", {
  state: () => ({
    sareah: sareah.value,
  }),
});
