<script setup>
import { watch, onMounted } from 'vue';
import leaflet from "leaflet";
import hoheitsgebiet from '../assets/swissBOUNDARIES3D_1_3_TLM_HOHEITSGEBIET_10.json';

//
// Props and emits
//

const props = defineProps({gmdInput: Object});
const emit = defineEmits(['gmdMap']);
const emitValue = (value) => {emit('gmdMap', value)};

//
// Variables for the map
//

let map;
let gemeindenShapes;
const featureStyles = {
  default: { weight: 0, fillOpacity: 0 },
  inactive: { weight: 2, color: '#808080', fillColor: '#808080', fillOpacity: 0.5},
  from: { weight: 2, color: '#1E50AD', fillColor: '#1E50AD', fillOpacity: 0.5 },
  to: { weight: 2, color: '#A81681', fillColor: '#A81681', fillOpacity: 0.5 }
};


//
// Functions for map
//

function formatShapes(gemeindenShapes) {
  gemeindenShapes.eachLayer(function (layer) {
    if(layer.feature.properties.NAME === props.gmdInput.from) {
      layer.setStyle(featureStyles.from);
      layer.openPopup();
    } else if (layer.feature.properties.NAME === props.gmdInput.to) {
      layer.setStyle(featureStyles.to);
      layer.openPopup();
    } else {
      layer.closePopup();
      layer.setStyle(featureStyles.default);
    }
  });
}

function getCenterOfPolygon (feature) {
  const coordinates = [].concat.apply([], feature.geometry.coordinates);
  const lon = coordinates.map(e => e[0]);
  const lat = coordinates.map(e => e[1]);
  const lon_center = (Math.max(...lon) + Math.min(...lon)) / 2;
  const lat_center = (Math.max(...lat) + Math.min(...lat)) / 2;
  const center = [lat_center, lon_center];
  return(center)
}

function onEachFeature(feature, layer) {
  // 1. Tooltip
  layer.bindTooltip(feature.properties.NAME, { permanent: false, sticky: true });
  layer.bindPopup(feature.properties.NAME, {autoClose: false});
  // 2. Hover
  layer.on({
  	'mouseover': function (e) {
      // Disable mouseover for selelcted fetures
      let selection = [props.gmdInput.from, props.gmdInput.to];
      if (!selection.includes(e.target.feature.properties.NAME)) {
        // Different colors for the different states of gemeinden selelction
        if (props.gmdInput.from == null) { 
          e.target.setStyle(featureStyles.from);
        } else if (props.gmdInput.from !== null && props.gmdInput.to == null) {
          e.target.setStyle(featureStyles.to);
        } else {
          e.target.setStyle(featureStyles.inactive);
        }
      }
  	},
  	'mouseout': function (e) {
      // Disable mouseout for selelcted fetures
      let selection = [props.gmdInput.from, props.gmdInput.to];
      if (!selection.includes(e.target.feature.properties.NAME)) {
        e.target.setStyle(featureStyles.default);
      }
  	}
  });
  // 3. Click
  layer.on('click', e => {
    let center = getCenterOfPolygon(e.target.feature);
    map.setView(center, 9);
    // Different emits for the different states of gemeinden selelction
    if (props.gmdInput.from === null) {
      emitValue({
        from: e.target.feature.properties.NAME, 
        to: null})
    } else if (props.gmdInput.to === null) {
      emitValue({
        from: props.gmdInput.from, 
        to: e.target.feature.properties.NAME})
    } else {
      emitValue({
        from: e.target.feature.properties.NAME, 
        to: null})
    }
    formatShapes(gemeindenShapes)
    });
  }


//
// Watch
//

watch(props, () => {
  formatShapes(gemeindenShapes)
  if (props.gmdInput.from !== null && props.gmdInput.to === null) {
    let feature = hoheitsgebiet.features.filter(e => e.properties.NAME === props.gmdInput.from);
    map.setView(getCenterOfPolygon(feature[0]), 9);
  } else if (props.gmdInput.to !== null) {
    let feature = hoheitsgebiet.features.filter(e => e.properties.NAME === props.gmdInput.to);
    map.setView(getCenterOfPolygon(feature[0]), 9);
  } else {
    map.setView([46.798529, 8.231794], 7)
  }
});


//
// Build the map onMounted
//

onMounted(() => {
  // const basemap = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors'});
  const basemap = leaflet.tileLayer('https://api.mapbox.com/styles/v1/bohdantyshkevych/cl1qucha1001m15mt4p1m0ahv/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYm9oZGFudHlzaGtldnljaCIsImEiOiJja2tsOWZoY28wYnRnMndycXZ5MHl2dDNyIn0.2OLC6Lv9qYi_d1BEjdyQsQ', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    tileSize: 512, zoomOffset: -1
    });
  map = leaflet.map('map', {renderer: leaflet.canvas()}).setView([46.798529, 8.231794], 7).addLayer(basemap);
  gemeindenShapes = leaflet.geoJSON(hoheitsgebiet, {style: featureStyles.default, onEachFeature: onEachFeature});
  gemeindenShapes.addTo(map);
});
</script>


<template>
<div id="map" style="height: 100%; width: 100%;"></div>
</template>