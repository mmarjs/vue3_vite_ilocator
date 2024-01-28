<script setup>
import * as d3 from 'd3';
import { ref, watch } from 'vue';
import AdditionalInfo from '../components/AdditionalInfo.vue';
import ComparisonTable from '../components/ComparisonTable.vue';
import HousingPriceCard from '../components/HousingPriceCard.vue';
import HousingVacancyCard from '../components/HousingVacancyCard.vue';
import TaxesCard  from '../components/TaxesCard.vue';
import HealthInsuranceCard  from '../components/HealthInsuranceCard.vue';

const props = defineProps({
  gmdQuery: Object,
  housingQuery: Object,
  taxesQuery: Object,
  insuranceQuery: Object,
  });



//
// Taxes 
//

const taxesQueryUrl = ref('')
const taxesData = ref({})

async function fetchTaxesData() {
  if (props.taxesQuery.status) {
    taxesQueryUrl.value = `https://ilocator-tax.herokuapp.com/v1.0/tax/calculate?gmd=${props.gmdQuery.from},${props.gmdQuery.to}&taxable_income_cantonal_tax=${props.taxesQuery.taxableIncomeCantonalTax}&taxable_income_federal_tax=${props.taxesQuery.taxableIncomeFederalTax}&taxable_assets=${props.taxesQuery.taxableAssets}&salue_assets=${props.taxesQuery.salueAssets}&religion=${props.taxesQuery.religion}&marital_status=${props.taxesQuery.maritalStatus}&childern=${props.taxesQuery.childern}`
    const resp = await fetch(taxesQueryUrl.value)
    const respJson = await resp.json()
    // Calculate iLocators choice
    respJson[props.gmdQuery.from].iLocatorsChoice = respJson[props.gmdQuery.from].tax_total < respJson[props.gmdQuery.to].tax_total ? true : false
    respJson[props.gmdQuery.to].iLocatorsChoice = respJson[props.gmdQuery.from].tax_total > respJson[props.gmdQuery.to].tax_total ? true : false
    // Calculate saved for comparison table
    respJson[props.gmdQuery.from].saved = respJson[props.gmdQuery.from].iLocatorsChoice ? d3.format('.1%')((respJson[props.gmdQuery.to].tax_total - respJson[props.gmdQuery.from].tax_total) / respJson[props.gmdQuery.to].tax_total) : null
    respJson[props.gmdQuery.to].saved = respJson[props.gmdQuery.to].iLocatorsChoice ? d3.format('.1%')((respJson[props.gmdQuery.from].tax_total - respJson[props.gmdQuery.to].tax_total) / respJson[props.gmdQuery.from].tax_total) : null
    taxesData.value = respJson;
  }
}

watch([() => props.taxesQuery, () => props.gmdQuery], fetchTaxesData)


//
// Health insurance data
//





</script>


<template>

<!--
Other options for the cover. All from here: https://unsplash.com/@surface
https://images.unsplash.com/photo-1640622303392-7d2bee0c2438
https://images.unsplash.com/photo-1612831455546-a87cb4d6b276
https://images.unsplash.com/photo-1648737963540-306235c8170e
https://images.unsplash.com/photo-1648737965402-2b9c3f3eaa6f
https://images.unsplash.com/photo-1648737963080-109bbf325c90
https://images.unsplash.com/photo-1612831197310-ff5cf7a211b6
https://images.unsplash.com/photo-1612831659958-904f75bfa43f
https://images.unsplash.com/photo-1633113216120-53ca0a7be5bc
-->

<v-container>
  <v-row style="background-image: url('https://images.unsplash.com/photo-1640622303392-7d2bee0c2438?auto=format&fit=crop&w=940');">
    <v-col cols="12" offset="0" sm="12" offset-sm="0" md="10" offset-md="1" class="mt-16 mb-4">
      <h5 class="text-h5 main-title">iLocator-Vergleich:</h5>
      <h3 class="text-h3 main-title">{{gmdQuery.from}} &<br/>{{gmdQuery.to}}</h3>
    </v-col>
    <v-col cols="12" offset="0" sm="12" offset-sm="0" md="10" offset-md="1" class="mb-10">
      <ComparisonTable 
        :gmdQuery="gmdQuery"
        :housingQuery="housingQuery"
        :taxesQuery="taxesQuery"
        :insuranceQuery="insuranceQuery"
      >
      </ComparisonTable>
    </v-col>
  </v-row>
  
  <!-- Housing section -->
  <h4 class="text-h4 mb-4">Wohnen</h4>
  <v-row class="mb-6">
    <v-col cols="12" xs="12" sm="12" md="6" >
      <HousingPriceCard
        :gmd="gmdQuery.from"
        :query="housingQuery"
        :color="'secondary'"
        :cardId="'housingPriceFrom'"
        :iLocatorsChoice="true"
      ></HousingPriceCard>
    </v-col>
    <v-col cols="12" xs="12" sm="12" md="6">
      <HousingPriceCard
        :gmd="gmdQuery.to"
        :query="housingQuery"
        :color="'accent'"
        :cardId="'housingPriceTo'"
        :iLocatorsChoice="false"
      ></HousingPriceCard>
    </v-col>
    <v-col cols="12" xs="12" sm="12" md="6" >
      <HousingVacancyCard
        :gmd="gmdQuery.from"
        :query="housingQuery"
        :color="'secondary'"
        :cardId="'housingVacancyFrom'"
        :iLocatorsChoice="false"
      ></HousingVacancyCard>
    </v-col>
    <v-col cols="12" xs="12" sm="12" md="6">
      <HousingVacancyCard
        :gmd="gmdQuery.to"
        :query="housingQuery"
        :color="'accent'"
        :cardId="'housingVacancyTo'"
        :iLocatorsChoice="true"
      ></HousingVacancyCard>
    </v-col>
  </v-row>

  <!-- Taxes section   -->
  <h4 class="text-h4 mb-6">Steuern</h4>
  <v-row v-show="taxesQuery.status" class="mb-6">
    <v-col xs="12" sm="12" md="6">
      <TaxesCard
        :gmd="gmdQuery.from"
        :color="'secondary'"
        :data="taxesData[props.gmdQuery.from]"
        :cardId="'taxesFrom'"
      ></TaxesCard>
    </v-col>
    <v-col xs="12" sm="12" md="6">
      <TaxesCard
        :gmd="gmdQuery.to"
        :color="'accent'"
        :data="taxesData[props.gmdQuery.to]"
        :cardId="'taxesTo'"
      ></TaxesCard>
    </v-col>
  </v-row>


  <div v-show="!taxesQuery.status">
    <div class="d-flex justify-space-between align-center mb-10">
      <p class="text-body-1">Jetzt direkt die Steuern vergleichen...</p>
      <v-btn @click="$emit('backTo', 'taxesSection')" variant="text" color="primary">
        <v-icon start icon="mdi-plus" color="primary"></v-icon>
        Hinzufügen
      </v-btn>
    </div>
  </div>

  <!-- Health insurance section -->
  <h4 class="text-h4 mb-6">Krankenkasse</h4>
  <v-row v-show="insuranceQuery.status">
    <v-col xs="12" sm="12" md="6">
      <HealthInsuranceCard 
        :gmd="gmdQuery.from"
        :query="insuranceQuery.persons"
        :color="'secondary'"
        :cardId="'healthInsuranceFrom'"
        :iLocatorsChoice="false"
      ></HealthInsuranceCard>
    </v-col>
    <v-col xs="12" sm="12" md="6">
      <HealthInsuranceCard 
        :gmd="gmdQuery.to"
        :query="insuranceQuery.persons"
        :color="'accent'"
        :cardId="'healthInsuranceTo'"
        :iLocatorsChoice="true"
      ></HealthInsuranceCard>
    </v-col>
  </v-row>
  

  <div v-show="!insuranceQuery.status">
    <div class="d-flex justify-space-between align-center mb-10">
      <p class="text-body-1">Jetzt direkt die Krankenkassenprämien vergleichen...</p>
      <v-btn @click="$emit('backTo', 'insuranceSection')" variant="text" color="primary">
        <v-icon start icon="mdi-plus" color="primary"></v-icon>
        Hinzufügen
      </v-btn>
    </div>
  </div>
  
  <!-- Additional information pannel -->
  <v-row class="my-10">
    <v-col cols="12">
      <AdditionalInfo></AdditionalInfo>
    </v-col>
  </v-row>
</v-container>
</template>


<style>
.main-title {
  color: #FFFFFF;
  text-shadow: 1px 1px 4px #00000050;
}

.text-h3.main-title {
  font-weight: 700;
  line-height: 1.3em;
}
</style>