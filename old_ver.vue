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
                  <q-input outlined dense filled v-model="member.full_name" label="α╕èα╕╖α╣êα╕¡-α╕¬α╕üα╕╕α╕Ñ" bg-color="white">
                    <template v-slot:prepend><q-icon name="person" /></template>
                  </q-input>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input outlined dense filled v-model="member.email" label="α╕¡α╕╡α╣Çα╕íα╕Ñ" type="email" bg-color="white"
                    :rules="[required, isEmail]">
                    <template v-slot:prepend><q-icon name="email" /></template>
                  </q-input>
                </div>

                <template v-if="!isEdit">
                  <div class="col-md-6 col-xs-12">
                    <q-input outlined dense filled v-model="member.password" :type="passwordFieldType" label="α╕úα╕½α╕▒α╕¬α╕£α╣êα╕▓α╕Ö"
                      :rules="[required, short]">
                      <template v-slot:prepend><q-icon name="lock" /></template>
                      <template v-slot:append>
                        <q-icon :name="visibilityIcon" @click="switchVisibility" class="cursor-pointer" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-md-6 col-xs-12">
                    <q-input outlined dense filled v-model="member.repassword" :type="passwordFieldType"
                      label="α╕óα╕╖α╕Öα╕óα╕▒α╕Öα╕úα╕½α╕▒α╕¬α╕£α╣êα╕▓α╕Ö" :rules="[required, diffPassword]">
                      <template v-slot:prepend><q-icon name="lock" /></template>
                    </q-input>
                  </div>
                </template>
              </div>

              <div class="row justify-center q-gutter-x-md q-mt-md">
                <q-btn :label="isEdit ? 'α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕üα╕▓α╕úα╣üα╕üα╣ëα╣äα╕é' : 'α╕Ñα╕çα╕ùα╕░α╣Çα╕Üα╕╡α╕óα╕Ö'" type="submit" color="primary" icon="save"
                  unelevated />
                <q-btn label="α╕óα╕üα╣Çα╕Ñα╕┤α╕ü" type="reset" color="grey-7" flat icon="clear" />
                <q-btn label="α╕¡α╕¡α╕ü" color="red" flat icon="logout" to="/" />
              </div>
            </q-form>
          </q-card>

          <q-table class="custom-green-table shadow-2 full-width" title="α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╕íα╕▓α╕èα╕┤α╕ü" :rows="members1"
            :columns="columns" row-key="member_id" :filter="filter" :loading="loading" separator="cell"
            :rows-per-page-options="[10, 30, 50, 0]"
            :pagination-label="(first, end, total) => `α╕½α╕Öα╣ëα╕▓ : ${end}/${total}`">
            <template v-slot:top-right>
              <q-input dense outlined v-model="filter" placeholder="α╕äα╣ëα╕Öα╕½α╕▓..." bg-color="white">
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
      title: "α╕üα╕▓α╕úα╕Ñα╕çα╕ùα╕░α╣Çα╕Üα╕╡α╕óα╕Ö",
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
        { name: "actions", align: "center", label: "α╣üα╕üα╣ëα╣äα╕é/α╕Ñα╕Ü" },
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
          label: "α╕èα╕╖α╣êα╕¡-α╕¬α╕üα╕╕α╕Ñ",
          field: (row) => row.full_name,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "e-mail",
          align: "center",
          label: "α╕¡α╕╡α╣Çα╕íα╕Ñα╕óα╣î",
          field: (row) => row.email,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "password",
          align: "center",
          label: "α╕úα╕½α╕▒α╕¬α╕£α╣êα╕▓α╕Ö",
          field: (row) => row.password,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "status",
          align: "center",
          label: "α╕½α╕Öα╣ëα╕▓α╕ùα╕╡α╣ê",
          field: (row) => row.status,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "is_verified",
          align: "center",
          label: "α╕óα╕╖α╕Öα╕óα╕▒α╕Öα╕¡α╕╡α╣Çα╕íα╕Ñα╕óα╣î",
          field: (row) => row.is_verified,
          format: (val) => `${val == 0 ? "α╕óα╕▒α╕çα╣äα╕íα╣êα╕óα╕╖α╕Öα╕óα╕▒α╕Ö" : "α╕óα╕╖α╕Öα╕óα╕▒α╕Ö"}`,
          sortable: true,
        },
      ],
      members1: [],
      $q: useQuasar(),
      passwordFieldType: "password",
      btnLabel: "α╕üα╕öα╕¢α╕╕α╣êα╕í",
      visibility: false,
      visibilityIcon: "visibility",
      checkUser: ref(false),
      isEdit: false,

    };
  },
  methods: {
    submitForm() {
      if (!this.isEdit) {
        this.$q
          .dialog({
            title: "α╕óα╕╖α╕Öα╕óα╕▒α╕Ö",
            message: "α╕äα╕╕α╕ôα╕òα╣ëα╕¡α╕çα╕üα╕▓α╕úα╕¬α╕íα╕▒α╕äα╕úα╕¬α╕íα╕▓α╕èα╕┤α╕äα╕öα╣ëα╕ºα╕óα╕¡α╕╡α╣Çα╕íα╕Ñ : " + this.member.email + " α╕½α╕úα╕╖α╕¡α╣äα╕íα╣ê?",
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.checkNewMemeber(this.member.email);
          });
      } else {
        this.$q
          .dialog({
            title: "α╕óα╕╖α╕Öα╕óα╕▒α╕Ö",
            message: "α╕äα╕╕α╕ôα╕òα╣ëα╕¡α╕çα╕üα╕▓α╕úα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕üα╕▓α╕úα╣üα╕üα╣ëα╣äα╕éα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕½α╕úα╕╖α╕¡α╣äα╕íα╣ê?",
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
              this.$q.notify({ message: "α╣üα╕üα╣ëα╣äα╕éα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╕│α╣Çα╕úα╣çα╕ê", color: "positive" });
              this.isEdit = false;
              this.resetForm();
              this.getUpdate();
            } catch (error) {
              console.error(error);
              this.$q.notify({ message: "α╣üα╕üα╣ëα╣äα╕éα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê: " + (error.response?.data?.error || error.message), color: "negative" });
            }
          });
      }
    },

    async getAllUser() {
      console.log(" α╣üα╕¬α╕öα╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕ùα╕▒α╣ëα╕çα╕½α╕íα╕ö ");
      try {
        const res = await axios.get(`${this.apiUrl}/members`);
        console.log("Registration:", res.data);
        this.members1 = res.data;
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "α╕öα╕╢α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê", color: "negative" });
      }
    },

    async addNewMember() {
      console.log("α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ");
      try {
        await axios.post(`${this.apiUrl}/auth/register`, {
          full_name: this.member.full_name,
          email: this.member.email,
          password: this.member.password,
          status: this.member.status,
        });
        this.$q.notify({ message: "α╕¬α╕íα╕▒α╕äα╕úα╕¬α╕íα╕▓α╕èα╕┤α╕üα╕¬α╕│α╣Çα╕úα╣çα╕ê", color: "positive" });
        this.resetForm();
        this.getUpdate();
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "α╕¬α╕íα╕▒α╕äα╕úα╕¬α╕íα╕▓α╕èα╕┤α╕üα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê: " + (error.response?.data?.error || error.message), color: "negative" });
      }
    },

    async checkNewMemeber(email) {
      console.log(" α╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Üα╕£α╕╣α╣ëα╣âα╕èα╣ë ", email);
      try {
        const res = await axios.get(`${this.apiUrl}/members`);
        const members = Array.isArray(res.data) ? res.data : [];
        const isMember = members.some(m => m.email === email);
        if (isMember) {
          this.$q.dialog({
            title: "α╣üα╕êα╣ëα╕çα╣Çα╕₧α╕╖α╣êα╕¡α╕ùα╕úα╕▓α╕Ü",
            message: "α╕¡α╕╡α╣Çα╕íα╕Ñ:" + email + " α╣Çα╕¢α╣çα╕Öα╕¬α╕íα╕▓α╕èα╕┤α╕äα╣üα╕Ñα╣ëα╕º",
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
        this.$q.notify({ message: "α╣éα╕½α╕Ñα╕öα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê", color: "negative" });
      }
    },

    resetForm() {
      console.log("α╕óα╕üα╣Çα╕Ñα╕┤α╕üα╕üα╕▓α╕úα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ");
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
          title: "α╕óα╕╖α╕Öα╕óα╕▒α╕Ö",
          message: "α╕äα╕╕α╕ôα╕òα╣ëα╕¡α╕çα╕üα╕▓α╕úα╕Ñα╕Ü [" + name + "] α╕½α╕úα╕╖α╕¡α╣äα╕íα╣ê ?",
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await axios.delete(`${this.apiUrl}/members/${id}`);
            this.$q.notify({ message: "α╕Ñα╕Üα╕¬α╕│α╣Çα╕úα╣çα╕ê", color: "positive" });
            this.getUpdate();
          } catch (error) {
            console.error(error);
            this.$q.notify({ message: "α╕Ñα╕Üα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê", color: "negative" });
          }
        });
    },

    required(val) {
      return (val && val.length > 0) || "α╕èα╣êα╕¡α╕çα╕ùα╕╡α╣êα╕òα╣ëα╕¡α╕çα╕üα╕úα╕¡α╕ü";
    },
    diffPassword(val) {
      const val2 = this.member.password;
      return (val && val === val2) || "α╕úα╕½α╕▒α╕¬α╕£α╣êα╕▓α╕Öα╣äα╕íα╣êα╕òα╕úα╕çα╕üα╕▒α╕Ö!";
    },
    short(val) {
      return (val && val.length > 3) || "α╕äα╣êα╕▓α╕¬α╕▒α╣ëα╕Öα╣Çα╕üα╕┤α╕Öα╣äα╕¢";
    },
    isEmail(val) {
      const emailPattern =
        /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return emailPattern.test(val) || "α╕üα╕úα╕╕α╕ôα╕▓α╣âα╕¬α╣êα╕¡α╕╡α╣Çα╕íα╕Ñα╕ùα╕╡α╣êα╕ûα╕╣α╕üα╕òα╣ëα╕¡α╕ç";
    },
    switchTypeForm() {
      this.register = !this.register;
      this.title = this.register ? "α╕£α╕╣α╣ëα╣âα╕èα╣ëα╣âα╕½α╕íα╣ê" : "α╕üα╕▓α╕úα╕¡α╕Öα╕╕α╕ìα╕▓α╕ò";
      this.btnLabel = this.register ? "α╕üα╕▓α╕úα╕Ñα╕çα╕ùα╕░α╣Çα╕Üα╕╡α╕óα╕Ö" : "α╕ùα╕▓α╕çα╣Çα╕éα╣ëα╕▓";
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
    this.getUpdate();
  },

};
</script>

<style lang="sass">
/* α╕₧α╕╖α╣ëα╕Öα╕ùα╕╡α╣êα╣Çα╕éα╕╡α╕óα╕ºα╕¡α╣êα╕¡α╕Öα╕äα╕úα╕¡α╕Üα╕äα╕Ñα╕╕α╕íα╣âα╕òα╣ë Header */
.content-area
  background-color: #c8e6c9
  min-height: calc(100vh - 80px)

/* α╕¢α╕úα╕▒α╕Üα╣üα╕òα╣êα╕çα╕òα╕▓α╕úα╕▓α╕çα╣âα╕½α╣ëα╣Çα╕¢α╣çα╕Öα╕¬α╕╡α╣Çα╕éα╕╡α╕óα╕ºα╣Çα╕éα╣ëα╕íα╕¬α╕Ñα╕▒α╕Üα╣üα╕ûα╕º */
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
