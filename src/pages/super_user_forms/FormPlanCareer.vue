<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="items-center justify-center" style="background: linear-gradient(135deg, #74c588 0%, #0ad13c 100%); min-height: 100vh;">
        <div class="full-width">
          <div class="col-md-10 offset-md-1 col-xs-12 q-pa-xs">
            <q-card flat class="bg-white text-black">
              <q-card-section class="bg-blue-14">
                <h4 class="text-h5 text-white q-my-xs text-center">
                  {{ title }}
                </h4>
              </q-card-section>
              <div class="row">
                <div class="col-md-12 col-xs-12 q-pa-xs">
                  <q-form @submit.prevent="submitForm" @reset="resetForm" method="post" class="q-gutter-md">
                    <!-- รายชื่อ -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterMember" color="blue-3" v-model="member"
                          :options="members.options" label="ชื่อ-สกุล *" stack-label>
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:selected>
                            ชื่อ-สกุล:
                            <q-chip v-if="member" dense square color="white" text-color="primary" class="q-pa-xs">
                              {{
                                member.label != ""
                                  ? member.label +
                                  " (" +
                                  member.description +
                                  ")"
                                  : ""
                              }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>
                          <template v-if="member" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="onMember((member = null))"
                              class="cursor-pointer" />
                          </template>
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section avatar>
                                <q-icon :name="scope.opt.icon" />
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
                    <div class="row">
                      <!-- อาชีพเป้าหมาย -->
                      <div class="col-md-5 col-xs-12 q-pa-xs">
                        <q-select @filter="filterCareer" color="blue-5" v-model="planCareer" use-input
                          input-debounce="0" :options="career.options" label="อาชีพเป้าหมาย *"
                          @update:model-value="onCareer_plan(planCareer)">
                          <template v-slot:prepend>
                            <q-icon name="work_history" />
                          </template>
                          <template v-slot:no-option>
                            <q-item>
                              <q-item-section class="text-grey">
                                ค้นหาไม่พบ
                              </q-item-section>
                            </q-item>
                          </template>
                          <template v-if="planCareer" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="
                              onCareer_plan((planCareer = null))
                              " class="cursor-pointer" />
                          </template>
                        </q-select>
                      </div>
                      <!-- กลุ่มอาชีพ -->
                      <div class="col-md-4 col-xs-12 q-pa-xs">
                        <q-input standout bottom-slots filled v-model="plan_career.ca_group_name" label="กลุ่มอาชีพ"
                          clearable>
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                      <!-- วันเริ่มแผน -->
                      <div class="col-md-3 col-xs-12 q-pa-xs">
                        <q-input filled v-model="plan_career.start_date" label="วันเริ่มแผน" mask="##/##/####" fill-mask
                          hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn clearable>
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="plan_career.start_date" mask="DD/MM/YYYY">
                                  <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                </q-date>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <div class="row">
                      <!-- ปุ่มควบคุม -->
                      <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                        <!-- บันทึก -->
                        <q-btn :label="btnLabel" type="submit" color="primary" icon="save" />
                        <!-- ยกเลิก -->
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" icon="clear" />
                        <!-- ออก -->
                        <q-btn icon="logout" label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                        <!-- กลับฟอร์มกรอกข้อมูลส่วนตัว -->
                        <q-btn color="primary" no-caps flat icon="skip_previous" label="กลับฟอร์มกรอกข้อมูลส่วนตัว"
                          to="/SuserFormComponent">
                          <q-tooltip class="bg-accent">กลับฟอร์มกรอกข้อมูลส่วนตัว</q-tooltip>
                        </q-btn>
                        <!-- ไปฟอร์มกำหนดคุณสมบัติ/ทักษะ -->
                        <q-btn color="primary" no-caps flat icon="skip_next" label="ไปฟอร์มกำหนดคุณสมบัติ/ทักษะ"
                          to="/SuserFormQualification">
                          <q-tooltip class="bg-accent">ไปฟอร์มกำหนดคุณสมบัติ/ทักษะ</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <!-- Section 2: Report Export Tools -->
                    <div class="row q-mt-sm q-mb-md">
                      <div class="col-12">
                        <q-card flat bordered class="bg-green-1">
                          <q-item class="bg-green-2">
                            <q-item-section avatar>
                              <q-icon name="file_download_done" color="green-10" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-bold text-green-10 text-subtitle1">เครื่องมือส่งออกรายงาน
                                (Excel)</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-card-section class="q-py-md">
                            <div class="row q-col-gutter-md items-center">
                              <!-- Export Filename -->
                              <div class="col-md-6 col-xs-12">
                                <q-input dense outlined bg-color="white" v-model="file_export"
                                  placeholder="ตั้งชื่อไฟล์รายงาน">
                                  <template v-slot:prepend>
                                    <q-icon name="drive_file_rename_outline" color="green" />
                                  </template>
                                </q-input>
                              </div>
                              <!-- Export Button -->
                              <div class="col-md-6 col-xs-12 text-center">
                                <q-btn flat color="black" icon="download" label="ส่งออก excel" @click="exportTable()" class="full-width q-py-xs" />
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <div class="q-pa-xs">
                          <q-table title="ข้อมูลสมาชิก" :rows="plan_careers1" :columns="columns"
                            row-key="plan_career_id" :filter="filter" :loading="loading"
                            selection="multiple" v-model:selected="selected"
                            :visible-columns="visibleColumns" separator="cell" class="my-sticky-header-table" flat bordered table-header-style="height: 65px; "
                            table-header-class="bg-blue-5" :rows-per-page-options="[30, 50, 100, 0]"
                            icon-first-page="home" icon-last-page="all_inclusive" icon-next-page="arrow_right"
                            icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                              return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                            }">
                            <template v-slot:top-right="props">
                              <div class="row q-gutter-sm items-center">
                                <q-btn v-if="selected.length > 0" flat color="red" icon="delete"
                                  :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />

                                <q-input borderless dense debounce="300" v-model="filter"
                                    placeholder="ค้นหาอาชีพเป้าหมาย">
                                    <template v-slot:append>
                                      <q-icon name="search" />
                                    </template>
                                  </q-input>
                                <q-select v-model="visibleColumns" multiple outlined dense options-dense
                                  :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                                  option-value="name" options-cover style="min-width: 150px" bg-color="white" />
                                <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                  @click="props.toggleFullscreen" />
                              </div>
                            </template>
                            <template v-slot:body-cell-actions="props">
                              <q-td :props="props">
                                <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.plan_career_id)"
                                  no-caps></q-btn>
                                <q-btn color="red" label="ลบ" @click="
                                  deleteUser(
                                    props.row.plan_career_id,
                                    props.row.career_name
                                  )
                                  " no-caps></q-btn>
                              </q-td>
                            </template>
                          </q-table>
                        </div>
                      </div>
                    </div>
                  </q-form>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useQuasar } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
// ส่งออกไฟล์ excel

export default {
  name: "FormPlanCareerSuperUser",
  data() {
    return {
      file_export: "",
      title: "อาชีพเป้าหมาย(ผู้ดูแลกลุ่ม)",
      btnLabel: "เพิ่มข้อมูล",
      plan_career: {
        plan_career_id: "", member_id: this.$store.getters.myMember_id, career_id: "", start_date: "", ca_group_name: "",
      },
      career: { options: [] },
      career_: { options: [] },
      isEdit: false,
      visibleColumns: ref(["actions", "full_name", "career_name", "ca_group_name", "start_date"]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        { name: "status", label: "บทบาท", align: "center", field: "status", sortable: true },
        { name: "full_name", label: "ชื่อ-สกุล", align: "left", field: "full_name", sortable: true },
        { name: "career_name", label: "อาชีพ", align: "left", field: "career_name", sortable: true },
        { name: "ca_group_name", label: "กลุ่มอาชีพ", align: "left", field: "ca_group_name", sortable: true },
        { name: "start_date", label: "วันเริ่มแผน", align: "center", field: "start_date", sortable: true },
      ],
      plan_careers1: [],
      loading: true,
      filter: ref(""),
      $q: useQuasar(),
      members: { options: [] },
      members_: { options: [] },
      member: ref({ label: "", value: "", description: "" }),
      planCareer: ref({ label: "", value: "", ca_group_name: "" }),
      selected: ref([]),
    };
  },
  methods: {
    async exportTable() {
      const rows = this.selected.length > 0 ? this.selected : this.plan_careers1;
      if (!rows || rows.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูลในตาราง', icon: 'warning' });
        return;
      }
      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plan Careers');
        worksheet.addRow(this.columns.filter(c => c.name !== 'actions').map(c => c.label));
        rows.forEach(row => {
          worksheet.addRow(this.columns.filter(c => c.name !== 'actions').map(c => row[c.field] || '-'));
        });
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Plan_Careers_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
        this.$q.loading.hide();
        this.$q.notify({ color: 'positive', message: 'ส่งออกสำเร็จ' });
      } catch (error) {
        this.$q.loading.hide();
        this.$q.notify({ color: 'negative', message: 'Error: ' + error.message });
      }
    },
    yearToDay(day) {
      if (!day) return "";
      const parts = day.split("/");
      return parts[2] + "/" + parts[1] + "/" + parts[0];
    },
    dayToYear(day) {
      if (!day || day === "0000/00/00") return "00/00/0000";
      const parts = day.split("/");
      return parts[2] + "/" + parts[1] + "/" + parts[0];
    },
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.plan_career = { plan_career_id: "", member_id: this.$store.getters.myMember_id, career_id: "", start_date: "", ca_group_name: "" };
      this.planCareer = { label: "", value: "", ca_group_name: "" };
      this.member = { label: "", value: "", description: "" };
    },
    async getCareer() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/careers`);
        this.career.options = res.data.filter(i => i.career_name && i.career_name.trim()).map(i => ({
          label: i.career_name, value: i.career_id, ca_group_name: i.ca_group_name
        }));
        this.career_.options = this.career.options;
      } catch (error) { console.error(error); }
    },
    async submitForm() {
      const start_date = this.yearToDay(this.plan_career.start_date);
      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message: message, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            const payload = { member_id: this.member.value, career_id: this.planCareer.value, start_date };
            if (!this.isEdit) {
              await axios.post(`${getRestApiUrl(this.$store)}/plan-careers`, payload);
            } else {
              await axios.put(`${getRestApiUrl(this.$store)}/plan-careers/${this.plan_career.plan_career_id}`, payload);
            }
            this.$q.notify({ message: "สำเร็จ", color: "positive" });
            this.resetForm();
            this.getUpdate();
          } catch (error) {
            this.$q.notify({ message: "Error: " + (error.response?.data?.error || error.message), color: "negative" });
          }
        });
    },
    async editUser(id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers/${id}`);
        const data = res.data;
        this.plan_career = { ...data, start_date: this.dayToYear(data.start_date) };
        this.member = { label: data.full_name, value: data.member_id, description: data.status };
        this.planCareer = { label: data.career_name, value: data.career_id, ca_group_name: data.ca_group_name };
      } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
    },
    async deleteUser(id, name) {
      try {
        // Check dependencies
        const resCheck = await axios.post(`${getRestApiUrl(this.$store)}/plan-careers/check-dependencies`, {
          plan_career_id: id,
          type: 'single'
        });

        const hasDeps = resCheck.data.has_dependencies;
        const depCount = resCheck.data.count;

        if (hasDeps) {
          this.$q.dialog({
            title: "ไม่สามารถลบได้",
            message: `ไม่สามารถลบอาชีพ "${name}" ได้ เนื่องจากตรวจพบข้อมูลคุณสมบัติ/ทักษะที่เกี่ยวข้อง ${depCount} รายการ\n\nกรุณาลบข้อมูลคุณสมบัติที่เกี่ยวข้องออกให้หมดก่อนทำการลบอาชีพนี้`,
            ok: { label: 'รับทราบ', color: 'primary' }
          });
          return;
        }

        this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบอาชีพเป้าหมายของ [ ${name} ] หรือไม่ ?`, cancel: true, persistent: true })
          .onOk(async () => {
            try {
              await axios.delete(`${getRestApiUrl(this.$store)}/plan-careers/${id}`);
              this.$q.notify({ message: "ลบสำเร็จ", color: "positive" });
              this.selected = this.selected.filter(item => item.plan_career_id !== id);
              this.getUpdate();
            } catch (error) {
              this.$q.notify({ message: "Error: " + error.message, color: "negative" });
            }
          });
      } catch (error) {
        console.error("Dependency check failed:", error);
        this.$q.notify({ type: "negative", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
      }
    },

    deleteSelected() {
      if (this.selected.length === 0) return;

      this.$q.dialog({
        title: "ยืนยันการลบหลายรายการ",
        message: `คุณต้องการลบข้อมูลที่เลือกทั้งหมด ${this.selected.length} รายการหรือไม่?\n(ระบบจะข้ามรายการที่มีข้อมูลเชื่อมโยงอยู่)`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        this.$q.loading.show({ message: "กำลังลบข้อมูลที่เลือก...", spinnerColor: "red" });
        let successCount = 0;
        let failCount = 0;
        try {
          for (const item of this.selected) {
            try {
              // Check dependencies first
              const resCheck = await axios.post(`${getRestApiUrl(this.$store)}/plan-careers/check-dependencies`, {
                plan_career_id: item.plan_career_id,
                type: 'single'
              });

              if (!resCheck.data.has_dependencies) {
                await axios.delete(`${getRestApiUrl(this.$store)}/plan-careers/${item.plan_career_id}`);
                successCount++;
              } else {
                failCount++;
              }
            } catch (err) {
              console.error(`Failed to delete ID ${item.plan_career_id}:`, err);
              failCount++;
            }
          }

          if (successCount > 0) {
            this.$q.notify({ message: `ลบสำเร็จ ${successCount} รายการ`, color: "positive", icon: "check_circle" });
          }
          if (failCount > 0) {
            this.$q.notify({ message: `ไม่สามารถลบได้ ${failCount} รายการเนื่องจากมีข้อมูลเชื่อมโยง`, color: "warning", icon: "warning" });
          }

          this.selected = [];
          this.resetForm();
          await this.getUpdate();
        } catch (error) {
          console.error(error);
          this.$q.notify({ message: "เกิดข้อผิดพลาดในการลบข้อมูล", color: "negative", icon: "error" });
        } finally {
          this.$q.loading.hide();
        }
      });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers-super`);
        this.plan_careers1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) { console.error(error); }
      finally { this.loading = false; }
    },
    async getMember() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`);
        this.members.options = res.data.map(i => ({ label: i.full_name, value: i.member_id, description: i.status }));
        this.members_.options = this.members.options;
      } catch (error) { console.error(error); }
    },
    async createValue(career_name, done) {
      done(career_name, "add-unique");
      this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการเพิ่มอาชีพ [${career_name}] ใช่ใหม?`, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            await axios.post(`${getRestApiUrl(this.$store)}/careers`, { career_name, member_id: this.plan_career.member_id });
            this.getCareer();
          } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
        });
    },
    filterCareer(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.career.options = this.career_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    onMember(member) {
      if (!member) this.member = { label: "", value: "", description: "" };
    },
    onCareer_plan(planCareer) {
      if (planCareer) {
        this.plan_career.ca_group_name = planCareer.ca_group_name;
      } else {
        this.planCareer = { label: "", value: "", ca_group_name: "" };
        this.plan_career.ca_group_name = "";
      }
    },
  },
  mounted() {
    this.getMember();
    this.getUpdate();
    this.getCareer();
  },
};
</script>

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
