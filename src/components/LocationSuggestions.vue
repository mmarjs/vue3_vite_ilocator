<script setup>
import { ref } from 'vue';

//
// Functions
//

function getRandomSample(n, array) {
  // Select random sample https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  const randIndexes = Array(n).fill(array.length-1).map(max => Math.floor(Math.random() * max));
  const sample = randIndexes.map(i => array[i]);
  // Create pairs
  const pairs = [];
  for (let i = 0; i < n; i++) {
    if (i % 2 == 0) {
      let pair = {from: sample[i], to: sample[i+1]};
      pairs.push(pair);
    }
  }
  return pairs
}


//
// Props and emits
//

const props = defineProps({gmdNames: Array});
const randomSample = ref(getRandomSample(10, props.gmdNames));
const emit = defineEmits(['gmdChip']);
const emitValue = (value) => {emit('gmdChip', value)};

</script>


<template>
<v-row>
  <v-col cols="12">
    <p class="text-body-1">Beliebte Vergleiche</p>
  </v-col>
</v-row>
<v-row style="padding: 0.3em;">
  <div v-for="item in randomSample" class="ma-1">
    <v-chip :ripple="true" @click="emitValue(item)">
    {{item.from}}<v-icon>mdi-chevron-right</v-icon>{{item.to}}
    </v-chip>
  </div>
</v-row>
</template>