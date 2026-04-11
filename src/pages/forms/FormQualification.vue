<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="items-center justify-center bg-grey-2" style="min-height: 100vh;">
        <div class="full-width">
          <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
            <q-card flat class="bg-white text-black">
              <q-card-section class="bg-primary">
                <h4 class="text-h5 text-white q-my-xs text-center">{{ title }}</h4>
              </q-card-section>

              <q-card-section>
                <!-- ส่วนแนะนำคุณสมบัติด้วย AI -->
                <!-- รายการอาชีพเป้าหมายและคำแนะนำ AI -->
                <div class="row q-mb-lg">
                  <div class="col-12">
                    <q-list bordered separator class="rounded-borders bg-white shadow-1">
                      <!-- Header Item -->
                      <q-item class="bg-deep-purple-1">
                        <q-item-section avatar>
                          <q-icon name="psychology" color="deep-purple-7" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-h6 text-deep-purple-7">อาชีพเป้าหมายของคุณ</q-item-label>
                          <q-item-label caption class="text-grey-9">เลือกอาชีพที่ต้องการเพื่อให้ AI
                            ช่วยแนะนำคุณสมบัติที่เหมาะสม</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <div class="row q-gutter-sm">
                            <q-btn outline color="deep-purple-7" icon="refresh" label="ขอคำแนะนำใหม่"
                              @click="recommendQualifications()" :loading="isAiLoading && !targetCareerForAi"
                              class="q-px-sm">
                              <q-tooltip>ขอคำแนะนำทุกอาชีพ</q-tooltip>
                            </q-btn>
                            <q-btn outline color="green" icon="add_box" label="เพิ่มข้อมูลด้วยตนเอง"
                              @click="showManualFormDialog = true" class="q-px-sm">
                              <q-tooltip>เพิ่มคุณสมบัติด้วยตนเอง</q-tooltip>
                            </q-btn>
                          </div>
                        </q-item-section>
                      </q-item>

                      <!-- Career List Items (Expansion) -->
                      <q-expansion-item v-for="career in planCareerOptionsAll" :key="career.value"
                        header-class="q-py-md items-center" expand-separator default-opened>
                        <template #header>
                          <q-item-section avatar>
                            <q-avatar color="deep-purple-1" text-color="deep-purple-7" icon="work" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="text-subtitle1 text-weight-bold">{{ career.label }}</q-item-label>
                            <q-item-label caption>กลุ่มอาชีพ: {{ career.ca_group_name || 'ไม่ระบุ' }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-btn unelevated rounded color="deep-purple-7" icon="bolt" label="แนะนำคุณสมบัติ"
                              @click.stop="recommendQualifications(career.label)"
                              :loading="isAiLoading && targetCareerForAi === career.label" class="q-px-md">
                              <q-tooltip>รับคำแนะนำจาก AI สำหรับอาชีพนี้</q-tooltip>
                            </q-btn>
                          </q-item-section>
                        </template>

                        <!-- Content: AI Recommendations for this career -->
                        <div class="q-pa-md bg-grey-1">
                          <!-- Show loading if specific career is targeted OR if it's a global refresh -->
                          <div
                            v-if="isAiLoading && (String(targetCareerForAi).trim() === String(career.label).trim() || !targetCareerForAi)"
                            class="row justify-center q-pa-md">
                            <q-spinner-dots color="deep-purple" size="2em" />
                            <div class="text-grey-7 q-ml-sm">AI กำลังวิเคราะห์ข้อมูลสำหรับอาชีพนี้...</div>
                          </div>

                          <div v-else-if="aiRecommendationsGrouped[String(career.label).trim()]">
                            <q-expansion-item
                              v-for="(list, groupName) in aiRecommendationsGrouped[String(career.label).trim()]"
                              :key="groupName" class="q-mb-md overflow-hidden rounded-borders shadow-1 bg-white"
                              header-class="bg-blue-grey-1 text-blue-grey-9 text-weight-bold" expand-separator
                              default-opened>
                              <template #header>
                                <q-item-section avatar>
                                  <q-icon name="category" color="blue-grey-7" size="sm" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{ groupName }}</q-item-label>
                                  <q-item-label caption>({{ list.length }} รายการ)</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                  <q-btn flat round color="red-5" icon="delete_sweep" size="sm"
                                    @click.stop="removeAiGroup(career.label, groupName)">
                                    <q-tooltip>ลบข้อแนะนำทั้งกลุ่มนี้</q-tooltip>
                                  </q-btn>
                                </q-item-section>
                              </template>

                              <q-list separator dense>
                                <q-item v-for="(rec, index) in list" :key="index" class="q-py-md">
                                  <q-item-section>
                                    <div class="row items-center q-gutter-x-sm">
                                      <div class="col-grow" v-if="!rec.isEditing">
                                        <q-item-label class="text-weight-bold">{{ rec.qualification_name
                                          }}</q-item-label>
                                      </div>
                                      <div class="col-grow column q-gutter-y-xs" v-else>
                                        <q-input standout="bg-primary text-white" dense v-model="rec.qualification_name" label="ชื่อทักษะ"
                                          autofocus />
                                        <q-select standout="bg-primary text-white" dense v-model="rec.qualification_group_name"
                                          :options="qualificationGroupOptionsAll" label="กลุ่มทักษะ" />
                                      </div>
                                      <div class="row q-gutter-xs">
                                        <q-btn v-if="!rec.isEditing" flat round color="grey-7" icon="edit" size="sm"
                                          @click="rec.isEditing = true" />
                                        <q-btn v-else flat round color="positive" icon="check" size="sm"
                                          @click="rec.isEditing = false" />
                                        <q-btn flat round color="red-4" icon="close" size="sm"
                                          @click="removeAiRecommendation(rec)">
                                          <q-tooltip>ลบข้อแนะนำนี้</q-tooltip>
                                        </q-btn>
                                      </div>
                                    </div>
                                    <q-item-label caption class="q-mt-xs text-grey-8">
                                      <strong>เหตุผล:</strong> {{ rec.reason }}
                                    </q-item-label>
                                    <div class="row q-col-gutter-sm q-mt-sm">
                                      <div class="col-12 col-sm-6">
                                        <q-select dense outlined options-dense label="เป้าหมาย" v-model="rec.target_id"
                                          :options="targetOptionsAll" emit-value map-options />
                                        <div class="text-caption text-grey-7 q-mt-xs" v-if="rec.target_reason">
                                          {{ rec.target_reason }}
                                        </div>
                                      </div>
                                      <div class="col-12 col-sm-6">
                                        <q-select dense outlined options-dense label="ความสำคัญ" v-model="rec.level_id"
                                          :options="levelOptionsAll" emit-value map-options />
                                        <div class="text-caption text-grey-7 q-mt-xs" v-if="rec.level_reason">
                                          {{ rec.level_reason }}
                                        </div>
                                      </div>
                                    </div>
                                  </q-item-section>
                                  <q-item-section side top>
                                    <q-btn unelevated color="positive" icon="add_circle" label="เพิ่ม"
                                      @click="acceptAiRecommendation(rec, career.label)" />
                                  </q-item-section>
                                </q-item>
                              </q-list>
                            </q-expansion-item>
                          </div>

                          <div v-else class="text-center q-pa-md text-grey-6 border-dashed rounded-borders">
                            ยังไม่มีคำแนะนำ (กดปุ่ม "แนะนำคุณสมบัติ" เพื่อเริ่มสายฟ้า)
                          </div>
                        </div>
                      </q-expansion-item>

                      <q-item v-if="planCareerOptionsAll.length === 0" class="text-center q-pa-lg">
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
                      <q-card-section class="bg-blue-1 text-blue-9 row items-center justify-between">
                        <div class="text-h6"><q-icon name="account_tree" /> รายการคุณสมบัติ (โครงสร้างต้นไม้)</div>
                        <div class="row q-gutter-sm items-center">
                          <q-input borderless dense v-model="file_export" placeholder="ชื่อไฟล์ CSV" outlined
                            style="width: 150px" class="q-mr-sm">
                            <template v-slot:append><q-icon name="save" /></template>
                          </q-input>
                          <q-btn flat icon="archive" label="ส่งออก excel" @click="exportTable"
                            :size="btnSize" />
                          <q-checkbox v-model="isSelectAll" label="เลือกทั้งหมด" color="primary" dense
                            @update:model-value="toggleSelectAll" class="q-mx-sm" />
                          <q-btn v-if="tickedQualifications.length > 0" color="red" icon="delete_sweep"
                            label="ลบที่เลือก" @click="deleteSelected" class="q-ml-sm" :size="btnSize" />
                        </div>
                      </q-card-section>
                      <q-card-section class="q-pa-none">
                        <div v-if="loading" class="row justify-center q-pa-md">
                          <q-spinner color="primary" size="3em" />
                        </div>
                        <q-tree v-else v-model:ticked="tickedQualifications" :nodes="qualificationsTree" node-key="id"
                          tick-strategy="strict" :filter="treeFilter" default-opened-all class="q-pa-md">
                          <template #default-header="prop">
                            <div class="row items-center full-width justify-between">
                              <div class="row items-center">
                                <q-icon :name="prop.node.icon" :color="prop.node.color || 'primary'" class="q-mr-sm" />
                                <div :class="prop.node.type === 'qualification' ? 'text-weight-bold text-primary' : ''">
                                  {{ prop.node.label }}
                                </div>
                              </div>
                              <div v-if="prop.node.type === 'qualification'" class="row q-gutter-xs">
                                <q-btn flat round color="blue" icon="edit" size="sm"
                                  @click.stop="editItem(prop.node.rawData)">
                                  <q-tooltip>แก้ไขข้อมูลนี้</q-tooltip>
                                </q-btn>
                                <q-btn flat round color="red" icon="delete" size="sm"
                                  @click.stop="deleteItem(prop.node.rawData)">
                                  <q-tooltip>ลบข้อมูลนี้</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </template>
                        </q-tree>
                        <div v-if="!loading && qualificationsTree.length === 0" class="text-center q-pa-lg text-grey">
                          ยังไม่มีข้อมูลบันทึกไว้
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="row justify-center items-center q-gutter-sm q-mt-sm q-mb-md">
                  <q-btn icon="logout" label="ออก" color="primary" flat to="/" :size="btnSize" />
                  <q-btn color="primary" label="กลับฟอร์มอาชีพเป้าหมาย" no-caps flat icon="skip_previous"
                    to="/FormPlanCareer" :size="btnSize" />
                  <q-btn color="primary" label="ไปฟอร์มพัฒนาตนเอง" no-caps flat icon="skip_next" to="/FormPlan"
                    :size="btnSize" />
                </div>

              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>

      <!-- Manual Form Dialog -->
      <q-dialog v-model="showManualFormDialog" persistent>
        <q-card style="min-width: 600px; max-width: 90vw;">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ isEdit ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลคุณสมบัติ' }}</div>
          </q-card-section>
          <q-card-section>
            <q-form ref="formRef" @submit.prevent="submitForm" @reset="resetForm" class="q-gutter-sm">
              <!-- Form Inputs -->
              <div class="row q-col-gutter-sm">
                <!-- อาชีพเป้าหมาย (จากแผน) -->
                <div class="col-md-6 col-xs-12">
                  <q-select v-model="planCareerModel" :options="planCareerOptions" label="อาชีพเป้าหมาย *" use-input
                    input-debounce="0" dense outlined options-dense @filter="filterPlanCareer" color="primary"
                    @update:model-value="onPlanCareerChange" :rules="[(v) => !!v || 'กรุณาเลือกอาชีพเป้าหมาย']"
                    data-testid="select-target-career">
                    <template #prepend><q-icon name="work_history" /></template>
                    <template #option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar><q-icon name="work" /></q-item-section>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                          <q-item-label caption>กลุ่ม: {{ scope.opt.ca_group_name }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- กลุ่มอาชีพ (Readonly) -->
                <div class="col-md-6 col-xs-12">
                  <q-input v-model="caGroupName" label="กลุ่มอาชีพ" dense outlined readonly
                    :hint="caGroupName ? '' : 'เลือกอาชีพเป้าหมายเพื่อแสดงกลุ่ม'">
                    <template #prepend><q-icon name="school" /></template>
                  </q-input>
                </div>

                <!-- คุณสมบัติ + ปุ่มแก้ไขข้อความคุณสมบัติ -->
                <div class="col-md-6 col-xs-12">
                  <div class="row items-center q-col-gutter-sm">
                    <div class="col">
                      <q-select for="qualification-select-id" v-model="qualificationModel"
                        :options="qualificationOptions" label="คุณสมบัติที่ต้องการ *" use-input input-debounce="0" dense
                        outlined options-dense @filter="filterQualification" @new-value="onNewQualification" color="primary"
                        @update:model-value="onQualificationChange" :rules="[(v) => !!v || 'กรุณาเลือก/เพิ่มคุณสมบัติ']"
                        data-testid="select-qualification-name">
                        <template #prepend><q-icon name="fact_check" /></template>
                        <template #no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              ไม่พบ คุณสมบัติ/ทักษะใหม่ (กด Enter เพื่อเพิ่ม)
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 col-xs-12">
                  <q-select for="qualification-group-select-id" v-model="qualificationGroupName"
                    :options="qualificationGroupOptions" label="กลุ่มคุณสมบัติ" use-input input-debounce="0" dense
                    outlined options-dense @filter="filterQualificationGroup" color="primary" data-testid="select-qualification-group">
                    <template #prepend><q-icon name="category" /></template>
                  </q-select>
                </div>

                <!-- ค่าเป้าหมาย -->
                <div class="col-md-6 col-xs-12">
                  <q-select for="target-select-id" v-model="targetModel" :options="targetOptions" label="ค่าเป้าหมาย *"
                    emit-value map-options dense outlined options-dense :rules="[(v) => !!v || 'กรุณาเลือกค่าเป้าหมาย']" color="primary"
                    data-testid="select-target-value">
                    <template #prepend><q-icon name="flag_circle" /></template>
                  </q-select>
                </div>

                <!-- ระดับความสำคัญ -->
                <div class="col-md-6 col-xs-12">
                  <q-select for="level-select-id" v-model="levelModel" :options="levelOptions" label="ระดับความสำคัญ *"
                    emit-value map-options dense outlined options-dense
                    :rules="[(v) => !!v || 'กรุณาเลือกระดับความสำคัญ']" color="primary" data-testid="select-level">
                    <template #prepend><q-icon name="running_with_errors" /></template>
                  </q-select>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="row justify-center items-center q-gutter-sm q-mt-sm q-mb-md">
                <q-btn :label="btnLabel" type="submit" color="primary" icon="save" unelevated :size="btnSize"
                  class="q-px-md" data-testid="btn-submit-qual" />
                <q-btn label="ยกเลิก" type="reset" color="primary" outline icon="clear" :size="btnSize"
                  class="q-px-md" />
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
import { onMounted, reactive, ref, computed, watch } from "vue";
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
  chat_url: getChatUrl(store)
});

// UI State
const title = ref("คุณสมบัติ/ทักษะ (Qualifications)");
const btnLabel = ref("เพิ่มข้อมูล");
const isEdit = ref(false);
const loading = ref(false);
const formRef = ref(null);
const showManualFormDialog = ref(false);
const treeFilter = ref("");

// Responsive button size
const btnSize = computed(() => ($q.screen.lt.sm ? "sm" : "md"));

// Data Models
const currentEditId = ref(null);

const planCareerModel = ref(null);
const caGroupName = ref("");

const qualificationModel = ref(null);
const qualificationGroupName = ref("");

const targetModel = ref(null);
const levelModel = ref(null);

// Options
const planCareerOptions = ref([]);
const planCareerOptionsAll = ref([]);

const qualificationOptions = ref([]);
const qualificationOptionsAll = ref([]);

const qualificationGroupOptions = ref([]);
const qualificationGroupOptionsAll = ref([]);
const masterGroups = ref([]);

const targetOptions = ref([]);
const targetOptionsAll = ref([]);

const levelOptions = ref([]);
const levelOptionsAll = ref([]);

// Table Data
const qualificationsList = ref([]);
const tickedQualifications = ref([]);
const isSelectAll = ref(false);
const individual = ref({});
const file_export = ref("คุณสมบัติและทักษะ");

const qualificationsTree = computed(() => {
  const tree = [];
  const careerGroups = {};

  qualificationsList.value.forEach((row) => {
    const careerName = row.career_name || "ไม่ระบุอาชีพ";
    if (!careerGroups[careerName]) {
      careerGroups[careerName] = {
        id: `c_${row.plan_career_id}`,
        label: careerName,
        icon: "work",
        children: [],
        // noTick: true removed to allow selecting career
      };
      tree.push(careerGroups[careerName]);
    }

    careerGroups[careerName].children.push({
      id: `q_${row.qa_plan_career_id}`,
      label: row.qualification_name,
      icon: "fact_check",
      type: "qualification",
      rawData: row,
      children: [
        {
          id: `qi_${row.qa_plan_career_id}_l`,
          label: `ระดับความสำคัญ: ${row.level_description}`,
          icon: "star_rate",
          color: "orange",
          noTick: true
        },
        {
          id: `qi_${row.qa_plan_career_id}_t`,
          label: `ค่าเป้าหมาย: ${row.target_name} (${row.target_value})`,
          icon: "flag",
          color: "blue",
          noTick: true
        }
      ]
    });
  });

  return tree;
});

// AI State
const isAiLoading = ref(false);
const targetCareerForAi = ref(null);
// const showAiDialog = ref(false); // Unused
const aiRecommendations = ref([]);

const aiRecommendationsGrouped = computed(() => {
  const grouped = {};
  aiRecommendations.value.forEach((rec) => {
    // Group by career label exactly as it appears in our database options
    const careerKey = String(rec.related_career_name || "คำแนะนำทั่วไป").trim();
    const groupKey = String(rec.qualification_group_name || "อื่นๆ").trim();

    if (!grouped[careerKey]) grouped[careerKey] = {};
    if (!grouped[careerKey][groupKey]) grouped[careerKey][groupKey] = [];

    grouped[careerKey][groupKey].push(rec);
  });
  return grouped;
});

/* ----------------------------------------------------------------
 * Initializers
 * ---------------------------------------------------------------- */
function initUrls() {
  urls.rest_api = getRestApiUrl(store);
}

onMounted(async () => {
  initUrls();
  await Promise.all([fetchPlanCareers(), fetchQualifications(), fetchMasterGroups(), fetchTargets(), fetchLevels(), fetchTableData(), fetchIndividualData()]);
  // recommendQualifications();
});

/* ----------------------------------------------------------------
 * API Fetching
 * ---------------------------------------------------------------- */
async function fetchPlanCareers() {
  try {
    const res = await axios.get(`${urls.rest_api}/plan-careers`);
    const rows = res.data || [];
    const opts = rows.map((r) => ({
      label: r.career_name,
      value: r.plan_career_id,
      ca_group_name: r.ca_group_name,
      career_name: r.career_name
    }));

    planCareerOptions.value = opts;
    planCareerOptionsAll.value = opts;
  } catch (e) {
    console.error("fetchPlanCareers error", e);
  }
}

async function fetchQualifications() {
  try {
    const res = await axios.get(`${urls.rest_api}/qualifications/list`);
    const rows = res.data || [];
    const opts = rows.map((r) => ({
      label: r.qualification_name,
      value: r.qualification_id,
      qualification_group_name: r.qualification_group_name
    }));
    qualificationOptions.value = opts;
    qualificationOptionsAll.value = opts;
  } catch (e) {
    console.error("fetchQualifications error", e);
  }
}

async function fetchMasterGroups() {
  try {
    const res = await axios.get(`${urls.rest_api}/references/qualification-groups`);
    const rows = res.data || [];
    masterGroups.value = rows;
    const groups = rows.map(g => g.qualification_group_name).filter(Boolean);
    qualificationGroupOptionsAll.value = [...new Set(groups)];
  } catch (e) {
    console.error("fetchMasterGroups error", e);
  }
}

async function getOrCreateGroup(groupName) {
  if (!groupName) return null;
  const name = typeof groupName === 'string' ? groupName.trim() : groupName;
  if (!name) return null;

  try {
    // 1) Ensure we have groups
    if (masterGroups.value.length === 0) {
      await fetchMasterGroups();
    }
    const groups = masterGroups.value;

    // 2) Find match (case-insensitive, trimmed)
    const match = groups.find(g =>
      String(g.qualification_group_name || "").trim().toLowerCase() === String(name).toLowerCase()
    );
    if (match) return match.qualification_group_id;

    // 3) Fallback: Return "Other/อื่นๆ" ID if exists, or first available if mandatory?
    // User requirement: "ต้องมาจากฐานข้อมูล".
    // If not found, look for "อื่นๆ"
    const otherMatch = groups.find(g =>
      ["อื่นๆ", "other", "ทั่วไป", "general"].some(k =>
        String(g.qualification_group_name || "").toLowerCase().includes(k)
      )
    );

    if (otherMatch) return otherMatch.qualification_group_id;

    // If absolutely nothing found, return null (it will be NULL in DB)
    return null;
  } catch (e) {
    console.error("getOrCreateGroup error", e);
    return null;
  }
}

async function fetchTargets() {
  try {
    const res = await axios.get(`${urls.rest_api}/references/targets`);
    const rows = res.data || [];
    const opts = rows.map((r) => ({
      label: r.target_name,
      value: r.target_id
    }));
    targetOptions.value = opts;
    targetOptionsAll.value = opts;
  } catch (e) {
    console.error("fetchTargets error", e);
  }
}

async function fetchLevels() {
  try {
    const res = await axios.get(`${urls.rest_api}/references/levels`);
    const rows = res.data || [];
    const opts = rows.map((r) => ({
      label: r.level_description,
      value: r.level_id
    }));
    levelOptions.value = opts;
    levelOptionsAll.value = opts;
  } catch (e) {
    console.error("fetchLevels error", e);
  }
}

async function fetchTableData() {
  loading.value = true;
  try {
    const res = await axios.get(`${urls.rest_api}/qa-plan-careers`);
    qualificationsList.value = res.data || [];
  } catch (e) {
    console.error("fetchTableData error", e);
  } finally {
    loading.value = false;
  }
}

async function fetchIndividualData() {
  const member_id = store.getters.myMember_id;
  try {
    const res = await axios.get(`${urls.rest_api}/members/${member_id}/individual`);
    individual.value = res.data || {};
  } catch (e) {
    console.error("fetchIndividualData error", e);
  }
}

/* ----------------------------------------------------------------
 * Form Logic
 * ---------------------------------------------------------------- */
function filterPlanCareer(val, update) {
  if (!val) {
    update(() => (planCareerOptions.value = planCareerOptionsAll.value));
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    planCareerOptions.value = planCareerOptionsAll.value.filter((v) => v.label.toLowerCase().includes(needle));
  });
}

function onPlanCareerChange(val) {
  caGroupName.value = val?.ca_group_name || "";
  // Clear dependent fields
  qualificationModel.value = null;
  qualificationGroupName.value = "";
  qualificationOptions.value = qualificationOptionsAll.value;
}

function filterQualification(val, update) {
  if (!val) {
    update(() => (qualificationOptions.value = qualificationOptionsAll.value));
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    qualificationOptions.value = qualificationOptionsAll.value.filter((v) => v.label.toLowerCase().includes(needle));
  });
}

function filterQualificationGroup(val, update) {
  if (!val) {
    update(() => (qualificationGroupOptions.value = qualificationGroupOptionsAll.value));
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    qualificationGroupOptions.value = qualificationGroupOptionsAll.value.filter((v) => v.toLowerCase().includes(needle));
  });
}


async function onNewQualification(val, done) {
  const name = val.trim();
  if (!name) return;

  // 1) Check for existing (case-insensitive)
  const existing = qualificationOptionsAll.value.find(
    (q) => q.label.toLowerCase() === name.toLowerCase()
  );

  if (existing) {
    $q.notify({
      type: "warning",
      message: "คุณสมบัติ/ทักษะนี้มีอยู่ในฐานข้อมูลอยู่แล้ว",
      caption: "ระบบได้ทำการเลือกรายการที่มีอยู่ให้ท่านแล้ว"
    });
    done(existing, "add-unique");
    return;
  }

  // 2) If not exists, show confirmation dialog before saving
  $q.dialog({
    title: "ยืนยันการเพิ่มคุณสมบัติใหม่",
    message: `คุณต้องการเพิ่มคุณสมบัติ/ทักษะ "${name}" ลงในฐานข้อมูลหรือไม่?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      // 1. บันทึกข้อมูลลงฐานข้อมูล
      const groupId = await getOrCreateGroup(qualificationGroupName.value);
      await axios.post(`${urls.rest_api}/qualifications`, {
        qualification_name: name,
        qualification_group_id: groupId
      });

      // 2. Refresh qualifications list
      await fetchQualifications();

      // 3. แสดง notification หลังจากบันทึกลงฐานข้อมูลสำเร็จ
      $q.notify({
        type: "positive",
        message: "เพิ่มคุณสมบัติใหม่สำเร็จ"
      });

      // 4. Find the newly created qualification and select it
      const newQual = qualificationOptionsAll.value.find(
        (q) => q.label.toLowerCase() === name.toLowerCase()
      );

      if (newQual) {
        done(newQual, "add-unique");
      } else {
        done(name, "add-unique");
      }

    } catch (e) {
      console.error(e);
      $q.notify({ type: "negative", message: "เพิ่มคุณสมบัติไม่สำเร็จ" });
      done();
    }
  });
}

async function onQualificationChange(val) {
  if (!val) return;

  qualificationGroupName.value = val?.qualification_group_name || "";

  // Optional: If we want to notify even on selection from the list
  // but maybe only if it was "searched" and selected?
  // Let's keep it simple: the user wants to know if they are using an existing one.
  // Actually, @new-value is for CREATING. If they pick from list, they KNOW it exists.
  // But our test types it.
}



function resetForm() {
  isEdit.value = false;
  btnLabel.value = "เพิ่มข้อมูล";
  currentEditId.value = null;

  planCareerModel.value = null;
  caGroupName.value = "";

  qualificationModel.value = null;
  qualificationGroupName.value = "";

  targetModel.value = null;
  targetModel.value = null;
  levelModel.value = null;
  showManualFormDialog.value = false;
}

async function submitForm() {
  const ok = await formRef.value?.validate?.();
  if (!ok) return;

  const payload = {
    plan_career_id: planCareerModel.value.value,
    qualification_id: qualificationModel.value.value,
    level_id: levelModel.value,
    target_id: targetModel.value
  };

  try {
    // 1) Handle potential group change/assignment for the qualification
    const groupId = await getOrCreateGroup(qualificationGroupName.value);

    // 2) Update qualification master if group changed/added
    await axios.put(`${urls.rest_api}/qualifications/${payload.qualification_id}`, {
      qualification_name: qualificationModel.value.label,
      qualification_group_id: groupId
    });

    if (!isEdit.value) {
      await axios.post(`${urls.rest_api}/qa-plan-careers`, payload);
      $q.notify({ type: "positive", message: "บันทึกข้อมูลสำเร็จ" });
    } else {
      await axios.put(`${urls.rest_api}/qa-plan-careers/${currentEditId.value}`, payload);
      $q.notify({ type: "positive", message: "แก้ไขข้อมูลสำเร็จ" });
    }

    await fetchTableData();
    resetForm();
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "บันทึกข้อมูลไม่สำเร็จ" });
  }
}

function editItem(row) {
  isEdit.value = true;
  btnLabel.value = "แก้ไขข้อมูล";
  currentEditId.value = row.qa_plan_career_id;

  const pc = planCareerOptionsAll.value.find((p) => String(p.value) === String(row.plan_career_id));
  if (pc) {
    planCareerModel.value = pc;
    caGroupName.value = pc.ca_group_name;
  }

  const q = qualificationOptionsAll.value.find((o) => String(o.value) === String(row.qualification_id));
  if (q) {
    qualificationModel.value = q;
    qualificationGroupName.value = q.qualification_group_name;
  }

  targetModel.value = row.target_id;
  targetModel.value = row.target_id;
  levelModel.value = row.level_id;

  showManualFormDialog.value = true;
}

async function deleteItem(row) {
  try {
    // Check dependencies
    const resCheck = await axios.post(`${urls.rest_api}/qa-plan-careers/check-dependencies`, {
      id: row.qa_plan_career_id,
      type: 'single'
    });

    const { plan_count, assessment_count } = resCheck.data;
    const hasDeps = plan_count > 0 || assessment_count > 0;

    if (hasDeps) {
      let msg = `ไม่สามารถลบคุณสมบัติ "${row.qualification_name}" ได้ เนื่องจากมีข้อมูลที่เกี่ยวข้อง:\n`;
      if (plan_count > 0) msg += `- แผนการพัฒนา ${plan_count} รายการ\n`;
      if (assessment_count > 0) msg += `- ผลการประเมินและหลักฐาน ${assessment_count} รายการ\n`;
      msg += "\nกรุณาลบข้อมูลทักษะ/แผน/ผลประเมินที่เกี่ยวข้องออกให้หมดก่อน";

      $q.dialog({
        title: "ไม่สามารถลบได้",
        message: msg,
        ok: { label: 'รับทราบ', color: 'primary' }
      });
      return;
    }

    $q.dialog({
      title: "ยืนยันการลบ",
      message: `ต้องการลบข้อมูลคุณสมบัติ "${row.qualification_name}" ของอาชีพ "${row.career_name}" หรือไม่?`,
      cancel: true,
      persistent: true,
      ok: { label: 'ยืนยันการลบ', color: 'negative' }
    }).onOk(async () => {
      try {
        await axios.delete(`${urls.rest_api}/qa-plan-careers/${row.qa_plan_career_id}`);
        $q.notify({ type: "positive", message: "ลบข้อมูลสำเร็จ" });
        await fetchTableData();
      } catch (e) {
        console.error(e);
        $q.notify({ type: "negative", message: "ลบข้อมูลไม่สำเร็จ" });
      }
    });
  } catch (e) {
    console.error("Dependency check failed:", e);
    $q.notify({ type: "negative", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
  }
}

function toggleSelectAll(val) {
  if (val) {
    const allIds = [];
    const traverse = (nodes) => {
      nodes.forEach((n) => {
        if (!n.noTick) allIds.push(n.id);
        if (n.children) traverse(n.children);
      });
    };
    traverse(qualificationsTree.value);
    tickedQualifications.value = allIds;
  } else {
    tickedQualifications.value = [];
  }
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

function cascadeTick(nodeId, isTicked) {
  const node = findNodeById(qualificationsTree.value, nodeId);
  if (!node || !node.children) return;

  const childIds = [];
  const traverse = (nodes) => {
    nodes.forEach((n) => {
      if (!n.noTick) childIds.push(n.id);
      if (n.children) traverse(n.children);
    });
  };
  traverse(node.children);

  let updated = [...tickedQualifications.value];
  if (isTicked) {
    childIds.forEach((id) => {
      if (!updated.includes(id)) updated.push(id);
    });
  } else {
    updated = updated.filter((id) => !childIds.includes(id));
  }
  tickedQualifications.value = updated;
}

async function deleteSelected() {
  const selectedIds = tickedQualifications.value
    .filter((id) => id.startsWith("q_"))
    .map((id) => parseInt(id.replace("q_", "")));

  if (selectedIds.length === 0) return;

  try {
    // Check dependencies for multiple records
    const resCheck = await axios.post(`${urls.rest_api}/qa-plan-careers/check-dependencies`, {
      type: 'bulk',
      ids: selectedIds
    });

    const { plan_count, assessment_count } = resCheck.data;
    const hasDeps = plan_count > 0 || assessment_count > 0;

    if (hasDeps) {
      let msg = `ไม่สามารถลบรายการที่เลือกได้ เนื่องจากตรวจพบข้อมูลที่เกี่ยวข้อง:\n`;
      if (plan_count > 0) msg += `- แผนการพัฒนา ${plan_count} รายการ\n`;
      if (assessment_count > 0) msg += `- ผลการประเมินและหลักฐาน ${assessment_count} รายการ\n`;
      msg += "\nกรุณาลบข้อมูลที่เกี่ยวข้องออกให้หมดก่อนทำการลบแบบกลุ่ม";

      $q.dialog({
        title: "ไม่สามารถลบแบบกลุ่มได้",
        message: msg,
        ok: { label: 'รับทราบ', color: 'primary' }
      });
      return;
    }

    $q.dialog({
      title: "ยืนยันการลบแบบกลุ่ม",
      message: `ต้องการลบข้อมูลคุณสมบัติที่เลือกทั้งหมด ${selectedIds.length} รายการหรือไม่?`,
      cancel: true,
      persistent: true,
      ok: { label: 'ยืนยันการลบ', color: 'negative' }
    }).onOk(async () => {
      try {
        await axios.post(`${urls.rest_api}/qa-plan-careers/bulk-delete`, {
          qa_plan_career_ids: selectedIds
        });
        $q.notify({ type: "positive", message: "ลบข้อมูลที่เลือกสำเร็จ" });
        tickedQualifications.value = [];
        isSelectAll.value = false;
        await fetchTableData();
      } catch (e) {
        console.error(e);
        $q.notify({ type: "negative", message: "ลบข้อมูลที่เลือกไม่สำเร็จ" });
      }
    });
  } catch (e) {
    console.error("Dependency check failed:", e);
    $q.notify({ type: "negative", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
  }
}

watch(tickedQualifications, (newTicks, oldTicks) => {
  // Cascading logic
  if (newTicks.length > oldTicks.length) {
    const added = newTicks.filter(x => !oldTicks.includes(x));
    if (added.length === 1) cascadeTick(added[0], true);
  } else if (oldTicks.length > newTicks.length) {
    const removed = oldTicks.filter(x => !newTicks.includes(x));
    if (removed.length === 1) cascadeTick(removed[0], false);
  }

  const totalItems = qualificationsList.value.length;
  // Note: Selection status for "Select All" checkbox is complex with nested tree
  // We'll just reset isSelectAll if empty
  if (newTicks.length === 0) {
    isSelectAll.value = false;
  }
});

/* ----------------------------------------------------------------
 * CSV Export
 * ---------------------------------------------------------------- */
async function exportTable() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Qualifications Report');

    // 1. หัวรายงาน
    worksheet.mergeCells('A1:C1');
    const mainTitle = worksheet.getCell('A1');
    mainTitle.value = 'รายงานสรุปคุณสมบัติและทักษะที่ต้องการ (Qualifications & Skills Report)';
    mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
    mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 40;

    // 2. หัวตาราง
    const headerRow = worksheet.getRow(3);
    headerRow.values = ['คุณสมบัติหรือทักษะที่ต้องการ', 'ความสำคัญ', 'ระดับเป้าหมาย'];
    headerRow.height = 30;

    ['A3', 'B3', 'C3'].forEach(cellRef => {
      const cell = worksheet.getCell(cellRef);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.font = { name: 'Sarabun', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // 3. ข้อมูลจาก qualificationsTree
    const treeData = qualificationsTree.value;
    let currentRowIndex = 4;

    treeData.forEach(career => {
      // แถวชื่ออาชีพ (Career Header)
      // ไม่ต้อง mergeCells เพื่อให้สีพื้นหลังยาวออกไปได้ถ้าต้องการ (หรือถ้าต้องการแค่ highlight แถว 3 col ก็ merge แล้วใส่สี)
      // โจทย์ข้อ 1: "ปรับปรุง สีเทา highlight อาชีพ ออกนอก columns" -> เข้าใจว่าต้องการให้แถบสีheaderอาชีพยาวไปเลยโดยไม่ต้อง merge
      // แต่ exceljs การ highlight "ออกนอก column" ปกติคือต้องใส่ fill ให้ cell อื่นด้วย หรือไม่ก็ไม่ merge แต่ใส่ fill cell A,B,C...

      // แต่ถ้า "ออกนอก column" หมายถึงให้มันดูเหมือน header section แยกออกมา
      // การ merge A-C แล้วใส่สี คือ "อยู่ใน column"
      // การไม่ merge แล้วใส่สีที่ row ก็จะยาวไปสุด sheet
      // จะลองใช้วิธี ใส่ fill ให้ row เลย

      const cRow = worksheet.addRow([`อาชีพ: ${career.label}`, '', '']);
      worksheet.mergeCells(cRow.number, 1, cRow.number, 3);
      cRow.font = { name: 'Sarabun', size: 12, bold: true, italic: true };
      cRow.height = 25;
      cRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };

      // Highlight and border only for columns A, B, C
      ['A', 'B', 'C'].forEach(col => {
        const cell = cRow.getCell(col);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      currentRowIndex++;

      career.children.forEach((qual, index) => {
        const raw = qual.rawData || {};

        const dataRow = worksheet.addRow([
          qual.label,
          raw.level_description || '-',
          `${raw.target_name || ''} (${raw.target_value || ''})`
        ]);

        dataRow.height = 25;

        // Apply styles to data cells
        ['A', 'B', 'C'].forEach(col => {
          const cell = worksheet.getCell(`${col}${dataRow.number}`);
          cell.font = { name: 'Sarabun', size: 11 };
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };

          if (col === 'A') {
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
          } else if (col === 'C') {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }

          // Zebra Striping
          if (index % 2 !== 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
          }
        });

        currentRowIndex++;
      });
    });

    // ตั้งค่าความกว้างคอลัมน์ (ปรับให้กว้างขึ้น)
    worksheet.getColumn('A').width = 60; // คุณสมบัติ
    worksheet.getColumn('B').width = 30; // ความสำคัญ
    worksheet.getColumn('C').width = 35; // ระดับเป้าหมาย

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), (file_export.value || "Qualifications_Report").replace(/\.(xlsx|csv)$/i, '') + '.xlsx');
    $q.notify({ type: "positive", message: "ส่งออกไฟล์ Excel สำเร็จ" });
  } catch (error) {
    console.error("Export Error:", error);
    $q.notify({ type: "negative", message: "ส่งออกไม่สำเร็จ: " + error.message });
  }
}

function wrapCsvValue(val) {
  const s = val === void 0 || val === null ? "" : String(val);
  return `"${s.split('"').join('""')}"`;
}

/* ----------------------------------------------------------------
 * AI Recommendation
 * ---------------------------------------------------------------- */
async function recommendQualifications(specificCareer = null) {
  if (isAiLoading.value) return;
  targetCareerForAi.value = specificCareer;
  isAiLoading.value = true;

  try {
    const memberId = store.getters.myMember_id;

    let profileText = "";
    try {
      const res = await axios.get(`${urls.rest_api}/individuals`);
      const ind = (res.data || [])[0] || {};
      profileText = `
โปรไฟล์นักเรียน:
- สาขา: ${ind.department_name || "-"}
- สิ่งที่ชอบ/ถนัด: ${ind.favorite_subject || ind.skill || "-"}
      `.trim();
    } catch (e) {
      profileText = "โปรไฟล์นักเรียน: (ไม่พบข้อมูล)";
    }

    const careers = specificCareer ? specificCareer : planCareerOptionsAll.value.map((c) => c.label).join(", ");
    if (!careers) {
      $q.notify({ type: "warning", message: "กรุณาเพิ่มอาชีพเป้าหมายในแผนก่อนขอคำแนะนำ" });
      return;
    }

    const targetOptsTxt = targetOptionsAll.value.map((t) => `${t.value}:${t.label}`).join(", ");
    const levelOptsTxt = levelOptionsAll.value.map((l) => `${l.value}:${l.label}`).join(", ");

    // Use master groups if available, otherwise fallback to existing ones
    if (qualificationGroupOptionsAll.value.length === 0) {
      await fetchMasterGroups();
    }
    const groupOptsTxt = qualificationGroupOptionsAll.value.length > 0
      ? qualificationGroupOptionsAll.value.join(", ")
      : "Hard Skills, Soft Skills, Technology, Language";

    const prompt = `
${profileText}
อาชีพเป้าหมายของฉันคือ: [${careers}]

คำขอ: ช่วยแนะนำคุณสมบัติ/ทักษะ (Qualifications/Skills) ที่จำเป็นสำหรับการประกอบอาชีพเหล่านี้ โดยแยกเป็นรายอาชีพ
ให้แนะนำคุณสมบัติ/ทักษะสำหรับ *อาชีพที่ระบุข้างต้น* อย่างน้อยอาชีพละ 1-2 รายการ

ขั้นตอนการประมวลผลสำคัญ (ลำดับความสำคัญ):
1. [วิเคราะห์ทักษะ]: ระบุ "คุณสมบัติ/ทักษะ" (Qualification/Skill) ที่จำเป็นจริงๆ สำหรับประกอบอาชีพนั้นเป็นอันดับแรก
2. [จัดกลุ่มทักษะ]: นำคุณสมบัติที่ระบุได้จากข้อ 1 มาพิจารณาคัดเลือกเข้าสู่ "กลุ่มคุณสมบัติ" (Qualification Group) โดยเลือกจากรายการนี้ "เท่านั้น": [${groupOptsTxt}] (!!! ห้ามสร้างชื่อกลุ่มใหม่ขึ้นมาเองโดยเด็ดขาด !!! หากไม่มีที่ตรงเป๊ะ ให้เลือกกลุ่มที่ใกล้เคียงที่สุดจากรายการที่ให้ไว้)

และช่วยประเมินเพิ่มเติม:
- "ค่าเป้าหมาย" (Target Value) จากรายการ (ID:Label): [${targetOptsTxt}]
- "ระดับความสำคัญ" (Importance Level) จากรายการ (ID:Label): [${levelOptsTxt}]

ข้อกำหนดสำคัญ: ในฟิลด์ "related_career_name" จะต้องใช้ชื่ออาชีพที่ "ตรงทุกตัวอักษร" กับรายการอาชีพเป้าหมายที่ให้ไว้เท่านั้น

ตอบกลับเป็น JSON Array *เท่านั้น* โดยไม่มีข้อความอื่น:
[
  {
    "qualification_name": "ชื่อทักษะ (ภาษาไทย)",
    "qualification_group_name": "ชื่อกลุ่มทักษะ (เลือกจากรายการด้านบน ถ้าเป็นไปได้)",
    "related_career_name": "ชื่ออาชีพ (ต้องตรงกับชื่ออาชีพเป้าหมายที่ระบุ)",
    "reason": "เหตุผลสั้นๆ",
    "target_id": "ID ของค่าเป้าหมายที่เลือก",
    "target_reason": "เหตุผลที่เลือกค่าเป้าหมายนี้",
    "level_id": "ID ของระดับความสำคัญที่เลือก",
    "level_reason": "เหตุผลที่เลือกระดับนี้"
  }
]
    `.trim();

    const messages = [
      { role: "system", content: "คุณเป็นอาจารย์ที่ปรึกษาแนะแนวอาชีพที่เชี่ยวชาญ" },
      { role: "user", content: prompt }
    ];

    const res = await axios.post(urls.chat_url, {
      messages,
      gemini_api_key: sessionStorage.getItem("gemini_api_key")
    }, { timeout: 300000 });
    const reply = res?.data?.reply || "";

    let recs = [];
    try {
      const m = reply.match(/\[[\s\S]*\]/);
      if (m) recs = JSON.parse(m[0]);
    } catch (e) {
      console.error("JSON Parse error", e);
    }

    if (recs.length > 0) {
      // Normalize recommendations: Map AI result career names back to our DB labels
      const normalizedRecs = recs.map(r => {
        let careerLabel = r.related_career_name || "คำแนะนำทั่วไป";

        if (specificCareer) {
          // Direct assignment: If the user clicked a specific career, all results MUST belong to it
          careerLabel = specificCareer;
        } else {
          // Global "Refresh All": Attempt to match AI's name to our database labels
          const match = planCareerOptionsAll.value.find(p =>
            String(p.label).trim().toLowerCase() === String(r.related_career_name).trim().toLowerCase() ||
            String(p.label).trim().toLowerCase().includes(String(r.related_career_name).trim().toLowerCase()) ||
            String(r.related_career_name).trim().toLowerCase().includes(String(p.label).trim().toLowerCase())
          );
          if (match) careerLabel = match.label;
        }

        return {
          ...r,
          related_career_name: careerLabel,
          // Force IDs to match what's in our options (usually strings from API)
          target_id: r.target_id ? String(r.target_id) : null,
          level_id: r.level_id ? String(r.level_id) : null,
          isEditing: false
        };
      });

      // Merge with existing recommendations
      const currentRecs = aiRecommendations.value;
      const filteredRecs = currentRecs.filter(r => !normalizedRecs.some(newR =>
        newR.qualification_name === r.qualification_name &&
        newR.related_career_name === r.related_career_name
      ));
      aiRecommendations.value = [...filteredRecs, ...normalizedRecs];
    }
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "เกิดข้อผิดพลาดในการเชื่อมต่อ AI" });
  } finally {
    isAiLoading.value = false;
    targetCareerForAi.value = null;
  }
}

function removeAiGroup(careerLabel, groupName) {
  aiRecommendations.value = aiRecommendations.value.filter(r =>
    !(String(r.related_career_name).trim() === String(careerLabel).trim() &&
      String(r.qualification_group_name).trim() === String(groupName).trim())
  );
  $q.notify({ type: "info", message: `ลบกลุ่ม "${groupName}" เรียบร้อยแล้ว`, timeout: 1000 });
}

function removeAiRecommendation(rec) {
  aiRecommendations.value = aiRecommendations.value.filter(r => r !== rec);
  $q.notify({ type: "info", message: "ลบข้อแนะนำเรียบร้อยแล้ว", timeout: 1000 });
}

async function acceptAiRecommendation(rec, careerNameInGroup) {
  const qualName = String(rec.qualification_name || "").trim();
  if (!qualName) return;

  // 1) Ensure qualification exists or create it
  let qualId = null;
  const existing = qualificationOptionsAll.value.find(
    (q) => String(q.label || "").toLowerCase() === qualName.toLowerCase()
  );

  if (existing) {
    qualId = existing.value;
    // Optional: Update group if it differs?
  } else {
    try {
      // Get or Create Group ID first
      const groupId = await getOrCreateGroup(rec.qualification_group_name);

      await axios.post(`${urls.rest_api}/qualifications`, {
        qualification_name: qualName,
        qualification_group_id: groupId
      });
      await fetchQualifications();

      const created = qualificationOptionsAll.value.find(
        (q) => String(q.label || "").toLowerCase() === qualName.toLowerCase()
      );
      qualId = created ? created.value : null;
    } catch (e) {
      console.error(e);
      $q.notify({ type: "negative", message: `บันทึกคุณสมบัติใหม่ "${qualName}" ไม่สำเร็จ` });
      return;
    }
  }

  if (!qualId) return;

  // 2) Determine Plan Career ID
  let planCareerId = null;
  if (careerNameInGroup) {
    let match = planCareerOptionsAll.value.find((p) => p.label === careerNameInGroup);
    if (!match) {
      match = planCareerOptionsAll.value.find(
        (p) => p.label.includes(careerNameInGroup) || careerNameInGroup.includes(p.label)
      );
    }
    if (match) planCareerId = match.value;
  }

  if (!planCareerId && planCareerOptionsAll.value.length > 0) {
    planCareerId = planCareerOptionsAll.value[0].value;
  }

  if (!planCareerId) {
    $q.notify({ type: "warning", message: "ไม่พบอาชีพเป้าหมายที่เกี่ยวข้องในแผน" });
    return;
  }

  // 3) Insert into qa_plan_career
  const payload = {
    plan_career_id: planCareerId,
    qualification_id: qualId,
    level_id: rec.level_id,
    target_id: rec.target_id
  };

  try {
    await axios.post(`${urls.rest_api}/qa-plan-careers`, payload);
    $q.notify({ type: "positive", message: `เพิ่ม "${qualName}" สำเร็จ` });

    // ✅ Remove from suggestions
    aiRecommendations.value = aiRecommendations.value.filter(r => r !== rec);

    await fetchTableData();
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "บันทึกลงแผนไม่สำเร็จ" });
  }
}
</script>

<style lang="sass">
.page-bg
  background: linear-gradient(135deg, #74c588 0%, #0ad13c 100%)
  min-height: 100vh

.form-wrapper
  max-width: 1100px
  width: 100%

.form-card
  border-radius: 12px

.career-card
  border-radius: 8px
  transition: all 0.3s ease
  &:hover
    box-shadow: 0 4px 8px rgba(0,0,0,0.1)
    border-color: var(--q-primary)

.q-table__title
  font-size: 1.1rem
  font-weight: 600
</style>
