<template>
  <span>
      <BaseSheet5
        :character="sareah"
      />
  </span>
</template>

<script setup>
import BaseSheet5 from '/src/components/BaseSheet5.vue';
import { useSareah } from "stores/character";
import { useMeta } from "quasar";
import {reactive, ref} from "vue";

const store = useSareah();

const sareah = store.sareah;

const metaData = reactive({
  title: sareah.name,
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
  background: url("../assets/sareah.webp") no-repeat center center;
  justify-content: space-between;
  background-size: cover;
}
</style>
