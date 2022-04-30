<template>
  <q-list class="q-ma-md text-body1">

    <q-item>
    <p>
      <b>School </b>{{ spell.school }}
      <span v-if="spell.subschool">{{ `(${spell.subschool})` }}</span>
      <span v-if="spell.descriptor">{{ `[${spell.descriptor}]` }}</span
      >; <b>Level </b>{{ spell.spell_level }}
      <span v-if="spell.domain"><b>Domain </b>{{ spell.domain }};</span>
      <span v-if="spell.bloodline"
        ><b>Bloodline </b>{{ spell.bloodline }};</span
      >
      <span v-if="spell.elemental_school">
        <b>Elemental School </b>{{ spell.elemental_school }};</span
      >
      <span v-if="spell.patron"><b>Patron </b>{{ spell.patron }};</span>
    </p>
    </q-item>

    <!-- CASTING -->
    <q-expansion-item
      style="padding: 0"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="CASTING"
    >
      <q-card>
        <q-card-section>
          <b>Casting Time </b>{{ spell.casting_time }}
        </q-card-section>
        <q-card-section>
          <b>Components </b>{{ spell.components }}
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- EFFECT -->
    <q-expansion-item
      style="padding: 0"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="EFFECT"
    >
      <q-card>
        <q-card-section> <b>Range </b>{{ spell.range }} </q-card-section>
        <q-card-section v-if="spell.area">
          <b>Area </b>{{ spell.area }}
        </q-card-section>
        <q-card-section v-if="spell.effect">
          <b>Effect </b>{{ spell.effect }}
        </q-card-section>
        <q-card-section v-if="spell.targets">
          <b>Targets </b>{{ spell.targets }}
        </q-card-section>
        <q-card-section> <b>Duration </b>{{ spell.duration }} </q-card-section>
        <q-card-section>
          <span v-if="spell.saving_throw"
            ><b>Saving Throw </b>{{ spell.saving_throw }};
          </span>
          <span v-if="spell.spell_resistance">
            <b>Spell Resistance </b>{{ spell.spell_resistance }}</span
          >
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- DESCRIPTION -->
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
          {{ spell.description }}
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- MYTHIC -->
    <q-expansion-item
      v-if="spell.mythic_text"
      style="padding: 0"
      expand-separator
      dense
      header-class="bg-amber text-black"
      label="MYTHIC"
    >
      <q-card>
        <q-card-section>
          {{ spell.mythic_text }}
        </q-card-section>
        <q-card-section v-if="spell.augmented">
          <b>{{ spell.augmented.split(":")[0] }}:</b>
          {{ spell.augmented.split(":")[1] }};
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Full text -->
    <q-expansion-item
      v-if="spell.fulltext"
      expand-separator
      dense
      label="Full text"
      header-class="text-caption"
    >
      <q-card>
        <q-card-section>
          <span v-html="spell.fulltext"></span>
        </q-card-section>
      </q-card>
    </q-expansion-item>

  </q-list>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  spell: Object,
});
</script>

<style scoped>
.q-card {
  background: transparent;
}
.q-card__section--vert, .q-item {
  padding: 0.25em 16px;
}



</style>
