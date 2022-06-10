<template>

  <div class="q-pa-md">

    <q-tabs
      v-model="tab"
      class="text-teal"
    >
      <q-tab name="mails" icon="mail" label="Mails"/>
      <q-tab name="alarms" icon="alarm" label="Alarms"/>
      <q-tab name="movies" icon="movie" label="Movies"/>
    </q-tabs>
    <q-btn-dropdown color="primary" label="CHOSE YOUR CHARACTER">
      <q-list>
        <q-item v-for="(character, id) in characterList" :key="id"
                clickable
                v-close-popup
                @click="onCharClick(character.id)">
          <q-item-section>
            <q-item-label>{{ character.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <div v-if="character" id="introduction">

      <div id="name" class="text-capitalize" v-text="character.name"></div>


      <div>
        <span v-if="heritage" id="race" class="text-capitalize" v-text="heritage.name"/>
        <!--        <span v-if="character.charClasses[0].gestalt" v-text="' Gestalt'"/>-->
        <span v-text="'&nbsp;'"/>
        <span v-if="charClasses" id="class" class="text-capitalize">
            {{
            formatList(charClasses
              , ['archetype', 'class_name', 'class_level'])
          }}
          </span>
      </div>

      <div>
        <span id="alignment" v-text="character.alignment"/>
        <span v-text="'&nbsp;'"/>
        <!--        <span id="size" class="text-capitalize">-->
        <!--            {{ character.size }}-->
        <!--          </span>-->
        <span v-text="'&nbsp;'"/>
        <!--        <span id="type">-->
        <!--           {{ character.type }}-->
        <!--          </span>-->
        <!--        <span id="subtype">-->
        <!--            ({{ formatList(character.subtype) }})-->
        <!--          </span>-->

      </div>

      <!--      <div>-->
      <!--        <b>Init </b><span id="initiative" v-text="formatBonus(character.initiative)"></span>-->
      <!--        <b> Senses </b>-->
      <!--        <i id="senses" v-text="formatList(character.senses)"/>-->
      <!--        <span>; Perception {{ formatBonus(character.skills.totalSkills.perception) }}</span>-->

      <!--      </div>-->

      <!--      <div id="aura" v-text="character.aura"></div>-->

    </div>

    <div v-if="charGearList">

      <q-table
        title="Gear"
        :rows="currentCharGear"
        row-key="name"
      />

    </div>


    <q-card class="q-ma-md" style="height: min-content">
      <span v-if="tab === 'mails'">

            <q-card-section>
              <ClassSelection
                v-bind:char-class-prop="charClass"
                @char-class-submit="loadNewCharClass"
                @char-class-id-submit="loadNewCharClassId"
                @archetype-submit="loadNewArchetype"
              />
            </q-card-section>
            <q-card-section>

              <q-input filled
                       name="classLevel"
                       type="number"
                       v-model="newCharLevel"
                       label="How many levels are you taking in this class?"/>
            </q-card-section>




            </span>
      <span v-else-if="tab === 'alarms'">

            <q-card-section>
              <q-input filled
                       name="itemName"
                       type="text"
                       v-model="newItemName"
                       label="*What is the name of this item?"/>
              <q-input filled
                       name="itemSlot"
                       type="text"
                       v-model="newItemSlot"
                       label="*Which slot does this item go in?"/>
              <q-input filled
                       name="itemPrice"
                       type="number"
                       v-model="newItemPrice"
                       label="How much does this item cost?"/>


            </q-card-section>
            <q-card-section v-if="newItemBonusCount !== 0" class="q-gutter-y-lg">
              <div v-for="index in newItemBonusCount"
                    :key="index"
                    class="row q-gutter-x-lg"
              >
              <q-input filled
                       name="bonusType"
                       type="text"
                       v-model="newItemBonuses[index - 1].bonus_type"
                       stack-label
                       label="* What is the bonus type?"/>
              <q-input filled
                       name="bonusAmount"
                       type="number"
                       v-model="newItemBonuses[index - 1].bonus_amount"
                       stack-label
                       label="What is the bonus amount?"/>
              <q-input filled
                       name="bonusTarget"
                       type="text"
                       v-model="newItemBonuses[index - 1].bonus_target"
                       stack-label
                       label="What is the bonus targeting?"/>

                </div>
            </q-card-section>
            <q-card-section>
              <q-btn
                label="Add Bonus"
                rounded
                color="primary"
                @click="newItemBonuses.push({}); newItemBonusCount += 1"/>
              <q-btn
                label="Remove Bonus"
                rounded
                color="primary"
                @click="newItemBonuses.pop(); newItemBonusCount -= 1"/>
            </q-card-section>

      </span>
      <span v-else-if="tab === 'movies'">
            <q-card-section>
              <q-input filled
                       name="itemName"
                       type="text"
                       v-model="newItemName"
                       label="*What is the name of this item?"/>
              <q-input filled
                       name="itemSlot"
                       type="text"
                       v-model="newItemSlot"
                       label="*Which slot does this item go in?"/>
              <q-input filled
                       name="itemPrice"
                       type="number"
                       v-model="newItemPrice"
                       label="How much does this item cost?"/>


            </q-card-section>

      </span>
      <q-card-section>
        <q-toggle v-model="accept" label="I accept these choices"/>
      </q-card-section>
      <q-card-section>
        <q-btn
          @click="onSubmit"
          label="Submit"
          type="submit"
          color="primary"
        />
      </q-card-section>

    </q-card>
    <div class="q-pa-md">
      <q-ajax-bar ref="bar" position="bottom" color="accent" size="10px"/>
    </div>


  </div>

</template>

<script setup>
import {api} from "boot/axios";
import {
  computed, ref, reactive, capitalize,
} from 'vue';
import {useMeta, useQuasar} from 'quasar';
import ClassSelection from "src/components/ClassSelection.vue"

const $q = useQuasar();

const accept = ref(false);

const character = ref()
const heritage = ref()
const charClass = ref()
const charClasses = ref([])

const tab = ref('movies')


const metaData = reactive({
  title: 'Choose a character',
});

const characterList = ref()

const newCharLevel = ref(1)
const newCharClass = ref();
const newCharClassId = ref();
const newArchetype = ref();

function loadNewCharClass(value) {
  newCharClass.value = value
}

function loadNewCharClassId(value) {
  newCharClassId.value = value
}

function loadNewArchetype(value) {
  newArchetype.value = value
}


function getlist(table) {
  return api.get(`/${table}`)
    .then((response) => response.data)
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      });
    });
}

const charGearList = ref()
const currentCharGearList = ref([])
const currentCharGear = ref([])

function getGearList() {
  api.get(`/character_gear?character_id=eq.${character.value.id}`)
    .then((response) => {
      charGearList.value = response.data

      for (const charGearIndex in charGearList.value) {
        api.get(`/gear?id=eq.${charGearList.value[charGearIndex].gear_id}`)
          .then((response) => {
            currentCharGearList.value.push(response.data[0])

            api.get(`/gear_bonus?gear_id=eq.${charGearList.value[charGearIndex].gear_id}`)
              .then((response) => {
                currentCharGearList.value[charGearIndex].bonus = response.data
                for (const responseEntry in response.data) {
                  currentCharGear.value.push({
                    name: currentCharGearList.value[charGearIndex].name,
                    bonus_type: response.data[responseEntry].bonus_type,
                    bonus_amount: response.data[responseEntry].bonus_amount,
                    bonus_target: response.data[responseEntry].bonus_target

                  })
                }
                })
              .catch(() => {
                $q.notify({
                  color: 'negative',
                  position: 'top',
                  message: 'Loading failed',
                  icon: 'report_problem',
                });
              });


          })
          .catch(() => {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: 'Loading failed',
              icon: 'report_problem',
            });
          });
      }
    })
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      });
    });
}

getlist('character')
  .then((response) => {
    characterList.value = response;
  });





function getItem(table, id) {
  return api.get(`/${table}?id=eq.${id}`)
    .then((response) => response.data)
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      });
    });
}

function getGear(name) {
  return api.get(`/gear?name=eq.${encodeURIComponent(name)}`)
    .then((response) => response.data)
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      });
    });
}

function onCharClick(id) {
  getItem('character', id)
    .then((response) => {
      character.value = response[0];

      metaData.title = capitalize(character.value.name)
      useMeta(metaData);
      getGearList();


      api.get(`/character_class?character_id=eq.${character.value.id}`)
        .then((response) => {

          charClasses.value = response.data.reduce((result, item) => {
            const existing = result.find(x => x.class_id === item.class_id);
            if (existing) {
              existing.class_level += item.class_level;
            } else {
              result.push(item);
            }

            return result;
          }, []);


          charClasses.value.forEach((charClass, index) => {
            getItem('class', charClass.class_id)
              .then((response) => {
                charClasses.value[index].class_name = response[0].name;
              });
          })

          console.log(charClasses.value)

        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Loading failed',
            icon: 'report_problem',
          });
        });

      getItem('heritage', character.value.heritage_id)
        .then((response) => {
          heritage.value = response[0];
        });

    });

}


function pushClassData() {
  api
    .post("/character_class", {
      class_id: newCharClassId.value,
      character_id: character.value.id,
      class_level: newCharLevel.value,
    })
    .then((response) => {
      console.log(response);
      onCharClick(character.value.id)
    })
    .catch((error) => {
      console.log(error);
    });
}
function pushItemData() {

  const gearId = ref()

  api
    .post("/gear", {
      name: newItemName.value,
      price: newItemPrice.value,
      slot: newItemSlot.value,
    })
    .then((response) => {
      console.log(response);

      getGear(newItemName.value)
        .then((response) => {

          gearId.value = response[response.length - 1].id

          console.log(gearId.value)


          for (let newItemBonusesKey in newItemBonuses.value) {
            console.log(newItemBonuses.value[newItemBonusesKey])
            api
              .post("/gear_bonus", {
                gear_id: gearId.value,
                bonus_type: newItemBonuses.value[newItemBonusesKey].bonus_type,
                bonus_target: newItemBonuses.value[newItemBonusesKey].bonus_target,
                bonus_amount: newItemBonuses.value[newItemBonusesKey].bonus_amount,
              })
              .then((response) => {
                console.log(response);
              })
              .catch((error) => {
                console.log(error);
              });
          }

          console.log(character.value)
          if (character.value !== undefined) {
            api
              .post("/character_gear", {
                character_id: character.value.id,
                gear_id: gearId.value,
              })
              .then((response) => {
                console.log(response);
                onCharClick(character.value.id)
              })
              .catch((error) => {
                console.log(error);
              });
          }



        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Loading failed',
            icon: 'report_problem',
          });
        });

    })
    .catch((error) => {
      console.log(error);
    });


}

function onSubmit() {
  if (accept.value === true) {
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: "Submitted",
    });
    if (tab.value === 'mails') {
      pushClassData()
    } else if (tab.value === 'alarms') {
      pushItemData()
    }
  } else {
    $q.notify({
      color: "red-5",
      textColor: "white",
      icon: "warning",
      message: "You need to accept the license and terms first",
    });
  }
}

function formatList(myObj, myKeys) {
  let list = '';

  let keys;

  if (arguments.length === 2) {
    keys = myKeys;
  } else {
    keys = Object.keys(myObj);
  }

  if (Array.isArray(myObj)) {
    const arrSize = myObj.length;
    for (let index = 0; index < arrSize; index += 1) {
      if (typeof myObj[index] !== 'undefined') {
        if (typeof myObj[index] === 'object' && myObj[index] !== null) {
          list += formatList(myObj[index], keys);

          if (index !== arrSize - 1) {
            list += ', ';
          }
        } else {
          list += myObj[index];

          if (index !== arrSize - 1) {
            list += ' ';
          }
        }
      }
    }
  } else {
    const size = keys.length;

    for (let index = 0; index < size; index += 1) {
      if (typeof myObj[keys[index]] !== 'undefined') {
        if (typeof myObj[keys[index]] === 'object') {
          list += formatList(myObj[keys[index]]);
          if (index !== size - 1) list += ' ';
        } else {
          list += myObj[keys[index]];
        }
        if (index !== size - 1) list += ' ';
      }
    }
  }
  return list;
}


const newItemName = ref();
const newItemPrice = ref();
const newItemSlot = ref('slotless')

const newItemBonusCount = ref(0)
const newItemBonuses = ref([])


useMeta(metaData);
</script>

<style scoped lang="scss">

.q-card {
  height: min-content;
}

#page {
  //display: flex;
  //flex-direction: row;
  text-shadow: 2px 2px 4px #000000;
  color: white;
  text-align: left;
  align-items: baseline;
  padding: 1vmin;

  background-size: 100vmax;
  background-position: 50% 50%;
  background-attachment: fixed;
  justify-content: space-between;

}

#name {
  font-size: 5vmin;
}

hr {
  width: 100%
}

p {
  margin: .5vmin;
}

.capitalize {
  text-transform: capitalize;
}

#stat-block {

  padding: 1vmin;

  display: flex;
  flex-direction: column;
  min-width: 50vw;
  background: rgba(0, 0, 0, 0.5);

}

#info {

  display: flex;
  flex-direction: column;
  min-width: 30vw;

}

#buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

}

.toggle {

  display: flex;
  background-color: rgba(0, 0, 0, .25);

  margin: 1vmin;
  padding: 1vmin;
  align-items: center;

}

.toggle {
  font-size: unset;
}

@media only screen and (max-width: 1100px) {
  /* For mobile phones: */
  [id*="page"] {
    flex-wrap: wrap;
  }

  [id*="sheet"] {
    width: 100%;
  }

  [id*="info"] {
    width: 100%;
  }
}

span {
  width: clamp(16px, 100%, 50vmin);
}

/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.no-shadow {
  text-shadow: none;
  font-weight: bold;
}

.health {
  background-color: rgba(125, 125, 255, 0.5);
  text-align: center;
}

.plus, .minus {
  align-items: center;
  border-radius: 50%;
  padding: 0.25em 0.8em;
}

.health-input {
  color: white;
  max-width: 7.5vw;
  background-color: rgba(255, 255, 255, 0.50);
  max-height: 7.5vm;
  margin: 1em 0;
}

.parchment {
  box-shadow: 2px 3px 20px black, 0 0 125px #8f5922 inset;
  background: #fffef0 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAFVklEQVR4XpWWB67c2BUFb3g557T/hRo9/WUMZHlgr4Bg8Z4qQgQJlHI4A8SzFVrapvmTF9O7dmYRFZ60YiBhJRCgh1FYhiLAmdvX0CzTOpNE77ME0Zty/nWWzchDtiqrmQDeuv3powQ5ta2eN0FY0InkqDD73lT9c9lEzwUNqgFHs9VQce3TVClFCQrSTfOiYkVJQBmpbq2L6iZavPnAPcoU0dSw0SUTqz/GtrGuXfbyyBniKykOWQWGqwwMA7QiYAxi+IlPdqo+hYHnUt5ZPfnsHJyNiDtnpJyayNBkF6cWoYGAMY92U2hXHF/C1M8uP/ZtYdiuj26UdAdQQSXQErwSOMzt/XWRWAz5GuSBIkwG1H3FabJ2OsUOUhGC6tK4EMtJO0ttC6IBD3kM0ve0tJwMdSfjZo+EEISaeTr9P3wYrGjXqyC1krcKdhMpxEnt5JetoulscpyzhXN5FRpuPHvbeQaKxFAEB6EN+cYN6xD7RYGpXpNndMmZgM5Dcs3YSNFDHUo2LGfZuukSWyUYirJAdYbF3MfqEKmjM+I2EfhA94iG3L7uKrR+GdWD73ydlIB+6hgref1QTlmgmbM3/LeX5GI1Ux1RWpgxpLuZ2+I+IjzZ8wqE4nilvQdkUdfhzI5QDWy+kw5Wgg2pGpeEVeCCA7b85BO3F9DzxB3cdqvBzWcmzbyMiqhzuYqtHRVG2y4x+KOlnyqla8AoWWpuBoYRxzXrfKuILl6SfiWCbjxoZJUaCBj1CjH7GIaDbc9kqBY3W/Rgjda1iqQcOJu2WW+76pZC9QG7M00dffe9hNnseupFL53r8F7YHSwJWUKP2q+k7RdsxyOB11n0xtOvnW4irMMFNV4H0uqwS5ExsmP9AxbDTc9JwgneAT5vTiUSm1E7BSflSt3bfa1tv8Di3R8n3Af7MNWzs49hmauE2wP+ttrq+AsWpFG2awvsuOqbipWHgtuvuaAE+A1Z/7gC9hesnr+7wqCwG8c5yAg3AL1fm8T9AZtp/bbJGwl1pNrE7RuOX7PeMRUERVaPpEs+yqeoSmuOlokqw49pgomjLeh7icHNlG19yjs6XXOMedYm5xH2YxpV2tc0Ro2jJfxC50ApuxGob7lMsxfTbeUv07TyYxpeLucEH1gNd4IKH2LAg5TdVhlCafZvpskfncCfx8pOhJzd76bJWeYFnFciwcYfubRc12Ip/ppIhA1/mSZ/RxjFDrJC5xifFjJpY2Xl5zXdguFqYyTR1zSp1Y9p+tktDYYSNflcxI0iyO4TPBdlRcpeqjK/piF5bklq77VSEaA+z8qmJTFzIWiitbnzR794USKBUaT0NTEsVjZqLaFVqJoPN9ODG70IPbfBHKK+/q/AWR0tJzYHRULOa4MP+W/HfGadZUbfw177G7j/OGbIs8TahLyynl4X4RinF793Oz+BU0saXtUHrVBFT/DnA3ctNPoGbs4hRIjTok8i+algT1lTHi4SxFvONKNrgQFAq2/gFnWMXgwffgYMJpiKYkmW3tTg3ZQ9Jq+f8XN+A5eeUKHWvJWJ2sgJ1Sop+wwhqFVijqWaJhwtD8MNlSBeWNNWTa5Z5kPZw5+LbVT99wqTdx29lMUH4OIG/D86ruKEauBjvH5xy6um/Sfj7ei6UUVk4AIl3MyD4MSSTOFgSwsH/QJWaQ5as7ZcmgBZkzjjU1UrQ74ci1gWBCSGHtuV1H2mhSnO3Wp/3fEV5a+4wz//6qy8JxjZsmxxy5+4w9CDNJY09T072iKG0EnOS0arEYgXqYnXcYHwjTtUNAcMelOd4xpkoqiTYICWFq0JSiPfPDQdnt+4/wuqcXY47QILbgAAAABJRU5ErkJggg==);
}

.fabDrag {
  transition: 0.3s ease;
}


</style>

<style lang="sass" scoped>
.example-fab-animate,
.q-page-sticky:hover .example-fab-animate--hover
  animation: example-fab-animate 0.82s cubic-bezier(.36, .07, .19, .97) both
  transform: translate3d(0, 0, 0)
  backface-visibility: hidden
  perspective: 1000px

@keyframes example-fab-animate
  10%, 90%
    transform: translate3d(-1px, 0, 0)

  20%, 80%
    transform: translate3d(2px, 0, 0)

  30%, 50%, 70%
    transform: translate3d(-4px, 0, 0)

  40%, 60%
    transform: translate3d(4px, 0, 0)
</style>
