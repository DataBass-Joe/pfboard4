import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";

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
        casterLevel:1,
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

    const CharClasseses = ref(charClasses.value);

    CharClasseses.value.forEach((charClasses) => {
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

    const { knowledge } = skillPoints;

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

    const CharClasseses = charClasses.value;

    CharClasseses.forEach((charClasses) => {
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

    const charClasseses = ref(charClasses.value);

    const maxCharSaves = {
      fortitude: false,
      reflex: false,
      will: false,
    };

    saveKeys.forEach((save) => {
      charClasseses.value.forEach((charClasses) => {
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
