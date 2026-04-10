<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="items-center justify-center bg-grey-2" style="min-height: 100vh;">
        <div class="full-width">
          <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
            <q-card flat class="bg-white text-black">
              <q-card-section class="bg-primary">
                <h4 class="text-h5 text-white q-my-xs text-center">
                  {{ title }}
                </h4>
              </q-card-section>

              <q-card-section>
                <!-- ✅ รายการอาชีพเป้าหมายและคุณสมบัติ/ทักษะ -->
                <div class="row q-mb-lg">
                  <div class="col-12">
                    <q-list bordered separator class="rounded-borders bg-white shadow-1">
                      <!-- Header -->
                      <q-item class="bg-deep-purple-1">
                        <q-item-section avatar>
                          <q-icon name="psychology" color="deep-purple-7" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label
                            class="text-h6 text-deep-purple-7">อาชีพเป้าหมายและคุณสมบัติ/ทักษะ</q-item-label>
                          <q-item-label caption class="text-grey-9">คลิกปุ่ม "แนะนำแผนพัฒนา" เพื่อขอคำแนะนำจาก
                            AI</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn outline color="green" icon="add_box" label="เพิ่มแผนด้วยตนเอง"
                            @click="showManualFormDialog = true" data-testid="btn-manual-plan" />
                        </q-item-section>
                      </q-item>

                      <!-- Career List -->
                      <q-expansion-item v-for="career in plan_career.optionsAll" :key="career.value"
                        header-class="q-py-md items-center bg-grey-1" expand-separator default-opened>
                        <template #header>
                          <q-item-section avatar>
                            <q-avatar color="deep-purple-1" text-color="deep-purple-7" icon="work" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="text-subtitle1 text-weight-bold">{{ career.label }}</q-item-label>
                            <q-item-label caption>อาชีพเป้าหมาย</q-item-label>
                          </q-item-section>
                        </template>

                        <!-- Qualifications under this career -->
                        <div class="q-pa-md bg-grey-2">
                          <q-list separator v-if="qualificationsByCareer[career.value]?.length > 0">
                            <q-expansion-item v-for="qual in qualificationsByCareer[career.value]"
                              :key="qual.qa_plan_career_id" header-class="bg-white" expand-separator>
                              <template #header>
                                <q-item-section avatar>
                                  <q-icon name="fact_check" color="blue-grey-7" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{ qual.qualification_name }}</q-item-label>
                                  <q-item-label caption>กลุ่ม: {{ qual.qualification_group_name || 'ไม่ระบุ'
                                    }}</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                  <q-btn unelevated rounded color="deep-purple-7" icon="bolt" label="แนะนำแผนพัฒนา"
                                    @click.stop="recommendForQualification(qual)"
                                    :loading="loadingQualAI === qual.qa_plan_career_id" class="q-px-md">
                                    <q-tooltip>รับคำแนะนำจาก AI สำหรับคุณสมบัตินี้</q-tooltip>
                                  </q-btn>
                                </q-item-section>
                              </template>

                              <!-- AI Recommendations for this qualification (1-3 plans) -->
                              <div class="q-pa-md bg-grey-1">
                                <div v-if="loadingQualAI === qual.qa_plan_career_id" class="row justify-center q-pa-md">
                                  <q-spinner-dots color="deep-purple" size="2em" />
                                  <div class="text-grey-7 q-ml-sm">AI กำลังวิเคราะห์ข้อมูล...</div>
                                </div>

                                <div v-else-if="aiRecommendationsGrouped[qual.qa_plan_career_id]">
                                  <q-list separator dense>
                                    <q-item v-for="(rec, index) in aiRecommendationsGrouped[qual.qa_plan_career_id]"
                                      :key="`${qual.qa_plan_career_id}-${index}`" class="q-py-md">
                                      <q-item-section>
                                        <div class="row items-center q-gutter-x-sm">
                                          <div class="col-grow" v-if="!rec.isEditing">
                                            <q-item-label class="text-weight-bold text-primary">
                                              เรื่อง: {{ rec.plan_title }}
                                            </q-item-label>
                                            <q-item-label caption>
                                              ช่องทาง: {{ rec.plan_channel }}
                                            </q-item-label>
                                          </div>

                                          <div class="col-grow column q-gutter-y-xs" v-else>
                                            <q-input dense outlined v-model="rec.plan_title" label="แก้ไขเป้าหมายการฝึก"
                                              autofocus />
                                            <q-input dense outlined v-model="rec.plan_channel" label="แก้ไขช่องทาง" />
                                          </div>

                                          <div>
                                            <q-btn v-if="!rec.isEditing" flat round color="grey-7" icon="edit" size="sm"
                                              @click="rec.isEditing = true" />
                                            <q-btn v-else flat round color="positive" icon="check" size="sm"
                                              @click="rec.isEditing = false" />
                                          </div>
                                        </div>

                                        <q-item-label caption class="q-mt-xs">
                                          เหตุผล: {{ rec.reason }}
                                        </q-item-label>

                                        <div class="row q-col-gutter-sm q-mt-sm">
                                          <div class="col-6">
                                            <q-select dense outlined options-dense label="การพัฒนา"
                                              v-model="rec.development_id" :options="development.optionsAll" emit-value
                                              map-options />
                                          </div>
                                          <div class="col-6">
                                            <q-select dense outlined options-dense label="ความสำคัญ"
                                              v-model="rec.importance_id" :options="importance.optionsAll" emit-value
                                              map-options />
                                          </div>
                                        </div>
                                      </q-item-section>

                                      <q-item-section side top>
                                        <div class="row q-gutter-x-sm">
                                          <q-btn flat round color="red-4" icon="close" size="sm"
                                            @click="aiRecommendations = aiRecommendations.filter(r => r !== rec)">
                                            <q-tooltip>ลบข้อแนะนำนี้</q-tooltip>
                                          </q-btn>
                                          <q-btn unelevated color="positive" icon="add_check" label="ยอมรับและเพิ่มลงแผน"
                                            @click="acceptAiRecommendation(rec)" />
                                        </div>
                                      </q-item-section>
                                    </q-item>
                                  </q-list>
                                </div>

                                <div v-else class="text-center q-pa-md text-grey-6 border-dashed rounded-borders">
                                  ยังไม่มีคำแนะนำ (กดปุ่ม "แนะนำแผนพัฒนา" เพื่อเริ่มรับคำแนะนำ)
                                </div>
                              </div>
                            </q-expansion-item>
                          </q-list>

                          <div v-else class="text-center q-pa-md text-grey-6">
                            ยังไม่มีคุณสมบัติ/ทักษะสำหรับอาชีพนี้
                          </div>
                        </div>
                      </q-expansion-item>

                      <q-item v-if="plan_career.optionsAll.length === 0" class="text-center q-pa-lg">
                        <q-item-section class="text-grey-7">ยังไม่มีอาชีพเป้าหมายในแผนของคุณ</q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>

                <q-separator spaced />

                <!-- Tree View -->
                <div class="row q-mt-lg">
                  <div class="col-12">
                    <q-card flat bordered>
                      <q-card-section class="bg-primary text-white row items-center justify-between">
                        <div class="text-h6"><q-icon name="account_tree" /> แผนการพัฒนาตนเอง (โครงสร้างต้นไม้)</div>
                        <div class="row q-gutter-sm items-center">
                          <q-input dense filled debounce="300" v-model="treeFilter" placeholder="ค้นหาในโครงสร้างต้นไม้"
                            style="width: 200px">
                            <template #append><q-icon name="search" /></template>
                          </q-input>
                          <q-input borderless dense v-model="file_export" placeholder="ชื่อไฟล์นำออก" outlined
                            style="width: 150px">
                            <template v-slot:append><q-icon name="save" /></template>
                          </q-input>
                          <q-btn flat icon="archive" label="ส่งออก Excel (รายงานสรุป)" @click="exportTable" />
                          <q-checkbox v-if="plans1.length > 0" v-model="isAllSelected" label="เลือกทั้งหมด"
                            @update:model-value="toggleSelectAll" class="q-mx-sm" />
                          <q-btn v-if="tickedPlans.length > 0" color="negative" icon="delete" label="ลบที่เลือก"
                            @click="deleteSelectedPlans" no-caps class="q-ml-sm" />
                        </div>
                      </q-card-section>

                      <q-card-section class="q-pa-none">
                        <div v-if="loading" class="row justify-center q-pa-md">
                          <q-spinner color="primary" size="3em" />
                        </div>

                        <!-- ✅ เพิ่ม tick-strategy="strict" เพื่อเลือกเฉพาะใบ (plans) -->
                        <q-tree v-else :nodes="plansTree" node-key="id" :filter="treeFilter" default-opened-all
                          tick-strategy="strict" v-model:ticked="tickedPlans" class="q-pa-md" data-testid="plan-tree">
                          <template #default-header="prop">
                            <div class="row items-center full-width justify-between">
                              <div class="row items-center">
                                <q-icon :name="prop.node.icon" :color="prop.node.header === 'importance'
                                  ? 'amber-9'
                                  : prop.node.header === 'target'
                                    ? 'deep-orange-9'
                                    : prop.node.color || 'primary'" class="q-mr-sm" />
                                <div :class="{
                                  'text-weight-bold text-primary': prop.node.type === 'plan',
                                  'text-weight-medium text-amber-9': prop.node.header === 'importance',
                                  'text-weight-medium text-deep-orange-9': prop.node.header === 'target'
                                }">
                                  {{ prop.node.label }}
                                </div>
                              </div>

                              <div v-if="prop.node.type === 'plan'" class="row q-gutter-xs">
                                <q-btn flat round color="blue" icon="edit" size="sm"
                                  @click.stop="onEdit(prop.node.rawData.plan_id)">
                                  <q-tooltip>แก้ไขแผนนี้</q-tooltip>
                                </q-btn>
                                <q-btn flat round color="red" icon="delete" size="sm"
                                  @click.stop="onDelete(prop.node.rawData.plan_id, prop.node.rawData.plan_title)">
                                  <q-tooltip>ลบแผนนี้</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </template>
                        </q-tree>

                        <div v-if="!loading && plansTree.length === 0" class="text-center q-pa-lg text-grey">
                          ยังไม่มีข้อมูลแผนการพัฒนา
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="row justify-center items-center q-gutter-sm q-mt-sm q-mb-md">
                  <q-btn icon="logout" label="ออก" color="primary" flat to="/" />
                  <q-btn color="primary" label="กลับฟอร์มกำหนดคุณสมบัติ" no-caps flat icon="skip_previous"
                    to="/FormQualification">
                    <q-tooltip class="bg-accent">กลับฟอร์มกำหนดคุณสมบัติ/ทักษะ</q-tooltip>
                  </q-btn>
                  <q-btn color="primary" label="ไปฟอร์มการประเมินตนเอง" no-caps flat icon="skip_next"
                    to="/FormSelfAssessment">
                    <q-tooltip class="bg-accent">ไปฟอร์มการประเมินตนเอง</q-tooltip>
                  </q-btn>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>

      <!-- Manual Form Dialog -->
      <q-dialog v-model="showManualFormDialog" persistent>
        <q-card style="min-width: 600px; max-width: 90vw">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ isEdit ? "แก้ไขข้อมูล" : "เพิ่มข้อมูลแผนใหม่" }}</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="submitForm" @reset="resetForm" class="q-gutter-md">
              <!-- อาชีพเป้าหมาย + คุณสมบัติ-->
              <div class="row">
                <div class="col-md-6 col-xs-12 q-pa-xs">
                  <q-select @filter="filterPlanCareer" use-input color="primary" v-model="plan_career_id"
                    :options="plan_career.options" label="อาชีพเป้าหมาย *" emit-value map-options
                    :loading="loadingPlanCareer" data-testid="select-target-career">
                    <template v-slot:prepend>
                      <q-icon name="work_history" />
                    </template>

                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                          <q-icon :name="scope.opt.icon || 'work'" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                          <q-item-label v-if="scope.opt.description" caption>
                            {{ scope.opt.description }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>

                    <template v-if="plan_career_id" v-slot:append>
                      <q-icon name="cancel" @click.stop.prevent="plan_career_id = null" class="cursor-pointer" />
                    </template>
                  </q-select>
                </div>

                <div class="col-md-6 col-xs-12 q-pa-xs">
                  <q-select @filter="filterQaPlanCareer" use-input color="primary" v-model="qa_plan_career_id"
                    :options="qa_plan_career.options" label="คุณสมบัติที่ต้องการ *" emit-value map-options
                    :disable="!plan_career_id" :loading="loadingQaPlanCareer" data-testid="select-target-qualification">
                    <template v-slot:prepend>
                      <q-icon name="fact_check" />
                    </template>

                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                          <q-icon :name="scope.opt.icon || 'fact_check'" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                          <q-item-label v-if="scope.opt.description" caption>
                            {{ scope.opt.description }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>

                    <template v-if="qa_plan_career_id" v-slot:append>
                      <q-icon name="cancel" @click.stop.prevent="qa_plan_career_id = null" class="cursor-pointer" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- การพัฒนา + เรื่อง -->
              <div class="row">
                <div class="col-md-4 col-xs-12 q-pa-xs">
                  <q-select @filter="filterDevelopment" use-input color="primary" v-model="development_id"
                    :options="development.options" label="การพัฒนา *" emit-value map-options
                    :loading="loadingDevelopment" data-testid="select-development-type">
                    <template v-slot:prepend>
                      <q-icon name="post_add" />
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                          <q-icon :name="scope.opt.icon || 'post_add'" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                    <template v-if="development_id" v-slot:append>
                      <q-icon name="cancel" @click.stop.prevent="development_id = null" class="cursor-pointer" />
                    </template>
                  </q-select>
                </div>

                <div class="col-md-8 col-xs-12 q-pa-xs">
                  <q-input standout="bg-primary text-white" bottom-slots v-model="plan.plan_title" label="เรื่อง *" clearable
                    data-testid="input-plan-title">
                    <template v-slot:prepend>
                      <q-icon name="list_alt" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="favorite" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- ช่องทาง -->
              <div class="row">
                <div class="col-md-12 col-xs-12 q-pa-xs">
                  <q-input standout="bg-primary text-white" bottom-slots v-model="plan.plan_channel" label="ช่องทาง *" clearable>
                    <template v-slot:prepend>
                      <q-icon name="play_lesson" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="favorite" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- วันเริ่ม/สิ้นสุด -->
              <div class="row">
                <div class="col-md-6 col-xs-12 q-pa-xs">
                  <q-input filled v-model="plan.plan_start_date" label="วันเริ่มพัฒนา *" mask="##/##/####" fill-mask
                    hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" clearable data-testid="input-start-date">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="plan.plan_start_date" mask="DD/MM/YYYY" :locale="mylocale" today-btn>
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

                <div class="col-md-6 col-xs-12 q-pa-xs">
                  <q-input filled v-model="plan.plan_end_date" label="วันสิ้นสุดพัฒนา" mask="##/##/####" fill-mask
                    hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" clearable>
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="plan.plan_end_date" mask="DD/MM/YYYY" :locale="mylocale" today-btn>
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- ความสำคัญ -->
              <div class="row">
                <div class="col-md-12 col-xs-12 q-pa-xs">
                  <q-select @filter="filterImportance" use-input color="primary" v-model="importance_id"
                    :options="importance.options" label="ความสำคัญ *" emit-value map-options
                    :loading="loadingImportance" data-testid="select-importance">
                    <template v-slot:prepend>
                      <q-icon name="saved_search" />
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                          <q-icon :name="scope.opt.icon || 'saved_search'" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                    <template v-if="importance_id" v-slot:append>
                      <q-icon name="cancel" @click.stop.prevent="importance_id = null" class="cursor-pointer" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- ปุ่มควบคุม -->
              <div class="row justify-center items-center q-gutter-sm q-mt-sm q-mb-md">
                <q-btn :label="btnLabel" type="submit" color="primary" icon="save" unelevated class="q-px-md"
                  data-testid="btn-submit-plan" />
                <q-btn label="ยกเลิก" type="reset" color="primary" outline icon="clear" class="q-px-md" />
                <q-btn label="ปิด" color="grey" flat @click="showManualFormDialog = false" class="q-mx-sm" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import axios from "axios";
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useQuasar, exportFile } from "quasar";
import { useStore } from "vuex";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl, getChatUrl } from "../../utils/apiConfig.js";

const $q = useQuasar();
const store = useStore();

/* ----------------------------------------------------------------
 * Config & State
 * ---------------------------------------------------------------- */
const urls = reactive({
  rest_api: "",
  chat_url: getChatUrl(store),
});

const mylocale = {
  days: "อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์".split("_"),
  daysShort: "อา_จ_อ_พ_พฤ_ศ_ส".split("_"),
  months: "มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฏาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split("_"),
  monthsShort: "มค_กพ_มีค_เมย_พค_มิย_กค_สค_กย_ตค_พย_ธค".split("_"),
  firstDayOfWeek: 1,
  format24h: true,
};

// UI State
const title = ref("การพัฒนาตนเอง");
const btnLabel = ref("เพิ่มข้อมูล");
const isEdit = ref(false);
const loading = ref(false);
const showManualFormDialog = ref(false);
const treeFilter = ref("");
const file_export = ref("แผนการพัฒนาตนเอง");
const tickedPlans = ref([]);
const isAllSelected = ref(false);
const individual = ref({});

// Loading flags
const loadingPlanCareer = ref(false);
const loadingQaPlanCareer = ref(false);
const loadingDevelopment = ref(false);
const loadingImportance = ref(false);
const loadingFrequency = ref(false);

// Data Models
const member_id = store.getters.myMember_id;

// Form model
const plan = reactive({
  plan_id: "",
  plan_title: "",
  plan_channel: "",
  plan_start_date: "",
  plan_end_date: "",
});

const plan_career_id = ref(null);
const qa_plan_career_id = ref(null);
const development_id = ref(null);
const importance_id = ref(null);
const frequency_id = ref(null);

// Options
const plan_career = reactive({ options: [], optionsAll: [] });
const qa_plan_career = reactive({ options: [], optionsAll: [] });
const development = reactive({ options: [], optionsAll: [] });
const importance = reactive({ options: [], optionsAll: [] });
const frequency = reactive({ options: [], optionsAll: [] });

// Career -> Qualifications rows (for tree skeleton)
const qualificationsByCareer = reactive({});

// Table Data
const plans1 = ref([]);

// ✅ เพิ่ม columns ไว้เหมือนเดิม
const columns = [
  { name: "actions", align: "center", label: "แก้ไข/ลบ", field: () => "" },
  {
    name: "career_name",
    label: "อาชีพ",
    align: "left",
    field: (row) => {
      if (row.career_name) return row.career_name;
      const co = plan_career.optionsAll.find((o) => String(o.value) === String(row.plan_career_id));
      return co ? co.label : "ไม่ระบุอาชีพ";
    },
    sortable: true,
  },
  { name: "qualification_name", label: "คุณสมบัติ", align: "left", field: "qualification_name", sortable: true },
  { name: "development_name", label: "ชนิดการพัฒนา", align: "left", field: "development_name", sortable: true },
  { name: "plan_title", label: "เรื่อง", align: "left", field: "plan_title", sortable: true },
  { name: "plan_channel", label: "ช่องทาง", align: "left", field: "plan_channel", sortable: true },
  { name: "importance_name", label: "ความสำคัญ", align: "center", field: "importance_name", sortable: true },
  { name: "plan_start_date", label: "วันเริ่ม", align: "center", field: "plan_start_date", sortable: true, format: (val) => dayToUi(val) },
  { name: "plan_end_date", label: "วันสิ้นสุด", align: "center", field: "plan_end_date", sortable: true, format: (val) => dayToUi(val) },
];

const exportableColumns = computed(() => columns.filter((c) => c.name !== "actions"));

/* ----------------------------------------------------------------
 * AI State
 * ---------------------------------------------------------------- */
const isAiLoading = ref(false);
const aiRecommendations = ref([]);
const loadingQualAI = ref(null); // Track which qa_plan_career_id is loading

/* ----------------------------------------------------------------
 * Lookups (speed + robustness)
 * ---------------------------------------------------------------- */
const careerById = computed(() => {
  const m = new Map();
  (plan_career.optionsAll || []).forEach((c) => m.set(String(c.value), c));
  return m;
});

// ✅ map: careerId -> Map(qa_plan_career_id -> qualificationRow)
const qualByCareerMap = computed(() => {
  const out = new Map();
  Object.keys(qualificationsByCareer).forEach((cid) => {
    const rows = qualificationsByCareer[cid] || [];
    const m = new Map();
    rows.forEach((r) => m.set(String(r.qa_plan_career_id), r));
    out.set(String(cid), m);
  });
  return out;
});

/* ----------------------------------------------------------------
 * Computed: AI Grouped by qa_plan_career_id
 * ---------------------------------------------------------------- */
const aiRecommendationsGrouped = computed(() => {
  const grouped = {};
  (aiRecommendations.value || []).forEach((rec) => {
    const qid = String(rec.qa_plan_career_id || "");
    if (!qid) return;
    if (!grouped[qid]) grouped[qid] = [];
    grouped[qid].push(rec);
  });
  return grouped;
});

/* ----------------------------------------------------------------
 * ✅ Computed: Tree (id-based, no collisions)
 * ---------------------------------------------------------------- */
const plansTree = computed(() => {
  const tree = [];

  // skeleton careers from plan_career.optionsAll
  const careers = Array.isArray(plan_career.optionsAll) ? plan_career.optionsAll : [];

  careers.forEach((c) => {
    const cid = String(c.value);

    const careerNode = {
      id: `career_${cid}`,
      label: c.label,
      icon: "work_outline",
      header: "career",
      children: [],
    };

    // qualifications for this career
    const quals = qualificationsByCareer[cid] || [];
    quals.forEach((q) => {
      const qid = String(q.qa_plan_career_id);

      careerNode.children.push({
        id: `qual_${cid}_${qid}`,
        label: q.qualification_name,
        icon: "fact_check",
        header: "qualification",
        rawQual: q,
        children: [
          {
            id: `imp_${cid}_${qid}`,
            label: `⭐ ความสำคัญ: ${q.level_description || "-"}`,
            icon: "star",
            header: "importance",
            noTick: true,
          },
          {
            id: `target_${cid}_${qid}`,
            label: `🎯 ค่าเป้าหมาย: ${q.target_name || q.target_value || "-"}`,
            icon: "flag",
            header: "target",
            noTick: true,
          },
          {
            id: `devgrp_${cid}_${qid}`,
            label: "📦 รายการแผนพัฒนา",
            icon: "auto_stories",
            color: "green-8",
            header: "development_group",
            qid,
            cid,
            children: [],
          },
        ],
      });
    });

    tree.push(careerNode);
  });

  // place plans into skeleton using ids (career_id + qa_plan_career_id)
  (plans1.value || []).forEach((row) => {
    const cid = row.plan_career_id != null ? String(row.plan_career_id) : "";
    const qid = row.qa_plan_career_id != null ? String(row.qa_plan_career_id) : "";

    if (!cid || !qid) return;

    const careerNode = tree.find((n) => n.id === `career_${cid}`);
    if (!careerNode) return;

    const qualNode = careerNode.children.find((n) => n.id === `qual_${cid}_${qid}`);
    if (!qualNode) return;

    const devGroupNode = qualNode.children.find((n) => n.id === `devgrp_${cid}_${qid}`);
    if (!devGroupNode) return;

    devGroupNode.children.push({
      id: `plan_${row.plan_id}`,
      label: `แผนพัฒนา: ${row.plan_title}`,
      icon: "event_note",
      color: "teal-9",
      type: "plan",
      rawData: row,
      children: [
        { id: `plan_${row.plan_id}_dev`, label: `🔹 ชนิดการพัฒนา: ${row.development_name}`, icon: "category", color: "blue-grey-6", noTick: true },
        { id: `plan_${row.plan_id}_title`, label: `📖 เรื่องการพัฒนา: ${row.plan_title}`, icon: "auto_stories", color: "blue-grey-6", noTick: true },
        { id: `plan_${row.plan_id}_ch`, label: `📺 ช่องทางการพัฒนา: ${row.plan_channel}`, icon: "shortcuts", color: "blue-grey-6", noTick: true },
        { id: `plan_${row.plan_id}_imp`, label: `🚩 ความสำคัญ: ${row.importance_name}`, icon: "priority_high", color: "blue-grey-6", noTick: true },
        { id: `plan_${row.plan_id}_sd`, label: `📅 วันเริ่มต้น: ${dayToUi(row.plan_start_date)}`, icon: "today", color: "blue-grey-6", noTick: true },
        { id: `plan_${row.plan_id}_ed`, label: `🏁 วันสิ้นสุด: ${dayToUi(row.plan_end_date)}`, icon: "event_available", color: "blue-grey-6", noTick: true },
      ],
    });
  });

  return tree;
});

/* ----------------------------------------------------------------
 * Initializers
 * ---------------------------------------------------------------- */
function initUrls() {
  urls.rest_api = getRestApiUrl(store);
}

onMounted(async () => {
  initUrls();

  await Promise.all([
    fetchCareersAndQualifications(),
    fetchDevelopments(),
    fetchImportances(),
    fetchFrequencies(),
    fetchTableData(),
    fetchIndividualData(),
  ]);

  // ❌ ยกเลิกการเรียก AI อัตโนมัติ - ให้ผู้ใช้กดปุ่มเอง
  // await recommendDevelopmentPlan();
});

/* ----------------------------------------------------------------
 * Watchers
 * ---------------------------------------------------------------- */
const suppressPlanCareerWatch = ref(false);

watch(plan_career_id, async (newVal) => {
  if (suppressPlanCareerWatch.value) return;

  qa_plan_career_id.value = null;
  qa_plan_career.options = [];
  qa_plan_career.optionsAll = [];

  if (!newVal) return;
  await fetchQaPlanCareers(newVal);
});

/* ----------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------- */
function notifyError(message, err) {
  console.error(err);
  $q.notify({ type: "negative", message });
}

function wrapCsvValue(val) {
  const s = val === void 0 || val === null ? "" : String(val);
  return `"${s.split('"').join('""')}"`;
}

function normalizeId(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

// UI (DD/MM/YYYY) -> API (YYYY/MM/DD)
function uiToApi(dateStr) {
  if (!dateStr) return "";
  const m = String(dateStr).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return dateStr;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}/${mm}/${dd}`;
}

// API (YYYY-MM-DD or YYYY/MM/DD) -> UI (DD/MM/YYYY)
function dayToUi(dateStr) {
  if (!dateStr || dateStr === "0000-00-00" || dateStr === "0000/00/00") return "";
  const s = String(dateStr);
  const sep = s.includes("-") ? "-" : "/";
  const parts = s.split(sep);
  if (parts.length !== 3) return s;

  // YYYY/MM/DD or YYYY-MM-DD
  if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  // already DD/MM/YYYY
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

function resetForm() {
  isEdit.value = false;
  btnLabel.value = "เพิ่มข้อมูล";

  plan.plan_id = "";
  plan.plan_title = "";
  plan.plan_channel = "";
  plan.plan_start_date = "";
  plan.plan_end_date = "";

  plan_career_id.value = null;
  qa_plan_career_id.value = null;
  development_id.value = null;
  importance_id.value = null;
  frequency_id.value = null;

  showManualFormDialog.value = false;
}

function validateForm() {
  if (!plan_career_id.value) return "กรุณาเลือกอาชีพเป้าหมาย";
  if (!qa_plan_career_id.value) return "กรุณาเลือกคุณสมบัติที่ต้องการ";
  if (!development_id.value) return "กรุณาเลือกการพัฒนา";
  if (!importance_id.value) return "กรุณาเลือกความสำคัญ";
  if (!plan.plan_title?.trim()) return "กรุณากรอกเรื่อง";
  if (!plan.plan_channel?.trim()) return "กรุณากรอกช่องทาง";
  if (!plan.plan_start_date) return "กรุณาเลือกวันเริ่มพัฒนา";
  return "";
}

/**
 * ✅ robust JSON array extraction:
 * - handles ```json ... ```
 * - handles text + array inside
 */
function safeExtractJsonArray(text) {
  if (!text) return [];
  const raw = String(text).trim();

  // remove code fences
  const noFence = raw.replace(/```json|```/gi, "").trim();

  // try direct parse
  try {
    const direct = JSON.parse(noFence);
    if (Array.isArray(direct)) return direct;
  } catch (_) { }

  // find first [ ... ] block
  const start = noFence.indexOf("[");
  const end = noFence.lastIndexOf("]");
  if (start >= 0 && end > start) {
    const maybe = noFence.slice(start, end + 1);
    try {
      const parsed = JSON.parse(maybe);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  return [];
}

function formatDateDDMMYYYY(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/* ----------------------------------------------------------------
 * API Fetching
 * ---------------------------------------------------------------- */
async function fetchTableData() {
  loading.value = true;
  try {
    const res = await axios.get(`${urls.rest_api}/plans`);
    plans1.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    notifyError("โหลดข้อมูลตารางไม่สำเร็จ", e);
    plans1.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchIndividualData() {
  try {
    const res = await axios.get(`${urls.rest_api}/members/${member_id}/individual`);
    individual.value = res.data || {};
  } catch (e) {
    console.error("Fetch individual error:", e);
  }
}

/**
 * ✅ โหลด careers + โหลด qualifications ของทุก career เพื่อให้ tree “สมบูรณ์”
 */
async function fetchCareersAndQualifications() {
  loadingPlanCareer.value = true;
  try {
    const res = await axios.get(`${urls.rest_api}/plan-careers`);
    const rows = Array.isArray(res.data) ? res.data : [];

    const opts = rows.map((r) => ({
      label: r.career_name,
      value: normalizeId(r.plan_career_id),
      description: r.career_description || "",
    }));

    plan_career.optionsAll = opts;
    plan_career.options = opts;

    // preload qualifications for tree skeleton
    const jobs = opts.map((c) =>
      axios
        .get(`${urls.rest_api}/qa-plan-careers?plan_career_id=${c.value}`)
        .then((r) => {
          qualificationsByCareer[String(c.value)] = Array.isArray(r.data) ? r.data : [];
        })
        .catch((e) => {
          console.error("Error fetching quals for career", c.label, e);
          qualificationsByCareer[String(c.value)] = [];
        })
    );

    await Promise.all(jobs);
  } catch (e) {
    notifyError("โหลดรายการอาชีพไม่สำเร็จ", e);
    plan_career.optionsAll = [];
    plan_career.options = [];
  } finally {
    loadingPlanCareer.value = false;
  }
}

async function fetchDevelopments() {
  loadingDevelopment.value = true;
  try {
    const res = await axios.get(`${urls.rest_api}/references/developments`);
    const opts = (Array.isArray(res.data) ? res.data : []).map((r) => ({
      label: r.development_name,
      value: normalizeId(r.development_id),
    }));
    development.optionsAll = opts;
    development.options = opts;
  } catch (e) {
    notifyError("โหลดรายการการพัฒนาไม่สำเร็จ", e);
    development.optionsAll = [];
    development.options = [];
  } finally {
    loadingDevelopment.value = false;
  }
}

async function fetchImportances() {
  loadingImportance.value = true;
  try {
    const res = await axios.get(`${urls.rest_api}/references/importances`);
    const opts = (Array.isArray(res.data) ? res.data : []).map((r) => ({
      label: r.importance_name,
      value: normalizeId(r.importance_id),
    }));
    importance.optionsAll = opts;
    importance.options = opts;
  } catch (e) {
    notifyError("โหลดรายการความสำคัญไม่สำเร็จ", e);
    importance.optionsAll = [];
    importance.options = [];
  } finally {
    loadingImportance.value = false;
  }
}

async function fetchFrequencies() {
  loadingFrequency.value = true;
  try {
    const res = await axios.get(`${urls.rest_api}/references/frequencies`);
    const opts = (Array.isArray(res.data) ? res.data : []).map((r) => ({
      label: r.frequency_name,
      value: normalizeId(r.frequency_id),
    }));
    frequency.optionsAll = opts;
    frequency.options = opts;
  } catch (e) {
    notifyError("โหลดรายการความถี่ไม่สำเร็จ", e);
    frequency.optionsAll = [];
    frequency.options = [];
  } finally {
    loadingFrequency.value = false;
  }
}

async function fetchQaPlanCareers(planCareerId) {
  if (!planCareerId) {
    qa_plan_career.optionsAll = [];
    qa_plan_career.options = [];
    return;
  }

  loadingQaPlanCareer.value = true;
  try {
    const res = await axios.get(`${urls.rest_api}/qa-plan-careers?plan_career_id=${planCareerId}`);

    const opts = (Array.isArray(res.data) ? res.data : []).map((r) => ({
      label: r.qualification_name,
      value: normalizeId(r.qa_plan_career_id),
      description: `${r.level_description || ""} ${r.target_name || ""}`.trim(),
      qualification_group_name: r.qualification_group_name,
      career_name: r.career_name,
    }));

    qa_plan_career.optionsAll = opts;
    qa_plan_career.options = opts;
  } catch (e) {
    notifyError("โหลดรายการคุณสมบัติไม่สำเร็จ", e);
    qa_plan_career.optionsAll = [];
    qa_plan_career.options = [];
  } finally {
    loadingQaPlanCareer.value = false;
  }
}

/* ----------------------------------------------------------------
 * Form Actions
 * ---------------------------------------------------------------- */
async function submitForm() {
  const msg = validateForm();
  if (msg) {
    $q.notify({ type: "warning", message: msg });
    return;
  }

  const payloadBase = {
    qa_plan_career_id: qa_plan_career_id.value,
    development_id: development_id.value,
    importance_id: importance_id.value,
    frequency_id: frequency_id.value || 1,
    plan_title: plan.plan_title?.trim(),
    plan_channel: plan.plan_channel?.trim(),
    plan_start_date: uiToApi(plan.plan_start_date),
    plan_end_date: uiToApi(plan.plan_end_date),
  };

  const dialogMessage = isEdit.value ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
  const action = isEdit.value ? "update" : "insert";
  const extra = isEdit.value ? { plan_id: plan.plan_id } : {};

  $q.dialog({
    title: "ยืนยัน",
    message: dialogMessage,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      if (isEdit.value) {
        await axios.put(`${urls.rest_api}/plans/${plan.plan_id}`, payloadBase);
      } else {
        await axios.post(`${urls.rest_api}/plans`, payloadBase);
      }
      $q.notify({ type: "positive", message: isEdit.value ? "แก้ไขข้อมูลสำเร็จ" : "บันทึกข้อมูลสำเร็จ" });

      await fetchTableData();
      resetForm();
    } catch (e) {
      notifyError(isEdit.value ? "แก้ไขข้อมูลไม่สำเร็จ" : "บันทึกข้อมูลไม่สำเร็จ", e);
    }
  });
}

async function onEdit(plan_id) {
  btnLabel.value = "แก้ไขข้อมูล";
  isEdit.value = true;
  showManualFormDialog.value = true;

  try {
    const res = await axios.get(`${urls.rest_api}/plans/${plan_id}`);
    const d = res.data || {};

    plan.plan_id = d.plan_id;

    suppressPlanCareerWatch.value = true;

    plan_career_id.value = normalizeId(d.plan_career_id);

    // reload quals for selected career (ensures options are present)
    qa_plan_career_id.value = null;
    qa_plan_career.options = [];
    qa_plan_career.optionsAll = [];
    await fetchQaPlanCareers(plan_career_id.value);

    qa_plan_career_id.value = normalizeId(d.qa_plan_career_id);
    development_id.value = normalizeId(d.development_id);
    importance_id.value = normalizeId(d.importance_id);
    frequency_id.value = normalizeId(d.frequency_id);

    plan.plan_title = d.plan_title || "";
    plan.plan_channel = d.plan_channel || "";
    plan.plan_start_date = dayToUi(d.plan_start_date);
    plan.plan_end_date = dayToUi(d.plan_end_date);
  } catch (e) {
    notifyError("โหลดข้อมูลเพื่อแก้ไขไม่สำเร็จ", e);
  } finally {
    suppressPlanCareerWatch.value = false;
  }
}

async function onDelete(plan_id, plan_name) {
  try {
    // Check dependencies
    const resCheck = await axios.post(`${urls.rest_api}/plans/check-dependencies`, {
      plan_id: plan_id,
      type: 'single'
    });
    const hasDeps = resCheck.data.has_dependencies;
    const depCount = resCheck.data.count;

    if (hasDeps) {
      $q.dialog({
        title: "ไม่สามารถลบได้",
        message: `ไม่สามารถลบการพัฒนา [${plan_name}] ได้ เนื่องจากมีข้อมูลหลักฐาน/ผลงานที่เชื่อมโยงอยู่ ${depCount} รายการ\n\nกรุณาลบข้อมูลหลักฐานที่เกี่ยวข้องออกให้หมดก่อน (สามารถจัดการได้ที่หน้าประเมินตนเอง)`,
        ok: { label: 'รับทราบ', color: 'primary' }
      });
      return;
    }

    $q.dialog({
      title: "ยืนยันการลบ",
      message: `คุณต้องการลบการพัฒนา [${plan_name}] หรือไม่ ?`,
      cancel: true,
      persistent: true,
      ok: { label: 'ยืนยันการลบ', color: 'negative' }
    }).onOk(async () => {
      try {
        await axios.delete(`${urls.rest_api}/plans/${plan_id}`);
        $q.notify({ type: "positive", message: "ลบข้อมูลสำเร็จ" });
        await fetchTableData();
      } catch (e) {
        notifyError("ลบข้อมูลไม่สำเร็จ", e);
      }
    });
  } catch (e) {
    console.error("Dependency check failed:", e);
    $q.notify({ type: "negative", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
  }
}

function toggleSelectAll(val) {
  if (val) {
    // Select all tickable nodes
    const allIds = [];
    const traverse = (nodes) => {
      nodes.forEach((n) => {
        if (!n.noTick) allIds.push(n.id);
        if (n.children) traverse(n.children);
      });
    };
    traverse(plansTree.value);
    tickedPlans.value = allIds;
  } else {
    tickedPlans.value = [];
  }
}

// ✅ Manual Cascading Logic
watch(tickedPlans, (newVal, oldVal) => {
  const added = newVal.filter((x) => !oldVal.includes(x));
  const removed = oldVal.filter((x) => !newVal.includes(x));

  if (added.length === 1) {
    cascadeTick(added[0], true);
  } else if (removed.length === 1) {
    cascadeTick(removed[0], false);
  }
}, { deep: true });

function cascadeTick(nodeId, isTicked) {
  const node = findNodeById(plansTree.value, nodeId);
  if (!node || !node.children) return;

  const childIds = [];
  const traverse = (nodes) => {
    nodes.forEach((n) => {
      if (!n.noTick) childIds.push(n.id);
      if (n.children) traverse(n.children);
    });
  };
  traverse(node.children);

  let updated = [...tickedPlans.value];
  if (isTicked) {
    childIds.forEach((id) => {
      if (!updated.includes(id)) updated.push(id);
    });
  } else {
    updated = updated.filter((id) => !childIds.includes(id));
  }
  tickedPlans.value = updated;
}

function findNodeById(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

async function deleteSelectedPlans() {
  // Extract ONLY plan IDs from ticked nodes (id format: 'plan_X')
  const plan_ids = tickedPlans.value
    .filter((key) => String(key).startsWith("plan_") && !String(key).includes("_dev") && !String(key).includes("_title") && !String(key).includes("_ch") && !String(key).includes("_imp") && !String(key).includes("_sd") && !String(key).includes("_ed"))
    .map((key) => String(key).replace("plan_", ""))
    .map((id) => Number(id))
    .filter((id) => !isNaN(id) && id > 0);

  if (plan_ids.length === 0) {
    $q.notify({ type: "warning", message: "กรุณาเลือกรายการแผนพัฒนาที่ต้องการลบ (คลิกที่เครื่องหมายถูกหน้าแผนพัฒนา)" });
    return;
  }

  try {
    // Check dependencies for multiple records
    const resCheck = await axios.post(`${urls.rest_api}/plans/check-dependencies`, {
      type: 'bulk',
      plan_ids: plan_ids
    });
    const hasDeps = resCheck.data.has_dependencies;
    const depCount = resCheck.data.count;

    if (hasDeps) {
      $q.dialog({
        title: "ไม่สามารถลบแบบกลุ่มได้",
        message: `ไม่สามารถลบแผนพัฒนาที่เลือกได้ เนื่องจากตรวจพบข้อมูลหลักฐาน/ผลงานที่เชื่อมโยงรวม ${depCount} รายการ\n\nกรุณาลบข้อมูลหลักฐานที่เกี่ยวข้องออกให้หมดก่อนทำการลบแผนพัฒนา`,
        ok: { label: 'รับทราบ', color: 'primary' }
      });
      return;
    }

    const count = plan_ids.length;
    $q.dialog({
      title: "ยืนยันการลบแบบกลุ่ม",
      message: `คุณต้องการลบแผนพัฒนาที่เลือกทั้งสิ้น ${count} รายการ หรือไม่?`,
      cancel: true,
      persistent: true,
      ok: { label: 'ลบ', color: 'negative', flat: false },
      cancel: { label: 'ยกเลิก', color: 'primary', flat: true }
    }).onOk(async () => {
      try {
        $q.loading.show({ message: 'กำลังลบข้อมูล...' });
        const res = await axios.post(`${urls.rest_api}/plans/bulk-delete`, { plan_ids });

        if (res.data.status === 'success' || res.data.message?.includes('Complete')) {
          $q.notify({ type: "positive", message: `ลบแผนพัฒนาสำเร็จ ${count} รายการ` });
          tickedPlans.value = [];
          isAllSelected.value = false;
          await fetchTableData();
        } else {
          throw new Error(res.data.message || 'Unknown error');
        }
      } catch (e) {
        notifyError("ลบข้อมูลไม่สำเร็จ", e);
      } finally {
        $q.loading.hide();
      }
    });
  } catch (e) {
    console.error("Dependency check failed:", e);
    $q.notify({ type: "negative", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
  }
}

async function exportTable() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Self-Development Report');

    // 1. หัวรายงาน (Header)
    worksheet.mergeCells('A1:I1');
    const mainTitle = worksheet.getCell('A1');
    mainTitle.value = 'รายงานสรุปแผนการพัฒนาตนเอง (Self-Development Plan Report)';
    mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
    mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 40;

    // 2. หัวตาราง (Table Header)
    // Row 3: Main Headers
    const headerRow1 = worksheet.getRow(3);
    headerRow1.values = [
      'คุณสมบัติหรือทักษะที่ต้องการ', // A
      'ความสำคัญ',                   // B
      'ระดับ\nเป้าหมาย',               // C
      'แผนพัฒนาทักษะ (แผน 1)',        // D
      'ช่องทางการพัฒนา (แผน 1)',      // E
      'แผนพัฒนาทักษะ (แผน 2)',        // F
      'ช่องทางการพัฒนา (แผน 2)',      // G
      'แผนพัฒนาทักษะ (แผน 3)',        // H
      'ช่องทางการพัฒนา (แผน 3)'       // I
    ];
    headerRow1.height = 30;

    // Apply styles to header
    ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'].forEach(cellRef => {
      const cell = worksheet.getCell(cellRef);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.font = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // 3. ข้อมูลจาก plansTree
    const treeData = plansTree.value;
    let currentRowIndex = 4;

    treeData.forEach(career => {
      // แถวชื่ออาชีพ (Career Header)
      const cRow = worksheet.addRow([`อาชีพ: ${career.label}`, '', '', '', '', '', '', '', '']);
      cRow.font = { name: 'Sarabun', size: 12, bold: true, italic: true };
      cRow.height = 25;

      // Merge career name cell
      worksheet.mergeCells(cRow.number, 1, cRow.number, 9);
      cRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };

      // Highlight and border only for columns A-I
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(col => {
        const cell = cRow.getCell(col);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      currentRowIndex++;

      career.children.forEach((qual, index) => {
        let importance = '-', targetVal = '-';
        qual.children.forEach(c => {
          if (c.header === 'importance') importance = c.label.replace('⭐ ความสำคัญ: ', '');
          if (c.header === 'target') targetVal = c.label.replace('🎯 ค่าเป้าหมาย: ', '');
        });

        // แผน 1, 2, 3
        const dNode = qual.children.find(c => c.header === 'development_group');
        const plans = dNode ? dNode.children : [];
        const pShow = [];
        for (let i = 0; i < 3; i++) {
          if (i < plans.length) {
            const row = plans[i].rawData;
            pShow.push({ title: row.plan_title, channel: row.plan_channel });
          } else {
            pShow.push({ title: '-', channel: '-' });
          }
        }

        const dataRow = worksheet.addRow([
          qual.label,
          importance,
          targetVal,
          pShow[0].title, pShow[0].channel,
          pShow[1].title, pShow[1].channel,
          pShow[2].title, pShow[2].channel
        ]);

        dataRow.height = 25;

        // Apply styles to data cells
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(col => {
          const cell = worksheet.getCell(`${col}${dataRow.number}`);
          cell.font = { name: 'Sarabun', size: 11 };
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };

          if (col === 'A') {
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          }

          // Zebra Striping
          if (index % 2 !== 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
          }
        });

        currentRowIndex++;
      });
    });

    // ตั้งค่าความกว้างคอลัมน์
    worksheet.columns = [
      { key: 'qual', width: 40 },      // A
      { key: 'imp', width: 15 },       // B
      { key: 'target', width: 15 },    // C
      { key: 'p1', width: 25 },        // D
      { key: 'c1', width: 20 },        // E
      { key: 'p2', width: 25 },        // F
      { key: 'c2', width: 20 },        // G
      { key: 'p3', width: 25 },        // H
      { key: 'c3', width: 20 }         // I
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), (file_export.value || "Self_Development_Plan_Report").replace(/\.xlsx$/i, '') + '.xlsx');
    $q.notify({ type: "positive", message: "ส่งออกไฟล์ Excel สำเร็จ" });
  } catch (error) {
    console.error("Export Error:", error);
    $q.notify({ type: "negative", message: "ส่งออกไม่สำเร็จ: " + error.message });
  }
}

/* ----------------------------------------------------------------
 * Filters (QSelect)
 * ---------------------------------------------------------------- */
function filterPlanCareer(val, update) {
  update(() => {
    const needle = (val || "").toLowerCase();
    plan_career.options = !needle
      ? plan_career.optionsAll
      : plan_career.optionsAll.filter((v) => (v.label || "").toLowerCase().includes(needle));
  });
}

function filterQaPlanCareer(val, update) {
  update(() => {
    const needle = (val || "").toLowerCase();
    qa_plan_career.options = !needle
      ? qa_plan_career.optionsAll
      : qa_plan_career.optionsAll.filter((v) => (v.label || "").toLowerCase().includes(needle));
  });
}

function filterDevelopment(val, update) {
  update(() => {
    const needle = (val || "").toLowerCase();
    development.options = !needle
      ? development.optionsAll
      : development.optionsAll.filter((v) => (v.label || "").toLowerCase().includes(needle));
  });
}

function filterImportance(val, update) {
  update(() => {
    const needle = (val || "").toLowerCase();
    importance.options = !needle
      ? importance.optionsAll
      : importance.optionsAll.filter((v) => (v.label || "").toLowerCase().includes(needle));
  });
}

/* ----------------------------------------------------------------
 * AI Recommendation Logic
 * ---------------------------------------------------------------- */
async function recommendDevelopmentPlan() {
  if (isAiLoading.value) return;

  // ✅ guard: ต้องมี options ให้ AI เลือก id ให้ถูก
  if ((development.optionsAll || []).length === 0 || (importance.optionsAll || []).length === 0) {
    $q.notify({ type: "warning", message: "ยังโหลดข้อมูล Development/Importance ไม่ครบ กรุณาลองใหม่" });
    return;
  }

  isAiLoading.value = true;
  aiRecommendations.value = [];

  try {
    // 1) User Profile
    let profileText = "โปรไฟล์: (ไม่พบข้อมูล)";
    try {
      const res = await axios.get(`${urls.rest_api}/members?member_id=${member_id}`);
      const list = Array.isArray(res.data) ? res.data : [];
      const ind = list.find((i) => String(i.member_id) === String(member_id)) || {};
      profileText = `โปรไฟล์: สาขา ${ind.department_name || "-"}, สิ่งที่ชอบ ${ind.skill || "-"}`;
    } catch (_) { }

    // 2) Member Careers (use already loaded careers if available)
    let memberCareers = [];
    try {
      const res = await axios.get(`${urls.rest_api}/plan-careers?member_id=${member_id}`);
      memberCareers = Array.isArray(res.data) ? res.data : [];
    } catch (_) {
      memberCareers = [];
    }

    if (memberCareers.length === 0) {
      $q.notify({ type: "warning", message: "กรุณาเพิ่มอาชีพเป้าหมายในฟอร์มกำหนดคุณสมบัติก่อนขอคำแนะนำ AI" });
      return;
    }

    const devOpts = development.optionsAll.map((o) => `${o.value}:${o.label}`).join(", ");
    const impOpts = importance.optionsAll.map((o) => `${o.value}:${o.label}`).join(", ");

    const allRecommendations = [];

    let processed = 0;
    for (const career of memberCareers) {
      processed++;

      const qRes = await axios.get(`${urls.rest_api}/qa-plan-careers?plan_career_id=${career.plan_career_id}`);
      const qualsList = Array.isArray(qRes.data) ? qRes.data : [];

      if (qualsList.length === 0) {
        $q.notify({ type: "info", message: `ข้ามอาชีพ "${career.career_name}" เนื่องจากยังไม่มีคุณสมบัติ/ทักษะ` });
        continue;
      }

      $q.notify({
        type: "info",
        message: `กำลังขอคำแนะนำสำหรับอาชีพ "${career.career_name}" (${processed}/${memberCareers.length})...`,
        timeout: 1200,
      });

      const qualsContext = qualsList
        .map((q, idx) => `${idx + 1}. ${q.qualification_name} (ID:${q.qa_plan_career_id}, กลุ่ม:${q.qualification_group_name || "ทั่วไป"})`)
        .join("\n");

      const prompt = `
${profileText}

อาชีพเป้าหมาย: ${career.career_name}

คุณสมบัติ/ทักษะที่ต้องการพัฒนา:
${qualsContext}

คำขอ: แนะนำ "แผนการพัฒนาตนเอง" สำหรับอาชีพ "${career.career_name}" โดยแนะนำทุกคุณสมบัติข้างต้น

สำคัญมาก: สำหรับทุกคุณสมบัติ ต้องแนะนำ 2 แบบเสมอ:
1) การพัฒนาโดยการเรียนรู้ (Study/Learning)
2) การพัฒนาโดยการฝึกปฏิบัติ (Practice/Hands-on)

ให้เลือก:
- Development Type จาก: [${devOpts}]
- Importance จาก: [${impOpts}]

ตอบกลับเป็น JSON Array เท่านั้น:
[
  {
    "qa_plan_career_id": "ID ของคุณสมบัติ",
    "qualification_name": "ชื่อคุณสมบัติ",
    "qualification_group_name": "กลุ่มคุณสมบัติ",
    "related_career_name": "${career.career_name}",
    "plan_title": "ชื่อเรื่อง (ระบุชัดว่า การเรียน หรือ การปฏิบัติ)",
    "plan_channel": "ช่องทางที่แนะนำ",
    "development_id": "ID ของการพัฒนา",
    "importance_id": "ID ของความสำคัญ",
    "reason": "เหตุผลสั้นๆ"
  }
]
      `.trim();

      const messages = [
        {
          role: "system",
          content: "คุณเป็นที่ปรึกษา HRD ให้คำแนะนำครบทุกคุณสมบัติ ทั้งแบบเรียนและปฏิบัติ และตอบกลับเป็น JSON Array เท่านั้น",
        },
        { role: "user", content: prompt },
      ];

      const res = await axios.post(urls.chat_url, {
        messages,
        gemini_api_key: sessionStorage.getItem("gemini_api_key")
      }, { timeout: 300000 });
      const reply = res?.data?.reply || "";
      const recs = safeExtractJsonArray(reply);

      if (recs.length) {
        recs.forEach((r) => {
          allRecommendations.push({
            ...r,
            qa_plan_career_id: normalizeId(r.qa_plan_career_id),
            development_id: normalizeId(r.development_id),
            importance_id: normalizeId(r.importance_id),
            related_career_name: r.related_career_name || career.career_name,
            isEditing: false,
          });
        });
      } else {
        console.warn("AI reply cannot parse as JSON array:", reply);
      }
    }

    if (allRecommendations.length > 0) {
      aiRecommendations.value = allRecommendations;
      $q.notify({ type: "positive", message: `ได้รับคำแนะนำทั้งหมด ${allRecommendations.length} รายการ` });
    } else {
      $q.notify({ type: "warning", message: "AI ไม่สามารถสร้างคำแนะนำได้" });
    }
  } catch (e) {
    notifyError("เกิดข้อผิดพลาดในการเชื่อมต่อ AI", e);
  } finally {
    isAiLoading.value = false;
  }
}

/**
 * ✅ แนะนำแผนพัฒนาสำหรับคุณสมบัติ/ทักษะเฉพาะ (1-3 แผน)
 */
async function recommendForQualification(qual) {
  if (!qual || !qual.qa_plan_career_id) return;

  // ✅ guard: ต้องมี options ให้ AI เลือก id ให้ถูก
  if ((development.optionsAll || []).length === 0 || (importance.optionsAll || []).length === 0) {
    $q.notify({ type: "warning", message: "ยังโหลดข้อมูล Development/Importance ไม่ครบ กรุณาลองใหม่" });
    return;
  }

  loadingQualAI.value = qual.qa_plan_career_id;

  try {
    // 1) User Profile
    let profileText = "โปรไฟล์: (ไม่พบข้อมูล)";
    try {
      const res = await axios.get(`${urls.rest_api}/members?member_id=${member_id}`);
      const list = Array.isArray(res.data) ? res.data : [];
      const ind = list.find((i) => String(i.member_id) === String(member_id)) || {};
      profileText = `โปรไฟล์: สาขา ${ind.department_name || "-"}, สิ่งที่ชอบ ${ind.skill || "-"}`;
    } catch (_) { }

    const devOpts = development.optionsAll.map((o) => `${o.value}:${o.label}`).join(", ");
    const impOpts = importance.optionsAll.map((o) => `${o.value}:${o.label}`).join(", ");

    const qualsContext = `1. ${qual.qualification_name} (ID:${qual.qa_plan_career_id}, กลุ่ม:${qual.qualification_group_name || "ทั่วไป"})`;

    const prompt = `
${profileText}

อาชีพเป้าหมาย: ${qual.career_name}

คุณสมบัติ/ทักษะที่ต้องการพัฒนา:
${qualsContext}

คำขอ: แนะนำ "แผนการพัฒนาตนเอง" สำหรับอาชีพ "${qual.career_name}" โดยแนะนำทุกคุณสมบัติข้างต้น

สำคัญมาก: สำหรับทุกคุณสมบัติ ต้องแนะนำ 2 แบบเสมอ:
1) การพัฒนาโดยการเรียนรู้ (Study/Learning)
2) การพัฒนาโดยการฝึกปฏิบัติ (Practice/Hands-on)

ให้เลือก:
- Development Type จาก: [${devOpts}]
- Importance จาก: [${impOpts}]

ตอบกลับเป็น JSON Array เท่านั้น:
[
  {
    "qa_plan_career_id": "${qual.qa_plan_career_id}",
    "qualification_name": "${qual.qualification_name}",
    "qualification_group_name": "${qual.qualification_group_name || "ทั่วไป"}",
    "related_career_name": "${qual.career_name}",
    "plan_title": "ชื่อเรื่อง (ระบุชัดว่า การเรียน หรือ การปฏิบัติ)",
    "plan_channel": "ช่องทางที่แนะนำ",
    "development_id": "ID ของการพัฒนา",
    "importance_id": "ID ของความสำคัญ",
    "reason": "เหตุผลสั้นๆ"
  }
]
    `.trim();

    const messages = [
      {
        role: "system",
        content: "คุณเป็นที่ปรึกษา HRD ให้คำแนะนำครบทุกคุณสมบัติ ทั้งแบบเรียนและปฏิบัติ และตอบกลับเป็น JSON Array เท่านั้น",
      },
      { role: "user", content: prompt },
    ];

    const res = await axios.post(urls.chat_url, {
      messages,
      gemini_api_key: localStorage.getItem("gemini_api_key")
    }, { timeout: 300000 });
    const reply = res?.data?.reply || "";
    const recs = safeExtractJsonArray(reply);

    if (recs.length > 0) {
      // Remove old recommendations for this qualification
      aiRecommendations.value = aiRecommendations.value.filter(
        (r) => String(r.qa_plan_career_id) !== String(qual.qa_plan_career_id)
      );

      // Add new recommendations (limit to 3)
      const newRecs = recs.slice(0, 3).map((r) => ({
        ...r,
        qa_plan_career_id: normalizeId(qual.qa_plan_career_id),
        development_id: normalizeId(r.development_id),
        importance_id: normalizeId(r.importance_id),
        related_career_name: qual.career_name,
        qualification_name: qual.qualification_name,
        isEditing: false,
      }));

      aiRecommendations.value = [...aiRecommendations.value, ...newRecs];
      $q.notify({ type: "positive", message: `ได้รับคำแนะนำ ${newRecs.length} รายการสำหรับ "${qual.qualification_name}"` });
    } else {
      console.warn("AI reply cannot parse as JSON array:", reply);
      $q.notify({ type: "warning", message: "AI ไม่สามารถสร้างคำแนะนำได้" });
    }
  } catch (e) {
    notifyError("เกิดข้อผิดพลาดในการเชื่อมต่อ AI", e);
  } finally {
    loadingQualAI.value = null;
  }
}

async function acceptAiRecommendation(rec) {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 3);

  const payload = {
    qa_plan_career_id: normalizeId(rec.qa_plan_career_id),
    development_id: normalizeId(rec.development_id),
    importance_id: normalizeId(rec.importance_id),
    frequency_id: frequency_id.value || 1,
    plan_title: (rec.plan_title || "").trim(),
    plan_channel: (rec.plan_channel || "").trim(),
    plan_start_date: uiToApi(formatDateDDMMYYYY(startDate)),
    plan_end_date: uiToApi(formatDateDDMMYYYY(endDate)),
  };

  if (!payload.plan_title || !payload.plan_channel) {
    $q.notify({ type: "warning", message: "กรุณาระบุเรื่อง/ช่องทางให้ครบก่อนเพิ่มลงแผน" });
    return;
  }

  try {
    await axios.post(`${urls.rest_api}/plans`, payload);
    $q.notify({ type: "positive", message: `เพิ่มแผน "${payload.plan_title}" สำเร็จ` });
    
    // ✅ Remove from recommendations list
    aiRecommendations.value = aiRecommendations.value.filter(r => r !== rec);
    
    await fetchTableData(); // ✅ refresh
  } catch (e) {
    notifyError("บันทึกไม่สำเร็จ", e);
  }
}
</script>

<style lang="sass" scoped>
.bordered-scroll-area
  border: 1px solid rgba(0, 0, 0, 0.12)
  border-radius: 8px
</style>
