<template>
  <q-list class="q-ma-lg q-gutter-lg text-body1">
    <p>
      <span v-if="bestiary.description_visual">{{ bestiary.description_visual }}</span>
    </p>
    <p>
      <span v-if="bestiary.xp"><b>XP {{ bestiary.xp }}</b></span>
    </p>
    <p v-if="bestiary.race || bestiary.class">
      <span class="text-capitalize" v-if="bestiary.race">{{ bestiary.race }} </span>
      <span v-text="'&nbsp;'"/>
      <span v-if="bestiary.class"> {{ bestiary.class }}</span>
    </p>
    <p>
      <span v-if="bestiary.alignment">{{ bestiary.alignment }}</span>
      <span v-text="'&nbsp;'"/>
      <span v-if="bestiary.size" class="text-capitalize">{{ bestiary.size }}</span>
      <span v-text="'&nbsp;'"/>
      <span v-if="bestiary.type">{{ bestiary.type }}</span>
      <span v-text="'&nbsp;'"/>
      <span v-if="bestiary.subtype">{{ bestiary.subtype }}</span>
    </p>
    <p>
      <span v-if="bestiary.init_raw"><b>Init </b>{{ formatBonus(bestiary.init_raw) }};</span>
      <span v-text="'&nbsp;'"/>
      <span v-if="bestiary.senses"><b>Senses </b>{{ bestiary.senses }}</span>

    </p>
    <p v-if="bestiary.aura">
      <b>Aura </b>{{ bestiary.aura }}
    </p>

    <!-- DEFENSE -->
    <q-expansion-item
      style="padding: 0"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="DEFENSE"
    >
      <q-card>
        <q-card-section>
          <b>AC </b>{{ bestiary.ac_raw }} {{ bestiary.ac_mods }}
        </q-card-section>
        <q-card-section>
          <b>hp </b>{{ bestiary.hp }} {{ bestiary.hd }} {{ bestiary.hp_mods }}
        </q-card-section>
        <q-card-section>
          <b>Fort </b>{{ formatBonus(bestiary.fort) }},
          <b>Ref </b>{{ formatBonus(bestiary.ref) }},
          <b>Will </b>{{ formatBonus(bestiary.will) }}
          <span v-if="bestiary.save_mods">; {{ bestiary.save_mods }}</span>
        </q-card-section>
        <q-card-section v-if="bestiary.resist">
          <b>Resist </b>{{ bestiary.resist }}
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- OFFENSE -->
    <q-expansion-item
      style="padding: 0"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="OFFENSE"
    >
      <q-card>
        <q-card-section>
          <b>Spd </b>{{ bestiary.speed }} {{ bestiary.speed_mod }}
        </q-card-section>
        <q-card-section>
          <b>Melee </b>{{ bestiary.melee }}
        </q-card-section>
        <q-card-section v-if="bestiary.ranged">
          <b>Ranged </b>{{ bestiary.ranged }}
        </q-card-section>
        <q-card-section v-if="bestiary.space !== '5 ft.' || bestiary.reach !== '5 ft.'">
          <span v-if="bestiary.space !== '5 ft.'"><b>Space </b>{{ bestiary.space }};</span>
          <span v-if="bestiary.space !== '5 ft.'" v-text="'&nbsp;'"/>
          <span v-if="bestiary.reach !== '5 ft.'"><b>Reach </b>{{ bestiary.reach }}</span>
        </q-card-section>
        <q-card-section v-if="bestiary.specialattacks">
          <b>Special Attacks </b>{{ bestiary.specialattacks }}
        </q-card-section>
        <q-card-section v-if="bestiary.spelllikeabilities">
          <b>Spell Like Abilities </b>{{ bestiary.spelllikeabilities }}
        </q-card-section>
        <q-card-section v-if="bestiary.spellsprepared">
          <b>Spells Prepared </b>{{ bestiary.spellsprepared }}
        </q-card-section>
        <q-card-section v-if="bestiary.spellsknown">
          <b>Spells Known </b>{{ bestiary.spellsknown }}
        </q-card-section>
        <q-card-section v-if="bestiary.spelldomains">
          <b>D</b> domain spell; <b>Domains </b>{{ bestiary.spelldomains }}
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- STATISTICS -->
    <q-expansion-item
      style="padding: 0"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="STATISTICS"
    >
      <q-card>
        <q-card-section>
          <b>Str </b>{{ bestiary.strength_score }},
          <b>Dex </b>{{ bestiary.dexterity_score }},
          <b>Con </b>{{ bestiary.constitution_score }},
          <b>Int </b>{{ bestiary.intelligence_score }},
          <b>Wis </b>{{ bestiary.wisdom_score }},
          <b>Cha </b>{{ bestiary.charisma_score }}
        </q-card-section>
        <q-card-section>
          <b>Base Atk </b>{{ formatBonus(bestiary.baseatk) }};
          <b>CMB </b>{{ formatBonus(bestiary.cmb) }}
          <span v-if="bestiary.cmb_special">{{ `(${bestiary.cmb_special})` }}</span>;
          <b>CMD </b>{{ formatBonus(bestiary.cmd) }}
          <span v-if="bestiary.cmd_special">{{ `(${bestiary.cmd_special})` }}</span>;
        </q-card-section>
        <q-card-section>
          <b>Feats </b>{{ bestiary.feats }}
        </q-card-section>
        <q-card-section>
          <b>Skills </b>{{ bestiary.skills }};
          <span v-if="bestiary.racialmods">
            <b>Racial Modifiers </b>{{ bestiary.racialmods }}</span>
        </q-card-section>
        <q-card-section>
          <b>Languages </b>{{ bestiary.languages }}
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- SPECIAL ABILITIES -->
    <q-expansion-item
      v-if="bestiary.specialabilities"
      style="padding: 0"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="SPECIAL ABILITIES"
    >
      <q-card>
        <q-card-section>
          {{ bestiary.specialabilities }}
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- ECOLOGY -->
    <q-expansion-item
      style="padding: 0"
      expand-separator
      default-opened
      dense
      header-class="bg-primary text-white"
      label="ECOLOGY"
    >
      <q-card>
        <q-card-section>
          <b>Environment </b>{{ bestiary.environment }}
        </q-card-section>
        <q-card-section>
          <b>Organization </b>{{ bestiary.organization }}
        </q-card-section>
        <q-card-section>
          <b>Treasure </b>{{ bestiary.treasure }}
        </q-card-section>
        <q-card-section>
          {{bestiary.description}}
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Full text -->
    <q-expansion-item
      v-if="bestiary.fulltext"
      expand-separator
      dense
      label="Full text"
      header-class="text-caption"
    >
      <q-card>
        <q-card-section>
          <span v-html="bestiary.fulltext"></span>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script setup>
import {
  defineProps,
} from 'vue';

defineProps({
  bestiary: Object,
});

function formatBonus(bonus) {
  let text;
  if (bonus < 0) {
    text = bonus;
  } else {
    text = `+${bonus}`;
  }
  return text;
}

</script>

<style scoped>
.q-card__section--vert {
  padding: .25em 16px
}
</style>
