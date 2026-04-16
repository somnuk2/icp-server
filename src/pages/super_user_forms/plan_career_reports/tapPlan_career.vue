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
      <q-tab name="FormPlanCareer" label="ฟอร์มอาชีพเป้าหมาย" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="FormPlanCareer">
        <form-plan-career />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { ref } from "vue";
import FormPlanCareer from "../FormPlanCareer.vue";

export default {
  components: {
    FormPlanCareer,
  },
  setup() {
    return {
      tab: ref("FormPlanCareer"),
    };
  },
};
</script>

<style></style>
