<template>
  <q-page
    class="q-gutter-lg row wrap justify-between items-start content-start"
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
          <div id="cr" v-text="character.cr.value"></div>
        </div>

        <div id="xp" v-text="character.xp.value"></div>

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
          ><span
            id="initiative"
            v-text="formatBonus(character.initiative.value)"
          ></span>
          <b> Senses </b>
          <i id="senses" v-text="formatList(character.introduction.senses)" />
          <span
            >; Perception
            {{
              formatBonus(character.skills.value.totalSkills.perception)
            }}</span
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
        <div class="">
          <q-item-section class="">
            <div id="ac">
              <b>AC</b> <span> {{ character.ac.value.default }}</span>
              <span>, touch {{ character.ac.value.touch }}</span>
              <span>, flat-footed {{ character.ac.value["flat-footed"] }}</span>
              <span
                v-if="character.acBonuses.value && !acToggle"
                @click="acToggle = !acToggle"
                v-text="' (...)'"
              />
              <span
                v-if="character.acBonuses.value && acToggle"
                @click="acToggle = !acToggle"
                class="text-capitalize"
              >
                <span v-text="' ( '" />
                <span
                  v-for="(value, name, index) in character.acBonuses.value"
                  :key="index"
                >
                  {{ formatBonus(value) }} {{ name }}
                  <span
                    v-if="
                      index !==
                      Object.keys(character.acBonuses.value).length - 1
                    "
                    >,
                  </span>
                </span>
                <span v-text="')'" />
              </span>
            </div>
            <div id="hp">
              <b>HP </b> <span>{{ currHP }}/{{ character.maxHP.value }}</span>
            </div>
            <div id="saving throws">
              <b>Fort </b>
              <span
                id="fortitude"
                v-text="character.savingThrows.value.fortitude"
              />
              <b>, Ref </b>
              <span id="reflex" v-text="character.savingThrows.value.reflex" />
              <b>, Will </b>
              <span id="will" v-text="character.savingThrows.value.will" />
            </div>
            <div>
              <div
                id="defensive abilities"
                v-text="character.defense.defensiveAbilities"
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
            <div v-if="character.defense.weaknesses.value" id="weaknesses">
              <b>Weaknesses </b>
              <span class="text-capitalize">
                {{ formatArray(character.defense.weaknesses.value) }}
              </span>
            </div>
          </q-item-section>
        </div>
        <div>
          <q-item-section class="health col-shrink justify-around rounded-borders">
            <div class="q-gutter row no-wrap justify-around items-center">
              <q-btn
                @click="damageTaken = 0"
                label="Full Heal"
                size="sm"/>
              <q-btn
                outline
                round
                @click="tempDamageTaken -= 10"
                label="-10"
                size="sm"/>
              <q-btn
                outline
                round
                @click="tempDamageTaken -= 1"
                label="-"
                size="xs"/>
              <q-form @submit="damageTaken -= tempDamageTaken; tempDamageTaken = 0">
                <q-input class="health-input"
                         type="number"
                         v-model="tempDamageTaken"
                />
              </q-form>
              <q-btn
                @click="damageTaken -= tempDamageTaken; tempDamageTaken = 0"
                :label="`Submit`"
                size="sm"/>
              <q-btn
                outline
                round
                @click="tempDamageTaken += 1"
                label="+"
                size="xs"/>
              <q-btn
                outline
                round
                @click="tempDamageTaken += 10"
                label="+10"
                size="sm"/>
            </div>
          </q-item-section>
        </div>
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
          <span v-for="(option, index) in character.melee.value" :key="index">
            <span v-text="option.name" />
            <span v-text="'&nbsp;'" />
            <span v-if="option.attackCount > -1 ?? false">
              <span
                v-for="n in option.attackCount + character.attackCount.value"
                :key="n"
              >
                <span
                  v-text="formatBonus(option.attack + option.attackPenalty)"
                />
                <span
                  v-if="n !== option.attackCount + character.attackCount.value"
                  >/</span
                >
              </span>
            </span>
            <span v-else v-text="formatBonus(option.attack)" />
            <span v-if="option.damage || option.dieCount">
              <span v-text="'&nbsp;'" />
              <span v-text="'('" />
              <span v-text="option.dieCount" />
              <span v-text="'d'" />
              <span v-text="option.dieSize" />
              <span v-text="formatBonus(option.damage)" />
              <span
                v-if="option.critRange !== 20"
                v-text="`/${option.critRange}–20`"
              />
              <span v-text="')'" />
            </span>
          </span>
        </div>
        <div
          v-if="character.offense.ranged[0]"
          id="ranged"
          class="text-capitalize"
        >
          <b>Ranged </b>
          <span v-for="(option, index) in character.ranged.value" :key="index">
            <span v-text="option.name" />
            <span v-text="'&nbsp;'" />
            <span v-if="option.attackCount > -1 ?? false">
              <span
                v-for="n in option.attackCount + character.attackCount.value"
                :key="n"
              >
                <span
                  v-text="formatBonus(option.attack + option.attackPenalty)"
                />
                <span
                  v-if="n !== option.attackCount + character.attackCount.value"
                >/</span
                >
              </span>
            </span>
            <span v-else v-text="formatBonus(option.attack)" />
            <span v-if="option.dieCount">
              <span v-text="'&nbsp;'" />
              <span v-text="'('" />
              <span v-text="option.dieCount" />
              <span v-text="'d'" />
              <span v-text="option.dieSize" />
              <span v-text="formatBonus(option.damage)" />
              <span
                v-if="option.critRange !== 20"
                v-text="`/${option.critRange}–20`"
              />
              <span v-text="')'" />
            </span>
            <span v-if="index !== character.ranged.value.length - 1">, </span>
          </span>
        </div>

        <div
          v-if="character.specialAttacks"
          id="specialAttacks"
          class="text-capitalize"
        >
          <b>Special Attacks </b>
          <span
            v-for="(attack, index) in character.specialAttacks"
            :key="index"
            class="special-attacks capitalize"
          >
            {{ formatSpecial(attack) }}
            <span v-if="index !== character.specialAttacks.length - 1">, </span>
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

        <div id="spells" v-if="showSpells" class="text-capitalize">
          <div
            v-for="(caster, index) in character.introduction.class"
            :key="index"
          >
            <SpellList
              v-bind:caster="caster"
              v-bind:castingMod="
                character.abilityMods.value[caster.castingStat]
              "
              @spell-submit="loadSpell"
            />
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
          <span
            v-for="(score, key, index) in character.abilityScores.value"
            v-bind:key="index"
          >
            <b class="text-capitalize"> {{ key.substring(0, 3) }}</b>
            {{ score }} ({{ formatBonus(character.abilityMods.value[key]) }})
            <span v-if="index !== 5">, </span>
          </span>
        </div>
        <div>
          <b>Base Atk </b
          ><span id="base atk" v-text="formatBonus(character.baseAtk.value)" />;
          <b>CMB </b
          ><span id="cmb" v-text="formatBonus(character.cmb.value)" />;
          <b>CMD </b
          ><span id="cmd" v-text="formatBonus(character.cmd.value)" />;
        </div>
        <div>
          <b @click="skillToggle = !skillToggle"> Skills </b>
          <span v-if="skillToggle">
            <span class="text-capitalize">
              <span>
                <span class="text-capitalize">
                  {{ formatSkills(character.skills.value.totalSkills) }}
                </span>
              </span>
              <span> </span>
            </span>
          </span>
          <span v-if="!skillToggle">..</span>
        </div>
        <div id="languages" v-text="character.statistics.languages"></div>
        <div id="sq" v-text="character.statistics.specialQualities"></div>
      </q-expansion-item>

      <q-expansion-item
        id="toggle"
        style="padding: 0"
        expand-separator
        dense
        header-class="bg-primary text-white"
        label="TOGGLE"
      >
        <q-card-section class="text-h6">
          <q-list class="column" id="buttons">
            <q-item-section
              v-for="bonus in toggle"
              :key="bonus.name"
              class="toggle capitalize"
              v-bind:style="{ 'background-color': bgColor(bonus.duration) }"
            >
              <q-toggle v-model="bonus.active" :label="bonus.name" left-label />
            </q-item-section>
          </q-list>
        </q-card-section>
      </q-expansion-item>

      <q-expansion-item
        v-if="character.featDescriptions.value"
        id="feat descriptions"
        style="padding: 0"
        expand-separator
        dense
        header-class="bg-primary text-white"
        label="FEATS"
      >
        <q-card-section>
          <q-expansion-item
            v-for="(item, index) in character.featDescriptions.value"
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
        v-if="character.specialAbilities.value"
        id="special abilities"
        style="padding: 0"
        expand-separator
        dense
        header-class="bg-primary text-white"
        label="SPECIAL ABILITIES"
      >
        <q-card-section>
          <q-expansion-item
            v-for="(item, index) in character.specialAbilities.value"
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
      <q-card v-if="spellRef" style="background: rgba(0, 0, 0, 50%)">
        <q-card-section class="text-h4">{{ spellRef.name }}</q-card-section>
        <Spell :spell="spellRef" />
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, defineProps, reactive } from "vue";
import SpellList from "src/components/SpellList.vue";
import Spell from "src/components/Spell.vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

const $q = useQuasar();
const props = defineProps({
  character: Object,
});

const toggle = reactive(props.character.toggle ?? {});

const skillToggle = ref(true);
const acToggle = ref(false);

const damageTaken = ref(0);
const tempDamageTaken = ref(0);

const currHP = computed({
  get: () => props.character.maxHP.value - damageTaken.value,
  set: (value) => {
    damageTaken.value = props.character.maxHP.value - value;
  },
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

// const myColor = computed(() => (currHP.value >= 0 ? 'blue' : 'red'));
// const myTrackColor = computed(() => `${myColor.value}-3`);
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

.no-shadow {
  text-shadow: none;
  font-weight: bold;
}

.health {
  background-color: rgba(125, 125, 255, 0.5);
  text-align:center;
}

.plus, .minus {
  align-items: center;
  border-radius: 50%;
  padding: 0.25em 0.8em;
}

.health-input {
  color: white;
  max-width: 7.5vw;
  background-color: rgba(255, 255, 255, 0.50);
  max-height: 7.5vm;
  margin: 1em 0;
}
</style>
