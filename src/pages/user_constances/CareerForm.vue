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

          <q-card flat class="bg-white q-pa-lg q-mb-md shadow-2 full-width" style="border-radius: 8px;">
            <q-form @submit.prevent="submitForm" @reset="resetForm">
              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-xs-12">
                  <q-select v-model="career_" outlined dense filled label="อาชีพ *"
                    use-input use-chips input-debounce="0"
                    :options="career.options" @filter="filterCareer" bg-color="white"
                    @new-value="createValue" @update:model-value="(val) => updateValue(val)">
                    <template v-slot:prepend><q-icon name="work" /></template>
                  </q-select>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-select v-model="career_group_" outlined dense filled label="กลุ่มอาชีพ *"
                    :options="career_group.options" @filter="filterCareerGroup" bg-color="white">
                    <template v-slot:prepend><q-icon name="category" /></template>
                  </q-select>
                </div>
              </div>

              <div class="row justify-center q-gutter-x-md q-mt-md">
                <q-btn :label="btnLabel" type="submit" color="primary" unelevated />
                <q-btn label="ยกเลิก" type="reset" color="grey-7" flat />
                <q-btn size="sm" color="red" label="ลบ" unelevated no-caps  /></div>
            </q-form>
          </q-card>

          <div class="full-width">
            <q-table :rows="individuals1" :columns="columns" row-key="career_id" :filter="filter"
              :loading="loading" separator="cell" class="custom-green-table full-width shadow-2"
              :rows-per-page-options="[10, 20, 50, 0]" selection="multiple" v-model:selected="selected"
              :pagination-label="(first, end, total) => `หน้า : ${end}/${total}`">
              <template v-slot:top>
                <div class="full-width row q-col-gutter-sm items-center">
                  <div class="col-grow row q-gutter-sm items-center">
                    <q-btn v-if="selected.length > 0" flat color="red" :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />
                    <q-input dense outlined filled v-model="filter" placeholder="ค้นหาอาชีพ..." bg-color="white" class="col">
                      <template v-slot:append><q-icon name="search" /></template>
                    </q-input>
                  </div>
                  <div class="col-md-3 col-xs-12">
                    <q-input dense outlined filled v-model="file_export" placeholder="ชื่อไฟล์นำออก" bg-color="white">
                      <template v-slot:append><q-icon name="save" /></template>
                    </q-input>
                  </div>
                  <div class="col-auto">
                    <q-btn flat color="black" label="ส่งออก excel" @click="exportTable" />
                  </div>
                  <div class="col-auto">
                    <q-select v-model="visibleColumns" multiple outlined dense filled bg-color="white"
                      :display-value="'คอลัมน์'" emit-value map-options :options="columns" option-value="name"
                      style="min-width: 100px" />
                  </div>
                </div>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props" class="bg-blue-3">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold text-black" style="font-size: 14px">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" class="table-row-green">
                  <q-td key="actions" :props="props" class="text-center">
                    <q-btn size="sm" color="blue" label="แก้ไข" unelevated no-caps @click="editUser(props.row)" /><q-btn size="sm" color="red" label="ลบ" unelevated no-caps @click="deleteUser(props.row.career_id, props.row.career_name)" />
                  </q-td>
                  <q-td key="career_name" :props="props">
                    {{ props.row.career_name }}
                  </q-td>
                  <q-td key="ca_group_name" :props="props">
                    {{ props.row.ca_group_name }}
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
import { useQuasar, is } from "quasar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl } from "../../utils/apiConfig.js";

export default {
  name: "CareerManager",
  data() {
    return {
      title: "จัดการอาชีพ (Personal)",
      btnLabel: "เพิ่มข้อมูล",
      isEdit: false,
      loading: false,
      filter: "",
      file_export: "",
      url_api: "",

      individuals1: [],
      individual: {
        career_id: "",
        career_name: "",
        career_group_id: ""
      },

      career_group_: null,
      career_group: { options: [] },
      career_groups_master: [],

      career_: null,
      career: { options: [] },
      careers_master: [],

      selected: [],
      visibleColumns: ["actions", "career_name", "ca_group_name"],
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ", style: "width: 170px;", headerStyle: "width: 170px;" },
        { name: "career_name", align: "left", label: "อาชีพ", field: "career_name", sortable: true },
        { name: "ca_group_name", align: "left", label: "กลุ่มอาชีพ", field: "ca_group_name", sortable: true }
      ],
      $q: useQuasar()
    };
  },

  methods: {
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(this.url_api);
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
        this.getCareerList();
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    getCareerList() {
      const uniqueNames = [...new Set(this.individuals1.map(i => i.career_name))];
      this.careers_master = uniqueNames.map(name => ({ label: name }));
      this.career.options = this.careers_master;
    },

    async getCareer_group() {
      try {
        const res = await axios.get(getRestApiUrl(this.$store) + "/careers/groups");
        const mapped = (res.data || []).map(item => ({
          label: item.ca_group_name,
          value: item.career_group_id,
          description: item.ca_group_description
        }));
        this.career_group.options = mapped;
        this.career_groups_master = mapped;
      } catch (e) {
        console.error(e);
      }
    },

    submitForm() {
      if (!this.career_group_) {
        this.$q.notify({ color: "warning", message: "กรุณาเลือกกลุ่ม" });
        return;
      }

      const payload = {
        career_name: this.individual.career_name,
        career_group_id: this.career_group_.value
      };

      this.$q.dialog({
        title: 'ยืนยัน',
        message: `คุณต้องการ ${this.isEdit ? 'แก้ไข' : 'บันทึก'} ข้อมูลใช่หรือไม่?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          if (this.isEdit) {
            await axios.put(`${this.url_api}/${this.individual.career_id}`, payload);
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

    editUser(row) {
      this.isEdit = true;
      this.btnLabel = "ตกลงแก้ไข";
      this.individual.career_id = row.career_id;
      this.individual.career_name = row.career_name;

      this.career_ = { label: row.career_name, value: row.career_id };
      this.career_group_ = { label: row.ca_group_name, value: row.career_group_id };

      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    deleteSelected() {
      if (this.selected.length === 0) return;
      this.$q.dialog({
        title: "ยืนยันการลบหลายรายการ",
        message: `คุณต้องการลบข้อมูลที่เลือกทั้งหมด ${this.selected.length} รายการหรือไม่?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        this.$q.loading.show({ message: "กำลังลบข้อมูลที่เลือก..." });
        try {
          for (const item of this.selected) {
            await axios.delete(`${this.url_api}/${item.career_id}`);
          }
          this.$q.notify({ message: `ลบสำเร็จ ${this.selected.length} รายการ`, color: "positive" });
          this.selected = [];
          this.getUpdate();
        } catch (err) {
          this.$q.notify({ message: "ลบไม่สำเร็จบางรายการ", color: "negative" });
        } finally {
          this.$q.loading.hide();
        }
      });
    },

    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.individual = { career_id: "", career_name: "" };
      this.career_ = null;
      this.career_group_ = null;
    },

    filterCareerGroup(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.career_group.options = this.career_groups_master.filter(v => v.label.toLowerCase().includes(needle));
      });
    },

    filterCareer(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.career.options = this.careers_master.filter(v => v.label.toLowerCase().includes(needle));
      });
    },

    createValue(val, done) {
      if (val.length > 0) {
        this.individual.career_name = val;
        done({ label: val }, "add-unique");
      }
    },

    updateValue(val) {
      this.individual.career_name = is.object(val) ? val.label : val;
    },

    async exportTable() {
      if (!this.individuals1 || this.individuals1.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูล', icon: 'warning' });
        return;
      }
      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Careers');
        worksheet.addRow(['รหัส', 'อาชีพ', 'กลุ่มอาชีพ']);
        const rows = this.selected.length > 0 ? this.selected : this.individuals1;
        rows.forEach(row => {
          worksheet.addRow([row.career_id, row.career_name, row.ca_group_name]);
        });
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), (this.file_export || 'Careers') + '.xlsx');
        this.$q.notify({ color: 'positive', message: 'ส่งออกสำเร็จ' });
      } catch (err) {
        this.$q.notify({ color: 'negative', message: 'ส่งออกล้มเหลว' });
      } finally {
        this.$q.loading.hide();
      }
    }
  },

  mounted() {
    this.getUpdate();
    this.getCareer_group();
  },

  created() {
    this.url_api = getRestApiUrl(this.$store) + "/careers";
  }
};
</script>

<style lang="sass">
.content-area
  background-color: #c8e6c9
  min-height: calc(100vh - 80px)

.custom-green-table
  border-radius: 4px
  thead tr th
    background-color: #bbdefb !important
    font-size: 14px
  .table-row-green
    background-color: #4caf50 !important
    color: white !important
    &:nth-child(even)
      background-color: #43a047 !important
    .q-td
      border-color: rgba(255, 255, 255, 0.2) !important

.q-table__container
  max-height: 60vh
</style>
