<script setup>
// No need for JS here ...
</script>


<template>
<v-expansion-panels>
  <v-expansion-panel elevation="0">
    <v-expansion-panel-title>
      <h6 class="text-subtitle-1">Informationen zu den Daten und Berechnungen</h6>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <p class="text-body-2">
        Der iLocator nutzt Informationen nach bestem Wissen. Alle Angaben sind ohne Gewähr und jede Haftung wird abgelehnt.<br/>
      </p>
      <p class="text-body-2">
        Datenquellen:
        <ol style="margin-left: 2em;">
          <li>Quellen 1</li>
          <li>Quellen 2</li>
          <li>Quellen 3</li>
        </ol>
      </p>
      <p class="text-body-2">
        Informationen zu Annahmen und Berechnungen. Die Berechnung ...<br/>
      </p>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-divider></v-divider>
</v-expansion-panels>
</template>


<style>
.text-body-2 {
  margin-bottom: 0.5em;
}
</style>
