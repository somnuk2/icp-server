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
      <q-tab name="FormPlan" label="ฟอร์มการพัฒนาตนเอง" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="FormPlan">
        <form-plan />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { ref } from "vue";
import FormPlan from "../FormPlan.vue";

export default {
  components: {
    FormPlan,
  },
  setup() {
    return {
      tab: ref("FormPlan"),
    };
  },
};
</script>

<style></style>
