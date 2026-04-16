<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page padding class="items-center justify-center" style="background: linear-gradient(#74c588, #0ad13c)">
          <div class="full-width">
            <div class="col-md-10 offset-md-1 col-xs-12 q-pa-xs">
              <q-card flat class="bg-white text-black">
                <q-card-section class="bg-blue-14">
                  <h4 class="text-h5 text-white q-my-xs text-center">
                    {{ title }}
                  </h4>
                </q-card-section>

                <!-- Navigation Menu Buttons -->
                <q-card-section class="bg-blue-1 text-center q-pa-md border-radius-inherit">
                  <div class="text-subtitle2 text-blue-9 q-mb-sm text-weight-bold">
                    <q-icon name="settings" class="q-mr-xs" /> การจัดการข้อมูลพื้นฐาน (ค่าคงที่)
                  </div>
                  <div class="row justify-center q-gutter-sm">
                    <q-btn unelevated rounded color="blue-7" label="สถาบัน"
                      @click="showInstituteDialog = true" class="q-px-lg menu-btn" />
                    <q-btn unelevated rounded color="blue-8" label="คณะ"
                      @click="showFacultyDialog = true" class="q-px-lg menu-btn" />
                    <q-btn unelevated rounded color="blue-9" label="ระดับการศึกษา"
                      @click="showDegreeDialog = true" class="q-px-lg menu-btn" />
                  </div>
                </q-card-section>

                <div class="q-pa-md">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <q-form @submit.prevent="submitForm()" @reset="resetForm()" method="post" class="q-gutter-md">
                      <!-- สถาบันการศึกษา + ระดับการศึกษา -->
                      <div class="row">
                        <!-- สถาบันการศึกษา -->
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-select use-input @filter="filterInstitute" color="blue-3" v-model="institute"
                            :options="institutes.options" label="สถาบันการศึกษา *" stack-label @update:model-value="(val) => onInstituteValueChange(val)
                            ">
                            <template v-slot:prepend>
                              <q-icon name="school" />
                            </template>
                            <template v-slot:selected>
                              สถาบัน:
                              <q-chip v-if="institute" dense square color="white" text-color="primary" class="q-pa-xs">
                                {{ institute.label }}
                              </q-chip>
                              <q-badge v-else>*none*</q-badge>
                            </template>
                            <template v-if="institute" v-slot:append>
                              <q-icon name="cancel" @click.stop.prevent="
                                OnInstitute((institute = null))
                                " class="cursor-pointer" />
                            </template>
                          </q-select>
                        </div>
                        <!-- คณะ -->
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-select use-input @filter="filterFaculty" color="blue-3" v-model="faculty"
                            :options="facultys.options" label="คณะ *" stack-label @update:model-value="(val) => onFacultyValueChange(val)
                            ">
                            <template v-slot:prepend>
                              <q-icon name="school" />
                            </template>
                            <template v-slot:selected>
                              คณะ:
                              <q-chip v-if="faculty" dense square color="white" text-color="primary" class="q-pa-xs">
                                {{ faculty.label }}
                              </q-chip>
                              <q-badge v-else>*none*</q-badge>
                            </template>
                            <template v-if="faculty" v-slot:append>
                              <q-icon name="cancel" @click.stop.prevent="
                                OnFaculty((faculty = null))
                                " class="cursor-pointer" />
                            </template>
                          </q-select>
                        </div>
                      </div>
                      <!-- สาขาวิชา -->
                      <div class="row">
                        <!-- ระดับการศึกษา -->
                        <div class="col-md-12 col-xs-12 q-pa-xs">
                          <q-select use-input @filter="filterDegree" color="blue-3" v-model="degree"
                            :options="degrees.options" label="ระดับการศึกษา *" stack-label @update:model-value="(val) => onDegreeValueChange(val)
                            ">
                            <template v-slot:prepend>
                              <q-icon name="school" />
                            </template>
                            <template v-slot:selected>
                              ระดับการศึกษา:
                              <q-chip v-if="degree" dense square color="white" text-color="primary" class="q-pa-xs">
                                {{ degree.label }}
                              </q-chip>
                              <q-badge v-else>*none*</q-badge>
                            </template>
                            <template v-if="degree" v-slot:append>
                              <q-icon name="cancel" @click.stop.prevent="OnDegree((degree = null))"
                                class="cursor-pointer" />
                            </template>
                          </q-select>
                        </div>
                        <!-- สาขาวิชา -->
                        <div class="col-md-12 col-xs-12 q-pa-xs">
                          <q-input color="white" bg-color="blue-5" standout bottom-slots
                            v-model="individual.department_name" label="สาขาวิชา *" clearable :rules="[
                              (val) =>
                                (val && val.length > 0) || 'ต้องใส่สาขาวิชา',
                            ]">
                            <template v-slot:prepend>
                              <q-icon name="work_history" />
                            </template>
                            <template v-slot:append>
                              <q-icon name="favorite" />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <!-- ปุ่มตวบคุม -->
                      <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                          <!-- บันทึก/แก้ไข -->
                          <q-btn :label="btnLabel" type="submit" color="primary" />
                          <!-- ยกเลิก -->
                          <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" />
                          <!-- ออก -->
                          <q-btn label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                          <!-- กลับฟอร์มการลงทะเบียน -->
                          <q-btn color="primary" label="กลับฟอร์มการลงทะเบียน" no-caps flat to="/AdminFormRegistration">
                            <q-tooltip class="bg-accent">กลับฟอร์มการลงทะเบียน</q-tooltip>
                          </q-btn>
                          <!-- ไปฟอร์มกำหนดอาชีพเป้าหมาย -->
                          <q-btn color="primary" label="ไปฟอร์มกำหนดอาชีพเป้าหมาย" no-caps flat to="/AdminFormPlanCareer">
                            <q-tooltip class="bg-accent">ไปฟอร์มกำหนดอาชีพเป้าหมาย</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-form>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <div class="q-pa-xs">
                      <q-table title="ข้อมูลสาขาวิชา" :rows="individuals1" :columns="columns" row-key="name"
                        :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        table-header-style="height: 65px; " table-header-class="bg-blue-5"
                        :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home" icon-last-page="all_inclusive"
                        icon-next-page="arrow_right" icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                          return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                        }" selection="multiple" v-model:selected="selected">
                        <template v-slot:top-right="props">
                          <div class="row q-gutter-sm items-center">
                            <q-btn v-if="selected.length > 0" flat color="red" :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />
                            <q-input dense debounce="300" v-model="filter" placeholder="ค้นหาข้อมูลสาขาวิชา..." outlined
                              bg-color="white">
                              <template v-slot:append>
                                <q-icon name="search" />
                              </template>
                            </q-input>
                          <!-- ส่งออกไฟล์ -->
                          <q-input borderless dense debounce="300" v-model="file_export" placeholder="ชื่อไฟล์นำออก"
                            outlined>
                            <template v-slot:append>
                              <q-icon name="save" />
                            </template>
                          </q-input>
                          <q-btn flat color="black" label="ส่งออก excel" @click="exportTable()" />
                          <q-select v-model="visibleColumns" multiple outlined dense options-dense
                            :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                            option-value="name" options-cover style="min-width: 150px" />
                          <q-btn flat round dense :@click="props.toggleFullscreen" class="q-ml-md" />
                          </div>
                        </template>
                        <template v-slot:body-cell-actions="props">
                          <q-td :props="props" class="text-center">
                            <q-btn size="sm" color="blue" label="แก้ไข" unelevated no-caps @click="editUser(props.row.department_id)"></q-btn>
                            <q-btn size="sm" color="red" label="ลบ" unelevated no-caps @click="
                              deleteUser(
                                props.row.department_id,
                                props.row.department_name
                              )
                              "></q-btn>
                          </q-td>
                        </template>
                      </q-table>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-page>
      </div>
    </q-page-container>
  </q-layout>

  <!-- Dialogs -->
  <q-dialog v-model="showInstituteDialog" persistent>
    <InstituteFormDialog @updated="getInstitutes(); getUpdate();" />
  </q-dialog>

  <q-dialog v-model="showFacultyDialog" persistent>
    <FacultyFormDialog @updated="getFacultys(); getUpdate();" />
  </q-dialog>

  <q-dialog v-model="showDegreeDialog" persistent>
    <DegreeFormDialog @updated="getDegrees(); getUpdate();" />
  </q-dialog>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useQuasar } from "quasar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl } from "src/utils/apiConfig.js";
import InstituteFormDialog from "src/components/admin_forms/InstituteFormDialog.vue";
import FacultyFormDialog from "src/components/admin_forms/FacultyFormDialog.vue";
import DegreeFormDialog from "src/components/admin_forms/DegreeFormDialog.vue";
// ส่งออกไฟล์ excel
function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

  formatted =
    formatted === void 0 || formatted === null ? "" : String(formatted);

  formatted = formatted.split('"').join('""');
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`;
}

export default {
  name: "FormComponent",
  components: {
    InstituteFormDialog,
    FacultyFormDialog,
    DegreeFormDialog,
  },
  data() {
    return {
      showInstituteDialog: false,
      showFacultyDialog: false,
      showDegreeDialog: false,
      file_export: "",
      pdpa: ref(false),
      picked: new Date(),
      url_api_individual: "",
      url_api_institute: "",
      url_api_disability: "",
      url_api_project: "",
      url_api_advisor: "",
      url_api_member: "",
      // ------------------------------------------------------------------------------
      title: "การจัดการสาขาวิชา",
      email: "",
      username: "",
      password: "",
      repassword: "",
      register: false,
      passwordFieldType: "password",
      btnLabel: "เพิ่มข้อมูล",
      visibility: false,
      visibilityIcon: "visibility",
      individuals: Array,
      individuals_: Array,
      individual: {
        individual_id: "",
        // ข้อมูลส่วนตัว
        member_id: this.$store.getters.myMember_id,
        name: this.$store.getters.myName,
        birthday: "",
        // card_id: "",
        telephone: "",
        // ข้อมูลการศึกษา
        institute_id: 1,
        university: "",
        faculty_id: "",
        study_faculty: "",
        degree_id: "",
        degree_name: "",
        department_id: "",
        department_name: "",
        is_graduate: "0",
        year: "",
        date: "",
        // ข้อมูลความพิการ
        is_disability: "0",
        disability_id: "",
        disability_type: "",
        dis_description: "",
        // เข้าร่วมจากโครงการ
        project_id: "",
      },
      isEdit: false,
      status: "บันทึก",
      visibleColumns: ref([
        "actions",
        "institute_id",
        "institute_name",
        "faculty_id",
        "faculty_name",
        "degree_id",
        "degree_name",
        "department_id",
        "department_name",
      ]),
      columns: [
        // ข้อมูลส่วนตัว
        { name: "actions", align: "center", label: "แก้ไข/ลบ", style: "width: 170px;", headerStyle: "width: 170px;" },
        // ข้อมูลการศึกษา
        // {
        //   name: "institute_id",
        //   align: "center",
        //   label: "รหัสสถาบัน",
        //   field: (row) => row.institute_id,
        //   format: (val) => `${val}`,
        //   required: true,
        //   sortable: true,
        // },
        {
          name: "institute_name",
          align: "left",
          label: "สถาบัน",
          field: "institute_name",
          sortable: true,
        },
        {
          name: "faculty_name",
          align: "center",
          label: "คณะ",
          field: "faculty_name",
          sortable: true,
        },
        {
          name: "degree_name",
          align: "center",
          label: "ระดับ",
          field: "degree_name",
          sortable: true,
        },
        {
          name: "department_name",
          align: "center",
          label: "สาขาวิชา",
          field: "department_name",
          sortable: true,
        },
      ],
      filter: ref(""),
      loading: ref(false),
      individuals1: [],
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
      institutes_: {
        options: [],
      },
      institutes: {
        options: [],
      },
      institute: ref({
        label: "",
        value: "",
      }),
      facultys: {
        options: [],
      },
      facultys_: {
        options: [],
      },
      faculty: ref({
        label: "",
        value: "",
      }),
      degrees_: {
        options: [],
      },
      degrees: {
        options: [],
      },
      degree: ref({
        label: "",
        value: "",
      }),
      departments_: {
        options: [],
      },
      departments: {
        options: [],
      },
      department: ref({
        label: "",
        value: "",
      }),
      disabilitys_: {
        options: [],
      },
      disabilitys: {
        options: [],
      },
      disability: ref({
        label: "",
        value: "",
      }),
      projects_: {
        options: [],
      },
      projects: {
        options: [],
      },
      project: ref({
        label: "",
        value: "",
      }),
      advisors_: {
        options: [],
      },
      advisors: {
        options: [],
      },
      advisor: ref({
        label: "",
        value: "",
      }),
      $q: useQuasar(),
      selected: ref([]),
    };
  },

  methods: {
    // นำออกไฟล์ excel
    async exportTable() {
      if (!this.individuals1 || this.individuals1.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูลในตาราง', icon: 'warning' });
        return;
      }

      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Departments');

        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        worksheet.mergeCells('A1:C1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลสาขาวิชา (Admin Constance) - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        const headerRow = worksheet.getRow(2);
        headerRow.values = ['รหัส', 'สถาบัน/คณะ/ระดับ', 'สาขาวิชา'];
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = border;
        });

        const rows = this.selected.length > 0 ? this.selected : this.individuals1;
        rows.forEach((row, idx) => {
          const r = worksheet.addRow([
            row.department_id,
            `${row.institute_name || ''} / ${row.faculty_name || ''} / ${row.degree_name || ''}`,
            row.department_name || '-'
          ]);

          r.eachCell((cell) => {
            cell.font = dataFont;
            cell.border = border;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            if (idx % 2 === 1) cell.fill = zebraFill;
          });
        });

        worksheet.columns = [{ width: 10 }, { width: 50 }, { width: 40 }];

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Departments_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);

        this.$q.notify({ color: 'positive', message: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว', icon: 'check' });
      } catch (error) {
        console.error("Export error:", error);
        this.$q.notify({ color: 'negative', message: 'ส่งออกไม่สำเร็จ: ' + error.message, icon: 'error' });
      } finally {
        this.$q.loading.hide();
      }
    },
    //---------------------------------------
    onTelephone() {
      console.log("next-telephone");
    },
    resetForm() {
      this.isEdit = false;
      console.log("isEdit:", this.isEdit);
      this.btnLabel = "เพิ่มข้อมูล";
      console.log("ยกเลิกการบันทึกข้อมูล");

      this.individual.department_name = "";
      this.degree.value = "";
      this.degree.label = "";
      this.faculty.value = "";
      this.faculty.label = "";
      this.institute.value = "";
      this.institute.label = "";
    },
    submitForm() {
      if (!this.degree || !this.degree.value) {
        this.$q.notify({ message: "กรุณาเลือกระดับการศึกษา", color: "warning" });
        return;
      }

      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({
        title: "ยืนยัน",
        message: message,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          const payload = {
            degree_id: this.degree.value,
            department_name: this.individual.department_name,
          };

          if (!this.isEdit) {
            await axios.post(`${getRestApiUrl(this.$store)}/departments`, payload);
            this.$q.notify({ message: "บันทึกข้อมูลสำเร็จ", color: "positive" });
          } else {
            await axios.put(`${getRestApiUrl(this.$store)}/departments/${this.individual.department_id}`, payload);
            this.$q.notify({ message: "แก้ไขข้อมูลสำเร็จ", color: "positive" });
          }
          this.resetForm();
          this.getUpdate();
        } catch (error) {
          this.$q.notify({ message: "Error: " + (error.response?.data?.error || error.message), color: "negative" });
        }
      });
    },
    async editUser(department_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/departments/${department_id}`);
        const item = res.data;
        if (item) {
          this.individual.department_id = item.department_id;
          this.individual.department_name = item.department_name;
          this.individual.degree_id = item.degree_id;

          this.institute = { label: item.institute_name, value: item.institute_id };
          await this.getFacultys();
          this.faculty = { label: item.faculty_name, value: item.faculty_id };
          await this.getDegrees();
          this.degree = { label: item.degree_name, value: item.degree_id };
        }
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      }
    },
    deleteUser(department_id, department_name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [ ${department_name} ] หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${getRestApiUrl(this.$store)}/departments/${department_id}`);
          this.$q.notify({ message: "ลบข้อมูลสำเร็จ", color: "positive" });
          this.getUpdate();
        } catch (error) {
          this.$q.notify({ message: "Error: " + error.message, color: "negative" });
        }
      });
    },
    deleteSelected() {
      if (this.selected.length === 0) return;
      this.$q.dialog({
        title: "ยืนยันการลบหลายรายการ",
        message: `คุณต้องการลบข้อมูลที่เลือกทั้งหมด ${this.selected.length} รายการหรือไม่?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        this.$q.loading.show({ message: "กำลังลบข้อมูลที่เลือก...", spinnerColor: "red" });
        let successCount = 0;
        let failCount = 0;
        try {
          for (const item of this.selected) {
            try {
              await axios.delete(`${getRestApiUrl(this.$store)}/departments/${item.department_id}`);
              successCount++;
            } catch (err) {
              console.error(`Failed to delete ID ${item.department_id}:`, err);
              failCount++;
            }
          }
          this.$q.notify({
            color: successCount > 0 ? "positive" : "negative",
            message: `ลบสำเร็จ ${successCount} รายการ${failCount > 0 ? `, ล้มเหลว ${failCount} รายการ` : ""}`,
            icon: successCount > 0 ? "check" : "error",
          });
          this.selected = [];
          this.resetForm();
          await this.getUpdate();
        } finally {
          this.$q.loading.hide();
        }
      });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/departments`);
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      } finally {
        this.loading = false;
      }
    },
    getMember() {
      console.log("Get Member:");
      var self = this;
      axios
        .get(`${getRestApiUrl(this.$store)}/members/options`)
        .then(function (res) {
          console.log("name:", res);
          var member_id = res.data.map((item) => item.member_id);
          var full_name = res.data.map((item) => item.full_name);
          var status = res.data.map((item) => item.status);
          self.members.options.splice(0);
          for (var i = 0; i < member_id.length; i++) {
            self.members.options.push({
              label: full_name[i],
              value: member_id[i],
              description: status[i],
            });
          }
          self.members_.options = self.members.options;
        })
        .finally(() => {
          self.loading = false;
        });
    },
    onNext() {
      this.$router.replace({ name: "FormPlanCareer" });
    },
    onPrevious() { },
    getInstitutes() {
      console.log(" แสดงข้อมูลสถาบัน ");
      var self = this;
      axios
        .get(`${getRestApiUrl(this.$store)}/institutes`)
        .then(function (res) {
          console.log("ข้อมูลสถาบัน:", res.data);
          var institute_id = res.data.map((item) => item.institute_id);
          var institute_name = res.data.map((item) => item.institute_name);
          self.institutes.options.splice(0);
          for (var i = 0; i < institute_id.length; i++) {
            self.institutes.options.push({
              label: institute_name[i],
              value: institute_id[i],
            });
          }
          self.institutes_.options = self.institutes.options;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    async getFacultys() {
      if (!this.institute || !this.institute.value) {
        this.facultys.options = [];
        this.facultys_.options = [];
        return;
      }
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/faculties?institute_id=${this.institute.value}`);
        this.facultys.options = res.data.map((item) => ({
          label: item.faculty_name,
          value: item.faculty_id,
        }));
        this.facultys_.options = this.facultys.options;
      } catch (error) {
        console.error("Error fetching faculties:", error);
      }
    },
    async getDegrees() {
      if (!this.faculty || !this.faculty.value) {
        this.degrees.options = [];
        this.degrees_.options = [];
        return;
      }
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/degrees?faculty_id=${this.faculty.value}`);
        this.degrees.options = res.data.map((item) => ({
          label: item.degree_name,
          value: item.degree_id,
        }));
        this.degrees_.options = this.degrees.options;
      } catch (error) {
        console.error("Error fetching degrees:", error);
      }
    },
    async getDepartments() {
      if (!this.degree || !this.degree.value) {
        this.departments.options = [];
        this.departments_.options = [];
        return;
      }
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/departments`, {
          params: { degree_id: this.degree.value }
        });
        this.departments.options = res.data.map((item) => ({
          label: item.department_name,
          value: item.department_id,
        }));
        this.departments_.options = this.departments.options;
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    },
    async getDisabilitys() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/disabilities`);
        this.disabilitys.options = res.data.map((item) => ({
          label: item.disability_name,
          value: item.disability_id,
        }));
        this.disabilitys_.options = this.disabilitys.options;
      } catch (error) {
        console.error("Error fetching disabilities:", error);
      }
    },
    async getProjects() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/projects`);
        this.projects.options = res.data.map((item) => ({
          label: item.project_name,
          value: item.project_id,
        }));
        this.projects_.options = this.projects.options;
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    },
    async getAdvisors() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`, {
          params: { role: 'suser' } // Assuming 'suser' are the advisors
        });
        this.advisors.options = res.data.map((item) => ({
          label: item.full_name,
          value: item.member_id,
        }));
        this.advisors_.options = this.advisors.options;
      } catch (error) {
        console.error("Error fetching advisors:", error);
      }
    },
    onBirthday(val) {
      console.log("Thai Date:", val);
    },
    onInstituteValueChange(val) {
      console.log("เลือกสถาบัน:", val.label);
      console.log("รหัสสถาบัน:", val.value);
      this.individual.institute_id = val.value;
      this.getFacultys();
    },
    onFacultyValueChange(val) {
      console.log("เลือกคณะ:", val.label);
      console.log("รหัสคณะ:", val.value);
      this.individual.faculty_id = val.value;
      this.getDegrees();
    },
    onDegreeValueChange(val) {
      console.log("เลือกระดับการศึกษา:", val.label);
      console.log("รหัสระดับการศึกษา:", val.value);
      this.individual.degree_id = val.value;
      // this.getDepartments();
    },
    onDepartmentValueChange(val) {
      console.log("เลือกสาขาวิชา:", val.label);
      console.log("รหัสสาขาวิชา:", val.value);
    },
    onProjectValueChange(val) {
      console.log("เลือกโครงการ:", val.label);
      console.log("รหัสโครงการ:", val.value);
    },
    onDisabilityValueChange(val) {
      console.log("เลือกความพิการ:", val.label);
      console.log("รหัสความพิการ:", val.value);
    },
    filterInstitute(val, update) {
      if (val === "") {
        update(() => {
          this.institutes.options = this.institutes_.options;
          console.log("institutes_.options:", this.institutes_.options);
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        console.log("needle:", needle);
        this.institutes.options = this.institutes_.options.filter(
          (v) => v.label.indexOf(needle) > -1
        );
        console.log("institutes_.options:", this.institutes_.options);
      });
    },
    filterMember(val, update) {
      if (val === "") {
        update(() => {
          this.members.options = this.members_.options;
          console.log("members_.options:", this.members_.options);
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        console.log("needle:", needle);
        this.members.options = this.members_.options.filter(
          (v) => v.label.indexOf(needle) > -1
        );
        console.log("members_.options:", this.members_.options);
      });
    },
    filterFaculty(val, update) {
      if (val === "") {
        update(() => {
          this.facultys.options = this.facultys_.options;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.facultys.options = this.facultys_.options.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    filterDegree(val, update) {
      if (val === "") {
        update(() => {
          this.degrees.options = this.degrees_.options;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.degrees.options = this.degrees_.options.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/departments`);
        this.individuals1 = res.data;
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      } finally {
        this.loading = false;
      }
    },
    OnInstitute(institute) {
      if (!institute)
        this.institute = ref({
          label: "",
          value: "",
        });
    },
    OnFaculty(faculty) {
      if (!faculty)
        this.faculty = ref({
          label: "",
          value: "",
        });
    },
    OnDegree(degree) {
      if (!degree)
        this.degree = ref({
          label: "",
          value: "",
        });
    },
  },
  mounted() {
    this.getUpdate();
    this.getInstitutes();
  },
};
</script>
<style lang="sass">
.my-sticky-header-table
  height: 310px
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

.menu-btn
  transition: all 0.3s ease
  &:hover
    transform: translateY(-3px)
    box-shadow: 0 4px 8px rgba(0,0,0,0.2)
</style>
