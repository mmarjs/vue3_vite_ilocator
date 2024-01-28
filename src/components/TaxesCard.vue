<script setup>
import * as d3 from 'd3';
import { ref, computed, onMounted, watch, onBeforeMount } from 'vue';
import { formatNumber, themeColors } from '../components/charts/localeExtD3.js';
import { HorizontalBarChart }  from '../components/charts/HorizontalBarChart.js';

const props = defineProps({
  gmd: {type: String, default: ''},
  color: {type: String, default: 'secondary'},
  data: {type: Object, default: {iLocatorsChoice: false, tax_total: 0, tax_breakdown: []}},
  cardId: {type: String, default: ''}
});

const borderColor = ref(props.data.iLocatorsChoice ? `${themeColors[props.color]}50` : '#e0e0e0');
const total = ref(formatNumber(props.data.tax_total));

const translate = (arr) => {
  const translations = {
    tax_federal: 'Bundessteuer', 
    tax_canton: 'Kantonssteuer',
    tax_gmd: 'Gemeindesteuer',
    tax_church: 'Kirchensteuer',
    tax_personal: 'Personalsteuer'
  }
  for (let i = 0; i < arr.length; i++) {
    arr[i].name = translations[arr[i].id];
  }
  return arr
};

watch(() => props.data, () => {
  total.value = formatNumber(props.data.tax_total);
  borderColor.value = props.data.iLocatorsChoice ? `${themeColors[props.color]}50` : '#e0e0e0';
  
  d3.select(`#${props.cardId}Chart`)
    .selectAll('svg > *').remove();
  
  HorizontalBarChart(`${props.cardId}Chart`, translate(props.data.tax_breakdown), {
    x: d => d.amount,
    y: d => d.name,
    title: d => d.amount,
    titlePrefix: 'CHF',
    width: 356,
    color: themeColors[props.color]
  })
});

</script>


<template>
<v-card elevation="0" variant="outlined" class="resultCard px-8 pt-8 pb-4" :style="`border-color: ${borderColor};`">
  <!-- Card title -->
  <div class="d-flex justify-space-between align-center">
    <h6 class="text-h6">{{gmd}}</h6>
    <v-chip v-if="data.iLocatorsChoice" :color="color" size="small">
      <v-icon size="small" class="mr-1">mdi-check-circle</v-icon>
      iLocator’s Choice
    </v-chip>
  </div>

  <!--Devider -->
  <v-divider class="my-3" :style="`border-color: ${borderColor};`"></v-divider>

  <!-- Card KPI -->
  <div class="flex-column mb-4">
    <h5 class="text-h5">{{total}}</h5>
    <p class="text-body-1">Gesamte Steuerbelastung</p>
  </div>

  <!-- Chart -->
  <h6 class="text-overline">Übersicht nach haushaltsmitglied</h6>
  <svg :id="`${cardId}Chart`"></svg>
</v-card>
</template>


<style>
.resultCard{
  border: 1px solid;
}
</style>

