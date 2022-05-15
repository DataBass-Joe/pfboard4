<template>
  <span>
      <BaseSheet5
        :character="dominic"
      />
  </span>
</template>

<script setup>
import BaseSheet5 from '/src/components/BaseSheet5.vue';
import {useDominic} from "stores/character";
import { useMeta } from "quasar";
import {reactive, ref} from "vue";

const store = useDominic();

const dominic = store.dominic;

const metaData = reactive({
  title: dominic.name,
});
useMeta(metaData);



</script>

<style scoped lang="scss">
#page {
  text-shadow: 2px 2px 4px #000000;
  color: white;
  text-align: left;
  align-items: baseline;
  padding: 1vmin;
  background: url("../assets/dominic.webp") no-repeat center center;
  justify-content: space-between;
  background-size: cover;
}
</style>
