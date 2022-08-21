<template>
  <q-list v-if="featInfo" class="q-ma-md text-body1">

    <p>
      <span v-if="featInfo.description">{{ featInfo.description }}</span>
    </p>
    <p>
      <span v-if="featInfo.prerequisites"
        ><b>Prerequisites: </b>{{ featInfo.prerequisites }}</span
      >
    </p>
    <p>
      <span v-if="featInfo.benefit"><b>Benefit: </b><span v-html="formatString(featInfo.benefit)"/></span>
    </p>
    <p>
      <span v-if="featInfo.special"><b>Special: </b>{{ featInfo.special }}</span>
    </p>

    <!--  Mythic  -->
    <q-expansion-item
      v-if="mythicFeatInfo"
      expand-separator
      dense
      label="Mythic"
      header-class="bg-amber text-black"
    >
          <span>
            <p>
              <span v-if="mythicFeatInfo.description">{{ mythicFeatInfo.description }}</span>
            </p>
            <p>
              <span v-if="mythicFeatInfo.prerequisites"
              ><b>Prerequisites: </b>{{ mythicFeatInfo.prerequisites }}</span
              >
            </p>
            <p>
              <span v-if="mythicFeatInfo.benefit"><b>Benefit: </b><span v-html="formatString(mythicFeatInfo.benefit)"/></span>
            </p>
            <p>
              <span v-if="mythicFeatInfo.special"><b>Special: </b>{{ mythicFeatInfo.special }}</span>
            </p>
          </span>
    </q-expansion-item>

<!--     Full text-->
    <q-expansion-item
      v-if="featInfo.fulltext"
      expand-separator
      dense
      label="Full text"
      header-class="text-caption"
    >
      <q-card>
        <q-card-section>
          <span v-html="featInfo.fulltext"></span>
        </q-card-section>
      </q-card>
    </q-expansion-item>
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
 return myString.replace(/(?:\r\n|\r|\n|\. )/g, '\.<br/><br/>')
}

const featInfo = ref();
const mythicFeatInfo = ref();


const props = defineProps({
  feat: String,
});


function getMythicFeat(value) {
  return api.get(`/feat?limit=1&name=ilike.${value}&type=ilike.mythic`)
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


getMythicFeat(props.feat)
  .then((response) => {
    mythicFeatInfo.value = response[0];
  });


function getFeat(value) {
  return api.get(`/feat?limit=1&name=ilike.${value}`)
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


getFeat(props.feat)
  .then((response) => {
    featInfo.value = response[0];
  });


</script>

<style scoped></style>
