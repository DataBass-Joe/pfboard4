<template>
  <span>
      <BaseSheet5
        :character="rub"
      />
  </span>
</template>

<script setup>
import BaseSheet5 from '/src/components/BaseSheet5.vue';
import { useRub } from "stores/character";
import { useMeta } from "quasar";
import {reactive, ref} from "vue";

const store = useRub();

const rub = store.rub;

const metaData = reactive({
  title: rub.name,
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
  background: url("../assets/Goblin02.webp") no-repeat center center;
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
</style>
