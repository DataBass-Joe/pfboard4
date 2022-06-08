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
          cur >= 0 || !(stackableTypes.value.includes(bonusType))
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
          cur >= 0 && !(stackableTypes.value.includes(bonusType))
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
    sizeModifier.value;

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

        summarySkills[skillKey] = totalSkills[skillKey];

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

  charClasses.value.forEach((charClass) => {
    if (charClass.gestalt !== true || charClass.gestalt === 'undefined') {
      if (solo.value) {
        hitPoints += charClass.hitDie * level.value;
      } else if (charClass.first) {
        hitPoints += charClass.hitDie;
        hitPoints +=
          (charClass.level - 1) * Math.ceil((charClass.hitDie + 1) / 2);
      } else {
        hitPoints += charClass.level * Math.ceil((charClass.hitDie + 1) / 2);
      }
      hitPoints += charClass.favored.hp ?? 0;
    } else {
      maxHitDie = Math.max(charClass.hitDie, maxHitDie);
      if (solo.value) {
        hitPoints = maxHitDie * level.value;
      }
    }


  });


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

function meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier) {
  let twoHanding = 0;

  const tempMeleeAttack = ref(
    Math.max(abilityMods.value.dexterity, abilityMods.value.strength) +
    baseAtk.value +
    sizeModifier.value
  );
  const tempMeleeDamage = ref(
    Math.floor(abilityMods.value.strength * (1 + (0.5 * twoHanding)))
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
    rOptions.value.push(option.value);
  });

  return rOptions.value;
}

// CHARACTERS
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
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

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
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

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
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

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

  const pointBuy = reactive({
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
    // "Spell Chain": {},
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

  const acBonuses = computed(() => acBonusesCalc(toggle, charMods, charGear, feats, traits, heritageTraits));
  const modifiers = computed(() => modifiersCalc(toggle, charMods, charGear, feats, traits, heritageTraits));

  charClasses.value.forEach((charClasses) => {
    charClasses.casterLevel += modifiers.value.casterLevel ?? 0;
    charClasses.spellPenetrationCasterLevel = charClasses.casterLevel
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

  // STATISTICS
  const abilityScores = computed(() => abilityScoresCalc(pointBuy, modifiers));
  const abilityMods = computed(() => abilityModsCalc(abilityScores));
  const cmb = computed(() => cmbCalc(abilityMods, baseAtk, sizeModifier, modifiers));
  const cmd = computed(() => cmdCalc(abilityMods, baseAtk, sizeModifier, modifiers, acBonuses));
  const skills = computed(() => skillsCalc(abilityMods, sizeModifier, modifiers, skillPoints, charClasses));

  // INTRODUCTION
  const cr = ref("");
  const xp = ref(null);
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

  // DEFENSE
  const ac = computed(() => acCalc(abilityMods, modifiers, sizeModifier));
  const maxHP = computed(() => maxHPCalc(abilityMods, modifiers, charClasses, solo, level));
  const savingThrows = computed(() => savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level));

  // OFFENSE
  const melee = computed(() => meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier));
  const ranged = computed(() => rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier));

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


const dominic = computed(() => {
  const name = ref("Dominic");
  const solo = ref(true);
  const traits = ref([
    {
      name: "???",
      bonusType: "trait",
      bonus: {},
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
  const alignment = ref("LE");

  const heritage = ref("Noble Drow");
  const heritageTraits = ref([
    "Superior Darkvision",
    {
      name: "Keen Senses",
      bonusType: "racial",
      bonus: {
        perception: 2,
      },
    },
    {
      name: "Voice in the Darkness",
      bonusType: "racial",
      bonus: {
        intimidate: 2,
        stealth: 2,
      },
    },
  ]);
  const type = ref("humanoid");
  const subtype = ref(["elf"]);
  const senses = ref(["darkvision 120 ft.", "See in Darkness"]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("medium");
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(15);

  const charMelee = ref([
    {
      name: "+5 Vicious Dispelling-Burst Phase-Locking Umbral Chain",
      weaponGroup: "light",
      attackCount: 0,
      attackPenalty: 0,
      attack: 5,
      damage: 5,
      dieCount: 3,
      dieSize: 12,
      critRange: 19,
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
    "Belt of Physical Perfection +6": {
      bonusType: "enhancement",
      cost: 90000,
      bonus: {
        strength: 6,
        dexterity: 6,
        constitution: 6,
      },
    },
    "Belt of Mental Perfection +6": {
      bonusType: "enhancement",
      cost: 90000,
      bonus: {
        intelligence: 6,
        wisdom: 6,
        charisma: 6,
      },
    },
    "Cloak of Resistance": {
      bonusType: "resistance",
      cost: 25000,
      bonus: {
        saves: 5,

      },
    },
    "Profane Necklase +3": {
      bonusType: "profane",
      cost: 50000,
      bonus: {
        ac: 3,
        touchAC: 3,
        ffAC: 3,
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
    "Bracers of Armor +8": {
      bonusType: "armor",
      bonus: {
        ac: 8,
        ffAC: 8,
      },
    },
  });

  const charLevel = ref(20);

  const charClasses = ref([
    {
      archetype: ["Sacred Fist"],
      name: "warpriest",
      level: charLevel.value - 10,
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
        hp: charLevel.value - 10,
        skill: 0,
        race: {},
      },
      saves: {
        fortitude: true,
        reflex: false,
        will: true,
      },
      casterLevel: charLevel.value - 1,
      casting: "prepared",
      castingStat: "wisdom",
      spells: {
        '6th': {
          slots: 4,
          prepared: [
            'Heal',
            'Harm',
            'Word of Recall',
            'Dispel Magic, Greater',
            'Source Severance',
          ],
        },
        '5th': {
          slots: 5,
          prepared: [
            'Caustic Blood',
            'unholy ice',
            'holy ice',
            'Cleanse',
            'break enchantment',
            'forbid action, greater',
            'forbid action',
          ],
        },
        '4th': {
          slots: 5,
          prepared: [
            'Magic Weapon, Greater',
            'Divine Power',
            'Symbol of Pain',
            'Spell Immunity',
            'Airwalk',
          ],
        },
        '3rd': {
          slots: 5,
          prepared: [
            'Deeper Darkness',
            'Borrow Fortune',
            'Stone Shape',
            'Protection from Energy',
            'Channel Vigor',
            'Bestow Curse',
          ],
        },
        '2nd': {
          slots: 5,
          prepared: [
            'Eagle\'s Splendor',
            'lesser restoration',
            'Weapon of Awe',
            'Ironskin',
            'hold person',
            'spiritual weapon',
          ],
        },
        '1st': {
          slots: 5,
          prepared: [
            'Shield of Faith',
            'Moment of Greatness',
            'Murderous Command',
            'Lucky Number',
            'Fallback Strategy',
            'advanced scurry',
          ],
        },
        Orisons: {
          prepared: [
            'Create Water',
            'Read Magic',
            'Stabilize',
            'Bleed',
            'Detect Magic',
            'detect poison',
          ],
        },

      },
    },
    {
      archetype: [],
      name: "Evangelist",
      level: charLevel.value - 10,
      hitDie: 8,
      bab: 3 / 4,
      first: false,
      skillRanks: 6,
      classSkills: [
        'Craft',
        'Diplomacy',
        'Heal',
        'Knowledge (religion)',
        'Perception',
        'Profession',
      ],
      favored: {
        hp: charLevel.value - 10,
        skill: 0,
        race: {},
      },
      saves: {
        fortitude: false,
        reflex: true,
        will: false,
      },
    },
  ]);

  const level = computed(() =>
    charClasses.value.reduce(
      (accumulator, charClass) =>
        charClass.gestalt ?? false
          ? Math.max(accumulator, charClass.level)
          : accumulator + charClass.level,
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
      pointBuy: 17,
    },
    constitution: {
      pointBuy: 18,
    },
    intelligence: {
      pointBuy: 7,
    },
    wisdom: {
      pointBuy: 15,
    },
    charisma: {
      pointBuy: 7,
    },
  });
  const feats = reactive({
    "Lunge": {
      bonusType: "lunge",
      bonus: {
        ac: -2,
        touchAC: -2,
        ffAC: -2,
      },
    },
    "Kyton Shield": {
      bonusType: "shield",
      bonus: {
        ac: 3,
        ffAC: 3
      },
    },
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
      active: true,
      duration: 2,
      bonus: {
        attackRolls: -(Math.floor(baseAtk.value / 4) + 1),
        weaponDamage:
          (Math.floor(baseAtk.value / 4) + 1) * (2)
      },
    },
    {
      name: "Ki Insight",
      bonusType: "insight",
      active: false,
      duration: 2,
      bonus: {
        ac: 5,
        touchAC: 5,
      },
    },
    {
      name: "Ki Dodge (1 round)",
      bonusType: "dodge",
      active: false,
      duration: 2,
      bonus: {
        ac: 4,
        touchAC: 4,
      },
    },
    {
      name: "Shield of Faith",
      bonusType: "deflection",
      active: true,
      duration: 2,
      bonus: {
        ac: 5,
        touchAC: 5,
      },
    },
    {
      name: 'Flurry of Blows',
      bonusType: '',
      duration: 2,
      active: true,
      bonus: {
        attackRolls: -2,
        multiAttackCount: 1,
      },
    },
    {
      name: 'Ironskin',
      bonusType: 'naturalArmorEnhancement',
      duration: 2,
      active: false,
      bonus: {
        ac: 7,
        ffAC: 7,
      },
    },
    {
      name: 'Divine Power',
      bonusType: 'luck',
      duration: 2,
      active: false,
      bonus: {
        attackRolls: 7,
        weaponDamage: 7,
      },
    },
    {
      name: 'Spiritual Form',
      bonusType: 'untyped',
      duration: 2,
      active: false,
      bonus: {
        dexterity: 4,
      },
    },
    {
      name: 'Apostle Kyton Template',
      bonusType: 'kyton',
      duration: 2,
      active: false,
      bonus: {
        strength: 6,
        dexterity: 4,
        constitution: 6,
        intelligence: 2,
        wisdom: 6,
        charisma: 6,
        bluff: 4,
        heal: 4,
        intimidate: 4,
        ac: 4,
        ffAC: 4,
      },
    },
    {
      name: 'Destructive Attacks',
      bonusType: 'morale',
      duration: 2,
      active: false,
      bonus: {
        weaponDamage: Math.floor(level.value / 2),
      },
    },


  ]);

  const charMods = reactive({
    "Noble Drow": {
      bonusType: "racial",
      bonus: {
        dexterity: 4,
        constitution: -2,
        intelligence: 2,
        wisdom: 2,
        charisma: 2,
        spellResistance: 11 + level.value,
      },
    },
    levelUp: {
      bonusType: "levelUp",
      bonus: {
        constitution: 5,
      },
    },
    inherent: {
      bonusType: "inherent",
      bonus: {
        strength: 5,
        dexterity: 5,
        constitution: 5,
        intelligence: 5,
        wisdom: 5,
        charisma: 5,
      },
    },
    "Perfect Body Flawless Mind": {
      bonusType: "pbfm",
      bonus: {
        constitution: 8,
      },
    },
    "Sacred Fist": {
      bonusType: "dodge",
      bonus: {
        ac: 4,
        touchAC: 4,
        ffAC: 4,
      },
    },
    "Protective Grace": {
      bonusType: "dodge",
      bonus: {
        ac: 2,
        touchAC: 2,
      },
    },
    "Multitude of Talents": {
      bonusType: "profane",
      bonus: {
        skills: 4,
      },
    },

  });

  const acBonuses = computed(() => acBonusesCalc(toggle, charMods, charGear, feats, traits, heritageTraits));
  const modifiers = computed(() => modifiersCalc(toggle, charMods, charGear, feats, traits, heritageTraits));

  charClasses.value.forEach((charClasses) => {
    charClasses.casterLevel += modifiers.value.casterLevel ?? 0;
    charClasses.spellPenetrationCasterLevel = charClasses.casterLevel
      + (modifiers.value.casterLevel ?? 0)
      + (modifiers.value.spellPenetrationCasterLevel ?? 0);
  });
  sr.value += modifiers.value.spellResistance ?? 0;


  const multiAttackCount = computed(() => 1 + (modifiers.value.multiAttackCount ?? 0));


  const attackCount = computed(() => {
    let tempattackCount = 1;

    tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

    return tempattackCount;
  });
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
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

  // DEFENSE
  const ac = computed(() => {
    let tempAC = acCalc(abilityMods, modifiers, sizeModifier)
    for (const acKey in tempAC) {
      tempAC[acKey] += abilityMods.value.wisdom
    }
    return tempAC
  });

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
    attackCount,
    multiAttackCount,
  };
});
export const useDominic = defineStore("dominic", {
  state: () => ({
    dominic: dominic.value,
  }),
});


const immogen = computed(() => {
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
  const senses = ref(['arcane sight, See in Darkness, see invisibility, alignment sight']);
  const aura = ref('');
  const speed = ref(30);

  const size = ref('medium');
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: 'Stella\'s Holy Dispelling-Burst Spell-Stealing Cutlass',
      weaponGroup: 'light',
      dieCount: 1,
      dieSize: 12,
      critRange: 15,
      critMult: 3,
      critMax: true,
    },
  ]);
  const charRanged = ref([
    {
      name: 'Immogen\'s Flaming-Burst Second-Chance Longbow',
      weaponGroup: 'bow',
      dieCount: 1,
      dieSize: 8,
      critRange: 19,
      critMult: 4,
      critMax: true,

    },
  ]);

  const mythicTier = ref(7);
  const mythicFlag = ref(true);
  const mythicPower = ref(3 + (2 * mythicTier.value));
  const mythicPath = reactive({
    heirophant: {
      bonusType: 'mythic',
      bonus: {
        charisma: 6,
        initiative: mythicTier.value,
        hp: (4 * mythicTier.value),
      },
    },
    'overcome curse': {
      bonusType: 'uncurse',
      bonus: {
        initiative: 4,
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
    'Cassock of the Black Monk': {
      bonusType: "luck",
      cost: 34000,
      bonus: {
        ac: 5,
        touchAC: 5,
        ffAC: 5,
      },
    },
    "Robe of the Archmagi": {
      bonusType: "resistance",
      cost: 88500,
      bonus: {
        saves: 5,
        spellPenetrationCasterLevel: 2,
        casterLevel: 1,
      },
    },
  });
  const charLevel = ref(16);

  const charClasses = ref([
    {
      archetype: ['archaeologist'],
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
        hp: 0,
        skill: 0,
        race: {
          human: charLevel.value,
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
        '6th': {
          slots: 1,
          prepared: [
            'Project Image',
            'Overwhelming Presence',
          ],
        },
        '5th': {
          slots: 3,
          prepared: [
            'Heroism, Greater',
            'Foe to Friend',
            'Persistent Image',
            'Unwilling Shield',
            'Covetous Aura',
          ],
        },
        '4th': {
          slots: 4,
          prepared: [
            'Invisibility, Greater',
            'Dimension Door',
            'Modify Memory',
            'Shield of the Dawnflower',
            'Zone of Silence',
            'Legend Lore',
            'Vigilant Rest',
            'Break Enchantment'
          ],
        },
        '3rd': {
          slots: 5,
          prepared: [
            'Magic Aura, Greater',
            'Glibness',
            'Major Image',
            'Deep Slumber',
            'Confusion',
            'Good Hope',
            'Charm Monster',
            'False Future',
          ],
        },
        '2nd': {
          slots: 5,
          prepared: [
            'Glitterdust',
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
            'Moment of Greatness (+5)',
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
      level: charLevel.value,
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
          human: charLevel.value,
        },
      },
      saves: {
        fortitude: false,
        reflex: false,
        will: true,
      },
      casterLevel: charLevel.value,
      casting: 'spontaneous',
      castingStat: 'charisma',
      spells: {
        '8th': {
          slots: 3,
          prepared: [
            '???',
          ],
        },
        '7th': {
          slots: 5,
          prepared: [
            'Hymn of Peace',
            'Ethereal Jaunt',
            'Bestow Curse, Greater'
          ],
        },
        '6th': {
          slots: 6,
          prepared: [
            'Heal',
            'Dispel Magic, Greater',
            'Harm',
            'Wind Walk',
            'Chains of Light',
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
            'Constricting Coils',
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
            'Mythic Severance',
            'Deathless',
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
          '8th': 'temporal stasis',
        },
      ],
      curseSpells: [{
        name: 'Elemental Imbalance (Fire)',
        '1st': 'burning hands',
        '2nd': 'scorching ray',
        '6th': 'Contagious Flame',
      }],
      gestalt: true,
    },
  ]);

  const level = computed(() =>
    charClasses.value.reduce(
      (accumulator, charClass) =>
        charClass.gestalt ?? false
          ? Math.max(accumulator, charClass.level)
          : accumulator + charClass.level,
      0
    )
  );

  //DEFENSE

  const defensiveAbilities = ref(['hard to kill', 'Freedom of Movement, Permanent Mythic Invisibility']);
  const dr = ref("");
  const resist = ref("");
  const immune = ref("");
  const sr = ref(0);
  const weaknesses = ref(['cold']);
  const saveAbilityScore = reactive({
    fortitude: "constitution",
    reflex: "charisma",
    will: "wisdom",
  });

  // OFFENSE

  const tactics = "";

  // STATISTICS

  const pointBuy = reactive({
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
      levelUp: 4,
    },
  });
  const feats = reactive({
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
  });
  const skillPoints = reactive({
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
      name: 'heroism, greater',
      bonusType: 'morale',
      duration: 2,
      active: true,
      bonus: {
        attackRolls: 5,
        saves: 5,
        skills: 5,
      },
    },
    {
      name: 'archeologist\'s luck',
      bonusType: 'luck',
      duration: 1,
      active: true,
      bonus: {
        attackRolls: 8,
        saves: 8,
        skills: 8,
        weaponDamage: 8,
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
        attackRolls: 5,
        weaponDamage: 5,
      },
    },
    abpAbilityScores: {
      bonusType: 'enhancement',
      bonus: {
        strength: 2,
        dexterity: 6,
        constitution: 4,
        intelligence: 2,
        wisdom: 4,
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
        ac: 5,
        ffAC: 5,
      },
    },
    abpDeflection: {
      bonusType: 'deflection',
      bonus: {
        ac: 5,
        ffAC: 5,
        touchAC: 5,
      },
    },
    abpShield: {
      bonusType: 'shieldEnhancement',
      bonus: {
        ac: 4,
        ffAC: 4,

      },
    },
    abpArmor: {
      bonusType: 'armorEnhancement',
      bonus: {
        ac: 4,
        ffAC: 4,
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

    modifierLoop(mythicPath);
    modifierLoop(toggle);
    modifierLoop(charMods);
    modifierLoop(charGear);
    modifierLoop(feats);
    modifierLoop(traits.value);
    modifierLoop(heritageTraits.value);

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
          (accumulator, cur) => ((cur >= 0 || !(stackableTypes.value.includes(bonusType)))
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

    modifierLoop(mythicPath);
    modifierLoop(toggle);
    modifierLoop(charMods);
    modifierLoop(charGear);
    modifierLoop(feats);
    modifierLoop(traits.value);
    modifierLoop(heritageTraits.value);

    const holder = reactive({});

    const stackableTypes = ref(['dodge', 'circumstance', 'untyped']);

    const modifiersHolderKeys = ref(Object.keys(modifiersHolder));

    modifiersHolderKeys.value.forEach((bonusTarget) => {
      const bonusTargetKeys = ref(Object.keys(modifiersHolder[bonusTarget]));
      bonusTargetKeys.value.forEach((bonusType) => {
        holder[bonusTarget] = holder[bonusTarget] ?? 0;
        holder[bonusTarget] += modifiersHolder[bonusTarget][bonusType].reduce(
          (accumulator, cur) => ((cur >= 0 && !(stackableTypes.value.includes(bonusType)))
            ? Math.max(accumulator, cur) : accumulator + cur), 0,
        );
      });
    });

    return holder;
  });

  charClasses.value.forEach((charClasses) => {
    charClasses.casterLevel += modifiers.value.casterLevel ?? 0;
    charClasses.spellPenetrationCasterLevel = charClasses.casterLevel
      + (modifiers.value.casterLevel ?? 0)
      + (modifiers.value.spellPenetrationCasterLevel ?? 0);
  });
  sr.value += modifiers.value.spellResistance ?? 0;
  sr.value += 10 + Math.floor(charLevel.value/2) + mythicTier.value;


  const multiAttackCount = computed(() => 1 + (modifiers.value.multiAttackCount ?? 0));


  const attackCount = computed(() => {
    let tempattackCount = 1;

    tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

    return tempattackCount;
  });
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
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

  // DEFENSE
  const ac = computed(() => {
    let tempAC = acCalc(abilityMods, modifiers, sizeModifier)
    for (const acKey in tempAC) {
      tempAC[acKey] += abilityMods.value.wisdom
    }
    return tempAC
  });

  const maxHP = computed(() => maxHPCalc(abilityMods, modifiers, charClasses, solo, level));
  const savingThrows = computed(() => savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level));

  // OFFENSE
  const melee = computed(() => meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier));
  const ranged = computed(() => rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier));


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

    {
      name: 'Accursed Critical',
      type: '',
      header: 'Accursed Critical',
      description: [
        'Whenever you confirm a critical hit you may cast bestow curse, major curse, or greater bestow curse on that target as a reaction.'
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
      name: 'Aging Touch',
      type: 'Su',
      header: `Aging Touch (Su)
       ${Math.floor(level.value / 2)} Str Damage | ${level.value}d6) (${1 + Math.floor(level.value / 5)}/Day)`,
      description: [
        'Your touch ages living creatures and objects. As a melee touch attack, you can deal 1 point of Strength damage for every two oracle levels you possess to living creatures.',
        'Against objects or constructs, you can deal 1d6 points of damage per oracle level.',
        'If used against an object in another creature’s possession, treat this attack as a sunder combat maneuver.',
        'You can use this ability once per day, plus one additional time per day for every five oracle levels you possess.',
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
    {
      name: 'Dual Path',
      type: 'Su',
      header: 'Dual Path',
      description: [
        'Trickster and Heirophant'
      ],
    },
    {
      name: 'Fleet',
      type: 'Su',
      header: 'Fleet',
      description: [
        '1 Extra Action per Round'
      ],
    },
    {
      name: 'Mythic Saving Throws',
      type: 'Ex',
      header: 'Mythic Saving Throws',
      description: [
        'At 5th tier, whenever you succeed at a saving throw against a spell or special ability, you suffer no effects as long as that ability didn’t come from a mythic source (such as a creature with a mythic tier or mythic ranks). If you fail a saving throw that results from a mythic source, you take the full effects as normal.',
      ],
    },
    {
      name: 'Legendary Item',
      type: 'Ex',
      header: 'Legendary Item (Ring of Mythic Haste)',
      description: [
        'Don\'t abuse it and I won\'t add a limit of rounds'
      ],
    },
    {
      name: 'Perfect Lie',
      type: 'Ex',
      header: 'Perfect Lie',
      description: [
        'When telling a lie, you can expend one use of mythic power to make the lie indiscernible from the truth by both Sense Motive and magic.',
        'Obvious proof of your falsehood still reveals the lie for what it is, but in absence of proof, those who hear your lie believe it.',
      ],
    },
    {
      name: 'Mythic Spell Lore',
      type: 'Ex',
      header: 'Mythic Spell Lore',
      description: [
        'You can learn a number of mythic spells equal to your tier and can expend mythic power when casting them to enhance the results.',
        'To select a mythic spell, you must be able to cast the non-mythic version or have it on your list of spells known. Every time you gain a new tier, you can select an additional mythic spell.',
        'Disintegrate, Deep Slumber, Invisibility, Mythic Severance, Deathless, Covetous Aura, Break Enchantment'
      ],
    },
    {
      name: 'Improved Critical (Mythic)',
      type: 'Ex',
      header: 'Improved Critical (Mythic)',
      description: [
        'Your critical multiplier with your chosen weapon is increased by 1 (to a maximum of ×6).'
      ],
    },
    {
      name: 'Strong Comeback (Mythic)',
      type: 'Ex',
      header: 'Strong Comeback (Mythic)',
      description: [
        'Whenever you’re allowed to reroll an ability check, a skill check, or a saving throw, roll two dice and take the higher result, before adding +2.'
      ],
    },
    {
      name: 'Deadly Dodge',
      type: 'Ex',
      header: 'Deadly Dodge (Ex)',
      description: [
        'As a swift action, you can expend one use of mythic power to gain a +4 dodge bonus to your AC until the start of your next turn.',
        'During this time, whenever a creature misses on a melee attack against you, it provokes an attack of opportunity from you.'
      ],
    },
    {
      name: 'Critical Focus (Mythic)',
      type: 'Ex',
      header: 'Critical Focus (Mythic)',
      description: [
        'You automatically confirm critical threats against non-mythic opponents.'
      ],
    },

    {
      name: 'Overcome Curse',
      type: 'Su',
      header: 'Overcome Curse',
      description: [
        'For example, bestow curse has no effect on you, and you can handle, carry, or discard a cursed magic item without harm.',
        'If a cursed item has useful functions and a cursed effect (such as armor of arrow attraction) or drawback (such as a mace of blood), you are immune to the cursed effect and drawback, and can still use its other abilities.',
        'If a cursed item works normally for a period of time before its curse triggers (such as gauntlets of fumbling), the item stops working for you when the curse would normally trigger.',
        'If you’re an oracle, you can ignore the negative effects of your oracle’s curse.'
      ],
    },

    {
      name: 'Maximized Critical',
      type: 'Ex',
      header: 'Maximized Critical x2',
      description: [
        'Whenever you score a critical hit, the weapon’s damage result is always the maximum possible amount you could roll.',
        'This doesn’t affect other dice added to the damage, such as from sneak attack or the flaming weapon special ability.'
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
    mythicPower,
    revelationDC,
    attackCount,
    multiAttackCount,
  };
});
export const useImmogen = defineStore("immogen", {
  state: () => ({
    immogen: immogen.value,
  }),
});


const jacob = computed(() => {
  const name = ref("JacoBard");
  const solo = ref(true);
  const traits = ref([
    {
      name: "???",
      bonusType: "racialTrait",
      bonus: {},
    },
    {
      name: "???",
      bonusType: "trait",
      bonus: {},
    },
  ]);
  const alignment = ref("CG");

  const heritage = ref("half-elf");
  const heritageTraits = ref([
    "Low-Light vision",
    {
      name: "Kindred Raised",
      bonusType: "racial",
      bonus: {
        charisma: 2,
      },
    },
  ]);
  const type = ref("humanoid");
  const subtype = ref(["human", "elf"]);
  const senses = ref(["Low-Light vision 60 ft."]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("medium");
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: "Bladed Scarf",
      weaponGroup: "light",
      dieCount: 1,
      dieSize: 6,
      critRange: 20,
    },
  ]);
  const charRanged = ref([
    {
      name: "Longbow",
      weaponGroup: "light",
      dieCount: 1,
      dieSize: 8,
      critRange: 20,
      critMult: 3,
      attackCount: 1,
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
    "Mwk Chain Shirt": {
      bonusType: "armor",
      cost: 100,
      bonus: {
        ac: 4,
        ffAC: 4,
      },
    },
    "Cracked Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 500,
      bonus: {
        initiative: 1,
      },
    },
  });

  const charLevel = ref(6);

  const charClasses = ref([
    {
      archetype: ['arrowsong'],
      name: 'bard',
      level: charLevel.value,
      first: true,
      hitDie: 8,
      bab: 3 / 4,
      skillRanks: 2,
      classSkills: [
        'acrobatics',
        'influence',
        'athletics',
        'religion',
        'nature',
        'Linguistics',
        'perception',
        'performance',
        'finesse',
        'spellcraft',
        'stealth',
      ],
      favored: {
        hp: charLevel.value,
        skill: 0,
        race: {
          "half-elf": 0,
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
        '2nd': {
          slots: 2,
          prepared: [
            'Gallant Inspiration',
            'Heroism',
            'Invisibility',
            'Hold Person',
          ],
        },
        '1st': {
          slots: 3,
          prepared: [
            'Charm Person',
            'Grease',
            'Hideous Laughter',
            'Silent Image',
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
      pointBuy: 18,
    },
    dexterity: {
      pointBuy: 18,
    },
    constitution: {
      pointBuy: 11,
    },
    intelligence: {
      pointBuy: 10,
    },
    wisdom: {
      pointBuy: 12,
    },
    charisma: {
      pointBuy: 14,
    },
  });
  const feats = reactive({
    "Master Performer": {},
    // "Grand Master Performer": {},
    "Lingering Performance": {},
    // "Extra Performance": {},
    "Outflank": {},
    "Improved Outflank": {},
    "Rapid Shot": {},
    "Manyshot": {},
    "Point Blank Shot": {
      attackRolls: 1,
      weaponDamage: 1,
    }
  });
  const skillPoints = reactive({
    acrobatics: {
      ranks: level.value,
      ability: 'dexterity',
    },
    athletics: {
      ranks: 1,
      ability: 'strength',
    },
    finesse: {
      ranks: 0,
      ability: 'dexterity',
    },
    influence: {
      ranks: level.value,
      ability: 'charisma',
    },
    nature: {
      ranks: level.value - 3,
      ability: 'intelligence',
    },
    perception: {
      ranks: 0,
      ability: 'wisdom',
    },
    performance: {
      ranks: level.value,
      ability: 'charisma',
    },
    religion: {
      ranks: level.value - 3,
      ability: 'intelligence',
    },
    society: {
      ranks: level.value - 3,
      ability: 'intelligence',
    },
    spellcraft: {
      ranks: level.value,
      ability: 'intelligence',
    },
    stealth: {
      ranks: 0,
      ability: 'dexterity',
    },
    survival: {
      ranks: level.value,
      ability: 'wisdom',
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
        attackCount: 1,
      },
    },
    {
      name: "Power Attack",
      bonusType: "",
      active: true,
      duration: 2,
      bonus: {
        attackRolls: -(Math.floor(baseAtk.value / 4) + 1),
        weaponDamage:
          (Math.floor(baseAtk.value / 4) + 1) * (2)
      },
    },
    {
      name: "Inspire Courage",
      bonusType: "competence",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 4,
        weaponDamage: 4,
      },
    },
    {
      name: "Heroism",
      bonusType: "morale",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 2,
        saves: 2,
        skills: 2,
      },
    },
  ]);

  const charMods = reactive({
    "Half-Elf": {
      bonusType: 'racial',
      bonus: {
        dexterity: 2,
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
        strength: 2,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 2,
      },
    },
    abpResistance: {
      bonusType: 'resistance',
      bonus: {
        saves: 2,
      },
    },
    abpNaturalArmor: {
      bonusType: 'naturalArmorEnhancement',
      bonus: {
        ac: 1,
        ffAC: 1,
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
    levelUp: {
      bonusType: 'inherent',
      bonus: {
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

  const attackCount = computed(() => {
    let tempattackCount = 3;

    tempattackCount += modifiers.value.attackCount ?? 0;

    // tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

    return tempattackCount;
  });


  // STATISTICS

  const abilityScores = computed(() => abilityScoresCalc(pointBuy, modifiers));

  const abilityMods = computed(() => abilityModsCalc(abilityScores));

  const cmb = computed(() => cmbCalc(abilityMods, baseAtk, sizeModifier, modifiers));
  const cmd = computed(() => cmdCalc(abilityMods, baseAtk, sizeModifier, modifiers, acBonuses));

  const skills = computed(() => {
    const skillRanks = skillPoints;

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
      totalSkills.acrobatics += (Math.log2(sizeModifier.value) + 1) * 2;
      totalSkills.stealth += (Math.log2(sizeModifier.value) + 1) * 4;
    }

    const tempClassSkills = ref(charClasses.value[0].classSkills);

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

  const cr = ref("");
  const xp = ref(null);
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

  // DEFENSE

  const ac = computed(() => acCalc(abilityMods, modifiers, sizeModifier));

  const maxHP = computed(() => maxHPCalc(abilityMods, modifiers, charClasses, solo, level));

  const savingThrows = computed(() => savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level));

  // OFFENSE

  const melee = computed(() => meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier));

  const ranged = computed(() => rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier));

  const bardicPerformance = computed(() => 4 + abilityMods.value.charisma + (level.value * 2));

  const specialAttacks = reactive([
    {
      name: `Inspire Courage (+4, ${ bardicPerformance.value }/day`,
    },
  ]);

  const featDescriptions = ref('');
  const heroPointAbilities = ref("");
  const mythicAbilities = ref("");


  const specialAbilities = ref('');

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
    attackCount,
    specialAttacks,
    bardicPerformance,
  };
});
export const useJacob = defineStore("jacob", {
  state: () => ({
    jacob: jacob.value,
  }),
});

const gorthor = computed(() => {
  const name = ref("Gorthor");
  const solo = ref(true);
  const traits = ref([
    {
      name: "???",
      bonusType: "racialTrait",
      bonus: {},
    },
    {
      name: "???",
      bonusType: "trait",
      bonus: {},
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
  const type = ref("humanoid");
  const subtype = ref(['reptilian']);
  const senses = ref(["darkvision 60 ft."]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("medium");
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
    {
      name: 'TWF Handaxe',
      weaponGroup: 'light',
      attackCount: 1,
      iterativeAttackCount: 1,
      attackPenalty: -2,
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
      iterativeMax : true,
      dieCount: 1,
      dieSize: 2,
      critRange: 20,
      critMult: 2,
    },
  ]);

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
  });

  const charLevel = ref(6);

  const charClasses = ref([
    {
      name: 'ninja',
      level: charLevel.value,
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
        skill: charLevel.value,
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
    },  ]);

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
  });
  const feats = reactive({
    'Two Weapon Fighting': {
      bonusType: '',
      bonus: {
        reflex: 0,
      },
    },
    'Improved Two Weapon Fighting': {
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
    'Improved Outflank': {
      bonusType: '',
      bonus: {},
    },
  });
  const skillPoints = reactive({
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
        attackCount: 1,
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
      name: "Inspire Courage",
      bonusType: "competence",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 4,
        weaponDamage: 4,
      },
    },
    {
      name: "Heroism",
      bonusType: "morale",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 2,
        saves: 2,
        skills: 2,
      },
    },
  ]);

  const charMods = reactive({
    Dragonborn: {
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
        strength: 2,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 2,
      },
    },
    abpResistance: {
      bonusType: 'resistance',
      bonus: {
        saves: 2,
      },
    },
    abpNaturalArmor: {
      bonusType: 'naturalArmorEnhancement',
      bonus: {
        ac: 1,
        ffAC: 1,
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
    levelUp: {
      bonusType: 'inherent',
      bonus: {
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

  const attackCount = computed(() => {
    let tempattackCount = 3;

    tempattackCount += modifiers.value.attackCount ?? 0;

    // tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

    return tempattackCount;
  });


  // STATISTICS

  const abilityScores = computed(() => abilityScoresCalc(pointBuy, modifiers));

  const abilityMods = computed(() => abilityModsCalc(abilityScores));

  const cmb = computed(() => cmbCalc(abilityMods, baseAtk, sizeModifier, modifiers));
  const cmd = computed(() => cmdCalc(abilityMods, baseAtk, sizeModifier, modifiers, acBonuses));

  const skills = computed(() => {
    const skillRanks = skillPoints;

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
      totalSkills.acrobatics += (Math.log2(sizeModifier.value) + 1) * 2;
      totalSkills.stealth += (Math.log2(sizeModifier.value) + 1) * 4;
    }

    const tempClassSkills = ref(charClasses.value[0].classSkills);

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

  const cr = ref("");
  const xp = ref(null);
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

  // DEFENSE

  const ac = computed(() => acCalc(abilityMods, modifiers, sizeModifier));

  const maxHP = computed(() => maxHPCalc(abilityMods, modifiers, charClasses, solo, level));

  const savingThrows = computed(() => savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level));

  // OFFENSE

  const melee = computed(() => meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier));

  const ranged = computed(() => rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier));

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
      header: 'Flurry of Stars (Ex) (1 ki point)',
      description: [
        'A ninja with this ability can expend 1 ki point from her ki pool and use 3 actions to attack with many shuriken.',
        'During that attack, she can throw two additional shuriken at her highest attack bonus, but all of her shuriken attacks are made at a –2 penalty, including the two extra attacks.',
      ],
    },
    {
      name: 'shadow clone',
      type: 'Ex',
      header: 'Shadow Clone (Su) (1 ki point)',
      description: [
        'The ninja can create 1d4 shadowy duplicates of herself that conceal her true location. This ability functions as mirror image, using the ninja’s level as her caster level.',
        'Using this ability uses 2 actions and 1 ki point.',
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
    attackCount,
    specialAttacks,
  };
});
export const useGorthor = defineStore("gorthor", {
  state: () => ({
    gorthor: gorthor.value,
  }),
});

const frey = computed(() => {
  const name = ref("Frey");
  const solo = ref(true);
  const traits = ref([
    {
      name: "???",
      bonusType: "racialTrait",
      bonus: {},
    },
    {
      name: "???",
      bonusType: "trait",
      bonus: {},
    },
  ]);
  const alignment = ref('CG');

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
      attackCount:0,
      dieCount: 2,
      dieSize: 12,
      critRange: 20,
      critMult: 3,
    },
  ]);
  const charRanged = ref([]);

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
  });

  const charLevel = ref(6);

  const charClasses = ref([
    {
      name: "fighter",
      archetype: ["high gaurdian"],
      level: charLevel.value,
      hitDie: 10,
      bab: 1,
      first: true,
      skillRanks: 1,
      classSkills: ["Acrobatics", "Athletics"],
      favored: {
        hp: 0,
        skill: charLevel.value,
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
  });
  const feats = reactive({
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
    'Improved Outflank': {
      bonusType: '',
      bonus: {},
    },
  });
  const skillPoints = reactive({
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
      name: "two handing",
      bonusType: "th",
      duration: 2,
      active: true,
      bonus: {
        // TODO strength / 2
        weaponDamage: Math.floor(5 / 2),
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
        attackCount: 1,
      },
    },
    {
      name: "Power Attack",
      bonusType: "PA",
      active: true,
      duration: 2,
      bonus: {
        attackRolls: -(Math.floor(baseAtk.value / 4) + 1),
        weaponDamage:
          (Math.floor(baseAtk.value / 4) + 1) * (3)
      },
    },
    {
      name: "Inspire Courage",
      bonusType: "competence",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 4,
        weaponDamage: 4,
      },
    },
    {
      name: "Heroism",
      bonusType: "morale",
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 2,
        saves: 2,
        skills: 2,
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
    weaponTraining: {
      bonusType: "",
      bonus: {
        attackRolls: 2,
        weaponDamage: 2,
        reflex: 2,
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
        strength: 2,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 2,
      },
    },
    abpResistance: {
      bonusType: 'resistance',
      bonus: {
        saves: 2,
      },
    },
    abpNaturalArmor: {
      bonusType: 'naturalArmorEnhancement',
      bonus: {
        ac: 1,
        ffAC: 1,
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
    levelUp: {
      bonusType: 'inherent',
      bonus: {
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

  const attackCount = computed(() => {
    let tempattackCount = 3;

    tempattackCount += modifiers.value.attackCount ?? 0;

    // tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

    return tempattackCount;
  });


  // STATISTICS

  const abilityScores = computed(() => abilityScoresCalc(pointBuy, modifiers));

  const abilityMods = computed(() => abilityModsCalc(abilityScores));

  const cmb = computed(() => cmbCalc(abilityMods, baseAtk, sizeModifier, modifiers));
  const cmd = computed(() => cmdCalc(abilityMods, baseAtk, sizeModifier, modifiers, acBonuses));

  const skills = computed(() => {
    const skillRanks = skillPoints;

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
      totalSkills.acrobatics += (Math.log2(sizeModifier.value) + 1) * 2;
      totalSkills.stealth += (Math.log2(sizeModifier.value) + 1) * 4;
    }

    const tempClassSkills = ref(charClasses.value[0].classSkills);

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

  const cr = ref("");
  const xp = ref(null);
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

  // DEFENSE

  const ac = computed(() => acCalc(abilityMods, modifiers, sizeModifier));

  const maxHP = computed(() => maxHPCalc(abilityMods, modifiers, charClasses, solo, level));

  const savingThrows = computed(() => savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level));

  // OFFENSE

  const melee = computed(() => meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier));

  const ranged = computed(() => rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier));

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
    attackCount,
    specialAttacks,
  };
});
export const useFrey = defineStore("frey", {
  state: () => ({
    frey: frey.value,
  }),
});

const ainsel = computed(() => {
  const name = ref("Ainsel Fairweather");
  const solo = ref(true);
  const traits = ref([
    {
      name: "???",
      bonusType: "trait",
      bonus: {},
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
  const alignment = ref("LE");

  const heritage = ref("Slyph");
  const heritageTraits = ref([
    "Superior Darkvision",
    {
      name: "Keen Senses",
      bonusType: "racial",
      bonus: {
        perception: 2,
      },
    },
    {
      name: "Voice in the Darkness",
      bonusType: "racial",
      bonus: {
        intimidate: 2,
        stealth: 2,
      },
    },
  ]);
  const type = ref("humanoid");
  const subtype = ref(["human", "native outsider"]);
  const senses = ref(["darkvision 60 ft."]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("medium");
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: "cestus",
      weaponGroup: "light",
      attackCount: 0,
      attackPenalty: 0,
      attack: 0,
      damage: 0,
      dieCount: 1,
      dieSize: 4,
      critRange: 19,
    },
  ]);
  const charRanged = ref([
    {
      name: "generic ranged attack",
    },
  ]);

  const charGear = reactive({
    "Belt of Dex +2": {
      bonusType: "enhancement",
      cost: 4000,
      bonus: {
        strength: 0,
        dexterity: 2,
        constitution: 0,
      },
    },
    "Belt of Int +2": {
      bonusType: "enhancement",
      cost: 4000,
      bonus: {
        intelligence: 2,
        wisdom: 0,
        charisma: 0,
      },
    },
    "Cloak of Resistance +2": {
      bonusType: "resistance",
      cost: 4000,
      bonus: {
        saves: 2,

      },
    },
    "Cracked Dusty Rose Prism Ioun Stone": {
      bonusType: "insight",
      cost: 500,
      bonus: {
        initiative: 1,
      },
    },
    "Masterwork Thieves Tools (Disable Device)": {
      bonusType: "circumstance",
      bonus: {
        "disable device": 2,
      },
    },
    "Bracers of Armor +8": {
      bonusType: "armor",
      bonus: {
        ac: 8,
        ffAC: 8,
      },
    },
  });

  const charLevel = ref(20);

  const charClasses = ref([
    {
      archetype: ["Sacred Fist"],
      name: "warpriest",
      level: charLevel.value - 10,
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
        hp: charLevel.value - 10,
        skill: 0,
        race: {},
      },
      saves: {
        fortitude: true,
        reflex: false,
        will: true,
      },
      casterLevel: charLevel.value - 1,
      casting: "prepared",
      castingStat: "wisdom",
      spells: {
        '6th': {
          slots: 4,
          prepared: [
            'Heal',
            'Harm',
            'Word of Recall',
            'Dispel Magic, Greater',
            'Source Severance',
          ],
        },
        '5th': {
          slots: 5,
          prepared: [
            'Caustic Blood',
            'unholy ice',
            'holy ice',
            'Cleanse',
            'break enchantment',
            'forbid action, greater',
            'forbid action',
          ],
        },
        '4th': {
          slots: 5,
          prepared: [
            'Magic Weapon, Greater',
            'Divine Power',
            'Symbol of Pain',
            'Spell Immunity',
            'Airwalk',
          ],
        },
        '3rd': {
          slots: 5,
          prepared: [
            'Deeper Darkness',
            'Borrow Fortune',
            'Stone Shape',
            'Protection from Energy',
            'Channel Vigor',
            'Bestow Curse',
          ],
        },
        '2nd': {
          slots: 5,
          prepared: [
            'Eagle\'s Splendor',
            'lesser restoration',
            'Weapon of Awe',
            'Ironskin',
            'hold person',
            'spiritual weapon',
          ],
        },
        '1st': {
          slots: 5,
          prepared: [
            'Shield of Faith',
            'Moment of Greatness',
            'Murderous Command',
            'Lucky Number',
            'Fallback Strategy',
            'advanced scurry',
          ],
        },
        Orisons: {
          prepared: [
            'Create Water',
            'Read Magic',
            'Stabilize',
            'Bleed',
            'Detect Magic',
            'detect poison',
          ],
        },

      },
    },
    {
      archetype: [],
      name: "Evangelist",
      level: charLevel.value - 10,
      hitDie: 8,
      bab: 3 / 4,
      first: false,
      skillRanks: 6,
      classSkills: [
        'Craft',
        'Diplomacy',
        'Heal',
        'Knowledge (religion)',
        'Perception',
        'Profession',
      ],
      favored: {
        hp: charLevel.value - 10,
        skill: 0,
        race: {},
      },
      saves: {
        fortitude: false,
        reflex: true,
        will: false,
      },
    },
  ]);

  const level = computed(() =>
    charClasses.value.reduce(
      (accumulator, charClass) =>
        charClass.gestalt ?? false
          ? Math.max(accumulator, charClass.level)
          : accumulator + charClass.level,
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
      pointBuy: 16,
    },
    intelligence: {
      pointBuy: 16,
    },
    wisdom: {
      pointBuy: 13,
    },
    charisma: {
      pointBuy: 7,
    },
  });
  const feats = reactive({
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
      active: true,
      duration: 2,
      bonus: {
        attackRolls: -(Math.floor(baseAtk.value / 4) + 1),
        weaponDamage:
          (Math.floor(baseAtk.value / 4) + 1) * (2)
      },
    },
    {
      name: "Ki Insight",
      bonusType: "insight",
      active: false,
      duration: 2,
      bonus: {
        ac: 5,
        touchAC: 5,
      },
    },
    {
      name: "Ki Dodge (1 round)",
      bonusType: "dodge",
      active: false,
      duration: 2,
      bonus: {
        ac: 4,
        touchAC: 4,
      },
    },
    {
      name: "Shield of Faith",
      bonusType: "deflection",
      active: true,
      duration: 2,
      bonus: {
        ac: 5,
        touchAC: 5,
      },
    },
    {
      name: 'Flurry of Blows',
      bonusType: '',
      duration: 2,
      active: true,
      bonus: {
        attackRolls: -2,
        multiAttackCount: 1,
      },
    },
    {
      name: 'Ironskin',
      bonusType: 'naturalArmorEnhancement',
      duration: 2,
      active: false,
      bonus: {
        ac: 7,
        ffAC: 7,
      },
    },
    {
      name: 'Divine Power',
      bonusType: 'luck',
      duration: 2,
      active: false,
      bonus: {
        attackRolls: 7,
        weaponDamage: 7,
      },
    },
    {
      name: 'Spiritual Form',
      bonusType: 'untyped',
      duration: 2,
      active: false,
      bonus: {
        dexterity: 4,
      },
    },
    {
      name: 'Apostle Kyton Template',
      bonusType: 'kyton',
      duration: 2,
      active: false,
      bonus: {
        strength: 6,
        dexterity: 4,
        constitution: 6,
        intelligence: 2,
        wisdom: 6,
        charisma: 6,
        bluff: 4,
        heal: 4,
        intimidate: 4,
        ac: 4,
        ffAC: 4,
      },
    },
    {
      name: 'Destructive Attacks',
      bonusType: 'morale',
      duration: 2,
      active: false,
      bonus: {
        weaponDamage: Math.floor(level.value / 2),
      },
    },


  ]);

  const charMods = reactive({
    "Noble Drow": {
      bonusType: "racial",
      bonus: {
        dexterity: 4,
        constitution: -2,
        intelligence: 2,
        wisdom: 2,
        charisma: 2,
        spellResistance: 11 + level.value,
      },
    },
    levelUp: {
      bonusType: "levelUp",
      bonus: {
        constitution: 5,
      },
    },
    inherent: {
      bonusType: "inherent",
      bonus: {
        strength: 5,
        dexterity: 5,
        constitution: 5,
        intelligence: 5,
        wisdom: 5,
        charisma: 5,
      },
    },
    "Perfect Body Flawless Mind": {
      bonusType: "pbfm",
      bonus: {
        constitution: 8,
      },
    },
    "Sacred Fist": {
      bonusType: "dodge",
      bonus: {
        ac: 4,
        touchAC: 4,
        ffAC: 4,
      },
    },
    "Protective Grace": {
      bonusType: "dodge",
      bonus: {
        ac: 2,
        touchAC: 2,
      },
    },
    "Multitude of Talents": {
      bonusType: "profane",
      bonus: {
        skills: 4,
      },
    },

  });

  const acBonuses = computed(() => acBonusesCalc(toggle, charMods, charGear, feats, traits, heritageTraits));
  const modifiers = computed(() => modifiersCalc(toggle, charMods, charGear, feats, traits, heritageTraits));

  charClasses.value.forEach((charClasses) => {
    charClasses.casterLevel += modifiers.value.casterLevel ?? 0;
    charClasses.spellPenetrationCasterLevel = charClasses.casterLevel
      + (modifiers.value.casterLevel ?? 0)
      + (modifiers.value.spellPenetrationCasterLevel ?? 0);
  });
  sr.value += modifiers.value.spellResistance ?? 0;


  const multiAttackCount = computed(() => 1 + (modifiers.value.multiAttackCount ?? 0));


  const attackCount = computed(() => {
    let tempattackCount = 1;

    tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

    return tempattackCount;
  });
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
  const initiative = computed(() => initiativeCalc(abilityMods, modifiers));

  // DEFENSE
  const ac = computed(() => {
    let tempAC = acCalc(abilityMods, modifiers, sizeModifier)
    for (const acKey in tempAC) {
      tempAC[acKey] += abilityMods.value.wisdom
    }
    return tempAC
  });

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
    attackCount,
    multiAttackCount,
  };
});
export const useAinsel = defineStore("ainsel", {
  state: () => ({
    ainsel: ainsel.value,
  }),
});
