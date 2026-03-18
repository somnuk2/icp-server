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
                  <q-input outlined dense filled v-model="member.full_name" label="ชื่อ-สกุล *" bg-color="white"
                    :rules="[(val) => (val && val.length > 0) || 'ต้องใส่ชื่อ-สกุล']">
                    <template v-slot:prepend><q-icon name="person" /></template>
                  </q-input>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input outlined dense filled v-model="member.email" label="อีเมล *" type="email" bg-color="white"
                    :rules="[required, isEmail, short]">
                    <template v-slot:prepend><q-icon name="email" /></template>
                  </q-input>
                </div>

                <template v-if="!isEdit">
                  <div class="col-md-6 col-xs-12">
                    <q-input outlined dense filled v-model="member.password" :type="passwordFieldType"
                      label="รหัสผ่าน *" :rules="[required, short]">
                      <template v-slot:prepend><q-icon name="lock" /></template>
                      <template v-slot:append>
                        <q-icon :name="visibilityIcon" @click="switchVisibility" class="cursor-pointer" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-md-6 col-xs-12">
                    <q-input outlined dense filled v-model="member.repassword" :type="passwordFieldType"
                      label="ยืนยันรหัสผ่าน *" :rules="[required, diffPassword]">
                      <template v-slot:prepend><q-icon name="lock" /></template>
                    </q-input>
                  </div>
                </template>
              </div>

              <div class="row justify-center q-gutter-x-md q-mt-md">
                <q-btn :label="btnLabel" type="submit" color="primary" icon="save" unelevated />
                <q-btn label="ยกเลิก" type="reset" color="grey-7" flat icon="clear" />
                <q-btn label="ออก" color="red" flat icon="logout" to="/" />
                <q-btn label="ไปฟอร์มกรอกข้อมูลส่วนตัว" color="secondary" flat icon="skip_next" to="/FormComponent" />
              </div>
            </q-form>
          </q-card>

          <q-table class="custom-green-table shadow-2 full-width" title="ข้อมูลสมาชิก" :rows="members1"
            :columns="columns" row-key="member_id" :filter="filter" :loading="loading" :visible-columns="visibleColumns"
            separator="cell" :rows-per-page-options="[30, 50, 100, 0]"
            :pagination-label="(first, end, total) => `หน้า : ${end}/${total}`">
            <template v-slot:top-right="props">
              <div class="row q-gutter-sm items-center">
                <q-input dense outlined v-model="filter" placeholder="ค้นหาสมาชิก..." bg-color="white"
                  style="width: 200px">
                  <template v-slot:append><q-icon name="search" /></template>
                </q-input>

                <q-input dense outlined v-model="file_export" placeholder="ชื่อไฟล์นำออก" bg-color="white"
                  style="width: 150px" />

                <q-btn flat icon="archive" label="ส่งออก" @click="exportTable" />

                <q-select v-model="visibleColumns" multiple outlined dense options-dense emit-value map-options
                  :options="columns" option-value="name" options-cover style="min-width: 150px" bg-color="white" />

                <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                  @click="props.toggleFullscreen" />
              </div>
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
                  <q-btn size="sm" color="blue" label="แก้ไข" class="q-mr-xs" @click="editUser(props.row.member_id)"
                    unelevated />
                  <q-btn size="sm" color="red" label="ลบ" @click="deleteUser(props.row.member_id, props.row.full_name)"
                    unelevated />
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

<style lang="sass">
.content-area
  background-color: #c8e6c9
  min-height: calc(100vh - 80px)

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
  max-height: 70vh
</style>

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
  data() {
    return {
      file_export: "",
      apiUrl: "",
      title: "การตั้งค่าการลงทะเบียน",
      members: [],
      register: true,
      filter: ref(""),
      loading: ref(false),
      isEdit: false,
      isAdminOrSuperUser: false,
      member: {
        member_id: this.$store.getters.myMember_id,
        full_name: "",
        email: "",
        password: "",
        repassword: "",
        status: "user",
      },
      visibleColumns: ref([
        "actions",
        "full_name",
        "e-mail",
        "password",
        "status",
        "is_verified",
      ]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
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
          label: "สถานะ",
          field: "status",
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
      btnLabel: "เพิ่มข้อมูล",
      btnShow: ref(true),
      visibility: false,
      visibilityIcon: "visibility",
      checkUser: ref(false),
    };
  },
  methods: {
    // นำออกไฟล์ excel
    exportTable() {
      console.log("Export excel");
      var columns = this.columns;
      var rows = this.members1;
      const content = [columns.map((col) => wrapCsvValue(col.label))]
        .concat(
          rows.map((row) =>
            columns
              .map((col) =>
                wrapCsvValue(
                  typeof col.field === "function"
                    ? col.field(row)
                    : row[col.field === void 0 ? col.name : col.field],
                  col.format,
                  row
                )
              )
              .join(",")
          )
        )
        .join("\r\n");

      const status = exportFile(this.file_export, "\ufeff" + content, {
        encoding: "utf-8",
        mimeType: "text/csv;charset=utf-8;",
      });

      if (status !== true) {
        this.$q.notify({
          message: "Browser denied file download...",
          color: "negative",
          icon: "warning",
        });
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
                status: this.member.status,
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
      console.log(" แสดงข้อมูลทั้งหมด ");
      try {
        const res = await axios.get(`${this.apiUrl}/members`);
        this.members1 = res.data;
      } catch (error) {
        console.error(error);
      }
    },
    async addNewMember() {
      console.log("บันทึกข้อมูล");
      try {
        const response = await axios.post(`${this.apiUrl}/auth/register`, {
          full_name: this.member.full_name,
          email: this.member.email,
          password: this.member.password,
          status: this.member.status || "user",
        });

        this.$q.notify({ message: "เพิ่มสมาชิกสำเร็จ", color: "positive" });

        // Add newly registered member to local list so user can see it
        const newMember = {
          member_id: response.data?.member_id || Date.now(),
          full_name: this.member.full_name,
          email: this.member.email,
          password: this.member.password,
          status: this.member.status || "user",
          is_verified: 0,
        };
        this.members1.push(newMember);

        this.resetForm();
      } catch (error) {
        console.error(error);
        const msg = (error.response?.status === 409)
          ? `อีเมล: ${this.member.email} เป็นสมาชิคแล้ว`
          : (error.response?.data?.error || "เพิ่มสมาชิกไม่สำเร็จ");
        this.$q.notify({ message: msg, color: "negative" });
      }
    },
    async checkNewMemeber(email) {
      console.log(" ตรวจสอบผู้ใช้ ", email);
      this.addNewMember();
    },
    async getUpdate() {
      this.getAllUser();
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
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "โหลดข้อมูลไม่สำเร็จ", color: "negative" });
      }
    },
    resetForm() {
      this.member.member_id = 0;
      this.member.full_name = "";
      this.member.email = "";
      this.member.password = "";
      this.member.repassword = "";
      this.member.status = "user";
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
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
    // We no longer pull all members from DB for privacy and speed
    // this.getUpdate();
  },
};
</script>

<!-- <style scoped></style> -->
