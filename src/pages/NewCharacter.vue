<template>
  <q-page style="padding: 2.55vmin">
    <q-form
      ref="myForm"
      @submit.prevent.stop="onSubmit"
      @reset.prevent.stop="onReset"
    >
      <q-stepper
        v-model="step"
        ref="stepper"
        contracted
        animated
        header-nav
        style="min-width: 300px; max-width: 8.5in"
      >
        <q-step
          :name="1"
          title="Choose a Name"
          icon="settings"
          :done="step > 1"
          :header-nav="true"
        >
          <q-input filled name="name" v-model="name" label="Name *" />
        </q-step>
        <q-step
          class="q-gutter-md"
          :name="2"
          title="Choose a Class"
          icon="settings"
          :done="step > 2"
          :header-nav="true"
        >
          <ClassSelection
            v-bind:char-class-prop="charClass"
            @char-class-submit="loadCharClass"
            @char-class-id-submit="loadCharClassId"
            @archetype-submit="loadArchetype"
          />


        </q-step>
        <q-step
          class="q-gutter-sm"
          :name="3"
          title="Choose a Heritage & Determine Ability Scores"
          icon="settings"
          :done="step > 3"
          :header-nav="true"
        >
          <q-select
            filled
            name="heritage"
            v-model="heritage"
            :options="heritageNames"
            label="Heritage *"
          />

          <q-list dense>
            <q-item>
              <q-item-section>
                <q-select
                  dense
                  item-aligned
                  v-model="pointBuyChoice"
                  :options="Object.keys(pointBuyOptions)"
                  label="Point Buy"
                />
              </q-item-section>
            </q-item>

            <q-item v-for="(score, name, index) in pointBuy" :key="index">
              <q-item-section style="max-width: 80px">
                <q-badge class="text-capitalize" color="primary">
                  {{ name }}
                </q-badge>
              </q-item-section>
              <q-item-section>
                <q-slider
                  :name="pointBuy[index]"
                  v-model="pointBuy[name]"
                  :min="7"
                  :max="sliderMax[name]"
                  :step="1"
                  :class="`${name.substring(0, 3)}-slider`"
                  :style="cssVars"
                  :markers="1"
                  snap
                  label
                />
              </q-item-section>
              <q-radio
                v-if="heritageRadioToggle"
                style="max-width: 80px"
                :val="name"
                v-model="heritageRadioRef"
              />
              <q-item v-else>{{ heritageBonus[name] }}</q-item>
            </q-item>

            <q-item>
              <q-item-section>
                <q-linear-progress
                  :value="pointsSpent / pointBuyOptions[pointBuyChoice]"
                  :color="pointsSpentColor"
                  readonly
                  :min="-12"
                  :max="pointBuyOptions[pointBuyChoice]"
                />
              </q-item-section>
              <q-item
                >{{ pointsSpent }}/
                {{ pointBuyOptions[pointBuyChoice] }}</q-item
              >
            </q-item>
            <q-list class="row dense justify-center">
              <div v-for="(score, name, index) in abilityScores" :key="index">
                <q-item class="ability">
                  <q-item-section>
                    <q-item-label class="text-capitalize score-title">
                      {{ name.substring(0, 3) }}
                    </q-item-label>
                    <h4>{{ score }}</h4>
                  </q-item-section>
                </q-item>
                <q-item class="ability">
                  <q-item-section>
                    <h6>{{ formatBonus(abilityMods[name]) }}</h6>
                  </q-item-section>
                </q-item>
              </div>
            </q-list>
          </q-list>

          <q-btn
            label="Reset"
            type="reset"
            style="background: rgba(162, 96, 44, 0.25); color: white"
            color="primary"
            class="back flat q-ml-sm"
          />
        </q-step>
        <q-step
          :name="4"
          title="Alignment"
          caption="Optional"
          icon="create_new_folder"
          :done="step > 4"
          :header-nav="true"
        >
          <q-list class="justify-center">
            <q-item class="alignment">
              <q-item-section>
                <q-btn-toggle
                  v-model="alignment"
                  value="LG"
                  label="Lawful Good"
                  :options="[
                    { label: 'Lawful Good', value: 'LG' },
                    { label: 'Neutral Good', value: 'NG' },
                    { label: 'Chaotic Good', value: 'three' },
                  ]"
                />
                <q-btn-toggle
                  v-model="alignment"
                  value="LN"
                  label="Lawful Neutral"
                  :options="[
                    { label: 'Lawful Neutral', value: 'LN' },
                    { label: 'True Neutral', value: 'N' },
                    { label: 'Chaotic Neutral', value: 'CN' },
                  ]"
                />
                <q-btn-toggle
                  v-model="alignment"
                  value="LE"
                  label="Lawful Evil"
                  :options="[
                    { label: 'Lawful Evil', value: 'LE' },
                    { label: 'Neutral Evil', value: 'NE' },
                    { label: 'Chaotic Evil', value: 'CE' },
                  ]"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-step>

        <q-step
          :name="5"
          title="Create an ad group"
          caption="Optional"
          icon="create_new_folder"
          :done="step > 5"
          :header-nav="true"
        >
          <q-toggle v-model="accept" label="I accept these choices" />
        </q-step>
        <template v-slot:navigation>
          <q-stepper-navigation>
            <q-btn
              v-if="step !== 5"
              @click="$refs.stepper.next()"
              color="primary"
              label="Continue"
            />
            <q-btn
              v-if="step === 5"
              @click="$refs.stepper.next()"
              label="Submit"
              type="submit"
              color="primary"
            />
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              @click="$refs.stepper.previous()"
              label="Back"
              class="q-ml-sm"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-form>
    <div class="q-pa-md">
      <q-ajax-bar ref="bar" position="bottom" color="accent" size="10px" />
    </div>
  </q-page>
</template>

<script setup>
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { computed, ref, reactive } from "vue";
import ClassSelection from "src/components/ClassSelection.vue"

const $q = useQuasar();
const step = ref(1);

const name = ref(null);

const charClass = ref('');
const charClassId = ref('');

function loadCharClass(value) {
  charClass.value = value
}
function loadCharClassId(value) {
  charClassId.value = value
}

const archetype = ref('');
function loadArchetype(value) {
  archetype.value = value
}


const heritage = ref(null);

const accept = ref(false);
const myForm = ref(null);

const abilityScoreNames = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];
const pointBuyTable = {
  3: -15,
  4: -12,
  5: -9,
  6: -6,
  7: -4,
  8: -2,
  9: -1,
  10: 0,
  11: 1,
  12: 2,
  13: 3,
  14: 5,
  15: 7,
  16: 10,
  17: 13,
  18: 17,
};
const reversePointBuyTable = {
  "-4": 7,
  "-3": 7,
  "-2": 8,
  "-1": 9,
  0: 10,
  1: 11,
  2: 12,
  3: 13,
  4: 13,
  5: 14,
  6: 14,
  7: 15,
  8: 15,
  9: 15,
  10: 16,
  11: 16,
  12: 16,
  13: 17,
  14: 17,
  15: 17,
  16: 17,
  17: 18,
};

const pointBuyOptions = reactive({
  "Low: 10": 10,
  "Standard Low: 15": 15,
  "Standard High: 20": 20,
  "Epic: 25": 25,
});

const pointBuyChoice = ref("Standard High: 20");
const pointBuy = reactive({
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
});

const pointsSpent = computed(() => {
  let pointSum = 0;
  Object.keys(pointBuy).forEach((key) => {
    pointSum += pointBuyTable[pointBuy[key]];
  });
  return pointSum;
});
const pointsSpentColor = computed(() =>
  pointsSpent.value > pointBuyOptions[pointBuyChoice.value] ? "red" : "brown-10"
);

const alignment = ref("op1");


function loadHeritage() {
  return api
    .get("/heritage")
    .then((response) => response.data)
    .catch(() => {
      $q.notify({
        color: "negative",
        position: "top",
        message: "Loading failed",
        icon: "report_problem",
      });
    });
}

const heritageRef = reactive({});
loadHeritage().then((response) => {
  response.forEach((row) => {
    heritageRef[row.name] = row;
  });
});
const heritageNames = computed(() => {
  const holder = reactive([]);
  const heritageList = Object.keys(heritageRef);
  heritageList.forEach((item) => {
    holder.push(heritageRef[item].name);
  });
  return holder;
});

const heritageRadioRef = ref(null);
const heritageRadioToggle = computed(() =>
  heritageRef[heritage.value] ? heritageRef[heritage.value].choice : false
);
const heritageBonus = computed(() => {
  const holder = reactive({});
  abilityScoreNames.forEach((ability) => {
    holder[ability] = heritageRef[heritage.value]
      ? heritageRef[heritage.value][ability]
      : 0;
  });
  return holder;
});

const abilityScores = computed(() => {
  const holder = reactive({});
  abilityScoreNames.forEach((ability) => {
    holder[ability] =
      heritageBonus.value[ability] +
      pointBuy[ability] +
      (ability === heritageRadioRef.value && heritageRadioToggle.value ? 2 : 0);
  });
  return holder;
});
const abilityMods = computed(() => {
  const holder = reactive({});
  abilityScoreNames.forEach((ability) => {
    holder[ability] = Math.floor(
      (Number(abilityScores.value[ability]) - 10) / 2
    );
  });
  return holder;
});

const sliderMax = computed(() => {
  const holder = reactive({});
  abilityScoreNames.forEach((ability) => {
    holder[ability] =
      reversePointBuyTable[
        pointBuyOptions[pointBuyChoice.value] -
          pointsSpent.value +
          Number(pointBuyTable[pointBuy[ability]])
      ] ?? 18;
  });
  return holder;
});

function pushData() {
  api
    .post("/character", {
      name: name.value,
      class_id: classRef[charClass.value].id,
      strength: abilityScores.value.strength,
      dexterity: abilityScores.value.dexterity,
      constitution: abilityScores.value.constitution,
      intelligence: abilityScores.value.intelligence,
      wisdom: abilityScores.value.wisdom,
      charisma: abilityScores.value.charisma,
      point_buy: pointsSpent.value,
      heritage_id: heritageRef[heritage.value].id,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
}

const cssVars = computed(() => ({
  "--str-width": `${Math.max(0, (sliderMax.value.strength - 7) / 0.11)}%`,
  "--dex-width": `${Math.max(0, (sliderMax.value.dexterity - 7) / 0.11)}%`,
  "--con-width": `${Math.max(0, (sliderMax.value.constitution - 7) / 0.11)}%`,
  "--int-width": `${Math.max(0, (sliderMax.value.intelligence - 7) / 0.11)}%`,
  "--wis-width": `${Math.max(0, (sliderMax.value.wisdom - 7) / 0.11)}%`,
  "--cha-width": `${Math.max(0, (sliderMax.value.charisma - 7) / 0.11)}%`,
}));

function formatBonus(bonus) {
  let text = "";
  if (bonus < 0) {
    text = bonus;
  } else {
    text = `+${bonus}`;
  }
  return text;
}

function onSubmit() {
  if (accept.value === true) {
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: "Submitted",
    });
    pushData();
  } else {
    $q.notify({
      color: "red-5",
      textColor: "white",
      icon: "warning",
      message: "You need to accept the license and terms first",
    });
  }
}

function onReset() {
  myForm.value.resetValidation();
}
</script>

<style lang="scss">
$box: 7em;

.alignment .q-btn {
  width: $box;
  height: $box;
}

.q-btn-group {
  width: 3 * $box;
  box-shadow: none;
  border: $primary;
}

.str-slider {
  width: var(--str-width);
}

.dex-slider {
  width: var(--dex-width);
}

.con-slider {
  width: var(--con-width);
}

.int-slider {
  width: var(--int-width);
}

.wis-slider {
  width: var(--wis-width);
}

.cha-slider {
  width: var(--cha-width);
}

.score-title {
  size: 1rem;
  line-height: 1.75rem;
  letter-spacing: 0.16667em;
  weight: 400;
}

h4,
h6 {
  margin: 0;
  padding: 0;
}

.ability {
  padding: 0 min(17px, 2vw);
}
</style>
