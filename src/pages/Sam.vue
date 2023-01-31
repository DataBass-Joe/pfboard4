<template>
  <span>
      <BaseSheet6
        :character="sam"
      />
  </span>
</template>

<script setup>
import BaseSheet6 from '/src/components/BaseSheet6.vue';
import {useSam} from "stores/character";
import { useMeta } from "quasar";
import {reactive, ref} from "vue";

const store = useSam();

const sam = store.sam;

const metaData = reactive({
  title: sam.name,
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
  //background: url("../assets/tub.webp") no-repeat center center;
  justify-content: space-between;
  background-size: cover;
}

.curse {
  color: #ff0000;
}

.mystery {
  color: #fcffae;
}

</style>

<style>
.curse {
  color: #ff4e4e;
}

.mystery {
  color: #fcffae;
}

input[type="checkbox"] {
  /*font: inherit;*/
  color: rgb(255, 253, 125);
  width: 1.15em;
  height: 1.15em;
  font-size: 2em;
  visibility: hidden;
  cursor: pointer;
}

input[type="checkbox"]:before {
  content: "\2662";
  position: absolute;
  visibility: visible;
}

input[type="checkbox"]:checked:before {
  content: "\2666";
  position: absolute;
}
</style>
