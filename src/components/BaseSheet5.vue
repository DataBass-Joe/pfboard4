<template>
  <q-page class="
  q-gutter-lg
  row
  wrap
  justify-between
  items-start
  content-start" id="page">


    <q-list id="stat-block">

      <div id="introduction">

        <div>
          <div id="name" class="text-capitalize" v-text="character.name"></div>
          <div id="cr" v-text="character.cr"></div>
        </div>

        <div id="xp" v-text="character.xp"></div>

        <div>
          <span id="race" class="text-capitalize" v-text="character.heritage"/>
          <span v-if="character.charClasses[0].gestalt" v-text="' Gestalt'"/>
          <span v-text="'&nbsp;'"/>
          <span id="class" class="text-capitalize">
            {{
              formatList(character.charClasses
                , ['archetype', 'name', 'level'])
            }}
          </span>
        </div>

        <div>
          <span id="alignment" v-text="character.alignment"/>
          <span v-text="'&nbsp;'"/>
          <span id="size" class="text-capitalize">
            {{ character.size }}
          </span>
          <span v-text="'&nbsp;'"/>
          <span id="type">
           {{ character.type }}
          </span>
          <span id="subtype">
            ({{ formatList(character.subtype) }})
          </span>

        </div>

        <div>
          <b>Init </b><span id="initiative" v-text="formatBonus(character.initiative)"></span>
          <b> Senses </b>
          <i id="senses" class="text-capitalize" v-text="formatList(character.senses)"/>
          <span>; Perception {{ formatBonus(character.skills.totalSkills.perception) }}</span>

        </div>

        <div id="aura" v-text="character.aura"></div>

      </div>

      <q-expansion-item id="defense"
                        style="padding: 0"
                        expand-separator
                        default-opened
                        dense
                        header-class="bg-primary text-white"
                        label="DEFENSE">
        <div class="col">
          <q-item-section class="col-shrink">
            <div id="ac">
              <b>AC</b> <span> {{ character.ac.default }}</span>
              <span>, touch {{ character.ac.touch }}</span>
              <span>, flat-footed {{ character.ac['flat-footed'] }}</span>
              <span v-if="character.acBonuses && !acToggle"
                    @click="acToggle = !acToggle" v-text="' (...)'"/>
              <span v-if="character.acBonuses && acToggle" @click="acToggle = !acToggle"
                    class="text-capitalize">
              <span v-text="' ( '"/>
              <span v-for="(value, name, index) in character.acBonuses" :key="index">
                {{ formatBonus(value) }} {{ name }}
                <span v-if="index !== Object.keys(character.acBonuses).length - 1">, </span>
              </span>
              <span v-text="')'"/>
                </span>
            </div>
            <div id="hp">
              <b>HP </b> <span>{{ currHP }}/{{ character.maxHP }}</span>
            </div>
            <div id="saving throws">
              <b>Fort </b> <span id="fortitude" v-text="character.savingThrows.fortitude"/>
              <b>, Ref </b> <span id="reflex" v-text="character.savingThrows.reflex"/>
              <b>, Will </b> <span id="will" v-text="character.savingThrows.will"/>
              <span v-if="character.willSpecial" id="willsp"> [{{character.willSpecial}}] </span>
            </div>
            <div>

              <div v-if="character.defensiveAbilities" id="defensiveAbilities">
                <b>Defensive Abilities </b>
                <span class="text-capitalize">
          {{ formatArray(character.defensiveAbilities) }}
                   (Stealth {{ formatBonus(character.skills.totalSkills.stealth + 20) }})
                            </span>
              </div>
              <div id="dr" v-if="character.dr">
                <b>DR </b>
                <span v-for="(drValue, drType, index) in character.dr" :key="index">
              {{ drValue }}/{{ drType }}
            </span>
              </div>
              <div v-if="character.immune" id="sr"><b>Immune</b> {{ character.immune }}</div>
              <div id="resist" v-text="character.resist"></div>
              <div v-if="character.sr > 0" id="sr"><b>SR</b> {{ character.sr }}</div>

            </div>
            <div v-if="character.weaknesses" id="weaknesses">
              <b>Weaknesses </b>
              <span class="text-capitalize">
          {{ formatArray(character.weaknesses) }}
          </span>
            </div>
          </q-item-section>
        </div>
        <div>
          <q-item-section class="health col-shrink justify-around rounded-borders">
<!--            <q-btn-->
<!--              @click="healSpell()"-->
<!--              label="Heal"-->
<!--              size="sm"/>-->
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

      <q-expansion-item id="offense"
                        style="padding: 0"
                        expand-separator
                        default-opened
                        dense
                        header-class="bg-primary text-white"
                        label="OFFENSE">

        <div id="speed" v-if="character.speed !== 30">
          <b>Spd</b> <span> {{ character.speed }} ft.</span>
        </div>

        <div id="melee">
          <b>Melee </b>
          <div v-for="(option, index) in character.melee" :key="index">
            <span class="text-capitalize" v-text="option.name"/>
            <span v-text="'&nbsp;'"/>

            <span v-if="option.attackCount >= 0 ?? false">
              <span
                v-for="n in option.attackCount + character.attackCount"
                :key="n"
              >
                <span
                  v-text="formatBonus(option.attack + (option.attackPenalty ?? 0)
                  + (Math.max(0,( n - option.attackCount - character.attackCount + 2)) * -5)
                  )"
                />
                <span v-if="option.iterativeAttackCount > 0 && (n - option.attackCount - character.attackCount + 2) === 1"
                      v-text="'/' + formatBonus(option.attack + (option.attackPenalty ?? 0)
                  + (Math.max(0,( n - option.attackCount - character.attackCount + 2)) * -5)
                  )"/>
                <span
                  v-if="n !== option.attackCount + character.attackCount"
                >/</span
                >
              </span>
            </span>

            <span v-else v-text="formatBonus(option.attack)"/>
            <span v-if="option.damage || option.dieCount">
              <span v-text="'&nbsp;'"/>
              <span v-text="'('"/>
              <span v-text="option.dieCount"/>
              <span v-text="'d'"/>
              <span v-text="option.dieSize"/>
              <span v-text="formatBonus(option.damage)"/>
              <span v-if="option.special" v-text="`+${option.special}`"/>
              <span v-if="option.critRange !== 20" v-text="`/${option.critRange}–20`"/>
              <span v-if="option.critMult && option.critMult !== 2" v-text="`/x${option.critMult}`"/>
              <span v-text="')'"/>

              <span v-if="option.critMax"
                    v-text="` (+${option.critMult * ((option.dieCount * option.dieSize) + option.damage)} Max Crit)`"/>
            </span>
                        <span v-if="index !== character.ranged.length - 1">, </span>

          </div>
        </div>
        <div v-if="character.ranged[0]" id="ranged">
          <b>Ranged </b>
          <div v-for="(option, index) in character.ranged" :key="index">
            <span class="text-capitalize" v-text="option.name"/>
            <span v-text="'&nbsp;'"/>
            <span v-if="(option.attackCount > -1 ?? false)">
              <span
                v-for="n in option.attackCount + character.attackCount"
                :key="n"
              >
                <span
                  v-text="formatBonus(option.attack + (option.attackPenalty ?? 0)
                  + (Math.max(0,( n - option.attackCount - character.attackCount + 2)) * -5)
                  )"
                />
                <span v-if="option.iterativeAttackCount > 0
                && (n - option.attackCount - character.attackCount + 2) === 1"
                      v-text="'/' + formatBonus(option.attack + (option.attackPenalty ?? 0)
                  + (Math.max(0,( n - option.attackCount - character.attackCount + 2)) * -5)
                  )"/>
                <span
                  v-if="n !== option.attackCount + character.attackCount"
                >/</span
                >
              </span>
            </span>

            <span v-else v-text="formatBonus(option.attack)"/>
            <span v-if="option.dieCount">
              <span v-text="'&nbsp;'"/>
              <span v-text="'('"/>
              <span v-text="option.dieCount"/>
              <span v-text="'d'"/>
              <span v-text="option.dieSize"/>
              <span v-text="formatBonus(option.damage)"/>
              <span v-if="option.critRange !== 20" v-text="`/${option.critRange}–20`"/>
              <span v-if="option.critMult && option.critMult !== 2" v-text="`/x${option.critMult}`"/>
              <span v-text="')'"/>
              <span v-if="option.critMax"
                    v-text="` (+${option.critMult * ((option.dieCount * option.dieSize) + option.damage)} Max Crit)`"/>
            </span>
            <span v-if="index !== character.ranged.length - 1">, </span>
          </div>
        </div>

        <div v-if="character.specialAttacks" id="specialAttacks" class="text-capitalize">
          <b>Special Attacks </b>
          <div v-for="(attack, index) in character.specialAttacks" :key="index"
                class="special-attacks capitalize">
         {{ formatSpecial(attack) }}
            <span v-if="index !== character.specialAttacks.length - 1">, </span>
          </div>
        </div>
        <div v-if="character.activeSpecialAbilities" id="activeSpecialAbilities" class="text-capitalize">
          <b>Special Attacks </b>
          <div v-for="(attack, index) in character.activeSpecialAbilities" :key="index"
               class="special-attacks capitalize">
            {{ formatSpecial(attack) }}
            <span v-if="index !== character.activeSpecialAbilities.length - 1">, </span>
          </div>
        </div>

        <div v-if="character.space !== 5 || character.reach !== 5">
          <b>Space </b><span id="space"> {{ character.space }} ft.; </span>
          <b>Reach </b><span id="reach"> {{ character.reach }} ft.; </span>
        </div>

        <span v-if="character.mythicFlag">
          <input type="checkbox" v-for="index in
              Array(character.mythicPower)"
                 v-bind:key="index"/>
        </span>

        <div id="spells" v-if="showSpells" class="text-capitalize">
          <div v-for="(caster, index)
          in (character.charClasses)"
               :key="index">
            <SpellList v-bind:caster="caster"
                       v-bind:castingMod="character.abilityMods[caster.castingStat]"
                       @spell-submit="loadSpell"/>
          </div>

        </div>

      </q-expansion-item>

      <q-expansion-item v-if="character.tactics" id="tactics">
        <hr>
        <span>TACTICS</span>
        <hr>
        <div id="before combat">
          Before Combat: {{ character.tactics.beforeCombat }}
        </div>
        <div id="during combat">
          During Combat: {{ character.tactics.duringCombat }}
        </div>
        <div id="morale">
          Morale: {{ character.tactics.morale }}
        </div>
      </q-expansion-item>

      <q-expansion-item id="statistics"
                        style="padding: 0"
                        expand-separator
                        default-opened
                        dense
                        header-class="bg-primary text-white"
                        label="STATISTICS">
        <div id="ability scores">
          <span v-for="(score, key, index) in character.abilityScores"
                v-bind:key="index">
            <b class="text-capitalize"> {{ key.substring(0, 3) }}</b> {{ score }}
            ({{
              formatBonus(
                character.abilityMods[key])
            }})
            <span v-if="index !== 5">, </span>
          </span>
        </div>
        <div>
          <b>Base Atk </b><span id="base atk" v-text="formatBonus(character.baseAtk)"/>;
          <b>CMB </b><span id="cmb" v-text="formatBonus(character.cmb)"/>;
          <b>CMD </b><span id="cmd" v-text="formatBonus(character.cmd)"/>;
        </div>
            <span class="text-capitalize" style="text-shadow: none;">
                      <q-markup-table dense
                                      flat
                                      class="parchment"
                                      style=" min-width: 350px; max-width: 50%;">
                        <thead>
                        <tr>
                          <th>Skill Name</th>
                          <th>Skill Bonus</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(value, key, index) in character.skills.totalSkills" :key="index">
                          <td class="text-left">{{key}}</td>
                          <td v-if="typeof(value) !== 'object'" class="text-left">{{formatBonus((value))}}</td>
                          <span v-else>
                            <tr v-for="(kValue, kKey, kIndex) in character.skills.totalSkills.knowledge" :key="kIndex">
                              <td class="text-left">{{kKey}}</td>
                              <td class="text-left">{{formatBonus(kValue)}}</td>
                            </tr>
                        </span>
                        </tr>
                        </tbody>
                      </q-markup-table>
                </span>

        <div id="languages" v-text="character.languages"></div>
        <div id="sq" v-text="character.specialQualities"></div>

      </q-expansion-item>

      <q-expansion-item v-if="character.featDescriptions" id="feat descriptions"
                        style="padding: 0"
                        expand-separator
                        dense
                        default-opened
                        header-class="bg-primary text-white"
                        label="FEATS">
        <q-card-section>
          <q-expansion-item v-for="(item, index) in character.featDescriptions"
                            :key="index"
                            style="padding: 0; color: black; text-shadow: none;"
                            class="parchment"
                            expand-separator
                            dense
                            header-class="bg-primary text-white"
                            :label="item.header">
            <p v-for="(descItem, descIndex) in item.description" :key="descIndex">
              <span v-text="descItem"/>
              <br>
              <br>
            </p>
          </q-expansion-item>
        </q-card-section>
      </q-expansion-item>

      <q-expansion-item v-if="character.specialAbilities" id="special abilities"
                        style="padding: 0"
                        expand-separator
                        dense
                        default-opened
                        header-class="bg-primary text-white"
                        label="SPECIAL ABILITIES">
        <q-card-section>
          <q-expansion-item v-for="(item, index) in character.specialAbilities"
                            :key="index"
                            style="padding: 0; color: black; text-shadow: none;"
                            class="parchment"
                            expand-separator
                            dense
                            header-class="bg-primary text-white"
                            :label="item.header">
            <p v-for="(descItem, descIndex) in item.description" :key="descIndex">
              <span v-text="descItem"/>
              <br>
              <br>
            </p>
          </q-expansion-item>
        </q-card-section>
      </q-expansion-item>

      <q-expansion-item v-if="character.mythicAbilities" id="special abilities"
                        style="padding: 0;"
                        expand-separator
                        default-opened
                        dense
                        header-class="bg-yellow-8 text-white"
                        label="MYTHIC ABILITIES">
        <q-card-section>
          <q-expansion-item v-for="(item, index) in character.mythicAbilities"
                            :key="index"
                            style="padding: 0; color: black; text-shadow: none;"
                            class="parchment"
                            expand-separator
                            dense
                            header-class="bg-yellow-8 text-black"
                            :label="item.header">
            <p v-for="(descItem, descIndex) in item.description" :key="descIndex">
              <span v-text="descItem"/>
              <br>
              <br>
            </p>
          </q-expansion-item>
        </q-card-section>
      </q-expansion-item>

      <q-expansion-item v-if="character.charGear.active" id="gear"
                        style="padding: 0"
                        expand-separator
                        default-opened
                        dense
                        header-class="bg-primary text-white"
                        label="GEAR">
        <hr>
        <span>GEAR</span>
        <hr>
      </q-expansion-item>

      <q-expansion-item v-if="character.ecology" id="ecology"
                        style="padding: 0"
                        expand-separator
                        default-opened
                        dense
                        header-class="bg-primary text-white"
                        label="GEAR">
      </q-expansion-item>

      <q-expansion-item v-if="character.miscellaneous" id="miscellaneous"
                        style="padding: 0"
                        expand-separator
                        default-opened
                        dense
                        header-class="bg-primary text-white"
                        label="GEAR">
      </q-expansion-item>

    </q-list>

    <q-page-sticky
      :class="animatable ? 'fabDrag' : ''"
      position="bottom-right"
      :offset="fabPos"
    >
      <q-fab
        persistent
        icon="add"
        color="accent"
        v-model="fabModel"
        v-touch-pan.prevent.mouse="moveFab"
        direction="up"
      />


    </q-page-sticky>

    <q-dialog v-model="fabModel">
      <q-card class="parchment">
        <q-toolbar class="bg-primary text-white">

          <q-toolbar-title>Toggle Menu</q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup/>
        </q-toolbar>
        <q-list separator>

          <q-item clickable v-ripple
                  v-for="bonus in toggle"
                  :key="bonus.name"
          >
            <q-item-section>
              <q-toggle
                class="text-h7, text-capitalize"
                v-model="bonus.active"
                :label="bonus.name"
                dark
                left-label
              />
            </q-item-section>
          </q-item>

        </q-list>
      </q-card>
    </q-dialog>
    <q-dialog v-model="spellDialog">
      <div class="parchment">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>{{ spellRef.name }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup/>
        </q-toolbar>
        <Spell :spell="spellRef"/>
      </div>
    </q-dialog>


  </q-page>
</template>

<script setup>
import {
  computed, ref, defineProps, reactive,
} from 'vue';
import SpellList from 'src/components/SpellList.vue';
import Spell from 'src/components/Spell.vue';
import {api} from 'boot/axios';
import {useQuasar} from 'quasar';

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
  get: () => props.character.maxHP - damageTaken.value,
  set: (value) => {
    damageTaken.value = props.character.maxHP - value;
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
  let list = '';

  let keys;

  if (arguments.length === 2) {
    keys = myKeys;
  } else {
    keys = Object.keys(myObj);
  }

  if (Array.isArray(myObj)) {
    const arrSize = myObj.length;
    for (let index = 0; index < arrSize; index += 1) {
      if (typeof myObj[index] !== 'undefined') {
        if (typeof myObj[index] === 'object' && myObj[index] !== null) {
          list += formatList(myObj[index], keys);

          if (index !== arrSize - 1) {
            list += ', ';
          }
        } else {
          list += myObj[index];

          if (index !== arrSize - 1 && myObj[index] !== "") {
            list += ' ';
          }
        }
      }
    }
  } else {
    const size = keys.length;

    for (let index = 0; index < size; index += 1) {
      if (typeof myObj[keys[index]] !== 'undefined') {
        if (typeof myObj[keys[index]] === 'object') {
          list += formatList(myObj[keys[index]]);
          if (index !== size - 1 && myObj[keys[index]] !== "") list += ' ';
        } else {
          list += myObj[keys[index]];
        }
        if (index !== size - 1 && myObj[keys[index]] !== "") list += ' ';
      }
    }
  }
  return list;
}

function allAreEqual(obj) {
  return new Set(Object.values(obj)).size === 1;
}

function formatSkills(myObj) {
  let list = '\n';

  const keys = Object.keys(myObj);

  const arrSize = keys.length;

  if (allAreEqual(myObj)) {
    list += formatBonus(myObj['arcana'])
  } else {

    for (let index = 0; index < arrSize; index += 1) {

      if (keys[index] === 'knowledge') {

        list += `${keys[index]} (${formatSkills(myObj[keys[index]])})`;

      } else {
        list += `${keys[index]} `;
        list += formatBonus(myObj[keys[index]]);
      }
      if (index !== arrSize - 1) list += '\n';
    }

  }


  return list;
}

function formatArray(myArray) {
  let list = '';

  myArray.forEach((item, idx) => {
    list += item;
    if (idx !== myArray.length - 1) list += ', ';
  });

  return list;
}

const spellRef = ref(null);

function loadSpell(value) {
  api.get(`/spell?name=ilike.${value}`)
    .then((response) => {
      [spellRef.value] = response.data;
    })
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      });
    });

  if (spellRef.value.name === null || spellRef.value.name === undefined) {
    spellRef.value = null;
  }
}

function formatSpecial(myObj, myKeys) {
  let list = '';

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
      if (typeof myObj[index] !== 'undefined') {
        if (typeof myObj[index] === 'object' && myObj[index] !== null) {
          list += formatSpecial(myObj[index], keys);
          if (index !== arrSize - 1) {
            list += ', ';
          }
        } else {
          list += myObj[index];

          if (index !== arrSize - 1) {
            list += ', ';
          }
        }
      }
    }
  } else {
    const size = keys.length;

    for (let index = 0; index < size; index += 1) {
      if (i !== 0) {
        list += ' (';
      }
      i = 1;

      if (typeof myObj[keys[index]] !== 'undefined') {
        if (typeof myObj[keys[index]] === 'object' && myObj[keys[index]][1] !== null) {
          list += formatSpecial(myObj[keys[index]]);

          if (index !== size - 1) list += ', ';
        } else {
          list += myObj[keys[index]];
        }
        if (index === size - 1) {
          if (typeof myObj.usesPerDay !== 'undefined') {
            list += '/day';
          }

          list += ')';
        }

        if (index !== size - 1) list += '';
      } else {
        list += 'undefined?';
      }
    }
  }
  return list;
}


const animatable = ref(false);

const fabModel = ref(false);
const fabToggleModel = ref(false);


const fabPos = ref([18, 18])
const draggingFab = ref(false)

function onClick() {
  console.log('Clicked on a fab action');
}

function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true

  if (!ev.isFinal) {
    animatable.value = false
  }

  fabPos.value = [
    fabPos.value[0] - ev.delta.x
    , fabPos.value[1] - ev.delta.y
  ]

  if (ev.isFinal) {
    animatable.value = true
    fabPos.value = [
      18, fabPos.value[1]
    ]

    if (fabPos.value[1] < 0) {
      fabPos.value[1] = 18
    }

    if (fabPos.value[1] > $q.screen.height - 118) {
      fabPos.value[1] = ($q.screen.height - 118)
      fabModel.value = false

    }
  }
}


const spellDialog = computed({
  get: () => spellRef.value !== null,
  set: () => {
    spellRef.value = null;
  },
});
const buffDialog = ref(false);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function healSpell() {
  damageTaken.value = Math.max(0, damageTaken.value - props.character.charLevel * 10);
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
  width: 100%
}

p {
  margin: .5vmin;
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
  background-color: rgba(0, 0, 0, .25);

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
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
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
  text-align: center;
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

.parchment {
  box-shadow: 2px 3px 20px black, 0 0 125px #8f5922 inset;
  background: #fffef0 url(data:image/png;base64,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);
}

.fabDrag {
  transition: 0.3s ease;
}

input[type="checkbox"] {
  /*font: inherit;*/
  color: rgb(255, 253, 125);
  width: 1.15em;
  height: 1.15em;
  font-size: 2em;
  visibility: hidden;
  cursor: pointer;
}



input[type="checkbox"]:before {
  content: "\e3ac";
  position: absolute;
  visibility: visible;
}

input[type="checkbox"]:checked:before {
    content: "\e3ac";
    position: absolute;
}

#willsp {
  font-size: .75em;
}


</style>

<style lang="sass" scoped>
.example-fab-animate,
.q-page-sticky:hover .example-fab-animate--hover
  animation: example-fab-animate 0.82s cubic-bezier(.36, .07, .19, .97) both
  transform: translate3d(0, 0, 0)
  backface-visibility: hidden
  perspective: 1000px

@keyframes example-fab-animate
  10%, 90%
    transform: translate3d(-1px, 0, 0)

  20%, 80%
    transform: translate3d(2px, 0, 0)

  30%, 50%, 70%
    transform: translate3d(-4px, 0, 0)

  40%, 60%
    transform: translate3d(4px, 0, 0)
</style>
