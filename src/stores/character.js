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

function acBonusesCalc(toggle, charMods, charGear, feats, traits, heritageTraits, sizeMod = 0) {
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

  const holder = reactive({ 'ac': {'size' : sizeMod}});

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


  if (!holder.ac ?? true) {
    holder.ac = {'dummy': 0}
  }

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



    tempCMD += (acBonuses.value[miscModsKey] ?? 0);

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

  tempClassSkills.value = tempClassSkills.value.map(element => {
    return element.toLowerCase();
  });

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

function maxHPCalc(abilityMods, modifiers, charClasses, solo, level, mythicTier = 0, mythicHitDie = 0) {
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

  hitPoints += mythicTier * mythicHitDie


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

  // console.log(abilityMods.value)

  const tempMeleeAttack = ref(
    Math.max(abilityMods.value.dexterity, abilityMods.value.strength) +
    baseAtk.value +
    sizeModifier.value
  );
  const tempMeleeDamage = ref(Math.floor(abilityMods.value.strength));

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

  tempMeleeDamage.value += (modifiers.value.meleeWeaponDamage ?? 0) +
    (modifiers.value.weaponDamage ?? 0) +
    (modifiers.value.trueWeaponDamage ?? 0);

  tempDexDamage.value += (modifiers.value.weaponDamage ?? 0) +
    (modifiers.value.trueWeaponDamage ?? 0);

  tempMeleeAttack.value += (modifiers.value.attackRolls ?? 0) +
    (modifiers.value.weaponAttackRolls ?? 0);

  const mOptions = ref([]);

  // console.log(tempMeleeDamage.value)
  // console.log(tempDexDamage.value)

  charMelee.value.forEach((meleeOption) => {
    const option = ref({
      attack: 0,
      damage: 0,
    });
    Object.keys(meleeOption).forEach((meleeAttr) => {
      option.value[meleeAttr] = meleeOption[meleeAttr];
    });
    option.value.dieCount += (modifiers.value.meleeDieCount ?? 0);
    option.value.attack += tempMeleeAttack.value;
    option.value.damage +=
      option.value.weaponGroup === "light"
        ? Math.max(tempMeleeDamage.value, tempDexDamage.value)
        : tempMeleeDamage.value;
    option.value.attackCount += (modifiers.value.hasteAttackCount ?? 0);
    if (!option.value.weapon) {
      option.value.attack -= (modifiers.value.weaponAttackRolls ?? 0);
      option.value.damage -= (modifiers.value.trueWeaponDamage ?? 0);
    }

    mOptions.value.push(option.value);
  });

  return mOptions.value;
}

function rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier) {
  const tempRangedAttack = ref(
    abilityMods.value.dexterity +
    baseAtk.value +
    sizeModifier.value +
    (modifiers.value.attackRolls ?? 0) +
    (modifiers.value.rangedAttackRolls ?? 0) +
    (modifiers.value.weaponAttackRolls ?? 0)
  );
  const tempRangedDamage = ref(
    abilityMods.value.strength +
    (modifiers.value.weaponDamage ?? 0) +
    (modifiers.value.rangedWeaponDamage ?? 0) +
    (modifiers.value.trueWeaponDamage ?? 0)
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
    option.value.damage += (rangedOption.damageAbility ? (-abilityMods.value.strength
      + abilityMods.value[rangedOption.damageAbility]) : 0)

    option.value.attack += tempRangedAttack.value;
    option.value.damage += tempRangedDamage.value;
    option.value.attackCount += (modifiers.value.hasteAttackCount ?? 0);


    if (!option.value.weapon) {
      option.value.attack -= (modifiers.value.weaponAttackRolls ?? 0);
      option.value.damage -= (modifiers.value.trueWeaponDamage ?? 0);
    }

    rOptions.value.push(option.value);
  });

  return rOptions.value;
}

// CHARACTERS
const rub = computed(() => {
  const id = ref(1001);
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
    id,
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
  const id = ref(1002);
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
    id,
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
  const id = ref(1003);
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
    id,
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
export const useBub = defineStore("bub", {
  state: () => ({
    bub: bub.value,
  }),
});

const sareah = computed(() => {
  const id = ref(1004);
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
      name: "Fate's Favored",
      bonusType: "trait",
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
      name: "Mythic Witch Knife (Shadow's Touch)",
      weaponGroup: "light",
      attackCount: 0,
      dieCount: 1,
      dieSize: 4,
      critRange: 17,
      weapon: true,
      attack: 6,
      damage: 6,
    },
  ]);
  const charRanged = ref([
    {
      name: "generic ranged attack",
    },
  ]);

  const charGear = reactive({
    "Ring of Evasion": {
      searchText: "ring of evasion",
    },
    "Belt of Stoneskin": {
      searchText: "Belt of Stoneskin",
    },
    "Cloak of Blur": {
      searchText: "Cloak of displacement*minor",
    },
    "Staff of Mage's Magnificent Mansion": {
      searchText: "",
    },
    "ring of counterspells": {
      searchText: "ring of counterspells",
    },
    "rod of abrupt hexes": {
      searchText: "rod of abrupt hexes",
    },
    "rod of voracious hexes": {
      searchText: "rod of voracious hexes",
    },
    "Quicken Rod (lesser and normal)": {
      searchText: "quicken metamagic rod",
    },
    "circlet of mindsight": {
      searchText: "circlet of mindsight",
    },

    "Headband Of Mental Superiority +6": {
      searchText: "Headband Of Mental Superiority *6",
      bonusType: "enhancement",
      cost: 0,
      bonus: {
        intelligence: 6,
        wisdom: 6,
        charisma: 6,
      },
    },
    "Belt Of Physical Perfection +6": {
      searchText: "Belt Of Physical Perfection *6",
      bonusType: "enhancement",
      cost: 0,
      bonus: {
        strength: 6,
        dexterity: 6,
        constitution: 6,
      },
    },
    "Robe of the Archmagi": {
      searchText: "Robe Of The Archmagi",
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
      searchText: "",
      noShow: true,
      bonusType: "armor",
      cost: 88500,
      bonus: {
        ac: 5,
        ffAC: 5,
      },
    },
    "Mythril Caster's Shield +5": {
      searchText: "Caster's Shield, Greater",
      bonusType: "shield",
      cost: 26000,
      bonus: {
        ac: 6,
        ffAC: 6,
      },
    },
    "Ring of Protection +5": {
      searchText: "Ring of Protection *5",
      bonusType: "deflection",
      cost: 2000,
      bonus: {
        ac: 5,
        ffAC: 5,
        touchAC: 5,
      },
    },
    "Masterwork Tools (Bluff)": {
      searchText: "",
      bonusType: "circumstance",
      bonus: {
        bluff: 2,
      },
    },
    "Cackling Hag's Blouse": {
      searchText: "Cackling Hag's Blouse",
      bonusType: "competence",
      bonus: {
        intimidate: 2,
      },
    },
    "Luckstone": {
      searchText: "",
      bonusType: "luck",
      cost: 20000,
      bonus: {
        saves: 2,
        skills: 2,
      },
    },
    "Numerology Cylinder": {
      searchText: "",
      bonusType: "insight",
      cost: 5000,
      bonus: {
        spellPenetrationCasterLevel: 2,
      },
    },
    "Orange Prism Ioun Stone": {
      searchText: "orange prism ioun stone",
      bonusType: "ioun",
      cost: 30000,
      bonus: {
        casterLevel: 1,
      },
    },
    "Cracked Pale Green Prism Ioun Stone": {
      searchText: "pale green prism ioun stone",
      bonusType: "competence bonus",
      cost: 4000,
      bonus: {
        saves: 1,
      },
    },
    "Dusty Rose Prism Ioun Stone": {
      searchText: "Dusty Rose Prism Ioun Stone",
      bonusType: "insight",
      cost: 5000,
      bonus: {
        ac: 1,
        ffAC: 1,
        touchAC: 1,
      },
    },
    "Cracked Dusty Rose Prism Ioun Stone": {
      searchText: "pale green prism ioun stone",
      bonusType: "insight",
      cost: 500,
      bonus: {
        initiative: 1,
      },
    },
    "Shadow's Touch": {
      searchText: "Shadow's Touch",
    }
  });

  const mythic = reactive({
    mythicPath: 'Archmage',
    mythicTier: 10,
    mythicHitDie: 3,
  })

  const mythicPower = computed(() => (mythic.mythicTier * 2) + 3);

  const charLevel = ref(20);

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
      mythicSpells: [
        'haste',
        'deathless',
        'ill omen',
        'heroism',
        'transformation',
        'heal',
        'foresight',
        'deep slumber',
        'chain lightning',
        'plane shift',
        'fly',
        'dispel magic',
        'borrowed time'
      ],
      spells: {
        "9th": {
          slots: 4,
          prepared: ["Foresight", "Dominate Monster"],
        },
        "8th": {
          slots: 5,
          prepared: ["moment of prescience","charm monster, mass","death clutch", "soulseeker"],
        },
        "7th": {
          slots: 5,
          prepared: ["plane shift", "chain lightning", "heal"],
        },
        "6th": {
          slots: 6,
          prepared: ["wither limb", "fey form II", "dispel magic, greater", "cone of cold", "suggestion, mass", "borrowed time"],
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
            "deathless",
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
            "deep slumber",
          ],
        },
        "2nd": {
          slots: 6,
          prepared: [
            "lipstitch",
            "hold person",
            "web",
            "enthrall",
            "Protective Penumbra",
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
        name: "trickery",
        "1st": "animate rope",
        "2nd": "mirror image",
        "3rd": "major image",
        "4th": "hallucinatory terrain",
        "5th": "mirage arcana",
        "6th": "mislead",
        "7th": "reverse gravity",
        "8th": "screen",
        "9th": "time stop",
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
  const dr = ref({
    "Adamantine": 10,
  });
  const resist = ref("");
  const immune = ref("Sleep");
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
      pointBuy: 15,
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
      type: "mythicCombat",
      bonusType: "untyped",
      bonus: {
        initiative: 14,
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
    "Noble Spell Resistance": {
      bonusType: "resistance",
      bonus: {
        spellResistance: 11 + level.value,
      },
    },
    "witch knife": {
      bonusType: "",
      type: "mythic",
      bonus: {
        spellDCMod: 1,
      },

    },
    "split major hex": {},
    // "Spell Chain": {},
  });
  const skillPoints = reactive({
    acrobatics: {
      ranks: level.value,
      ability: "dexterity",
    },
    appraise: {
      ranks: level.value,
      ability: "intelligence",
    },
    bluff: {
      ranks: level.value,
      ability: "charisma",
    },
    climb: {
      ranks: level.value,
      ability: "strength",
    },
    craft: {
      ranks: level.value,
      ability: "intelligence",
    },
    diplomacy: {
      ranks: level.value,
      ability: "charisma",
    },
    "disable device": {
      ranks: level.value,
      ability: "dexterity",
    },
    disguise: {
      ranks: level.value,
      ability: "charisma",
    },
    "escape artist": {
      ranks: level.value,
      ability: "dexterity",
    },
    fly: {
      ranks: level.value,
      ability: "dexterity",
    },
    "handle animal": {
      ranks: level.value,
      ability: "charisma",
    },
    heal: {
      ranks: level.value,
      ability: "wisdom",
    },
    intimidate: {
      ranks: level.value,
      ability: "charisma",
    },
    knowledge: {
      arcana: {
        ranks: level.value,
        ability: "intelligence",
      },
      dungeoneering: {
        ranks: level.value,
        ability: "intelligence",
      },
      engineering: {
        ranks: level.value,
        ability: "intelligence",
      },
      geography: {
        ranks: level.value,
        ability: "intelligence",
      },
      history: {
        ranks: level.value,
        ability: "intelligence",
      },
      local: {
        ranks: level.value,
        ability: "intelligence",
      },
      nature: {
        ranks: level.value,
        ability: "intelligence",
      },
      nobility: {
        ranks: level.value,
        ability: "intelligence",
      },
      planes: {
        ranks: level.value,
        ability: "intelligence",
      },
      religion: {
        ranks: level.value,
        ability: "intelligence",
      },
    },
    linguistics: {
      ranks: level.value,
      ability: "intelligence",
    },
    perception: {
      ranks: level.value,
      ability: "wisdom",
    },
    perform: {
      ranks: level.value,
      ability: "charisma",
    },
    profession: {
      ranks: level.value,
      ability: "wisdom",
    },
    ride: {
      ranks: level.value,
      ability: "dexterity",
    },
    "sense motive": {
      ranks: level.value,
      ability: "wisdom",
    },
    "slight of hand": {
      ranks: level.value,
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
      ranks: level.value,
      ability: "wisdom",
    },
    swim: {
      ranks: level.value,
      ability: "strength",
    },
    "use magic device": {
      ranks: level.value,
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

  const baseAtkCalc = computed(() => {
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
        attackCount: 1,
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
      name: "Fey Form III (diminutive)",
      bonusType: "size",
      active: true,
      duration: 1,
      bonus: {
        strength: -4,
        dexterity: 8,
        size: 4,
      },
    },
    {
      name: "Fey Form III (huge)",
      bonusType: "size",
      active: false,
      duration: 1,
      bonus: {
        strength: 6,
        constitution: 6,
        dexterity: -4,
        size: -2,
      },
    },
    {
      name: "Mythic Heroism",
      bonusType: "morale",
      active: true,
      duration: 1,
      bonus: {
        attackRolls: 4,
        weaponDamage: 4,
        saves: 4,
        initiative: 4,
        spellPenetrationCasterLevel: 4,
      },
    },

    {
      name: "Enduring Armor",
      bonusType: "armor",
      active: true,
      duration: 1,
      bonus: {
        ac:  3 + mythic.mythicTier,
        ffac: 3 + mythic.mythicTier,
      },
    },
    {
      name: "Transformation",
      bonusType: "naturalArmor",
      active: false,
      duration: 1,
      bonus: {
        ac:  4,
        ffac: 4,
        fortitude: 4,
        bab: level.value,
      },
    },
    {
      name: "Mythic Foresight",
      bonusType: "insight",
      active: true,
      duration: 1,
      bonus: {
        ac:  3,
        ffAC: 3,
        touchAC: 3,
        reflex: 3,
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
    age: {
      bonusType: "age",
      bonus: {
        intelligence: 3,
        wisdom: 3,
        charisma: 3,
      },
    },
    levelUp: {
      bonusType: "",
      bonus: {
        intelligence: 5,
      },
    },
    mythic: {
      bonusType: "mythic",
      bonus: {
        intelligence: 12, // mythic ability score thing
      },
    },
    Wish: {
      bonusType: "inherent",
      cost: 0,
      bonus: {
        strength: 5,
        dexterity: 5,
        constitution: 5,
        intelligence: 5,
        wisdom: 5,
        charisma: 5,
      },
    },
    "perfect body, flawless mind" : {
      bonusType: "super",
      bonus: {
        intelligence: 8,
      }
    },
  });

  const modifiers = computed(() => modifiersCalc(toggle, charMods, charGear, feats, traits, heritageTraits));

  charClasses.value.forEach((charClasses) => {
    charClasses.casterLevel += modifiers.value.casterLevel ?? 0;
    charClasses.spellPenetrationCasterLevel = charClasses.casterLevel
      + (modifiers.value.casterLevel ?? 0)
      + (modifiers.value.spellPenetrationCasterLevel ?? 0);
  });
  sr.value += Math.max(modifiers.value.spellResistance ?? 0, sr.value);

  const sizeModifier = computed(() => {
    let tempSize = sizeMod.value;

    tempSize += modifiers.value.size ?? 0;

    return tempSize;
  });


  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

  size.value = getKeyByValue(sizeTable, sizeModifier.value);

  const acBonuses = computed(() => acBonusesCalc(toggle, charMods, charGear, feats, traits, heritageTraits, sizeModifier.value));

  // STATISTICS



  const baseAtk = computed(() => {
    let tempBab = 0;

    tempBab += baseAtkCalc.value

    tempBab = Math.max(modifiers.value.bab ?? 0, tempBab)

    return tempBab
  });

  console.log(baseAtk.value)

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
  const maxHP = computed(() => maxHPCalc(abilityMods, modifiers, charClasses, solo, level, mythic.mythicTier, mythic.mythicHitDie));
  const savingThrows = computed(() => savingThrowsCalc(abilityMods, modifiers, saveAbilityScore, charClasses, level));

  // OFFENSE
  const melee = computed(() => meleeCalc(abilityMods, modifiers, charMelee, baseAtk, sizeModifier));
  const ranged = computed(() => rangedCalc(abilityMods, modifiers, charRanged, baseAtk, sizeModifier));

  const heroPointAbilities = ref("");
  const mythicAbilities = ref("");

  const attackCount = computed(() => {
    let tempattackCount = 1;

    tempattackCount += modifiers.value.attackCount ?? 0;

    tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

    return tempattackCount;
  });


  const hexDC = computed(
    () => 10 + Math.floor(level.value / 2) + abilityMods.value.intelligence
  );

  const spellDCMod = ref(modifiers.value.spellDCMod ?? 0);


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
        "pariah",
        "curse of nonviolence",
        "Dire Prophecy",
        "life giver",
        "witch's hut",
      ],
    },
    {
      name: `Mythic Abilities`,
      hexes: [
        {name: "surge (+1d12)",
        searchText: "surge"},
        "amazing initiative",
        "recuperation",
        "wild arcana",
        "throw spell",
        "mythic spellcasting",
        "eldritch breach",
        "mythic hexes",
        "infectious spell",
        "mythic accursed hex",
        "mythic witch knife",
        "force of will",
        "mythic saving throws",
        "flexible counterspell",
        "Enhanced Ability",
        "unstoppable",
        "channel power",
        "ultimate versatility",
        "enduring armor",
        "Teleportation Master",
        "Sanctum",
        "immortal",
        "legendary hero",
        "true archmage",
        "mythic quicken spell"
      ],
    },
  ]);

  const activeSpecialAbilities = reactive([
    {
      name: `Mythic Power (${mythicPower.value}/day)`,
      searchText: 'Mythic Power',
      id: 2,
      size: mythicPower.value,
    },
    {
      name: `Conduit Surge (1d4) (${3 + abilityMods.value.charisma}/day) (DC 11-23 Fort)`,
      searchText: 'Conduit Surge',
      id: 3,
      size: 3 + abilityMods.value.charisma,
    },
  ]);
  const activeGear = reactive([
    {
      name: `Lesser Quicken Rod (6/day)`,
      searchText: 'Quicken metamagic Rod',
      id: 4,
      size: 6,
    },
    {
      name: `Quicken Rod (6/day)`,
      searchText: 'Quicken metamagic Rod',
      id: 5,
      size: 6,
    },
    {
      name: `Major Quicken Rod (6/day)`,
      searchText: 'Quicken metamagic Rod',
      id: 8,
      size: 6,
    },

    {
      name: `rod of abrupt hexes`,
      searchText: 'rod of abrupt hexes',
      id: 6,
      size: 6,
    },
    {
      name: `rod of voracious hexes`,
      searchText: 'rod of voracious hexes',
      id: 7,
      size: 6,
    },
  ]);


  return {
    name,
    id,
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
    size,
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
    toggle,
    modifiers,
    heroPointAbilities,
    mythicAbilities,
    specialAttacks,
    hexDC,
    feats,
    spellDCMod,
    mythic,
    mythicPower,
    activeSpecialAbilities,
    activeGear,
    sizeModifier,
    attackCount
  };
});
export const useSareah = defineStore("sareah", {
  state: () => ({
    sareah: sareah.value,
  }),
});

const dominic = computed(() => {
  const id = ref(1005);
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
    id,
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
  const id = ref(1006);
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
        fortitude: 6,
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
  sr.value += 10 + Math.floor(charLevel.value / 2) + mythicTier.value;


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
    id,
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

const jothriel = computed(() => {
  const id = ref(1007);
  const name = ref("Jothriel");
  const solo = ref(true);
  const traits = ref([
    {
      name: "reactionary",
      bonusType: "racialTrait",
      bonus: {
        initiative: 2,
      },
    },
    {
      name: "resilient",
      bonusType: "trait",
      bonus: {
        fortitude: 1
      },
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

  const charLevel = ref(10);

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
        '4th': {
          slots: 0,
          prepared: [
            'Greater Invisibility',
            'Modify Memory',
          ],
        },
        '3rd': {
          slots: 2,
          prepared: [
            'Confusion',
            'Ectoplasmic Snare',
            'Major Image',
            'Dispel Magic',
          ],
        },
        '2nd': {
          slots: 3,
          prepared: [
            'Gallant Inspiration',
            'Heroism',
            'Invisibility',
            'Hold Person',
            'Silence',
          ],
        },
        '1st': {
          slots: 4,
          prepared: [
            'Charm Person',
            'Grease',
            'Hideous Laughter',
            'Silent Image',
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
    // "Master Performer": {},
    // "Grand Master Performer": {},
    "Lingering Performance": {},
    "Extra Performance": {},
    "Outflank": {},
    "Improved Outflank": {},
    "Rapid Shot": {},
    "Manyshot": {},
    "Point Blank Shot": {
      bonusType: 'pointBlank',
      bonus: {
        attackRolls: 1,
        weaponDamage: 1,
      }
    },
    "Snap Shot": {},
    "Weapon Focus (Bow)": {
      bonusType: 'weaponFocus',
      bonus: {
        attackRolls: 1,
      }
    },
    // "Improved Snap Shot": {},

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
      ranks: level.value - 5,
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
      ranks: level.value - 3,
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
        attackRolls: 2,
        weaponDamage: 2,
      },
    },
    abpAbilityScores: {
      bonusType: 'enhancement',
      bonus: {
        strength: 4,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 4,
      },
    },
    abpResistance: {
      bonusType: 'resistance',
      bonus: {
        saves: 3,
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
        ac: 2,
        ffAC: 2,
        touchAC: 2,
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
        ac: 2,
        ffAC: 2,
      },
    },
    levelUp: {
      bonusType: 'inherent',
      bonus: {
        constitution: 1,
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
      name: `Inspire Courage (+4, ${bardicPerformance.value}/day`,
    },
  ]);

  const featDescriptions = ref('');
  const heroPointAbilities = ref("");
  const mythicAbilities = ref("");


  const specialAbilities = ref('');

  return {
    name,
    id,
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
export const useJothriel = defineStore("jothriel", {
  state: () => ({
    jothriel: jothriel.value,
  }),
});

const gorthor = computed(() => {
  const id = ref(1008);
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
        ac: 2,
        ffAC: 2,
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
      name: 'Flaming Handaxe',
      weaponGroup: 'light',
      attackCount: 0,
      attackPenalty: 0,
      dieCount: 1,
      dieSize: 6,
      critRange: 20,
      critMult: 3,
      special: '1d6 fire',
    },
    {
      name: 'TWF Flaming Handaxe',
      weaponGroup: 'light',
      attackCount: 1,
      iterativeAttackCount: 1,
      attackPenalty: -2,
      dieCount: 1,
      dieSize: 6,
      critRange: 20,
      critMult: 3,
      special: '1d6 fire',

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
      special: '1d6 cold',
    },
    {
      name: 'Rapid TWF Flurry of Stars',
      weaponGroup: 'thrown',
      attackCount: 4,
      iterativeAttackCount: 1,
      attackPenalty: -6,
      iterativeMax: true,
      dieCount: 1,
      dieSize: 2,
      critRange: 20,
      critMult: 2,
      special: '1d6 cold',
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

  const charLevel = ref(16);

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
    },]);

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
  const willSpecial = ref("Advantage on Enchantment Effects")

  const defensiveAbilities = ref("");
  const dr = ref("");
  const resist = ref("");
  const immune = ref("fire");
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
      pointBuy: 19,
    },
    constitution: {
      pointBuy: 13,
    },
    intelligence: {
      pointBuy: 13,
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
    'Point Blank Shot': {
      bonusType: 'pbs',
      bonus: {
        rangedAttackRolls: 1,
        rangedWeaponDamage: 1,
      },
    },
    'Rapid Shot': {
      bonusType: 'rapidShot',
      bonus: {},
    },
    'Dodge': {
      bonusType: 'dodge',
      bonus: {
        ac: 1,
        touchAC: 1,
      },
    },
    'Armor Focus (chainshirt)': {
      bonusType: 'armorFocus',
      bonus: {
        ac: 1,
        ffAC: 1,
      },
    },
    'Greater Weapon Focus': {
      bonusType: 'weaponFocus',
      bonus: {
        attackRolls: 2,
      },
    },
    'Improved Initiative': {
      bonusType: 'dodge',
      bonus: {
        initiative: 4,
      },
    },
    'Extra Ninja Trick x2': {
      searchText: 'Extra Ninja Trick'
    },
    'Paired Opportunists': {},
    'Seize the Moment': {},
    'Combat Reflexes': {},
    'Broken Wing Gambit': {},

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
      ranks: level.value,
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
        // attackCount: 1,
        hasteAttackCount: 1,
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
        dexterity: 2,
        charisma: 2,
        wisdom: -2,
      },
    },
    abpWeapon: {
      bonusType: 'enhancement',
      bonus: {
        attackRolls: 3,
        weaponDamage: 3,
      },
    },
    ninjaTraining: {
      bonusType: "",
      bonus: {
        weaponAttackRolls: 2,
        TrueWeaponDamage: 2,
        will: 4
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
        ac: 0,
        ffAC: 0,

      },
    },
    abpArmor: {
      bonusType: 'armorEnhancement',
      bonus: {
        ac: 5,
        ffAC: 5,
      },
    },
    levelUp: {
      bonusType: 'levelUp',
      bonus: {
        dexterity: 4,
      },
    },
    wish: {
      bonusType: 'inherent',
      bonus: {
        strength: 2,
        dexterity: 1,
        constitution: 1,
        wisdom: 1,
      }
    }
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
    let tempattackCount = 1;

    tempattackCount += modifiers.value.attackCount ?? 0;

    tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

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
      name: `sneak attack (+${Math.floor((level.value + 1) / 2)}d6, and +${Math.floor((level.value + 1) / 4)} Str and Dex Damage, and 1d4 Con Bleed`,
    },
    {
      name: `Breath Weapon (3/day or 1 Ki) (4 Ki swift) (60-ft. line or 30-ft. cone, DC ${Math.max(Math.floor(level.value / 2), 1) + abilityMods.value.charisma + 10}, ${level.value}d6  + ${level.value * 3}`,
    },
  ]);

  const activeSpecialAbilities = reactive([

    {
      name: `Ki Pool (${Math.floor((level.value) / 2) + abilityMods.value.charisma - 2}/day)`,
      searchText: 'Ninja Ki Pool',
      id: 9,
      size: Math.floor((level.value) / 2)  + abilityMods.value.charisma - 2,
    },
    {
      name: 'Shadow Clone (0 Ki)',
      searchText: 'Shadow Clone'
    },
    {
      name: 'Invisible Blade (0 Ki)',
      searchText: 'Invisible Blade'
    },
    {
      name: `Assassinate (0 Ki) (DC ${10 + Math.floor((level.value) / 2) + abilityMods.value.charisma} Fortitude)`,
      searchText: 'Assassinate'
    },
    {
      name: 'Opportunist',
    },
    {
      name: 'Crippling Strike',
    },
    {
      name: 'Pressure Points',
    },
    {
      name: 'Petrifying Strike',
    },
  ]);

  return {
    name,
    id,
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
    toggle,
    modifiers,
    attackCount,
    specialAttacks,
    activeSpecialAbilities,
    willSpecial,
    feats,
  };
});
export const useGorthor = defineStore("gorthor", {
  state: () => ({
    gorthor: gorthor.value,
  }),
});

const frey = computed(() => {
  const id = ref(1009);
  const name = ref("Frey");
  const solo = ref(true);
  const traits = ref([
    {
      name: "reactionary",
      bonusType: "racialTrait",
      bonus: {
        initiative: 2,
      },
    },
    {
      name: "Indomitable Faith",
      bonusType: "trait",
      bonus: {
        will: 1,
      },
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
      name: "Frey's Holy Returning Great Club",
      weaponGroup: "one handed",
      weapon: true,
      damage: -48,
      attackCount: 0,
      dieCount: 9,
      dieSize: 12,
      critRange: 20,
      critMult: 3,
    },
  ]);
  const charRanged = computed(() =>

    [
      {
        name: "Eldritch Blast",
        weaponGroup: "one handed",
        weapon: false,
        attackCount: 0,
        dieCount: 3,
        dieSize: 12,
        critRange: 20,
        critMult: 2,
        damageAbility: 'charisma',
      },
    ]
  );

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
    "Cracked Pale Green Prism Ioun Stone": {
      bonusType: "competence",
      cost: 4000,
      bonus: {
        saves: 1,
      },
    },
    "Dusty Rose Prism Ioun Stone":
      {
        searchText: "Dusty Rose Prism Ioun Stone",
        bonusType: "insight",
        cost: 5000,
        bonus: {
          ac: 1,
          ffAC: 1,
          touchAC: 1,
        },
      },
    "Gloves of Dueling": {
      searchText: "Gloves Of Dueling",
    },
  });

  const charLevel = ref(16);

  const charClasses = ref([
    {
      name: "warlock",
      archetype: ["Hexblade"],
      level: charLevel.value,
      hitDie: 10,
      bab: 1,
      first: true,
      skillRanks: 1,
      classSkills: ["Acrobatics", "Athletics", "Spellcraft"],
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
        will: true,
      },
      casterLevel: charLevel.value,
      casting: 'spontaneous',
      castingStat: 'charisma',
      spells: {
        '8th': {
          slots: 1,
          prepared: [
            'Power Word Stun',
          ]
        },

        '5th': {
          slots: 2,
          prepared: [
            'Sending',
            'Teleport',
            'Overland Flight',
            'Black Tentacles'
          ],
        },
        '4th': {
          prepared: [
            'Dimension Door',
            'Phantasmal Killer',
          ],
        },
        '3rd': {
          prepared: [
            'Fireball',
            'Fly',
          ],
        },
        '2nd': {
          prepared: [
            'Mirror Image',
            'Hold Person',
          ],
        },
        '1st': {
          prepared: [
            'Cause Fear',
            'Mount',
          ],
        },
        Cantrips: {
          prepared: [
            'Mage Hand',
            'Message',
            'Magic Missile',
            'Endure Elements'
          ],
        },

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
  const resist = ref();
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
      pointBuy: 19,
    },
    dexterity: {
      pointBuy: 14,
    },
    constitution: {
      pointBuy: 18,
    },
    intelligence: {
      pointBuy: 6,
    },
    wisdom: {
      pointBuy: 5,
    },
    charisma: {
      pointBuy: 18,
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
      bonusType: "wfg",
      bonus: {
        weaponAttackRolls: 2,
      },
    },
    "Greater Weapon Focus": {
      bonusType: "wfg",
      bonus: {
        weaponAttackRolls: 2,
      },
    },
    "Weapon Specialization": {
      bonusType: "ws",
      bonus: {
        trueWeaponDamage: 2,
      },
    },
    "Greater Weapon Specialization": {
      bonusType: "gws",
      bonus: {
        trueWeaponDamage: 2,
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
    'Advanced Weapon Training x2': {
      searchText: "Advanced Weapon Training",
    },
    'Paired Opportunists': {},
    'Seize the Moment': {},
    'Combat Reflexes': {},
    'Broken Wing Gambit': {},
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
        // TODO strengthMod / 2
        meleeWeaponDamage: Math.floor(10 / 2),
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
        weaponAttackRolls: -(Math.floor(baseAtk.value / 4) + 1),
        trueWeaponDamage:
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
        trueWeaponDamage: 4,
      },
    },
    {
      name: "Eldritch Smite",
      bonusType: "eldritch",
      active: true,
      duration: 2,
      bonus: {
        // weaponAttackRolls: abilityMods.value.charisma,
        // trueWeaponDamage: abilityMods.value.charisma,

        meleeDieCount: 1,

        weaponAttackRolls: 6,
        trueWeaponDamage: 6,
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
        weaponAttackRolls: 6,
        TrueWeaponDamage: 6,
        reflex: 6,
        will: 6,
      },
    },
    abpWeapon: {
      bonusType: 'enhancement',
      bonus: {
        weaponAttackRolls: 5,
        trueWeaponDamage: 5,
      },
    },
    abpAbilityScores: {
      bonusType: 'enhancement',
      bonus: {
        strength: 6,
        dexterity: 2,
        constitution: 4,
        intelligence: 4,
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
        ac: 0,
        ffAC: 0,

      },
    },
    abpArmor: {
      bonusType: 'armorEnhancement',
      bonus: {
        ac: 4,
        ffAC: 4,
      },
    },
    levelUp: {
      bonusType: 'levelUp',
      bonus: {
        strength: 4,
      },
    },
    wish: {
      bonusType: 'inherent',
      bonus: {
        strength: 5,
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
    let tempattackCount = 1;

    tempattackCount += modifiers.value.attackCount ?? 0;

    tempattackCount += Math.floor((baseAtk.value - 1) / 5) ?? 0;

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
      name: "defender’s reflexes",
      type: "Ex",
      header: "Defender’s Reflexes (Ex)",
      description: [
        "At 2nd level, a high guardian gains Combat Reflexes as a bonus feat, and he can use his Strength modifier instead of his Dexterity modifier to determine the number of additional attacks of opportunity he can make per round. If he already has Combat Reflexes, he instead gains Stand Still as a bonus feat.",
        "This ability replaces the bonus feat gained at 2nd level.",
      ],
    },
  ]);

  const activeSpecialAbilities = reactive([
    {
      name: `Relentless Hex (${abilityMods.value.charisma}/day)`,
      searchText: 'Relentless Hex',
    },
    {
      name: `Eldritch Push/Pull (+${cmb.value + abilityMods.value.charisma})`,
      searchText: 'eldritch push/pull',
    },
    {
      name: `Armor of Agathys (25 Cold Damage)`,
      searchText: 'armor of agathys',
    },
    {
      name: `Eldritch Smite (+${abilityMods.value.charisma} Attack [1d12+${abilityMods.value.charisma}])`,
      searchText: 'eldritch smite',
    },
    {
      name: `Eldritch Spear`,
    },
    {
      name: `bond of the talisman (${abilityMods.value.charisma}/day)`,
      searchText: 'bond of the talisman'
    },
  ]);

  return {
    name,
    id,
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
    specialAbilities,
    toggle,
    modifiers,
    attackCount,
    specialAttacks,
    activeSpecialAbilities,
    feats,
  };
});
export const useFrey = defineStore("frey", {
  state: () => ({
    frey: frey.value,
  }),
});

const ainsel = computed(() => {
  const id = ref(1010);
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
  const feats = reactive({});
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

const sam = computed(() => {
  const id = ref(37);
  const name = ref("Sam");
  const solo = ref(true);
  const traits = ref([
    {
      name: "reactionary",
      bonusType: "racialTrait",
      bonus: {
        initiative: 2,
      },
    },
    {
      name: "Faith's Favored",
      bonusType: "luck",
      bonus: {
        luck: 1,
      },
    },
  ]);
  const alignment = ref('CG');

  const heritage = ref("half-orc");
  const heritageTraits = ref([
    {
      name: "Sacred Tattoo",
      bonusType: "luck",
      bonus: {
        saves: 2,
      },
    },
    {
      name: "Shaman's Apprentice",
      bonusType: "",
      bonus: {},
    },
  ]);
  const type = ref("humanoid");
  const subtype = ref(["human", "orc"]);
  const senses = ref(["Darkvision 90ft"]);
  const aura = ref("");
  const speed = ref(30);

  const size = ref("medium");
  const sizeMod = ref(sizeTable[size.value]);
  // TODO
  const space = ref(5);
  const reach = ref(5);

  const charMelee = ref([
    {
      name: "Falchion",
      weaponGroup: "one handed",
      weapon: true,
      damage: 0,
      attackCount: 0,
      dieCount: 2,
      dieSize: 4,
      critRange: 18,
      critMult: 2,
    },
  ]);
  const charRanged = computed(() =>
    [
      {
        name: "Generic Ranged Attack",
      },
    ]
  );

  const charGear = reactive({

    "Wizard's kit": {
      searchText: "Wizard's Kit",
    },
  });

  const charLevel = ref(1);

  const charClasses = ref([
    {
      name: "arcanist",
      archetype: ["blood"],
      level: charLevel.value,
      hitDie: 6,
      bab: .5,
      first: true,
      skillRanks: 2,
      classSkills: ["Appraise", "Fly", "Knowledge", "Linguistics", "Spellcraft", "Use Magic Device", "Survival"],
      favored: {
        hp: charLevel.value,
        skill: 0,
        race: {
          human: 0,
        },
      },
      saves: {
        fortitude: false,
        reflex: false,
        will: true,
      },
      casterLevel: charLevel.value,
      casting: 'spontaneous',
      castingStat: 'intelligence',
      spells: {

        '1st': {
          slots: 2,
          prepared: [
            'Mage Armor',
            'Unseen Servant',
          ],
        },
        Cantrips: {
          prepared: [
            'Mage Hand',
            'Prestidigitation',
            'Detect Magic',
            'Read Magic'
          ],
        },

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
  const resist = ref();
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
      pointBuy: 17,
    },
    dexterity: {
      pointBuy: 13,
    },
    constitution: {
      pointBuy: 3,
    },
    intelligence: {
      pointBuy: 20,
    },
    wisdom: {
      pointBuy: 6,
    },
    charisma: {
      pointBuy: 18,
    },
  });
  const feats = reactive({
    "Toughness": {
      bonusType: "toughness",
      bonus: {
        hp: Math.max(3, charLevel.value),
      },
    },
    "Endurance": {},
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
      ranks: 0,
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
      ranks: 0,
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
        ranks: level.value,
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
        ranks: 1,
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
        ranks: level.value,
        ability: "intelligence",
      },
      religion: {
        ranks: level.value,
        ability: "intelligence",
      },
    },
    linguistics: {
      ranks: 0,
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
      ranks: 0,
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
      ranks: level.value,
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
      name: "two handing",
      bonusType: "th",
      duration: 2,
      active: true,
      bonus: {
        // TODO strengthMod / 2
        meleeWeaponDamage: Math.floor(3 / 2),
      },
    },
    {
      name: "Power Attack",
      bonusType: "PA",
      active: false,
      duration: 2,
      bonus: {
        weaponAttackRolls: -(Math.floor(baseAtk.value / 4) + 1),
        trueWeaponDamage:
          (Math.floor(baseAtk.value / 4) + 1) * (3)
      },
    },
    {
      name: "Mage Armor",
      bonusType: "armor",
      active: false,
      duration: 2,
      bonus: {
        ac: 4,
        ffAC: 4
      },
    },
  ]);

  const charMods = reactive({
    Human: {
      bonusType: 'racial',
      bonus: {
        wisdom: 2,
      },
    },
    abpWeapon: {
      bonusType: 'enhancement',
      bonus: {
        weaponAttackRolls: 0,
        trueWeaponDamage: 0,
      },
    },
    abpAbilityScores: {
      bonusType: 'enhancement',
      bonus: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
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
        ac: 0,
        ffAC: 0,
        touchAC: 0,
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
        ac: 0,
        ffAC: 0,
      },
    },
    levelUp: {
      bonusType: 'levelUp',
      bonus: {
        strength: 0,
      },
    },
    wish: {
      bonusType: 'inherent',
      bonus: {
        strength: 0,
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
    let tempattackCount = 1;

    tempattackCount += modifiers.value.attackCount ?? 0;

    tempattackCount += Math.max(0,Math.floor((baseAtk.value - 1) / 5)) ?? 0;

    return tempattackCount;
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

  const activeSpecialAbilities = reactive([
    {
      name: `Arcane Reservoir (${Math.floor(charLevel.value/2) + 3}/day up to ${charLevel.value + 3}/day)`,
      searchText: 'Arcane Reservoir',
      id: 1,
      size: charLevel.value + 3,
    },
    {
      name: 'Consume Spells'
    }
  ]);

  return {
    name,
    id,
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
    // specialAbilities,
    toggle,
    modifiers,
    attackCount,
    // specialAttacks,
    activeSpecialAbilities,
    feats,
  };
});
export const useSam = defineStore("sam", {
  state: () => ({
    sam: sam.value,
  }),
});
