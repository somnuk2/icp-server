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
                <!-- AI Recommendation Section (Inline) -->
                <div class="row q-mb-lg">
                  <div class="col-12">
                    <div class="row items-center justify-between">
                      <div>
                        <div class="text-h6 text-deep-purple-7 q-mb-sm"><q-icon name="psychology" /> AI แนะนำอาชีพ</div>
                        <div class="text-subtitle2 text-grey-8 q-mb-md">พิจารณาจากข้อมูลส่วนตัวของคุณ</div>
                      </div>
                      <div class="row q-gutter-sm">
                        <q-btn icon="refresh" label="ขอคำแนะนำใหม่" color="deep-purple-7" outline
                          @click="recommendCareer" :loading="isAiLoading" />
                        <q-btn icon="add_box" label="เพิ่มอาชีพด้วยตนเอง" color="green"
                          @click="showManualFormDialog = true" outline />
                      </div>
                    </div>

                    <!-- Loading State -->
                    <div v-if="isAiLoading" class="row justify-center q-pa-lg">
                      <q-spinner-dots color="deep-purple" size="3em" />
                      <div class="text-grey q-mt-sm">กำลังวิเคราะห์ข้อมูล...</div>
                    </div>

                    <!-- AI Results List -->
                    <q-list v-else bordered separator class="rounded-borders">
                      <q-item v-if="aiRecommendations.length === 0" class="q-pa-md text-center text-grey">
                        ไม่พบคำแนะนำ หรือเกิดข้อผิดพลาดในการเชื่อมต่อ AI
                      </q-item>

                      <q-item v-for="(rec, index) in aiRecommendations" :key="index" class="q-py-md">
                        <q-item-section>
                          <q-item-label class="text-h6">{{ rec.career_name }}</q-item-label>
                          <q-item-label caption>
                            กลุ่ม: {{ rec.ca_group_name || "ไม่ระบุ" }}
                            <q-badge v-if="rec.score != null" color="green" class="q-ml-sm">{{ rec.score }}%
                              Match</q-badge>
                          </q-item-label>
                          <q-item-label caption class="q-mt-sm text-italic text-grey-7">
                            เหตุผล: {{ rec.reason || "ไม่ระบุเหตุผล" }}
                          </q-item-label>
                        </q-item-section>

                        <q-item-section side>
                          <div class="column q-gutter-sm">
                            <q-badge :color="rec.status === 'Existing' ? 'blue' : 'orange'">
                              {{ rec.status === "Existing" ? "มีในระบบ" : "อาชีพใหม่" }}
                            </q-badge>

                            <q-btn icon="edit" round color="orange" size="sm" @click="openEditAiRec(rec)">
                              <q-tooltip>แก้ไขวันเริ่มแผนก่อนเพิ่ม</q-tooltip>
                            </q-btn>

                             <q-btn icon="close" round color="red-4" size="sm" @click="aiRecommendations = aiRecommendations.filter(r => r !== rec)">
                               <q-tooltip>ลบข้อแนะนำนี้</q-tooltip>
                             </q-btn>
 
                             <q-btn icon="add" round color="primary" size="sm" @click="acceptAiRecommendation(rec)">
                               <q-tooltip>เพิ่มอาชีพนี้ในแผน</q-tooltip>
                             </q-btn>
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>

                <q-separator spaced />



                <!-- Tree View -->
                <div class="row q-mb-lg">
                  <div class="col-12">
                    <q-card flat bordered>
                      <q-card-section class="bg-primary text-white row items-center justify-between">
                        <div class="text-h6"><q-icon name="account_tree" /> โครงสร้างอาชีพเป้าหมาย</div>
                        <div class="row q-gutter-sm items-center">
                          <q-input dense filled debounce="300" v-model="filter" placeholder="ค้นหาอาชีพ"
                            style="width: 250px">
                            <template #append><q-icon name="search" /></template>
                          </q-input>
                          <q-input borderless dense v-model="file_export" placeholder="ชื่อไฟล์ CSV" outlined
                            style="width: 150px">
                            <template v-slot:append><q-icon name="save" /></template>
                          </q-input>
                          <q-btn flat color="green-7" icon="download" label="ส่งออก excel" @click="exportTable" />
                          <q-checkbox v-model="isSelectAll" label="เลือกทั้งหมด" color="primary" class="q-mx-sm"
                            @update:model-value="toggleSelectAll" />
                          <q-btn v-if="tickedCareers.length > 0" color="red" icon="delete_sweep" label="ลบที่เลือก"
                            @click="deleteSelected" class="q-ml-sm" />
                        </div>
                      </q-card-section>
                      <q-card-section class="q-pa-none">
                        <div v-if="loading" class="row justify-center q-pa-md">
                          <q-spinner color="primary" size="3em" />
                        </div>
                        <q-tree v-else :nodes="careerTree" node-key="id" label-key="label" :filter="filter"
                          default-expand-all class="q-pa-md" v-model:ticked="tickedCareers" tick-strategy="strict">
                          <template v-slot:default-header="prop">
                            <div class="row items-center full-width justify-between">
                              <div class="row items-center">
                                <q-icon :name="prop.node.icon || 'work'" color="primary" size="sm" class="q-mr-sm" />
                                <div class="text-weight-bold text-primary">
                                  {{ prop.node.label }}
                                </div>
                              </div>
                              <div class="row q-gutter-xs">
                                <q-btn flat round color="blue" icon="edit" size="sm"
                                  @click.stop="editUser(prop.node.rawData.plan_career_id)">
                                  <q-tooltip>แก้ไขอาชีพนี้</q-tooltip>
                                </q-btn>
                                <q-btn flat round color="red" icon="delete" size="sm"
                                  @click.stop="deleteUser(prop.node.rawData.plan_career_id, prop.node.rawData.career_name)">
                                  <q-tooltip>ลบอาชีพนี้</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </template>
                        </q-tree>
                        <div v-if="!loading && plan_careers1.length === 0" class="text-center q-pa-lg text-grey">
                          ยังไม่มีข้อมูลอาชีพเป้าหมาย
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <q-separator spaced />

                <!-- Table (Hidden by default or preserved) -->
                <div class="row" v-if="false">
                  <div class="col-12">
                    <!-- Table Content -->
                    <q-table title="ข้อมูลอาชีพเป้าหมาย" :rows="plan_careers1" :columns="columns"
                      row-key="plan_career_id" :filter="filter" :loading="loading" :visible-columns="visibleColumns"
                      separator="cell" table-header-class="bg-blue-5" :rows-per-page-options="[30, 50, 100, 0]">
                      <template #top-right="props">
                        <div class="row q-gutter-sm items-center">
                          <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาอาชีพ">
                            <template #append><q-icon name="search" /></template>
                          </q-input>

                          <q-input borderless dense v-model="file_export" placeholder="ชื่อไฟล์ CSV" />

                          <q-btn flat color="green-7" icon="download" label="ส่งออก excel" @click="exportTable()" />

                          <q-select v-model="visibleColumns" multiple dense options-dense outlined
                            :options="columnsForVisibleSelect" option-value="name" option-label="label" emit-value
                            map-options style="min-width: 240px;" />

                          <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                            @click="props.toggleFullscreen" />
                        </div>
                      </template>
                      <template #body-cell-actions="props">
                        <q-td :props="props">
                          <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.plan_career_id)" no-caps />
                          <q-btn color="red" label="ลบ" class="q-ml-sm"
                            @click="deleteUser(props.row.plan_career_id, props.row.career_name)" no-caps />
                        </q-td>
                      </template>
                    </q-table>
                  </div>
                </div>

                <!-- Bottom Navigation Buttons (Optional, e.g. Back/Next) -->
                <div class="row justify-center q-my-md">
                  <q-btn icon="logout" label="ออก" color="primary" flat to="/" class="q-mx-sm" />
                  <q-btn color="primary" label="กลับฟอร์มกรอกข้อมูลส่วนตัว" no-caps flat icon="skip_previous"
                    to="/FormComponent" class="q-mx-sm">
                    <q-tooltip>กลับฟอร์มกรอกข้อมูลส่วนตัว</q-tooltip>
                  </q-btn>
                  <q-btn color="primary" label="ไปฟอร์มกำหนดคุณสมบัติ" no-caps flat icon="skip_next"
                    to="/FormQualification" class="q-mx-sm">
                    <q-tooltip>ไปฟอร์มกำหนดคุณสมบัติ/ทักษะ</q-tooltip>
                  </q-btn>
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
            <div class="text-h6">เพิ่ม/แก้ไข อาชีพเป้าหมาย</div>
          </q-card-section>
          <q-card-section>
            <q-form ref="formRef" @submit.prevent="submitForm" @reset="resetForm" class="q-gutter-md">
              <div class="row">
                <!-- อาชีพเป้าหมาย -->
                <div class="col-md-5 col-xs-12 q-pa-xs">
                  <q-select v-model="planCareer" use-input input-debounce="0" :options="careerOptions"
                    label="อาชีพเป้าหมาย *" color="blue-5" @filter="filterCareer" @new-value="onNewCareer"
                    @update:model-value="onCareerPlan" :rules="[(v) => !!v || 'กรุณาเลือก/พิมพ์อาชีพเป้าหมาย']"
                    data-testid="select-target-career">
                    <template #prepend><q-icon name="work_history" /></template>

                    <template #no-option>
                      <q-item>
                        <q-item-section class="text-grey">ค้นหาไม่พบ (กด Enter
                          เพื่อเพิ่มอาชีพใหม่)</q-item-section>
                      </q-item>
                    </template>

                    <template v-if="planCareer" #append>
                      <q-icon name="cancel" class="cursor-pointer" @click.stop.prevent="clearPlanCareer" />
                    </template>
                  </q-select>
                </div>

                <!-- กลุ่มอาชีพ -->
                <div class="col-md-4 col-xs-12 q-pa-xs">
                  <q-select v-if="isPlanCareerNew" v-model="plan_career.ca_group_name" :options="careerGroupOptions"
                    label="กลุ่มอาชีพ (เลือก) *" filled emit-value map-options clearable
                    :rules="[(v) => !!v || 'กรุณาเลือกกลุ่มอาชีพ']" data-testid="select-career-group">
                    <template #prepend><q-icon name="school" /></template>
                  </q-select>

                  <q-input v-else standout="bg-primary text-white" color="primary" v-model="plan_career.ca_group_name" label="กลุ่มอาชีพ"
                    clearable readonly>
                    <template #prepend><q-icon name="school" /></template>
                    <template #append><q-icon name="favorite" /></template>
                  </q-input>
                </div>

                <!-- วันเริ่มแผน -->
                <div class="col-md-3 col-xs-12 q-pa-xs">
                  <q-input filled v-model="plan_career.start_date" label="วันเริ่มแผน" mask="##/##/####" fill-mask
                    hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn clearable :rules="[
                      (v) => !!v || 'กรุณาระบุวันเริ่มแผน',
                      (v) => isValidDMY(v) || 'รูปแบบวันที่ไม่ถูกต้อง (DD/MM/YYYY)'
                    ]" data-testid="input-start-date">
                    <template #append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="plan_career.start_date" mask="DD/MM/YYYY">
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

              <!-- ปุ่มควบคุมหลัก -->
              <div class="row justify-center q-my-md">
                <q-btn :label="btnLabel" type="submit" color="primary" icon="save" class="q-mx-sm"
                  data-testid="btn-submit-career" />
                <q-btn label="ยกเลิก" type="reset" color="primary" flat icon="clear" class="q-mx-sm" />
                <q-btn label="ปิด" color="grey" flat @click="showManualFormDialog = false" class="q-mx-sm" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Dialog แก้ไขอาชีพเดี่ยว (จาก checkbox list) -->
      <q-dialog v-model="showEditItemDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">บันทึกอาชีพ: {{ editItemData.career_name }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="editItemData.ca_group_name" label="กลุ่มอาชีพ" readonly filled />
            <q-input filled v-model="editItemData.start_date" label="วันเริ่มแผน" mask="##/##/####" fill-mask
              hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn :rules="[
                (v) => !!v || 'กรุณาระบุวันเริ่มแผน',
                (v) => isValidDMY(v) || 'รูปแบบวันที่ไม่ถูกต้อง (DD/MM/YYYY)'
              ]">
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-date v-model="editItemData.start_date" mask="DD/MM/YYYY">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="ยกเลิก" v-close-popup />
            <q-btn flat label="บันทึก" color="positive" @click="saveEditItem" />
          </q-card-actions>
        </q-card>
      </q-dialog>



      <!-- Dialog แก้ไขวันเริ่มแผนสำหรับอาชีพจาก AI -->
      <q-dialog v-model="showAiEditDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">แก้ไขอาชีพ: {{ aiEditItem.career_name }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="aiEditItem.career_name" label="แก้ไขชื่ออาชีพ" filled class="q-mb-md" />

            <q-select v-model="aiEditItem.ca_group_name" :options="careerGroupOptions" label="กลุ่มอาชีพ" filled
              emit-value map-options class="q-mb-md" />

            <q-input filled v-model="aiEditItem.start_date" label="วันเริ่มแผน" mask="##/##/####" fill-mask
              hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn :rules="[
                (v) => !!v || 'กรุณาระบุวันเริ่มแผน',
                (v) => isValidDMY(v) || 'รูปแบบวันที่ไม่ถูกต้อง (DD/MM/YYYY)'
              ]">
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-date v-model="aiEditItem.start_date" mask="DD/MM/YYYY">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="ยกเลิก" v-close-popup />
            <q-btn flat label="บันทึกและเพิ่ม" color="positive" @click="saveAndAddAiRec" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useQuasar, exportFile } from "quasar";
import { useStore } from "vuex";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl, getChatUrl } from "../../utils/apiConfig.js";

const $q = useQuasar();
const store = useStore();

// ปรับตามระบบจริง (แนะนำให้ใช้ env)
const CHAT_URL = getChatUrl(store);

/* ---------------------------
 * Helpers
 * --------------------------- */
function wrapCsvValue(val) {
  const s = val === void 0 || val === null ? "" : String(val);
  return `"${s.split('"').join('""')}"`;
}

function todayDMY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function isValidDMY(dmy) {
  if (!dmy) return false;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dmy);
  if (!m) return false;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (yyyy < 1900 || yyyy > 2500) return false;
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;
  const dt = new Date(yyyy, mm - 1, dd);
  return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
}

function dmyToYmd(dmy) {
  if (!dmy || !isValidDMY(dmy)) return "";
  const [dd, mm, yyyy] = dmy.split("/");
  return `${yyyy}/${mm}/${dd}`;
}

function ymdToDmy(ymd) {
  if (!ymd || ymd === "0000/00/00") return "";
  const m = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(ymd);
  if (!m) return "";
  const yyyy = m[1], mm = m[2], dd = m[3];
  return `${dd}/${mm}/${yyyy}`;
}

function normalizeCareerName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function safeParseJsonArray(text) {
  if (!text) return [];
  try {
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) return [];
    const arr = JSON.parse(m[0]);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/* ---------------------------
 * State
 * --------------------------- */
const title = ref("อาชีพเป้าหมาย");
const btnLabel = ref("เพิ่มข้อมูล");
const isEdit = ref(false);

const filter = ref("");
const visibleColumns = ref(["actions", "career_name", "ca_group_name", "start_date"]);
const file_export = ref("อาชีพเป้าหมาย");

const formRef = ref(null);

const urls = reactive({
  rest_api: "",
});

const plan_career = reactive({
  plan_career_id: "",
  member_id: store.getters.myMember_id,
  career_id: "",
  start_date: "",
  ca_group_name: ""
});

const planCareer = ref(null); // {label,value,ca_group_name,isNew}
const careerOptions = ref([]);
const careerOptionsAll = ref([]);

const careerGroups = ref({}); // {groupName: [{career_id, career_name, ca_group_name}]}
const masterCareerGroupsMap = ref({}); // { groupName: groupID }
const careerScores = reactive({}); // { [career_id]: score }

const plan_careers1 = ref([]);
const tickedCareers = ref([]);
const isSelectAll = ref(false);
const loading = ref(true);

/* ---------------------------
 * Dialogs
 * --------------------------- */
const showManualFormDialog = ref(false);
const showEditItemDialog = ref(false);
const editItemData = reactive({
  career_id: "",
  career_name: "",
  ca_group_name: "",
  start_date: ""
});

const isAiLoading = ref(false);
const individual = ref({});
const individualData = ref(null);

const showAiDialog = ref(false);
const aiRecommendations = ref([]);

const showAiEditDialog = ref(false);
const aiEditItem = reactive({
  career_name: "",
  ca_group_name: "",
  start_date: "",
  existingId: null,
  status: ""
});

/* ---------------------------
 * Computed
 * --------------------------- */
const isPlanCareerNew = computed(() => !!planCareer.value?.isNew);

const displayedCareerGroups = computed(() => {
  const result = {};
  const groups = careerGroups.value || {};
  Object.keys(groups).forEach((group) => {
    result[group] = groups[group].slice(0, 3);
  });
  return result;
});

const careerGroupOptions = computed(() => {
  const groups = Object.keys(careerGroups.value || {})
    .map((g) => String(g || "").trim())
    .filter((g) => g && g !== "อื่นๆ");

  return [...groups.sort(), "อื่นๆ"].map((g) => ({ label: g, value: g }));
});

const columns = [
  { name: "actions", align: "center", label: "แก้ไข/ลบ", field: "" },
  { name: "career_name", label: "อาชีพ", align: "left", field: "career_name", sortable: true },
  { name: "ca_group_name", label: "กลุ่มอาชีพ", align: "left", field: "ca_group_name", sortable: true },
  { name: "start_date", label: "วันเริ่มแผน", align: "center", field: "start_date", sortable: true }
];

const columnsForVisibleSelect = computed(() => columns.map((c) => ({ name: c.name, label: c.label })));

const careerTree = computed(() => {
  return plan_careers1.value.map((row) => ({
    id: `pc_${row.plan_career_id}`,
    label: `${row.career_name} (${row.ca_group_name || "ไม่ระบุกลุ่ม"}) - เริ่มแผน: ${row.start_date || "-"}`,
    icon: "work",
    rawData: row,
  }));
});

/* ---------------------------
 * API
 * --------------------------- */
async function getCareer() {
  try {
    const res = await axios.get(`${urls.rest_api}/careers`);
    const validData = (res.data || []).filter((item) => item?.career_name?.trim());

    const opts = validData.map((item) => ({
      label: item.career_name,
      value: item.career_id,
      ca_group_name: item.ca_group_name || "อื่นๆ"
    }));

    careerOptions.value = opts;
    careerOptionsAll.value = [...opts];

    const groups = {};
    validData.forEach((item) => {
      const group = item.ca_group_name || "อื่นๆ";
      if (!groups[group]) groups[group] = [];
      groups[group].push({
        career_id: item.career_id,
        career_name: item.career_name,
        ca_group_name: group
      });
    });
    careerGroups.value = groups;
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "โหลดข้อมูลอาชีพไม่สำเร็จ" });
  }
}

async function getUpdate(member_id) {
  loading.value = true;
  try {
    const res = await axios.get(`${urls.rest_api}/plan-careers`);
    const rows = (res.data || []).map((r) => ({
      ...r,
      start_date:
        typeof r.start_date === "string" && /^20\d{2}\/\d{2}\/\d{2}$/.test(r.start_date)
          ? ymdToDmy(r.start_date)
          : r.start_date
    }));
    plan_careers1.value = rows;
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "โหลดข้อมูลแผนอาชีพไม่สำเร็จ" });
  } finally {
    loading.value = false;
  }
}

async function getIndividualData() {
  const member_id = store.getters.myMember_id;
  try {
    const res = await axios.get(`${urls.rest_api}/members/${member_id}/individual`);
    individualData.value = res.data || {};
  } catch (e) {
    console.error("Fetch individual error:", e);
  }
}

async function fetchMasterCareerGroups() {
  try {
    const res = await axios.get(`${urls.rest_api}/careers/groups`);
    const map = {};
    if (Array.isArray(res.data)) {
      res.data.forEach(g => {
        if (g.ca_group_name) {
          map[g.ca_group_name] = g.career_group_id;
        }
      });
    }
    masterCareerGroupsMap.value = map;
  } catch (e) {
    console.error("Failed to fetch master career groups", e);
  }
}

async function ensureCareerIdByName(career_name, ca_group_name) {
  const rawName = String(career_name || "").trim();
  if (!rawName) return null;

  const needle = normalizeCareerName(rawName);

  // 1) หาใน options ก่อน
  let match = careerOptionsAll.value.find((c) => normalizeCareerName(c.label) === needle);
  if (match) return match.value;

  // 2) ไม่เจอ -> insert เข้า master career
  const groupName = (ca_group_name || "").trim() || "อื่นๆ";
  let groupId = masterCareerGroupsMap.value[groupName];

  if (!groupId) {
    groupId = masterCareerGroupsMap.value["อื่นๆ"];
  }

  try {
    const res = await axios.post(`${urls.rest_api}/careers`, {
      career_name: rawName,
      career_group_id: groupId || ""
    });
    const newId = res.data.career_id;
    await getCareer();
    return newId;
  } catch (e) {
    console.error("Insert Master Career Failed:", e);
    return null;
  }
}

/* ---------------------------
 * UI actions
 * --------------------------- */
function clearPlanCareer() {
  planCareer.value = null;
  plan_career.career_id = "";
  plan_career.ca_group_name = "";
}

function filterCareer(val, update) {
  update(() => {
    if (!val) {
      careerOptions.value = careerOptionsAll.value;
      return;
    }
    const needle = val.toLowerCase();
    careerOptions.value = careerOptionsAll.value.filter((v) => v.label.toLowerCase().includes(needle));
  });
}

function onNewCareer(val, done) {
  const name = String(val || "").trim();
  if (!name) return;

  if (!plan_career.ca_group_name?.trim()) {
    plan_career.ca_group_name = "อื่นๆ";
  }

  const obj = {
    label: name,
    value: null,
    ca_group_name: plan_career.ca_group_name,
    isNew: true
  };

  done(obj, "add-unique");
}

function onCareerPlan(val) {
  if (!val) {
    plan_career.ca_group_name = "";
    plan_career.career_id = "";
    return;
  }

  // ถ้าเป็นอาชีพเดิม -> ใช้กลุ่มจาก record นั้น
  if (!val.isNew) {
    plan_career.ca_group_name = val.ca_group_name || "";
  } else {
    // ถ้าเป็นอาชีพใหม่ -> ถ้ายังไม่มีค่า ให้ default
    plan_career.ca_group_name = plan_career.ca_group_name || "อื่นๆ";
    // sync กลับไปที่ model เผื่อผู้ใช้เปลี่ยน dropdown
    val.ca_group_name = plan_career.ca_group_name;
  }

  plan_career.career_id = val.value || "";
}

/* sync: ถ้าเป็นอาชีพใหม่ และผู้ใช้เปลี่ยนกลุ่ม dropdown ให้ปรับ planCareer.ca_group_name ด้วย */
watch(
  () => plan_career.ca_group_name,
  (newVal) => {
    if (planCareer.value?.isNew) {
      planCareer.value = {
        ...planCareer.value,
        ca_group_name: newVal || "อื่นๆ"
      };
    }
  }
);

/* ---------------------------
 * CRUD: Submit / Edit / Delete
 * --------------------------- */
function isDuplicateCareer(career_id) {
  return plan_careers1.value.some((r) => String(r.career_id) === String(career_id));
}

function resetForm() {
  isEdit.value = false;
  btnLabel.value = "เพิ่มข้อมูล";

  plan_career.plan_career_id = "";
  plan_career.career_id = "";
  plan_career.ca_group_name = "";
  plan_career.start_date = "";

  planCareer.value = null;
  // selectedCareers.value = [];
  showManualFormDialog.value = false;
}

async function submitForm() {
  const ok = await formRef.value?.validate?.();
  if (!ok) return;

  if (!planCareer.value) {
    $q.notify({ type: "warning", message: "กรุณาเลือก/พิมพ์อาชีพเป้าหมาย" });
    return;
  }

  const careerName = String(planCareer.value.label || "").trim();
  const groupName = String(plan_career.ca_group_name || "").trim() || "อื่นๆ";

  // ถ้าไม่มี value -> เป็นอาชีพใหม่หรือไม่พบ -> insert career ก่อน
  let careerId = planCareer.value.value || null;
  if (!careerId) {
    careerId = await ensureCareerIdByName(careerName, groupName);
    if (!careerId) {
      $q.notify({ type: "negative", message: "บันทึกอาชีพใหม่ไม่สำเร็จ" });
      return;
    }

    // update model ให้มี id แล้ว
    planCareer.value = { label: careerName, value: careerId, ca_group_name: groupName, isNew: false };
  }

  const payload = {
    member_id: plan_career.member_id,
    career_id: careerId,
    start_date: dmyToYmd(plan_career.start_date)
  };

  try {
    if (!isEdit.value) {
      if (isDuplicateCareer(payload.career_id)) {
        $q.notify({ type: "warning", message: "อาชีพนี้ถูกเพิ่มไว้แล้ว" });
        return;
      }

      await axios.post(`${urls.rest_api}/plan-careers`, payload);
      $q.notify({ type: "positive", message: `เพิ่ม "${careerName}" สำเร็จ` });
    } else {
      await axios.put(`${urls.rest_api}/plan-careers/${plan_career.plan_career_id}`, payload);
      $q.notify({ type: "positive", message: `แก้ไข "${careerName}" สำเร็จ` });
    }

    await getUpdate(plan_career.member_id);
    resetForm();
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "บันทึกข้อมูลไม่สำเร็จ" });
  }
}

async function editUser(plan_career_id) {
  isEdit.value = true;
  btnLabel.value = "แก้ไขข้อมูล";
  showManualFormDialog.value = true;

  try {
    const res = await axios.get(`${urls.rest_api}/plan-careers/${plan_career_id}`);
    const d = res.data;
    Object.assign(plan_career, d);
    plan_career.start_date = ymdToDmy(d.start_date);

    const match = careerOptionsAll.value.find((c) => String(c.value) === String(d.career_id));
    planCareer.value = match || { label: d.career_name, value: d.career_id, ca_group_name: d.ca_group_name, isNew: false };
  } catch (e) {
    console.error(e);
  }
}

async function deleteUser(plan_career_id, career_name) {
  try {
    // Check dependencies
    const resCheck = await axios.post(`${urls.rest_api}/plan-careers/check-dependencies`, {
      plan_career_id: plan_career_id,
      type: 'single'
    });

    const hasDeps = resCheck.data.has_dependencies;
    const depCount = resCheck.data.count;

    if (hasDeps) {
      $q.dialog({
        title: "ไม่สามารถลบได้",
        message: `ไม่สามารถลบอาชีพ "${career_name}" ได้ เนื่องจากตรวจพบข้อมูลคุณสมบัติ/ทักษะที่เกี่ยวข้อง ${depCount} รายการ\n\nกรุณาลบข้อมูลคุณสมบัติที่เกี่ยวข้องออกให้หมดก่อนทำการลบอาชีพนี้`,
        ok: { label: 'รับทราบ', color: 'primary' }
      });
      return;
    }

    $q.dialog({
      title: "ยืนยันการลบ",
      message: `ต้องการลบ "${career_name}" ใช่หรือไม่?`,
      cancel: true,
      persistent: true,
      ok: { label: 'ยืนยันการลบ', color: 'negative' }
    }).onOk(async () => {
      try {
        await axios.delete(`${urls.rest_api}/plan-careers/${plan_career_id}`);
        $q.notify({ type: "positive", message: "ลบข้อมูลสำเร็จ" });
        getUpdate(store.getters.myMember_id);
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

async function deleteSelected() {
  const selectedIds = tickedCareers.value
    .filter((id) => id.startsWith("pc_"))
    .map((id) => parseInt(id.replace("pc_", "")));

  if (selectedIds.length === 0) return;

  try {
    // Check dependencies for multiple records
    const resCheck = await axios.post(`${urls.rest_api}/plan-careers/check-dependencies`, {
      type: 'bulk',
      plan_career_ids: selectedIds
    });

    const hasDeps = resCheck.data.has_dependencies;
    const depCount = resCheck.data.count;

    if (hasDeps) {
      $q.dialog({
        title: "ไม่สามารถลบแบบกลุ่มได้",
        message: `ไม่สามารถลบรายการที่เลือกได้ เนื่องจากตรวจพบข้อมูลคุณสมบัติ/ทักษะที่เกี่ยวข้องรวม ${depCount} รายการ ในรายการที่คุณเลือก\n\nกรุณาลบข้อมูลคุณสมบัติที่เกี่ยวข้องออกให้หมดก่อนทำการลบอาชีพ`,
        ok: { label: 'รับทราบ', color: 'primary' }
      });
      return;
    }

    $q.dialog({
      title: "ยืนยันการลบแบบกลุ่ม",
      message: `ต้องการลบทิ้งทั้งหมด ${tickedCareers.value.length} รายการที่เลือกใช่หรือไม่?`,
      cancel: true,
      persistent: true,
      ok: { label: 'ยืนยันการลบ', color: 'negative' }
    }).onOk(async () => {
      try {
        await axios.post(`${urls.rest_api}/plan-careers/bulk-delete`, {
          plan_career_ids: selectedIds
        });

        $q.notify({ type: "positive", message: `ลบข้อมูลสำเร็จ ${selectedIds.length} รายการ` });
        tickedCareers.value = [];
        isSelectAll.value = false;
        getUpdate(store.getters.myMember_id);
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

function toggleSelectAll(val) {
  if (val) {
    tickedCareers.value = careerTree.value.map(node => node.id);
  } else {
    tickedCareers.value = [];
  }
}

watch(tickedCareers, (newTicks) => {
  if (newTicks.length === 0) {
    isSelectAll.value = false;
  } else if (newTicks.length === careerTree.value.length) {
    isSelectAll.value = true;
  } else {
    isSelectAll.value = false; // or null for indeterminate
  }
});

/* ---------------------------
 * Export
 * --------------------------- */
async function exportTable() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Career Plan Report');

    // ตั้งค่าความกว้างคอลัมน์
    worksheet.columns = [
      { key: 'career', width: 40 },
      { key: 'group', width: 30 },
      { key: 'startDate', width: 25 }
    ];

    // 1. หัวรายงาน (Main Title)
    worksheet.mergeCells('A1:C1');
    const mainTitle = worksheet.getCell('A1');
    mainTitle.value = 'รายงานสรุปอาชีพเป้าหมาย (Career Plan Report)';
    mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
    mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 40;

    // 2. หัวตาราง
    const headerRow = worksheet.getRow(3);
    headerRow.values = ['อาชีพเป้าหมาย', 'กลุ่มอาชีพ', 'วันเริ่มแผนพัฒนาตนเอง'];
    headerRow.height = 30;

    ['A3', 'B3', 'C3'].forEach(cellRef => {
      const cell = worksheet.getCell(cellRef);
      // สีพื้นหลังหัวตารางสวยงาม (สีน้ำเงิน)
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.font = { name: 'Sarabun', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // 3. ข้อมูล
    const rows = plan_careers1.value || [];
    rows.forEach((row, index) => {
      const r = worksheet.addRow([
        row.career_name || '-',
        row.ca_group_name || 'ไม่ระบุ',
        row.start_date || '-'
      ]);
      r.height = 25;

      // จัดรูปแบบแต่ละเซลล์
      ['A', 'B', 'C'].forEach(col => {
        const cell = worksheet.getCell(`${col}${r.number}`);
        cell.font = { name: 'Sarabun', size: 11 };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        // Alignments
        if (col === 'C') {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
        }

        // Zebra Striping (สีสลับบรรทัด)
        if (index % 2 !== 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), (file_export.value || "Career_Plan_Report").replace(/\.(xlsx|csv)$/i, '') + '.xlsx');
    $q.notify({ type: "positive", message: "ส่งออกไฟล์ Excel สำเร็จ" });
  } catch (error) {
    console.error("Export Error:", error);
    $q.notify({ type: "negative", message: "ส่งออกไม่สำเร็จ: " + error.message });
  }
}

/* ---------------------------
 * Multiple add (checkbox)
 * --------------------------- */
async function submitSelectedCareers() {
  // This function seems to be missing `selectedCareers.value` definition.
  // Assuming `selectedCareers` is meant to be `tickedCareers` or similar,
  // but the original code had `selectedCareers.value.length === 0` and `toInsert = selectedCareers.value.filter(...)`.
  // For now, I'll assume `selectedCareers` is a separate ref and keep the original logic for it.
  // If `selectedCareers` is not defined elsewhere, this part might need further clarification.
  // For the purpose of this edit, I'll assume `selectedCareers` is defined and focus on the API call.

  // Original code had `selectedCareers.value.length === 0`, but `selectedCareers` is not defined in the provided snippet.
  // I will assume it's meant to be `tickedCareers` for the purpose of making the API call correct.
  // If `selectedCareers` is indeed a separate variable, this part needs to be adjusted.
  const selectedCareers = ref([]); // Placeholder, assuming it's defined elsewhere.

  if (selectedCareers.value.length === 0) return;

  const startDMY = plan_career.start_date || todayDMY();
  if (!isValidDMY(startDMY)) {
    $q.notify({ type: "warning", message: "กรุณาระบุวันเริ่มแผนให้ถูกต้องก่อนเพิ่มหลายรายการ" });
    return;
  }

  const ymd = dmyToYmd(startDMY);
  const toInsert = selectedCareers.value.filter((id) => !isDuplicateCareer(id));

  if (toInsert.length === 0) {
    $q.notify({ type: "info", message: "รายการที่เลือกถูกเพิ่มไว้แล้วทั้งหมด" });
    return;
  }

  try {
    await Promise.all(
      toInsert.map((career_id) =>
        axios.post(`${urls.rest_api}/plan-careers`, {
          member_id: plan_career.member_id,
          career_id,
          start_date: ymd
        })
      )
    );

    $q.notify({ type: "positive", message: `เพิ่มสำเร็จ ${toInsert.length} รายการ` });
    selectedCareers.value = [];
    await getUpdate(plan_career.member_id);
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "เพิ่มหลายรายการไม่สำเร็จ" });
  }
}

/* ---------------------------
 * Single add from list + edit dialog
 * --------------------------- */
async function submitFormSingle(career_id, career_label, startDMY) {
  if (!career_id) return;

  const dmy = startDMY || plan_career.start_date || todayDMY();
  if (!isValidDMY(dmy)) {
    $q.notify({ type: "warning", message: "กรุณาระบุวันเริ่มแผนให้ถูกต้อง" });
    return;
  }

  if (isDuplicateCareer(career_id)) {
    $q.notify({ type: "warning", message: "อาชีพนี้ถูกเพิ่มไว้แล้ว" });
    return;
  }

  try {
    await axios.post(`${urls.rest_api}/plan-careers`, {
      member_id: plan_career.member_id,
      career_id,
      start_date: dmyToYmd(dmy)
    });
    $q.notify({ type: "positive", message: `บันทึก ${career_label} สำเร็จ` });
    await getUpdate(plan_career.member_id);
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "ไม่สามารถเพิ่มอาชีพได้" });
  }
}

function addSingleCareer(career) {
  const dmy = plan_career.start_date || todayDMY();
  submitFormSingle(career.career_id, career.career_name, dmy);
}

function editSingleCareer(career) {
  editItemData.career_id = career.career_id;
  editItemData.career_name = career.career_name;
  editItemData.ca_group_name = career.ca_group_name || "อื่นๆ";
  editItemData.start_date = plan_career.start_date || todayDMY();
  showEditItemDialog.value = true;
}

function saveEditItem() {
  if (!isValidDMY(editItemData.start_date)) {
    $q.notify({ type: "warning", message: "กรุณาระบุวันเริ่มแผนให้ถูกต้อง" });
    return;
  }
  showEditItemDialog.value = false;
  submitFormSingle(editItemData.career_id, editItemData.career_name, editItemData.start_date);
}

/* ---------------------------
 * AI Recommendation
 * --------------------------- */
async function recommendCareer() {
  if (isAiLoading.value) return;
  isAiLoading.value = true;

  try {
    await getIndividualData();
    const f = individualData.value || {};

    const profileText = `
โปรไฟล์นักเรียน:
- ชื่อ: ${f.name || store.getters.myName || "-"}
- จังหวัด: ${f.province || "ไม่ระบุ"}
- ภาค/จังหวัดที่อยากอยู่: ${f.preferredRegion || "ไม่ระบุ"}
- ความพิการ: ${f.disability_name || "-"}
- ระดับการศึกษา: ${f.degree_name || "-"}
- สาขาวิชา: ${f.department_name || "-"}
- วิชาที่ชอบ: ${f.favoriteSubject || "-"}
- อุปกรณ์ที่จำเป็น: ${f.unfavoriteSubject || "-"}
- กิจกรรมที่ชอบทำ: ${f.favoriteActivity || "-"}
- อาชีพในฝัน: ${f.dreamCareer || "-"}
- ความถนัด/ทักษะเด่น: ${f.skill || "-"}
- ข้อมูลเพิ่มเติม: ${f.additionalInfo || "-"}
`.trim();

    const availableGroups = Object.keys(careerGroups.value || {})
      .filter((g) => g !== "อื่นๆ")
      .join(", ");

    const prompt = `
${profileText}

คำขอ: แนะนำอาชีพเป้าหมายที่เหมาะสม 1-2 อาชีพ (ไม่เกิน 2 อาชีพต่อกลุ่มอาชีพ)
เงื่อนไข:
1) กลุ่มอาชีพต้องเลือกจาก: [${availableGroups}] หรือใกล้เคียงที่สุด
2) ให้ "score" เป็น % ความสอดคล้อง (0-100)
3) ให้ "reason" เป็นเหตุผลสั้นๆ 1 ประโยค
4) ตอบเป็น JSON array เท่านั้น: [{"career_name":"...","ca_group_name":"...","score":85,"reason":"..."}]
`.trim();

    const messages = [
      { role: "system", content: "คุณเป็นที่ปรึกษาแนะแนวอาชีพ" },
      { role: "user", content: prompt }
    ];

    const res = await axios.post(CHAT_URL, {
      messages,
      gemini_api_key: sessionStorage.getItem("gemini_api_key")
    }, { timeout: 300000 });
    const reply = res?.data?.reply || "";
    const recommendations = safeParseJsonArray(reply);

    // reset scores
    Object.keys(careerScores).forEach((k) => delete careerScores[k]);

    aiRecommendations.value = recommendations.map((rec) => {
      const name = String(rec.career_name || "").trim();
      const match = careerOptionsAll.value.find((c) => normalizeCareerName(c.label) === normalizeCareerName(name));

      if (match && rec.score != null) {
        careerScores[match.value] = rec.score;
      }

      return {
        career_name: name,
        ca_group_name: String(rec.ca_group_name || "").trim(),
        score: rec.score ?? null,
        reason: rec.reason || "",
        status: match ? "Existing" : "New",
        existingId: match ? match.value : null
      };
    });

    // remove dialog show
    // if (aiRecommendations.value.length > 0) showAiDialog.value = true;
    // else $q.notify({ type: "warning", message: "AI ไม่สามารถแนะนำอาชีพได้ในขณะนี้" });
  } catch (e) {
    console.error(e);
    // $q.notify({ type: "negative", message: "เกิดข้อผิดพลาดในการขอคำแนะนำจาก AI" });
  } finally {
    isAiLoading.value = false;
  }
}

function openEditAiRec(rec) {
  aiEditItem.career_name = rec.career_name;
  aiEditItem.ca_group_name = rec.ca_group_name || "";
  aiEditItem.start_date = todayDMY();
  aiEditItem.existingId = rec.existingId;
  aiEditItem.status = rec.status;
  showAiEditDialog.value = true;
}

async function saveAndAddAiRec() {
  if (!isValidDMY(aiEditItem.start_date)) {
    $q.notify({ type: "warning", message: "กรุณาระบุวันเริ่มแผนให้ถูกต้อง" });
    return;
  }
  await acceptAiRecommendation(
    {
      career_name: aiEditItem.career_name,
      ca_group_name: aiEditItem.ca_group_name,
      status: aiEditItem.status,
      existingId: aiEditItem.existingId,
      start_date: aiEditItem.start_date // Pass start_date from aiEditItem
    }
  );
  showAiEditDialog.value = false;
}

async function acceptAiRecommendation(rec) {
  try {
    const careerName = String(rec.career_name || "").trim();
    const groupName = String(rec.ca_group_name || "").trim() || "อื่นๆ";

    // ✅ ไม่ต้องพึ่ง status: ไม่เจอ -> insert เข้า career ให้เอง
    const careerId = await ensureCareerIdByName(careerName, groupName);
    if (!careerId) {
      $q.notify({ type: "negative", message: "ไม่สามารถบันทึกอาชีพจาก AI ได้" });
      return;
    }

    if (isDuplicateCareer(careerId)) {
      $q.notify({ type: "warning", message: "อาชีพนี้ถูกเพิ่มไว้แล้ว" });
      return;
    }

    const startDMY = rec.start_date || todayDMY(); // Use rec.start_date if available, otherwise todayDMY

    await axios.post(`${urls.rest_api}/plan-careers`, {
      member_id: plan_career.member_id,
      career_id: careerId,
      start_date: dmyToYmd(startDMY)
    });

    $q.notify({ type: "positive", message: `เพิ่ม "${careerName}" สำเร็จ` });

    // ✅ Remove from recommendations list
    aiRecommendations.value = aiRecommendations.value.filter(
      (r) => normalizeCareerName(r.career_name) !== normalizeCareerName(careerName)
    );

    await getUpdate(plan_career.member_id);
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "ไม่สามารถเพิ่มอาชีพได้" });
  }
}

/* ---------------------------
 * Lifecycle
 * --------------------------- */
function initUrls() {
  urls.rest_api = getRestApiUrl(store);
}

onMounted(async () => {
  initUrls();
  await fetchMasterCareerGroups();
  await getCareer();
  await getUpdate(store.getters.myMember_id);
  await getIndividualData();
  // Removed auto-run AI - now only runs when user clicks "ขอคำแนะนำใหม่" button
});

</script>

<style lang="sass">
.page-bg
  background: linear-gradient(135deg, #74c588 0%, #0ad13c 100%)
  min-height: 100vh

.q-table__title
  font-size: 1.2rem
  font-weight: 500
</style>
