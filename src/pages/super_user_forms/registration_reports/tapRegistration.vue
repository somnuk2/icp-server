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
        name="FormRegistration"
        label="ฟอร์มการลงทะเบียน"
      />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="FormRegistration">
        <form-registration />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { ref } from "vue";
import FormRegistration from "../FormRegistration.vue";

export default {
  components: {
    FormRegistration,
  },
  setup() {
    return {
      tab: ref("FormRegistration"),
    };
  },
};
</script>

<style></style>
