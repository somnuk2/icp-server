<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container style="background: linear-gradient(#74c588, #0ad13c); min-height: 100vh;">
      <div @keyup="nextItem">
        <q-page class="q-pa-none">

          <div class="bg-blue-14 q-py-md shadow-2 full-width">
            <h4 class="text-h5 text-white q-my-none text-center text-weight-bold">
              {{ title }}
            </h4>
          </div>

          <div class="content-area q-pa-md">

            <q-card flat class="bg-white q-pa-lg q-mb-md shadow-2 full-width" style="border-radius: 8px;">
              <q-form @submit.prevent="submitForm()" @reset="resetForm()" method="post">
                <div class="row q-col-gutter-md">
                  <div class="col-md-6 col-xs-12">
                    <q-select v-model="qualification_" use-input use-chips outlined dense filled
                      label="คุณสมบัติ/ทักษะ *" :options="qualification.options" @filter="filterQualification"
                      @new-value="createValue" @update:model-value="(val) => updateValue(val)" bg-color="white">
                      <template v-slot:prepend><q-icon name="pending_actions" /></template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar><q-icon :name="scope.opt.icon" /></q-item-section>
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                            <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-md-6 col-xs-12">
                    <q-select v-model="qualification_group_" use-input use-chips outlined dense filled
                      label="กลุ่มคุณสมบัติ/ทักษะ *" :options="qualification_group.options"
                      @filter="filterQualificationGroup" bg-color="white">
                      <template v-slot:prepend><q-icon name="pending_actions" /></template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar><q-icon :name="scope.opt.icon" /></q-item-section>
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                            <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                </div>

                <div class="row justify-center q-gutter-x-md q-mt-md">
                  <q-btn :label="btnLabel" type="submit" color="primary" icon="save" unelevated />
                  <q-btn label="ยกเลิก" type="reset" color="grey-7" flat icon="clear" />
                  <q-btn label="ออก" color="red" flat icon="logout" to="/" />
                </div>
              </q-form>
            </q-card>

            <q-table :rows="individuals1" :columns="columns" row-key="qualification_id" :filter="filter"
              :loading="loading" :visible-columns="visibleColumns" separator="cell"
              class="custom-green-table shadow-2 full-width" :rows-per-page-options="[10, 30, 50, 0]"
              :pagination-label="(first, end, total) => `หน้า : ${end}/${total}`" selection="multiple" v-model:selected="selected">
              <template v-slot:top>
                <div class="full-width row q-col-gutter-sm items-center">
                  <div class="col-grow row q-gutter-sm items-center">
                    <q-btn v-if="selected.length > 0" flat color="red" icon="delete"
                      :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />
                    <q-input dense outlined filled v-model="filter" placeholder="ค้นหาคุณสมบัติ/ทักษะ..." bg-color="white"
                      class="col">
                      <template v-slot:append><q-icon name="search" /></template>
                    </q-input>
                  </div>
                  <div class="col-md-3 col-xs-12">
                    <q-input dense outlined filled v-model="file_export" placeholder="ชื่อไฟล์นำออก" bg-color="white">
                      <template v-slot:append><q-icon name="save" /></template>
                    </q-input>
                  </div>
                  <div class="col-auto">
                    <q-btn flat color="black" icon="download" label="ส่งออก excel" @click="exportTable()" />
                  </div>
                  <div class="col-auto">
                    <q-select v-model="visibleColumns" multiple outlined dense filled bg-color="white"
                      :display-value="'คอลัมน์'" emit-value map-options :options="columns" option-value="name"
                      style="min-width: 120px" />
                  </div>
                </div>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props" class="bg-blue-3">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-black text-weight-bold"
                    style="font-size: 14px">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" class="table-row-green">
                  <q-td key="actions" :props="props" class="text-center">
                    <q-btn size="sm" color="blue" label="แก้ไข" icon="edit" class="q-mr-xs"
                      @click="editUser(props.row.qualification_id)" />
                    <q-btn size="sm" color="red" label="ลบ" icon="delete"
                      @click="deleteUser(props.row.qualification_id, props.row.qualification_name)" />
                  </q-td>
                  <q-td key="qualification_name" :props="props">
                    {{ props.row.qualification_name }}
                  </q-td>
                  <q-td key="qualification_group_name" :props="props">
                    {{ props.row.qualification_group_name }}
                  </q-td>
                </q-tr>
              </template>
            </q-table>

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
  components: {},
  data() {
    return {
      file_export: "",
      url_api: "",
      title: "คุณสมบัติ/ทักษะ(ผู้ใช้ระบบ)",
      btnLabel: "เพิ่มข้อมูล",
      individual: {
        qualification_id: "",
        qualification_name: "",
        qualification_group_id: "",
        qualification_group_name: "",
      },
      isEdit: false,
      visibleColumns: ref([
        "actions",
        "qualification_id",
        "qualification_name",
        "qualification_group_id",
        "qualification_group_name",
      ]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        {
          name: "qualification_name",
          align: "left",
          label: "คุณสมบัติ/ทักษะ",
          field: "qualification_name",
          sortable: true,
        },
        {
          name: "qualification_group_name",
          align: "left",
          label: "กลุ่มอาชีพ",
          field: "qualification_group_name",
          sortable: true,
        },
      ],
      filter: ref(""),
      loading: ref(false),
      individuals1: [],
      qualification_group: { options: [] },
      qualification_groups: { options: [] },
      qualification_group_: ref(null),
      qualification: { options: [] },
      qualifications: { options: [] },
      qualification_: ref(null),
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
        const worksheet = workbook.addWorksheet('Qualifications');

        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        worksheet.mergeCells('A1:C1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลคุณสมบัติ/ทักษะ (User Constance) - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        const headerRow = worksheet.getRow(2);
        headerRow.values = ['รหัส', 'กลุ่มคุณสมบัติ', 'คุณสมบัติ/ทักษะ'];
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
            row.qualification_id,
            row.qualification_group_name || '-',
            row.qualification_name || '-'
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
        const filename = (this.file_export || "Qualifications_Report").replace(/\.xlsx$/i, '') + '.xlsx';
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
      this.individual.qualification_id = "";
      this.individual.qualification_name = "";
      this.qualification_group_ = null;
      this.qualification_ = null;
    },
    submitForm() {
      if (!this.qualification_group_) {
        this.$q.notify({ color: "warning", message: "กรุณาเลือกกลุ่มคุณสมบัติ" });
        return;
      }
      const data = {
        qualification_name: this.individual.qualification_name,
        qualification_group_id: this.qualification_group_.value,
      };

      if (!this.isEdit) {
        this.$q.dialog({
          title: "ยืนยัน",
          message: "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?",
          cancel: true,
          persistent: true,
        }).onOk(() => {
          axios.post(this.url_api, data).then((res) => {
            this.$q.notify({ color: "positive", message: "บันทึกข้อมูลเสร็จสิ้น" });
            this.getUpdate();
            this.resetForm();
          }).catch((error) => {
            console.error(error);
            this.$q.notify({ color: "negative", message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
          });
        });
      } else {
        this.$q.dialog({
          title: "ยืนยัน",
          message: "คุณต้องการบันทึกการเแก้ไขข้อมูลหรือไม่?",
          cancel: true,
          persistent: true,
        }).onOk(() => {
          axios.put(`${this.url_api}/${this.individual.qualification_id}`, data).then((response) => {
            this.$q.notify({ color: "positive", message: "แก้ไขข้อมูลเสร็จสิ้น" });
            this.isEdit = false;
            this.btnLabel = "เพิ่มข้อมูล";
            this.getUpdate();
            this.resetForm();
          }).catch((error) => {
            console.error(error);
            this.$q.notify({ color: "negative", message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" });
          });
        });
      }
    },
    editUser(qualification_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      axios.get(`${this.url_api}/${qualification_id}`).then((response) => {
        this.individual.qualification_id = response.data.qualification_id;
        this.individual.qualification_name = response.data.qualification_name;
        this.qualification_ = {
          value: response.data.qualification_id,
          label: response.data.qualification_name,
        };
        this.qualification_group_ = {
          value: response.data.qualification_group_id,
          label: response.data.qualification_group_name,
        };
      }).catch((error) => {
        console.error(error);
      });
    },
    deleteUser(id, name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [ ${id} - ${name} ] หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        axios.delete(`${this.url_api}/${id}`)
          .then((response) => {
            this.$q.notify({ color: "positive", message: "ลบข้อมูลเสร็จสิ้น" });
            this.getUpdate();
          }).catch((error) => {
            console.error(error);
            this.$q.notify({ color: "negative", message: "เกิดข้อผิดพลาดในการลบข้อมูล" });
          });
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
              await axios.delete(`${this.url_api}/${item.qualification_id}`);
              successCount++;
            } catch (err) {
              console.error(`Failed to delete ID ${item.qualification_id}:`, err);
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
    getUpdate() {
      this.loading = true;
      axios.get(this.url_api + "/list").then((res) => {
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
        this.getQualification();
      }).finally(() => {
        this.loading = false;
      });
    },
    getQualification_group() {
      axios.get(getRestApiUrl(this.$store) + "/qualification-groups").then((res) => {
        this.qualification_group.options = res.data.map((item) => ({
          label: item.qualification_group_name,
          value: item.qualification_group_id,
          description: item.qualification_group_description,
        }));
        this.qualification_groups.options = this.qualification_group.options;
      });
    },
    filterQualificationGroup(val, update) {
      if (val === "") {
        update(() => {
          this.qualification_group.options = this.qualification_groups.options;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.qualification_group.options = this.qualification_groups.options.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    getQualification() {
      axios.get(this.url_api + "/list").then((res) => {
        this.qualification.options = res.data.map((item) => ({
          label: item.qualification_name,
          value: item.qualification_id,
        }));
        this.qualifications.options = this.qualification.options;
      });
    },
    filterQualification(val, update) {
      if (val === "") {
        update(() => {
          this.qualification.options = this.qualifications.options;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.qualification.options = this.qualifications.options.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    createValue(val, done) {
      if (val.length > 0) {
        if (!this.qualifications.options.find(o => o.label === val)) {
          this.individual.qualification_name = val;
          done({ label: val }, "add-unique");
        }
      }
    },
    updateValue(val) {
      if (is.object(val)) {
        this.individual.qualification_name = val.label;
      } else {
        this.individual.qualification_name = val;
      }
    },
  },
  mounted() {
    this.getUpdate();
    this.getQualification_group();
  },
  created() {
    this.url_api = getRestApiUrl(this.$store) + "/qualifications";
  },
};
</script>

<style lang="sass">
.content-area
  background-color: #c8e6c9 // สีเขียวอ่อนที่ cover ทั้งหน้าจอใต้แถบน้ำเงิน
  min-height: calc(100vh - 80px)

.custom-green-table
  border-radius: 4px

  thead tr th
    position: sticky
    z-index: 1
    background-color: #bbdefb !important

  .table-row-green
    background-color: #4caf50 !important // สีเขียวเข้มตามตัวอย่าง
    color: white !important

    &:nth-child(even)
      background-color: #43a047 !important // สลับสีเขียวเข้มขึ้น

    .q-td
      border-color: rgba(255, 255, 255, 0.2) !important

.q-table__container
  max-height: 65vh // จำกัดความสูงตารางเพื่อให้เกิด scroll ภายใน
</style>
