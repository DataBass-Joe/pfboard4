<template>
  <q-page class="row items-center justify-evenly">
    <q-knob
      show-value
      :min="0"
      :max="10"
      class="text-light-blue q-ma-md"
      v-model="myNumber"
      size="50px"
      :color="myColor"
      :track-color="myTrackColor"
    />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const myNumber = ref(10);
    const myColor = computed(() => (myNumber.value >= 3 ? 'blue' : 'red'));
    const myTrackColor = computed(() => `${myColor.value}-3`);

    return {
      myNumber,
      myColor,
      myTrackColor,
    };
  },
});

</script>
