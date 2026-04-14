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
                              <q-icon name="cancel" @click.stop.prevent="institute = null" class="cursor-pointer" />
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
                        </div>
                      </div>
                    </q-form>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <div class="q-pa-xs">
                      <q-table title="ข้อมูลคณะ" :rows="individuals1" :columns="columns" row-key="faculty_id" :filter="filter"
                        :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        table-header-style="height: 65px; " table-header-class="bg-blue-5" :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home" icon-last-page="all_inclusive"
                        icon-next-page="arrow_right" icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                          return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                        }" selection="multiple" v-model:selected="selected">
                        <template v-slot:top-right="props">
                          <div class="row q-gutter-sm items-center">
                            <q-btn v-if="selected.length > 0" flat color="red" icon="delete"
                              :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />
                            <q-input dense debounce="300" v-model="filter" placeholder="ค้นหาข้อมูลคณะ..." outlined
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
                          <q-btn flat color="black" icon="download" label="ส่งออก excel" @click="exportTable()" />
                          <q-select v-model="visibleColumns" multiple outlined dense options-dense
                            :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                            option-value="name" options-cover style="min-width: 150px" />
                          <q-btn flat round dense :icon="props.inFullscreen
                            ? 'fullscreen_exit'
                            : 'fullscreen'
                            " @click="props.toggleFullscreen" class="q-ml-md" />
                          </div>
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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl } from "../../utils/apiConfig.js";

// ส่งออกไฟล์ excel
function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

export default {
  name: "FacultyForm", // Renamed for clarity
  data() {
    return {
      file_export: "",
      pdpa: ref(false),
      picked: new Date(),
      // ------------------------------------------------------------------------------
      title: "ข้อมูลคณะ(ผู้ดูแลกลุ่ม)",
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
        const worksheet = workbook.addWorksheet('Faculties');

        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        worksheet.mergeCells('A1:C1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลคณะ (Super User Constance) - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        const headerRow = worksheet.getRow(2);
        headerRow.values = ['รหัส', 'สถาบัน', 'คณะ'];
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
            row.faculty_id,
            row.institute_name || '-',
            row.faculty_name || '-'
          ]);

          r.eachCell((cell) => {
            cell.font = dataFont;
            cell.border = border;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            if (idx % 2 === 1) cell.fill = zebraFill;
          });
        });

        worksheet.columns = [{ width: 10 }, { width: 40 }, { width: 40 }];

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Faculties_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);

        this.$q.notify({ color: 'positive', message: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว', icon: 'check' });
      } catch (error) {
        console.error("Export error:", error);
        this.$q.notify({ color: 'negative', message: 'ส่งออกไม่สำเร็จ: ' + error.message, icon: 'error' });
      } finally {
        this.$q.loading.hide();
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
              await axios.delete(`${getRestApiUrl(this.$store)}/faculties/${item.faculty_id}`);
              successCount++;
            } catch (err) {
              console.error(`Failed to delete ID ${item.faculty_id}:`, err);
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

