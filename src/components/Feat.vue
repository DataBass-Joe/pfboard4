<template>
  <q-list class="q-ma-lg q-gutter-lg text-body1">
    <p>
      <span v-if="feat.description">{{ feat.description }}</span>
    </p>
    <p>
      <span v-if="feat.prerequisites"
        ><b>Prerequisites: </b>{{ feat.prerequisites }}</span
      >
    </p>
    <p>
      <span v-if="feat.benefit"><b>Benefit: </b>{{ feat.benefit }}</span>
    </p>
    <p>
      <span v-if="feat.special"><b>Special: </b>{{ feat.special }}</span>
    </p>

    <!-- Full text -->
    <q-expansion-item
      v-if="feat.fulltext"
      expand-separator
      dense
      label="Full text"
      header-class="text-caption"
    >
      <q-card>
        <q-card-section>
          <span v-html="feat.fulltext"></span>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  feat: Object,
});
</script>

<style scoped></style>
