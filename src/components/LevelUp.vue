<template>
  <q-card-section style="padding: 2.55vmin"
          class="q-gutter-md"
  >

          <ClassSelection
            v-bind:char-class-prop="charClass"
            @char-class-submit="loadCharClass"
            @char-class-id-submit="loadCharClassId"
            @archetype-submit="loadArchetype"
          />



          <q-input filled
                   name="classLevel"
                   type="number"
                   v-model="classLevel"
                   v-on:input="emit('classLevelSubmit', classLevel)"
                   label="How many levels are you taking in this class?" />



  </q-card-section>
</template>

<script setup>
import ClassSelection from "src/components/ClassSelection.vue"

import {ref} from "vue";
import {useQuasar} from "quasar";
import {defineEmits} from "vue";

const $q = useQuasar();


const classLevel = ref(0)

const emit = defineEmits(['classLevelSubmit']);





</script>

<style scoped>




</style>
