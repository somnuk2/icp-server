<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page padding class="items-center justify-center" style="background: linear-gradient(#74c588, #0ad13c)">
          <div class="full-width">
            <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
              <q-card flat class="bg-white text-black">
                <q-card-section class="bg-blue-14">
                  <h4 class="text-h5 text-white q-my-xs text-center">
                    {{ title }}
                  </h4>
                </q-card-section>
                <div class="q-pa-md">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <q-form @submit.prevent="submitForm()" @reset="resetForm()" method="post" class="q-gutter-md">
                      <!-- สถาบันการศึกษา + ระดับการศึกษา -->
                      <div class="row">
                        <!-- สถาบันการศึกษา -->
                        <div class="col-md-12 col-xs-12 q-pa-xs">
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
                        <div class="col-md-12 col-xs-12 q-pa-xs">
                          <q-input color="white" bg-color="blue-5" standout bottom-slots v-model="individual.faculty_name"
                            label="คณะ *" clearable :rules="[
                              (val) => (val && val.length > 0) || 'ต้องใส่คณะ',
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
                        </div>
                      </div>
                    </q-form>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <div class="q-pa-xs">
                      <q-table title="ข้อมูลคณะ" :rows="individuals1" :columns="columns" row-key="name" :filter="filter"
                        :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        table-header-style="height: 65px; " table-header-class="bg-blue-5"
                        :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home" icon-last-page="all_inclusive"
                        icon-next-page="arrow_right" icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                          return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                        }">
                        <template v-slot:top-right="props">
                          <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาข้อมูลคณะ">
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
                          <q-btn flat icon-right="archive" label="ส่งออกไฟล์" @click="exportTable()" />
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
                            <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.faculty_id)" no-caps></q-btn>
                            <q-btn color="red" label="ลบ" @click="
                              deleteUser(
                                props.row.faculty_id,
                                props.row.faculty_name
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
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useQuasar } from "quasar";
import { exportFile } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig";

// ส่งออกไฟล์ excel
function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

export default {
  name: "FacultyFormAdmin",
  data() {
    return {
      file_export: "",
      pdpa: ref(false),
      picked: new Date(),
      // ------------------------------------------------------------------------------
      title: "ข้อมูลคณะ(ผู้ดูแลระบบ)",
      btnLabel: "เพิ่มข้อมูล",
      individual: {
        faculty_id: "",
        institute_id: "",
        faculty_name: "",
      },
      isEdit: false,
      visibleColumns: ref([
        "actions",
        "institute_name",
        "faculty_name",
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
      ],
      filter: ref(""),
      loading: ref(false),
      individuals1: [],
      institutes_: { options: [] },
      institutes: { options: [] },
      institute: ref({ label: "", value: "" }),
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

      const status = exportFile(this.file_export || "faculty_report_admin.csv", "\ufeff" + content, {
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
      this.individual.faculty_name = "";
      this.individual.faculty_id = "";
      this.individual.institute_id = "";
      this.institute = { label: "", value: "" };
    },

    async submitForm() {
      if (!this.institute || !this.institute.value) {
        this.$q.notify({ message: "กรุณาเลือกสถาบัน", color: "warning" });
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
            institute_id: this.institute.value,
            faculty_name: this.individual.faculty_name,
          };

          if (!this.isEdit) {
            await axios.post(`${getRestApiUrl(this.$store)}/faculties`, payload);
            this.$q.notify({ message: "บันทึกข้อมูลเรียบร้อยแล้ว", color: "positive" });
          } else {
            await axios.put(`${getRestApiUrl(this.$store)}/faculties/${this.individual.faculty_id}`, payload);
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

    async editUser(faculty_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/faculties`);
        const item = res.data.find(f => f.faculty_id === faculty_id);
        if (item) {
          this.individual.faculty_id = item.faculty_id;
          this.individual.faculty_name = item.faculty_name;
          this.individual.institute_id = item.institute_id;
          this.institute = {
            label: item.institute_name,
            value: item.institute_id
          };
        }
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      }
    },

    async deleteUser(faculty_id, faculty_name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [ ${faculty_name} ] หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${getRestApiUrl(this.$store)}/faculties/${faculty_id}`);
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
        const res = await axios.get(`${getRestApiUrl(this.$store)}/faculties`);
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
        this.$q.notify({ message: "Error loading institutes: " + error.message, color: "negative" });
      }
    },

    onInstituteValueChange(val) {
      if (val) {
        this.individual.institute_id = val.value;
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
    // The following methods are not used in the provided template and are removed for refactoring consistency.
    // onTelephone() {},
    // getMember() {},
    // onNext() {},
    // onPrevious() {},
    // getFacultys() {},
    // getDegrees() {},
    // getDepartments() {},
    // getDisabilitys() {},
    // getProjects() {},
    // getAdvisors_() {},
    // getAdvisors() {},
    // onBirthday(val) {},
    // onFacultyValueChange(val) {},
    // onDegreeValueChange(val) {},
    // onDepartmentValueChange(val) {},
    // onProjectValueChange(val) {},
    // onDisabilityValueChange(val) {},
    // filterMember(val, update) {},
    // filterFaculty(val, update) {},
    // filterDegree(val, update) {},
    // filterDepartment(val, update) {},
    // filterDisability(val, update) {},
    // filterProject(val, update) {},
    // filterAdvisor(val, update) {},
    OnInstitute(institute) {
      if (!institute)
        this.institute = ref({
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
</style>

