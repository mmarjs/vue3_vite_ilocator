<script setup>
import { ref, watch } from 'vue';

//
// Refs, props and emits
//

const props = defineProps({
    label: String,
    input: String,
    gmdNames: Array
    });

const emit = defineEmits(['gmdAutocomplete']);
const emitValue = (value) => {emit('gmdAutocomplete', value)};

const input = ref(props.input);
const options = ref([]);
const menuState = ref(false);
const optionsValidation = ref({
  noInput: true,
  notFound: false
});
const rules = ref([
  e => !!e || 'Required',
  e => props.gmdNames.includes(e) || 'Select from list'
  ]);


//
// Methods
//

function getOptions(term, allOptions) {
  let options;
  if (['', null].includes(term)) { 
    options = [];
    }
  else {
    options = allOptions.filter(e => e.toLowerCase().includes(term.toLowerCase()));
    options = options.slice(0,10);
    }
  return options
}


const selectItem = (item) => {
  input.value = item;
  menuState.value = false;
};



//
// Watch
//

watch(props, () => {
  input.value = props.input;
})

watch(input, () => {
  // Options
  options.value = getOptions(input.value, props.gmdNames);
  // Validation
  if (options.value.length && input.value) {
    optionsValidation.value.noInput = false;
    optionsValidation.value.notFound = false;
  } else if (!(options.value.length) && input.value) {
    optionsValidation.value.notFound = true;
  } else {
    optionsValidation.value.noInput = true;
  }
  // Emit
  if (options.value.includes(input.value)) {
    emitValue(input.value)
  }
});

</script>


<template>
<v-text-field v-model="input" :label="label" :rules="rules" color="secondary">
  <v-menu v-model="menuState" activator="parent">
    <v-card>
      <v-list density="compact">
        <!-- Validation -->
        <v-list-item v-if="optionsValidation.noInput">
          <v-list-item-title>Start typing...</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="optionsValidation.notFound">
          <v-list-item-title>Not found</v-list-item-title>
        </v-list-item>
        <!-- Options -->
        <v-list-item @click="selectItem(i)" v-for="i in options" :key="i" :value="i" active-color="secondary">
          <v-list-item-title v-text="i"></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</v-text-field>
</template>