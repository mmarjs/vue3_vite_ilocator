<script setup>
import * as d3 from 'd3';
import { ref, onMounted, watch } from 'vue';
import { formatNumber, themeColors } from '../components/charts/localeExtD3.js';
import { BarChart }  from '../components/charts/VerticalBarChart.js';

//
// Functions and 
//

const initDummyData = (actionType) => {  
  let allRanges;
  let step;
  if (actionType === 'kaufen') {
    step = 500000;
    allRanges = d3.range(500000, 10000000, step);
  } else {
    step = 500;
    allRanges = d3.range(500, 10000, step);
  }

  // Random start and end points
  const minRange = allRanges[d3.randomInt(0, 5)()];
  const maxRange = allRanges[d3.randomInt(10, allRanges.length - 1)()];
  // Random range
  const ranges = d3.range(minRange, maxRange, step);
  const budgetStatus = ranges[d3.randomInt(0, ranges.length - 1)()];
  // Generate data
  const data  = [];
  for (let i=0; i<ranges.length; i++) {
    let middle = Math.floor(ranges.length / 2);
    let k = (i < middle) ? i + 1 : ranges.length + 1 - i;
    data.push({
      rangeMin: ranges[i], 
      rangeMax: ranges[i] + step, 
      quantity: d3.randomInt(0, 10)()*k, 
      budgetStatus: (ranges[i] < budgetStatus) ? true : false
    });
  }
  return data
};

const initDummyKpi = (data, actionType) => {
  const totalOffers = d3.sum(data, d => d.quantity);
  const meanPrice = formatNumber(d3.mean(data, d => d.rangeMax));
  const kpi = [];
  if (actionType === 'kaufen') {
    kpi.push(
      { name: 'Medianpreis', value: meanPrice },
      { name: 'Ø Kaufangebote pro Jahr', value: totalOffers  }
    );
    } else {
    kpi.push(
      { name: 'Durchschnittsmiete', value: meanPrice  },
      { name: 'Mietangebote pro Monat', value: totalOffers }
    )
  }
  return kpi
};


//
// Props and refs
//

const props = defineProps({
  gmd: { type: String, default: '' },
  color: { type: String, default: 'primary' },
  query: { type: Object, default: {} },
  cardId: { type: String, default: 'housingPrice' },
  iLocatorsChoice: { type: Boolean, default: false }
});

const borderColor = ref(props.iLocatorsChoice ? `${themeColors[props.color]}50` : '#e0e0e0');
const fillColor = ref(themeColors[props.color]);
const chartData = ref(initDummyData(props.query.actionType));
const kpi = ref(initDummyKpi(chartData.value, props.query.actionType));
const mortgage = ref([
  { name: 'Geschätztes Eigenkapital', amount: formatNumber(d3.randomInt(1000000)()) },
  { name: 'Mögliche Fremdfinanzierung', amount: formatNumber(d3.randomInt(1000000)()) },
]);



//
// Watch
//

watch(props, () => {
  
  chartData.value = initDummyData(props.query.actionType);
  kpi.value = initDummyKpi(chartData.value, props.query.actionType);

  d3.select(`#${props.cardId}Chart`)
    .selectAll('svg > *').remove();

  BarChart(`${props.cardId}Chart`, chartData.value, {
    x: d => d.rangeMin,
    y: d => d.quantity,
    z: d => d.budgetStatus,
    yLabel: 'Anzahl',
    width: 356,
    colors: [themeColors[props.color], '#C4C4C4']
    });



});


//
// onMounted hook
//
onMounted(() => {
  
  BarChart(`${props.cardId}Chart`, chartData.value, {
    x: d => d.rangeMin,
    y: d => d.quantity,
    z: d => d.budgetStatus,
    yLabel: 'Anzahl',
    width: 356,
    colors: [themeColors[props.color], '#C4C4C4']
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
  <div class="d-flex justify-start mb-4">
    <div v-for="item in kpi" class="flex-column mr-8">
      <h5 class="text-h5">{{item.value}}</h5>
      <p class="text-body-1">{{item.name}}</p>
    </div>
  </div>

  <!-- Chart -->
  <h6 class="text-overline">Verteilung der Angebote</h6>
  <svg :id="`${cardId}Chart`"></svg>

  <!-- Chart legend: Rent -->
  <div v-if="props.query.actionType === 'mieten'" class="flex-column mb-4">
    <div class="d-flex align-start">
      <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" height="12" width="12" class="mt-1 mr-2"><circle cx="5" cy="5" r="5" :fill="fillColor"/></svg>
      <p class="text-body-2 mb-1">Mietangebote im Budget</p>
    </div>
  </div>

  <!-- Chart legend: Buy -->
  <div v-if="props.query.actionType === 'kaufen'" class="flex-column mb-4">
    <div class="d-flex align-start">
      <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" height="12" width="12" class="mt-1 mr-2"><circle cx="5" cy="5" r="5" :fill="fillColor"/></svg>
      <p class="text-body-2 mb-1">Anforderungen an Eigenkapital & Tragbarkeit gegeben</p>
    </div>
    <div class="d-flex align-start">
      <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" height="12" width="12" class="mt-1 mr-2"><circle cx="5" cy="5" r="5" fill="#C4C4C4"/></svg>
      <p class="text-body-2 mb-1">Nicht finanzierbar</p>
    </div>
  </div>
  
  <!-- Funding -->
  <div v-if="props.query.actionType === 'kaufen'" class="flex-column">
    <h6 class="text-overline mb-2">Annahmen für finanzierung</h6>
    <div v-for="item in mortgage" class="flex-column">
      <div class="d-flex justify-space-between">
        <p class="text-body-2">{{item.name}}</p>
        <p class="text-body-2">{{item.amount}}</p>
      </div>
    </div>
  </div>
</v-card>


</template>


<style>
.resultCard{
  border: 1px solid;
}
</style>