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
              <div class="row">
                <div class="col-md-12 col-xs-12 q-pa-xs">
                  <q-form @submit.prevent="submitForm" @reset="resetForm" method="post" class="q-gutter-md">
                    <!-- รายชื่อ -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterMember" color="primary" v-model="member"
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
                        <q-select use-input @filter="filterPlan_career" color="primary" v-model="plan_career"
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
                        <q-select use-input @filter="filterQa_plan_career" color="primary" v-model="qa_plan_career"
                          :options="qa_plan_careers.options" label="คุณสมบัติ/ทักษะ *" stack-label @update:model-value="(qa_plan_career) => onQaualification(qa_plan_career)
                          ">
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
                              onQaualification((qa_plan_career = null))
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
                        <q-input type="textarea" color="primary" standout="bg-primary text-white" bottom-slots
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
                        <q-select @filter="filterDevelopment" use-input color="primary" v-model="development_id"
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
                        <q-input standout="bg-primary text-white" bottom-slots v-model="plan.plan_title" label="เรื่อง *" clearable>
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
                        <q-input standout="bg-primary text-white" bottom-slots v-model="plan.plan_channel" label="ช่องทาง *" clearable>
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
                        <q-select @filter="filterImportance" use-input color="primary" v-model="importance_id"
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
                      <!-- v-model="plan.plan_end_date" -->
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
                          to="/AdminFormQualification">
                          <q-tooltip class="bg-accent">กลับฟอร์มกำหนดคุณสมบัติ/ทักษะ</q-tooltip>
                        </q-btn>
                        <!-- ไปฟอร์มรายงานการพัฒนาตนเอง -->
                        <q-btn color="primary" no-caps flat icon="skip_next" label="ไปฟอร์มการประเมินตนเอง"
                          to="/AdminFormSelfAssessment">
                          <q-tooltip class="bg-accent">ไปฟอร์มรายงานการพัฒนาตนเอง</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <!-- ตาราง -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <div class="q-pa-xs">
                          <q-table title="ข้อมูลการพัฒนาตนเอง" :rows="plans1" :columns="columns" row-key="id"
                            :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                            table-header-style="height: 65px; " table-header-class="bg-primary text-white"
                            :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home"
                            icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                            :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                              return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                            }">
                            <template v-slot:top-right="props">
                              <div class="row">
                                <div class="col-md-3 col-xs-6 q-pa-xs">
                                  <q-input borderless dense debounce="300" v-model="filter"
                                    placeholder="ค้นหาการพัฒนาตนเอง">
                                    <template v-slot:append>
                                      <q-icon name="search" />
                                    </template>
                                  </q-input>
                                </div>
                                <!-- ส่งออก excel -->
                                <div class="col-md-3 col-xs-6 q-pa-xs">
                                  <q-input borderless dense debounce="300" v-model="file_export"
                                    placeholder="ชื่อไฟล์นำออก" outlined>
                                    <template v-slot:append>
                                      <q-icon name="save" />
                                    </template>
                                  </q-input>
                                </div>
                                <!-- Year Selection for Export -->
                                <div class="col-md-2 col-xs-4 q-pa-xs">
                                  <q-select outlined dense v-model="selectedYear" :options="yearOptions"
                                    label="ปีที่ประเมิน" clearable @filter="filterYears" use-input input-debounce="0">
                                    <template v-slot:no-option>
                                      <q-item>
                                        <q-item-section class="text-grey">
                                          ไม่พบข้อมูลปี
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                  </q-select>
                                </div>
                                <div class="col-md-1 col-xs-2 q-pa-xs">
                                  <q-btn flat color="green-7" icon="download" label="ส่งออก excel" @click="exportTable()" />
                                </div>
                                <div class="col-md-2 col-xs-5 q-pa-xs">
                                  <q-select v-model="visibleColumns" multiple outlined dense options-dense
                                    :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                                    option-value="name" options-cover style="min-width: 150px" />
                                </div>
                                <div class="col-md-1 col-xs-2 q-pa-xs">
                                  <q-btn flat round dense :icon="props.inFullscreen
                                    ? 'fullscreen_exit'
                                    : 'fullscreen'
                                    " @click="props.toggleFullscreen" class="q-ml-md" />
                                </div>
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
  name: "FormPlanAdmin",
  data() {
    return {
      file_export: "",
      date: new Date(),
      qa_plan_career_description: "",
      selectedYear: null,
      yearOptions: [],
      originalYearOptions: [],
      // ------------------------------------------------------------------------------
      message: "Form Plan Career",
      title: "การพัฒนาตนเอง(ผู้ดูแลระบบ)",
      plan: {
        plan_id: "",
        plan_title: "",
        plan_channel: "",
        plan_start_date: "",
        plan_end_date: "",
      },
      isEdit: false,
      btnLabel: "เพิ่มข้อมูล",
      status: "บันทึก",
      level1: "",
      visibleColumns: ref([
        "actions",
        "plan_id",
        "member_id",
        "full_name",
        "qa_plan_career_id",
        "qualification_name",
        "development_id",
        "development_description",
        "plan_title",
        "plan_channel",
        "frequency_id",
        "frequency_name",
        "importance_id",
        "importance_name",
        "plan_start_date",
        "plan_end_date",
      ]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        // {
        //   name: "plan_id",
        //   required: true,
        //   label: "รหัสแผนพัฒนาตนเอง",
        //   align: "center",
        //   field: (row) => row.plan_id,
        //   format: (val) => `${val}`,
        //   sortable: true,
        // },
        {
          name: "full_name",
          label: "ชื่อ-สกุล",
          align: "left",
          field: "full_name",
          sortable: true,
        },
        {
          name: "qualification_name",
          label: "คุณสมบัติ",
          align: "left",
          field: "qualification_name",
          sortable: true,
        },
        {
          name: "development_description",
          label: "ชนิดการพัฒนา",
          align: "left",
          field: "development_name",
          sortable: true,
        },
        {
          name: "plan_title",
          label: "เรื่อง",
          align: "left",
          field: "plan_title",
          sortable: true,
        },
        {
          name: "plan_channel",
          label: "ช่องทาง",
          align: "left",
          field: "plan_channel",
          sortable: true,
        },
        {
          name: "importance_name",
          label: "ความสำคัญ",
          align: "center",
          field: "importance_name",
          sortable: true,
        },
        {
          name: "plan_start_date",
          label: "วันเริ่ม",
          align: "center",
          field: "plan_start_date",
          sortable: true,
        },
        {
          name: "plan_end_date",
          label: "วันสิ้นสุด",
          align: "center",
          field: "plan_end_date",
          sortable: true,
        },
      ],
      filter: ref(""),
      loading: ref(false),
      plans1: [],
      qa_plan_careers_: {
        options: [],
      },
      qa_plan_careers: {
        options: [],
      },
      qa_plan_career: ref({
        label: "",
        value: "",
        description: "",
      }),
      qa_plan_career_id: "",
      plan_careers_: {
        options: [],
      },
      plan_careers: {
        options: [],
      },
      plan_career: ref({
        label: "",
        value: "",
        description: "",
      }),
      development_id: "",
      development_: {
        options: [],
      },
      development: {
        options: [],
      },
      importance_id: "",
      importance_: {
        options: [],
      },
      importance: {
        options: [],
      },
      frequency_id: "",
      frequency_: {
        options: [],
      },
      frequency: {
        options: [],
      },
      member_id: this.$store.getters.myMember_id,
      plan_career_full_name: "",
      $q: useQuasar(),
      members: {
        options: [],
      },
      members_: {
        options: [],
      },
      member: ref({
        label: "",
        value: "",
        description: "",
      }),
    };
  },
  methods: {
    // นำออกไฟล์ excel
    async exportTable() {
      // 0. Validate Data
      if (!this.plans1 || this.plans1.length === 0) {
        this.$q.notify({
          color: 'orange',
          message: 'ไม่พบข้อมูลในตาราง กรุณาค้นหาหรือกรองข้อมูลก่อนส่งออก',
          icon: 'warning'
        });
        return;
      }

      // Filter by selected year
      let exportData = this.plans1;
      if (this.selectedYear) {
        exportData = this.plans1.filter(row => {
          if (!row.plan_start_date) return false;
          // Assuming plan_start_date is in DD/MM/YYYY format or YYYY-MM-DD
          // Adjust parsing logic based on your actual data format
          const dateParts = row.plan_start_date.split(/[-/]/);
          let year = '';
          if (dateParts.length === 3) {
            // If YYYY is at index 0 (YYYY-MM-DD) or index 2 (DD/MM/YYYY)
            year = dateParts[0].length === 4 ? dateParts[0] : dateParts[2];
          }
          return String(year) === String(this.selectedYear);
        });
      }

      if (exportData.length === 0) {
        this.$q.notify({
          color: 'orange',
          message: `ไม่พบข้อมูลสำหรับปี ${this.selectedYear}`,
          icon: 'warning'
        });
        return;
      }


      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Self-Development Plan');

        // Styles
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        const groupFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        // 1. Title
        const yearTitle = this.selectedYear ? `ประจำปี ${this.selectedYear}` : '';
        worksheet.mergeCells('A1:H1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลการพัฒนาตนเอง (Admin View) ${yearTitle} - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        // 2. Header
        const headerRow = worksheet.getRow(2);
        headerRow.values = [
          'ชื่อ-สกุล',
          'คุณสมบัติ/ทักษะ',
          'ด้านการพัฒนา',
          'เรื่อง',
          'ช่องทาง',
          'ความสำคัญ',
          'วันเริ่มพัฒนา',
          'วันสิ้นสุด'
        ];
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = border;
        });

        // 3. Data Processing (Group by Member for readability)
        // Sort by Member Name first
        // 3. Data Processing (Group by Member for readability)
        // Sort by Member Name first
        const sortedRows = [...exportData].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

        let currentMember = null;
        let zebra = false;

        sortedRows.forEach(row => {
          // Check if new member group
          if (row.full_name !== currentMember) {
            currentMember = row.full_name;
            // Add Group Header Row
            const groupRow = worksheet.addRow([currentMember, '', '', '', '', '', '', '']);
            worksheet.mergeCells(`A${groupRow.number}:H${groupRow.number}`);
            groupRow.eachCell(cell => {
              cell.fill = groupFill;
              cell.font = { name: 'Sarabun', size: 10, bold: true, italic: true };
              cell.border = border;
              cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            });
            zebra = false; // Reset zebra for new group
          }

          // Add Data Row
          const r = worksheet.addRow([
            '', // Leave Member column empty for data rows inside group
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
            if (colNum >= 7) cell.alignment.horizontal = 'center'; // Center dates
            if (zebra) cell.fill = zebraFill;
          });
          zebra = !zebra;
        });

        // 4. Column Widths
        worksheet.columns = [
          { key: 'A', width: 25 }, // Name
          { key: 'B', width: 30 }, // Qual
          { key: 'C', width: 15 }, // Dev Type
          { key: 'D', width: 25 }, // Title
          { key: 'E', width: 15 }, // Channel
          { key: 'F', width: 12 }, // Importance
          { key: 'G', width: 12 }, // Start
          { key: 'H', width: 12 }  // End
        ];

        // 5. Generate File
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Plan_Career_Admin_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);

        this.$q.loading.hide();
        this.$q.notify({ color: 'positive', message: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว', icon: 'check' });

      } catch (error) {
        this.$q.loading.hide();
        console.error("Export error:", error);
        this.$q.notify({ color: 'negative', message: 'ตีดปัญหาในการสร้างไฟล์: ' + error.message, icon: 'error' });
      }
    },
    yearToDay(day_to_year) {
      var year_to_day = day_to_year.split("/");
      return year_to_day[2] + "/" + year_to_day[1] + "/" + year_to_day[0];
    },
    dayToYear(year_to_day) {
      if (typeof year_to_day == "undefined") year_to_day = "0000/00/00";
      var day_to_year = year_to_day.split("/");
      return day_to_year[2] + "/" + day_to_year[1] + "/" + day_to_year[0];
    },
    //--------------------
    resetForm() {
      console.log("ยกเลิก");
      this.isEdit = false;
      console.log("isEdit:", this.isEdit);
      this.btnLabel = "เพิ่มข้อมูล";
      this.qa_plan_career_id = "";
      this.plan_career_id = "";
      this.development_id = "";
      this.importance_id = "";
      this.frequency_id = "";
      this.plan.plan_title = "";
      this.plan.plan_channel = "";
      this.plan.plan_start_date = "";
      this.plan.plan_end_date = "";
      this.plan_career_full_name = "";
    },
    async submitForm() {
      const start_date = this.yearToDay(this.plan.plan_start_date);
      const end_date = this.yearToDay(this.plan.plan_end_date);
      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message: message, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            const payload = {
              qa_plan_career_id: this.qa_plan_career.value,
              development_id: this.development_id,
              importance_id: this.importance_id,
              plan_title: this.plan.plan_title,
              plan_channel: this.plan.plan_channel,
              plan_start_date: start_date,
              plan_end_date: end_date,
            };
            if (!this.isEdit) {
              await axios.post(`${getRestApiUrl(this.$store)}/plans`, payload);
              this.$q.notify({ message: "เพิ่มข้อมูลสำเร็จ", color: "positive" });
            } else {
              await axios.put(`${getRestApiUrl(this.$store)}/plans/${this.plan.plan_id}`, payload);
              this.$q.notify({ message: "แก้ไขข้อมูลสำเร็จ", color: "positive" });
            }
            this.resetForm();
            this.getUpdate();
          } catch (error) {
            this.$q.notify({ message: "Error: " + (error.response?.data?.error || error.message), color: "negative" });
          }
        });
    },
    async onEdit(plan_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const response = await axios.get(`${getRestApiUrl(this.$store)}/plans/${plan_id}`);
        const data = response.data;
        this.plan.plan_id = data.plan_id;
        this.member = { label: data.full_name, value: data.member_id, description: data.status };
        this.plan_career = { label: data.career_name, value: data.plan_career_id, description: data.start_date };
        this.qa_plan_career = {
          label: data.qualification_name,
          value: data.qa_plan_career_id,
          description: `- ${data.level_description}\n- ${data.target_name}`
        };
        this.qa_plan_career_description = `- ${data.level_description}\n- ${data.target_name}`;
        this.development_id = data.development_id;
        this.importance_id = data.importance_id;
        this.frequency_id = data.frequency_id;
        this.plan.plan_title = data.plan_title;
        this.plan.plan_channel = data.plan_channel;
        this.plan.plan_start_date = this.dayToYear(data.plan_start_date);
        this.plan.plan_end_date = this.dayToYear(data.plan_end_date);
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      }
    },
    async onDelete(plan_id, plan_name) {
      try {
        // Check dependencies
        const resCheck = await axios.post(`${getRestApiUrl(this.$store)}/plans/check-dependencies`, {
          plan_id: plan_id,
          type: 'single'
        });
        const hasDeps = resCheck.data.has_dependencies;
        const depCount = resCheck.data.count;

        if (hasDeps) {
          this.$q.dialog({
            title: "ไม่สามารถลบได้",
            message: `ไม่สามารถลบการพัฒนา [${plan_name}] ได้ เนื่องจากมีข้อมูลหลักฐาน/ผลงานที่เชื่อมโยงอยู่ ${depCount} รายการ\n\nกรุณาลบข้อมูลหลักฐานที่เกี่ยวข้องออกให้หมดก่อน (สามารถจัดการได้ที่หน้าประเมินตนเอง)`,
            ok: { label: 'รับทราบ', color: 'primary' }
          });
          return;
        }

        this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบการพัฒนา [${plan_name}] หรือไม่ ?`, cancel: true, persistent: true })
          .onOk(async () => {
            try {
              await axios.delete(`${getRestApiUrl(this.$store)}/plans/${plan_id}`);
              this.$q.notify({ message: "ลบข้อมูลสำเร็จ", color: "positive" });
              this.getUpdate();
            } catch (error) {
              this.$q.notify({ message: "Error: " + error.message, color: "negative" });
            }
          });
      } catch (error) {
        console.error("Dependency check failed:", error);
        this.$q.notify({ type: "negative", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
      }
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
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      } finally {
        this.loading = false;
      }
    },
    async getDevelopment() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/developments`);
        this.development.options = res.data.map((item) => ({
          label: item.development_name,
          value: item.development_id,
        }));
        this.development_.options = [...this.development.options];
      } catch (error) {
        console.error(error);
      }
    },
    async getImportance() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/importances`);
        this.importance.options = res.data.map((item) => ({
          label: item.importance_name,
          value: item.importance_id,
        }));
        this.importance_.options = [...this.importance.options];
      } catch (error) {
        console.error(error);
      }
    },
    async getFrequency() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/frequencies`);
        this.frequency.options = res.data.map((item) => ({
          label: item.frequency_name,
          value: item.frequency_id,
        }));
        this.frequency_.options = [...this.frequency.options];
      } catch (error) {
        console.error(error);
      }
    },
    filterDevelopment(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.development.options = this.development_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterImportance(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.importance.options = this.importance_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterFrequency(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.frequency.options = this.frequency_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterQualification(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.qualification.options = this.qualification_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    async getMember() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`);
        this.members.options = res.data.map((item) => ({
          label: item.full_name,
          value: item.member_id,
          description: item.status,
        }));
        this.members_.options = [...this.members.options];
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    onMemberNames(member) {
      console.log("member_id:", member.value);
      console.log("full_name:", member.label);
      console.log("status:", member.description);
      this.getPlan_career(member.value);
    },
    async getPlan_career(member_id) {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers`, { params: { member_id } });
        this.plan_careers.options = res.data.map((item) => ({
          label: item.career_name,
          value: item.plan_career_id,
          description: item.start_date,
        }));
        this.plan_careers_.options = [...this.plan_careers.options];
      } catch (error) {
        console.error(error);
      }
    },
    filterPlan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.plan_careers.options = this.plan_careers_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    async onQa_plan_career(plan_career) {
      if (!plan_career?.value) return;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers`, { params: { plan_career_id: plan_career.value } });
        this.qa_plan_careers.options = res.data.map((item) => ({
          label: item.qualification_name,
          value: item.qa_plan_career_id,
          description: `- ${item.level_description}\n- ${item.target_name}`,
        }));
        this.qa_plan_careers_.options = [...this.qa_plan_careers.options];
      } catch (error) {
        console.error(error);
      }
    },
    filterQa_plan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.qa_plan_careers.options = this.qa_plan_careers_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    onMember(member) {
      if (!member)
        this.member = ref({
          label: "",
          value: "",
          description: "",
        });
    },
    onQa_plan_career_(plan_career) {
      if (!plan_career) {
        this.plan_career = ref({
          label: "",
          value: "",
          description: "",
        });
        console.log("Plan_career:", plan_career);
      } else {
        console.log("Plan_career:", plan_career);
      }
    },
    onQaualification(qa_plan_career) {
      if (qa_plan_career) {
        this.qa_plan_career_description = qa_plan_career.description;
        console.log("qa_plan_career.description", this.description);
      } else {
        this.qa_plan_career = ref({
          label: "",
          value: "",
          description: "",
        });
        this.qa_plan_career_description = "";
        console.log("qa_plan_career.description", this.description);
      }
    },
    getYears() {
      // Extract unique years from existing data or fetch from API if needed
      // Option 1: Extract from currently loaded plans (if all data is loaded)
      this.extractYearsFromPlans();
    },
    extractYearsFromPlans() {
      // Helper to extract unique years from loaded plans1
      if (!this.plans1) return;

      const years = new Set();
      this.plans1.forEach(row => {
        if (row.plan_start_date) {
          const parts = row.plan_start_date.split(/[-/]/);
          if (parts.length === 3) {
            // Assuming DD/MM/YYYY or YYYY-MM-DD
            const y = parts[0].length === 4 ? parts[0] : parts[2];
            years.add(y);
          }
        }
      });
      const sortedYears = Array.from(years).sort().reverse();
      this.yearOptions = sortedYears;
      this.originalYearOptions = sortedYears;
    },
    filterYears(val, update) {
      if (val === '') {
        update(() => {
          this.yearOptions = this.originalYearOptions;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.yearOptions = this.originalYearOptions.filter(v => v.toLowerCase().indexOf(needle) > -1);
      });
    },
  },
  watch: {
    plans1(newVal) {
      // Update years whenever data changes
      this.extractYearsFromPlans();
    }
  },
  mounted() {
    this.getMember();
    this.getUpdate();
    this.getDevelopment();
    this.getImportance();
    this.getYears();
  },
  computed: {
    buddhistDate: {
      get() {
        if (this.date) {
          const date = new Date(this.date);
          date.setFullYear(date.getFullYear() + 543);
          return date;
        }
        return null;
      },
      set(value) {
        if (value) {
          const date = new Date(value);
          date.setFullYear(date.getFullYear() - 543);
          this.date = date;
        }
        this.date = null;
      },
    },
  },
};
</script>

<style lang="sass">
.my-sticky-header-table
  height: 310px
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    background-color: $primary
    color: white
  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0
  &.q-table--loading thead tr:last-child th
    top: 48px
</style>
