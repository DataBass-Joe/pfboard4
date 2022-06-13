<template>
  <q-page class="row items-center">
<!--    <a href="/#/Sareah">-->
<!--      <div class="container">-->
<!--        <div class="blur"></div>-->
<!--        <iframe src="/#/Sareah"></iframe>-->
<!--      </div>-->
<!--    </a>-->
<!--    <a href="/#/Frey">-->
<!--      <div class="container">-->
<!--        <div class="blur"></div>-->
<!--        <iframe src="/#/Frey"></iframe>-->
<!--      </div>-->
<!--    </a>-->
<!--    <a href="/#/Immogen">-->
<!--      <div class="container">-->
<!--        <div class="blur"></div>-->
<!--        <iframe src="/#/Immogen"></iframe>-->
<!--      </div>-->
<!--    </a>-->

<!--      <a href="/#/Gorthor">-->
<!--    <div class="container">-->
<!--      <iframe src="/#/Gorthor"/>-->
<!--    </div>-->
<!--    </a>-->

    <div class="absolute-center">Welcome to the PF Board!</div>
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

<style>
iframe {
  width: 100vw;
  height: 100vh;
  transform:scale(0.25);
  transform-origin: 0 0;
}
.container {
  width: 24vw;
  height: 50vw;
  overflow: hidden;
}

.container iframe {
  z-index: 1;
  pointer-events: none;
}

</style>
