<script setup>
import * as d3 from 'd3';
import { ref, computed, onMounted, watch } from 'vue';
import { formatNumber, themeColors } from '../components/charts/localeExtD3.js';
import { LineChart }  from '../components/charts/LineChart.js';
import { DonutChart }  from '../components/charts/DonutChart.js';



//
// Functions
//

const initDummyData = (gmd) => {  
  const yearRange = d3.range(2018, 2023, 1);
  const data = [];
  for (let i=0; i<yearRange.length; i++) {
    // Municipality
    let m = { 
      date: `${yearRange[i]}-01-01`, 
      value: d3.randomUniform(0, 0.1)(), 
      adminUnit: gmd
    };
    data.push(m);
    // Kanton
    let k = { 
      date: `${yearRange[i]}-01-01`, 
      value: d3.randomUniform(0, 0.1)(), 
      adminUnit: 'Kanton Kanton'
    };
    data.push(k);
    // Switzerland
    let s = { 
      date: `${yearRange[i]}-01-01`, 
      value: d3.randomUniform(0, 0.1)(), 
      adminUnit: 'Ganze Schweiz'
    };
    data.push(s);
  }

  return data
};


const initDummyKpi = (data, actionType, gmd) => {
  const totalOffers = d3.randomInt(0, 100)();;
  const latestVacancy = data.filter(e => e.date === '2022-01-01' && e.adminUnit === gmd);
  
  const kpi = [];
  if (actionType === 'kaufen') {
    kpi.push(
      { name: 'Anteil Angebote im Budget', value: 'Test' },
      { name: 'Leerstand in 2021', value: d3.format(".1%")(latestVacancy[0].value) }
    );
    } else {
    kpi.push(
      { name: 'Der Mietangebote im Budget', value: 'Test'  },
      { name: 'Leerstand in 2021', value: d3.format(".1%")(latestVacancy[0].value) }
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
const chartData = ref(initDummyData(props.gmd));
const kpi = ref(initDummyKpi(chartData.value, props.query.actionType, props.gmd));
const mortgage = ref([
  { name: 'Geschätztes Eigenkapital', amount: formatNumber(d3.randomInt(1000000)()) },
  { name: 'Mögliche Fremdfinanzierung', amount: formatNumber(d3.randomInt(1000000)()) },
]);


const donutChartData = ref([
  { name: 'Within limits', value: 85 },
  { name: 'Out off limits', value: 25 }
]);


//
// Watch
//

watch(props, () => {

  d3.select(`#${props.cardId}DonutChart`)
    .selectAll('svg > *').remove();


  DonutChart(`${props.cardId}DonutChart`, donutChartData.value, {
    name: d => d.name,
    value: d => d.value,
    width: 100,
    colors: [themeColors[props.color], '#C4C4C4'] 
  });
  
  chartData.value = initDummyData(props.gmd);
  kpi.value = initDummyKpi(chartData.value, props.query.actionType, props.gmd);

  d3.select(`#${props.cardId}LineChart`)
    .selectAll('svg > *').remove();

  LineChart(`${props.cardId}LineChart`, chartData.value, {
    x: d => d.date,
    y: d => d.value,
    z: d => d.adminUnit,
    yLabel: 'Leerstand',
    yFormat: 'p',
    width: 356,
    colors: [themeColors[props.color], '#F39200', '#666666']
  });



});


//
// onMounted hook
//
onMounted(() => {

DonutChart(`${props.cardId}DonutChart`, donutChartData.value, {
  name: d => d.name,
  value: d => d.value,
  width: 100,
  colors: [themeColors[props.color], '#C4C4C4'] 
});

LineChart(`${props.cardId}LineChart`, chartData.value, {
  x: d => d.date,
  y: d => d.value,
  z: d => d.adminUnit,
  yLabel: 'Leerstand',
  yFormat: 'p',
  width: 356,
  colors: [themeColors[props.color], '#F39200', '#666666']
});
  
  //BarChart(`${props.cardId}Chart`, chartData.value, {
  //  x: d => d.rangeMin,
  //  y: d => d.quantity,
  //  z: d => d.budgetStatus,
  //  yLabel: 'Anzahl',
  //  width: 356,
  //  colors: [themeColors[props.color], '#C4C4C4']
  //  });

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
  <h6 class="text-overline">Bezahlbarer wohnraum</h6>
  <div class="d-flex justify-start mb-4">
    <svg :id="`${cardId}DonutChart`" style="min-width: 100px;"></svg>
    <div class="flex-column ml-4">
      <p class="text-body-1">108 oder 75.5%</p>
      <p class="text-body-2">Der Mietangebote unter 30% des Einkommens</p>
      <p class="text-body-2">
        <a href="https://www.homegate.ch/" :style="`color: ${fillColor}; text-decoration: none`">
          Mietangebote in Volketswil suchen auf homegate.ch
          <v-icon size="small">mdi-open-in-new</v-icon>
        </a>
      </p>
    </div>
  </div>
  
  
  <!-- Chart -->
  <h6 class="text-overline">Anteil leere wohnungen</h6>
  <svg :id="`${cardId}LineChart`"></svg>

</v-card>


</template>


<style>
.resultCard{
  border: 1px solid;
}
</style>