<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> PF Board </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from "components/EssentialLink.vue";

const linksList = [
  {
    title: "New Character",
    icon: "school",
    link: "/#/NewCharacter",
  },
  {
    title: "Bonus Store",
    icon: "school",
    link: "/#/BonusStore",
  },
  {
    title: "Immogen",
    icon: "school",
    link: "/#/Immogen2",
  },
  {
    title: "Gorthor",
    icon: "private_connectivity",
    link: "/#/Gorthor",
  },
  {
    title: "Frey",
    icon: "hdr_strong",
    link: "/#/Frey",
  },
  {
    title: "Sareah",
    icon: "fingerprint",
    link: "/#/Sareah",
  },
  {
    title: "Sareah Mobile",
    icon: "smartphone",
    link: "/#/SareahMobile",
  },
  {
    title: "Gub",
    icon: "search",
    link: "/#/Gub",
  },
  {
    title: "Klein",
    icon: "search",
    link: "/#/Klein",
  },
  {
    title: "Flafaffiel",
    icon: "search",
    link: "/#/Flafaffiel",
  },
  {
    title: "New Search",
    icon: "search",
    link: "/#/NewSearch",
  },
  {
    title: "Three",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "/#/three",
  },
  {
    title: "Discord Chat Channel",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "https://chat.quasar.dev",
  },
  {
    title: "Forum",
    caption: "forum.quasar.dev",
    icon: "record_voice_over",
    link: "https://forum.quasar.dev",
  },
  {
    title: "Twitter",
    caption: "@quasarframework",
    icon: "rss_feed",
    link: "https://twitter.quasar.dev",
  },
  {
    title: "Facebook",
    caption: "@QuasarFramework",
    icon: "public",
    link: "https://facebook.quasar.dev",
  },
  {
    title: "Quasar Awesome",
    caption: "Community Quasar projects",
    icon: "favorite",
    link: "https://awesome.quasar.dev",
  },
];

import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
