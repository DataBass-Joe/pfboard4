<template>
  <MobileSheet
    :character="sareah"
  />
</template>

<script setup>
import MobileSheet from '/src/components/MobileSheet.vue';
import { useSareah } from "stores/character";
import {reactive} from "vue";
import {useMeta} from "quasar";

const store = useSareah();

const sareah = store.sareah;

const metaData = reactive({
  title: sareah.name,
});
useMeta(metaData);</script>

<style scoped lang="scss">
#page {
  text-shadow: 2px 2px 4px #000000;
  color: white;
  text-align: left;
  align-items: baseline;
  padding: 1vmin;
  background-image: url("../assets/sareah_placeholder.png");
  background-repeat: no-repeat;

  background-size: 100vmax;
  background-position: 50% 50%;
  background-attachment: fixed;
  justify-content: space-between;
}
</style>
