<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div>
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
                      <div class="row">
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-select v-model="career_" use-input use-chips input-debounce="0" @new-value="createValue"
                            @update:model-value="(val) => updateValue(val)" :options="career.options"
                            @filter="filterCareer" label="อาชีพ *" stack-label lazy-rules>
                            <template v-slot:prepend>
                              <q-icon name="assignment" />
                            </template>
                            <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                  <q-icon :name="scope.opt.icon || 'work'" />
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
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-select ref="name" use-input use-chips input-debounce="0" @filter="filterCareerGroup"
                            v-model="career_group_" :options="career_group.options" label="กลุ่มอาชีพ *" stack-label
                            lazy-rules>
                            <template v-slot:prepend>
                              <q-icon name="assignment" />
                            </template>
                            <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                  <q-icon :name="scope.opt.icon || 'group'" />
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
                      <!-- ปุ่มควบคุม -->
                      <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                          <!-- บันทึก/แก้ไข -->
                          <q-btn :label="btnLabel" type="submit" color="primary" />
                          <!-- ยกเลิก -->
                          <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" />
                          <!-- ออก -->
                          <q-btn label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                        </div>
                      </div>
                    </q-form>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <div class="q-pa-xs">
                      <q-table :rows="individuals1" :columns="columns" row-key="career_id" :filter="filter"
                      selection="multiple" v-model:selected="selected"
                      :loading="loading" :visible-columns="visibleColumns" separator="cell"
                      table-header-style="height: 65px; " table-header-class="bg-primary text-white"
                      :rows-per-page-options="[10, 20, 30, 50, 100, 0]" icon-first-page="home"
                      icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                      :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                        return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                      }">
                        <template v-slot:top-right="props">
                          <div class="row q-gutter-sm items-center">
                            <q-btn v-if="selected.length > 0" flat color="red" :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />
                            <q-input dense debounce="300" v-model="filter" placeholder="ค้นหาอาชีพ..." outlined
                              bg-color="white">
                              <template v-slot:append>
                                <q-icon name="search" />
                              </template>
                            </q-input>
                            <!-- ส่งออกไฟล์ -->
                            <q-input dense debounce="300" v-model="file_export" placeholder="ชื่อไฟล์นำออก" outlined
                              bg-color="white" style="width: 150px;">
                              <template v-slot:append>
                                <q-icon name="save" />
                              </template>
                            </q-input>
                            <q-btn flat color="black" label="ส่งออก excel" @click="exportTable()" />
                            <q-select v-model="visibleColumns" multiple outlined dense options-dense
                              :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                              option-value="name" options-cover style="min-width: 150px" bg-color="white" />
                            <q-btn flat round dense :@click="props.toggleFullscreen" />
                          </div>
                        </template>
                        <template v-slot:body-cell-actions="props">
                          <q-td :props="props" class="text-center">
                            <q-btn size="sm" color="blue" label="แก้ไข" unelevated no-caps @click="editUser(props.row)" />
                            <q-btn size="sm" color="red" label="ลบ" unelevated no-caps @click="
                              deleteUser(
                                props.row.career_id,
                                props.row.career_name
                              )
                              " />
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
import { useQuasar, is } from "quasar";
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
  name: "CareerForm",
  data() {
    return {
      career_: ref(null),
      file_export: "",
      url_api: "",
      title: "อาชีพ(ผู้ดูแลระบบ)",
      btnLabel: "เพิ่มข้อมูล",
      individual: {
        career_id: "",
        career_name: "",
        career_group_id: "",
      },
      isEdit: false,
      visibleColumns: ref([
        "actions",
        "career_id",
        "career_name",
        "ca_group_name",
      ]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ", style: "width: 170px;", headerStyle: "width: 170px;" },
        {
          name: "career_id",
          align: "center",
          label: "รหัส",
          field: "career_id",
          sortable: true,
        },
        {
          name: "career_name",
          align: "left",
          label: "อาชีพ",
          field: "career_name",
          sortable: true,
        },
        {
          name: "ca_group_name",
          align: "left",
          label: "กลุ่มอาชีพ",
          field: "ca_group_name",
          sortable: true,
        },
      ],
      filter: ref(""),
      loading: ref(false),
      individuals1: [],
      career_group: {
        options: [],
      },
      career_groups: {
        options: [],
      },
      career_group_: ref(null),
      career: {
        options: [],
      },
      careers: {
        options: [],
      },
      $q: useQuasar(),
      selected: ref([]),
    };
  },

  methods: {
    async exportTable() {
      if (!this.individuals1 || this.individuals1.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูลในตาราง', icon: 'warning' });
        return;
      }

      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Careers');

        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        worksheet.mergeCells('A1:C1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลอาชีพ (Admin Constance) - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        const headerRow = worksheet.getRow(2);
        headerRow.values = ['รหัส', 'อาชีพ', 'กลุ่มอาชีพ'];
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
            row.career_id,
            row.career_name || '-',
            row.ca_group_name || '-'
          ]);

          r.eachCell((cell) => {
            cell.font = dataFont;
            cell.border = border;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            if (idx % 2 === 1) cell.fill = zebraFill;
          });
        });

        worksheet.columns = [{ width: 10 }, { width: 40 }, { width: 30 }];

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Careers_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);

        this.$q.notify({ color: 'positive', message: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว', icon: 'check' });
      } catch (error) {
        console.error("Export error:", error);
        this.$q.notify({ color: 'negative', message: 'ส่งออกไม่สำเร็จ: ' + error.message, icon: 'error' });
      } finally {
        this.$q.loading.hide();
      }
    },
    filterCareerGroup(val, update) {
      if (val === "") {
        update(() => {
          this.career_group.options = this.career_groups.options;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.career_group.options = this.career_groups.options.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.individual.career_id = "";
      this.individual.career_name = "";
      this.career_group_ = null;
      this.career_ = null;
    },
    async submitForm() {
      if (!this.career_group_) {
        this.$q.notify({ color: "warning", message: "กรุณาเลือกกลุ่มอาชีพ" });
        return;
      }
      const data = {
        career_name: this.individual.career_name,
        career_group_id: this.career_group_.value,
      };

      const msg = this.isEdit
        ? "คุณต้องการบันทึกการเแก้ไขข้อมูลหรือไม่?"
        : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";

      this.$q.dialog({
        title: "ยืนยัน",
        message: msg,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          if (!this.isEdit) {
            await axios.post(this.url_api, data);
          } else {
            await axios.put(`${this.url_api}/${this.individual.career_id}`, data);
          }
          this.$q.notify({ color: "positive", message: "บันทึกข้อมูลเสร็จสิ้น" });
          await this.getUpdate();
          this.resetForm();
        } catch (error) {
          console.error(error);
          this.$q.notify({
            color: "negative",
            message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (error.response?.data?.message || error.message)
          });
        }
      });
    },
    editUser(row) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      this.individual.career_id = row.career_id;
      this.individual.career_name = row.career_name;
      this.career_ = {
        value: row.career_id,
        label: row.career_name,
      };
      this.career_group_ = {
        value: row.career_group_id,
        label: row.ca_group_name,
      };
    },
    deleteUser(career_id, name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [ ${career_id} - ${name} ] หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${this.url_api}/${career_id}`);
          this.$q.notify({ color: "positive", message: "ลบข้อมูลเสร็จสิ้น" });
          this.selected = this.selected.filter(item => item.career_id !== career_id);
          await this.getUpdate();
        } catch (error) {
          console.error(error);
          this.$q.notify({ color: "negative", message: "ลบข้อมูลไม่สำเร็จ" });
        }
      });
    },

    deleteSelected() {
      this.$q.dialog({
        title: "ยืนยันการลบหลายรายการ",
        message: `คุณต้องการลบข้อมูลที่เลือกทั้งหมด ${this.selected.length} รายการหรือไม่?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        this.$q.loading.show({ message: "กำลังลบข้อมูลที่เลือก...", spinnerColor: "red" });
        try {
          for (const item of this.selected) {
            await axios.delete(`${this.url_api}/${item.career_id}`);
          }
          this.$q.notify({ message: `ลบข้อมูล ${this.selected.length} รายการสำเร็จ`, color: "positive", icon: "check_circle" });
          this.selected = [];
          this.resetForm();
          await this.getUpdate();
        } catch (error) {
          console.error(error);
          this.$q.notify({ message: "เกิดข้อผิดพลาดในการลบข้อมูลบางรายการ", color: "negative", icon: "error" });
        } finally {
          this.$q.loading.hide();
        }
      });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(this.url_api);
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
        this.getCareerList();
      } catch (error) {
        console.error(error);
        this.$q.notify({ color: "negative", message: "โหลดข้อมูลอาชีพไม่สำเร็จ" });
      } finally {
        this.loading = false;
      }
    },
    getCareer_group() {
      axios.get(this.url_api + "/groups").then((res) => {
        this.career_group.options = res.data.map(item => ({
          label: item.ca_group_name,
          value: item.career_group_id,
          description: item.ca_group_description
        }));
        this.career_groups.options = this.career_group.options;
      });
    },
    filterCareer(val, update) {
      if (val === "") {
        update(() => {
          this.career.options = this.careers.options;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.career.options = this.careers.options.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    getCareerList() {
      // Use existing data from individuals1 to populate auto-complete
      const uniqueNames = [...new Set(this.individuals1.map(i => i.career_name))];
      this.career.options = uniqueNames.map(name => ({ label: name }));
      this.careers.options = this.career.options;
    },
    createValue(val, done) {
      if (val.length > 0) {
        if (!this.careers.options.find(o => o.label === val)) {
          this.individual.career_name = val;
          done({ label: val }, "add-unique");
        }
      }
    },
    updateValue(val) {
      if (is.object(val)) {
        this.individual.career_name = val.label;
      } else {
        this.individual.career_name = val;
      }
    },
  },
  mounted() {
    this.getUpdate();
    this.getCareer_group();
  },
  created() {
    this.url_api = getRestApiUrl(this.$store) + "/careers";
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

