<template>

  <div v-show="caster.spells">
    <q-card-section>

      <q-expansion-item id="offense"
                        :label="casterLabel(caster, spellStyle, castingMod)"
                        default-opened
                        dense
                        expand-separator
                        header-class="bg-primary text-white"
                        style="padding: 0">

        <div v-for="(spellList, level, index) in caster.spells" v-bind:key="index"
             class="spells">
          <span v-if="spellLevel[level] in trackedResource">
          <span type="checkbox" v-for="(value, index) in
              trackedResource[spellLevel[level]]"
                v-bind:key="index"
                @click="updateTrackedResource(spellLevel[level], index)"
          >
                <input type="checkbox" v-model="trackedResource[spellLevel[level]][index]" />
                </span>
        </span>

          <div v-show="toggleKey">

            <b>
              {{ level }}
              <span v-if="caster.name !== 'warlock' || index === 0">

              <span v-if="level !== 'Cantrips' && level !== 'Orisons' && caster.name !== 'warlock'">
              ({{ spellList.slots + Math.floor((castingMod - spellLevel[level]) / 4 + 1) }}/day)
            </span>

              <span v-text="` (DC ${10 + castingMod + spellLevel[level] + spellDCMod})`"/>
              <span v-text="` (+${castingMod + spellLevel[level]})`"/>
                            </span>


            </b>
            <span v-text="'&nbsp;'"/>
            <span>—</span>
            <span v-text="'&nbsp;'"/>
            <i v-for="(spell, index) in spellList.prepared" v-bind:key="index">
          <span class="spell"
                :class="{mythic: 'mythicSpells' in caster ? caster.mythicSpells.includes(spell.toLowerCase()) ?? false : false
                , active: spell === activeSpell}"
                v-on:click="emit('spellSubmit', spell);
                activeSpell = spell; ">{{ spell }}</span>

              <span v-if="index !== spellList.prepared.length - 1">, </span>

            </i>

            <span v-if="typeof caster.patronSpells !== 'undefined'">
        <i v-show="caster.patronSpells[level]" class="patron"> :
          <span class="spell"
                v-bind:class="{ active: caster.patronSpells[level] === activeSpell }"
                v-on:click="emit('spellSubmit', caster.patronSpells[level]);
                activeSpell = caster.patronSpells[level];">
            {{ caster.patronSpells[level] }}
          </span>
        </i>
        </span>
            <span v-if="typeof caster.mysterySpells !== 'undefined'">
        <i v-for="(mystery, index) in caster.mysterySpells" v-show="mystery[level]"
           :key="index"
           class="mystery"> :
          <span class="spell"
                v-bind:class="{ active: mystery[level] === activeSpell }"
                v-on:click="emit('spellSubmit', mystery[level]);
                activeSpell = mystery[level];">
            {{ mystery[level] }}
          </span>
        </i>
        </span>
            <span v-if="typeof caster.curseSpells !== 'undefined'">
        <i v-for="(curse, index) in caster.curseSpells" v-show="curse[level]"
           :key="index"
           class="curse"> :
          <span class="spell"
                v-bind:class="{ active: curse[level] === activeSpell }"
                v-on:click="emit('spellSubmit', curse[level]);
                activeSpell = curse[level];">
            {{ curse[level] }}
          </span>
        </i>
        </span>

          </div>

        </div>

      </q-expansion-item>
    </q-card-section>

  </div>

</template>

<script setup>
import {
  computed,
  defineEmits,
  defineProps,
  reactive,
  ref,
} from 'vue';
import {
  useQuasar
} from 'quasar';
import {
  api,
} from 'boot/axios';

function casterLabel(caster, spellStyle, castingMod) {

  let tempLabel = `${caster.name} Spells ${spellStyle} (CL ${caster.casterLevel}`;

  if (caster.hasOwnProperty('spellPenetrationCasterLevel')) {
    tempLabel += ` [+${caster.spellPenetrationCasterLevel} against Spell Resistance]`;
  }

  tempLabel += `; Concentration +${caster.casterLevel + castingMod});`

  return tempLabel;
}

const $q = useQuasar();
const toggleKey = ref(true);

const props = defineProps({
  caster: Object,
  castingMod: Number,
  spellDCMod: Number,
  charID: Number
});

const emit = defineEmits(['spellSubmit']);

const activeSpell = ref('');

const spellColorList = ref([]);

const spellLevel = reactive({
  Cantrips: 0,
  Orisons: 0,
  '1st': 1,
  '2nd': 2,
  '3rd': 3,
  '4th': 4,
  '5th': 5,
  '6th': 6,
  '7th': 7,
  '8th': 8,
  '9th': 9,
});

const spellStyle = computed(() => (props.caster.casting === 'spontaneous' ? 'Known' : 'Prepared'));

function spellColor(value) {
  return api.get(`/spell?limit=1&name=ilike.${value}`)
    .then((response) => response.data)
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'spellcolor Loading failed',
        icon: 'report_problem',
      });
    });
}

spellColor()
  .then((response) => {
    spellColorList.value = response.data;
    if (spellColorList.value !== undefined
      && spellColorList.value[0] !== undefined
      && spellColorList.value[0].school === 'enchantment') {
      return 'purple';
    }
    return 'green';
  });


function spellSlotModifier(slots, level) {
  if (props.caster.name !== 'warlock') {
    return slots + Math.floor(((props.castingMod - spellLevel[level]) / 4) + 1)
  }
  return slots
}



const trackedResource = ref({});



function loadTrackedResources(resource, spellSlots) {
  api.get(`/spell_slot?character_id=eq.${props.charID}&resource_id=eq.${resource}`)
    .then((response) => {

      if(response.data[0] ?? false) {
        trackedResource.value[resource] = response.data[0].resource;
      }

      if ((!trackedResource.value[resource] ?? true)) {

        api.post(`/spell_slot`, {
          "character_id": props.charID,
          "resource_id": resource,
          "resource": Array(spellSlots).fill(false)
        })
          .then((response) => {
            console.log(response);
          })
          .catch(() => {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: 'resource creation failed',
              icon: 'report_problem',
            });
          });
      }

    })
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'spell_list resource Loading failed',
        icon: 'report_problem',
      });
    });
}

Object.keys(props.caster.spells).forEach((level) => {
  const spellSlots = computed(() => spellSlotModifier(props.caster.spells[level].slots, level))
  if (spellSlots.value > 0) {
    loadTrackedResources(spellLevel[level], spellSlots.value)
  }
  })


const upsertConfig = reactive({
  headers: {
    Prefer: "resolution=merge-duplicates",
  }
})

function updateTrackedResource(resource_id, index) {

  console.log(trackedResource.value[resource_id])

  trackedResource.value[resource_id][index] = !trackedResource.value[resource_id][index]
  console.log(trackedResource.value[resource_id])

  api.post(`/spell_slot?on_conflict=character_id,resource_id`, {
    "character_id": props.charID,
    "resource_id": resource_id,
    "resource": trackedResource.value[resource_id]
  }, upsertConfig)
    .then((response) => {
      console.log(response);
      console.log(trackedResource.value[resource_id])

    })
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      });
    });
}


</script>

<style scoped lang="scss">

.spells {
  text-indent: 1rem;
  margin: .5vmin;
}

.patron {
  color: #31CCEC;
}

.mythic {
  color: $amber;
}

.spell {
  cursor: pointer;
  border-bottom: 2px solid #fff3;
}

.spell:hover {
  border-bottom-color: #fff9;
}

.active {
  border-bottom-color: #fff9;
  font-weight: bold;
}



input[type="checkbox"] {
  /*font: inherit;*/
  color: rgb(175, 175, 255);
  width: 1.15em;
  height: 1.15em;
  font-size: 2em;
  visibility: hidden;
  cursor: pointer;


}

input[type="checkbox"]:before {
  content: "\2606";
  position: absolute;
  visibility: visible;
}

input[type="checkbox"]:checked:before {
  content: "\272E";
  position: absolute;
  color: rgb(125, 125, 255);

}

</style>
