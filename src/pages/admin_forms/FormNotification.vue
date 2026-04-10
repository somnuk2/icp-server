<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page padding class="items-center justify-center bg-grey-2" style="min-height: 100vh;">
          <div class="full-width">
            <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
              <q-card flat class="bg-white text-black">
                <q-card-section class="bg-primary">
                  <h4 class="text-h5 text-white q-my-xs text-center">
                    {{ title }}
                  </h4>
                </q-card-section>
                <div class="row full-width">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <q-form @submit.prevent="submitForm()" @reset="resetForm()" method="post" class="q-gutter-md">
                      <!-- รายชื่อ -->
                      <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs">
                          <q-select use-input @filter="filterMember" color="primary" v-model="member"
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
                      <!-- การแจ้งเตือน วัน/สัปดาห์/เดือน/ -->
                      <div class="row">
                        <!-- สถานะการแจ้งเตือน วันที่เริ่มแจ้งเตือน ประเภทการแจ้งเตือน -->
                        <div class="col-md-4 col-xs-12 q-pa-xs">
                          <q-checkbox v-model="is_notification" val="is_notification" label="ฉันต้องการให้มีการแจ้งเตือน"
                            color="teal" true-value="1" false-value="0" />
                        </div>
                        <!-- วันที่เริ่มแจ้งเตือน -->
                        <div class="col-md-4 col-xs-12 q-pa-xs">
                          <q-input filled v-model="notification_date" label="วันเริ่มแจ้งเตือน"
                            :disable="is_notification == '1' ? false : true" mask="##/##/####" fill-mask
                            hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn clearable>
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                  <q-date v-model="notification_date" mask="DD/MM/YYYY">
                                    <div class="row items-center justify-end">
                                      <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                  </q-date>
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                        </div>
                        <!-- ประเภทการแจ้งเตือน -->
                        <div class="col-md-4 col-xs-12 q-pa-xs">
                          <q-select @filter="filterFrequency" use-input color="green" v-model="frequency.options.value"
                            :options="frequency.options" label="การแจ้งเตือน" emit-value map-options
                            :disable="is_notification == '1' ? false : true">
                            <template v-slot:prepend>
                              <q-icon name="notifications_active" />
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
                            <template v-if="frequency.options.value" v-slot:append>
                              <q-icon name="cancel" @click.stop.prevent="
                                frequency.options.value = null
                                " class="cursor-pointer" />
                            </template>
                          </q-select>
                        </div>
                      </div>
                      <!-- ข้อความแจ้งเตือน -->
                      <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs">
                          <q-input type="textarea" color="primary" standout="bg-primary text-white" bottom-slots v-model="message"
                            label="ข้อความแจ้งเตือน" clearable autogrow :disable="is_notification == '1' ? false : true">
                            <template v-slot:prepend>
                              <q-icon name="play_lesson" />
                            </template>
                            <template v-slot:append>
                              <q-icon name="favorite" />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <!-- ปุ่มตวบคุม -->
                      <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                          <!-- บันทึก/แก้ไข -->
                          <q-btn :label="btnLabel" type="submit" color="primary" icon="save" />
                          <!-- ยกเลิก -->
                          <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" icon="clear" />
                          <!-- ออก -->
                          <q-btn icon="logout" label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                          <!-- กลับฟอร์มการลงทะเบียน -->
                          <q-btn color="primary" label="กลับฟอร์มการประเมินตนเอง" no-caps flat icon="skip_previous"
                            to="/AdminFormSelfAssessment">
                            <q-tooltip class="bg-accent">กลับฟอร์มการประเมินตนเอง</q-tooltip>
                          </q-btn>
                          <!-- ไปฟอร์มกำหนดอาชีพเป้าหมาย -->
                          <q-btn color="primary" label="ไปฟอร์มรายงาน" no-caps flat icon="skip_next"
                            to="/AdminFormReport">
                            <q-tooltip class="bg-accent">ไปฟอร์มรายงาน</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-form>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <div class="q-pa-xs">
                      <q-table title="ข้อมูลส่วนตัว" :rows="notification1" :columns="columns" row-key="name"
                        :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        table-header-style="height: 65px; " table-header-class="bg-primary text-white"
                        :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home" icon-last-page="all_inclusive"
                        icon-next-page="arrow_right" icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                          return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                        }">
                        <template v-slot:top-right="props">
                          <div class="row">
                            <div class="col-md-5 col-xs-5 q-pa-xs">
                              <q-input borderless dense debounce="300" v-model="filter"
                                placeholder="ค้นหาข้อมูลการแจ้งเตือน">
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
                            <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.notification_id)"
                              no-caps></q-btn>
                            <q-btn color="red" label="ลบ" @click="
                              deleteUser(
                                props.row.notification_id,
                                props.row.notification_date
                              )
                              " no-caps></q-btn>
                            <q-btn color="green" label="เตือน" @click="getUpdateNotify(props.row.member_id)"
                              no-caps></q-btn>
                          </q-td>
                        </template>
                      </q-table>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-page>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useQuasar } from "quasar";
import { exportFile } from "quasar";
import { date } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig";

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
  name: "FormNotificationAdmin",
  components: {},
  data() {
    return {
      file_export: "",
      pdpa: ref(false),
      picked: new Date(),
      url_api_plan: "",
      url_api_individual: "",
      url_api_notification: "",
      // ------------------------------------------------------------------------------

      title: "การแจ้งเตือน(ผู้ดูแลระบบ)",
      isEdit: false,
      btnLabel: "เพิ่มข้อมูล",
      status: "บันทึก",
      visibleColumns: ref([
        "actions",
        "notification_id",
        "member_id",
        "full_name",
        "is_notification",
        "message",
        "notification_date",
        "frequency_id",
        "frequency_name",
      ]),
      columns: [
        // ข้อมูลส่วนตัว
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        // {
        //   name: "notification_id",
        //   required: true,
        //   label: "รหัสแจ้งเตือน",
        //   align: "center",
        //   field: (row) => row.notification_id,
        //   format: (val) => `${val}`,
        //   sortable: true,
        // },
        {
          name: "full_name",
          align: "left",
          label: "ชื่อ-สกุล",
          field: "full_name",
          sortable: true,
        },
        // {
        //   name: "is_notification",
        //   align: "center",
        //   label: "ต้องการแจ้งเตือน",
        //   field: "is_notification",
        //   sortable: true,
        // },
        {
          name: "message",
          align: "left",
          label: "ข้อความ",
          field: "message",
          sortable: true,
        },
        {
          name: "notification_date",
          align: "center",
          label: "วันเริ่มแจ้งเตือน",
          field: "notification_date",
          sortable: true,
        },
        {
          name: "frequency_name",
          align: "center",
          label: "ความถี่",
          field: "frequency_name",
          sortable: true,
        },
      ],
      filter: ref(""),
      loading: ref(false),
      $q: useQuasar(),
      member_id: this.$store.getters.myMember_id,
      name: this.$store.getters.myName,
      notification_id: "",
      is_notification: "0",
      frequency_id: "",
      frequency_: {
        options: [],
      },
      frequency: {
        options: [],
      },
      message: "",
      notification_date: "",
      notification1: [],
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
    exportTable() {
      console.log("Export excel");
      var columns = this.columns;
      var rows = this.notification1;
      // naive encoding to csv format
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
        $q.notify({
          message: "Browser denied file download...",
          color: "negative",
          icon: "warning",
        });
      }
    },
    resetForm() {
      this.isEdit = false;
      console.log("isEdit:", this.isEdit);
      this.btnLabel = "เพิ่มข้อมูล";
      console.log("ยกเลิกการบันทึกข้อมูล");
      this.members.options.value = "";
      this.members.options.label = "";
      this.notification_date = "";
      this.is_notification = "0";
      this.frequency.options.label = "";
      this.frequency.options.value = "";
      this.message = "";
    },
    async submitForm() {
      const start_date = this.yearToDay(this.notification_date);
      const data = {
        member_id: this.member_id,
        notification_date: start_date,
        notification_type: this.frequency.options.value,
        is_notification: this.is_notification,
        message: this.message,
      };

      const msg = this.isEdit
        ? "คุณต้องการบันทึกการเแก้ไขข้อมูล : " + this.notification_date
        : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";

      this.$q.dialog({
        title: "ยืนยัน",
        message: msg,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          if (!this.isEdit) {
            await axios.post(this.url_api_notification, data);
            this.$q.notify({ message: "บันทึกข้อมูลสำเร็จ", color: "positive", icon: "check_circle" });
          } else {
            await axios.put(`${this.url_api_notification}/${this.notification_id}`, data);
            this.$q.notify({ message: "แก้ไขข้อมูลสำเร็จ", color: "positive", icon: "check_circle" });
          }
          this.resetForm();
          await this.getUpdate(this.member_id);
        } catch (error) {
          console.error(error);
          this.$q.notify({
            message: "เกิดข้อผิดพลาด: " + (error.response?.data?.error || error.message),
            color: "negative",
            icon: "error"
          });
        }
      });
    },
    async editUser(notification_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const response = await axios.get(`${this.url_api_notification}/${notification_id}`);
        const data = response.data;
        this.notification_id = data.notification_id;
        this.is_notification = String(data.is_notification);
        this.notification_date = this.dayToYear(data.notification_date);
        this.member_id = data.member_id;
        this.frequency.options.label = data.frequency_name;
        this.frequency.options.value = data.notification_type;
        this.message = data.message;

        this.member = {
          value: data.member_id,
          label: data.full_name,
          description: data.status
        };
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "เกิดข้อผิดพลาดในการโหลดข้อมูล", color: "negative", icon: "error" });
      }
    },
    deleteUser(notification_id, notification_date) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [ ${notification_id} - ${notification_date} ] หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${this.url_api_notification}/${notification_id}`);
          this.$q.notify({ message: "ลบข้อมูลสำเร็จ", color: "positive", icon: "check_circle" });
          await this.getUpdate(this.member_id);
        } catch (error) {
          console.error(error);
          this.$q.notify({ message: "เกิดข้อผิดพลาดในการลบข้อมูล", color: "negative", icon: "error" });
        }
      });
    },
    async getUpdate(member_id) {
      this.loading = true;
      try {
        const res = await axios.get(this.url_api_notification, { params: { member_id } });
        this.notification1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "โหลดข้อมูลไม่สำเร็จ", color: "negative", icon: "error" });
      } finally {
        this.loading = false;
      }
    },
    onNext() {
      this.$router.replace({ name: "FormPlanCareer" });
    },
    onPrevious() {
      this.$router.replace({ name: "FormPlanCareer" });
    },
    async getFrequency() {
      try {
        const res = await axios.get(this.url_api_frequency);
        if (res.data && Array.isArray(res.data)) {
          this.frequency.options = res.data.map(i => ({
            label: i.frequency_name,
            value: i.frequency_id
          }));
          this.frequency_.options = [...this.frequency.options];
        }
      } catch (err) { console.error(err); }
    },
    filterFrequency(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.frequency.options = this.frequency_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    onMember(member) {
      if (!member) this.member = { label: "", value: "", description: "" };
    },
    async getUpdateNotify(member_id) {
      try {
        const res = await axios.get(`${this.url_api_notification}/latest`, { params: { member_id } });
        if (res.data && Object.keys(res.data).length > 0) {
          const notification_date = this.dayToYear(res.data.notification_date);
          const frequency_name = res.data.frequency_name;
          const message = res.data.message;
          this.currentDate(notification_date, frequency_name, message);
        }
      } catch (err) { console.error(err); }
    },
    currentDate(specific_, frequency, message) {
      const current = new Date();
      const specific = date.extractDate(specific_, "DD/MM/YYYY");
      const diff_days = date.getDateDiff(current, specific, "days");
      let freq = 0;
      if (frequency === "วัน") freq = 1;
      else if (frequency === "สัปดาห์") freq = 7;
      else if (frequency === "เดือน") freq = 30;

      if (freq > 0 && parseInt(diff_days) % freq === 0) {
        this.$q.notify({
          message: `ครบกำหนดการแจ้งเตือนราย${frequency}: ${message}`,
          color: "primary",
          actions: [{ label: "Dismiss", color: "white", handler: () => {} }]
        });
      }
    },
    async getMember() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members/options`);
        if (res.data && Array.isArray(res.data)) {
          this.members.options = res.data.map(i => ({ label: i.full_name, value: i.member_id, description: i.status }));
          this.members_.options = [...this.members.options];
        }
      } catch (err) { console.error(err); }
      finally { this.loading = false; }
    },
    onMemberNames(member) {
      if (member) this.member_id = member.value;
    },
  },
  mounted() {
    this.getMember();
    this.getFrequency();
    var member_id = this.member_id;
    this.getUpdate(member_id);
    this.getUpdateNotify(member_id);
  },
  created() {
    const restBaseUrl = getRestApiUrl(this.$store);
    this.url_api_notification = `${restBaseUrl}/notifications`;
    this.url_api_plan = `${restBaseUrl}/plans`;
    this.url_api_individual = `${restBaseUrl}/individuals`;
    this.url_api_frequency = `${restBaseUrl}/frequencies`;
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
