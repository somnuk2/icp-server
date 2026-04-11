<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div>
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
                      <div class="row">
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-select v-model="qualification_" use-input use-chips input-debounce="0"
                            @new-value="createValue" @update:model-value="(val) => updateValue(val)"
                            :options="qualification.options" @filter="filterQualification" label="คุณสมบัติ/ทักษะ *"
                            stack-label lazy-rules>
                            <template v-slot:prepend>
                              <q-icon name="pending_actions" />
                            </template>
                            <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                  <q-icon :name="scope.opt.icon || 'star'" />
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
                          <q-select v-model="qualification_group_" use-input use-chips input-debounce="0"
                            :options="qualification_group.options" @filter="filterQualificationGroup"
                            label="กลุ่มคุณสมบัติ/ทักษะ *" stack-label lazy-rules>
                            <template v-slot:prepend>
                              <q-icon name="pending_actions" />
                            </template>
                            <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                  <q-icon :name="scope.opt.icon || 'category'" />
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
                      <q-table title="คุณสมบัติ/ทักษะ" :rows="individuals1" :columns="columns" row-key="qualification_id"
                        :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        table-header-style="height: 65px; " table-header-class="bg-blue-5"
                        :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home" icon-last-page="all_inclusive"
                        icon-next-page="arrow_right" icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                          return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                        }">
                        <template v-slot:top-right="props">
                          <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาคุณสมบัติ/ทักษะ">
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
                            <q-btn color="blue" label="แก้ไข" @click="editUser(props.row)"
                              no-caps></q-btn>
                            <q-btn color="red" label="ลบ" @click="
                              deleteUser(
                                props.row.qualification_id,
                                props.row.qualification_name
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
import { useQuasar, exportFile, is } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig.js";

// ส่งออกไฟล์ excel
function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

export default {
  name: "QualificationForm",
  data() {
    return {
      file_export: "",
      url_api: "",
      title: "คุณสมบัติ/ทักษะ(ผู้ดูแลระบบ)",
      btnLabel: "เพิ่มข้อมูล",
      individual: {
        qualification_id: "",
        qualification_name: "",
        qualification_group_id: "",
      },
      isEdit: false,
      visibleColumns: ref([
        "actions",
        "qualification_id",
        "qualification_name",
        "qualification_group_name",
      ]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        {
          name: "qualification_id",
          align: "center",
          label: "รหัส",
          field: "qualification_id",
          sortable: true,
        },
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
          label: "กลุ่มคุณสมบัติ/ทักษะ",
          field: "qualification_group_name",
          sortable: true,
        },
      ],
      filter: ref(""),
      loading: ref(false),
      individuals1: [],
      qualification_group: {
        options: [],
      },
      qualification_groups: {
        options: [],
      },
      qualification_group_: ref(null),
      qualification: {
        options: [],
      },
      qualifications: {
        options: [],
      },
      qualification_: ref(null),
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

      const status = exportFile(this.file_export || 'qualifications.csv', "\ufeff" + content, {
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
      this.individual.qualification_id = "";
      this.individual.qualification_name = "";
      this.qualification_group_ = null;
      this.qualification_ = null;
    },
    async submitForm() {
      if (!this.qualification_group_) {
        this.$q.notify({ color: "warning", message: "กรุณาเลือกกลุ่มคุณสมบัติ" });
        return;
      }
      const data = {
        qualification_name: this.individual.qualification_name,
        qualification_group_id: this.qualification_group_.value,
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
            await axios.put(`${this.url_api}/${this.individual.qualification_id}`, data);
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
      this.individual.qualification_id = row.qualification_id;
      this.individual.qualification_name = row.qualification_name;
      this.qualification_ = {
        value: row.qualification_id,
        label: row.qualification_name,
      };
      this.qualification_group_ = {
        value: row.qualification_group_id,
        label: row.qualification_group_name,
      };
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
        const res = await axios.get(this.url_api + "/list");
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
        this.getQualificationList();
      } catch (error) {
        console.error(error);
        this.$q.notify({ color: "negative", message: "โหลดข้อมูลคุณสมบัติไม่สำเร็จ" });
      } finally {
        this.loading = false;
      }
    },
    getQualification_group() {
      axios.get(getRestApiUrl(this.$store) + "/qualification-groups").then((res) => {
        this.qualification_group.options = res.data.map(item => ({
          label: item.qualification_group_name,
          value: item.qualification_group_id,
          description: item.qualification_group_description
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
    getQualificationList() {
      const uniqueNames = [...new Set(this.individuals1.map(i => i.qualification_name))];
      this.qualification.options = uniqueNames.map(name => ({ label: name }));
      this.qualifications.options = this.qualification.options;
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

