<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="items-center justify-center bg-grey-2" style="min-height: 100vh;">
        <div class="full-width">
          <div class="col-md-10 offset-md-1 col-xs-12 q-pa-xs">
            <q-card flat class="bg-white text-black">
              <q-card-section class="bg-primary">
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
                        <q-select use-input @filter="filterMember" color="primary" v-model="member"
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
                        <q-select @filter="filterCareer" color="primary" v-model="planCareer" use-input
                          :options="career.options" label="อาชีพเป้าหมาย *"
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
                        <q-input standout="bg-primary text-white" bottom-slots filled v-model="plan_career.ca_group_name" label="กลุ่มอาชีพ"
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
                        <q-btn :label="btnLabel" type="submit" color="primary" />
                        <!-- ยกเลิก -->
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" />
                        <!-- ออก -->
                        <q-btn label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                        <!-- กลับฟอร์มกรอกข้อมูลส่วนตัว -->
                        <q-btn color="primary" no-caps flat label="กลับฟอร์มกรอกข้อมูลส่วนตัว"
                          to="/AdminFormComponent">
                          <q-tooltip class="bg-accent">กลับฟอร์มกรอกข้อมูลส่วนตัว</q-tooltip>
                        </q-btn>
                        <!-- ไปฟอร์มกำหนดคุณสมบัติ/ทักษะ -->
                        <q-btn color="primary" no-caps flat label="ไปฟอร์มกำหนดคุณสมบัติ/ทักษะ"
                          to="/AdminFormQualification">
                          <q-tooltip class="bg-accent">ไปฟอร์มกำหนดคุณสมบัติ/ทักษะ</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <div class="q-pa-xs">
                          <q-table title="ข้อมูลอาชีพเป้าหมาย" :rows="plan_careers1" :columns="columns"
                            row-key="plan_career_id" :filter="filter" :loading="loading"
                            selection="multiple" v-model:selected="selected"
                            :visible-columns="visibleColumns" separator="cell" table-header-style="height: 65px; "
                            table-header-class="bg-primary text-white" :rows-per-page-options="[30, 50, 100, 0]"
                            icon-first-page="home" icon-last-page="all_inclusive" icon-next-page="arrow_right"
                            icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                              return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                            }">
                              <template v-slot:top-right="props">
                                <div class="row q-gutter-sm items-center">
                                  <q-btn v-if="selected.length > 0" flat color="red" :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />

                                  <q-input dense debounce="300" v-model="filter" placeholder="ค้นหาอาชีพเป้าหมาย..."
                                    outlined bg-color="white">
                                    <template v-slot:append>
                                      <q-icon name="search" />
                                    </template>
                                  </q-input>

                                 <!-- ส่งออก excel -->
                                 <q-input dense debounce="300" v-model="file_export" placeholder="ชื่อไฟล์นำออก"
                                   outlined bg-color="white" style="width: 150px;">
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
                                <q-btn size="sm" color="blue" label="แก้ไข" unelevated no-caps @click="editUser(props.row.plan_career_id)" />
                                <q-btn size="sm" color="red" label="ลบ" unelevated no-caps @click="
                                  deleteUser(
                                    props.row.plan_career_id,
                                    props.row.career_name
                                  )
                                  " />
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

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl } from "../../utils/apiConfig.js";
// ส่งออกไฟล์ excel

export default {
  name: "FormPlanCareerAdmin",
  data() {
    return {
      file_export: "",
      message: "Form Plan Career",
      title: "อาชีพเป้าหมาย(ผู้ดูแลระบบ)",
      plan_careers: Array,
      emp_id: Array,
      plan_careers_: Array,
      careers: Array,
      btnLabel: "เพิ่มข้อมูล",

      plan_career: {
        plan_career_id: "",
        member_id: this.$store.getters.myMember_id,
        career_id: "",
        start_date: "",
        full_name: "",
        ca_group_name: "",
      },
      status: "บันทึก",
      career_: {
        options: [],
      },
      career: {
        options: [],
      },
      visibleColumns: ref([
        "actions",
        "plan_career_id",
        "member_id",
        "status",
        "full_name",
        "career_id",
        "career_name",
        "ca_group_name",
        "start_date",
      ]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ", style: "width: 170px;", headerStyle: "width: 170px;" },
        // {
        //   name: "plan_career_id",
        //   label: "รหัสแผนอาชีพ",
        //   align: "center",
        //   field: (row) => row.plan_career_id,
        //   format: (val) => `${val}`,
        //   required: true,
        //   sortable: true,
        // },
        {
          name: "status",
          label: "บทบาท",
          align: "center",
          field: "status",
          sortable: true,
        },
        {
          name: "full_name",
          label: "ชื่อ-สกุล",
          align: "left",
          field: "full_name",
          sortable: true,
        },
        {
          name: "career_name",
          label: "อาชีพ",
          align: "left",
          field: "career_name",
          sortable: true,
        },
        {
          name: "ca_group_name",
          label: "กลุ่มอาชีพ",
          align: "left",
          field: "ca_group_name",
          sortable: true,
        },
        {
          name: "start_date",
          label: "วันเริ่มแผน",
          align: "center",
          field: "start_date",
          sortable: true,
        },
      ],
      plan_careers1: [],
      loading: true,
      filter: ref(""),
      $q: useQuasar(),
      members: {
        options: [],
      },
      members_: {
        options: [],
      },
      member: ref({
        label: "",
        value: "",
        description: "",
      }),
      planCareer: ref({
        label: "",
        value: "",
        description: "",
      }),
      selected: ref([]),
    };
  },
  methods: {
    // นำออกไฟล์ excel
    async exportTable() {
      const rows = this.selected.length > 0 ? this.selected : this.plan_careers1;
      if (!rows || rows.length === 0) {
        this.$q.notify({
          color: 'orange',
          message: 'ไม่พบข้อมูลในตาราง',
          icon: 'warning'
        });
        return;
      }

      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plan Careers');

        // Styles
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        const groupFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        // 1. Title
        worksheet.mergeCells('A1:E1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลอาชีพเป้าหมาย (Admin View) - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        // 2. Header
        const headerRow = worksheet.getRow(2);
        headerRow.values = [
          'ชื่อ-สกุล',
          'บทบาท',
          'อาชีพเป้าหมาย',
          'กลุ่มอาชีพ',
          'วันเริ่มแผน'
        ];
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = border;
        });

        // 3. Data Processing (Group by Member)
        const sortedRows = [...rows].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

        let currentMember = null;
        let zebra = false;

        sortedRows.forEach(row => {
          if (row.full_name !== currentMember) {
            currentMember = row.full_name;
            const groupRow = worksheet.addRow([currentMember, '', '', '', '']);
            worksheet.mergeCells(`A${groupRow.number}:E${groupRow.number}`);
            groupRow.eachCell(cell => {
              cell.fill = groupFill;
              cell.font = { name: 'Sarabun', size: 10, bold: true, italic: true };
              cell.border = border;
              cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            });
            zebra = false;
          }

          const r = worksheet.addRow([
            '', // Name placeholder
            row.status || '-',
            row.career_name || '-',
            row.ca_group_name || '-',
            row.start_date || '-'
          ]);

          r.eachCell((cell, colNum) => {
            cell.font = dataFont;
            cell.border = border;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            if (zebra) cell.fill = zebraFill;
          });
          zebra = !zebra;
        });

        // 4. Column Widths
        worksheet.columns = [
          { key: 'A', width: 25 }, // Name
          { key: 'B', width: 15 }, // Status
          { key: 'C', width: 25 }, // Career
          { key: 'D', width: 20 }, // Group
          { key: 'E', width: 15 }  // Start Date
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "PlanCareer_Admin_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);

        this.$q.loading.hide();
        this.$q.notify({ color: 'positive', message: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว', icon: 'check' });

      } catch (error) {
        this.$q.loading.hide();
        console.error("Export error:", error);
        this.$q.notify({ color: 'negative', message: 'ส่งออกไม่สำเร็จ: ' + error.message, icon: 'error' });
      }
    },
    //---------------------------------------
    yearToDay(day_to_year) {
      var year_to_day = day_to_year.split("/");
      return year_to_day[2] + "/" + year_to_day[1] + "/" + year_to_day[0];
    },
    dayToYear(year_to_day) {
      if (typeof year_to_day == "undefined") year_to_day = "0000/00/00";
      var day_to_year = year_to_day.split("/");
      return day_to_year[2] + "/" + day_to_year[1] + "/" + day_to_year[0];
    },
    resetForm() {
      this.isEdit = false;
      console.log("isEdit:", this.isEdit);
      this.btnLabel = "เพิ่มข้อมูล";
      console.log("ยกเลิก");
      this.plan_career.start_date = "";
      this.planCareer = null;
      this.member = null;
      this.plan_career.ca_group_name = "";
    },
    async getCareer() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/careers`);
        this.careers = res.data;
        const validData = res.data.filter(item => item.career_name && item.career_name.trim() !== "");
        this.career.options = validData.map(item => ({
          label: item.career_name,
          value: item.career_id,
          description: item.ca_group_name,
        }));
        this.career_.options = [...this.career.options];
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "เกิดข้อผิดพลาดในการโหลดข้อมูลอาชีพ: " + error.message, color: "negative" });
      }
    },
    async submitForm() {
      const start_date = this.yearToDay(this.plan_career.start_date);
      const title = "ยืนยัน";
      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";

      this.$q.dialog({ title, message, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            const payload = {
              member_id: this.member.value,
              career_id: this.planCareer.value,
              plan_career_date: start_date,
            };
            if (!this.isEdit) {
              await axios.post(`${getRestApiUrl(this.$store)}/plan-careers`, payload);
              this.$q.notify({ message: "เพิ่มข้อมูลสำเร็จ", color: "positive" });
            } else {
              await axios.put(`${getRestApiUrl(this.$store)}/plan-careers/${this.plan_career.plan_career_id}`, payload);
              this.$q.notify({ message: "แก้ไขข้อมูลสำเร็จ", color: "positive" });
            }
            this.resetForm();
            await this.getUpdate();
          } catch (error) {
            this.$q.notify({ message: "Error: " + (error.response?.data?.error || error.message), color: "negative" });
          }
        });
    },
    async editUser(plan_career_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const response = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers/${plan_career_id}`);
        const data = response.data;
        this.plan_career.plan_career_id = data.plan_career_id;
        this.plan_career.start_date = this.dayToYear(data.plan_career_date || data.start_date);
        this.plan_career.ca_group_name = data.ca_group_name;
        this.member = { value: data.member_id, label: data.full_name, description: data.status };
        this.planCareer = { value: data.career_id, label: data.career_name, description: data.ca_group_name };
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      }
    },
    async deleteUser(plan_career_id, career_name) {
      try {
        // Check dependencies
        const resCheck = await axios.post(`${getRestApiUrl(this.$store)}/plan-careers/check-dependencies`, {
          plan_career_id: plan_career_id,
          type: 'single'
        });

        const hasDeps = resCheck.data.has_dependencies;
        const depCount = resCheck.data.count;

        if (hasDeps) {
          this.$q.dialog({
            title: "ไม่สามารถลบได้",
            message: `ไม่สามารถลบอาชีพ "${career_name}" ได้ เนื่องจากตรวจพบข้อมูลคุณสมบัติ/ทักษะที่เกี่ยวข้อง ${depCount} รายการ\n\nกรุณาลบข้อมูลคุณสมบัติที่เกี่ยวข้องออกให้หมดก่อนทำการลบอาชีพนี้`,
            ok: { label: 'รับทราบ', color: 'primary' }
          });
          return;
        }

        this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบ [${career_name}] หรือไม่ ?`, cancel: true, persistent: true })
          .onOk(async () => {
            try {
              await axios.delete(`${getRestApiUrl(this.$store)}/plan-careers/${plan_career_id}`);
              this.$q.notify({ message: "ลบข้อมูลสำเร็จ", color: "positive" });
              this.selected = this.selected.filter(item => item.plan_career_id !== plan_career_id);
              await this.getUpdate();
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
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers`);
        this.plan_careers1 = res.data.map(row => ({
          ...row,
          start_date: row.plan_career_date || row.start_date
        }));
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      } finally {
        this.loading = false;
      }
    },
    async getMember() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`);
        this.members.options = res.data.map((item) => ({
          label: item.full_name,
          value: item.member_id,
          description: item.status,
        }));
        this.members_.options = [...this.members.options];
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async getMemberId() {
      const memId = parseInt(this.$store.getters.myMember_id);
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members/${memId}/individual`);
        this.emp_id = res.data;
        this.plan_career.member_id = res.data.member_id;
      } catch (error) {
        console.error(error);
      }
    },
    async createValue(career_name, done) {
      done(career_name, "add-unique");
      this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการเพิ่มอาชีพ [${career_name}] ใช่ใหม?`, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            await axios.post(`${getRestApiUrl(this.$store)}/careers`, { career_name });
            await this.getCareer();
            this.$q.notify({ message: "เพิ่มอาชีพสำเร็จ", color: "positive" });
          } catch (error) {
            this.$q.notify({ message: "Error: " + error.message, color: "negative" });
          }
        });
    },
    filterCareer(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.career.options = this.career_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    onMember(member) {
      if (!member)
        this.member = ref({
          label: "",
          value: "",
          description: "",
        });
    },
    onCareer_plan(planCareer) {
      if (planCareer) {
        this.plan_career.ca_group_name = planCareer.description;
        console.log("ca_plan_group:", planCareer);
      } else {
        this.plan_career.ca_group_name = "";
        console.log("ca_plan_group:", planCareer);
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
