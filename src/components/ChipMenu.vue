<script setup>
import { ref } from 'vue';

const housingMenu = ref({
  objektType: false,
  rooms: false
});


const options = {
  objekt: ['Wohnung', 'Haus', 'Wohnung & Haus'],
  rooms: ['1', '2', '3', '4', '5', '6+']
  };

</script>


<template>
  <v-row>
    <v-col cols="auto">
      <!-- First chip -->
      <v-chip :ripple="true" class="chip-menu mx-3">
        {{housingQuery.objektType}}
        <v-icon :icon="housingMenu.objektType ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="chip-icon" end></v-icon>
        <v-menu v-model="housingMenu.objektType" activator="parent">
          <v-card>
            <v-list>
              <v-list-item>
                <v-select 
                  v-model="housingQuery.objektType" :items="options.objekt" 
                  @update:model-value="housingMenu.objektType = !housingMenu.objektType"
                  label="Objekttyp" color="primary"
                ></v-select>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-chip>
      <!-- Second chip -->
      <v-chip :ripple="true" class="chip-menu">
        Zimmer von {{housingQuery.roomsFrom}} bis {{housingQuery.roomsTo}}
        <v-icon :icon="housingMenu.rooms ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="chip-icon" end></v-icon>
        <v-menu v-model="housingMenu.rooms" activator="parent">
          <v-card>
            <v-list elevation="3">
              <v-list-item>
                <v-select 
                  v-model="housingQuery.roomsFrom" :items="options.rooms"
                  @update:model-value="housingMenu.rooms = !housingMenu.rooms"
                  label="Zimmer von" color="primary"
                ></v-select>
              </v-list-item>
              <v-list-item>
                <v-select 
                  v-model="housingQuery.roomsTo" :items="options.rooms"
                  @update:model-value="housingMenu.rooms = !housingMenu.rooms"
                  label="Zimmer bis" color="primary"
                ></v-select>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-chip>
    </v-col>
  </v-row>
</template>


<style>
.chip-menu {
  cursor: pointer;
}
</style>