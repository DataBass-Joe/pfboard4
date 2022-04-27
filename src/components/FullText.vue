<template>

  <div id="stat-block">

    <a href="javascript:void(0)" v-bind:class="{ bestiary: isBestiary}"
       class="closebtn" v-on:click="$emit('closeSpell', {
        name: name,
        entryID: this.entryID,
        table: this.table
      })">&times;</a>

    <span v-for="entry in searchRef" v-bind:key="entry.id">

          <span v-html="entry.fulltext"></span>
      <br>
      <span id="right">Source: {{ entry.source }}</span>

    </span>

  </div>

</template>

<script setup>
import {
  computed, ref, defineProps,
} from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const $q = useQuasar();
const props = defineProps({
  entryID: Number,
  table: String,
  name: String,
  source: String,
  alternateNameForm: String,
  thirdParty: Number,
});

const searchRef = ref([]);
function loadSearch() {
  return api.get(`/${props.table}?limit=30&name.ilike.${props.name}`)
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
loadSearch()
  .then((response) => {
    searchRef.value = response.data;
  });

const isBestiary = computed(() => (props.table === 'bestiary'));

</script>

<style scoped>

div {
  background-color: rgba(0, 0, 0, .25);
  padding: 1vmin;

}

.closebtn {
  position: relative;
  z-index: 30;
  float: right;
  right: clamp(16px, 1vw, 1.5vmin);
  font-size: 36px;
  color: white;
  text-decoration: none;
  align-self: flex-end;
}

.bestiary {
  top: clamp(32px, 1vw, 1.5vmin);
}

#right {
  display: flex;
  flex-direction: row-reverse;
}

</style>
