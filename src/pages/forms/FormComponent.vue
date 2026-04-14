<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page padding class="flex flex-center" style="background: linear-gradient(135deg, #74c588 0%, #0ad13c 100%); min-height: 100vh;">
          <div class="full-width row justify-center">
            <div class="col-12 col-md-11 col-lg-10 q-pa-md">

              <q-card flat bordered class="shadow-10 border-radius-8 bg-white">
                <q-card-section class="bg-blue-14 text-white text-center q-py-lg">
                  <div class="text-h4 text-weight-bold">{{ title }}</div>
                </q-card-section>

                <q-card-section class="q-pa-lg">
                  <q-form @submit.prevent="submitForm" @reset.prevent="resetForm" class="q-gutter-y-lg">

                    <q-expansion-item expand-separator icon="person" label="ส่วนข้อมูลส่วนตัว"
                      header-class="bg-blue-1 text-primary text-h6 text-weight-bold" default-opened
                      class="shadow-1 overflow-hidden border-radius-8">
                      <q-card>
                        <q-card-section class="q-pa-md q-gutter-y-sm">
                          <div class="row q-col-gutter-sm">
                            <div class="col-md-6 col-xs-12">
                              <q-input filled v-model="individual.birthday" label="ปีเกิด ค.ศ.*" mask="####"
                                hint="ค.ศ.: ####">
                                <template #prepend><q-icon name="calendar_today" /></template>
                              </q-input>
                            </div>
                            <div class="col-md-6 col-xs-12">
                              <q-input filled v-model="individual.telephone" label="หมายเลขโทรศัพท์ *"
                                mask="##-####-####" hint="##-####-####">
                                <template #prepend><q-icon name="phone" /></template>
                              </q-input>
                            </div>
                            <div class="col-md-6 col-xs-12">
                              <q-select filled use-input @filter="filterInstitute" v-model="institute"
                                :options="institutes.options" label="สถาบันการศึกษา *"
                                @update:model-value="onInstituteValueChange">
                                <template #prepend><q-icon name="school" /></template>
                              </q-select>
                            </div>
                            <div class="col-md-6 col-xs-12">
                              <q-select filled use-input @filter="filterFaculty" v-model="faculty"
                                :options="facultys.options" label="คณะ *" :disable="!institute"
                                @update:model-value="onFacultyValueChange">
                                <template #prepend><q-icon name="domain" /></template>
                              </q-select>
                            </div>
                            <div class="col-md-6 col-xs-12">
                              <q-select filled v-model="degree" :options="degrees.options" label="ระดับการศึกษา *"
                                :disable="!faculty">
                                <template #prepend><q-icon name="history_edu" /></template>
                              </q-select>
                            </div>
                            <div class="col-md-6 col-xs-12">
                              <q-select filled v-model="department" :options="departments.options" label="สาขาวิชา *"
                                :disable="!degree">
                                <template #prepend><q-icon name="menu_book" /></template>
                              </q-select>
                            </div>
                          </div>

                          <div class="row q-col-gutter-sm items-center q-mt-xs">
                            <div class="col-md-4 col-xs-4">
                              <q-checkbox v-model="individual.is_graduate" label="จบการศึกษา" color="teal"
                                true-value="1" false-value="0" />
                            </div>
                            <div class="col-md-4 col-xs-8">
                              <q-input filled v-model="individual.date" label="ปีที่จบ ค.ศ." mask="####"
                                :disable="individual.is_graduate === '0'">
                                <template #prepend><q-icon name="event_available" /></template>
                              </q-input>
                            </div>
                            <div class="col-md-4 col-xs-12">
                              <q-input filled v-model="individual.year" label="ชั้นปี" mask="#"
                                :disable="individual.is_graduate === '1'">
                                <template #prepend><q-icon name="looks_one" /></template>
                              </q-input>
                            </div>
                          </div>

                          <div class="row q-col-gutter-sm items-center">
                            <div class="col-md-4 col-xs-12">
                              <q-checkbox v-model="individual.is_disability" label="มีภาวะความพิการ" color="teal"
                                true-value="1" false-value="0" />
                            </div>
                            <div class="col-md-8 col-xs-12">
                              <q-select filled v-model="disability" :options="disabilitys.options"
                                label="ประเภทความพิการ" :disable="individual.is_disability === '0'">
                                <template #prepend><q-icon name="assist_walker" /></template>
                              </q-select>
                            </div>
                            <div class="col-12">
                              <q-input filled v-model="individual.dis_description" label="รายละเอียดความพิการ"
                                :disable="individual.is_disability === '0'">
                                <template #prepend><q-icon name="description" /></template>
                              </q-input>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>

                    <q-expansion-item expand-separator icon="library_add" label="ส่วนข้อมูลพื้นฐานเพิ่มเติม"
                      header-class="bg-blue-1 text-primary text-h6 text-weight-bold"
                      class="shadow-1 overflow-hidden border-radius-8">
                      <q-card>
                        <q-card-section class="q-pa-md q-gutter-y-sm">
                          <div class="row q-col-gutter-sm">
                            <div class="col-md-6 col-xs-12"><q-input filled v-model="individual.province"
                                label="มาจากจังหวัด"><template #prepend><q-icon name="place" /></template></q-input>
                            </div>
                            <div class="col-md-6 col-xs-12"><q-input filled v-model="individual.preferred_region"
                                label="อยากอยู่ในจังหวัด"><template #prepend><q-icon
                                    name="near_me" /></template></q-input></div>
                            <div class="col-md-6 col-xs-12"><q-input filled v-model="individual.favorite_subject"
                                label="วิชาที่ชอบ"><template #prepend><q-icon name="bookmark" /></template></q-input>
                            </div>
                            <div class="col-md-6 col-xs-12"><q-input filled v-model="individual.unfavorite_subject"
                                label="อุปกรณ์ที่จำเป็น"><template #prepend><q-icon
                                    name="handyman" /></template></q-input></div>
                            <div class="col-md-6 col-xs-12"><q-input filled v-model="individual.favorite_activity"
                                label="กิจกรรมที่ชอบทำ"><template #prepend><q-icon
                                    name="sports_esports" /></template></q-input></div>
                            <div class="col-md-6 col-xs-12"><q-input filled v-model="individual.dream_career"
                                label="อาชีพในฝัน"><template #prepend><q-icon name="stars" /></template></q-input></div>
                            <div class="col-12"><q-input filled v-model="individual.skill" label="ความถนัด / ทักษะเด่น"
                                type="textarea" rows="3"><template #prepend><q-icon
                                    name="psychology" /></template></q-input></div>
                            <div class="col-12"><q-input filled v-model="individual.additional_info"
                                label="ข้อมูลเพิ่มเติม" type="textarea" rows="3"><template #prepend><q-icon
                                    name="info" /></template></q-input></div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>

                    <div class="q-pa-md bg-blue-grey-1 border-radius-8 shadow-1 text-center">
                      <div class="text-subtitle1 text-weight-bold q-mb-sm">การคุ้มครองข้อมูลส่วนบุคคล (PDPA)</div>
                      <div class="text-caption q-mb-md text-grey-8">
                        ข้าพเจ้ายินยอมให้ใช้ข้อมูลส่วนบุคคลตามวัตถุประสงค์ของโครงการ</div>
                      <q-checkbox v-model="pdpa" color="primary" label="ยอมรับเงื่อนไข" class="text-weight-bold" />
                    </div>

                    <div class="row justify-center q-gutter-sm">
                      <q-btn :label="btnLabel" type="submit" color="primary" icon="save" :disable="!pdpa" />
                      <q-btn label="ยกเลิก" type="reset" color="primary" flat icon="clear" />
                      <q-btn label="ออก" color="primary" flat icon="logout" to="/" />
                    </div>

                    <q-table title="ข้อมูลส่วนตัว" :rows="safeIndividuals" :columns="columns" row-key="individual_id"
                      :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                      selection="multiple" v-model:selected="selected" class="my-custom-table shadow-1 border-radius-8"
                      table-header-class="bg-blue-3 text-black">
                      <template #top-right="props">
                        <div class="row q-col-gutter-xs items-center">
                          <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหา..."><template
                              #append><q-icon name="search" /></template></q-input>
                          <q-btn v-if="selected.length > 0" color="negative" icon="delete" label="ลบที่เลือก"
                            @click="deleteSelected" dense class="q-px-sm q-ml-sm" />
                          <q-btn flat color="black" icon="download" label="ส่งออก excel" @click="exportTable" />
                          <q-select v-model="visibleColumns" multiple outlined dense options-dense
                            :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                            option-value="name" style="min-width: 150px" />
                          <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                            @click="props.toggleFullscreen" />
                        </div>
                      </template>

                      <template #body-cell-actions="props">
                        <q-td :props="props" class="text-center">
                          <q-btn size="sm" color="blue" label="แก้ไข" icon="edit" class="q-mr-xs"
                            @click="editUser(props.row.individual_id)" />
                          <q-btn size="sm" color="red" label="ลบ" icon="delete"
                            @click="deleteUser(props.row.individual_id, props.row.full_name)" />
                        </q-td>
                      </template>
                    </q-table>

                    <div class="row justify-between q-mt-md">
                      <q-btn color="primary" flat icon="skip_previous" label="กลับหน้าลงทะเบียน"
                        to="/FormRegistration" />
                      <q-btn color="primary" flat icon-right="skip_next" label="ไปหน้าอาชีพเป้าหมาย"
                        to="/FormPlanCareer" />
                    </div>

                  </q-form>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-page>
      </div>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.border-radius-8 {
  border-radius: 8px;
}

/* Table Identity Style */
.my-custom-table :deep(thead tr th) {
  font-weight: bold;
}

.my-custom-table :deep(tbody tr) {
  background-color: #1b5e20;
  /* เขียวเข้ม */
  color: white;
}

.my-custom-table :deep(tbody td) {
  color: white;
}

.my-custom-table :deep(tbody tr:nth-child(even)) {
  background-color: #2e7d32;
  /* เขียวสลับ (Zebra) */
}

.my-custom-table :deep(tbody tr:hover) {
  background-color: #388e3c !important;
  /* Hover เขียวสว่าง */
}
</style>

<script>
import axios from "axios";
import { getRestApiUrl } from "../../utils/apiConfig.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function todayDMY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

const emptyIndividual = () => ({
  individual_id: "",
  member_id: "",
  name: "",
  birthday: "",
  telephone: "",
  institute_id: "",
  faculty_id: "",
  degree_id: "",
  department_id: "",
  is_graduate: "0",
  year: "",
  date: "",
  is_disability: "0",
  disability_id: "",
  dis_description: "",
  project_id: "",
  advisor_id: "",
  province: "",
  favorite_subject: "",
  unfavorite_subject: "",
  favorite_activity: "",
  skill: "",
  dream_career: "",
  preferred_region: "",
  additional_info: "",
});

export default {
  name: "FormComponent",

  data() {
    return {
      title: "ข้อมูลส่วนตัว",

      pdpa: false,
      file_export: "Personal_Information_Report.xlsx",

      // URLs
      // url_api_individual: "", // Removed legacy
      // url_api_institute: "",
      // url_api_disability: "",
      // url_api_project: "",
      // url_api_advisor: "",
      // url_api_member: "",


      btnLabel: "เพิ่มข้อมูล",
      isEdit: false,

      // Table state (สำคัญ: ต้องเป็น array/primitive ไม่ใช้ ref ใน Options API)
      filter: "",
      loading: false,
      individuals1: [],
      selected: [],

      visibleColumns: [
        "actions",
        "full_name",
        "birthday",
        "telephone",
        "institute_name",
        "faculty_name",
        "degree_name",
        "department_name",
        "is_graduate",
        "date",
        "year",
        "is_disability",
        "disability_name",
        "dis_describtion",
        "project_name",
        "advisor_name",
        "province",
        "favorite_subject",
        "unfavorite_subject",
        "favorite_activity",
        "skill",
        "dream_career",
        "preferred_region",
        "additional_info",
      ],

      // Form
      individual: emptyIndividual(),

      // Select options (แยก options กับ allOptions เพื่อ filter)
      institutes: { options: [] },
      institutes_: { options: [] },
      institute: null,

      facultys: { options: [] },
      facultys_: { options: [] },
      faculty: null,

      degrees: { options: [] },
      degrees_: { options: [] },
      degree: null,

      departments: { options: [] },
      departments_: { options: [] },
      department: null,

      disabilitys: { options: [] },
      disabilitys_: { options: [] },
      disability: null,

      projects: { options: [] },
      projects_: { options: [] },
      project: null,

      advisors: { options: [] },
      advisors_: { options: [] },
      advisor: null,

      // REST API
      apiUrl: "",
    };
  },

  computed: {
    /** กัน QTable แตก: rows ต้องเป็น array เสมอ */
    safeIndividuals() {
      return Array.isArray(this.individuals1) ? this.individuals1 : [];
    },

    isGraduatedDateDisabled() {
      return this.individual.is_graduate !== "1";
    },
    isStudyYearDisabled() {
      return this.individual.is_graduate !== "0";
    },
    isDisabilityInfoDisabled() {
      return this.individual.is_disability !== "1";
    },

    columns() {
      return [
        { name: "actions", align: "center", label: "แก้ไข/ลบ", style: "width: 170px;", headerStyle: "width: 170px;" },
        { name: "full_name", align: "left", label: "ชื่อ-สกุล", field: "full_name", sortable: true },
        { name: "birthday", align: "center", label: "วันเกิด", field: "birthday", sortable: true },
        { name: "telephone", align: "center", label: "โทรศัพท์", field: "telephone", sortable: true },
        { name: "institute_name", align: "left", label: "สถาบัน", field: "institute_name", sortable: true },
        { name: "faculty_name", align: "center", label: "คณะ", field: "faculty_name", sortable: true },
        { name: "degree_name", align: "center", label: "ระดับ", field: "degree_name", sortable: true },
        { name: "department_name", align: "center", label: "สาขา", field: "department_name", sortable: true },
        {
          name: "is_graduate", align: "center", label: "จบการศึกษา", sortable: true,
          field: r => String(r.is_graduate) === "1" ? "จบแล้ว" : "กำลังศึกษา"
        },
        { name: "date", align: "center", label: "ปีที่สำเร็จการศึกษา", field: "date", sortable: true },
        { name: "year", align: "center", label: "ปีที่กำลังศึกษา", field: "year", sortable: true },
        {
          name: "is_disability", align: "center", label: "ภาวะความพิการ", sortable: true,
          field: r => String(r.is_disability) === "1" ? "มี" : "ไม่มี"
        },
        {
          name: "disability_name", align: "left", label: "ความพิการ", sortable: true,
          field: r => this.disabilitys.options.find(o => String(o.value) === String(r.disability_id))?.label || r.disability_name || "-"
        },
        { name: "dis_describtion", align: "left", label: "รายละเอียดความพิการ", field: "dis_description", sortable: true },
        {
          name: "project_name", align: "left", label: "โครงการ", sortable: true,
          field: r => this.projects.options.find(o => String(o.value) === String(r.project_id))?.label || r.project_name || "-"
        },
        {
          name: "advisor_name", align: "left", label: "ผู้ดูแลกลุ่ม", sortable: true,
          field: r => this.advisors.options.find(o => String(o.value) === String(r.advisor_id))?.label || r.advisor_name || "-"
        },
        { name: "province", label: "จังหวัด", field: "province", sortable: true },
        { name: "favorite_subject", label: "วิชาที่ชอบ", field: "favorite_subject", sortable: true },
        { name: "unfavorite_subject", label: "อุปกรณ์ที่จำเป็น", field: "unfavorite_subject", sortable: true },
        { name: "favorite_activity", label: "กิจกรรมที่ชอบทำ", field: "favorite_activity", sortable: true },
        { name: "skill", label: "ความถนัด", field: "skill", sortable: true },
        { name: "dream_career", label: "อาชีพในฝัน", field: "dream_career", sortable: true },
        { name: "preferred_region", label: "ภาค/จังหวัดที่อยากอยู่", field: "preferred_region", sortable: true },
        { name: "additional_info", label: "ข้อมูลเพิ่มเติม", field: "additional_info", sortable: true },
      ];
    },
  },

  methods: {
    notifyError(message) {
      this.$q.notify({ message, color: "negative", icon: "warning" });
    },

    notifySuccess(message) {
      this.$q.notify({ message, color: "positive", icon: "check" });
    },

    confirmDialogAsync(message) {
      return new Promise((resolve) => {
        this.$q
          .dialog({ title: "ยืนยัน", message, cancel: true, persistent: true })
          .onOk(() => resolve(true))
          .onCancel(() => resolve(false))
          .onDismiss(() => resolve(false));
      });
    },

    nextItem() {
      // กัน error จาก @keyup เดิม
    },

    onTelephone() {
      // placeholder
    },



    /** helper: map options */
    toOptions(rows, valueKey, labelKey) {
      const arr = Array.isArray(rows) ? rows : [];
      if (arr.length === 0) {
        console.warn(`toOptions: No data provided for ${valueKey}/${labelKey}`);
      }
      return arr.map((x) => ({
        value: String(x?.[valueKey] ?? ""),
        label: x?.[labelKey] ?? "(ไม่ระบุ)"
      }));
    },

    /** helper: filter generic */
    doFilter(val, update, allOptions, targetObj) {
      const all = Array.isArray(allOptions) ? allOptions : [];
      update(() => {
        if (!val) {
          targetObj.options = all;
          return;
        }
        const needle = String(val).toLowerCase();
        targetObj.options = all.filter((v) => String(v.label).toLowerCase().includes(needle));
      });
    },

    // ===================== Excel export =====================
    // ===================== Excel export =====================
    async exportTable() {
      const rows = this.safeIndividuals;
      if (rows.length === 0) {
        this.notifyError("ไม่พบข้อมูลสำหรับส่งออก");
        return;
      }

      this.loading = true;

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Individuals');

        // Filter out 'actions' column
        const exportCols = this.columns.filter(c => c.name !== 'actions');

        // 4. Widths - Balanced based on content
        worksheet.columns = exportCols.map(col => {
          const name = col.name;
          if (['full_name', 'institute_name', 'faculty_name', 'department_name', 'project_name', 'advisor_name'].includes(name)) return { width: 35 };
          if (['additional_info', 'dis_description', 'skill'].includes(name)) return { width: 45 };
          if (['birthday', 'telephone', 'date', 'year', 'is_graduate', 'is_disability'].includes(name)) return { width: 15 };
          return { width: 25 };
        });

        // 1. Main Title (Row 1) - Merge across all columns
        worksheet.mergeCells(1, 1, 1, exportCols.length);
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = "รายงานข้อมูลส่วนตัว (Personal Information Report)";
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        // 2. Header Row (Row 3)
        const headerRow = worksheet.getRow(3);
        headerRow.values = exportCols.map(c => c.label);
        headerRow.height = 30;

        headerRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }; // Blue
          cell.font = { name: 'Sarabun', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }; // White
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
        });

        // 3. Data Rows
        rows.forEach((row, index) => {
          // Prepare row data
          const rowValues = exportCols.map(col => {
            if (typeof col.field === 'function') {
              return col.field(row);
            }
            return row[col.field] || '-';
          });

          const r = worksheet.addRow(rowValues);
          r.height = 25;

          r.eachCell((cell) => {
            cell.font = { name: 'Sarabun', size: 11 };
            cell.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' }
            };
            // Alignments - Match FormPlanCareer
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };

            // Zebra Striping (Light Grey for odd indices if 0-based, or even rows physically)
            // index 0 -> row 4. index 1 -> row 5.
            // FormPlanCareer uses index % 2 !== 0 for grey.
            if (index % 2 !== 0) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
            }
          });
        });

        // 4. Save
        const buffer = await workbook.xlsx.writeBuffer();
        const filenameRaw = (this.file_export || "Personal_Information_Report").trim();
        const filename = filenameRaw.toLowerCase().endsWith(".xlsx") ? filenameRaw : `${filenameRaw}.xlsx`;

        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
        this.notifySuccess("ส่งออกไฟล์ Excel สำเร็จ");

      } catch (error) {
        console.error("Export Error:", error);
        this.notifyError(`ส่งออกไม่สำเร็จ: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },

    // ===================== reset / payload =====================
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";

      this.individual = {
        ...emptyIndividual(),
        member_id: this.individual.member_id,
        name: this.individual.name,
      };

      this.institute = null;
      this.faculty = null;
      this.degree = null;
      this.department = null;
      this.disability = null;
      this.project = null;
      this.advisor = null;
    },

    buildPayload() {
      return {
        individual_id: this.individual.individual_id,
        member_id: this.individual.member_id,
        birthday: this.individual.birthday,
        telephone: this.individual.telephone,

        department_id: this.department?.value || "",
        is_graduate: this.individual.is_graduate,
        year: this.individual.year,
        date: this.individual.date,

        is_disability: this.individual.is_disability,
        disability_id: this.disability?.value || "",
        dis_description: this.individual.dis_description,

        project_id: this.project?.value || "",
        advisor_id: this.advisor?.value || "",

        province: this.individual.province,
        favorite_subject: this.individual.favorite_subject,
        unfavorite_subject: this.individual.unfavorite_subject,
        favorite_activity: this.individual.favorite_activity,
        skill: this.individual.skill,
        dream_career: this.individual.dream_career,
        preferred_region: this.individual.preferred_region,
        additional_info: this.individual.additional_info,
      };
    },

    // ===================== submit / edit / delete =====================
    async submitForm() {
      const isEdit = !!this.individual.individual_id;
      const msg = isEdit
        ? "คุณต้องการบันทึกการเแก้ไขข้อมูลหรือไม่?"
        : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";

      const ok = await this.confirmDialogAsync(msg);
      if (!ok) return;

      try {
        const payload = this.buildPayload();
        if (isEdit) {
          await axios.put(`${this.apiUrl}/individuals/${this.individual.individual_id}`, payload);
        } else {
          await axios.post(`${this.apiUrl}/individuals`, payload);
        }

        this.notifySuccess("บันทึกข้อมูลสำเร็จ");
        this.resetForm();
        await this.getUpdate(this.individual.member_id);
      } catch (e) {
        console.error(e);
        this.notifyError("บันทึกข้อมูลไม่สำเร็จ: " + (e.response?.data?.error || e.message));
      }
    },


    async editUser(individual_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;

      try {
        const { data } = await axios.get(`${this.apiUrl}/individuals/${individual_id}`);

        // set form
        this.individual.individual_id = data.individual_id;
        this.individual.member_id = data.member_id;
        this.individual.birthday = data.birthday;
        this.individual.telephone = data.telephone;

        this.institute = data.institute_id ? { value: String(data.institute_id), label: data.institute_name } : null;
        this.faculty = data.faculty_id ? { value: String(data.faculty_id), label: data.faculty_name } : null;
        this.degree = data.degree_id ? { value: String(data.degree_id), label: data.degree_name } : null;
        this.department = data.department_id ? { value: String(data.department_id), label: data.department_name } : null;

        this.individual.is_graduate = String(data.is_graduate ?? "0");
        this.individual.date = data.date ?? "";
        this.individual.year = data.year ?? "";

        this.individual.is_disability = String(data.is_disability ?? "0");
        this.disability = data.disability_id ? { value: String(data.disability_id), label: data.disability_name } : null;
        this.individual.dis_description = data.dis_description ?? "";

        this.project = data.project_id ? { value: String(data.project_id), label: data.project_name } : null;
        this.advisor = data.advisor_id ? { value: String(data.advisor_id), label: data.advisor_name } : null;

        this.individual.province = data.province ?? "";
        this.individual.favorite_subject = data.favorite_subject ?? "";
        this.individual.unfavorite_subject = data.unfavorite_subject ?? "";
        this.individual.favorite_activity = data.favorite_activity ?? "";
        this.individual.skill = data.skill ?? "";
        this.individual.dream_career = data.dream_career ?? "";
        this.individual.preferred_region = data.preferred_region ?? "";
        this.individual.additional_info = data.additional_info ?? "";

        // โหลด options ต่อเนื่องให้สัมพันธ์กับค่าที่เลือก
        if (this.institute?.value) await this.getFacultys();
        if (this.faculty?.value) await this.getDegrees();
        if (this.degree?.value) await this.getDepartments();
      } catch (e) {
        console.error(e);
        this.notifyError("โหลดข้อมูลแก้ไขไม่สำเร็จ");
      }
    },


    // deleteUser(individual_id, full_name) {
    //   this.$q
    //     .dialog({
    //       title: "ยืนยัน",
    //       message: `คุณต้องการลบ [ ${individual_id}-${full_name} ] หรือไม่ ?`,
    //       cancel: true,
    //       persistent: true,
    //     })
    //     .onOk(async () => {
    //       try {
    //         await axios.post(this.url_api_individual, { action: "delete", individual_id });
    //         await this.getUpdate(this.individual.member_id);
    //       } catch (e) {
    //         console.error(e);
    //         this.notifyError("ลบข้อมูลไม่สำเร็จ");
    //       }
    //     });
    // },
    async deleteSelected() {
      if (this.selected.length === 0) return;

      const ok = await this.confirmDialogAsync(
        `คุณต้องการลบข้อมูลที่เลือกทั้งหมด ${this.selected.length} รายการหรือไม่?`
      );

      if (!ok) return;

      this.$q.loading.show({ message: "กำลังลบข้อมูลที่เลือก...", spinnerColor: "red" });
      let successCount = 0;
      let failCount = 0;
      try {
        for (const item of this.selected) {
          try {
            await axios.delete(`${this.apiUrl}/individuals/${item.individual_id}`);
            successCount++;
          } catch (err) {
            console.error(`Failed to delete ID ${item.individual_id}:`, err);
            failCount++;
          }
        }
        this.$q.notify({
          color: successCount > 0 ? "positive" : "negative",
          message: `ลบสำเร็จ ${successCount} รายการ${failCount > 0 ? `, ล้มเหลว ${failCount} รายการ` : ""}`,
          icon: successCount > 0 ? "check" : "error",
        });
        this.selected = [];
        await this.getUpdate(this.individual.member_id);
      } finally {
        this.$q.loading.hide();
      }
    },


    deleteUser(individual_id, full_name) {
      this.$q
        .dialog({
          title: "ยืนยัน",
          message: `คุณต้องการลบ [ ${individual_id}-${full_name} ] หรือไม่ ?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await axios.delete(`${this.apiUrl}/individuals/${individual_id}`);
            this.notifySuccess("ลบข้อมูลสำเร็จ");
            await this.getUpdate(this.individual.member_id);
          } catch (e) {
            console.error(e);
            this.notifyError("ลบข้อมูลไม่สำเร็จ");
          }
        });
    },

    async getUpdate(member_id) {
      this.loading = true;
      try {
        const { data } = await axios.get(`${this.apiUrl}/individuals`);
        const rawRows = Array.isArray(data) ? data : [];
        this.individuals1 = rawRows;
        console.log("Personal data loaded:", rawRows.length, "records");
      } catch (e) {
        console.error("Error loading personal data:", e);
        this.individuals1 = [];
        this.notifyError("ดึงข้อมูลตารางไม่สำเร็จ");
      } finally {
        this.loading = false;
      }
    },

    // ===================== load master data =====================
    async getInstitutes() {
      try {
        const { data } = await axios.get(`${this.apiUrl}/institutes`);
        const opts = this.toOptions(data, "institute_id", "institute_name");
        this.institutes.options = opts;
        this.institutes_.options = opts;
      } catch (e) {
        console.error(e);
        this.notifyError("โหลดสถาบันไม่สำเร็จ");
      }
    },

    async getFacultys() {
      if (!this.institute?.value) return;
      try {
        const { data } = await axios.get(`${this.apiUrl}/faculties?institute_id=${this.institute.value}`);
        const opts = this.toOptions(data, "faculty_id", "faculty_name");
        this.facultys.options = opts;
        this.facultys_.options = opts;
      } catch (e) {
        console.error(e);
        this.notifyError("โหลดคณะไม่สำเร็จ");
      }
    },

    async getDegrees() {
      if (!this.faculty?.value) return;
      try {
        const { data } = await axios.get(`${this.apiUrl}/degrees?faculty_id=${this.faculty.value}`);
        const opts = this.toOptions(data, "degree_id", "degree_name");
        this.degrees.options = opts;
        this.degrees_.options = opts;
      } catch (e) {
        console.error(e);
        this.notifyError("โหลดระดับการศึกษาไม่สำเร็จ");
      }
    },

    async getDepartments() {
      if (!this.degree?.value) return;
      try {
        const { data } = await axios.get(`${this.apiUrl}/departments?degree_id=${this.degree.value}`);
        const opts = this.toOptions(data, "department_id", "department_name");
        this.departments.options = opts;
        this.departments_.options = opts;
      } catch (e) {
        console.error(e);
        this.notifyError("โหลดสาขาวิชาไม่สำเร็จ");
      }
    },

    async getDisabilitys() {
      try {
        const { data } = await axios.get(`${this.apiUrl}/references/disabilities`);
        const opts = this.toOptions(data, "disability_id", "disability_name");
        this.disabilitys.options = opts;
        this.disabilitys_.options = opts;
      } catch (e) {
        console.error(e);
        this.notifyError("โหลดชนิดความพิการไม่สำเร็จ");
      }
    },

    async getProjects() {
      try {
        const { data } = await axios.get(`${this.apiUrl}/references/projects`);
        const opts = this.toOptions(data, "project_id", "project_name");
        this.projects.options = opts;
        this.projects_.options = opts;
      } catch (e) {
        console.error(e);
        this.notifyError("โหลดโครงการไม่สำเร็จ");
      }
    },

    async getAdvisors() {
      try {
        const { data } = await axios.get(`${this.apiUrl}/references/advisors`);
        const opts = this.toOptions(data, "advisor_id", "full_name");
        this.advisors.options = opts;
        this.advisors_.options = opts;
      } catch (e) {
        console.error(e);
        this.notifyError("โหลดผู้ดูแลกลุ่มไม่สำเร็จ");
      }
    },

    // ===================== cascading handlers =====================
    async onInstituteValueChange(val) {
      // clear downstream
      this.faculty = null;
      this.degree = null;
      this.department = null;
      this.facultys.options = [];
      this.degrees.options = [];
      this.departments.options = [];

      if (val?.value) {
        await this.getFacultys();
      }
    },

    async onFacultyValueChange(val) {
      this.degree = null;
      this.department = null;
      this.degrees.options = [];
      this.departments.options = [];

      if (val?.value) {
        await this.getDegrees();
      }
    },

    async onDegreeValueChange(val) {
      this.department = null;
      this.departments.options = [];

      if (val?.value) {
        await this.getDepartments();
      }
    },

    onDepartmentValueChange(val) {
      // ไม่มี downstream ต่อ
    },

    onProjectValueChange(val) {
      // placeholder (ถ้าต้องทำ logic เพิ่มค่อยใส่)
    },

    onAdvisorValueChange(val) {
      // placeholder
    },

    onDisabilityValueChange(val) {
      // placeholder
    },

    // ===================== filters =====================
    filterInstitute(val, update) {
      this.doFilter(val, update, this.institutes_.options, this.institutes);
    },
    filterFaculty(val, update) {
      this.doFilter(val, update, this.facultys_.options, this.facultys);
    },
    filterDegree(val, update) {
      this.doFilter(val, update, this.degrees_.options, this.degrees);
    },
    filterDepartment(val, update) {
      this.doFilter(val, update, this.departments_.options, this.departments);
    },
    filterDisability(val, update) {
      this.doFilter(val, update, this.disabilitys_.options, this.disabilitys);
    },
    filterProject(val, update) {
      this.doFilter(val, update, this.projects_.options, this.projects);
    },
    filterAdvisor(val, update) {
      this.doFilter(val, update, this.advisors_.options, this.advisors);
    },
  },

  created() {
    this.apiUrl = getRestApiUrl(this.$store);
  },


  async mounted() {
    this.individual.member_id = this.$store.getters.myMember_id;
    this.individual.name = this.$store.getters.myName;
    console.log("Initializing FormComponent with member_id:", this.individual.member_id);

    try {
      await Promise.all([
        this.getInstitutes(),
        this.getDisabilitys(),
        this.getProjects(),
        this.getAdvisors()
      ]);
      console.log("Master data loaded successfully");
    } catch (e) {
      console.error("Error loading master data:", e);
      this.notifyError("โหลดข้อมูลพื้นฐานไม่สำเร็จ");
    }

    // Load initial data for form if exists
    try {
      const { data } = await axios.get(`${this.apiUrl}/individuals`);
      if (data && data.length > 0) {
        const existing = data[0]; // Take first one if user
        console.log("Found existing profile for auto-fill:", existing.individual_id);
      }
    } catch (e) {
      console.warn("Could not fetch existing profile for auto-fill", e);
    }


    await this.getUpdate(this.individual.member_id);
  },
};
</script>
