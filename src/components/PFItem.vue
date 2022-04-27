<template>
  <q-list class="q-ma-md text-body1">
    <p class="text-body1">
      <b>Aura </b>{{ pfItem.aura }};
      <b>CL </b>{{ ordinal(pfItem.cl) }}
    </p>
    <p class="text-body1">
      <b>Slot </b>{{ pfItem.slot === 'none' ? '-' : pfItem.slot }};
      <span v-if="pfItem.price"><b>Price </b>{{ pfItem.price }};</span>
      <b>Weight </b>{{ pfItem.weight ?? '-' }}
    </p>
    <q-expansion-item
      style="padding: 0"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="DESCRIPTION"
    >
      <q-card>
        <q-card-section>
          {{ pfItem.description }}
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <q-expansion-item
      v-if="pfItem.requirements"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="CONSTRUCTION"
    >
      <q-card>
        <q-card-section>
          <b>Requirements </b>{{ pfItem.requirements }};
          <span v-if="pfItem.cost"><b>Cost </b>{{ pfItem.cost }};</span>
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <q-expansion-item
      v-if="pfItem.magicitems"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="CREATION"
    >
      <q-card>
        <q-card-section>
          <b>Requirements </b>{{ pfItem.magicitems }};
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <q-expansion-item
      v-if="pfItem.destruction"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="DESTRUCTION"
    >
      <q-card>
        <q-card-section>
          {{ pfItem.destruction }}
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <q-expansion-item
      v-if="pfItem.fulltext"
      expand-separator
      dense
      label="Full text"
      header-class="text-caption"
    >
      <q-card>
        <q-card-section>
          <span v-html="pfItem.fulltext"></span>
        </q-card-section>
      </q-card>
    </q-expansion-item>

  </q-list>
</template>

<script setup>

import {
  defineProps,
} from 'vue';

defineProps({
  pfItem: Object,
});

const englishOrdinalRules = new Intl.PluralRules('en', { type: 'ordinal' });
const suffixes = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th',
};

function ordinal(number) {
  const suffix = suffixes[englishOrdinalRules.select(number)];
  return (number + suffix);
}

</script>

<style>

</style>
