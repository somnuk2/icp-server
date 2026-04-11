<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page padding class="items-center justify-center" style="background: linear-gradient(#74c588, #0ad13c)">
          <div class="full-width">
            <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
              <q-card flat class="bg-white text-black">
                <q-card-section class="bg-blue-14 text-center">
                  <h4 class="text-h5 text-white q-my-xs">
                    {{ title }}
                  </h4>
                </q-card-section>

                <!-- Navigation Menu Buttons -->
                <q-card-section class="bg-blue-1 text-center q-pa-md border-radius-inherit">
                  <div class="text-subtitle2 text-blue-9 q-mb-sm text-weight-bold">
                    <q-icon name="settings" class="q-mr-xs" /> การจัดการข้อมูลพื้นฐาน (ค่าคงที่)
                  </div>
                  <div class="row justify-center q-gutter-sm">
                    <q-btn unelevated rounded color="blue-7" icon="school" label="สถาบัน"
                      @click="showInstituteDialog = true" class="q-px-lg menu-btn" />
                    <q-btn unelevated rounded color="blue-8" icon="account_balance" label="คณะ"
                      @click="showFacultyDialog = true" class="q-px-lg menu-btn" />
                    <q-btn unelevated rounded color="blue-9" icon="history_edu" label="ระดับการศึกษา"
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
                              <q-icon name="cancel" @click.stop.prevent="institute = null" class="cursor-pointer" />
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
                              <q-icon name="cancel" @click.stop.prevent="faculty = null" class="cursor-pointer" />
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
                              <q-icon name="cancel" @click.stop.prevent="degree = null" class="cursor-pointer" />
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
                          <q-btn :label="btnLabel" type="submit" color="primary" icon="save" />
                          <!-- ยกเลิก -->
                          <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" icon="clear" />
                          <!-- ออก -->
                          <q-btn icon="logout" label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                          <!-- กลับฟอร์มการลงทะเบียน -->
                          <q-btn color="primary" label="กลับฟอร์มการลงทะเบียน" no-caps flat icon="skip_previous"
                            to="/SuserFormRegistration">
                            <q-tooltip class="bg-accent">กลับฟอร์มการลงทะเบียน</q-tooltip>
                          </q-btn>
                          <!-- ไปฟอร์มกำหนดอาชีพเป้าหมาย -->
                          <q-btn color="primary" label="ไปฟอร์มข้อมูลส่วนตัว" no-caps flat icon="skip_next"
                            to="/SuserFormComponent">
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
                        }">
                        <template v-slot:top-right="props">
                          <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาข้อมูลสาขาวิชา">
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
                          <q-btn flat color="green-7" icon="download" label="ส่งออก excel" @click="exportTable()" />
                          <q-select v-model="visibleColumns" multiple outlined dense options-dense
                            :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                            option-value="name" options-cover style="min-width: 150px" />
                          <q-btn flat round dense :icon="props.inFullscreen
                            ? 'fullscreen_exit'
                            : 'fullscreen'
                            " @click="props.toggleFullscreen" class="q-ml-md" />
                        </template>
                        <template v-slot:body-cell-actions="props">
                          <q-td :props="props">
                            <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.department_id)"
                              no-caps></q-btn>
                            <q-btn color="red" label="ลบ" @click="
                              deleteUser(
                                props.row.department_id,
                                props.row.department_name
                              )
                              " no-caps></q-btn>
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
import { useQuasar, exportFile } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig";
import InstituteFormDialog from "src/components/admin_forms/InstituteFormDialog.vue";
import FacultyFormDialog from "src/components/admin_forms/FacultyFormDialog.vue";
import DegreeFormDialog from "src/components/admin_forms/DegreeFormDialog.vue";

// ส่งออกไฟล์ excel
function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

export default {
  name: "DepartmentFormSuperUser",
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
      // ------------------------------------------------------------------------------
      title: "การจัดการสาขาวิชา(ผู้ดูแลกลุ่ม)",
      btnLabel: "เพิ่มข้อมูล",
      individual: {
        department_id: "",
        institute_id: "",
        faculty_id: "",
        degree_id: "",
        department_name: "",
      },
      isEdit: false,
      visibleColumns: ref([
        "actions",
        "institute_name",
        "faculty_name",
        "degree_name",
        "department_name",
      ]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        {
          name: "institute_name",
          align: "left",
          label: "สถาบัน",
          field: "institute_name",
          sortable: true,
        },
        {
          name: "faculty_name",
          align: "left",
          label: "คณะ",
          field: "faculty_name",
          sortable: true,
        },
        {
          name: "degree_name",
          align: "left",
          label: "ระดับ",
          field: "degree_name",
          sortable: true,
        },
        {
          name: "department_name",
          align: "left",
          label: "สาขาวิชา",
          field: "department_name",
          sortable: true,
        },
      ],
      filter: ref(""),
      loading: ref(false),
      individuals1: [],
      institutes_: { options: [] },
      institutes: { options: [] },
      institute: ref({ label: "", value: "" }),
      facultys: { options: [] },
      facultys_: { options: [] },
      faculty: ref({ label: "", value: "" }),
      degrees: { options: [] },
      degrees_: { options: [] },
      degree: ref({ label: "", value: "" }),
      $q: useQuasar(),
    };
  },

  methods: {
    exportTable() {
      const columns = this.columns;
      const rows = this.individuals1;
      const content = [columns.map((col) => wrapCsvValue(col.label))]
        .concat(
          rows.map((row) =>
            columns
              .map((col) =>
                wrapCsvValue(
                  typeof col.field === "function"
                    ? col.field(row)
                    : row[col.field === void 0 ? col.name : col.field],
                  col.format,
                  row
                )
              )
              .join(",")
          )
        )
        .join("\r\n");

      const status = exportFile(this.file_export || "department_report.csv", "\ufeff" + content, {
        encoding: "utf-8",
        mimeType: "text/csv;charset=utf-8;",
      });

      if (status !== true) {
        this.$q.notify({
          message: "Browser denied file download...",
          color: "negative",
          icon: "warning",
        });
      }
    },

    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.individual.department_name = "";
      this.individual.department_id = "";
      this.individual.degree_id = "";
      this.individual.faculty_id = "";
      this.individual.institute_id = "";
      this.institute = { label: "", value: "" };
      this.faculty = { label: "", value: "" };
      this.degree = { label: "", value: "" };
    },

    async submitForm() {
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
            this.$q.notify({ message: "บันทึกข้อมูลเรียบร้อยแล้ว", color: "positive" });
          } else {
            await axios.put(`${getRestApiUrl(this.$store)}/departments/${this.individual.department_id}`, payload);
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
          this.individual.faculty_id = item.faculty_id;
          this.individual.institute_id = item.institute_id;

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

    async deleteUser(department_id, department_name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [ ${department_name} ] หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${getRestApiUrl(this.$store)}/departments/${department_id}`);
          this.$q.notify({ message: "ลบข้อมูลเรียบร้อยแล้ว", color: "positive" });
          await this.getUpdate();
        } catch (error) {
          this.$q.notify({ message: "Error: " + error.message, color: "negative" });
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

    async getInstitutes() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/institutes`);
        this.institutes.options = res.data.map((item) => ({
          label: item.institute_name,
          value: item.institute_id,
        }));
        this.institutes_.options = this.institutes.options;
      } catch (error) {
        console.error(error);
      }
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
        console.error(error);
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
        console.error(error);
      }
    },

    onInstituteValueChange(val) {
      if (val) {
        this.individual.institute_id = val.value;
        this.individual.faculty_id = "";
        this.faculty = { label: "", value: "" };
        this.individual.degree_id = "";
        this.degree = { label: "", value: "" };
        this.getFacultys();
      } else {
        this.individual.institute_id = "";
        this.individual.faculty_id = "";
        this.faculty = { label: "", value: "" };
        this.individual.degree_id = "";
        this.degree = { label: "", value: "" };
        this.facultys.options = [];
        this.facultys_.options = [];
      }
    },

    onFacultyValueChange(val) {
      if (val) {
        this.individual.faculty_id = val.value;
        this.individual.degree_id = "";
        this.degree = { label: "", value: "" };
        this.getDegrees();
      } else {
        this.individual.faculty_id = "";
        this.individual.degree_id = "";
        this.degree = { label: "", value: "" };
        this.degrees.options = [];
        this.degrees_.options = [];
      }
    },

    onDegreeValueChange(val) {
      if (val) {
        this.individual.degree_id = val.value;
      } else {
        this.individual.degree_id = "";
      }
    },

    filterInstitute(val, update) {
      if (val === "") {
        update(() => {
          this.institutes.options = this.institutes_.options;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.institutes.options = this.institutes_.options.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        );
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

    nextItem(event) {
      if (event.keyCode == 13) {
        // Handle enter key
      }
    }
  },
  mounted() {
    this.getUpdate();
    this.getInstitutes();
  },
};
</script>

<style lang="sass">
.menu-btn
  transition: all 0.3s ease
  &:hover
    transform: translateY(-3px)
    box-shadow: 0 4px 8px rgba(0,0,0,0.2)

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
</style>

<style lang="sass">
.menu-btn
  transition: all 0.3s ease
  &:hover
    transform: translateY(-3px)
    box-shadow: 0 4px 8px rgba(0,0,0,0.2)

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
</style>
