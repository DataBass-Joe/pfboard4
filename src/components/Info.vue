<template>

  <div>

    <a href="javascript:void(0)" class="closebtn" v-on:click="$emit('closeInfo', '')">&times;</a>

    <span v-for="entry in infoRef" v-bind:key="entry.id"
          id="stat-block">

          <span>
            <h1>{{ entry.name }}</h1>
            {{ entry.description }}
          </span>

    </span>

  </div>

</template>

<script>
import { defineProps, ref } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const props = defineProps({
  entryID: Number,
  table: String,
  name: String,
});

const infoRef = ref([]);

function loadInfo() {
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

loadInfo()
  .then((response) => {
    infoRef.value = response.data;
  });

</script>

<style scoped>

div {
  background-color: rgba(0, 0, 0, .25);
  padding: 1vmin;
  margin: 1vmin;

}

h4 {

}

.closebtn {
  position: relative;
  float: right;
  font-size: 36px;
  color: white;
  text-decoration: none;
}

</style>
