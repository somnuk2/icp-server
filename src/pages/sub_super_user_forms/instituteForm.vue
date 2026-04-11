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
                      <!-- สถาบัน -->
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-input color="white" bg-color="blue-5" standout bottom-slots v-model="individual.institute_name"
                          label="สถาบันการศึกษา *" clearable :rules="[
                            (val) =>
                              (val && val.length > 0) ||
                              'ต้องใส่สถาบันการศึกษา',
                          ]">
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                        </q-input>
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
                      <q-table title="ข้อมูลสถาบัน" :rows="individuals1" :columns="columns" row-key="name"
                        :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        table-header-style="height: 65px; " table-header-class="bg-blue-5"
                        :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home" icon-last-page="all_inclusive"
                        icon-next-page="arrow_right" icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                          return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                        }">
                        <template v-slot:top-right="props">
                          <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาข้อมูลสถาบัน">
                            <template v-slot:append>
                              <q-icon name="search" />
                            </template>
                          </q-input>
                          <!-- ส่งออกไฟล์ -->
                          <q-input borderless dense debounce="300" v-model="file_export" placeholder="ชื่อไฟล์นำออก"
                            outlined class="q-mx-sm">
                            <template v-slot:append>
                              <q-icon name="save" />
                            </template>
                          </q-input>
                          <q-btn flat icon-right="archive" label="ส่งออก excel" @click="exportTable()" />
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
                            <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.institute_id)" no-caps></q-btn>
                            <q-btn color="red" label="ลบ" @click="
                              deleteUser(
                                props.row.institute_id,
                                props.row.institute_name
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
import { getRestApiUrl } from "../../utils/apiConfig.js";

// ส่งออกไฟล์ excel
function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

export default {
  name: "InstituteFormSuperUser",
  data() {
    return {
      file_export: "",
      title: "ข้อมูลสถาบัน(ผู้ดูแลกลุ่ม)",
      btnLabel: "เพิ่มข้อมูล",
      individual: {
        institute_id: "",
        institute_name: "",
      },
      isEdit: false,
      visibleColumns: ref(["actions", "institute_name"]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        {
          name: "institute_name",
          align: "left",
          label: "สถาบัน",
          field: "institute_name",
          sortable: true,
        },
      ],
      filter: ref(""),
      loading: ref(false),
      individuals1: [],
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

      const status = exportFile(this.file_export || "institute_report.csv", "\ufeff" + content, {
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
      this.individual.institute_id = "";
      this.individual.institute_name = "";
    },

    async submitForm() {
      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({
        title: "ยืนยัน",
        message: message,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          const payload = {
            institute_name: this.individual.institute_name,
          };

          if (!this.isEdit) {
            await axios.post(`${getRestApiUrl(this.$store)}/institutes`, payload);
            this.$q.notify({ message: "บันทึกข้อมูลเรียบร้อยแล้ว", color: "positive" });
          } else {
            await axios.put(`${getRestApiUrl(this.$store)}/institutes/${this.individual.institute_id}`, payload);
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

    async editUser(institute_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/institutes`);
        const item = res.data.find(i => i.institute_id === institute_id);
        if (item) {
          this.individual.institute_id = item.institute_id;
          this.individual.institute_name = item.institute_name;
        }
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      }
    },

    async deleteUser(institute_id, institute_name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [ ${institute_name} ] หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${getRestApiUrl(this.$store)}/institutes/${institute_id}`);
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
        const res = await axios.get(`${getRestApiUrl(this.$store)}/institutes`);
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      } finally {
        this.loading = false;
      }
    },

    nextItem(event) {
      if (event.keyCode == 13) {
        // Handle enter key if needed
      }
    }
  },
  mounted() {
    this.getUpdate();
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
