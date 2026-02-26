<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="items-center justify-center" style="background: linear-gradient(#74c588, #0ad13c)">
        <div class="full-width">
          <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
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
                          :options="members.options" label="ชื่อ-สกุล *" stack-label
                          @update:model-value="(val) => onMemberNames(val)">
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
                    <!-- อาชีพเป้าหมาย + คุณสมบัติ-->
                    <div class="row">
                      <!-- แผนอาชีพ -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterPlan_career" color="blue-3" v-model="plan_career"
                          :options="plan_careers.options" label="อาชีพเป้าหมาย *" stack-label
                          @update:model-value="onPlan_career(plan_career)">
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:selected>
                            อาชีพ:
                            <q-chip v-if="plan_career" dense square color="white" text-color="primary" class="q-pa-xs">
                              {{
                                plan_career.label != ""
                                  ? plan_career.label +
                                  " (" +
                                  plan_career.description +
                                  ")"
                                  : ""
                              }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>
                          <template v-if="plan_career" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="
                              onPlan_career((plan_career = null))
                              " class="cursor-pointer" />
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
                      <!-- กลุ่มอาชีพ -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-input standout bottom-slots filled v-model="ca_group_name" label="กลุ่มอาชีพ" clearable>
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                      <!-- คุณสมบัติ -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterQualification" color="blue-3" v-model="qualification"
                          :options="qualifications.options" label="คุณสมบัติ/ทักษะ *" stack-label
                          @update:model-value="onQaualification(qualification)">
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:selected>
                            คุณสมบัติ:
                            <q-chip v-if="qualification" dense square color="white" text-color="primary"
                              class="q-pa-xs">
                              {{
                                qualification.label != ""
                                  ? qualification.label
                                  : ""
                              }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>
                          <template v-if="qualification" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="
                              onQaualification((qualification = null))
                              " class="cursor-pointer" />
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
                      <!-- กลุ่มคุณสมบัติ -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-input standout bottom-slots filled v-model="qualification_group_name" label="กลุ่มคุณสมบัติ"
                          clearable>
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <!-- ค่าเป้าหมาย + ระดับความสำคัญ-->
                    <div class="row">
                      <!-- ค่าเป้าหมาย -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select @filter="filterTarget" use-input color="blue-3" v-model="target.options.value"
                          :options="target.options" label="ค่าเป้าหมาย *" emit-value map-options>
                          <template v-slot:prepend>
                            <q-icon name="flag_circle" />
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
                          <template v-if="target.options.value" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="target.options.value = null"
                              class="cursor-pointer" />
                          </template>
                        </q-select>
                      </div>
                      <!-- ระดับความสำคัญ -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select @filter="filterLevel" use-input color="blue-3" v-model="level.options.value"
                          :options="level.options" label="ระดับความสำคัญ *" emit-value map-options>
                          <template v-slot:prepend>
                            <q-icon name="running_with_errors" />
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
                          <template v-if="level.options.value" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="level.options.value = null"
                              class="cursor-pointer" />
                          </template>
                        </q-select>
                      </div>
                    </div>
                    <div class="row">
                      <!-- ปุ่มควบคุม -->
                      <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                        <!-- บันทึก/แก้ไข -->
                        <q-btn :label="btnLabel" type="submit" color="primary" icon="save" />
                        <!-- ยกเลิก -->
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" icon="clear" />
                        <!-- ออก -->
                        <q-btn icon="logout" label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                        <!-- ย้อนกลับ -->
                        <q-btn color="primary" no-caps flat icon="skip_previous" label="กลับฟอร์มกำหนดอาชีพเป้าหมาย"
                          to="/AdminFormPlanCareer">
                          <q-tooltip class="bg-accent">กลับฟอร์มกำหนดอาชีพเป้าหมาย</q-tooltip>
                        </q-btn>
                        <!-- ไปข้างหน้า -->
                        <q-btn color="primary" no-caps flat icon="skip_next" label="ไปฟอร์มการพัฒนาตนเอง"
                          to="/AdminFormPlan">
                          <q-tooltip class="bg-accent">ไปฟอร์มการพัฒนาตนเอง</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <div class="q-pa-xs">
                          <q-table title="ข้อมูลคุณสมบัติ/ทักษะ" :rows="qualifications1" :columns="columns"
                            row-key="skill" :filter="filter" :loading="loading" :visible-columns="visibleColumns"
                            separator="cell" table-header-style="height: 65px; " table-header-class="bg-blue-5"
                            :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home"
                            icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                            :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                              return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                            }" selection="multiple" v-model:selected="selectedRows">
                            <template v-slot:top-left>
                              <q-btn :disable="selectedRows.length === 0" color="red" icon="delete_sweep"
                                label="ลบทั้งหมดที่เลือก" @click="deleteSelected" />
                            </template>
                            <template v-slot:top-right="props">
                              <div class="row">
                                <div class="col-md-4 col-xs-5 q-pa-xs">
                                  <q-input borderless dense debounce="300" v-model="filter"
                                    placeholder="ค้นหาคุณสมบัติ">
                                    <template v-slot:append>
                                      <q-icon name="search" />
                                    </template>
                                  </q-input>
                                </div>
                                <!-- ส่งออก excel -->
                                <div class="col-md-3 col-xs-6 q-pa-xs">
                                  <q-input borderless dense debounce="300" v-model="file_export"
                                    placeholder="ชื่อไฟล์นำออก" outlined>
                                    <template v-slot:append>
                                      <q-icon name="save" />
                                    </template>
                                  </q-input>
                                </div>
                                <div class="col-md-1 col-xs-2 q-pa-xs">
                                  <q-btn flat icon-right="archive" label="ส่งออก" @click="exportTable()" />
                                </div>
                                <div class="col-md-3 col-xs-5 q-pa-xs">
                                  <q-select v-model="visibleColumns" multiple outlined dense options-dense
                                    :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                                    option-value="name" options-cover style="min-width: 150px" />
                                </div>
                                <div class="col-md-1 col-xs-2 q-pa-xs">
                                  <q-btn flat round dense :icon="props.inFullscreen
                                    ? 'fullscreen_exit'
                                    : 'fullscreen'
                                    " @click="props.toggleFullscreen" class="q-ml-md" />
                                </div>
                              </div>
                            </template>
                            <template v-slot:body-cell-actions="props">
                              <q-td :props="props">
                                <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.qa_plan_career_id)"
                                  no-caps></q-btn>
                                <q-btn color="red" label="ลบ" @click="
                                  onDelete(
                                    props.row.qa_plan_career_id,
                                    props.row.career_name,
                                    props.row.qualification_name
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
  name: "FormQualificationAdmin",
  components: {},
  data() {
    return {
      file_export: "",
      url: "",
      url_api_career: "",
      url_api_plan_career: "",
      url_api_qualification: "",
      url_api_qa_plan_career: "",
      // ------------------------------------------------------------------------------
      message: "Form Qualification",
      title: "คุณสมบัติ/ทักษะ(ผู้ดูแลระบบ)",
      btnLabel: "เพิ่มข้อมูล",
      visibleColumns: ref([
        "actions",
        "qa_plan_career_id",
        "member_id",
        "full_name",
        "plan_career_id",
        "career_id",
        "career_name",
        "ca_group_name",
        "qualification_id",
        "qualification_name",
        "qualification_group_name",
        "level_id",
        "level_description",
        "target_id",
        "target_name",
      ]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        // {
        //   name: "qa_plan_career_id",
        //   label: "รหัสคุณสมบัติอาชีพ",
        //   align: "center",
        //   field: (row) => row.qa_plan_career_id,
        //   format: (val) => `${val}`,
        //   sortable: true,
        //   required: true,
        // },
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
        // ca_group_name
        {
          name: "ca_group_name",
          label: "กลุ่มอาชีพ",
          align: "left",
          field: "ca_group_name",
          sortable: true,
        },
        {
          name: "qualification_name",
          label: "คุณสมบัติ",
          align: "left",
          field: "qualification_name",
          sortable: true,
        },
        {
          name: "qualification_group_name",
          label: "กลุ่มคุณสมบัติ",
          align: "left",
          field: "qualification_group_name",
          sortable: true,
        },
        {
          name: "level_description",
          label: "ระดับ",
          align: "left",
          field: "level_description",
          sortable: true,
        },
        {
          name: "target_name",
          label: "เป้าหมาย",
          align: "left",
          field: "target_name",
          sortable: true,
        },
      ],
      member_id: this.$store.getters.myMember_id,
      filter: ref(""),
      loading: ref(false),
      selectedRows: [],
      qa_plan_career_id: "",
      qa_plan_career_full_name: "",
      ca_group_name: "",
      qualification_group_name: "",
      qualifications1: [],
      qualifications_: {
        options: [],
      },
      qualifications: {
        options: [],
      },
      qualification: ref({
        label: "",
        value: "",
        description: "",
        qualification_group_name: "",
      }),
      // plan_careers: "",
      plan_careers_: {
        options: [],
      },
      plan_careers: {
        options: [],
      },
      plan_career: ref({
        label: "",
        value: "",
        description: "",
        group_name: "",
      }),
      targets: "",
      target_: {
        options: [],
      },
      target: {
        options: [],
      },
      levels: "",
      level_: {
        options: [],
      },
      level: {
        options: [],
      },
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
    };
  },
  methods: {
    // นำออกไฟล์ excel
    async exportTable() {
      if (!this.qualifications1 || this.qualifications1.length === 0) {
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
        const worksheet = workbook.addWorksheet('Qualifications');

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
        worksheet.mergeCells('A1:G1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลคุณสมบัติ/ทักษะ (Admin View) - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        // 2. Header
        const headerRow = worksheet.getRow(2);
        headerRow.values = [
          'ชื่อ-สกุล',
          'อาชีพ',
          'กลุ่มอาชีพ',
          'คุณสมบัติ',
          'กลุ่มคุณสมบัติ',
          'ระดับ',
          'เป้าหมาย'
        ];
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = border;
        });

        // 3. Data Processing (Group by Member)
        const sortedRows = [...this.qualifications1].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

        let currentMember = null;
        let zebra = false;

        sortedRows.forEach(row => {
          if (row.full_name !== currentMember) {
            currentMember = row.full_name;
            const groupRow = worksheet.addRow([currentMember, '', '', '', '', '', '']);
            worksheet.mergeCells(`A${groupRow.number}:G${groupRow.number}`);
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
            row.career_name || '-',
            row.ca_group_name || '-',
            row.qualification_name || '-',
            row.qualification_group_name || '-',
            row.level_description || '-',
            row.target_name || '-'
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
          { key: 'B', width: 25 }, // Career
          { key: 'C', width: 20 }, // Career Group
          { key: 'D', width: 25 }, // Qual
          { key: 'E', width: 20 }, // Qual Group
          { key: 'F', width: 15 }, // Level
          { key: 'G', width: 15 }  // Target
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Qualification_Admin_Report").replace(/\.xlsx$/i, '') + '.xlsx';
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
    createValue1(val, done) {
      done(val, "add-unique");
      console.log("new val:", val);
    },
    async newQualification(val, done) {
      done(val, "add-unique");
      this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการเพิ่มคุณสมบัติ [${val}] ใหม่หรือไม่ ?`, persistent: true, cancel: true })
        .onOk(async () => {
          try {
            await axios.post(`${getRestApiUrl(this.$store)}/qualifications`, {
              qualification_name: val,
              member_id: Number(this.$store.getters.myMember_id),
            });
            await this.getQualification();
            this.$q.notify({ message: "เพิ่มคุณสมบัติสำเร็จ", color: "positive" });
          } catch (error) {
            this.$q.notify({ message: "Error: " + error.message, color: "negative" });
          }
        });
    },
    resetForm() {
      this.isEdit = false;
      console.log("isEdit:", this.isEdit);
      this.btnLabel = "เพิ่มข้อมูล";
      console.log("ยกเลิกการบันทึกข้อมูล");
      if (this.member) {
        this.member.value = "";
        this.member.label = "";
        this.member.description = "";
      }
      if (this.plan_career) {
        this.plan_career.value = "";
        this.plan_career.label = "";
        this.plan_career.description = "";
        this.plan_career.group_name = "";
      }
      if (this.qualification) {
        this.qualification.value = "";
        this.qualification.label = "";
        this.qualification.description = "";
      }
      if (this.target) {
        this.target.options.value = "";
        this.target.options.lebel = "";
      }
      if (this.level) {
        this.level.options.value = "";
        this.level.options.label = "";
      }
      this.qa_plan_career_full_name = "";

      this.getMember();
      this.getQualification();
      this.getTarget();
      this.getLevel();
    },
    async getUpdateQualification() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers`);
        this.qualifications1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      } finally {
        this.loading = false;
      }
    },
    onMemberNames(member) {
      console.log("member_id:", member.value);
      console.log("full_name:", member.label);
      console.log("status:", member.description);
      this.getPlan_career(member.value);
    },
    async getPlan_career(member_id) {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers`, { params: { member_id } });
        this.plan_careers.options = res.data.map((item) => ({
          label: item.career_name,
          value: item.plan_career_id,
          description: "วันเริ่ม:" + item.start_date,
          group_name: item.ca_group_name,
        }));
        this.plan_careers_.options = [...this.plan_careers.options];
      } catch (error) {
        console.error(error);
      }
    },
    async getQualification() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qualifications/list`);
        this.qualifications.options = res.data.map((item) => ({
          label: item.qualification_name,
          value: item.qualification_id,
          qualification_group_name: item.qualification_group_name,
        }));
        this.qualifications_.options = [...this.qualifications.options];
      } catch (error) {
        console.error(error);
      }
    },
    async submitForm() {
      const title = "ยืนยัน";
      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title, message, persistent: true, cancel: true })
        .onOk(async () => {
          try {
            const payload = {
              plan_career_id: this.plan_career.value,
              qualification_id: this.qualification.value,
              level_id: this.level.options.value,
              target_id: this.target.options.value,
            };
            if (!this.isEdit) {
              await axios.post(`${getRestApiUrl(this.$store)}/qa-plan-careers`, payload);
              this.$q.notify({ message: "เพิ่มข้อมูลสำเร็จ", color: "positive" });
            } else {
              await axios.put(`${getRestApiUrl(this.$store)}/qa-plan-careers/${this.qa_plan_career_id}`, payload);
              this.$q.notify({ message: "แก้ไขข้อมูลสำเร็จ", color: "positive" });
            }
            this.resetForm();
            await this.getUpdateQualification();
          } catch (error) {
            this.$q.notify({ message: "Error: " + (error.response?.data?.error || error.message), color: "negative" });
          }
        });
    },
    async editUser(qa_plan_career_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const response = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers/${qa_plan_career_id}`);
        const data = response.data;
        this.member = { value: data.member_id, label: data.full_name, description: data.status };
        this.qa_plan_career_id = data.qa_plan_career_id;
        this.plan_career = { value: data.plan_career_id, label: data.career_name, description: data.start_date };
        this.ca_group_name = data.ca_group_name;
        this.qualification = { value: data.qualification_id, label: data.qualification_name, description: data.qfull_name };
        this.qualification_group_name = data.qualification_group_name;
        this.level.options = { value: data.level_id, label: data.level_name };
        this.target.options = { value: data.target_id, label: data.target_name };
        this.qa_plan_career_full_name = data.full_name;
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      }
    },
    async onDelete(qa_plan_career_id, career_name, qualification_name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบคุณสมบัติ [ ${qualification_name} ] อาชีพ [ ${career_name} ] หรือไม่?`,
        persistent: true,
        cancel: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${getRestApiUrl(this.$store)}/qa-plan-careers/${qa_plan_career_id}`);
          this.$q.notify({ message: "ลบข้อมูลสำเร็จ", color: "positive" });
          await this.getUpdateQualification();
        } catch (error) {
          this.$q.notify({ message: "Error: " + error.message, color: "negative" });
        }
      });
    },
    async deleteSelected() {
      const selectedIds = this.selectedRows.map((row) => row.qa_plan_career_id);
      if (selectedIds.length === 0) return;

      this.$q
        .dialog({
          title: "ยืนยันการลบแบบกลุ่ม",
          message: `ต้องการลบข้อมูลที่เลือกทั้งหมด ${selectedIds.length} รายการหรือไม่?`,
          persistent: true,
          cancel: true,
        })
        .onOk(async () => {
          try {
            await axios.post(`${getRestApiUrl(this.$store)}/qa-plan-careers/bulk-delete`, {
              qa_plan_career_ids: selectedIds,
            });
            this.$q.notify({ type: "positive", message: "ลบข้อมูลสำเร็จ" });
            this.selectedRows = [];
            this.getUpdateQualification();
          } catch (error) {
            console.error(error);
            this.$q.notify({ type: "negative", message: "ลบข้อมูลไม่สำเร็จ" });
          }
        });
    },
    customFilter(rows, terms) {
      console.log(terms, rows);
      let lowerSearch = terms.search ? terms.search.toLowerCase : "";
      const filteredRows = rows.filter((row, i) => {
        let ans = false;
        let c1 = this.filterToggle.nice_to_have && row.level == "Nice to have";
        let c2 = this.filterToggle.must_have && row.level == "Must have";
        let c3 = this.filterToggle.optional && row.level == "Optional";
        console.log("c1:", c1);
        console.log("c2:", c2);
        console.log("c3:", c3);
        let s1 = true;
        if (lowerSearch != "") {
          s1 = false;
          let s1_values = Object.values(row);
          let s1_lower = s1_values.map((x) => x.toString().toLowerCase());
          for (let val = 0; val < s1_lower.length; val++) {
            if (s1_lower[val].includes(lowerSearch)) {
              s1 = true;
              break;
            }
          }
        }
        ans = false;
        if ((c1 && s1) || (c2 && s1) || (c3 && s1)) {
          ans = true;
        }
        return ans;
      });
      return filteredRows;
    },

    getUpdate() {
      console.log("ข้อมูลจาก qa_plan_career");
      this.getUpdateQualification();
    },
    async getMember() {
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
      }
    },
    storeEmp_id(emp_id) {
      console.log("store Emp_id:", emp_id);
      this.$store.commit("setMyEmployee_id", emp_id);
      console.log("store employee_id", this.$store.getters.myEmployee_id);
    },
    onNext() {
      this.$router.replace({ name: "FormPlan" });
    },
    onPrevious() {
      this.$router.replace({ name: "FormPlanCareer" });
    },
    async getTarget() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/targets`);
        this.target.options = res.data.map((item) => ({
          label: item.target_name,
          value: item.target_id,
          icon: "flag_circle",
          description: item.description,
        }));
        this.target_.options = [...this.target.options];
      } catch (error) {
        console.error(error);
      }
    },
    async getLevel() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/levels`);
        this.level.options = res.data.map((item) => ({
          label: item.level_description,
          value: item.level_id,
          icon: "running_with_errors",
          description: item.description,
        }));
        this.level_.options = [...this.level.options];
      } catch (error) {
        console.error(error);
      }
    },
    filterLevel(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.level.options = this.level_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterTarget(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.target.options = this.target_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterQualification(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.qualifications.options = this.qualifications_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterPlan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.plan_careers.options = this.plan_careers_.options.filter((v) => v.label.toLowerCase().includes(needle));
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
    onPlan_career(plan_career) {
      if (plan_career) {
        this.ca_group_name = plan_career.group_name;
        console.log("ca_group_name:", this.ca_group_name);
      } else {
        this.plan_career = ref({
          label: "",
          value: "",
          description: "",
          ca_group_name: "",
        });
        this.ca_group_name = "";
        console.log("ca_group_name:", this.ca_group_name);
      }
    },
    onQaualification(qualification) {
      if (qualification) {
        this.qualification_group_name = qualification.qualification_group_name;
        console.log(
          "qualification.description:",
          this.qualification_group_name
        );
      } else {
        this.qualification = ref({
          label: "",
          value: "",
          description: "",
          qualification_group_name: "",
        });
        this.qualification_group_name = "";
        console.log(
          "qualification.description:",
          this.qualification_group_name
        );
      }
    },
  },
  created() {
    const restBaseUrl = getRestApiUrl(this.$store);
    this.url = `${restBaseUrl}/members`;
    this.url_api_career = `${restBaseUrl}/careers`;
    this.url_api_plan_career = `${restBaseUrl}/plan-careers`;
    this.url_api_qualification = `${restBaseUrl}/qualifications`;
    this.url_api_qa_plan_career = `${restBaseUrl}/qa-plan-careers`;
  },
  mounted() {
    this.getMember();
    this.getQualification();
    this.getTarget();
    this.getLevel();
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
