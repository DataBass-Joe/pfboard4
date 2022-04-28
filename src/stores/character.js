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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

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
  const senses = ref(["arcane sight", "darkvision 60 ft.", "see invisibility"]);
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
        spellPenetrationCasterLevel: 3,
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
  });

  const charLevel = ref(14);

  const charClass = ref([
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
          prepared: ["???"],
        },
        "6th": {
          slots: 5,
          prepared: ["wither limb", "fey form II", "???"],
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
    charClass.value.reduce(
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

    const CharClasses = ref(charClass.value);

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

  charClass.value.forEach((charClass) => {
    charClass.spellPenetrationCasterLevel = charClass.level + modifiers.value.spellPenetrationCasterLevel ?? 0;
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

    const tempClassSkills = ref(charClass.value[0].classSkills);

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

    const CharClasses = charClass.value;

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
      } else {
        maxHitDie = Math.max(charClass.hitDie, maxHitDie);
      }
    });

    if (solo.value) {
      hitPoints = maxHitDie * level.value;
    }

    hitPoints += level.value * abilityMods.value.constitution;

    hitPoints += modifiers.value.hp ?? 0;

    return hitPoints;
  });

  const tempHP = computed(() => {
    return Math.floor((getRandomInt(1,10) + getRandomInt(1,10) + level.value) * 1.5);
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

    const charClasses = ref(charClass.value);

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
      name: "Luck of Heroes",
      type: "",
      header: "Luck of Heroes",
      description: [
        "Whenever you spend a hero point to reroll a die roll or to grant yourself a bonus before a die roll is made, there is a chance that the hero point is not spent. Whenever you spend a hero point, roll a d20. If the result is greater than 15, the hero point is not spent. You cannot use this Feat when you use the cheat death Hero Point option.",
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
      name: "Defensive Roll",
      type: "Ex",
      header: "Defensive Roll (Ex)",
      description: [
        "With this advanced talent, the rogue can roll with a potentially lethal blow to take less damage from it than she otherwise would.",
        "Once per day, when she would be reduced to 0 or fewer hit points by damage in combat (from a weapon or other blow, not a spell or special ability), the rogue can attempt to roll with the damage. To use this ability, the rogue must attempt a Reflex saving throw (DC = damage dealt). If the save succeeds, she takes only half damage from the blow; if it fails, she takes full damage.",
        "She must be aware of the attack and able to react to it in order to execute her defensive roll—if she is denied her Dexterity bonus to AC, she can’t use this ability. Since this effect would not normally allow a character to make a Reflex save for half damage, the rogue’s evasion ability does not apply to the defensive roll.",
      ],
    },
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
    charClass,
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
    tempHP,
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
