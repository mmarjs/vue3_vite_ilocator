<script setup>
import InformationPage from './views/InformationPage.vue';
import ResultPage from './views/ResultPage.vue';
import { ref } from 'vue';


//
// Tabs
//

const activeTab = ref('info');
const disabledResultTab = ref(true);



//
// Information page input
//

const formInput = ref({
    gmd: {},
    housing: {},
    taxes: {},
    insurance: {}
  });

const getFormInput = (e) => {
  disabledResultTab.value = false;
  activeTab.value = 'result';
  formInput.value = e;
  window.scrollTo(0, 0);
};



//
// Information page state
//

const inputStates = ref({
  taxesSection: { placeholder: true, form: false },
  insuranceSection: { placeholder: true, form: false }
});

const openFormSection = (e) => {
  activeTab.value = 'info';
  if (e === 'taxesSection') {
    inputStates.value.taxesSection = { placeholder: false, form: true };
  } else if (e === 'insuranceSection') {
    inputStates.value.insuranceSection = { placeholder: false, form: true };
  } else {
    console.error('Error: emited section is invalid.');
  }
};

</script>

<template>
  <v-app style="max-width: 940px;">
    <v-main>
      
      <v-container>
        <v-tabs v-model="activeTab" background-color="transparent" color="secondary" grow>
          <v-tab value="info">Informationen</v-tab>
          <v-tab value="result" :disabled="disabledResultTab">Auswertung</v-tab>
        </v-tabs>
      </v-container>
      <!-- v-window and v-window-item work incorrectly. Check this feature in the next release of Vuetify. -->

      <!-- Information Page -->
      <InformationPage
        :taxesSectionState="inputStates.taxesSection"
        :insuranceSectionState="inputStates.insuranceSection"
        @formInput="getFormInput"
        v-show="activeTab == 'info'"
      >
      </InformationPage>
      
      <!-- Result Page -->
      <ResultPage
        :gmdQuery="formInput.gmd"
        :housingQuery="formInput.housing"
        :taxesQuery="formInput.taxes"
        :insuranceQuery="formInput.insurance"
        @back-to="openFormSection"
        v-show="activeTab == 'result'"
      ></ResultPage>
    </v-main>
  </v-app>
</template>
