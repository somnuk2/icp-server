<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div>
        <q-page padding class="items-center justify-center bg-grey-2">
          <div class="full-width">
            <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
              <q-card flat class="bg-white text-black">
                <q-card-section class="bg-primary">
                  <h4 class="text-h5 text-white q-my-xs text-center">
                    {{ title }}
                  </h4>
                </q-card-section>
                <div class="q-pa-md">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <q-form @submit.prevent="submitForm()" @reset="resetForm()" method="post" class="q-gutter-md">
                      <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs">
                          <q-input standout="bg-primary text-white" bottom-slots
                            v-model="individual.development_name" label="ชนิดการพัฒนา *" clearable :rules="[
                              (val) =>
                                (val && val.length > 0) || 'ต้องใส่ชนิดการพัฒนา',
                            ]">
                            <template v-slot:prepend>
                              <q-icon name="category" />
                            </template>
                            <template v-slot:append>
                              <q-icon name="star" />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <!-- ปุ่มควบคุม -->
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
                      <q-table title="ชนิดการพัฒนา" :rows="individuals1" :columns="columns" row-key="development_id"
                        :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        table-header-style="height: 65px; " table-header-class="bg-primary text-white"
                        :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home" icon-last-page="all_inclusive"
                        icon-next-page="arrow_right" icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                          return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                        }">
                        <template v-slot:top-right="props">
                          <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาชนิดการพัฒนา">
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
                            <q-btn color="blue" label="แก้ไข" @click="editUser(props.row)" no-caps></q-btn>
                            <q-btn color="red" label="ลบ" @click="
                              deleteUser(
                                props.row.development_id,
                                props.row.development_name
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
import { useQuasar, exportFile } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig.js";

// ส่งออกไฟล์ excel
function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

export default {
  name: "DevelopmentForm",
  data() {
    return {
      file_export: "",
      url_api: "",
      title: "ชนิดการพัฒนา(ผู้ดูแลระบบ)",
      btnLabel: "เพิ่มข้อมูล",
      individual: {
        development_id: "",
        development_name: "",
      },
      isEdit: false,
      visibleColumns: ref(["actions", "development_id", "development_name"]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        {
          name: "development_id",
          align: "center",
          label: "รหัส",
          field: (row) => row.development_id,
          format: (val) => `${val}`,
          required: true,
          sortable: true,
        },
        {
          name: "development_name",
          align: "left",
          label: "ชนิดการพัฒนา",
          field: "development_name",
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

      const status = exportFile(this.file_export || 'developments.csv', "\ufeff" + content, {
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
      this.individual.development_id = "";
      this.individual.development_name = "";
    },
    async submitForm() {
      const data = {
        development_name: this.individual.development_name,
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
            await axios.put(`${this.url_api}/${this.individual.development_id}`, data);
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
      this.individual.development_id = row.development_id;
      this.individual.development_name = row.development_name;
    },
    deleteUser(id, name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [ ${id} - ${name} ] หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${this.url_api}/${id}`);
          this.$q.notify({ color: "positive", message: "ลบข้อมูลเสร็จสิ้น" });
          await this.getUpdate();
        } catch (error) {
          console.error(error);
          this.$q.notify({
            color: "negative",
            message: "เกิดข้อผิดพลาดในการลบข้อมูล: " + (error.response?.data?.message || error.message)
          });
        }
      });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(this.url_api);
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error(error);
        this.$q.notify({ color: "negative", message: "โหลดข้อมูลไม่สำเร็จ" });
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.getUpdate();
  },
  created() {
    this.url_api = getRestApiUrl(this.$store) + "/development";
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
