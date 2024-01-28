<script setup>
import * as d3 from 'd3';
import { ref, computed, onMounted, watch } from 'vue';
import { formatNumber, themeColors } from '../components/charts/localeExtD3.js';
import { HorizontalBarChart }  from '../components/charts/HorizontalBarChart.js';

const props = defineProps({
  gmd: String,
  color: String,
  query: {type: Array, default: []},
  cardId: String,
  iLocatorsChoice: { type: Boolean, default: false }
});



const initDummyData = (persons) => {
  const names = persons.map(e => `${(e.age < 18) ? 'Kind' : 'Erwachsene Person'}, ${e.age} Jahre alt`);
  const amounts = names.map(e => d3.randomInt(1000)());
  amounts.sort((a, b) => { return b - a });
  // Bind arrays into dict
  const data = [];
  for (let i = 0; i < names.length; i++) {
    let d = {name: names[i], amount: amounts[i]};
    data.push(d)
    }
  return data
};

const data = ref(initDummyData(props.query));
const total = ref(formatNumber(d3.sum(data.value, d => d.amount)));
const borderColor = ref(props.iLocatorsChoice ? `${themeColors[props.color]}50` : '#e0e0e0');


watch(props, () => {
  
  data.value = initDummyData(props.query);
  total.value = formatNumber(d3.sum(data.value, d => d.amount));

  d3.select(`#${props.cardId}Chart`)
    .selectAll('svg > *').remove();

  HorizontalBarChart(`${props.cardId}Chart`, data.value, {
    x: d => d.amount,
    y: d => d.name,
    title: d => d.amount,
    titlePrefix: 'CHF',
    width: 356,
    color: themeColors[props.color]
  });
});


onMounted(() => {

  HorizontalBarChart(`${props.cardId}Chart`, data.value, {
    x: d => d.amount,
    y: d => d.name,
    title: d => d.amount,
    titlePrefix: 'CHF',
    width: 356,
    color: themeColors[props.color]
  });

});

</script>


<template>
<v-card elevation="0" variant="outlined" class="resultCard px-8 pt-8 pb-4" :style="`border-color: ${borderColor};`">
  <!-- Card title -->
  <div class="d-flex justify-space-between align-center">
    <h6 class="text-h6">{{gmd}}</h6>
    <v-chip v-if="iLocatorsChoice" :color="color" size="small">
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