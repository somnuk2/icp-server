<template>
  <q-card style="min-width: 80vw; max-width: 95vw;">
    <q-card-section class="bg-blue-14 row items-center q-pb-none">
      <div class="text-h6 text-white">{{ title }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup text-color="white" />
    </q-card-section>

    <q-card-section class="q-pa-md">
      <div class="col-md-12 col-xs-12 q-pa-xs">
        <q-form @submit.prevent="submitForm()" @reset="resetForm()" method="post" class="q-gutter-md">
          <!-- สถาบัน -->
          <div class="col-md-12 col-xs-12 q-pa-xs">
            <q-input color="white" bg-color="blue-5" standout bottom-slots v-model="individual.institute_name"
              label="สถาบันการศึกษา *" clearable :rules="[
                (val) => (val && val.length > 0) || 'ต้องใส่สถาบันการศึกษา',
              ]">
              <template v-slot:prepend>
                <q-icon name="school" />
              </template>
              <template v-slot:append>
                <q-icon name="favorite" />
              </template>
            </q-input>
          </div>
          <!-- ปุ่มตวบคุม -->
          <div class="row">
            <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
              <q-btn :label="btnLabel" type="submit" color="primary" icon="save" />
              <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" icon="clear" />
            </div>
          </div>
        </q-form>
      </div>

      <div class="row q-mt-md">
        <div class="col-md-12 col-xs-12 q-pa-xs">
          <q-table title="ข้อมูลสถาบัน" :rows="individuals1" :columns="columns" row-key="name" :filter="filter"
            :loading="loading" :visible-columns="visibleColumns" separator="cell" table-header-style="height: 65px; "
            table-header-class="bg-blue-5" :rows-per-page-options="[10, 20, 50, 0]" icon-first-page="home"
            icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left">
            <template v-slot:top-right="props">
              <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาข้อมูลสถาบัน">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-btn flat icon-right="archive" label="ส่งออก" @click="exportTable()" class="q-ml-sm" />
              <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen" class="q-ml-md" />
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.institute_id)" no-caps dense flat
                  icon="edit"></q-btn>
                <q-btn color="red" label="ลบ" @click="deleteUser(props.row.institute_id, props.row.institute_name)"
                  no-caps dense flat icon="delete"></q-btn>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useQuasar, exportFile } from "quasar";
import { getRestApiUrl } from "src/utils/apiConfig.js";

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

export default {
  name: "InstituteFormDialog",
  data() {
    return {
      apiUrl: "",
      file_export: "ข้อมูลสถาบัน",
      title: "จัดการข้อมูลสถาบัน",
      btnLabel: "เพิ่มข้อมูล",
      individual: { institute_id: "", institute_name: "" },
      isEdit: false,
      visibleColumns: ref(["actions", "institute_name"]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        { name: "institute_name", align: "left", label: "สถาบัน", field: "institute_name", sortable: true },
      ],
      filter: ref(""),
      loading: ref(false),
      individuals1: [],
      $q: useQuasar(),
    };
  },
  methods: {
    authHeaders() {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    exportTable() {
      const content = [this.columns.map((col) => wrapCsvValue(col.label))]
        .concat(this.individuals1.map((row) =>
          this.columns.map((col) =>
            wrapCsvValue(typeof col.field === "function" ? col.field(row) : row[col.field === void 0 ? col.name : col.field], col.format, row)
          ).join(",")
        )).join("\r\n");
      exportFile(this.file_export + ".csv", "\ufeff" + content, { encoding: "utf-8", mimeType: "text/csv;charset=utf-8;" });
    },
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.individual.institute_id = "";
      this.individual.institute_name = "";
    },
    submitForm() {
      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message, cancel: true, persistent: true }).onOk(async () => {
        try {
          if (this.isEdit) {
            await axios.put(`${this.apiUrl}/institutes/${this.individual.institute_id}`,
              { institute_name: this.individual.institute_name },
              { headers: this.authHeaders() });
          } else {
            await axios.post(`${this.apiUrl}/institutes`,
              { institute_name: this.individual.institute_name },
              { headers: this.authHeaders() });
          }
          this.getUpdate();
          this.resetForm();
          this.$emit("updated");
        } catch (err) {
          console.error("Submit error:", err);
          this.$q.dialog({ title: "ข้อผิดพลาด", message: err.response?.data?.error || "เกิดข้อผิดพลาด" });
        }
      });
    },
    async editUser(id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${this.apiUrl}/institutes/${id}`, { headers: this.authHeaders() });
        this.individual.institute_id = res.data.institute_id;
        this.individual.institute_name = res.data.institute_name;
      } catch (err) { console.error("Edit error:", err); }
    },
    deleteUser(id, name) {
      this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบ [ ${id}-${name} ] หรือไม่ ?`, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            await axios.delete(`${this.apiUrl}/institutes/${id}`, { headers: this.authHeaders() });
            this.getUpdate();
            this.$emit("updated");
          } catch (err) { console.error("Delete error:", err); }
        });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(`${this.apiUrl}/institutes`, { headers: this.authHeaders() });
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
      } catch (err) { console.error("Get institutes error:", err); }
      finally { this.loading = false; }
    },
  },
  created() { this.apiUrl = getRestApiUrl(this.$store); },
  mounted() { this.getUpdate(); },
};
</script>
