<template>
  <BaseSheet5
    :character="immogen"
  />
</template>

<script setup>
import BaseSheet5 from '/src/components/BaseSheet5.vue';
import {useImmogen} from "stores/character";
import { useMeta } from "quasar";
import {reactive, ref} from "vue";

const store = useImmogen();

const immogen = store.immogen;

const metaData = reactive({
  title: immogen.name,
});
useMeta(metaData);

</script>

<style scoped>

#page {
  text-shadow: 2px 2px 4px #000000;
  color: white;
  text-align: left;
  align-items: baseline;
  padding: 1vmin;
  background: url("../assets/immogen.webp") no-repeat center center;
  justify-content: space-between;
  background-size: cover;
}

</style>


<style>
.curse {
  color: #ff7c7c;
}

.mystery {
  color: #79eff6;
}
</style>
