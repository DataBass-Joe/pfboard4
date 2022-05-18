<template>

  <span>
          <q-select
            filled
            name="class"
            v-model="charClass"
            @update:model-value="emit('charClassSubmit', charClass);
            emit('charClassIdSubmit', classRef[charClass].id);"
            :options="classNames"
            label="Class *"
          />
          <q-select
            filled
            name="archetype"
            v-model="archetype"
            @input="emit('archetypeSubmit', archetype)"
            :options="archetypeNames"
            label="Archetype *"
          />
              <q-item v-if="charClass" class="q-pa-md">
            <q-markup-table>
              <thead>
                <tr>
                  <th
                    v-for="(value, key, index) in classRef[charClass]"
                    :key="index"
                    class="text-right"
                  >
                    {{ key }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="text-right">
                  <td
                    v-for="(value, key, index) in classRef[charClass]"
                    :key="index"
                    class="text-right"
                  >
                    {{ value }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-item>
  </span>

</template>

<script setup>
import {
  computed,
  defineEmits,
  defineProps,
  reactive,
  ref,
} from 'vue';
import {
  useQuasar
} from 'quasar';
import {
  api,
} from 'boot/axios';


const $q = useQuasar();
const props = defineProps({
  charClassProp: String,
  archetypeProp: String,
});

const charClass = ref(null)
const archetype = ref(null)

function applyProps() {
  charClass.value = props.charClassProp
  archetype.value = props.archetypeProp
}
applyProps()

const emit = defineEmits(['charClassSubmit', 'charClassIdSubmit', 'archetypeSubmit']);


function loadClass() {
  return api
    .get("/class")
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

const classRef = reactive({});
loadClass().then((response) => {
  response.forEach((row) => {
    classRef[row.name] = row;
  });
});

const classNames = computed(() => {
  const holder = reactive([]);
  const classList = Object.keys(classRef);
  classList.forEach((item) => {
    holder.push(classRef[item].name);
  });
  return holder;
});


const archetypeRef = reactive({});

function loadArchetype() {
  return api
    .get("/archetype")
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

loadArchetype().then((response) => {
  response.forEach((row) => {
    archetypeRef[row.name] = row;
  });
});
const archetypeNames = computed(() => {
  const holder = reactive([]);
  const archetypeList = Object.keys(archetypeRef);
  archetypeList.forEach((item) => {
    if (
      classRef[charClass.value] &&
      archetypeRef[item].class_id === classRef[charClass.value].id
    ) {
      holder.push(archetypeRef[item].name);
    }
  });
  return holder;
});

</script>

<style scoped>

.spells {
  text-indent: 1rem;
  margin: .5vmin;
}

.patron {
  color: #31CCEC;
}

.spell {
  cursor: pointer;
  border-bottom: 2px solid #fff3;
}

.spell:hover {
  border-bottom-color: #fff9;
}

.active {
  border-bottom-color: #fff9;
  font-weight: bold;
}

input[type="checkbox"] {
  /*font: inherit;*/
  color: rgb(125, 125, 255);
  width: 1.15em;
  height: 1.15em;
  font-size: 2em;
  visibility: hidden;
  cursor: pointer;


}

input[type="checkbox"]:before {
  content: "\2606";
  position: absolute;
  visibility: visible;
}

input[type="checkbox"]:checked:before {
  content: "\272E";
  position: absolute;
}

</style>
