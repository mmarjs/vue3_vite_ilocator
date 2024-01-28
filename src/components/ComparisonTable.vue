<script setup>
import { ref, watch } from 'vue';
import * as d3 from 'd3';
import { formatPrice, themeColors } from '../components/charts/localeExtD3.js';

//
// Props
//

const props = defineProps({
  gmdQuery: { type: Object, default: {} },
  housingQuery: { type: Object, default: {} },
  taxesQuery: { type: Object, default: {} },
  insuranceQuery: { type: Object, default: {} },
});


//
// Functions
//

const initDummyFixkosten = () => {

  const fixkosten = [];
  
  if (props.housingQuery.actionType === 'mieten') {
    let d = {
      title: 'Wohnen', 
      icon: 'mdi-domain', 
      fromValue: d3.randomInt(500, 10000)(), 
      toValue: d3.randomInt(500, 10000)(), 
      fromSaved: '2', 
      toSaved: null 
    };
    fixkosten.push(d);
  }

  if (props.taxesQuery.status) {
    let d = { 
      title: 'Steuern', 
      icon: 'mdi-bank', 
      fromValue: d3.randomInt(500, 10000)(), 
      toValue: d3.randomInt(500, 10000)(), 
      fromSaved: '10', 
      toSaved: null
    }
    fixkosten.push(d);
  }

  if (props.insuranceQuery.status) {
    let d = { 
      title: 'Krankenkasse', 
      icon: 'mdi-hospital-box-outline', 
      fromValue: d3.randomInt(500, 10000)(),
      toValue: d3.randomInt(500, 10000)(), 
      fromSaved: '3', 
      toSaved: null 
      };
    fixkosten.push(d);
  }

  if (fixkosten.length > 1) {
    let d = { 
      title: 'Total', 
      icon: 'mdi-wallet-outline', 
      fromValue: d3.sum(fixkosten, d => d.fromValue), 
      toValue: d3.sum(fixkosten, d => d.toValue), 
      fromSaved: null, 
      toSaved: '4'
    };
    fixkosten.push(d);
  }
  return fixkosten

};


const fixkosten = ref(initDummyFixkosten());


watch(props, () => {
  fixkosten.value = initDummyFixkosten();
})



const costsType = ref('yearly');
const tableData = ref({
  yearly: [
    { title: 'Wohnen', icon: 'mdi-domain', fromValue: '10', toValue: '200', fromSaved: null, toSaved: '2' },
    { title: 'Steuern', icon: 'mdi-bank', fromValue: '3\'000', toValue: '40\'000', fromSaved: '10', toSaved: null },
    { title: 'Krankenkasse', icon: 'mdi-hospital-box-outline', fromValue: '500\'000', toValue: '6\'000', fromSaved: '3', toSaved: null },
    { title: 'Total', icon: 'mdi-wallet-outline', fromValue: '700\'000', toValue: '8\'000', fromSaved: null, toSaved: '4' }
    ],
  monthly: [
    { title: 'Wohnen', icon: 'mdi-domain', fromValue: '1\'000', toValue: '20\'000', fromSaved: '2', toSaved: null },
    { title: 'Steuern', icon: 'mdi-bank', fromValue: '300\'000', toValue: '40\'000', fromSaved: null, toSaved: '10' },
    { title: 'Krankenkasse', icon: 'mdi-hospital-box-outline', fromValue: '50\'000', toValue: '6\'000', fromSaved: null, toSaved: '3' },
    { title: 'Total', icon: 'mdi-wallet-outline', fromValue: '700', toValue: '80', fromSaved: '4', toSaved: null }
  ]
});


const test = ref(false);

//taxesQuery.status && insuranceQuery.status
</script>

<template>

<v-card class="pa-8">

  <h6 v-show="housingQuery.actionType==='kaufen'" class="text-overline mb-4">iLocator’s Choice Wohnen</h6>
  <h6 v-show="housingQuery.actionType==='mieten'" class="text-overline mb-4">iLocator’s Choice</h6>
  <h6 v-show="housingQuery.actionType==='kaufen'" class="text-overline mb-4">iLocator’s Choice Fixkosten</h6>

  <!--
    Desktop table: Fixkosten
  -->

  <div id="desktop-table" class="mb-4">
    <!-- Header -->
    <v-row class="table-row text-h6" no-gutters>
      <v-col cols="4">
        <span></span>
      </v-col>
      <v-col cols="4">
        <span>{{gmdQuery.from}}</span>
      </v-col>
      <v-col cols="4">
        <span>{{gmdQuery.to}}</span>
      </v-col>
    </v-row>
    <!-- Table-->
    <v-row v-for="item in tableData.yearly" class="table-row py-1 text-h6 font-weight-regular" no-gutters>
      <v-col cols="4">
        <div class="d-flex justify-end align-center mr-6">
          <span class="mr-2">{{item.title}}</span>
          <v-icon size="x-small">{{item.icon}}</v-icon>
        </div>
      </v-col>
      <v-col cols="4" class="d-inline">
        <div class="d-flex justify-start align-center">
          <span>{{item.fromValue}}</span>
          <v-chip v-show="item.toSaved !== null" size="x-small" variant="outlined" color="#8a8a8a" class="ml-2" label>{{item.toSaved}}% günstiger</v-chip>
        </div>
      </v-col>
      <v-col cols="4">
        <div class="d-flex justify-start align-center">
          <span>{{item.toValue}}</span>
          <v-chip v-show="item.fromSaved !== null" size="x-small" variant="outlined" color="#8a8a8a" class="ml-2" label>{{item.fromSaved}}% günstiger</v-chip>
        </div>
      </v-col>
    </v-row>
  </div>


  <!--
    Mobile table: Fixkosten
  -->

  <div id="mobile-table" class="mb-6">
    <!-- Header 1 -->
    <v-row class="table-row text-h6" no-gutters>
      <v-col cols="12">
        <div class="d-flex justify-center"><span>{{gmdQuery.from}}</span></div>
      </v-col>
    </v-row>
    <!-- Rows 1 -->
    <v-row v-for="item in tableData.yearly" class="table-row py-1 text-h6 font-weight-regular" no-gutters>
      <v-col cols="7">
        <div class="d-flex justify-end align-center mr-6">
          <span class="mr-2">{{item.title}}</span>
          <v-icon size="x-small">{{item.icon}}</v-icon>
        </div>
      </v-col>
      <v-col cols="5">
        <span>{{item.fromValue}}</span>
      </v-col>
     </v-row>
    <!-- Header 2 -->
    <v-row class="table-row text-h6 mt-8" no-gutters>
      <v-col cols="12">
        <div class="d-flex justify-center"><span>{{gmdQuery.to}}</span></div>
      </v-col>
    </v-row>
    <!-- Rows 2 -->
    <v-row v-for="item in tableData.yearly" class="table-row py-1 text-h6 font-weight-regular" no-gutters>
      <v-col cols="7">
        <div class="d-flex justify-end align-center mr-6">
          <span class="mr-2">{{item.title}}</span>
          <v-icon size="x-small">{{item.icon}}</v-icon>
        </div>
      </v-col>
      <v-col cols="5">
        <span>{{item.toValue}}</span>
      </v-col>
    </v-row>
  </div>



  <!-- Bottom controls -->
  <div class="d-flex flex-column flex-md-row justify-space-between align-center mx-6">
    <p class="text-body-2 muted-text">Alle Angaben ohne Gewähr.</p>
    <div class="small-radio">
      <v-radio-group v-model="costsType" hide-details="true" density="compact" inline>
        <v-radio label="Jährliche" value="yearly" color="secondary"></v-radio>
        <v-radio label="Monatliche Kosten" value="monthly" color="secondary"></v-radio>
      </v-radio-group>
    </div>
  </div>


  <div v-show="!taxesQuery.status || !insuranceQuery.status">
    <div class="d-flex flex-column flex-md-row justify-space-between align-center mx-6 mt-6">
      <p class="text-body-2 muted-text">Da die Angaben zu Steuern und Krankenkasse fehlen, können keine weiteren Auswertungen gemacht werden.</p>
      <v-btn variant="text" color="primary">
        <v-icon start icon="mdi-plus" color="primary"></v-icon>
        Info Hinzufügen
      </v-btn>
    </div>
  </div>

</v-card>

</template>

<style>
.small-radio {
  font-size: 0.875rem;
}

.small-radio .v-label {
  font-size: 0.875rem;
}

.muted-text {
  color: #8a8a8a;
}


.table-row {
  border-bottom: 1px solid #e0e0e0;
}


@media only screen and (min-width: 0px) and (max-width: 600px) {
  #mobile-table {
    display: block;
  }
  
  #desktop-table {
    display: none;
  }
}

@media only screen and (min-width: 600px) {
  #mobile-table {
    display: none;
  }
  
  #desktop-table {
    display: block;
  }
}

</style>