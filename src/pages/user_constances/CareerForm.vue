<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container style="background: linear-gradient(#74c588, #0ad13c); min-height: 100vh;">
      <q-page class="q-pa-none">

        <div class="bg-blue-14 q-py-md shadow-2 full-width">
          <h4 class="text-h5 text-white q-my-none text-center text-weight-bold">
            {{ title }}
          </h4>
        </div>

        <div class="content-area q-pa-md">

          <q-card flat class="bg-white q-pa-lg q-mb-md shadow-2 full-width shadow-up-1" style="border-radius: 8px;">
            <q-form @submit.prevent="submitForm" @reset="resetForm">
              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-xs-12">
                  <q-select v-model="qualification_" outlined dense filled label="คุณสมบัติ/ทักษะ *"
                    :options="qualification.options" @filter="filterQualification" bg-color="white">
                    <template v-slot:prepend><q-icon name="assignment" /></template>
                  </q-select>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-select v-model="qualification_group_" outlined dense filled label="กลุ่มคุณสมบัติ/ทักษะ *"
                    :options="qualification_group.options" @filter="filterQualificationGroup" bg-color="white">
                    <template v-slot:prepend><q-icon name="category" /></template>
                  </q-select>
                </div>
              </div>

              <div class="row justify-center q-gutter-x-md q-mt-md">
                <q-btn :label="btnLabel" type="submit" color="primary" icon="save" unelevated />
                <q-btn label="ยกเลิก" type="reset" color="grey-7" flat icon="close" />
                <q-btn label="ออก" color="red" flat icon="logout" to="/" />
              </div>
            </q-form>
          </q-card>

          <div class="full-width">
            <q-table :rows="individuals1" :columns="columns" row-key="qualification_id" :filter="filter"
              :loading="loading" separator="cell" class="custom-green-table full-width shadow-2"
              :rows-per-page-options="[10, 20, 50, 0]">
              <template v-slot:top>
                <div class="full-width row q-col-gutter-sm items-center">
                  <div class="col-grow">
                    <q-input dense outlined filled v-model="filter" placeholder="ค้นหา..." bg-color="white">
                      <template v-slot:append><q-icon name="search" /></template>
                    </q-input>
                  </div>
                  <div class="col-md-3 col-xs-12">
                    <q-input dense outlined filled v-model="file_export" placeholder="ชื่อไฟล์นำออก" bg-color="white">
                      <template v-slot:append><q-icon name="save" /></template>
                    </q-input>
                  </div>
                  <div class="col-auto">
                    <q-btn flat color="green-7" icon="download" label="ส่งออก excel" @click="exportTable" />
                  </div>
                  <div class="col-auto">
                    <q-select v-model="visibleColumns" multiple outlined dense filled bg-color="white"
                      :display-value="'คอลัมน์'" emit-value map-options :options="columns" option-value="name"
                      style="min-width: 100px" />
                  </div>
                </div>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props" class="bg-blue-2">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold text-black">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" class="table-row-dark-green">
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

        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import { exportFile, useQuasar, is } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig.js";

// Helper สำหรับ Export CSV
function wrapCsvValue(val) {
  let formatted = val === void 0 || val === null ? "" : String(val);
  return `"${formatted.split('"').join('""')}"`;
}

export default {
  name: "QualificationManager",
  data() {
    return {
      title: "จัดการคุณสมบัติ/ทักษะ",
      btnLabel: "เพิ่มข้อมูล",
      isEdit: false,
      loading: false,
      filter: "",
      file_export: "",
      url_api: "",

      individuals1: [],
      individual: {
        qualification_id: "",
        qualification_name: "",
        qualification_group_id: ""
      },

      qualification_group_: null,
      qualification_group: { options: [] },
      qualification_groups_master: [],

      qualification_: null,
      qualification: { options: [] },
      qualifications_master: [],

      visibleColumns: ["actions", "qualification_name", "qualification_group_name"],
      columns: [
        { name: "actions", align: "center", label: "จัดการ" },
        { name: "qualification_name", align: "left", label: "คุณสมบัติ/ทักษะ", field: "qualification_name", sortable: true },
        { name: "qualification_group_name", align: "left", label: "กลุ่มคุณสมบัติ", field: "qualification_group_name", sortable: true }
      ],
      $q: useQuasar()
    };
  },

  methods: {
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(this.url_api + "/list");
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
        // สร้างรายการสำหรับ Auto-complete
        this.qualifications_master = this.individuals1.map(item => ({
          label: item.qualification_name,
          value: item.qualification_id
        }));
        this.qualification.options = this.qualifications_master;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    async getQualification_group() {
      try {
        const res = await axios.get(getRestApiUrl(this.$store) + "/qualification-groups");
        const mapped = (res.data || []).map(item => ({
          label: item.qualification_group_name,
          value: item.qualification_group_id,
          description: item.qualification_group_description,
          icon: 'category'
        }));
        this.qualification_group.options = mapped;
        this.qualification_groups_master = mapped;
      } catch (e) {
        console.error(e);
      }
    },

    submitForm() {
      if (!this.qualification_group_) {
        this.$q.notify({ color: "warning", message: "กรุณาเลือกกลุ่ม" });
        return;
      }

      const payload = {
        qualification_name: this.individual.qualification_name,
        qualification_group_id: this.qualification_group_.value
      };

      this.$q.dialog({
        title: 'ยืนยัน',
        message: `คุณต้องการ ${this.isEdit ? 'แก้ไข' : 'บันทึก'} ข้อมูลใช่หรือไม่?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          if (this.isEdit) {
            await axios.put(`${this.url_api}/${this.individual.qualification_id}`, payload);
          } else {
            await axios.post(this.url_api, payload);
          }
          this.$q.notify({ color: "positive", message: "ทำรายการสำเร็จ" });
          this.resetForm();
          this.getUpdate();
        } catch (e) {
          this.$q.notify({ color: "negative", message: "เกิดข้อผิดพลาด" });
        }
      });
    },

    async editUser(id) {
      try {
        const res = await axios.get(`${this.url_api}/${id}`);
        this.isEdit = true;
        this.btnLabel = "ตกลงแก้ไข";
        this.individual.qualification_id = res.data.qualification_id;
        this.individual.qualification_name = res.data.qualification_name;

        this.qualification_ = { label: res.data.qualification_name, value: res.data.qualification_id };
        this.qualification_group_ = { label: res.data.qualification_group_name, value: res.data.qualification_group_id };

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error(e);
      }
    },

    deleteUser(id, name) {
      this.$q.dialog({
        title: 'คำเตือน',
        message: `ลบข้อมูล [ ${name} ] ?`,
        cancel: true,
        color: 'negative'
      }).onOk(async () => {
        try {
          await axios.delete(`${this.url_api}/${id}`);
          this.$q.notify({ color: "positive", message: "ลบข้อมูลสำเร็จ" });
          this.getUpdate();
        } catch (e) {
          this.$q.notify({ color: "negative", message: "ลบไม่สำเร็จ" });
        }
      });
    },

    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.individual = { qualification_id: "", qualification_name: "" };
      this.qualification_ = null;
      this.qualification_group_ = null;
    },

    filterQualificationGroup(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.qualification_group.options = this.qualification_groups_master.filter(v => v.label.toLowerCase().includes(needle));
      });
    },

    filterQualification(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.qualification.options = this.qualifications_master.filter(v => v.label.toLowerCase().includes(needle));
      });
    },

    createValue(val, done) {
      if (val.length > 0) {
        this.individual.qualification_name = val;
        done({ label: val }, "add-unique");
      }
    },

    updateValue(val) {
      this.individual.qualification_name = is.object(val) ? val.label : val;
    },

    exportTable() {
      const content = [this.columns.map(col => wrapCsvValue(col.label))]
        .concat(this.individuals1.map(row => this.columns.map(col => wrapCsvValue(row[col.field || col.name])).join(",")))
        .join("\r\n");

      exportFile(this.file_export || 'qualifications.csv', "\ufeff" + content, "text/csv");
    }
  },

  mounted() {
    this.getUpdate();
    this.getQualification_group();
  },

  created() {
    this.url_api = getRestApiUrl(this.$store) + "/qualifications";
  }
};
</script>

<style lang="sass">
.content-area
  background-color: #c8e6c9 // สีเขียวอ่อนที่ cover ทั้งหน้าจอ
  min-height: calc(100vh - 80px)

.custom-green-table
  border-radius: 4px

  thead tr th
    background-color: #bbdefb // สีฟ้าอ่อนตามตัวอย่าง
    font-size: 14px

  .table-row-dark-green
    background-color: #4caf50 !important // สีเขียวเข้ม
    color: white !important

    &:nth-child(even)
      background-color: #43a047 !important // สลับสีเขียวเข้มขึ้น

    .q-td
      border-color: rgba(255, 255, 255, 0.2) !important

/* จำกัดความสูงตารางไม่ให้เกินหน้าจอและให้เกิด scroll ภายใน */
.q-table__container
  max-height: 60vh
</style>
