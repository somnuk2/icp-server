<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page padding class="items-center justify-center" style="background: linear-gradient(135deg, #74c588 0%, #0ad13c 100%); min-height: 100vh;">
          <div class="full-width">
            <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
              <q-card flat class="bg-white text-black">
                <q-card-section class="bg-blue-14">
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
                          <q-input type="textarea" color="blue-3" standout bottom-slots v-model="message"
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
                          <q-btn :label="btnLabel" type="submit" color="primary" />
                          <!-- ยกเลิก -->
                          <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" />
                          <!-- ออก -->
                          <q-btn label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                          <!-- กลับฟอร์มการลงทะเบียน -->
                          <q-btn color="primary" label="กลับฟอร์มการประเมินตนเอง" no-caps flat to="/SuserFormSelfAssessment">
                            <q-tooltip class="bg-accent">กลับฟอร์มการประเมินตนเอง</q-tooltip>
                          </q-btn>
                          <!-- ไปฟอร์มกำหนดอาชีพเป้าหมาย -->
                          <q-btn color="primary" label="ไปฟอร์มรายงานดารพัฒนาตนเอง" no-caps flat to="/SuserFormReport">
                            <q-tooltip class="bg-accent">ไปฟอร์มรายงานดารพัฒนาตนเอง</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-form>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <div class="q-pa-xs">
                      <q-table title="รายงานการแจ้งเตือน" :rows="notification1" :columns="columns" row-key="notification_id"
                        :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        selection="multiple" v-model:selected="selected"
                        table-header-style="height: 65px;" table-header-class="bg-primary text-white"
                        :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home" icon-last-page="all_inclusive"
                        icon-next-page="arrow_right" icon-prev-page="arrow_left" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                          return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                        }">
                        <template v-slot:top-right="props">
                          <div class="row q-gutter-sm items-center">
                            <q-btn v-if="selected.length > 0" flat color="red" :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />

                            <q-input borderless dense debounce="300" v-model="filter"
                                placeholder="ค้นหาข้อมูลการแจ้งเตือน">
                                <template v-slot:append>
                                  <q-icon name="search" />
                                </template>
                              </q-input>
                              <q-select v-model="visibleColumns" multiple outlined dense options-dense
                                :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                                option-value="name" options-cover style="min-width: 150px" bg-color="white" />
                              <q-btn flat round dense :@click="props.toggleFullscreen" />
                              <q-btn flat color="black" label="ส่งออก excel" @click="exportTable()" />
                          </div>
                        </template>
                        <template v-slot:body-cell-actions="props">
                          <q-td :props="props" class="text-center">
                            <q-btn size="sm" color="blue" label="แก้ไข" unelevated no-caps @click="editUser(props.row.notification_id)" />
                            <q-btn size="sm" color="red" label="ลบ" unelevated no-caps @click="
                              deleteUser(
                                props.row.notification_id,
                                props.row.notification_date
                              )
                              " />
                            <q-btn size="sm" color="green" label="เตือน" unelevated no-caps @click="getUpdateNotify(props.row.member_id)" /></q-td>
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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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
  name: "FormNotificationSuperUser",
  data() {
    return {
      file_export: "",
      title: "การแจ้งเตือน(ผู้ดูแลกลุ่ม)",
      isEdit: false,
      btnLabel: "เพิ่มข้อมูล",
      visibleColumns: ref(["actions", "full_name", "message", "notification_date", "frequency_name"]),
      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ", style: "width: 170px;", headerStyle: "width: 170px;" },
        { name: "full_name", align: "left", label: "ชื่อ-สกุล", field: "full_name", sortable: true },
        { name: "message", align: "left", label: "ข้อความ", field: "message", sortable: true },
        { name: "notification_date", align: "center", label: "วันเริ่มแจ้งเตือน", field: "notification_date", sortable: true },
        { name: "frequency_name", align: "center", label: "ความถี่", field: "frequency_name", sortable: true },
      ],
      filter: ref(""),
      loading: ref(false),
      $q: useQuasar(),
      notification_id: "",
      is_notification: "0",
      frequency_id: null,
      frequency: { options: [] },
      frequency_: { options: [] },
      message: "",
      notification_date: "",
      notification1: [],
      members: { options: [] },
      members_: { options: [] },
      member: ref({ label: "", value: "", description: "" }),
      selected: ref([]),
    };
  },
  methods: {
    async exportTable() {
      const rows = this.selected.length > 0 ? this.selected : this.notification1;
      if (!rows || rows.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูล' });
        return;
      }
      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Notifications');
        const headerRow = worksheet.getRow(1);
        headerRow.values = this.columns.filter(c => c.name !== 'actions').map(c => c.label);
        rows.forEach(row => {
          worksheet.addRow(this.columns.filter(c => c.name !== 'actions').map(c => row[c.field] || '-'));
        });
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Notifications_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
        this.$q.notify({ color: 'positive', message: 'ส่งออกสำเร็จ' });
      } catch (error) { console.error(error); }
      finally { this.$q.loading.hide(); }
    },
    yearToDay(d_m_y) {
      if (!d_m_y) return "";
      const [d, m, y] = d_m_y.split("/");
      return `${y}/${m}/${d}`;
    },
    dayToYear(y_m_d) {
      if (!y_m_d || y_m_d === "0000/00/00") return "00/00/0000";
      const [y, m, d] = y_m_d.split("/");
      return `${d}/${m}/${y}`;
    },
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.is_notification = "0";
      this.notification_date = "";
      this.frequency_id = null;
      this.message = "";
      this.member = { label: "", value: "", description: "" };
    },
    async submitForm() {
      const message = this.isEdit ? `คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?` : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            const payload = {
              member_id: this.member.value,
              notification_date: this.yearToDay(this.notification_date),
              notification_type: this.frequency_id,
              is_notification: this.is_notification,
              message: this.message,
            };
            if (!this.isEdit) {
              await axios.post(`${getRestApiUrl(this.$store)}/notifications`, payload);
              this.$q.notify({ message: "บันทึกสำเร็จ", color: "positive" });
            } else {
              await axios.put(`${getRestApiUrl(this.$store)}/notifications/${this.notification_id}`, payload);
              this.$q.notify({ message: "แก้ไขสำเร็จ", color: "positive" });
            }
            this.resetForm();
            this.getUpdate();
          } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
        });
    },
    async editUser(id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      this.notification_id = id;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/notifications/${id}`);
        const d = res.data;
        this.is_notification = String(d.is_notification);
        this.notification_date = this.dayToYear(d.notification_date);
        this.frequency_id = d.notification_type;
        this.message = d.message;
        this.member = { label: d.full_name, value: d.member_id, description: d.status };
      } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
    },
    async deleteUser(id, dateStr) {
      this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบข้อมูลวันที่ [ ${dateStr} ] หรือไม่ ?`, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            await axios.delete(`${getRestApiUrl(this.$store)}/notifications/${id}`);
            this.$q.notify({ message: "ลบสำเร็จ", color: "positive" });
            this.selected = this.selected.filter(item => item.notification_id !== id);
            this.getUpdate();
          } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
        });
    },

    deleteSelected() {
      if (this.selected.length === 0) return;

      this.$q.dialog({
        title: "ยืนยันการลบหลายรายการ",
        message: `คุณต้องการลบข้อมูลการแจ้งเตือนที่เลือกทั้งหมด ${this.selected.length} รายการหรือไม่?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        this.$q.loading.show({ message: "กำลังลบข้อมูลที่เลือก...", spinnerColor: "red" });
        try {
          const restBaseUrl = getRestApiUrl(this.$store);
          for (const item of this.selected) {
            await axios.delete(`${restBaseUrl}/notifications/${item.notification_id}`);
          }
          this.$q.notify({ message: `ลบการแจ้งเตือน ${this.selected.length} รายการสำเร็จ`, color: "positive", icon: "check_circle" });
          this.selected = [];
          this.resetForm();
          await this.getUpdate();
        } catch (error) {
          console.error(error);
          this.$q.notify({ message: "เกิดข้อผิดพลาดในการลบข้อมูลการแจ้งเตือนบางรายการ", color: "negative", icon: "error" });
        } finally {
          this.$q.loading.hide();
        }
      });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const mid = this.$store.getters.myMember_id;
        const res = await axios.get(`${getRestApiUrl(this.$store)}/notifications`, { params: { member_id: mid } });
        this.notification1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) { console.error(error); }
      finally { this.loading = false; }
    },
    async getFrequency() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/frequencies`);
        this.frequency.options = res.data.map(i => ({ label: i.frequency_name, value: i.frequency_id }));
        this.frequency_.options = this.frequency.options;
      } catch (error) { console.error(error); }
    },
    async getUpdateNotify(member_id) {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/notifications/latest`, { params: { member_id } });
        if (res.data) {
          const dStr = this.dayToYear(res.data.notification_date);
          this.checkNotify(dStr, res.data.frequency_name, res.data.message);
        }
      } catch (error) { console.error(error); }
    },
    checkNotify(dateStr, frequency, msg) {
      const current = new Date();
      const specific = date.extractDate(dateStr, "DD/MM/YYYY");
      const diff = date.getDateDiff(current, specific, "days");
      let freq = 0;
      if (frequency === "วัน") freq = 1;
      else if (frequency === "สัปดาห์") freq = 7;
      else if (frequency === "เดือน") freq = 30;
      if (freq > 0 && parseInt(diff) % freq === 0) {
        this.$q.notify({ message: `ครบกำหนดการแจ้งเตือนราย${frequency}: ${msg}`, color: "primary", actions: [{ label: "Dismiss", color: "white" }] });
      }
    },
    async getMember() {
      try {
        const mid = this.$store.getters.myMember_id;
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members/created_by/${mid}`);
        this.members.options = res.data.map(i => ({ label: i.full_name, value: i.member_id, description: i.status }));
        this.members_.options = this.members.options;
      } catch (error) { console.error(error); }
    },
    onMemberNames(m) {
      if (m) this.getUpdateNotify(m.value);
    },
    onMember(m) {
      if (!m) this.member = { label: "", value: "", description: "" };
    },
    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterFrequency(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.frequency.options = this.frequency_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
  },
  mounted() {
    this.getMember();
    this.getFrequency();
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
