<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="items-center justify-center" style="background: linear-gradient(#74c588, #0ad13c)">
        <div class="full-width">
          <div class="col-md-10 offset-md-1 col-xs-12 q-pa-xs">
            <q-card flat class="bg-white text-black">
              <q-card-section class="bg-blue-14">
                <h4 class="text-h5 text-white q-my-xs text-center">{{ title }}</h4>
              </q-card-section>

              <!-- Progress (auto enrich) -->
              <q-card-section v-if="isEnriching" class="q-pt-sm q-pb-none">
                <div class="row items-center q-col-gutter-sm">
                  <div class="col-12 col-md-4">
                    <q-badge color="teal" class="q-pa-sm">{{ enrichStage }}</q-badge>
                  </div>
                  <div class="col-12 col-md-8">
                    <q-linear-progress :value="enrichProgress" rounded stripe />
                    <div class="text-caption text-grey-7 q-mt-xs">{{ enrichInfo }}</div>
                  </div>
                </div>
              </q-card-section>

              <div class="row">
                <div class="col-md-12 col-xs-12 q-pa-xs">
                  <q-form @submit.prevent="submitForm" @reset="resetForm" class="q-gutter-md">

                    <!-- ==========================
                        ฟอร์มการประเมิน (คงเดิม)
                    =========================== -->
                    <!-- รายชื่อ -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterMember" color="blue-3" v-model="member"
                          :options="members.options" label="ชื่อ-สกุล *" stack-label
                          @update:model-value="onMemberNames">
                          <template v-slot:prepend><q-icon name="school" /></template>

                          <template v-slot:selected>
                            ชื่อ-สกุล:
                            <q-chip v-if="member && member.label" dense square color="white" text-color="primary"
                              class="q-pa-xs">
                              {{ member.label }} ({{ member.description }})
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>

                          <template v-if="member && member.value" v-slot:append>
                            <q-icon name="cancel" class="cursor-pointer" @click.stop.prevent="clearMember()" />
                          </template>
                        </q-select>
                      </div>
                    </div>

                    <!-- อาชีพ + คุณสมบัติ -->
                    <div class="row">
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterPlan_career" color="blue-3" v-model="plan_career"
                          :options="plan_careers.options" label="อาชีพเป้าหมาย *" stack-label
                          @update:model-value="onQa_plan_career">
                          <template v-slot:prepend><q-icon name="work" /></template>

                          <template v-slot:selected>
                            อาชีพ:
                            <q-chip v-if="plan_career && plan_career.label" dense square color="white"
                              text-color="primary" class="q-pa-xs">
                              {{ plan_career.label }} ({{ plan_career.description }})
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>

                          <template v-if="plan_career && plan_career.value" v-slot:append>
                            <q-icon name="cancel" class="cursor-pointer" @click.stop.prevent="clearPlanCareer()" />
                          </template>
                        </q-select>
                      </div>

                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterQa_plan_career" color="blue-3" v-model="qa_plan_career"
                          :options="qa_plan_careers.options" label="คุณสมบัติ/ทักษะ *" stack-label
                          @update:model-value="onDescription">
                          <template v-slot:prepend><q-icon name="checklist" /></template>

                          <template v-slot:selected>
                            คุณสมบัติ:
                            <q-chip v-if="qa_plan_career && qa_plan_career.label" dense square color="white"
                              text-color="primary" class="q-pa-xs">
                              {{ qa_plan_career.label }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>

                          <template v-if="qa_plan_career && qa_plan_career.value" v-slot:append>
                            <q-icon name="cancel" class="cursor-pointer" @click.stop.prevent="clearQaPlanCareer()" />
                          </template>
                        </q-select>
                      </div>
                    </div>

                    <!-- ความสำคัญ/เป้าหมาย -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-input type="textarea" color="blue-3" standout bottom-slots
                          v-model="qa_plan_career_description" label="ความสำคัญ/เป้าหมาย" clearable autogrow>
                          <template v-slot:prepend><q-icon name="play_lesson" /></template>
                          <template v-slot:append><q-icon name="favorite" /></template>
                        </q-input>
                      </div>
                    </div>

                    <!-- วันประเมิน + ผล -->
                    <div class="row">
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-input filled v-model="self_assessment_date" label="วันประเมินตนเอง *" mask="##/##/####"
                          fill-mask hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn clearable>
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="self_assessment_date" mask="DD/MM/YYYY">
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
                        <q-select use-input @filter="filterPerform" color="green" v-model="perform_id"
                          :options="perform.options" label="ผลการพัฒนาตนเอง" emit-value map-options>
                          <template v-slot:prepend><q-icon name="flag_circle" /></template>
                          <template v-if="perform_id" v-slot:append>
                            <q-icon name="cancel" class="cursor-pointer" @click.stop.prevent="perform_id = null" />
                          </template>
                        </q-select>
                      </div>
                    </div>

                    <!-- หลักฐาน/ผลงาน -->
                    <div class="row">
                      <div class="col-12 q-pa-xs">
                        <q-table title="ข้อมูลผลงาน" :rows="references1" :columns="references" row-key="reference_id"
                          :filter="filter_reference" :loading="loading" separator="cell">
                          <template v-slot:top-right="props">
                            <div class="row items-center q-col-gutter-sm">
                              <div class="col-6">
                                <q-input dense debounce="300" v-model="filter_reference" placeholder="ค้นหาผลงาน">
                                  <template v-slot:append><q-icon name="search" /></template>
                                </q-input>
                              </div>
                              <div class="col-4">
                                <q-btn rounded flat icon="add_circle" label="เพิ่มข้อมูล" no-caps
                                  @click="openAddRefDialog()" />
                              </div>
                              <div class="col-2">
                                <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                  @click="props.toggleFullscreen" />
                              </div>
                            </div>

                            <q-dialog v-model="show_dialog">
                              <q-card style="min-width: 420px">
                                <q-card-section>
                                  <div class="text-h6">{{ isEditRef ? "แก้ไขผลงาน" : "เพิ่มผลงาน" }}</div>
                                </q-card-section>
                                <q-card-section>
                                  <q-input v-model="editedReference.reference_id" label="รหัสผลงาน" disable />
                                  <q-input v-model="editedReference.reference_description"
                                    label="แหล่งข้อมูลอ้างอิง/ผลงาน" />
                                </q-card-section>
                                <q-card-actions align="right">
                                  <q-btn flat :label="btnLabel_" color="primary" v-close-popup @click="addRow" />
                                </q-card-actions>
                              </q-card>
                            </q-dialog>
                          </template>

                          <template v-slot:body-cell-actions="props">
                            <q-td :props="props">
                              <q-btn color="blue" label="แก้ไข" no-caps class="q-mr-sm" @click="editItem(props.row)" />
                              <q-btn color="red" label="ลบ" no-caps @click="deleteItem(props.row)" />
                            </q-td>
                          </template>
                        </q-table>
                      </div>
                    </div>

                    <!-- ปุ่มบันทึก -->
                    <div class="row">
                      <div class="col-12 q-pa-xs row justify-center">
                        <q-btn :label="btnLabel" type="submit" color="primary" icon="save" class="q-mr-sm" />
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-mr-sm" icon="clear" />
                        <q-btn icon="logout" label="ออก" color="primary" flat class="q-mr-sm" to="/" />
                      </div>
                    </div>

                    <q-separator spaced />

                    <!-- ==========================
                        ตารางประวัติ (เติมครบอัตโนมัติ)
                    =========================== -->
                    <div class="row q-col-gutter-sm q-mb-md">
                      <div class="col-12">
                        <q-card flat bordered class="bg-blue-1">
                          <q-item class="bg-blue-2">
                            <q-item-section avatar><q-icon name="manage_search" color="primary"
                                size="md" /></q-item-section>
                            <q-item-section>
                              <q-item-label
                                class="text-bold text-primary text-subtitle1">ประวัติการประเมินตนเอง</q-item-label>
                              <q-item-label caption class="text-primary">
                                เติมครบ: ชื่อ-สกุล / อาชีพ / ความสำคัญ / แผนพัฒนา / หลักฐาน
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-card-section>
                            <div class="row q-col-gutter-sm items-center">
                              <div class="col-md-4 col-xs-12">
                                <q-select dense outlined bg-color="white" v-model="years_id" :options="years.options"
                                  label="เลือกปี (กรอง)" emit-value map-options @update:model-value="on_years"
                                  @filter="filterYear" clearable />
                              </div>
                              <div class="col-md-3 col-xs-12">
                                <q-btn color="primary" unelevated icon="search" label="กรองข้อมูล" class="full-width"
                                  @click="applyFiltersClient()" />
                              </div>
                              <div class="col-md-3 col-xs-12">
                                <q-btn color="grey-8" unelevated icon="restart_alt" label="แสดงทั้งหมด"
                                  class="full-width" @click="loadAll()" />
                              </div>
                              <div class="col-md-2 col-xs-12">
                                <q-badge color="teal" class="q-pa-sm">ทั้งหมด: {{ selfAssessments1.length }}</q-badge>
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12 q-pa-xs">
                        <q-table :key="tableKey" title="ประวัติการประเมินตนเอง" :rows="selfAssessments1"
                          :columns="main_columns" row-key="self_assessment_id" :filter="filter" :loading="loading"
                          separator="cell" style="min-height: 55vh" no-data-label="ไม่พบข้อมูล"
                          :rows-per-page-options="[30, 50, 100, 0]">
                          <template v-slot:top-right="props">
                            <div class="row q-gutter-sm items-center">
                              <q-input dense debounce="300" v-model="filter" placeholder="ค้นหาในตาราง..." outlined
                                bg-color="white">
                                <template v-slot:append><q-icon name="search" /></template>
                              </q-input>
                              <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                @click="props.toggleFullscreen" />
                            </div>
                          </template>

                          <template v-slot:body-cell-actions="props">
                            <q-td :props="props">
                              <q-btn color="blue" label="แก้ไข" no-caps class="q-mr-sm"
                                @click="OnEdit(props.row.self_assessment_id)" />
                              <q-btn color="red" label="ลบ" no-caps
                                @click="onDelete(props.row.self_assessment_id, props.row.self_assessment_date)" />
                            </q-td>
                          </template>
                        </q-table>
                      </div>
                    </div>

                  </q-form>
                </div>
              </div>

            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import { useQuasar } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig.js";

export default {
  name: "FormSelfAssessmentAdmin",

  data() {
    return {
      $q: useQuasar(),
      title: "การประเมินตนเอง(ผู้ดูแลระบบ)",

      loading: false,
      tableKey: 0,
      filter: "",
      filter_reference: "",

      // history table
      selfAssessments1: [],
      selfAssessments1_: [],

      // form
      isEdit: false,
      isEditRef: false,
      btnLabel: "เพิ่มข้อมูล",
      btnLabel_: "เพิ่มผลงาน",
      self_assessment_date: "",
      self_assessment_id: null,
      perform_id: null,

      member: null,
      plan_career: null,
      qa_plan_career: null,
      qa_plan_career_description: "",

      // options
      members: { options: [] },
      members_: { options: [] },
      memberNameById: {},

      plan_careers: { options: [] },
      plan_careers_: { options: [] },

      qa_plan_careers: { options: [] },
      qa_plan_careers_: { options: [] },

      perform: { options: [] },
      perform_: { options: [] },

      years_id: null,
      years: { options: [] },
      years_: { options: [] },
      filterConditions: { year: null },

      // references in form
      show_dialog: false,
      editedIndex: -1,
      references1: [],
      references2: [],
      editedReference: { reference_id: "", reference_description: "" },

      references: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        { name: "reference_description", align: "left", label: "แหล่งอ้างอิง/ผลงาน", field: "reference_description", sortable: true },
      ],

      // history columns
      main_columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ", field: "" },
        { name: "full_name", align: "left", label: "ชื่อ-สกุล", field: "full_name", sortable: true },
        { name: "self_assessment_date", align: "center", label: "วันประเมิน", field: "self_assessment_date", sortable: true },
        { name: "career_name", align: "left", label: "อาชีพ", field: "career_name", sortable: true },
        { name: "qualification_name", align: "left", label: "คุณสมบัติ", field: "qualification_name", sortable: true },
        { name: "importance_name", align: "center", label: "ความสำคัญ", field: "importance_name", sortable: true },
        { name: "plan_title", align: "left", label: "แผนพัฒนาตนเอง", field: "plan_title", sortable: true },
        { name: "reference_description", align: "left", label: "หลักฐาน", field: "reference_description", sortable: true },
        { name: "target_value", align: "center", label: "ค่าเป้าหมาย", field: "target_value", sortable: true },
        { name: "perform_value", align: "center", label: "ผลการประเมิน", field: "perform_value", sortable: true },
      ],
    };
  },

  methods: {
    // ---------- helpers
    normalizeRows(payload) {
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (payload && Array.isArray(payload.rows)) return payload.rows;
      if (payload && Array.isArray(payload.result)) return payload.result;
      return [];
    },

    yearToDay(day_to_year) {
      const arr = String(day_to_year || "").split("/");
      if (arr.length !== 3) return "0000/00/00";
      return `${arr[2]}/${arr[1]}/${arr[0]}`;
    },
    dayToYear(year_to_day) {
      if (!year_to_day) return "";
      const arr = String(year_to_day).split("/");
      if (arr.length !== 3) return "";
      return `${arr[2]}/${arr[1]}/${arr[0]}`;
    },

    mapSelfAssessments(rawRows) {
      return rawRows.map((r) => ({
        self_assessment_id: r.self_assessment_id ?? r.id,
        member_id: r.member_id ?? null,
        qa_plan_career_id: r.qa_plan_career_id ?? null,
        perform_id: r.perform_id ?? null,
        plan_id: r.plan_id ?? null,

        self_assessment_date: r.self_assessment_date || "-",
        full_name: r.full_name || "-",
        career_name: r.career_name || "-",
        qualification_name: r.qualification_name || "-",
        importance_name: r.importance_name || "-",
        plan_title: r.plan_title || "-",
        reference_description: r.reference_description || "-",
        target_value: r.target_value || "-",
        perform_value: r.perform_value || "-",
      }));
    },

    async fetch(url, paramsOrUndefined) {
      const res = paramsOrUndefined ? await axios.get(url, { params: paramsOrUndefined }) : await axios.get(url);
      return this.normalizeRows(res.data);
    },

    async loadAll() {
      this.loading = true;
      try {
        const base = getRestApiUrl(this.$store);
        const raw = await this.fetch(`${base}/self-assessments`, undefined);
        const mapped = this.mapSelfAssessments(raw);

        this.selfAssessments1 = mapped;
        this.selfAssessments1_ = mapped;
        this.tableKey++;

        this.$q.notify({ color: "positive", icon: "check", message: `แสดงข้อมูลสำเร็จ ${mapped.length} รายการ` });
      } catch (e) {
        console.error("[loadAll]", e);
        this.$q.notify({ color: "negative", icon: "error", message: "โหลดข้อมูลไม่สำเร็จ: " + (e.response?.data?.error || e.message) });
      } finally {
        this.loading = false;
      }
    },

    // ---------- client filter by year
    applyFiltersClient() {
      const y = this.filterConditions.year;
      let rows = Array.isArray(this.selfAssessments1_) ? [...this.selfAssessments1_] : [];
      if (y) rows = rows.filter(r => String(r.self_assessment_date || "").includes(String(y)));
      this.selfAssessments1 = rows;
      this.tableKey++;
    },

    // ---------- options loaders
    async getMember() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`);
        const rows = this.normalizeRows(res.data);

        this.members.options = rows.map(item => ({
          label: item.full_name,
          value: item.member_id,
          description: item.status || "",
        }));
        this.members_.options = this.members.options;

        this.memberNameById = {};
        this.members.options.forEach(m => {
          this.memberNameById[String(m.value)] = m.label;
        });
      } finally {
        this.loading = false;
      }
    },

    async getPerform() {
      const res = await axios.get(`${getRestApiUrl(this.$store)}/self-assessments/perform`);
      const rows = this.normalizeRows(res.data);
      this.perform.options = rows.map(item => ({ label: item.perform_name, value: item.perform_id }));
      this.perform_.options = this.perform.options;
    },

    async getYear() {
      const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers/years`);
      const rows = this.normalizeRows(res.data);
      this.years.options = rows.map(item => ({ label: item.Year ?? item.year ?? item, value: item.Year ?? item.year ?? item }));
      this.years_.options = this.years.options;
    },

    async getPlan_career(member_id) {
      if (!member_id) return;
      const res = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers`, { params: { member_id } });
      const rows = this.normalizeRows(res.data);
      this.plan_careers.options = rows.map(item => ({
        label: item.career_name,
        value: item.plan_career_id,
        description: item.start_date || "",
      }));
      this.plan_careers_.options = this.plan_careers.options;
    },

    async onQa_plan_career(planCareer) {
      if (!planCareer?.value) return;
      const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers`, { params: { plan_career_id: planCareer.value } });
      const rows = this.normalizeRows(res.data);
      this.qa_plan_careers.options = rows.map(item => ({
        label: item.qualification_name,
        value: item.qa_plan_career_id,
        description: `- ${item.level_description}\n- ${item.target_name}`,
      }));
      this.qa_plan_careers_.options = this.qa_plan_careers.options;
    },

    // ---------- select filters
    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter(v => String(v.label).toLowerCase().includes(needle));
      });
    },
    filterPlan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.plan_careers.options = this.plan_careers_.options.filter(v => String(v.label).toLowerCase().includes(needle));
      });
    },
    filterQa_plan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.qa_plan_careers.options = this.qa_plan_careers_.options.filter(v => String(v.label).toLowerCase().includes(needle));
      });
    },
    filterPerform(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.perform.options = this.perform_.options.filter(v => String(v.label).toLowerCase().includes(needle));
      });
    },
    filterYear(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.years.options = this.years_.options.filter(v => String(v.label).toLowerCase().includes(needle));
      });
    },

    // ---------- handlers
    onMemberNames(m) {
      if (m?.value) this.getPlan_career(m.value);
    },
    onDescription(qa) {
      this.qa_plan_career_description = qa?.description || "";
    },
    on_years(val) {
      this.filterConditions.year = val || null;
    },

    clearMember() {
      this.member = null;
      this.plan_career = null;
      this.qa_plan_career = null;
      this.qa_plan_career_description = "";
      this.plan_careers.options = [];
      this.qa_plan_careers.options = [];
    },
    clearPlanCareer() {
      this.plan_career = null;
      this.qa_plan_career = null;
      this.qa_plan_career_description = "";
      this.qa_plan_careers.options = [];
    },
    clearQaPlanCareer() {
      this.qa_plan_career = null;
      this.qa_plan_career_description = "";
    },

    // ---------- references CRUD (form)
    openAddRefDialog() {
      this.isEditRef = false;
      this.btnLabel_ = "เพิ่มผลงาน";
      this.editedIndex = -1;
      this.editedReference = { reference_id: "", reference_description: "" };
      this.show_dialog = true;
    },
    editItem(item) {
      this.isEditRef = true;
      this.btnLabel_ = "แก้ไขผลงาน";
      this.editedIndex = this.references1.findIndex(r => r.reference_id === item.reference_id);
      this.editedReference = { ...item };
      this.show_dialog = true;
    },
    async addRow() {
      const desc = String(this.editedReference.reference_description || "").trim();
      if (!desc) {
        this.$q.notify({ color: "warning", icon: "warning", message: "กรุณากรอกผลงาน/หลักฐาน" });
        return;
      }

      if (this.editedIndex > -1) Object.assign(this.references1[this.editedIndex], this.editedReference);
      else this.references1.push({ ...this.editedReference, reference_description: desc });

      if (this.isEdit && this.self_assessment_id) {
        try {
          const base = getRestApiUrl(this.$store);
          if (!this.isEditRef) {
            await axios.post(`${base}/self-assessments/${this.self_assessment_id}/references`, { reference_description: desc });
          } else {
            await axios.put(`${base}/self-assessments/references/${this.editedReference.reference_id}`, { reference_description: desc });
            this.isEditRef = false;
            this.btnLabel_ = "เพิ่มผลงาน";
          }
          await this.getReferenceBySelfAssessmentId(this.self_assessment_id);
          this.$q.notify({ color: "positive", icon: "check_circle", message: "บันทึกผลงานสำเร็จ" });
        } catch (e) {
          this.$q.notify({ color: "negative", icon: "error", message: "บันทึกผลงานไม่สำเร็จ: " + (e.response?.data?.error || e.message) });
        }
      }
    },
    async deleteItem(item) {
      const refId = item.reference_id;
      const desc = item.reference_description;

      if (!this.isEdit) {
        const idx = this.references1.findIndex(r => r.reference_id === refId);
        if (idx > -1) this.references1.splice(idx, 1);
        return;
      }

      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบผลงาน: ${desc} หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${getRestApiUrl(this.$store)}/self-assessments/references/${refId}`);
          await this.getReferenceBySelfAssessmentId(this.self_assessment_id);
          this.$q.notify({ color: "positive", icon: "check_circle", message: "ลบผลงานสำเร็จ" });
        } catch (e) {
          this.$q.notify({ color: "negative", icon: "error", message: "ลบผลงานไม่สำเร็จ: " + (e.response?.data?.error || e.message) });
        }
      });
    },
    async getReferenceBySelfAssessmentId(self_assessment_id) {
      const res = await axios.get(`${getRestApiUrl(this.$store)}/self-assessments/${self_assessment_id}/references`);
      this.references1 = this.normalizeRows(res.data);
    },

    // ---------- CRUD self assessment
    async submitForm() {
      if (!this.qa_plan_career?.value || !this.self_assessment_date) {
        this.$q.notify({ color: "warning", icon: "warning", message: "กรุณากรอกข้อมูลให้ครบ (คุณสมบัติ/วันประเมิน)" });
        return;
      }

      const data = {
        self_assessment_date: this.yearToDay(this.self_assessment_date),
        qa_plan_career_id: this.qa_plan_career.value,
        perform_id: this.perform_id,
      };

      const base = getRestApiUrl(this.$store);

      if (!this.isEdit) {
        this.$q.dialog({
          title: "ยืนยัน",
          message: "คุณต้องการเพิ่มข้อมูลการประเมินตนเองหรือไม่ ?",
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          try {
            const res = await axios.post(`${base}/self-assessments`, data);

            if (res.data?.self_assessment_id && this.references1.length > 0) {
              const refPayload = this.references1.map(r => ({ reference_description: r.reference_description || r }));
              await axios.post(`${base}/self-assessments/${res.data.self_assessment_id}/references/bulk`, { references: refPayload });
            }

            this.$q.notify({ color: "positive", icon: "check_circle", message: "บันทึกข้อมูลสำเร็จ" });
            this.resetForm();
            await this.loadAll();
          } catch (e) {
            this.$q.notify({ color: "negative", icon: "error", message: "บันทึกไม่สำเร็จ: " + (e.response?.data?.error || e.message) });
          }
        });
      } else {
        try {
          await axios.put(`${base}/self-assessments/${this.self_assessment_id}`, data);
          this.$q.notify({ color: "positive", icon: "check_circle", message: "แก้ไขข้อมูลสำเร็จ" });
          this.resetForm();
          await this.loadAll();
        } catch (e) {
          this.$q.notify({ color: "negative", icon: "error", message: "แก้ไขไม่สำเร็จ: " + (e.response?.data?.error || e.message) });
        }
      }
    },

    async OnEdit(self_assessment_id) {
      this.isEdit = true;
      this.btnLabel = "บันทึกการแก้ไข";
      this.self_assessment_id = self_assessment_id;

      try {
        const base = getRestApiUrl(this.$store);
        const res = await axios.get(`${base}/self-assessments/${self_assessment_id}`);
        const d = res.data;

        this.member = { value: d.member_id, label: d.full_name, description: d.status || "" };
        await this.getPlan_career(d.member_id);

        this.plan_career = { value: d.plan_career_id, label: d.career_name, description: d.start_date || "" };
        await this.onQa_plan_career({ value: d.plan_career_id });

        this.qa_plan_career = {
          value: d.qa_plan_career_id,
          label: d.qualification_name,
          description: `- ${d.level_description}\n- ${d.target_name}`,
        };
        this.qa_plan_career_description = this.qa_plan_career.description;

        this.perform_id = d.perform_id;
        this.self_assessment_date = this.dayToYear(d.self_assessment_date);

        await this.getReferenceBySelfAssessmentId(self_assessment_id);
      } catch (e) {
        this.$q.notify({ color: "negative", icon: "error", message: "โหลดข้อมูลแก้ไขไม่สำเร็จ: " + (e.response?.data?.error || e.message) });
      }
    },

    async onDelete(self_assessment_id, self_assessment_date) {
      try {
        // Check dependencies
        const resCheck = await axios.post(`${getRestApiUrl(this.$store)}/self-assessments/check-dependencies`, {
          id: self_assessment_id,
        });
        const hasDeps = resCheck.data.has_dependencies;
        const depCount = resCheck.data.count;

        if (hasDeps) {
          this.$q.dialog({
            title: "ไม่สามารถลบได้",
            message: `ไม่สามารถลบผลการประเมินวัน ${self_assessment_date} ได้ เนื่องจากมีข้อมูลหลักฐาน/ผลงานที่เกี่ยวข้อง ${depCount} รายการ\n\nกรุณาลบข้อมูลหลักฐานที่เกี่ยวข้องออกให้หมดก่อน`,
            ok: { label: 'รับทราบ', color: 'primary' }
          });
          return;
        }

        this.$q.dialog({
          title: "ยืนยัน",
          message: `คุณต้องการลบผลการประเมินวัน ${self_assessment_date} หรือไม่ ?`,
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          try {
            await axios.delete(`${getRestApiUrl(this.$store)}/self-assessments/${self_assessment_id}`);
            this.$q.notify({ color: "positive", icon: "check_circle", message: "ลบข้อมูลสำเร็จ" });
            await this.loadAll();
          } catch (e) {
            this.$q.notify({ color: "negative", icon: "error", message: "ลบไม่สำเร็จ: " + (e.response?.data?.error || e.message) });
          }
        });
      } catch (e) {
        console.error("Dependency check failed:", e);
        this.$q.notify({ color: "negative", icon: "error", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
      }
    },

    resetForm() {
      this.isEdit = false;
      this.isEditRef = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.btnLabel_ = "เพิ่มผลงาน";

      this.member = null;
      this.plan_career = null;
      this.qa_plan_career = null;
      this.qa_plan_career_description = "";
      this.perform_id = null;
      this.self_assessment_date = "";
      this.self_assessment_id = null;

      this.references1 = [];
      this.filter_reference = "";
    },
  },

  async mounted() {
    await this.getMember();  // ต้องมาก่อนเพื่อเติมชื่อ
    await this.getPerform();
    await this.getYear();
    await this.loadAll();    // เติมครบทุกคอลัมน์อัตโนมัติ
  },
};
</script>

<style scoped></style>
