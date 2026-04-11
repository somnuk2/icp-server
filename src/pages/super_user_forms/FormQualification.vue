<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="items-center justify-center" style="background: linear-gradient(135deg, #74c588 0%, #0ad13c 100%); min-height: 100vh;">
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
                          @update:model-value="onCareer_plan(plan_career)">
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
                              onCareer_plan((plan_career = null))
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
                          @update:model-value="onQualification(qualification)">
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
                              onQualification((qualification = null))
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
                        <q-select @filter="filterTarget" use-input color="green" v-model="target.options.value"
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
                        <q-select @filter="filterLevel" use-input color="green" v-model="level.options.value"
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
                          to="/SuserFormPlanCareer">
                          <q-tooltip class="bg-accent">กลับฟอร์มกำหนดอาชีพเป้าหมาย</q-tooltip>
                        </q-btn>
                        <!-- ไปข้างหน้า -->
                        <q-btn color="primary" no-caps flat icon="skip_next" label="ไปฟอร์มการพัฒนาตนเอง"
                          to="/SuserFormPlan">
                          <q-tooltip class="bg-accent">ไปฟอร์มการพัฒนาตนเอง</q-tooltip>
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
                                <q-btn flat color="green-7" icon="download" label="ส่งออก excel" @click="exportTable()" class="full-width q-py-xs" unelevated />
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
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
                                <div class="col-md-3 col-xs-6 q-pa-xs">
                                  <q-input borderless dense debounce="300" v-model="filter"
                                    placeholder="ค้นหาคุณสมบัติ">
                                    <template v-slot:append>
                                      <q-icon name="search" />
                                    </template>
                                  </q-input>
                                </div>
                                <div class="col-md-5 col-xs-5 q-pa-xs">
                                  <q-select v-model="visibleColumns" multiple outlined dense options-dense
                                    :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                                    option-value="name" options-cover style="min-width: 150px" />
                                </div>
                                <div class="col-md-2 col-xs-2 q-pa-xs">
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
    <!-- <div>{{ filter1 }}</div> -->
    <!-- <div>
      {{ Plan_Career_ids }}
      {{ careers1 }}
      {{ career.options }}
    </div> -->
  </q-layout>
  <!-- <div class="py-2">
    {{ qualifications_ }}
  </div>
  <div class="py-2">
    {{ qualification }}
  </div> -->
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useQuasar } from "quasar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl } from "../../utils/apiConfig.js";
// ส่งออกไฟล์ excel
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
  name: "FormQualificationSuperUser",
  data() {
    return {
      file_export: "",
      title: "คุณสมบัติ/ทักษะ(ผู้ดูแลกลุ่ม)",
      btnLabel: "เพิ่มข้อมูล",
      ca_group_name: "",
      qualification_group_name: "",
      visibleColumns: ref(["actions", "full_name", "career_name", "ca_group_name", "qualification_name", "qualification_group_name", "level_description", "target_name"]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        { name: "full_name", label: "ชื่อ-สกุล", align: "left", field: "full_name", sortable: true },
        { name: "career_name", label: "อาชีพ", align: "left", field: "career_name", sortable: true },
        { name: "ca_group_name", label: "กลุ่มอาชีพ", align: "left", field: "ca_group_name", sortable: true },
        { name: "qualification_name", label: "คุณสมบัติ", align: "left", field: "qualification_name", sortable: true },
        { name: "qualification_group_name", label: "กลุ่มคุณสมบัติ", align: "left", field: "qualification_group_name", sortable: true },
        { name: "level_description", label: "ระดับ", align: "left", field: "level_description", sortable: true },
        { name: "target_name", label: "เป้าหมาย", align: "left", field: "target_name", sortable: true },
      ],
      filter: ref(""),
      loading: ref(false),
      selectedRows: [],
      qa_plan_career_id: "",
      qualifications1: [],
      qualifications: { options: [] },
      qualifications_: { options: [] },
      qualification: ref({ label: "", value: "", description: "", qualification_group_name: "" }),
      plan_careers: { options: [] },
      plan_careers_: { options: [] },
      plan_career: ref({ label: "", value: "", description: "", ca_group_name: "" }),
      target_id: null,
      target: { options: [] },
      target_: { options: [] },
      level_id: null,
      level: { options: [] },
      level_: { options: [] },
      $q: useQuasar(),
      members: { options: [] },
      members_: { options: [] },
      member: ref({ label: "", value: "", description: "" }),
    };
  },
  methods: {
    async exportTable() {
      if (!this.qualifications1 || this.qualifications1.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูลในตาราง', icon: 'warning' });
        return;
      }
      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Qualifications');
        worksheet.addRow(this.columns.filter(c => c.name !== 'actions').map(c => c.label));
        this.qualifications1.forEach(row => {
          worksheet.addRow(this.columns.filter(c => c.name !== 'actions').map(c => row[c.field] || '-'));
        });
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Qualification_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
        this.$q.notify({ color: 'positive', message: 'ส่งออกสำเร็จ' });
      } catch (error) { this.$q.notify({ color: 'negative', message: 'Error: ' + error.message }); }
      finally { this.$q.loading.hide(); }
    },
    async newQualification(val, done) {
      done(val, "add-unique");
      this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการเพิ่มคุณสมบัติ [${val}] ใหม่หรือไม่ ?`, persistent: true, cancel: true })
        .onOk(async () => {
          try {
            await axios.post(`${getRestApiUrl(this.$store)}/qualifications`, { qualification_name: val, member_id: Number(this.$store.getters.myMember_id) });
            this.getQualification();
          } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
        });
    },
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.plan_career = ref({ label: "", value: "", description: "", ca_group_name: "" });
      this.qualification = ref({ label: "", value: "", description: "", qualification_group_name: "" });
      this.target_id = null;
      this.level_id = null;
      this.ca_group_name = "";
      this.qualification_group_name = "";
    },
    async getUpdateQualification() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers`);
        this.qualifications1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
      finally { this.loading = false; }
    },
    onMemberNames(member) {
      if (member) this.getPlan_career(member.value);
    },
    async getPlan_career(member_id) {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers`, { params: { member_id } });
        this.plan_careers.options = res.data.map(i => ({ label: i.career_name, value: i.plan_career_id, description: "วันเริ่ม:" + i.start_date, ca_group_name: i.ca_group_name }));
        this.plan_careers_.options = this.plan_careers.options;
      } catch (error) { console.error(error); }
    },
    async getQualification() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qualifications/list`);
        this.qualifications.options = res.data.map(i => ({ label: i.qualification_name, value: i.qualification_id, qualification_group_name: i.qualification_group_name }));
        this.qualifications_.options = this.qualifications.options;
      } catch (error) { console.error(error); }
    },
    async submitForm() {
      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message, persistent: true, cancel: true })
        .onOk(async () => {
          try {
            const payload = { plan_career_id: this.plan_career.value, qualification_id: this.qualification.value, level_id: this.level_id, target_id: this.target_id };
            if (!this.isEdit) {
              await axios.post(`${getRestApiUrl(this.$store)}/qa-plan-careers`, payload);
              this.$q.notify({ message: "บันทึกสำเร็จ", color: "positive" });
            } else {
              await axios.put(`${getRestApiUrl(this.$store)}/qa-plan-careers/${this.qa_plan_career_id}`, payload);
              this.$q.notify({ message: "แก้ไขสำเร็จ", color: "positive" });
            }
            this.resetForm();
            this.getUpdateQualification();
          } catch (error) { this.$q.notify({ message: "Error: " + (error.response?.data?.error || error.message), color: "negative" }); }
        });
    },
    async editUser(id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers/${id}`);
        const data = res.data;
        this.member = { label: data.full_name, value: data.member_id, description: data.status };
        this.qa_plan_career_id = data.qa_plan_career_id;
        this.plan_career = { label: data.career_name, value: data.plan_career_id, description: data.start_date };
        this.ca_group_name = data.ca_group_name;
        this.qualification = { label: data.qualification_name, value: data.qualification_id };
        this.qualification_group_name = data.qualification_group_name;
        this.level_id = data.level_id;
        this.target_id = data.target_id;
      } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
    },
    async onDelete(id, career, qual) {
      try {
        // Check dependencies
        const resCheck = await axios.post(`${getRestApiUrl(this.$store)}/qa-plan-careers/check-dependencies`, {
          id: id,
          type: 'single'
        });

        const { plan_count, assessment_count } = resCheck.data;
        const hasDeps = plan_count > 0 || assessment_count > 0;

        if (hasDeps) {
          let msg = `ไม่สามารถลบคุณสมบัติ "${qual}" ได้ เนื่องจากมีข้อมูลที่เกี่ยวข้อง:\n`;
          if (plan_count > 0) msg += `- แผนการพัฒนา ${plan_count} รายการ\n`;
          if (assessment_count > 0) msg += `- ผลการประเมินและหลักฐาน ${assessment_count} รายการ\n`;
          msg += "\nกรุณาลบข้อมูลทักษะ/แผน/ผลประเมินที่เกี่ยวข้องออกให้หมดก่อน";

          this.$q.dialog({
            title: "ไม่สามารถลบได้",
            message: msg,
            ok: { label: 'รับทราบ', color: 'primary' }
          });
          return;
        }

        this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบคุณสมบัติ [${qual}] อาชีพ [${career}] หรือไม่?`, persistent: true, cancel: true })
          .onOk(async () => {
            try {
              await axios.delete(`${getRestApiUrl(this.$store)}/qa-plan-careers/${id}`);
              this.$q.notify({ message: "ลบสำเร็จ", color: "positive" });
              this.getUpdateQualification();
            } catch (error) {
              this.$q.notify({ message: "Error: " + error.message, color: "negative" });
            }
          });
      } catch (error) {
        console.error("Dependency check failed:", error);
        this.$q.notify({ type: "negative", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
      }
    },
    async deleteSelected() {
      const selectedIds = this.selectedRows.map(r => r.qa_plan_career_id);
      if (selectedIds.length === 0) return;

      try {
        // Check dependencies for multiple records
        const resCheck = await axios.post(`${getRestApiUrl(this.$store)}/qa-plan-careers/check-dependencies`, {
          type: 'bulk',
          ids: selectedIds
        });

        const { plan_count, assessment_count } = resCheck.data;
        const hasDeps = plan_count > 0 || assessment_count > 0;

        if (hasDeps) {
          let msg = `ไม่สามารถลบรายการที่เลือกได้ เนื่องจากตรวจพบข้อมูลที่เกี่ยวข้อง:\n`;
          if (plan_count > 0) msg += `- แผนการพัฒนา ${plan_count} รายการ\n`;
          if (assessment_count > 0) msg += `- ผลการประเมินและหลักฐาน ${assessment_count} รายการ\n`;
          msg += "\nกรุณาลบข้อมูลที่เกี่ยวข้องออกให้หมดก่อนทำการลบแบบกลุ่ม";

          this.$q.dialog({
            title: "ไม่สามารถลบแบบกลุ่มได้",
            message: msg,
            ok: { label: 'รับทราบ', color: 'primary' }
          });
          return;
        }

        this.$q.dialog({ title: "ยืนยันการลบแบบกลุ่ม", message: `ต้องการลบข้อมูลที่เลือกทั้งหมด ${selectedIds.length} รายการหรือไม่?`, persistent: true, cancel: true })
          .onOk(async () => {
            try {
              await axios.post(`${getRestApiUrl(this.$store)}/qa-plan-careers/bulk-delete`, { qa_plan_career_ids: selectedIds });
              this.$q.notify({ type: "positive", message: "ลบสำเร็จ" });
              this.selectedRows = [];
              this.getUpdateQualification();
            } catch (error) {
              this.$q.notify({ type: "negative", message: "ลบไม่สำเร็จ" });
            }
          });
      } catch (error) {
        console.error("Dependency check failed:", error);
        this.$q.notify({ type: "negative", message: "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ" });
      }
    },
    async getMember() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`);
        this.members.options = res.data.map(i => ({ label: i.full_name, value: i.member_id, description: i.status }));
        this.members_.options = this.members.options;
      } catch (error) { console.error(error); }
    },
    async getTarget() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/targets`);
        this.target.options = res.data.map(i => ({ label: i.target_name, value: i.target_id, icon: "flag_circle", description: i.description }));
        this.target_.options = this.target.options;
      } catch (error) { console.error(error); }
    },
    async getLevel() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/levels`);
        this.level.options = res.data.map(i => ({ label: i.level_description, value: i.level_id, icon: "running_with_errors", description: i.description }));
        this.level_.options = this.level.options;
      } catch (error) { console.error(error); }
    },
    filterLevel(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.level.options = this.level_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterTarget(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.target.options = this.target_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterQualification(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.qualifications.options = this.qualifications_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterPlan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.plan_careers.options = this.plan_careers_.options.filter(v => v.label.toLowerCase().includes(needle));
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
    onCareer_plan(plan_career) {
      if (plan_career) {
        this.ca_group_name = plan_career.ca_group_name;
      } else {
        this.plan_career = { label: "", value: "", description: "", ca_group_name: "" };
        this.ca_group_name = "";
      }
    },
    onQualification(qualification) {
      if (qualification) {
        this.qualification_group_name = qualification.qualification_group_name;
      } else {
        this.qualification = { label: "", value: "", description: "", qualification_group_name: "" };
        this.qualification_group_name = "";
      }
    },
  },
  mounted() {
    this.getMember();
    this.getQualification();
    this.getTarget();
    this.getLevel();
    this.getUpdateQualification();
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
