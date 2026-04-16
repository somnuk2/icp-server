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
                  <q-form @submit="submitForm" @reset="resetForm" method="post" class="q-gutter-md">
                    <!-- ชื่อ -->
                    <div class="row">
                      <!-- ชื่อ-สกุล -->
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-input color="primary" standout="bg-primary text-white" bottom-slots v-model="member.full_name"
                          label="ชื่อ-สกุล *" clearable :rules="[
                            (val) =>
                              (val && val.length > 0) || 'ต้องใส่ชื่อ-สกุล',
                          ]">
                          <template v-slot:prepend>
                            <q-icon name="work_history" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <!-- บทบาทของผู้ใช้ระบบ -->
                    <div class="row">
                      <!-- บทบาทของผู้ใช้ระบบ +อีเมล + ยืนยัน-->
                      <div class="col-md-4 col-xs-12 q-pa-xs">
                        <q-select color="primary" v-model="member_role" :options="member_roles.options" label="บทบาท *"
                          stack-label>
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:selected>
                            <q-chip v-if="member_role" dense square color="white" text-color="primary" class="q-pa-xs">
                              {{ member_role.label }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>
                          <template v-if="member_role" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="member_role = null" class="cursor-pointer" />
                          </template>
                        </q-select>
                      </div>
                      <!-- อีเมล -->
                      <div class="col-md-5 col-xs-12 q-pa-xs">
                        <q-input color="primary" standout="bg-primary text-white" bottom-slots v-model="member.email"
                          label="อีเมล *" clearable type="email" lazy-rules
                          :rules="[this.required, this.isEmail, this.short]">
                          <template v-slot:prepend>
                            <q-icon name="work_history" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                      <!-- ยืนยันอีเมลย์ -->
                      <div class="col-md-3 col-xs-12 q-pa-xs">
                        <q-checkbox v-model="member.is_verified" val="member.is_verified" label="ยืนยันอีเมลย์"
                          color="teal" true-value="1" false-value="0" />
                      </div>
                    </div>
                    <div class="row">
                      <!-- รหัสผ่าน -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-input ref="password" v-if="register" square clearable v-model="member.password"
                          :type="passwordFieldType" lazy-rules :rules="[this.required, this.short]" label="รหัสผ่าน *">
                          <template v-slot:prepend>
                            <q-icon name="lock" />
                          </template>
                          <template v-slot:append>
                            <q-icon :name="visibilityIcon" @click="switchVisibility" class="cursor-pointer" />
                          </template>
                        </q-input>
                      </div>
                      <!-- ยืนยันรหัสผ่าน -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-input ref="repassword" v-if="register" square clearable v-model="member.repassword"
                          :type="passwordFieldType" lazy-rules :rules="[
                            this.required,
                            this.short,
                            this.diffPassword,
                          ]" label="ยืนยันรหัสผ่าน *">
                          <template v-slot:prepend>
                            <q-icon name="lock" />
                          </template>
                          <template v-slot:append>
                            <q-icon :name="visibilityIcon" @click="switchVisibility" class="cursor-pointer" />
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <!-- ปุ่มควบคุม -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                        <q-btn :label="btnLabel" type="submit" color="primary" />
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" />
                        <q-btn label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                        <q-btn color="primary" no-caps flat label="ไปฟอร์มการจัดการข้อมูลการศึกษา"
                          class="q-pa-xs" to="/tapFormInstitute">
                          <q-tooltip class="bg-accent">ไปฟอร์มกรอกข้อมูลส่วนตัว</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-ma-xs">
                        <div class="q-pa-xs">
                          <div class="row items-center q-gutter-sm q-mb-md">
                            <q-toggle color="primary" label="ผู้ดูแลระบบ" v-model="admin" val="admin"
                              @update:model-value="getUpdate()" />
                            <q-toggle color="green" label="ผู้แลกลุ่ม" v-model="suser" val="suser"
                              @update:model-value="getUpdate()" />
                            <q-toggle color="red" label="ผู้ใช้ระบบ" v-model="user" val="user"
                              @update:model-value="getUpdate()" />
                          </div>
                          <q-table title="ข้อมูลสมาชิค" :rows="members1" :columns="columns" virtual-scroll
                            v-model:pagination="pagination" row-key="name" :filter="filter" :loading="loading"
                            :visible-columns="visibleColumns" separator="cell" table-header-style="height: 65px; "
                            table-header-class="bg-primary text-white" :rows-per-page-options="[30, 50, 100, 0]"
                            icon-first-page="home" icon-last-page="all_inclusive" icon-next-page="arrow_right"
                            icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                              return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                            }" selection="multiple" v-model:selected="selectedRows">
                            <template v-slot:top-right="props">
                              <div class="row q-gutter-sm items-center">
                                <q-btn v-if="selectedRows.length > 0" flat color="red" :label="`ลบที่เลือก (${selectedRows.length})`" @click="deleteSelected" />

                                <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาสมาชิค">
                                  <template v-slot:append>
                                    <q-icon name="search" />
                                  </template>
                                </q-input>
                                <q-input borderless dense debounce="300" v-model="file_export" placeholder="ชื่อไฟล์นำออก"
                                  outlined bg-color="white">
                                  <template v-slot:append>
                                    <q-icon name="save" />
                                  </template>
                                </q-input>
                                <q-btn flat color="black" label="ส่งออก excel" @click="exportTable()" />
                                <q-select v-model="visibleColumns" multiple outlined dense options-dense
                                  :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                                  option-value="name" options-cover style="min-width: 150px" bg-color="white" />
                                <q-btn
                                  flat round dense
                                  :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                  @click="props.toggleFullscreen"
                                />
                              </div>
                            </template>
                            <template v-slot:body-cell-actions="props">
                              <q-td :props="props" class="text-center">
                                <q-btn size="sm" color="blue" label="แก้ไข" unelevated no-caps @click="editUser(props.row.member_id)" />
                                <q-btn size="sm" color="red" label="ลบ" unelevated no-caps @click="
                                  deleteUser(
                                    props.row.member_id,
                                    props.row.full_name
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
import { useQuasar } from "quasar";
import { ref } from "vue";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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

import { getRestApiUrl } from "../../utils/apiConfig.js";

export default {
  name: "FormRegistrationAdmin",
  data() {
    return {
      file_export: "",
      apiUrl: "",
      // ------------------------------------------------------------------------------
      title: "การลงทะเบียน(ผู้ดูแลระบบ)",
      members: [],
      register: true,
      filter: ref(""),
      loading: ref(false),
      selectedRows: [],
      member: {
        member_id: this.$store.getters.myMember_id,
        full_name: "",
        email: "",
        password: "",
        repassword: "",
        status: "",
        is_verified: "0",
      },
      visibleColumns: ref([
        "actions",
        "mem_id",
        "full_name",
        "e-mail",
        "password",
        "status",
        "is_verified",
      ]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ", style: "width: 170px;", headerStyle: "width: 170px;" },
        {
          name: "full_name",
          align: "left",
          label: "ชื่อ-สกุล",
          field: "full_name",
          sortable: true,
        },
        {
          name: "e-mail",
          align: "left",
          label: "อีเมลย์",
          field: "email",
          sortable: true,
        },
        {
          name: "password",
          align: "left",
          label: "รหัสผ่าน",
          field: "password",
          sortable: true,
        },
        {
          name: "status",
          align: "center",
          label: "บทบาท",
          field: "status",
          sortable: true,
        },
        {
          name: "is_verified",
          align: "center",
          label: "ยืนยันอีเมลย์",
          field: "is_verified",
          format: (val) => `${val == 0 ? "ยังไม่ยืนยัน" : "ยืนยัน"}`,
          sortable: true,
        },
      ],
      members1: [],
      $q: useQuasar(),
      passwordFieldType: "password",
      visibility: false,
      visibilityIcon: "visibility",
      checkUser: ref(false),
      admin: ref(true),
      suser: ref(true),
      user: ref(true),
      member_roles_: {
        options: [],
      },
      member_roles: {
        options: [
          { label: "ผู้ดูแลระบบ", value: "admin" },
          { label: "ผู้ดูแลกลุ่ม", value: "suser" },
          { label: "ผู้ใช้ระบบ", value: "user" },
        ],
      },
      member_role: ref({
        label: "",
        value: "",
      }),
      btnLabel: "เพิ่มข้อมูล",
      isEdit: false,
    };
  },
  components: {},
  methods: {
    async exportTable() {
      const rows = this.selectedRows.length > 0 ? this.selectedRows : this.members1;
      if (!rows || rows.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูล', icon: 'warning' });
        return;
      }
      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Members');

        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        // Title
        worksheet.mergeCells('A1:F1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `รายงานข้อมูลสมาชิก (Admin) - ${new Date().toLocaleDateString('th-TH')}`;
        titleCell.font = { name: 'Sarabun', size: 14, bold: true };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 36;

        // Header
        const headerRow = worksheet.getRow(2);
        headerRow.values = ['ชื่อ-สกุล', 'อีเมลย์', 'รหัสผ่าน', 'บทบาท', 'ยืนยันอีเมลย์'];
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = border;
        });

        // Data
        rows.forEach((row, idx) => {
          const r = worksheet.addRow([
            row.full_name || '-',
            row.email || '-',
            row.password || '-',
            row.status || '-',
            row.is_verified == 1 ? 'ยืนยัน' : 'ยังไม่ยืนยัน',
          ]);
          r.eachCell((cell) => {
            cell.font = dataFont;
            cell.border = border;
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
          });
        });

        worksheet.columns = [
          { key: 'A', width: 28 }, { key: 'B', width: 28 }, { key: 'C', width: 20 },
          { key: 'D', width: 15 }, { key: 'E', width: 15 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || 'Members_Admin_Report').replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
        this.$q.notify({ color: 'positive', message: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว', icon: 'check' });
      } catch (error) {
        console.error('Export error:', error);
        this.$q.notify({ color: 'negative', message: 'ส่งออกไม่สำเร็จ: ' + error.message, icon: 'error' });
      } finally {
        this.$q.loading.hide();
      }
    },
    submitForm() {
      if (!this.isEdit) {
        this.$q
          .dialog({
            title: "ยืนยัน",
            message: "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?",
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.checkNewMemeber(this.member.email);
          });
      } else {
        this.$q
          .dialog({
            title: "ยืนยัน",
            message: "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?",
            cancel: true,
            persistent: true,
          })
          .onOk(async () => {
            try {
              await axios.put(`${this.apiUrl}/members/${this.member.member_id}`, {
                full_name: this.member.full_name,
                email: this.member.email,
                password: this.member.password,
                status: this.member_role.value,
                is_verified: this.member.is_verified,
              });
              this.isEdit = false;
              this.btnLabel = "เพิ่มข้อมูล";
              this.$q.notify({ message: "แก้ไขข้อมูลสำเร็จ", color: "positive" });
              this.getUpdate();
            } catch (error) {
              console.error(error);
              this.$q.notify({ message: "แก้ไขข้อมูลไม่สำเร็จ", color: "negative" });
            }
          })
          .onCancel(() => {
            this.isEdit = false;
            this.btnLabel = "เพิ่มข้อมูล";
          });
      }
    },
    async getAllUser() {
      try {
        const res = await axios.get(`${this.apiUrl}/members`);
        this.members1 = res.data;
      } catch (error) {
        console.error(error);
      }
    },
    async addNewMember() {
      try {
        await axios.post(`${this.apiUrl}/auth/register`, {
          full_name: this.member.full_name,
          email: this.member.email,
          password: this.member.password,
          status: this.member_role.value,
          is_verified: this.member.is_verified,
          created_by: this.$store.getters.myMember_id,
        });
        this.$q.notify({ message: "เพิ่มสมาชิกสำเร็จ", color: "positive" });
        this.getUpdate();
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "เพิ่มสมาชิกไม่สำเร็จ", color: "negative" });
      }
    },
    async checkNewMemeber(email) {
      try {
        const res = await axios.get(`${this.apiUrl}/members`);
        const members = Array.isArray(res.data) ? res.data : [];
        const isMember = members.some(m => m.email === email);
        if (isMember) {
          this.$q.dialog({
            title: "แจ้งเพื่อทราบ",
            message: "อีเมล:" + email + " เป็นสมาชิคแล้ว",
            persistent: true,
          });
        } else {
          this.addNewMember();
        }
      } catch (error) {
        console.error(error);
        this.addNewMember();
      }
    },
    async getUpdate() {
      try {
        const res = await axios.get(`${this.apiUrl}/members`);
        let data = Array.isArray(res.data) ? res.data : [];
        // Filter based on toggles
        const allowedRoles = [];
        if (this.admin) allowedRoles.push('admin');
        if (this.suser) allowedRoles.push('suser');
        if (this.user) allowedRoles.push('user');

        this.members1 = data.filter(m => allowedRoles.includes(m.status));
      } catch (error) {
        console.error(error);
      }
    },
    async editUser(id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${this.apiUrl}/members/${id}`);
        const data = res.data;
        this.member.member_id = data.member_id;
        this.member.full_name = data.full_name;
        this.member.email = data.email;
        this.member.password = data.password;
        this.member.status = data.status;
        this.member.is_verified = data.is_verified == 1 ? "1" : "0";
        this.member_role.value = data.status;

        const role = this.member_roles.options.find(r => r.value === data.status);
        if (role) this.member_role.label = role.label;
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "โหลดข้อมูลไม่สำเร็จ", color: "negative" });
      }
    },
    async deleteSelected() {
      if (this.selectedRows.length === 0) return;

      this.$q.dialog({
        title: "ยืนยันการลบหลายรายการ",
        message: `คุณต้องการลบสมาชิกที่เลือกทั้งหมด ${this.selectedRows.length} รายการหรือไม่?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        this.$q.loading.show({ message: "กำลังลบข้อมูลที่เลือก...", spinnerColor: "red" });
        let successCount = 0;
        let failCount = 0;
        try {
          for (const item of this.selectedRows) {
            try {
              await axios.delete(`${this.apiUrl}/members/${item.member_id}`);
              successCount++;
            } catch (err) {
              console.error(`Failed to delete ID ${item.member_id}:`, err);
              failCount++;
            }
          }
          this.$q.notify({
            color: successCount > 0 ? "positive" : "negative",
            message: `ลบสำเร็จ ${successCount} รายการ${failCount > 0 ? `, ล้มเหลว ${failCount} รายการ` : ""}`,
            icon: successCount > 0 ? "check" : "error",
          });
          this.selectedRows = [];
          this.getUpdate();
        } finally {
          this.$q.loading.hide();
        }
      });
    },
    resetForm() {
      this.member.member_id = 0;
      this.member.full_name = "";
      this.member.email = "";
      this.member.password = "";
      this.member.repassword = "";
      this.member_role.value = "";
      this.member_role.label = "";
      this.member.is_verified = "0";
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
    },
    async deleteUser(id, name) {
      this.$q
        .dialog({
          title: "ยืนยัน",
          message: "คุณต้องการลบ [" + name + "] หรือไม่ ?",
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await axios.delete(`${this.apiUrl}/members/${id}`);
            this.$q.notify({ message: "ลบสำเร็จ", color: "positive" });
            this.getUpdate();
          } catch (error) {
            console.error(error);
            this.$q.notify({ message: "ลบไม่สำเร็จ", color: "negative" });
          }
        });
    },
    required(val) {
      return (val && val.length > 0) || "ช่องที่ต้องกรอก";
    },
    diffPassword(val) {
      const val2 = this.member.password;
      return (val && val === val2) || "รหัสผ่านไม่ตรงกัน!";
    },
    short(val) {
      return (val && val.length > 3) || "ค่าสั้นเกินไป";
    },
    isEmail(val) {
      const emailPattern =
        /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return emailPattern.test(val) || "กรุณาใส่อีเมลที่ถูกต้อง";
    },
    switchVisibility() {
      this.visibility = !this.visibility;
      this.passwordFieldType = this.visibility ? "text" : "password";
      this.visibilityIcon = this.visibility ? "visibility_off" : "visibility";
    },
  },
  created() {
    this.apiUrl = getRestApiUrl(this.$store);
  },
  setup() {
    return {
      pagination: ref({
        descending: false,
        page: 1,
        rowsPerPage: 30,
      }),
    };
  },
  mounted() {
    this.getUpdate();
  },
};
</script>
<style scoped></style>
