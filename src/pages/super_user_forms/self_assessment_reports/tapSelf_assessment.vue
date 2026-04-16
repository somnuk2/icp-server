<template>
  <q-card>
    <q-tabs
      v-model="tab"
      dense
      class="bg-blue-2 text-purple"
      active-color="primary"
      indicator-color="blue-7"
      align="justify"
    >
      <q-tab
        name="FormSelfAssessment"
        label="ฟอร์มการประเมินตนเอง"
      />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="FormSelfAssessment">
        <form-self-assessment />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { ref } from "vue";
import FormSelfAssessment from "../FormSelfAssessment.vue";

export default {
  components: {
    FormSelfAssessment,
  },
  setup() {
    return {
      tab: ref("FormSelfAssessment"),
    };
  },
};
</script>

<style></style>
