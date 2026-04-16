<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="row items-center justify-center" style="background: linear-gradient(#74c588, #0ad13c)">
        <div class="row full-width">
          <div class="col-md-10 offset-md-1 col-xs-12 q-pa-xs">
            <q-card flat class="bg-white text-black">
              <q-card-section class="bg-blue-14">
                <h4 class="text-h5 text-white q-ma-xs text-center">
                  {{ title }}
                </h4>
              </q-card-section>
              <div class="row q-pa-xs">
                <div class="col-md-12 col-xs-12 q-pa-xs">
                  <q-form @submit="submitForm" @reset="resetForm" method="post" class="q-gutter-md">
                    <div class="row">
                      <!-- ชื่อ-สกุล -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
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
                      <!-- อีเมล -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
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
                    <div class="row">
                      <!-- ปุ่มควบคุม -->
                      <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                        <!-- บันทึก -->
                        <q-btn label="บันทึก" type="submit" color="primary" icon="save" />
                        <!-- ยกเลิก -->
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" icon="clear" />
                        <!-- ออก -->
                        <q-btn icon="logout" label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                      </div>
                    </div>
                    <!-- ตารางข้อมูล -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-table class="my-sticky-header-table" title="ข้อมูลสมาชิค" :rows="members1" :columns="columns"
                          row-key="name" :filter="filter" :loading="loading" separator="cell"
                          table-header-style="height: 65px; " table-header-class="bg-blue-5"
                          :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home"
                          icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                          :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                            return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                          }">
                          <template v-slot:top-right>
                            <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                              <template v-slot:append>
                                <q-icon name="search" />
                              </template>
                            </q-input>
                          </template>
                          <template v-slot:body-cell-actions="props">
                            <q-td :props="props">
                              <q-btn icon="mode_edit" @click="editUser(props.row.member_id)"></q-btn>
                              <q-btn icon="delete" @click="
                                deleteUser(
                                  props.row.member_id,
                                  props.row.full_name
                                )
                                "></q-btn>
                            </q-td>
                          </template>
                        </q-table>
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
import { getRestApiUrl } from "../../utils/apiConfig.js";
import { useQuasar } from "quasar";
import { ref } from "vue";

export default {
  data() {
    return {
      apiUrl: "",
      title: "การลงทะเบียน",
      register: true,
      filter: ref(""),
      loading: ref(false),
      isEdit: false,
      member: {
        member_id: "",
        full_name: "",
        email: "",
        password: "",
        repassword: "",
        status: "user",
      },
      columns: [
        { name: "actions", align: "center", label: "Action" },
        {
          name: "mem_id",
          required: true,
          label: "mem_id",
          align: "center",
          field: (row) => row.member_id,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "full_name",
          align: "center",
          label: "ชื่อ-สกุล",
          field: (row) => row.full_name,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "e-mail",
          align: "center",
          label: "อีเมลย์",
          field: (row) => row.email,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "status",
          align: "center",
          label: "สถานะ",
          field: (row) => row.status,
          format: (val) => `${val}`,
          sortable: true,
        },
      ],
      members1: [],
      $q: useQuasar(),
      passwordFieldType: "password",
      visibility: false,
      visibilityIcon: "visibility",
    };
  },
  methods: {
    authHeaders() {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    submitForm() {
      if (!this.isEdit) {
        this.$q.dialog({
          title: "ยืนยัน",
          message: "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?",
          cancel: true, persistent: true,
        }).onOk(() => { this.addNewMember(); });
      } else {
        this.$q.dialog({
          title: "ยืนยัน",
          message: "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?",
          cancel: true, persistent: true,
        }).onOk(async () => {
          try {
            await axios.put(`${this.apiUrl}/members/${this.member.member_id}`, {
              full_name: this.member.full_name,
              email: this.member.email,
              password: this.member.password || undefined,
              status: this.member.status,
            }, { headers: this.authHeaders() });
            this.getAllMembers();
            this.resetForm();
          } catch (err) {
            console.error("Update error:", err);
            this.$q.dialog({ title: "ข้อผิดพลาด", message: err.response?.data?.error || "เกิดข้อผิดพลาด" });
          }
        });
      }
    },
    async getAllMembers() {
      this.loading = true;
      try {
        const res = await axios.get(`${this.apiUrl}/members`, { headers: this.authHeaders() });
        this.members1 = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Get members error:", err);
      } finally {
        this.loading = false;
      }
    },
    async addNewMember() {
      try {
        await axios.post(`${this.apiUrl}/auth/register`, {
          full_name: this.member.full_name,
          email: this.member.email,
          password: this.member.password,
          status: this.member.status || "user",
        }, { headers: this.authHeaders() });
        this.getAllMembers();
        this.resetForm();
      } catch (err) {
        const msg = err.response?.status === 409
          ? `อีเมล: ${this.member.email} เป็นสมาชิกแล้ว`
          : err.response?.data?.error || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล";
        this.$q.dialog({ title: "แจ้งเพื่อทราบ", message: msg, persistent: true });
      }
    },
    // checkNewMemeber รวมอยู่ใน addNewMember แล้ว (backend return 409 ถ้า email ซ้ำ)
    async editUser(id) {
      this.isEdit = true;
      try {
        const res = await axios.get(`${this.apiUrl}/members/${id}`, { headers: this.authHeaders() });
        this.member.member_id = res.data.member_id;
        this.member.full_name = res.data.full_name;
        this.member.email = res.data.email;
        this.member.password = "";
        this.member.status = res.data.status;
      } catch (err) {
        console.error("Edit error:", err);
      }
    },
    resetForm() {
      this.isEdit = false;
      this.member.member_id = "";
      this.member.full_name = "";
      this.member.email = "";
      this.member.password = "";
      this.member.repassword = "";
      this.member.status = "user";
    },
    deleteUser(id, name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [${name}] หรือไม่ ?`,
        cancel: true, persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${this.apiUrl}/members/${id}`, { headers: this.authHeaders() });
          this.getAllMembers();
        } catch (err) {
          console.error("Delete error:", err);
          this.$q.dialog({ title: "ข้อผิดพลาด", message: err.response?.data?.error || "ลบไม่สำเร็จ" });
        }
      });
    },
    required(val) { return (val && val.length > 0) || "ช่องที่ต้องกรอก"; },
    diffPassword(val) { return (val && val === this.member.password) || "รหัสผ่านไม่ตรงกัน!"; },
    short(val) { return (val && val.length > 3) || "ค่าสั้นเกินไป"; },
    isEmail(val) {
      const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
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
  mounted() {
    this.getAllMembers();
  },
};
</script>
<style scoped></style>
