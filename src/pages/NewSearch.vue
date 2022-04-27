<template>
  <q-page class="fit" style="padding: 1em">
    <q-select v-model="table"
              :options="tablesRef"
              @change="loadResults"
              label="Table"/>

    <q-input
      v-model="nameSearch"
      label="Name Search"
      filled
      placeholder="Search"
      @change="loadResults"
      style="overflow: auto;"
    >
      <template v-slot:append>
        <q-icon name="search"/>
      </template>
    </q-input>
    <q-input
      v-model="fullSearch"
      label="Full Text Search"
      filled
      placeholder="Search"
      @change="loadResults"
      style="overflow: auto;"
    >
      <template v-slot:append>
        <q-icon name="search"/>
      </template>
    </q-input>

    <div class="q-pa-lg flex flex-center">
      <q-pagination
        v-model="offsetPage"
        @update:model-value="loadResults"
        :max-pages="6"
        boundary-numbers
        :max="pageCount"
      />
    </div>
    <q-list v-if="!searchFlag" bordered class="rounded-borders" style="overflow: auto;">
      <q-expansion-item
        v-for="(result, index) in resultsList" :key="index"
        header-class="text-h6 text-white text-capitalize"
        style="padding: .25em;"
        :header-style="`background:${groupColors[result.group] ?? 'brown'}`"
        expand-separator
        :label="(result.name + ' ' + tableOrder + ' ' + result[tableOrder])"
      >
        <q-card bordered>
          <PFItem v-if="table === 'item'" :pf-item="result"/>
          <Spell v-else-if="table === 'spell'" :spell="result"/>
          <Feat v-else-if="table === 'feat'" :feat="result"/>
          <Bestiary v-else-if="table === 'bestiary'" :bestiary="result"/>
        </q-card>
      </q-expansion-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import PFItem from 'src/components/PFItem.vue';
import Spell from 'src/components/Spell.vue';
import Feat from 'src/components/Feat.vue';
import Bestiary from 'src/components/Bestiary.vue';

const $q = useQuasar();
const fullSearch = ref('');
const nameSearch = ref('');

const searchFlag = computed(() => (fullSearch.value === '' && nameSearch.value === ''));

const restFullSearch = computed(() => (searchFlag.value ? '' : `*${fullSearch.value}*`));

const restNameSearch = computed(() => (searchFlag.value ? '' : `*${nameSearch.value}*`));

const resultsRef = reactive({});
const resultsList = ref([]);

const resultsLength = ref(null);
const pageCount = computed(() => Math.floor((resultsLength.value / 20)));

const tablesOrder = reactive({
  item: 'cl',
  bestiary: 'cr',
  spell: 'sla_level',
  feat: 'name',
});

const tablesRef = computed(() => Object.keys(tablesOrder));
const table = ref(null);

const tableOrder = computed(() => (tablesOrder[table.value]));

const offsetPage = ref(1);
const offset = computed(() => Math.floor((offsetPage.value - 1) * 20));

const pagination = computed(() => (`limit=20&offset=${offset.value}`));

const fullSearchFilter = computed(() => (`fulltext=ilike.${restFullSearch.value}`));
const nameSearchFilter = computed(() => (`name=ilike.${restNameSearch.value}`));

const orderUrl = computed(() => (`order=${tableOrder.value}.desc.nullslast`));

function loadResults() {
  const config = {
    headers: {
      Prefer: 'count=exact',
    },
  };

  Object.keys(resultsRef)
    .forEach((key) => delete resultsRef[key]);

  resultsList.value = [];

  api.get(`/${table.value}?${fullSearchFilter.value}&${nameSearchFilter.value}`, config)
    .then((response) => {
      [, resultsLength.value] = response.headers['content-range'].split('/');
    })
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      });
    });

  api.get(`/${table.value}?${pagination.value}&${fullSearchFilter.value}&${nameSearchFilter.value}&${orderUrl.value}`)
    .then((response) => {
      response.data.forEach((row) => {
        resultsRef[row.name] = row;
        row.label = row.name;
        resultsList.value.push(row);
      });
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

const groupColors = reactive({
  Rod: '#3B1E00',
  'Legendary Weapon': '#020A28',
  Armor: '#14591D',
  'Shadow Piercing': '#99AA38',
  Ammunition: '#90708C',
  Ring: '#635380',
  Potion: '#49306B',
  Staff: '#7D84B2 ',
  Wand: '#8E9DCC',
  Artifact: '#45B69C',
  Weapon: '#21D19F',
  Cursed: '#555B6E',
  'Wondrous Item': '#0C4656',
  'Magical Tattoo': '#E365C1',
});

</script>

<style scoped>

</style>
