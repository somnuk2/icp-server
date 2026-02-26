<template>
  <q-card>
    <q-tabs v-model="tab" dense class="bg-blue-2 text-purple" active-color="primary" indicator-color="blue-7"
      align="justify">
      <q-tab name="department" icon="add_home" label="การจัดการสาขาวิชา" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="department">
        <department-form />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { ref } from "vue";
import DepartmentForm from "./departmentForm.vue";
export default {
  components: { DepartmentForm },
  setup() {
    return {
      tab: ref("department"),
    };
  },
};
</script>

<style></style>
