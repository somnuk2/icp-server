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
                  <q-form @submit="submitForm" @reset="resetForm" method="post" class="q-gutter-md">
                    <!-- ชื่อ -->
                    <div class="row">
                      <!-- ชื่อ-สกุล -->
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-input color="white" bg-color="blue-5" standout bottom-slots v-model="member.full_name"
                          label="ชื่อ-สกุล" clearable>
                          <template v-slot:prepend>
                            <q-icon name="work_history" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <div class="row">
                      <!-- อีเมล -->
                      <div class="col-md-9 col-xs-12 q-pa-xs">
                        <q-input color="white" bg-color="blue-5" standout bottom-slots v-model="member.email"
                          label="อีเมล" clearable type="email" lazy-rules
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
                          :type="passwordFieldType" lazy-rules :rules="[this.required, this.short]" label="รหัสผ่าน">
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
                          ]" label="ยืนยันรหัสผ่าน">
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
                        <!-- บันทึก -->
                        <q-btn :label="btnLabel" type="submit" color="primary" icon="save" />
                        <!-- ยกเลิก -->
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" icon="clear" />
                        <!-- ออก -->
                        <q-btn icon="logout" label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                        <!-- ไปฟอร์มข้อมูลการศึกษา -->
                        <q-btn color="primary" no-caps flat icon="skip_next" label="ไปฟอร์มข้อมูลการศึกษา" class="q-pa-xs"
                          to="/s_tapFormInstitute">
                          <q-tooltip class="bg-accent">ไปฟอร์มข้อมูลการศึกษา</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <!-- ตารางข้อมูล -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-ma-xs">
                        <div class="q-pa-xs">
                          <!-- ผู้ดูแลระบบ + ที่ปรึกษา + ผู้ใช้ระบบ -->

                          <q-table title="ข้อมูลสมาชิค" :rows="members1" :columns="columns" row-key="name"
                            :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                            table-header-style="height: 65px; " table-header-class="bg-blue-5"
                            :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home"
                            icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                            :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                              return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                            }">
                            <template v-slot:top-right="props">
                              <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาสมาชิค">
                                <template v-slot:append>
                                  <q-icon name="search" />
                                </template>
                              </q-input>
                              <!-- ส่งออก excel -->
                              <q-input borderless dense debounce="300" v-model="file_export" placeholder="ชื่อไฟล์นำออก"
                                outlined>
                                <template v-slot:append>
                                  <q-icon name="save" />
                                </template>
                              </q-input>
                              <q-btn flat icon-right="archive" label="ส่งออกไฟล์" @click="exportTable()" />
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
                                <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.member_id)" no-caps></q-btn>
                                <q-btn color="red" label="ลบ" @click="
                                  deleteUser(
                                    props.row.member_id,
                                    props.row.full_name
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
import { useQuasar } from "quasar";
import { ref } from "vue";
import { exportFile } from "quasar";
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
  name: "FormRegistrationSuperUser",
  data() {
    return {
      file_export: "",
      title: "การลงทะเบียน(ผู้ดูแลกลุ่ม)",
      register: true,
      filter: ref(""),
      loading: ref(false),
      member: {
        member_id: "", full_name: "", email: "", password: "", repassword: "", status: "user", is_verified: "0",
      },
      visibleColumns: ref(["actions", "full_name", "e-mail", "password", "status", "is_verified"]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        { name: "full_name", align: "left", label: "ชื่อ-สกุล", field: "full_name", sortable: true },
        { name: "e-mail", align: "left", label: "อีเมลย์", field: "email", sortable: true },
        { name: "password", align: "left", label: "รหัสผ่าน", field: "password", sortable: true },
        { name: "status", align: "center", label: "บทบาท", field: "status", sortable: true },
        { name: "is_verified", align: "center", label: "ยืนยัน", field: "is_verified", format: (val) => `${val == 0 ? "ยังไม่ยืนยัน" : "ยืนยัน"}`, sortable: true },
      ],
      members1: [],
      $q: useQuasar(),
      passwordFieldType: "password",
      visibility: false,
      visibilityIcon: "visibility",
      btnLabel: "เพิ่มข้อมูล",
      isEdit: false,
    };
  },
  methods: {
    async exportTable() {
      if (!this.members1 || this.members1.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูล' });
        return;
      }
      try {
        const content = [this.columns.map(c => c.label)].concat(this.members1.map(row => this.columns.map(c => row[c.field] || ''))).map(e => e.join(",")).join("\n");
        const status = exportFile((this.file_export || 'members') + '.csv', content, 'text/csv');
        if (status !== true) this.$q.notify({ message: 'Browser denied file download...', color: 'negative', icon: 'warning' });
      } catch (error) { console.error(error); }
    },
    async submitForm() {
      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message, cancel: true, persistent: true })
        .onOk(async () => {
          if (!this.isEdit) {
            await this.checkNewMember(this.member.email);
          } else {
            try {
              await axios.put(`${getRestApiUrl(this.$store)}/members/${this.member.member_id}`, {
                ...this.member, status: "user", created_by: this.$store.getters.myMember_id
              });
              this.$q.notify({ message: "แก้ไขสำเร็จ", color: "positive" });
              this.resetForm();
              this.getUpdate();
            } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
          }
        });
    },
    async checkNewMember(email) {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`);
        const members = Array.isArray(res.data) ? res.data : [];
        if (members.some(m => m.email === email)) {
          this.$q.dialog({ title: "แจ้งเพื่อทราบ", message: `อีเมล: ${email} เป็นสมาชิกแล้ว`, persistent: true });
        } else {
          await this.addNewMember();
        }
      } catch (error) { await this.addNewMember(); }
    },
    async addNewMember() {
      try {
        await axios.post(`${getRestApiUrl(this.$store)}/auth/register`, {
          ...this.member, status: "user", created_by: this.$store.getters.myMember_id
        });
        this.$q.notify({ message: "เพิ่มสำเร็จ", color: "positive" });
        this.resetForm();
        this.getUpdate();
      } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members/created_by/${this.$store.getters.myMember_id}`);
        this.members1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) { console.error(error); }
      finally { this.loading = false; }
    },
    async editUser(id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members/${id}`);
        this.member = { ...res.data, is_verified: res.data.is_verified == 1 ? "1" : "0" };
      } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
    },
    resetForm() {
      this.member = { member_id: "", full_name: "", email: "", password: "", repassword: "", status: "user", is_verified: "0" };
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
    },
    async deleteUser(id, name) {
      this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบ [${name}] หรือไม่ ?`, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            await axios.delete(`${getRestApiUrl(this.$store)}/members/${id}`);
            this.$q.notify({ message: "ลบสำเร็จ", color: "positive" });
            this.getUpdate();
          } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
        });
    },
    required(val) { return (val && val.length > 0) || "ช่องที่ต้องกรอก"; },
    diffPassword(val) { return (val && val === this.member.password) || "รหัสผ่านไม่ตรงกัน!"; },
    short(val) { return (val && val.length > 3) || "ค่าสั้นเกินไป"; },
    isEmail(val) {
      const pattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return pattern.test(val) || "กรุณาใส่อีเมลที่ถูกต้อง";
    },
    switchVisibility() {
      this.visibility = !this.visibility;
      this.passwordFieldType = this.visibility ? "text" : "password";
      this.visibilityIcon = this.visibility ? "visibility_off" : "visibility";
    },
  },
  mounted() {
    this.getUpdate();
  },
};
</script>
<style scoped></style>
