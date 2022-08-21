<template>
  <q-list v-if="abilityInfo" class="q-ma-md text-body1">

    <p>
      <span v-if="abilityInfo.description" v-html="formatString(abilityInfo.description)"/>
    </p>
  </q-list>

</template>

<script setup>
import {defineProps, ref} from "vue";

import {
  api,
} from 'boot/axios';
import {useQuasar} from "quasar";

const $q = useQuasar();


function formatString(myString) {
 return myString.replace(/(?:\r\n|\r|\n|\. )/g, "$&" + "<br><br>")
}

const abilityInfo = ref();

const props = defineProps({
  ability: String,
});


function getAbility(value) {
  return api.get(`/ability?limit=1&name=ilike.${value}`)
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

getAbility(props.ability)
  .then((response) => {
    abilityInfo.value = response[0];
  });


</script>

<style scoped></style>
