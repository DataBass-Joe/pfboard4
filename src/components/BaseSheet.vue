<template>
  <q-page
    class="q-gutter-lg fit row wrap justify-between items-start content-start"
    id="page"
  >
    <q-list id="stat-block">
      <div id="introduction">
        <div>
          <div
            id="name"
            class="text-capitalize"
            v-text="character.introduction.name"
          ></div>
          <div id="cr" v-text="cr"></div>
        </div>

        <div id="xp" v-text="xp"></div>

        <div>
          <span
            id="race"
            class="text-capitalize"
            v-text="character.introduction.heritage"
          />
          <span
            v-if="character.introduction.class[0].gestalt"
            v-text="' Gestalt'"
          />
          <span v-text="'&nbsp;'" />
          <span id="class" class="text-capitalize">
            {{
              formatList(character.introduction.class, [
                "archetype",
                "name",
                "level",
              ])
            }}
          </span>
        </div>

        <div>
          <span id="alignment" v-text="character.introduction.alignment" />
          <span v-text="'&nbsp;'" />
          <span id="size" class="text-capitalize">
            {{ character.introduction.size }}
          </span>
          <span v-text="'&nbsp;'" />
          <span id="type">
            {{ character.introduction.type }}
          </span>
          <span id="subtype">
            ({{ formatList(character.introduction.subtype) }})
          </span>
        </div>

        <div>
          <b>Init </b
          ><span id="initiative" v-text="formatBonus(initiative)"></span>
          <b> Senses </b>
          <span
            id="senses"
            v-text="formatList(character.introduction.senses)"
          />
          <span
            >; Perception {{ formatBonus(skills.totalSkills.perception) }}</span
          >
        </div>

        <div id="aura" v-text="character.introduction.aura"></div>
      </div>

      <q-expansion-item
        v-if="character.defense"
        id="defense"
        style="padding: 0"
        expand-separator
        default-opened
        dense
        header-class="bg-primary text-white"
        label="DEFENSE"
      >
        <q-item class="justify-between">
          <q-item-section>
            <div id="ac">
              <b>AC</b> <span> {{ ac.default }}</span>
              <span>, touch {{ ac.touch }}</span>
              <span>, flat-footed {{ ac["flat-footed"] }}</span>
              <span
                v-if="acBonuses && !acToggle"
                @click="acToggle = !acToggle"
                v-text="' (...)'"
              />
              <span
                v-if="acBonuses && acToggle"
                @click="acToggle = !acToggle"
                class="text-capitalize"
              >
                <span v-text="' ( '" />
                <span v-for="(value, name, index) in acBonuses" :key="index">
                  {{ formatBonus(value) }} {{ name }}
                  <span v-if="index != Object.keys(acBonuses).length - 1"
                    >,
                  </span>
                </span>
                <span v-text="')'" />
              </span>
            </div>
            <div id="hp">
              <b>hp </b> <span>{{ currHP }}/{{ maxHP }}</span>
            </div>
            <div id="saving throws">
              <b>Fort </b>
              <span id="fortitude" v-text="savingThrows.fortitude" />
              <b>, Ref </b> <span id="reflex" v-text="savingThrows.reflex" />
              <b>, Will </b> <span id="will" v-text="savingThrows.will" />
            </div>
            <div>
              <div
                id="defensive abilities"
                v-text="character.defensiveAbilities"
              ></div>
              <div id="dr" v-if="character.defense.dr">
                <b>DR </b>
                <span
                  v-for="(drValue, drType, index) in character.defense.dr"
                  :key="index"
                >
                  {{ drValue }}/{{ drType }}
                </span>
              </div>
              <div id="immune" v-text="character.immune"></div>
              <div id="resist" v-text="character.resist"></div>
              <div id="sr" v-text="character.sr"></div>
            </div>
            <div v-if="character.defense.weaknesses" id="weaknesses">
              <b>Weaknesses </b>
              <span class="text-capitalize">
                {{ formatArray(character.defense.weaknesses) }}
              </span>
            </div>
          </q-item-section>
          <q-item-section>
            <q-item>
              <q-item-section>
                <q-input
                  v-model.number="damageTaken"
                  type="number"
                  :max="maxHP + abilityScores.constitution"
                  filled
                  style="max-width: 200px"
                />
              </q-item-section>
              <q-item-section>
                <q-knob
                  show-value
                  :min="-abilityScores.constitution"
                  :max="Math.max(maxHP, maxHP - damageTaken)"
                  :class="`text-${myTrackColor}`"
                  v-model="currHP"
                  size="50px"
                  :color="myColor"
                  :track-color="myTrackColor"
                />
              </q-item-section>
            </q-item>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item
        v-if="character.offense"
        id="offense"
        style="padding: 0"
        expand-separator
        default-opened
        dense
        header-class="bg-primary text-white"
        label="OFFENSE"
      >
        <div id="speed" v-if="character.offense.speed !== 30">
          <b>Spd</b> <span> {{ character.offense.speed }} ft.</span>
        </div>

        <div id="melee" class="text-capitalize">
          <b>Melee </b>
          <span v-for="(option, index) in melee" :key="index">
            <span v-text="option.name" />
            <span v-text="'&nbsp;'" />
            <span v-text="formatBonus(option.attack)" />
            <span v-if="option.damage || option.dieCount">
              <span v-text="'&nbsp;'" />
              <span v-text="'('" />
              <span v-text="option.dieCount" />
              <span v-text="'d'" />
              <span v-text="option.dieSize" />
              <span v-text="formatBonus(option.damage)" />
              <span v-text="')'" />
            </span>
          </span>
        </div>

        <div
          v-if="character.offense.ranged"
          id="ranged"
          class="text-capitalize"
        >
          <b>Ranged </b>
          <span v-for="(option, index) in ranged" :key="index">
            <span v-text="option.name" />
            <span v-text="'&nbsp;'" />
            <span v-text="formatBonus(option.attack)" />
            <span v-if="option.damage || option.dieCount">
              <span v-text="'&nbsp;'" />
              <span v-text="'('" />
              <span v-text="option.dieCount" />
              <span v-text="'d'" />
              <span v-text="option.dieSize" />
              <span v-text="formatBonus(option.damage)" />
              <span v-text="')'" />
            </span>
          </span>
        </div>

        <div
          v-if="character.offense.space !== 5 || character.offense.reach !== 5"
        >
          <b>Space </b
          ><span id="space"> {{ character.offense.space }} ft.; </span>
          <b>Reach </b
          ><span id="reach"> {{ character.offense.reach }} ft.; </span>
        </div>

        <div v-if="character.offense.specialAttacks" id="specialAttacks">
          <b>Special Attacks </b>
          <span
            v-for="(attack, index) in character.offense.specialAttacks"
            :key="index"
            class="special-attacks capitalize"
          >
            {{ formatSpecial(attack)
            }}<span v-if="index !== character.offense.specialAttacks.length - 1"
              >,
            </span>
          </span>
        </div>

        <div
          id="spell-likeAbilities"
          v-text="character.offense.spellLikeAbilities"
        ></div>

        <div
          id="supernaturalAbilities"
          v-if="character.offense.supernaturalAbilities"
        >
          <b @click="SupernaturalToggle = !SupernaturalToggle">
            Supernatural Abilities
          </b>

          <span v-show="!SupernaturalToggle">...</span>

          <!--TODO-->
          <span v-show="SupernaturalToggle">
            <span
              v-for="(attack, index) in character.offense.supernaturalAbilities"
              :key="index"
              class="special-attacks capitalize"
            >
              {{ formatSpecial(attack) }}
              <span
                v-if="
                  index !== character.offense.supernaturalAbilities.length - 1
                "
                >,
              </span>
            </span>
          </span>
        </div>

        <div
          id="extraordinaryAbilities"
          v-if="character.offense.extraordinaryAbilities"
        >
          <b @click="ExtraordinaryToggle = !ExtraordinaryToggle">
            Extraordinary Abilities
          </b>

          <span v-show="!ExtraordinaryToggle">...</span>

          <!--TODO-->
          <span v-show="ExtraordinaryToggle">
            <span
              v-for="(attack, index) in character.offense
                .extraordinaryAbilities"
              :key="index"
              class="special-attacks capitalize"
            >
              {{ formatSpecial(attack)
              }}<span
                v-if="
                  index !== character.offense.extraordinaryAbilities.length - 1
                "
                >,
              </span>
            </span>
          </span>
        </div>

        <div id="spells" v-if="showSpells" class="text-capitalize">
          <div
            v-for="(caster, index) in character.introduction.class"
            :key="index"
          >
            <SpellList v-bind:caster="caster" @spell-submit="loadSpell" />
          </div>
        </div>
      </q-expansion-item>

      <q-expansion-item v-if="character.tactics" id="tactics">
        <hr />
        <span>TACTICS</span>
        <hr />
        <div id="before combat">
          Before Combat: {{ character.tactics.beforeCombat }}
        </div>
        <div id="during combat">
          During Combat: {{ character.tactics.duringCombat }}
        </div>
        <div id="morale">Morale: {{ character.tactics.morale }}</div>
      </q-expansion-item>

      <q-expansion-item
        v-if="character.statistics"
        id="statistics"
        style="padding: 0"
        expand-separator
        default-opened
        dense
        header-class="bg-primary text-white"
        label="STATISTICS"
      >
        <div id="ability scores">
          <span v-for="(score, key, index) in abilityScores" v-bind:key="index">
            <b class="text-capitalize"> {{ key.substr(0, 3) }}</b>
            {{ score }} ({{ formatBonus(abilityMods[key]) }})
            <span v-if="index !== 5">, </span>
          </span>
        </div>
        <div>
          <b>Base Atk </b><span id="base atk" v-text="formatBonus(baseAtk)" />;
          <b>CMB </b><span id="cmb" v-text="formatBonus(cmb)" />; <b>CMD </b
          ><span id="cmd" v-text="formatBonus(cmd)" />;
        </div>
        <div>
          <b @click="featToggle = !featToggle">Feats </b>
          <span
            v-if="featToggle"
            id="feats"
            class="text-capitalize"
            v-text="formatArray(character.statistics.feats)"
          />
          <span v-else>...</span>
        </div>
        <div>
          <b @click="skillToggle = !skillToggle"> Skills </b>
          <span v-if="skillToggle">
            <span class="text-capitalize">
              <span v-if="summarySkillToggle">
                <span class="text-capitalize">
                  {{ formatSkills(skills.totalSkills) }}
                </span>
              </span>
              <span v-if="!summarySkillToggle">
                <span class="text-capitalize">
                  {{ formatSkills(skills.summarySkills) }}
                </span>
              </span>
              <span>
                <i
                  v-if="!summarySkillToggle"
                  @click="summarySkillToggle = true"
                >
                  Show More Skills..</i
                >
                <i
                  v-if="summarySkillToggle"
                  @click="summarySkillToggle = false"
                >
                  Show Fewer Skills..</i
                >
              </span>
            </span>
          </span>
          <span v-if="!skillToggle">..</span>
        </div>
        <div id="languages" v-text="character.statistics.languages"></div>
        <div id="sq" v-text="character.statistics.specialQualities"></div>
      </q-expansion-item>

      <q-expansion-item
        v-if="character.specialAbilities"
        id="special abilities"
        style="padding: 0"
        expand-separator
        dense
        header-class="bg-primary text-white"
        label="SPECIAL ABILITIES"
      >
        <q-card-section>
          <q-expansion-item
            v-for="(item, index) in character.specialAbilities"
            :key="index"
            style="padding: 0"
            expand-separator
            dense
            header-class="bg-primary text-white"
            :label="item.header"
          >
            <p
              v-for="(descItem, descIndex) in item.description"
              :key="descIndex"
            >
              <span v-text="descItem" />
              <br />
              <br />
            </p>
          </q-expansion-item>
        </q-card-section>
      </q-expansion-item>

      <q-expansion-item
        v-if="character.gear.active"
        id="gear"
        style="padding: 0"
        expand-separator
        default-opened
        dense
        header-class="bg-primary text-white"
        label="GEAR"
      >
        <hr />
        <span>GEAR</span>
        <hr />
      </q-expansion-item>

      <q-expansion-item
        v-if="character.ecology"
        id="ecology"
        style="padding: 0"
        expand-separator
        default-opened
        dense
        header-class="bg-primary text-white"
        label="GEAR"
      >
      </q-expansion-item>

      <q-expansion-item
        v-if="character.miscellaneous"
        id="miscellaneous"
        style="padding: 0"
        expand-separator
        default-opened
        dense
        header-class="bg-primary text-white"
        label="GEAR"
      >
      </q-expansion-item>
    </q-list>
    <div id="info">
      <!--      <div v-if="abilityName" class="info">-->

      <!--        <Info-->
      <!--          v-bind:table="'ability'"-->
      <!--          v-bind:name="abilityName"-->
      <!--          @closeInfo="changeInfo"-->
      <!--        />-->

      <!--      </div>-->
      <div class="q-pa-md" style="">
        <q-btn
          v-morph:btn:mygroup:500.tween="morphGroupModel"
          class="q-ma-md"
          fab
          color="primary"
          size="lg"
          icon="add"
          @click="nextMorph"
        />

        <q-card
          v-morph:card1:mygroup:500.tween="morphGroupModel"
          class="q-ma-md bg-primary text-white"
          style="width: 300px; border-top-left-radius: 2em"
        >
          <q-card-actions align="left">
            <q-btn flat label="Close" @click="nextMorph" />
          </q-card-actions>
          <q-card-section class="text-h6">
            <q-list class="column" id="buttons">
              <q-item-section
                v-for="(bonus, index) in toggle"
                :key="index"
                class="toggle capitalize"
                v-bind:style="{ 'background-color': bgColor(bonus.duration) }"
              >
                <q-toggle
                  v-model="bonus.active"
                  :label="bonus.name"
                  left-label
                />
              </q-item-section>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <q-card v-if="spellRef" style="background: rgba(0, 0, 0, 50%)">
        <q-card-section class="text-h4">{{ spellRef.name }}</q-card-section>
        <Spell :spell="spellRef" />
      </q-card>
    </div>
    <!--        <q-table-->
    <!--          title="Modifiers"-->
    <!--          :rows="modifierSource.value"-->
    <!--          row-key="name"-->
    <!--        />-->
  </q-page>
</template>

<script setup>
import { computed, ref, reactive, defineProps } from "vue";
import SpellList from "src/components/SpellList.vue";
import Spell from "src/components/Spell.vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

const $q = useQuasar();
const props = defineProps({
  character: Object,
});

const nextMorphStep = {
  btn: "card1",
  card1: "btn",
};

const morphGroupModel = ref("btn");

function nextMorph() {
  morphGroupModel.value = nextMorphStep[morphGroupModel.value];
}

const toggle = reactive(props.character.toggle ?? {});

const summarySkillToggle = ref(false);
const skillToggle = ref(true);
const featToggle = ref(false);
const acToggle = ref(false);
// const specialAbilitiesToggle = ref(true);
const ExtraordinaryToggle = ref(true);
const SupernaturalToggle = ref(true);
// const specialQualitiesToggle = ref(false);
// const defensiveAbilitiesToggle = ref(true);
// const abilityName = ref('');

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
  modifierLoop(props.character.gear);
  modifierLoop(props.character.statistics.feats);
  modifierLoop(props.character.introduction.traits);
  modifierLoop(props.character.introduction.heritageTraits);

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

// const modifierSource = computed(() => {
//   const modifiersHolder = reactive({});
//   const modifierRows = ref([]);
//   // const modifierColumns = ref([]);
//
//   function modifierLoop(myObj) {
//     // const myObjKeys = ref(Object.keys(myObj));
//     modifierRows.value.push(...myObj);
//     myObj.forEach((button) => {
//       if (typeof button.bonus !== 'undefined' && button.active !== false) {
//         const bonusKeys = ref(Object.keys(button.bonus));
//         bonusKeys.value.forEach((key) => {
//           modifiersHolder[key] = modifiersHolder[key] ?? {};
//           modifiersHolder[key][button.bonusType] = modifiersHolder[key][
//             button.bonusType] ?? [];
//           modifiersHolder[key][button.bonusType].push(button.bonus[key]);
//         });
//       }
//     });
//   }
//
//   modifierLoop(toggle);
//   modifierLoop(props.character.gear);
//   modifierLoop(props.character.statistics.feats);
//   modifierLoop(props.character.introduction.traits);
//   modifierLoop(props.character.introduction.heritageTraits);
//
//   return modifierRows;
// });

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
  modifierLoop(props.character.gear);
  modifierLoop(props.character.statistics.feats);
  modifierLoop(props.character.introduction.traits);
  modifierLoop(props.character.introduction.heritageTraits);

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

function formatBonus(bonus) {
  let text;
  if (bonus < 0) {
    text = bonus;
  } else {
    text = `+${bonus}`;
  }
  return text;
}

const showSpells = computed(() => true);

const sizeModifier = computed(() => {
  let tempSize = props.character.introduction.sizeMod;

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

  const objectHusk = reactive(props.character.statistics.abilityScore);

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

const baseAtk = computed(() => {
  let bab = 0;

  let maxBAB = 0;

  const CharClasses = ref(props.character.introduction.class);

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

const cmb = computed(() => {
  let tempCMB = abilityMods.value.strength + baseAtk.value + sizeModifier.value;

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
// eslint-disable-next-line max-len
const level = computed(() =>
  props.character.introduction.class.reduce(
    (accumulator, cur) =>
      cur.gestalt ?? false
        ? Math.max(accumulator, cur.level)
        : accumulator + cur.level,
    0
  )
);

const skills = computed(() => {
  const skillRanks = props.character.statistics.skills;

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

  const classSkills = ref(props.character.introduction.class[0].classSkills);

  const { knowledge } = props.character.statistics.skills;

  const knowledgeKeys = Object.keys(knowledge);

  const keys = Object.keys(totalSkills);

  const summarySkills = {};

  keys.forEach((skillKey) => {
    classSkills.value.forEach((classSkill) => {
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
        totalSkills.knowledge[knowledgeSkillKey] += modifiers.value.skills ?? 0;

        if (
          props.character.specialAbilities.abilities?.includes(
            "Bardic Knowledge"
          )
        ) {
          totalSkills.knowledge[knowledgeSkillKey] += level.value;
        }
        if (
          skillRanks.knowledge[knowledgeSkillKey].ranks >= 1 ||
          props.character.specialAbilities.abilities?.includes(
            "Bardic Knowledge"
          )
        ) {
          if (!summarySkills.knowledge) summarySkills.knowledge = {};
          summarySkills.knowledge[knowledgeSkillKey] =
            totalSkills.knowledge[knowledgeSkillKey];
        }
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

const cr = ref("");
const xp = ref(null);

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

  const CharClasses = props.character.introduction.class;

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

  if (props.character.introduction.solo) {
    hitPoints = maxHitDie * level.value;
  }

  hitPoints += level.value * abilityMods.value.constitution;

  return hitPoints;
});
// const inputDamage = ref(0);

const damageTaken = ref(0);

const currHP = computed({
  get: () => maxHP.value - damageTaken.value,
  set: (value) => {
    damageTaken.value = maxHP.value - value;
  },
});

const savingThrows = computed(() => {
  const totalSaves = {
    fortitude: 0,
    reflex: 0,
    will: 0,
  };

  let allBonus = 0;

  allBonus += modifiers.value.saves ?? 0;

  const saveKeys = Object.keys(props.character.defense.saveAbilityScore);

  const charClasses = ref(props.character.introduction.class);

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
    totalSaves[save] +=
      abilityMods.value[props.character.defense.saveAbilityScore[save]];
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

  // let tempDexDamage = Math.floor(abilityMods.value.dexterity);

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
  // tempDexDamage += modifiers.value.weaponDamage ?? 0;

  tempMeleeAttack.value += modifiers.value.attackRolls ?? 0;

  const mOptions = ref([]);

  props.character.offense.melee.forEach((meleeOption) => {
    const option = ref({});
    Object.keys(meleeOption).forEach((meleeAttr) => {
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

  props.character.offense.ranged.forEach((rangedOption) => {
    const option = ref({});
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

// const specialAttacks = computed(() => ({
//   maxReservoir: Math.floor(character.introduction.class[0].level / 2) + 3,
//   currResevoir: Math.floor(character.introduction.class[0].level / 2) + 3,
// }));

// TACTICS

function formatList(myObj, myKeys) {
  let list = "";

  let keys;

  if (arguments.length === 2) {
    keys = myKeys;
  } else {
    keys = Object.keys(myObj);
  }

  if (Array.isArray(myObj)) {
    const arrSize = myObj.length;
    for (let index = 0; index < arrSize; index += 1) {
      if (typeof myObj[index] !== "undefined") {
        if (typeof myObj[index] === "object" && myObj[index] !== null) {
          list += formatList(myObj[index], keys);

          if (index !== arrSize - 1) {
            list += ", ";
          }
        } else {
          list += myObj[index];

          if (index !== arrSize - 1) {
            list += " ";
          }
        }
      }
    }
  } else {
    const size = keys.length;

    for (let index = 0; index < size; index += 1) {
      if (typeof myObj[keys[index]] !== "undefined") {
        if (typeof myObj[keys[index]] === "object") {
          list += formatList(myObj[keys[index]]);
          if (index !== size - 1) list += " ";
        } else {
          list += myObj[keys[index]];
        }
        if (index !== size - 1) list += " ";
      }
    }
  }
  return list;
}

function formatSpecial(myObj, myKeys) {
  let list = "";

  let keys;

  if (arguments.length === 2) {
    keys = myKeys;
  } else {
    keys = Object.keys(myObj);
  }

  let i = 0;

  if (Array.isArray(myObj)) {
    const arrSize = keys.length;

    for (let index = 0; index < arrSize; index += 1) {
      if (typeof myObj[index] !== "undefined") {
        if (typeof myObj[index] === "object" && myObj[index] !== null) {
          list += formatSpecial(myObj[index], keys);
          if (index !== arrSize - 1) {
            list += ", ";
          }
        } else {
          list += myObj[index];

          if (index !== arrSize - 1) {
            list += ", ";
          }
        }
      }
    }
  } else {
    const size = keys.length;

    for (let index = 0; index < size; index += 1) {
      if (i !== 0) {
        list += " (";
      }
      i = 1;

      if (typeof myObj[keys[index]] !== "undefined") {
        if (
          typeof myObj[keys[index]] === "object" &&
          myObj[keys[index]][1] !== null
        ) {
          list += formatSpecial(myObj[keys[index]]);

          if (index !== size - 1) list += ", ";
        } else {
          list += myObj[keys[index]];
        }
        if (index === size - 1) {
          if (typeof myObj.usesPerDay !== "undefined") {
            list += "/day";
          }

          list += ")";
        }

        if (index !== size - 1) list += "";
      } else {
        list += "undefined?";
      }
    }
  }
  return list;
}

function formatSkills(myObj) {
  let list = "";

  const keys = Object.keys(myObj);

  const arrSize = keys.length;

  // let comparer = 0;

  for (let index = 0; index < arrSize; index += 1) {
    if (keys[index] === "knowledge") {
      list += `${keys[index]} (${formatSkills(myObj[keys[index]])})`;
      // comparer += 1;
    } else if (
      myObj.name === "knowledge" &&
      myObj[keys[index]] !== myObj[keys[0]]
    ) {
      // comparer += 1;
    } else {
      list += `${keys[index]} `;
      list += formatBonus(myObj[keys[index]]);
    }
    if (index !== arrSize - 1) list += ", ";
  }

  return list;
}

function formatArray(myArray) {
  let list = "";

  myArray.forEach((item, idx) => {
    list += item;
    if (idx !== myArray.length - 1) list += ", ";
  });

  return list;
}

// function closeInfo() {
//   spellName = '';
// }

const spellRef = ref(null);

function loadSpell(value) {
  api
    .get(`/spell?name=ilike.${value}`)
    .then((response) => {
      [spellRef.value] = response.data;
    })
    .catch(() => {
      $q.notify({
        color: "negative",
        position: "top",
        message: "Loading failed",
        icon: "report_problem",
      });
    });
}

//
// function changeInfo(value) {
//   abilityName.value = value;
// }

function bgColor(duration) {
  let color;

  if (duration === 0) {
    color = "rgba(0,0,0,.25)";
  }
  if (duration === 1) {
    color = "rgba(255,0,0,.25)";
  }
  if (duration === 2) {
    color = "rgba(0,0,255,.25)";
  }

  return color;
}

const myColor = computed(() => (currHP.value >= 0 ? "blue" : "red"));
const myTrackColor = computed(() => `${myColor.value}-3`);
</script>

<style scoped lang="scss">
#page {
  //display: flex;
  //flex-direction: row;
  text-shadow: 2px 2px 4px #000000;
  color: white;
  text-align: left;
  align-items: baseline;
  padding: 1vmin;

  background-size: 100vmax;
  background-position: 50% 50%;
  background-attachment: fixed;
  justify-content: space-between;
}

#name {
  font-size: 5vmin;
}

hr {
  width: 100%;
}

p {
  margin: 0.5vmin;
}

.capitalize {
  text-transform: capitalize;
}

#stat-block {
  padding: 1vmin;

  display: flex;
  flex-direction: column;
  min-width: 50vw;
  background: rgba(0, 0, 0, 0.5);
}

#info {
  display: flex;
  flex-direction: column;
  min-width: 30vw;
}

#buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.toggle {
  display: flex;
  background-color: rgba(0, 0, 0, 0.25);

  margin: 1vmin;
  padding: 1vmin;
  align-items: center;
}

.toggle {
  font-size: unset;
}

@media only screen and (max-width: 1100px) {
  /* For mobile phones: */
  [id*="page"] {
    flex-wrap: wrap;
  }

  [id*="sheet"] {
    width: 100%;
  }

  [id*="info"] {
    width: 100%;
  }
}

span {
  width: clamp(16px, 100%, 50vmin);
}

/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
