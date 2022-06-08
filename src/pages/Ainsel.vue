<template>
  <span>
      <BaseSheet6
        :character="ainsel"
      />
  </span>
</template>

<script setup>
import BaseSheet6 from '/src/components/BaseSheet6.vue';
import { useAinsel } from "stores/character";
import { useMeta } from "quasar";
import {reactive, ref} from "vue";

const store = useAinsel();

const ainsel = store.ainsel;

const metaData = reactive({
  title: ainsel.name,
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
  background: url("../assets/ainsel.jpg") no-repeat center center;
  justify-content: space-between;
  background-size: cover;
}
</style>
