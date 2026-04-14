<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="items-center justify-center" style="background: linear-gradient(135deg, #74c588 0%, #0ad13c 100%); min-height: 100vh;">
        <div class="full-width">
          <div class="col-md-10 offset-md-1 col-xs-12 q-pa-xs">
            <q-card flat class="bg-white text-black">
              <q-card-section class="bg-blue-14">
                <h4 class="text-h5 text-white q-my-xs text-center">
                  {{ title }}
                </h4>
              </q-card-section>
              <div class="row">
                <div class="col-md-12 col-xs-12 q-pa-xs">
                  <q-form @submit.prevent="submitForm" @reset="resetForm" method="post" class="q-gutter-md">
                    <!-- รายชื่อ -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterMember" color="blue-3" v-model="member"
                          :options="members.options" label="ชื่อ-สกุล *" stack-label
                          @update:model-value="(val) => onMemberNames(val)">
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:selected>
                            ชื่อ-สกุล:
                            <q-chip v-if="member" dense square color="white" text-color="primary" class="q-pa-xs">
                              {{
                                member.label != ""
                                  ? member.label +
                                  " (" +
                                  member.description +
                                  ")"
                                  : ""
                              }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>
                          <template v-if="member" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="onMember((member = null))"
                              class="cursor-pointer" />
                          </template>
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section avatar>
                                <q-icon :name="scope.opt.icon" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>{{
                                  scope.opt.label
                                }}</q-item-label>
                                <q-item-label caption>{{
                                  scope.opt.description
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                    </div>
                    <!-- อาชีพเป้าหมาย + คุณสมบัติ-->
                    <div class="row">
                      <!-- แผนอาชีพ -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterPlan_career" color="blue-3" v-model="plan_career"
                          :options="plan_careers.options" label="อาชีพเป้าหมาย *" stack-label @update:model-value="(plan_career_id) => onQa_plan_career(plan_career_id)
                          ">
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:selected>
                            อาชีพ:
                            <q-chip v-if="plan_career" dense square color="white" text-color="primary" class="q-pa-xs">
                              {{
                                plan_career.label != ""
                                  ? plan_career.label +
                                  " (" +
                                  plan_career.description +
                                  ")"
                                  : ""
                              }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>
                          <template v-if="plan_career" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="
                              onQa_plan_career_((plan_career = null))
                              " class="cursor-pointer" />
                          </template>
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section avatar>
                                <q-icon :name="scope.opt.icon" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>{{
                                  scope.opt.label
                                }}</q-item-label>
                                <q-item-label caption>{{
                                  scope.opt.description
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                      <!-- คุณสมบัติ -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterQa_plan_career" color="blue-3" v-model="qa_plan_career"
                          :options="qa_plan_careers.options" label="คุณสมบัติ/ทักษะ *" stack-label
                          @update:model-value="onQualification(qa_plan_career)">
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:selected>
                            คุณสมบัติ:
                            <q-chip v-if="qa_plan_career" dense square color="white" text-color="primary"
                              class="q-pa-xs">
                              {{
                                qa_plan_career.label != ""
                                  ? qa_plan_career.label
                                  : ""
                              }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>
                          <template v-if="qa_plan_career" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="
                              onQualification((qa_plan_career = null))
                              " class="cursor-pointer" />
                          </template>
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section avatar>
                                <q-icon :name="scope.opt.icon" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>{{
                                  scope.opt.label
                                }}</q-item-label>
                                <q-item-label caption>{{
                                  scope.opt.description
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                    </div>
                    <!-- ระดับความสำคัญ/ค่าเป้าหมาย -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-input type="textarea" color="blue-3" standout bottom-slots
                          v-model="qa_plan_career_description" label="ความสำคัญ/เป้าหมาย" clearable autogrow
                          :disable="true">
                          <template v-slot:prepend>
                            <q-icon name="play_lesson" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <!-- การพัฒนา ความสำคัญ ความถี่-->
                    <div class="row">
                      <!-- การพัฒนา -->
                      <div class="col-md-4 col-xs-12 q-pa-xs">
                        <q-select @filter="filterDevelopment" use-input color="green" v-model="development_id"
                          :options="development.options" label="การพัฒนา *" emit-value map-options>
                          <template v-slot:prepend>
                            <q-icon name="post_add" />
                          </template>
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section avatar>
                                <q-icon :name="scope.opt.icon" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>{{
                                  scope.opt.label
                                }}</q-item-label>
                                <q-item-label caption>{{
                                  scope.opt.description
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                          <template v-if="development_id" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="development_id = null" class="cursor-pointer" />
                          </template>
                        </q-select>
                      </div>
                      <!-- เรื่อง -->
                      <div class="col-md-8 col-xs-12 q-pa-xs">
                        <q-input standout bottom-slots v-model="plan.plan_title" label="เรื่อง *" clearable>
                          <template v-slot:prepend>
                            <q-icon name="list_alt" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <div class="row">
                      <!-- ช่องทาง -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-input standout bottom-slots v-model="plan.plan_channel" label="ช่องทาง *" clearable>
                          <template v-slot:prepend>
                            <q-icon name="play_lesson" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                      <!-- ความสำคัญ -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select @filter="filterImportance" use-input color="green" v-model="importance_id"
                          :options="importance.options" label="ความสำคัญ *" emit-value map-options>
                          <template v-slot:prepend>
                            <q-icon name="saved_search" />
                          </template>
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section avatar>
                                <q-icon :name="scope.opt.icon" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>{{
                                  scope.opt.label
                                }}</q-item-label>
                                <q-item-label caption>{{
                                  scope.opt.description
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                          <template v-if="importance_id" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="importance_id = null" class="cursor-pointer" />
                          </template>
                        </q-select>
                      </div>
                    </div>
                    <div class="row">
                      <!-- วันเริ่มพัฒนา -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-input filled v-model="plan.plan_start_date" label="วันเริ่มพัฒนา *" mask="##/##/####"
                          fill-mask hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn clearable>
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="plan.plan_start_date" mask="DD/MM/YYYY">
                                  <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                </q-date>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <!-- วันสิ้นสุดพัฒนา -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-input filled v-model="plan.plan_end_date" label="วันสิ้นสุดพัฒนา" mask="##/##/####" fill-mask
                          hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn clearable>
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="plan.plan_end_date" mask="DD/MM/YYYY">
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
                    <!-- ปุ่มควบคุม -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                        <!-- ปุ่มบันทึก/แก้ไข -->
                        <q-btn :label="btnLabel" type="submit" color="primary" icon="save" />
                        <!-- ปุ่มยกเลิก -->
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" icon="clear" />
                        <!-- ออก -->
                        <q-btn icon="logout" label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                        <!-- กลับฟอร์มกำหนดคุณสมบัติ/ทักษะ -->
                        <q-btn color="primary" no-caps flat icon="skip_previous" label="กลับฟอร์มกำหนดคุณสมบัติ/ทักษะ"
                          to="/SuserFormQualification">
                          <q-tooltip class="bg-accent">กลับฟอร์มกำหนดคุณสมบัติ/ทักษะ</q-tooltip>
                        </q-btn>
                        <!-- ไปฟอร์มรายงานการพัฒนาตนเอง -->
                        <q-btn color="primary" no-caps flat icon="skip_next" label="ไปฟอร์มการประเมินตนเอง"
                          to="/SuserFormSelfAssessment">
                          <q-tooltip class="bg-accent">ไปฟอร์มรายงานการพัฒนาตนเอง</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <!-- Section 2: Report Export Tools -->
                    <div class="row q-mt-sm q-mb-md">
                      <div class="col-12">
                        <q-card flat bordered class="bg-green-1">
                          <q-item class="bg-green-2">
                            <q-item-section avatar>
                              <q-icon name="file_download_done" color="green-10" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-bold text-green-10 text-subtitle1">เครื่องมือส่งออกรายงาน
                                (Excel)</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-card-section class="q-py-md">
                            <div class="row q-col-gutter-md items-center">
                              <!-- Year Selection -->
                              <div class="col-md-4 col-xs-12">
                                <q-select dense outlined bg-color="white" v-model="years_id" :options="years.options"
                                  label="เลือกปีที่ต้องการส่งออก (ไม่เลือก = ข้อมูลทั้งหมด)" emit-value map-options
                                  @update:model-value="(val) => on_years(val)" @filter="filterYear">
                                  <template v-slot:prepend>
                                    <q-icon name="calendar_today" color="primary" />
                                  </template>
                                </q-select>
                              </div>
                              <!-- Export Filename -->
                              <div class="col-md-4 col-xs-12">
                                <q-input dense outlined bg-color="white" v-model="file_export"
                                  placeholder="ตั้งชื่อไฟล์รายงาน">
                                  <template v-slot:prepend>
                                    <q-icon name="drive_file_rename_outline" color="green" />
                                  </template>
                                </q-input>
                              </div>
                              <!-- Export Button -->
                              <div class="col-md-4 col-xs-12 text-center">
                                <q-btn flat color="black" icon="download" label="ส่งออก excel" @click="exportTable()" />
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>



                    <!-- ตาราง -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <div class="q-pa-xs">
                          <q-table title="ข้อมูลการพัฒนาตนเอง" :rows="filteredPlans" :columns="main_columns" row-key="plan_id"
                            :filter="filter" :loading="loading" :visible-columns="visibleColumnsPlan" separator="cell"
                            selection="multiple" v-model:selected="selected" class="my-sticky-header-table" flat bordered
                            table-header-style="height: 65px; " table-header-class="bg-blue-5"
                            :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home"
                            icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                            :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                              return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                            }">
                            <template v-slot:top-right="props">
                              <div class="row q-gutter-sm items-center">
                                <q-btn v-if="selected.length > 0" flat color="red" icon="delete"
                                  :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />

                                <q-input borderless dense debounce="300" v-model="filter"
                                    placeholder="ค้นหาการพัฒนาตนเอง">
                                    <template v-slot:append>
                                      <q-icon name="search" />
                                    </template>
                                  </q-input>
                                  <q-select v-model="visibleColumnsPlan" multiple outlined dense options-dense
                                    :display-value="$q.lang.table.columns" emit-value map-options :options="main_columns"
                                    option-value="name" options-cover style="min-width: 150px" bg-color="white" />
                                  <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                    @click="props.toggleFullscreen" />
                              </div>
                            </template>
                            <template v-slot:body-cell-actions="props">
                              <q-td :props="props">
                                <q-btn color="blue" label="แก้ไข" @click="onEdit(props.row.plan_id)" no-caps></q-btn>
                                <q-btn color="red" label="ลบ" @click="
                                  onDelete(
                                    props.row.plan_id,
                                    props.row.plan_title
                                  )
                                  " no-caps></q-btn>
                              </q-td>
                            </template>
                          </q-table>
                        </div>
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
import { ref } from "vue";
import { useQuasar } from "quasar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl } from "../../utils/apiConfig.js";
// ส่งออกไฟล์ excel


export default {
  name: "FormPlanSuperUser",
  data() {
    return {
      years_id: "",
      pdpa: ref(false),
      picked: new Date(),
      file_export: "plan_report_" + new Date().toISOString().split('T')[0],
      title: "แผนการพัฒนาตนเอง(ผู้ดูแลกลุ่ม)",
      isEdit: false,
      btnLabel: "เพิ่มข้อมูล",
      qa_plan_career_id: "",
      plan_career_id: "",
      development_id: "",
      importance_id: "",
      frequency_id: "",
      plan: {
        plan_id: "",
        plan_title: "",
        plan_channel: "",
        plan_start_date: "",
        plan_end_date: "",
      },
      qa_plan_career_description: "",
      visibleColumnsPlan: ref(["actions", "full_name", "career_name", "qualification_name", "development_name", "plan_title", "plan_channel", "importance_name", "plan_start_date", "plan_end_date"]),
      main_columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        { name: "full_name", align: "left", label: "ชื่อ-สกุล", field: "full_name", sortable: true },
        { name: "career_name", align: "left", label: "อาชีพ", field: "career_name", sortable: true },
        { name: "qualification_name", align: "left", label: "คุณสมบัติ/ทักษะ", field: "qualification_name", sortable: true },
        { name: "development_name", align: "left", label: "ด้านการพัฒนา", field: "development_name", sortable: true },
        { name: "plan_title", align: "left", label: "เรื่อง", field: "plan_title", sortable: true },
        { name: "plan_channel", align: "left", label: "ช่องทาง", field: "plan_channel", sortable: true },
        { name: "importance_name", align: "center", label: "ความสำคัญ", field: "importance_name", sortable: true },
        { name: "plan_start_date", align: "center", label: "วันเริ่ม", field: "plan_start_date", sortable: true },
        { name: "plan_end_date", align: "center", label: "วันสิ้นสุด", field: "plan_end_date", sortable: true },
      ],
      filter: ref(""),
      loading: ref(false),
      plans1: [],
      members: { options: [] },
      members_: { options: [] },
      member: ref({ label: "", value: "", description: "" }),
      plan_careers: { options: [] },
      plan_careers_: { options: [] },
      plan_career: ref({ label: "", value: "", description: "" }),
      qa_plan_careers: { options: [] },
      qa_plan_careers_: { options: [] },
      qa_plan_career: ref({ label: "", value: "", description: "" }),
      development: { options: [] },
      development_: { options: [] },
      importance: { options: [] },
      importance_: { options: [] },
      frequency: { options: [] },
      frequency_: { options: [] },
      years: { options: [] },
      years_: { options: [] },
      year: ref({ label: "", value: "" }),
      filterConditions: { year: "" },
      selected: ref([]),
      $q: useQuasar(),
    };
  },

  computed: {
    filteredPlans() {
      if (!this.filterConditions.year || this.filterConditions.year === "ทั้งหมด") {
        return this.plans1;
      }
      return this.plans1.filter((row) => {
        if (!row.plan_start_date) return false;
        const dateParts = row.plan_start_date.split(/[-/]/);
        let year = '';
        if (dateParts.length === 3) {
          year = dateParts[0].length === 4 ? dateParts[0] : dateParts[2];
        }
        return String(year) === String(this.filterConditions.year);
      });
    }
  },

  methods: {
    async exportTable() {
      const exportData = this.selected.length > 0 ? this.selected : this.filteredPlans;
      if (!exportData || exportData.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูลในตาราง กรุณาค้นหาหรือกรองข้อมูลก่อนส่งออก', icon: 'warning' });
        return;
      }

      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Self Development Plan');

        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        const groupFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        const yearTitle = this.years_id ? `ประจำปี ${this.years_id}` : '';
        worksheet.mergeCells('A1:H1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลการพัฒนาตนเอง (Super User) ${yearTitle} - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        const headerRow = worksheet.getRow(2);
        headerRow.values = ['ชื่อ-สกุล', 'คุณสมบัติ/ทักษะ', 'ด้านการพัฒนา', 'เรื่อง', 'ช่องทาง', 'ความสำคัญ', 'วันเริ่มพัฒนา', 'วันสิ้นสุด'];
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = border;
        });

        const sortedRows = [...exportData].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        let currentMember = null;
        let zebra = false;

        sortedRows.forEach(row => {
          if (row.full_name !== currentMember) {
            currentMember = row.full_name;
            const groupRow = worksheet.addRow([currentMember, '', '', '', '', '', '', '']);
            worksheet.mergeCells(`A${groupRow.number}:H${groupRow.number}`);
            groupRow.eachCell(cell => {
              cell.fill = groupFill;
              cell.font = { name: 'Sarabun', size: 10, bold: true, italic: true };
              cell.border = border;
              cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            });
            zebra = false;
          }

          const r = worksheet.addRow([
            '',
            row.qualification_name || '-',
            row.development_name || row.development_description || '-',
            row.plan_title || '-',
            row.plan_channel || '-',
            row.importance_name || '-',
            row.plan_start_date || '-',
            row.plan_end_date || '-'
          ]);

          r.eachCell((cell, colNum) => {
            cell.font = dataFont;
            cell.border = border;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            if (colNum >= 7) cell.alignment.horizontal = 'center';
            if (zebra) cell.fill = zebraFill;
          });
          zebra = !zebra;
        });

        worksheet.columns = [
          { key: 'A', width: 25 }, { key: 'B', width: 30 }, { key: 'C', width: 15 },
          { key: 'D', width: 25 }, { key: 'E', width: 15 }, { key: 'F', width: 12 },
          { key: 'G', width: 12 }, { key: 'H', width: 12 }
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || `Plan_Report_${this.years_id || 'All'}`).replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);

        this.$q.loading.hide();
        this.$q.notify({ color: 'positive', message: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว', icon: 'check' });
      } catch (error) {
        this.$q.loading.hide();
        console.error("Export error:", error);
        this.$q.notify({ color: 'negative', message: 'ส่งออกไม่สำเร็จ: ' + error.message, icon: 'error' });
      }
    },

    yearToDay(d) {
      if (!d) return "";
      const p = d.split("/");
      return `${p[2]}/${p[1]}/${p[0]}`;
    },
    dayToYear(d) {
      if (!d || d === "0000/00/00") return "00/00/0000";
      const p = d.split("/");
      return `${p[2]}/${p[1]}/${p[0]}`;
    },

    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.plan = { plan_id: "", plan_title: "", plan_channel: "", plan_start_date: "", plan_end_date: "" };
      this.qa_plan_career = { label: "", value: "", description: "" };
      this.qa_plan_career_description = "";
      this.development_id = null;
      this.importance_id = null;
    },

    async submitForm() {
      const msg = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message: msg, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            const payload = {
              qa_plan_career_id: this.qa_plan_career.value,
              development_id: this.development_id,
              importance_id: this.importance_id,
              plan_title: this.plan.plan_title,
              plan_channel: this.plan.plan_channel,
              plan_start_date: this.yearToDay(this.plan.plan_start_date),
              plan_end_date: this.yearToDay(this.plan.plan_end_date),
            };
            if (!this.isEdit) {
              await axios.post(`${getRestApiUrl(this.$store)}/plans`, payload);
              this.$q.notify({ message: "บันทึกข้อมูลเรียบร้อยแล้ว", color: "positive" });
            } else {
              await axios.put(`${getRestApiUrl(this.$store)}/plans/${this.plan.plan_id}`, payload);
              this.$q.notify({ message: "แก้ไขข้อมูลเรียบร้อยแล้ว", color: "positive" });
            }
            this.resetForm();
            await this.getUpdate();
          } catch (error) {
            this.$q.notify({
              message: "เกิดข้อผิดพลาด: " + (error.response?.data?.error || error.message),
              color: "negative",
              icon: "error"
            });
          }
        });
    },

    async onEdit(id) {
      this.isEdit = true;
      this.btnLabel = "แก้ไขข้อมูล";
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plans/${id}`);
        const d = res.data;
        this.plan.plan_id = d.plan_id;
        this.member = { label: d.full_name, value: d.member_id, description: d.status };
        this.plan_career = { label: d.career_name, value: d.plan_career_id, description: d.start_date };
        this.qa_plan_career = { label: d.qualification_name, value: d.qa_plan_career_id };
        this.qa_plan_career_description = "- " + d.level_description + "\n" + "- " + d.target_name;
        this.development_id = d.development_id;
        this.importance_id = d.importance_id;
        this.plan.plan_title = d.plan_title;
        this.plan.plan_channel = d.plan_channel;
        this.plan.plan_start_date = this.dayToYear(d.plan_start_date);
        this.plan.plan_end_date = this.dayToYear(d.plan_end_date);
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative", icon: "error" });
      }
    },

    async onDelete(id, name) {
      try {
        // Check dependencies
        const resCheck = await axios.post(`${getRestApiUrl(this.$store)}/plans/check-dependencies`, {
          plan_id: id,
          type: 'single'
        });
        const hasDeps = resCheck.data.has_dependencies;
        const depCount = resCheck.data.count;

        if (hasDeps) {
          this.$q.dialog({
            title: "ไม่สามารถลบได้",
            message: `ไม่สามารถลบการพัฒนา [${name}] ได้ เนื่องจากมีข้อมูลหลักฐาน/ผลงานที่เชื่อมโยงอยู่ ${depCount} รายการ\n\nกรุณาลบข้อมูลหลักฐานที่เกี่ยวข้องออกให้หมดก่อน (สามารถจัดการได้ที่หน้าประเมินตนเอง)`,
            ok: { label: 'รับทราบ', color: 'primary' }
          });
          return;
        }

        this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบการพัฒนา [${name}] หรือไม่ ?`, cancel: true, persistent: true })
          .onOk(async () => {
            try {
              await axios.delete(`${getRestApiUrl(this.$store)}/plans/${id}`);
              this.$q.notify({ message: "ลบสำเร็จ", color: "positive" });
              this.selected = this.selected.filter(item => item.plan_id !== id);
              await this.getUpdate();
            } catch (error) {
              this.$q.notify({ message: "Error: " + error.message, color: "negative", icon: "error" });
            }
          });
      } catch (error) {
        console.error("Dependency check failed:", error);
        this.$q.notify({ type: "negative", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
      }
    },

    deleteSelected() {
      if (this.selected.length === 0) return;

      this.$q.dialog({
        title: "ยืนยันการลบหลายรายการ",
        message: `คุณต้องการลบข้อมูลที่เลือกทั้งหมด ${this.selected.length} รายการหรือไม่?\n(ระบบจะข้ามรายการที่มีข้อมูลหลักฐานเชื่อมโยงอยู่)`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        this.$q.loading.show({ message: "กำลังลบข้อมูลที่เลือก...", spinnerColor: "red" });
        let successCount = 0;
        let failCount = 0;
        try {
          for (const item of this.selected) {
            try {
              // Check dependencies first
              const resCheck = await axios.post(`${getRestApiUrl(this.$store)}/plans/check-dependencies`, {
                plan_id: item.plan_id,
                type: 'single'
              });

              if (!resCheck.data.has_dependencies) {
                await axios.delete(`${getRestApiUrl(this.$store)}/plans/${item.plan_id}`);
                successCount++;
              } else {
                failCount++;
              }
            } catch (err) {
              console.error(`Failed to delete ID ${item.plan_id}:`, err);
              failCount++;
            }
          }

          if (successCount > 0) {
            this.$q.notify({ message: `ลบสำเร็จ ${successCount} รายการ`, color: "positive", icon: "check_circle" });
          }
          if (failCount > 0) {
            this.$q.notify({ message: `ไม่สามารถลบได้ ${failCount} รายการเนื่องจากมีข้อมูลเชื่อมโยง`, color: "warning", icon: "warning" });
          }

          this.selected = [];
          this.resetForm();
          await this.getUpdate();
        } catch (error) {
          console.error(error);
          this.$q.notify({ message: "เกิดข้อผิดพลาดในการลบข้อมูล", color: "negative", icon: "error" });
        } finally {
          this.$q.loading.hide();
        }
      });
    },

    onNext() {
      this.$router.replace({ name: "FormSelfAssessment" });
    },

    onPrevious() {
      this.$router.replace({ name: "FormQualification" });
    },

    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plans`);
        this.plans1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative", icon: "error" });
      } finally { this.loading = false; }
    },

    async getMember() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`);
        this.members.options = res.data.map(i => ({ label: i.full_name, value: i.member_id, description: i.status }));
        this.members_.options = this.members.options;
      } catch (error) {
        this.$q.notify({ message: "Error fetching members: " + error.message, color: "negative", icon: "error" });
      }
    },
    onMemberNames(m) { if (m) this.getPlan_career(m.value); },
    onMember(val) { if (!val) this.member = { label: "", value: "", description: "" }; },

    async getPlan_career(member_id) {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers`, { params: { member_id } });
        this.plan_careers.options = res.data.map(i => ({ label: i.career_name, value: i.plan_career_id, description: i.start_date }));
        this.plan_careers_.options = this.plan_careers.options;
      } catch (error) {
        this.$q.notify({ message: "Error fetching plan careers: " + error.message, color: "negative", icon: "error" });
      }
    },

    async onQa_plan_career(pc) {
      if (pc && pc.value) {
        try {
          const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers`, { params: { plan_career_id: pc.value } });
          this.qa_plan_careers.options = res.data.map(i => ({ label: i.qualification_name, value: i.qa_plan_career_id, description: "- " + i.level_description + "\n" + "- " + i.target_name }));
          this.qa_plan_careers_.options = this.qa_plan_careers.options;
        } catch (error) {
          this.$q.notify({ message: "Error fetching QA plan careers: " + error.message, color: "negative", icon: "error" });
        }
      } else {
        this.qa_plan_careers.options = [];
        this.qa_plan_careers_.options = [];
      }
    },
    onQa_plan_career_(val) {
      if (!val) {
        this.plan_career = { label: "", value: "", description: "" };
        this.qa_plan_career = { label: "", value: "", description: "" };
        this.qa_plan_career_description = "";
      }
    },
    onQualification(q) {
      if (q) {
        this.qa_plan_career_description = q.description;
      } else {
        this.qa_plan_career_description = "";
        this.qa_plan_career = { label: "", value: "", description: "" };
      }
    },

    async getDevelopment() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/developments`);
        this.development.options = res.data.map(i => ({ label: i.development_name, value: i.development_id }));
        this.development_.options = this.development.options;
      } catch (error) {
        this.$q.notify({ message: "Error fetching developments: " + error.message, color: "negative", icon: "error" });
      }
    },
    async getImportance() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/importances`);
        this.importance.options = res.data.map(i => ({ label: i.importance_name, value: i.importance_id }));
        this.importance_.options = this.importance.options;
      } catch (error) {
        this.$q.notify({ message: "Error fetching importances: " + error.message, color: "negative", icon: "error" });
      }
    },

    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterPlan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.plan_careers.options = this.plan_careers_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterQa_plan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.qa_plan_careers.options = this.qa_plan_careers_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterDevelopment(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.development.options = this.development_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterImportance(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.importance.options = this.importance_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterFrequency(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.frequency.options = this.frequency_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterYear(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.years.options = this.years_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },

    on_years(y) { this.filterConditions.year = y ? (y.value || y) : ""; },
    extractYearsFromPlans() {
      if (!this.plans1 || this.plans1.length === 0) return;
      const uniqueYears = new Set();
      this.plans1.forEach(row => {
        if (row.plan_start_date) {
          const p = row.plan_start_date.split(/[-/]/);
          if (p.length === 3) uniqueYears.add(p[0].length === 4 ? p[0] : p[2]);
        }
      });
      this.years.options = Array.from(uniqueYears).sort().reverse().map(y => ({ label: y, value: y }));
      this.years_.options = this.years.options;
    },
  },

  watch: {
    plans1() { this.extractYearsFromPlans(); }
  },

  mounted() {
    this.getMember();
    this.getUpdate();
    this.getDevelopment();
    this.getImportance();
  },
};

</script>

<style lang="sass">
.my-sticky-header-table
  height: 500px
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    background-color: #c1f4cd
  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0
  &.q-table--loading thead tr:last-child th
    top: 48px
</style>
