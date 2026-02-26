<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page padding class="items-center justify-center" style="background: linear-gradient(#74c588, #0ad13c)">
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
                      <!-- จบการศึกษา + ปีที่สำเร็จการศึกษา + ชั้นปีที่กำลังศึกษา -->
                      <div class="row">
                        <!-- สถานะการแจ้งเตือน วันที่เริ่มแจ้งเตือน ประเภทการแจ้งเตือน -->
                        <div class="col-md-4 col-xs-12 q-pa-xs">
                          <q-checkbox v-model="is_notification" val="is_notification"
                            label="ฉันต้องการให้มีการแจ้งเตือน" color="teal" true-value="1" false-value="0" />
                        </div>
                        <!-- วันที่เริ่มแจ้งเตือน -->
                        <div class="col-md-4 col-xs-12 q-pa-xs">
                          <q-input filled v-model="notification_date" label="วันเริ่มแจ้งเตือน *"
                            :disable="is_notification == '0'" mask="##/##/####" fill-mask
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
                          <q-select @filter="filterFrequency" use-input color="green" v-model="frequency_id"
                            :options="frequency_options" label="การแจ้งเตือน *" emit-value map-options
                            :disable="is_notification == '0'">
                            <template v-slot:prepend>
                              <q-icon name="notifications_active" />
                            </template>
                            <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                  <q-icon :name="scope.opt.icon || 'notifications'" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                                  <q-item-label caption v-if="scope.opt.description">{{ scope.opt.description }}</q-item-label>
                                </q-item-section>
                              </q-item>
                            </template>
                            <template v-if="frequency_id" v-slot:append>
                              <q-icon name="cancel" @click.stop.prevent="frequency_id = null" class="cursor-pointer" />
                            </template>
                          </q-select>
                        </div>
                      </div>
                      <!-- ข้อความแจ้งเตือน -->
                      <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs">
                          <q-input type="textarea" color="blue-3" standout bottom-slots v-model="message"
                            label="ข้อความแจ้งเตือน" clearable autogrow :disable="is_notification == '0'">
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
                          <q-btn color="primary" label="กลับฟอร์มการลงทะเบียน" no-caps flat icon="skip_previous"
                            to="/RegistrationPage">
                            <q-tooltip class="bg-accent">กลับฟอร์มการลงทะเบียน</q-tooltip>
                          </q-btn>
                          <!-- ไปฟอร์มกำหนดอาชีพเป้าหมาย -->
                          <q-btn color="primary" label="ไปฟอร์มกำหนดอาชีพเป้าหมาย" no-caps flat icon="skip_next"
                            to="/FormPlanCareer">
                            <q-tooltip class="bg-accent">ไปฟอร์มกำหนดอาชีพเป้าหมาย</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-form>
                  </div>
                </div>
                <!-- ตารางข้อมูล -->
                <div class="row">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <div class="q-pa-sm q-gutter-sm">
                      <q-table title="ข้อมูลการแจ้งเตือน" :rows="notification1" :columns="columns" row-key="notification_id"
                        :filter="filter" :loading="loading" separator="cell" table-header-style="height: 65px; "
                        table-header-class="bg-blue-5" :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home"
                        icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                        :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                          return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                        }">
                        <template v-slot:top-right="props">
                          <div class="row items-center q-gutter-sm">
                            <q-input borderless dense debounce="300" v-model="filter"
                              placeholder="ค้นหาข้อมูลการแจ้งเตือน">
                              <template v-slot:append>
                                <q-icon name="search" />
                              </template>
                            </q-input>
                            <q-input borderless dense debounce="300" v-model="file_export" placeholder="ชื่อไฟล์นำออก"
                              outlined>
                              <template v-slot:append>
                                <q-icon name="save" />
                              </template>
                            </q-input>
                            <q-btn flat icon-right="archive" label="ส่งออกไฟล์" @click="exportTable()" />
                            <q-btn flat round dense :icon="props.inFullscreen
                              ? 'fullscreen_exit'
                              : 'fullscreen'
                              " @click="props.toggleFullscreen" />
                          </div>
                        </template>
                        <template v-slot:body-cell-actions="props">
                          <q-td :props="props">
                            <q-btn flat color="blue" icon="edit" @click="editUser(props.row.notification_id)">
                              <q-tooltip>แก้ไข</q-tooltip>
                            </q-btn>
                            <q-btn flat color="red" icon="delete" @click="deleteUser(props.row.notification_id, props.row.notification_date)">
                              <q-tooltip>ลบ</q-tooltip>
                            </q-btn>
                            <q-btn flat color="green" icon="notifications_active" @click="getUpdateNotify(props.row.member_id)">
                              <q-tooltip>ทดสอบแจ้งเตือน</q-tooltip>
                            </q-btn>
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
import { useQuasar, exportFile, date } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig";

export default {
  name: "FormNotificationUser",
  data() {
    return {
      file_export: "",
      title: "การแจ้งเตือน",
      isEdit: false,
      btnLabel: "เพิ่มข้อมูล",
      columns: [
        { name: "actions", align: "center", label: "จัดการ" },
        { name: "message", align: "left", label: "ข้อความแจ้งเตือน", field: "message", sortable: true },
        { name: "notification_date", align: "center", label: "วันเริ่มแจ้งเตือน", field: "notification_date", sortable: true },
        { name: "frequency_name", align: "center", label: "ความถี่", field: "frequency_name", sortable: true },
      ],
      filter: "",
      loading: false,
      $q: useQuasar(),
      member_id: this.$store.getters.myMember_id,
      notification_id: "",
      is_notification: "0",
      frequency_id: null,
      frequency_options: [],
      original_frequency_options: [],
      notification_date: "",
      notification1: [],
      message: "",
    };
  },

  methods: {
    yearToDay(d) {
      if (!d) return "";
      const p = d.split("/");
      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
    },
    dayToYear(d) {
      if (!d) return "";
      const p = d.split("/");
      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
    },
    exportTable() {
      if (this.notification1.length === 0) {
        this.$q.notify({ message: "ไม่พบข้อมูลสำหรับส่งออก", color: "warning" });
        return;
      }
      const header = this.columns.map(c => `"${c.label}"`).join(",");
      const content = this.notification1.map(row =>
        this.columns.map(col => `"${row[col.field] || ''}"`).join(",")
      ).join("\r\n");

      const status = exportFile(
        (this.file_export || "notifications") + ".csv",
        "\ufeff" + header + "\r\n" + content,
        "text/csv"
      );
      if (status !== true) this.$q.notify({ message: "Browser denied file download", color: "negative" });
    },
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.is_notification = "0";
      this.notification_date = "";
      this.frequency_id = null;
      this.message = "";
    },
    async submitForm() {
      if (this.is_notification === "1" && (!this.notification_date || !this.frequency_id)) {
        this.$q.notify({ message: "กรุณากรอกข้อมูลวันที่และความถี่ให้ครบถ้วน", color: "warning" });
        return;
      }

      const msg = this.isEdit ? "คุณต้องการบันทึกการแก้ไขหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message: msg, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            const payload = {
              member_id: this.member_id,
              notification_date: this.yearToDay(this.notification_date),
              notification_type: this.frequency_id,
              is_notification: this.is_notification,
              message: this.message,
            };

            const url = `${getRestApiUrl(this.$store)}/notifications`;
            if (!this.isEdit) {
              await axios.post(url, payload);
              this.$q.notify({ message: "เพิ่มข้อมูลสำเร็จ", color: "positive" });
            } else {
              await axios.put(`${url}/${this.notification_id}`, payload);
              this.$q.notify({ message: "แก้ไขข้อมูลสำเร็จ", color: "positive" });
            }
            this.resetForm();
            this.getUpdate();
          } catch (error) {
            console.error(error);
            this.$q.notify({ message: "Error: " + error.message, color: "negative" });
          }
        });
    },
    async editUser(id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/notifications/${id}`);
        const d = res.data;
        this.notification_id = d.notification_id;
        this.is_notification = String(d.is_notification);
        this.notification_date = this.dayToYear(d.notification_date);
        this.frequency_id = d.notification_type;
        this.message = d.message;
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "โหลดข้อมูลไม่สำเร็จ", color: "negative" });
      }
    },
    async deleteUser(id, dateStr) {
      this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบข้อมูล [${id}-${dateStr}] หรือไม่?`, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            await axios.delete(`${getRestApiUrl(this.$store)}/notifications/${id}`);
            this.$q.notify({ message: "ลบสำเร็จ", color: "positive" });
            this.getUpdate();
          } catch (error) {
            console.error(error);
            this.$q.notify({ message: "ลบไม่สำเร็จ", color: "negative" });
          }
        });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/notifications`, {
          params: { member_id: this.member_id }
        });
        this.notification1 = res.data;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async getFrequency() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/frequencies`);
        this.original_frequency_options = res.data.map(i => ({
          label: i.frequency_name,
          value: i.frequency_id
        }));
        this.frequency_options = [...this.original_frequency_options];
      } catch (error) {
        console.error(error);
      }
    },
    filterFrequency(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.frequency_options = this.original_frequency_options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    async getUpdateNotify(member_id) {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/notifications/latest`, {
          params: { member_id }
        });
        if (res.data) {
          const dStr = this.dayToYear(res.data.notification_date);
          this.checkNotify(dStr, res.data.frequency_name, res.data.message);
        }
      } catch (error) {
        console.error(error);
      }
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
        this.$q.notify({
          message: `ครบกำหนดการแจ้งเตือนราย${frequency}: ${msg}`,
          color: "primary",
          actions: [{ label: "Dismiss", color: "white" }]
        });
      } else {
        this.$q.notify({ message: "ยังไม่ถึงกำหนดเวลาการแจ้งเตือนรอบถัดไป", color: "info" });
      }
    },
    nextItem() {
      // Placeholder for next item navigation if implemented
    }
  },
  async mounted() {
    await this.getFrequency();
    await this.getUpdate();
    if (this.notification1.length > 0) {
      await this.getUpdateNotify(this.member_id);
    }
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
