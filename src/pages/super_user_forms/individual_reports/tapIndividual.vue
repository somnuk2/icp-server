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
        name="FormComponent"
        label="ฟอร์มข้อมูลส่วนตัว"
      />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="FormComponent">
        <form-component />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { ref } from "vue";
import FormComponent from "../FormComponent.vue";

export default {
  components: {
    FormComponent,
  },
  setup() {
    return {
      tab: ref("FormComponent"),
    };
  },
};
</script>

<style></style>
