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
            <q-form @submit.prevent="submitForm" @reset="resetForm" method="post">
              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-xs-12">
                  <q-input outlined dense filled v-model="member.full_name" label="ชื่อ-สกุล" bg-color="white">
                    <template v-slot:prepend><q-icon name="person" /></template>
                  </q-input>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input outlined dense filled v-model="member.email" label="อีเมล" type="email" bg-color="white"
                    :rules="[required, isEmail]">
                    <template v-slot:prepend><q-icon name="email" /></template>
                  </q-input>
                </div>

                <template v-if="!isEdit">
                  <div class="col-md-6 col-xs-12">
                    <q-input outlined dense filled v-model="member.password" :type="passwordFieldType" label="รหัสผ่าน"
                      :rules="[required, short]">
                      <template v-slot:prepend><q-icon name="lock" /></template>
                      <template v-slot:append>
                        <q-icon :name="visibilityIcon" @click="switchVisibility" class="cursor-pointer" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-md-6 col-xs-12">
                    <q-input outlined dense filled v-model="member.repassword" :type="passwordFieldType"
                      label="ยืนยันรหัสผ่าน" :rules="[required, diffPassword]">
                      <template v-slot:prepend><q-icon name="lock" /></template>
                    </q-input>
                  </div>
                </template>
              </div>

              <div class="row justify-center q-gutter-x-md q-mt-md">
                <q-btn :label="isEdit ? 'บันทึกการแก้ไข' : 'ลงทะเบียน'" type="submit" color="primary" icon="save"
                  unelevated />
                <q-btn label="ยกเลิก" type="reset" color="grey-7" flat icon="clear" />
                <q-btn label="ออก" color="red" flat icon="logout" to="/" />
              </div>
            </q-form>
          </q-card>

          <!-- Only show member table if admin/super_user -->
          <q-table v-if="isAdminOrSuperUser" class="custom-green-table shadow-2 full-width" title="ข้อมูลสมาชิก" :rows="members1"
            :columns="columns" row-key="member_id" :filter="filter" :loading="loading" separator="cell"
            :rows-per-page-options="[10, 30, 50, 0]"
            :pagination-label="(first, end, total) => `หน้า : ${end}/${total}`">
            <template v-slot:top-right>
              <q-input dense outlined v-model="filter" placeholder="ค้นหา..." bg-color="white">
                <template v-slot:append><q-icon name="search" /></template>
              </q-input>
            </template>

            <template v-slot:header="props">
              <q-tr :props="props" class="bg-blue-2">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-black text-weight-bold">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props" class="table-row-green">
                <q-td key="actions" :props="props" class="text-center">
                  <q-btn size="sm" color="blue" icon="mode_edit" class="q-mr-xs" @click="editUser(props.row.member_id)"
                    unelevated />
                  <q-btn size="sm" color="red" icon="delete"
                    @click="deleteUser(props.row.member_id, props.row.full_name)" unelevated />
                </q-td>
                <q-td v-for="col in props.cols.filter(c => c.name !== 'actions')" :key="col.name" :props="props">
                  {{ col.value }}
                </q-td>
              </q-tr>
            </template>
          </q-table>

        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import { useQuasar } from "quasar";
import { ref } from "vue";
import { getRestApiUrl } from "../../utils/apiConfig.js";


export default {
  data() {
    return {
      apiUrl: "",
      // url_api_mail: "",
      // url_api_verified_mail: "",

      // ------------------------------------------------------------------------------
      title: "การลงทะเบียน",
      members: Array,
      register: true,
      filter: ref(""),
      loading: ref(false),
      member: {
        member_id: this.$store.getters.myMember_id,
        full_name: "",
        email: "",
        password: "",
        repassword: "",
        status: "user",
      },
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
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
          name: "password",
          align: "center",
          label: "รหัสผ่าน",
          field: (row) => row.password,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "status",
          align: "center",
          label: "หน้าที่",
          field: (row) => row.status,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "is_verified",
          align: "center",
          label: "ยืนยันอีเมลย์",
          field: (row) => row.is_verified,
          format: (val) => `${val == 0 ? "ยังไม่ยืนยัน" : "ยืนยัน"}`,
          sortable: true,
        },
      ],
      members1: [],
      $q: useQuasar(),
      passwordFieldType: "password",
      btnLabel: "กดปุ่ม",
      visibility: false,
      visibilityIcon: "visibility",
      checkUser: ref(false),
      isEdit: false,
      isAdminOrSuperUser: false,

    };
  },
  methods: {
    submitForm() {
      if (!this.isEdit) {
        this.$q
          .dialog({
            title: "ยืนยัน",
            message: "คุณต้องการสมัครสมาชิคด้วยอีเมล : " + this.member.email + " หรือไม่?",
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
                status: this.member.status,
              });
              this.$q.notify({ message: "แก้ไขข้อมูลสำเร็จ", color: "positive" });
              this.isEdit = false;
              this.resetForm();
              this.getUpdate();
            } catch (error) {
              console.error(error);
              this.$q.notify({ message: "แก้ไขข้อมูลไม่สำเร็จ: " + (error.response?.data?.error || error.message), color: "negative" });
            }
          });
      }
    },

    async getAllUser() {
      console.log(" แสดงข้อมูลทั้งหมด ");
      try {
        const res = await axios.get(`${this.apiUrl}/members`);
        console.log("Registration:", res.data);
        this.members1 = res.data;
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "ดึงข้อมูลไม่สำเร็จ", color: "negative" });
      }
    },

    async addNewMember() {
      console.log("บันทึกข้อมูล");
      try {
        await axios.post(`${this.apiUrl}/auth/register`, {
          full_name: this.member.full_name,
          email: this.member.email,
          password: this.member.password,
          status: this.member.status,
        });
        this.$q.notify({ message: "สมัครสมาชิกสำเร็จ", color: "positive" });
        this.resetForm();
        this.getUpdate();
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "สมัครสมาชิกไม่สำเร็จ: " + (error.response?.data?.error || error.message), color: "negative" });
      }
    },

    async checkNewMemeber(email) {
      console.log(" ตรวจสอบผู้ใช้ ", email);
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
        this.addNewMember(); // Fallback to register
      }
    },
    async getUpdate() {
      // For admin/superuser, get all members to show in table
      this.getAllUser();
    },
    async editUser(id) {
      this.isEdit = true;
      try {
        const { data } = await axios.get(`${this.apiUrl}/members/${id}`);
        this.member.member_id = data.member_id;
        this.member.full_name = data.full_name;
        this.member.email = data.email;
        this.member.status = data.status;
        this.member.password = ""; // Don't auto-fill password for security
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "โหลดข้อมูลไม่สำเร็จ", color: "negative" });
      }
    },

    resetForm() {
      console.log("ยกเลิกการบันทึกข้อมูล");
      this.member.member_id = 0;
      this.member.full_name = "";
      this.member.email = "";
      this.member.password = "";
      this.member.repassword = "";
      this.member.status = "";
    },
    deleteUser(id, name) {
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
    switchTypeForm() {
      this.register = !this.register;
      this.title = this.register ? "ผู้ใช้ใหม่" : "การอนุญาต";
      this.btnLabel = this.register ? "การลงทะเบียน" : "ทางเข้า";
    },
    switchVisibility() {
      this.visibility = !this.visibility;
      this.passwordFieldType = this.visibility ? "text" : "password";
      this.visibilityIcon = this.visibility ? "visibility_off" : "visibility";
    },
    OnCancel() {
      this.$router.replace({ name: "home" });
    },
  },
  created() {
    this.apiUrl = getRestApiUrl(this.$store);
  },
  mounted() {
    const role = this.$store.getters.myStatus || '';
    this.isAdminOrSuperUser = (role === 'admin' || role === 'super_user');
    if (this.isAdminOrSuperUser) {
      this.getUpdate();
    }
  },

};
</script>

<style lang="sass">
/* พื้นที่เขียวอ่อนครอบคลุมใต้ Header */
.content-area
  background-color: #c8e6c9
  min-height: calc(100vh - 80px)

/* ปรับแต่งตารางให้เป็นสีเขียวเข้มสลับแถว */
.custom-green-table
  border-radius: 4px

  thead tr th
    background-color: #bbdefb !important
    color: black
    position: sticky
    top: 0
    z-index: 1

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
