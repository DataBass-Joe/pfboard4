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
          <input type="checkbox" v-for="(index) in spellList.slots + Math.floor((castingMod - spellLevel[level]) / 4 + 1)" v-bind:key="index"/>

          <div v-show="toggleKey">
            <b>
              {{ level }}
              <span v-if="level !== 'Cantrips' && level !== 'Orisons'">
              ({{ spellList.slots + Math.floor((castingMod - spellLevel[level]) / 4 + 1) }}/day)
            </span>
              <span v-text="` (DC ${10 + castingMod + spellLevel[level]})`"/>
              <span v-text="` (+${castingMod + spellLevel[level]})`"/>

            </b>
            <span v-text="'&nbsp;'"/>
            <span>—</span>
            <span v-text="'&nbsp;'"/>
            <i v-for="(spell, index) in spellList.prepared" v-bind:key="index">
          <span class="spell"
                v-bind:class="{ active: spell === activeSpell }"
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
  return api.get(`/spell?limit=1&name.ilike.${value}`)
    .then((response) => response.data)
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
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



const x = computed(() => {

  const myObjKeys = ref(Object.keys(props.caster.spells));


  let test = reactive({})

  myObjKeys.value.forEach((spelllist) => {
    test[spelllist] = props.caster.spells[spelllist].slots
  })

  return test

});

</script>

<style scoped>

.spells {
  text-indent: 1rem;
  margin: .5vmin;
}

.patron {
  color: #31CCEC;
}

.mystery {
  color: #cdaeff;
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
  color: rgb(125, 125, 255);
  width: 1.15em;
  height: 1.15em;
  font-size: 2em;
  visibility:hidden;
  cursor:pointer;


}

input[type="checkbox"]:before {
  content: "\2606";
  position: absolute;
  visibility:visible;
}
input[type="checkbox"]:checked:before {
  content: "\272E";
  position: absolute;
}

</style>
