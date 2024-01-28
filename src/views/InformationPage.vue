<script setup>
import { ref, computed, watch, unref } from 'vue';
import * as d3 from 'd3';
import hoheitsgebiet from '../assets/swissBOUNDARIES3D_1_3_TLM_HOHEITSGEBIET_10.json';
import GmdAutocomplete from '../components/GmdAutocomplete.vue';
import LocationSuggestions from '../components/LocationSuggestions.vue';
import GmdMap from '../components/GmdMap.vue';


//
// Props
//

const props = defineProps({
  taxesSectionState: Object,
  insuranceSectionState: Object
  });


//
// Gemeinden section
//

// Refs
const gmdNames = ref([...new Set(hoheitsgebiet.features.map(e => e.properties.NAME))]); // Unique gemeinde names
const gmdInput = ref({from: null, to: null});

// Methods
const getGmdAutocompleteFrom = (e) => { gmdInput.value.from = e };
const getGmdAutocompleteTo = (e) => { gmdInput.value.to = e };
const getGmdMap = (e) => { gmdInput.value = e };
const getGmdChip = (e) => { gmdInput.value = e };



//
// Housing section
//

// Refs
const housingInput = ref({ actionType: null, objektType: null, roomsFrom: null, roomsTo: null });
const housingFormRules = ref([e => !!e || 'Diese Feld ist obligatorisch']);

const options = {
  actionType: ['mieten', 'kaufen'],
  objekt: ['Wohnung', 'Haus', 'Wohnung & Haus'],
  rooms: ['1', '2', '3', '4', '5', '6+'],
  religion: ['reformiert', 'christ-katholisch', 'römisch-katholisch', 'andere', 'keine'],
  maritalStatus: ['Ledig', 'Verheiratet', 'Konkubinat', 'Eingetragene Partnerschaft', 'Geschieden', 'Verwitwet'],
  children: ['0', '1', '2', '3', '4', '5+']
  };




//
// Taxes section
//

// Refs
const taxesInput = ref({ status: false, taxableIncomeCantonalTax: null, taxableIncomeFederalTax: null, taxableAssets: null, salueAssets: null, religion: null, maritalStatus: null, childern: null });
const taxesSection = ref(props.taxesSectionState);
const taxesFormRulesSelect = ref([e => !!e || 'Diese Feld ist obligatorisch']);
const taxesFormRulesText = ref([
  e => !!e || 'Diese Feld ist obligatorisch', 
  e => (!!e && !!e.match(/^\d+$/g)) || 'Zahl muss positiv sein'
  ]);

// Methods
const addTaxesSection = () => {
  taxesInput.value.status = true;
  taxesSection.value = { placeholder: false, form: true };
};

const dropTaxesSection = () => {
  taxesInput.value = { status: false, taxableIncomeCantonalTax: null, taxableIncomeFederalTax: null, taxableAssets: null, salueAssets: null, religion: null, maritalStatus: null, childern: null };
  taxesSection.value = { placeholder: true, form: false };
};

// Watchers
watch(() => props.taxesSectionState, () => {
  taxesSection.value = props.taxesSectionState;
});



//
// Insurance section
//

// Refs
const insuranceInput = ref({ status: false, persons: [] });
const insuranceSection = ref(props.insuranceSectionState);

const insuranceFormRules = ref([
  e => !!e || 'Diese Feld ist obligatorisch', 
  e => (!!e && !!e.match(/^\d+$/g)) || 'Zahl muss positiv sein'
  ]);

// Methods
const addInsuranceSection = () => {
  insuranceSection.value = { placeholder: false, form: true };
  const person = { age: null, franchise: null, accident: false, open: true };
  insuranceInput.value.persons.push(person);
  insuranceInput.value.status = true;
};

const dropPersons = () => {
  insuranceInput.value.persons = [];
  insuranceInput.value.status = false;
  insuranceSection.value = { placeholder: true, form: false };
};

const addPerson = () => {
  const person = { age: null, franchise: null, accident: false, open: true };
  insuranceInput.value.persons.push(person);
};

const savePerson = (p) => {
  const index = insuranceInput.value.persons.indexOf(p);
  insuranceInput.value.persons[index].open = false;
};

const dropPerson = (p) => {
  const index = insuranceInput.value.persons.indexOf(p);
  insuranceInput.value.persons.splice(index, 1);
};

// Watchers
watch(() => props.insuranceSectionState, () => {
  insuranceSection.value = props.insuranceSectionState;
  addPerson();
});



//
// Validation
//

// As of May 2022, validation in Vuetify 3 doesn't work as it was expected in the documentation: https://next.vuetifyjs.com/en/components/forms/
// So we implemented a bit different workaround.

// Refs
const gmdFormRef = ref(null);
const housingFormRef = ref(null);
const taxesFormRef = ref(null);
const insuranceFormRef = ref(null);

// Methods
const validateForm = async() => {

  let gmdIsValid = await gmdFormRef.value.validate();
  gmdIsValid = gmdIsValid.valid;

  let housingIsValid = await housingFormRef.value.validate();
  housingIsValid = housingIsValid.valid;

  let taxesIsValid = true;
  if (taxesInput.value.status) {
    taxesIsValid = await taxesFormRef.value.validate();
    taxesIsValid = taxesIsValid.valid;
  }

  let insuranceIsValid = true;
  if (insuranceInput.value.status) {
    insuranceIsValid = await insuranceFormRef.value.validate();
    insuranceIsValid = insuranceIsValid.valid;
  }

  const result = gmdIsValid && housingIsValid && taxesIsValid && insuranceIsValid;
  return result
};


//
// Emit
//

const emit = defineEmits(['formInput']);

const emitFormInput = async(value) => {
  const validation = await validateForm()
  if (validation) {
    emit('formInput', value)
    }
};

const formInput = computed(() => {
  const obj = {
    gmd: gmdInput.value,
    housing: housingInput.value,
    taxes: taxesInput.value,
    insurance: insuranceInput.value
  }
  return obj
});


//
// Random input (for testing)
//

const getRandomInput = () => {

  // Gemeinden
  //console.log(gmdNames.value[d3.randomInt(gmdNames.value.length - 1)()]);
  const gemeinden = {
    from: gmdNames.value[d3.randomInt(gmdNames.value.length - 1)()],
    to: gmdNames.value[d3.randomInt(gmdNames.value.length - 1)()]
    };
  gmdInput.value = gemeinden;

  // Housing
  const housing = { 
    actionType: options.actionType[d3.randomInt(options.actionType.length - 1)()], 
    objektType: options.objekt[d3.randomInt(options.objekt.length - 1)()], 
    roomsFrom: options.rooms[d3.randomInt(options.rooms.length - 1)()], 
    roomsTo: options.rooms[d3.randomInt(options.rooms.length - 1)()]
    };
  housingInput.value = housing;

  // Taxes
  addTaxesSection();
  const taxes = { 
    status: true,
    taxableIncomeCantonalTax: d3.randomInt(1000000)().toString(),
    taxableIncomeFederalTax: d3.randomInt(1000000)().toString(),
    taxableAssets: d3.randomInt(1000000)().toString(),
    salueAssets: d3.randomInt(1000000)().toString(),
    religion: options.religion[d3.randomInt(options.religion.length - 1)()],
    maritalStatus: options.maritalStatus[d3.randomInt(options.maritalStatus.length - 1)()],
    childern: options.children[d3.randomInt(options.children.length - 1)()]
  };
  taxesInput.value = taxes;

  // Insurance
  addInsuranceSection();
  const persons = [];
  for (let i=0; i<d3.randomInt(1, 5)(); i++) {
    persons.push({ 
      age: d3.randomInt(100)().toString(),
      franchise: d3.randomInt(50000)().toString(),
      accident: !!d3.randomInt(0,2)(),
      open: true
      });
  };
  insuranceInput.value.persons = persons;
};

</script>


<template>
<v-container>  
  <!-- Gemeinden section -->
  <h4 class="text-h4 mb-6">Gemeinden vergleichen</h4>
  <v-row class="mb-10">
    <v-col cols="12" xs="12" sm="6" md="4">
      <v-form ref="gmdFormRef" lazy-validation>
      <GmdAutocomplete :input="gmdInput.from" :gmdNames="gmdNames" @gmdAutocomplete="getGmdAutocompleteFrom" label="Gemeinde"></GmdAutocomplete>
      <GmdAutocomplete :input="gmdInput.to" :gmdNames="gmdNames" @gmdAutocomplete="getGmdAutocompleteTo" label="Gemeinde"></GmdAutocomplete>
      </v-form>
      <!-- As of April 2022 v-autocomplete component dosen't work properly. We use the custom autocomplete until next release of Vuetify.
      <v-autocomplete v-model="gmdInput.from" :items="gmdNames" label="Gemeinde"></v-autocomplete>
      <v-autocomplete v-model="gmdInput.to" :items="gmdNames" label="Gemeinde"></v-autocomplete> -->
      <!-- Chips -->
      <LocationSuggestions :gmdNames="gmdNames" @gmdChip="getGmdChip"></LocationSuggestions>
    </v-col>

    <!-- Map -->
    <v-col cols="0" xs="0" sm="6" md="8">
      <GmdMap :gmdInput="gmdInput" @gmdMap="getGmdMap"></GmdMap>
    </v-col>
  </v-row>

  <!-- Housing section -->
  <h4 class="text-h4 mb-6">Wohnen</h4>
  <!-- v-model="housingFormIsValid" -->
  <v-form ref="housingFormRef" lazy-validation>
  <v-row>
    <v-col cols="12" xs="12" sm="6" md="4" align-self="center">
      <p class="text-body-1">Ich möchte ...</p>
      <v-radio-group v-model="housingInput.actionType" :rules="housingFormRules" inline>
        <!-- Can not apply margin for inline radios. Check it in the next vuetify release. -->
        <v-radio label="mieten&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" value="mieten" color="secondary"></v-radio>
        <v-radio label="kaufen" value="kaufen" color="secondary"></v-radio>
      </v-radio-group>
    </v-col>
    <v-col cols="12" xs="12" sm="6" md="4" align-self="center">
      <v-select 
        v-model="housingInput.objektType"
        :items="options.objekt"
        :rules="housingFormRules"
        label="Objekttyp" 
        color="secondary"
      ></v-select>
    </v-col>
    <v-col cols="12" xs="12" sm="6" md="2" align-self="center">
      <v-select v-model="housingInput.roomsFrom" :items="options.rooms" label="Zimmer von" color="secondary"></v-select>
    </v-col>
    <v-col cols="12" xs="12" sm="6" md="2" align-self="center">
      <v-select v-model="housingInput.roomsTo" :items="options.rooms" label="Zimmer bis" color="secondary"></v-select>
    </v-col>
  </v-row>
  </v-form>

  <!-- Taxes section -->
  <h4 class="text-h4 mb-6">Steuern</h4>
  <v-expand-transition>
    <v-form ref="taxesFormRef" lazy-validation>
    <v-row v-show="taxesSection.form">
      <v-col cols="12" xs="12" sm="6" md="4">
        <v-text-field v-model="taxesInput.taxableIncomeCantonalTax" :rules="taxesFormRulesText" prefix="CHF" label="Steuerbares Einkommen Kanton" color="secondary" required></v-text-field>
      </v-col>
      <v-col cols="12" xs="12" sm="6" md="4">
        <v-text-field v-model="taxesInput.taxableIncomeFederalTax" :rules="taxesFormRulesText" prefix="CHF" label="Steuerbares Einkommen Bund" color="secondary" required></v-text-field>
      </v-col>
      <v-col cols="12" xs="12" sm="6" md="4">
        <v-text-field v-model="taxesInput.taxableAssets" :rules="taxesFormRulesText" prefix="CHF" label="Steuerbares Vermögen" color="secondary" required></v-text-field>
      </v-col>
      <v-col cols="12" xs="12" sm="6" md="4">
        <v-text-field v-model="taxesInput.salueAssets" :rules="taxesFormRulesText" prefix="CHF" label="Salue 3a Vermögen" color="secondary" required></v-text-field>
      </v-col>
      <v-col cols="12" xs="12" sm="6" md="4">
        <v-select v-model="taxesInput.religion" :items="options.religion" :rules="taxesFormRulesSelect" label="Konfession" color="secondary" required></v-select>
      </v-col>
      <v-col cols="12" xs="12" sm="6" md="4">
        <v-select v-model="taxesInput.maritalStatus" :items="options.maritalStatus" :rules="taxesFormRulesSelect" label="Zivilstand" color="secondary" required></v-select>
      </v-col>
      <v-col cols="12" xs="12" sm="6" md="4">
        <v-select v-model="taxesInput.childern" :items="options.children" :rules="taxesFormRulesSelect" label="Anzahl Kinder" color="secondary" required></v-select>
      </v-col>
      <v-col cols="12">
        <div class="d-flex justify-end">
          <v-btn variant="text" @click="dropTaxesSection" color="primary">
            <v-icon start icon="mdi-minus" color="primary"></v-icon>
            Entfernen
          </v-btn>
        </div>
      </v-col>
    </v-row>
    </v-form>
  </v-expand-transition>
  
  <!-- Placeholder for Taxes section -->
  <v-expand-transition>
    <div v-show="taxesSection.placeholder">
      <div class="d-flex justify-space-between align-center mb-10">
          <p class="text-body-1">Jetzt direkt die Steuern vergleichen...</p>
          <v-btn variant="text" @click="addTaxesSection" color="primary">
            <v-icon start icon="mdi-plus" color="primary"></v-icon>
            Hinzufügen
          </v-btn>
      </div>
    </div>
  </v-expand-transition>

  <!-- Health insurance section -->
  <h4 class="text-h4 mb-6">Krankenkasse</h4>
  <v-expand-transition>
    <!-- Card body -->
    <v-form ref="insuranceFormRef" lazy-validation>
    <v-row v-show="insuranceSection.form" class="mb-10">
      <v-col v-for="item in insuranceInput.persons" cols="12" xs="12" sm="6" md="4">
        <!-- Card header -->
        <div class="d-flex justify-space-between align-center" @click="item.open = !item.open" style="cursor: pointer;">
          <div cols="auto" align-self="center">
            <span class="text-body-1">{{(item.age === null) ? 'Person' : (item.age < 18) ? 'Kind' : 'Erwachsene Person'}}</span><br/>
            <span class="text-body-2">{{(item.age === null) ? 'Alter' : `${item.age} Jahr`}}</span>
          </div>
          <div cols="auto" align-self="center">
            <v-icon :icon="item.open ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
          </div>
        </div>
        <v-divider style="margin: 10px 0px 10px 0px;"></v-divider>
        <!-- Card expand -->
        <v-expand-transition>
          <div v-show="item.open">
            <div class="flex-column">
              <v-text-field v-model="item.age" :rules="insuranceFormRules" label="Alter" color="secondary"></v-text-field>
              <v-text-field v-model="item.franchise" :rules="insuranceFormRules" prefix="CHF" label="Gewünschte Franchise" color="secondary"></v-text-field>
              <v-switch v-model="item.accident" label="Unfalldeckung" color="secondary" hide-details></v-switch>
              <div class="d-flex justify-end">
                <v-btn @click="savePerson(item)" variant="text" color="primary">
                  Save
                </v-btn>
                <v-btn @click="dropPerson(item)" variant="text" color="primary">
                  Ablegen
                </v-btn>
              </div>
            </div>
          </div>
        </v-expand-transition>
      </v-col>

      <!-- Section buttons -->
      <v-col cols="12">
        <div class="d-flex justify-end">
          <v-btn variant="outlined" @click="addPerson" color="primary" class="ma-1">
            <v-icon icon="mdi-plus" color="primary"></v-icon>
            Person Hinzufügen
          </v-btn>
          <v-btn variant="text" @click="dropPersons" color="primary" class="ma-1">
            <v-icon start icon="mdi-minus" color="primary"></v-icon>
            Alle Löschen
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-form>
  </v-expand-transition>

  <!-- Placeholder for Health insurance section -->
  <v-expand-transition>
    <div v-show="insuranceSection.placeholder">
      <div class="d-flex justify-space-between align-center mb-10">
          <p class="text-body-1">Jetzt direkt die Krankenkassenprämien vergleichen...</p>
          <v-btn variant="text" @click="addInsuranceSection" color="primary">
            <v-icon start icon="mdi-plus" color="primary"></v-icon>
            Hinzufügen
          </v-btn>
      </div>
    </div>
  </v-expand-transition>

  <!-- Submit button -->
  <div class="d-flex justify-end mb-10">
    
    <v-btn variant="outlined" @click="getRandomInput" color="primary" class="ma-1">
      Random input
    </v-btn>
    
    <v-btn @click="emitFormInput(formInput)" color="primary" class="ma-1">
      Resultate anzeigen
    </v-btn>
  </div>

</v-container>

</template>

