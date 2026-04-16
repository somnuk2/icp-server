<template>
  <q-card>
    <q-tabs
      v-model="tab"
      dense
      class="bg-grey-2 text-primary"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="project" label="โตรงการ" />
      <q-tab name="disability" label="ความพิการ" />
      <q-tab name="target" label="ค่าเป้าหมาย" />
      <q-tab name="improvement" label="ค่าการประเมิน" />
      <q-tab name="level" label="ระดับความสำคัญ" />
      <q-tab name="importance" label="ความสำคัญ" />
      <q-tab name="career_group" label="กลุ่มอาชีพ" />
      <q-tab
        name="qualification_group"
        label="กลุ่มคุณสมบัติ/ทักษะ"
      />
      <q-tab name="development" label="ชนิดการพัฒนา" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="project">
        <project-form />
      </q-tab-panel>
      <q-tab-panel name="disability">
        <disability-form />
      </q-tab-panel>
      <q-tab-panel name="target">
        <target-form />
      </q-tab-panel>
      <q-tab-panel name="improvement">
        <improvement-form />
      </q-tab-panel>
      <q-tab-panel name="level">
        <level-form />
      </q-tab-panel>
      <q-tab-panel name="importance">
        <importance-form />
      </q-tab-panel>
      <q-tab-panel name="career_group">
        <careergroup-form />
      </q-tab-panel>
      <q-tab-panel name="qualification_group">
        <qualificationgroup-form />
      </q-tab-panel>
      <q-tab-panel name="development">
        <development-form />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { ref } from "vue";
import ProjectForm from "./ProjectForm.vue";
import DisabilityForm from "./DisabilityForm.vue";
import TargetForm from "./TargetForm.vue";
import LevelForm from "./LevelForm.vue";
import ImprovementForm from "./ImprovementForm.vue";
import ImportanceForm from "./ImportanceForm.vue";
import CareergroupForm from "./CareergroupForm.vue";
import QualificationgroupForm from "./QualificationgroupForm.vue";
import DevelopmentForm from "./DevelopmentForm.vue";

export default {
  components: {
    ProjectForm,
    DisabilityForm,
    TargetForm,
    LevelForm,
    ImprovementForm,
    ImportanceForm,
    CareergroupForm,
    QualificationgroupForm,
    DevelopmentForm,
  },
  Provide() {
    return {};
  },
  setup() {
    return {
      tab: ref("project"),
      // innerTab: ref("innerMails"),
      // splitterModel: ref(20),
    };
  },
};
</script>

<style></style>
