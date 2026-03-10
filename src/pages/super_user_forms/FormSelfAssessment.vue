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
                          :options="plan_careers.options" label="อาชีพเป้าหมาย *" stack-label @update:model-value="(plan_career_id) => onPlan_career(plan_career_id)
                          ">
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
                              onPlan_career_((plan_career = null))
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
                      <!-- คุณสมบัติ -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select use-input @filter="filterQa_plan_career" color="blue-3" v-model="qa_plan_career"
                          :options="qa_plan_careers.options" label="คุณสมบัติ/ทักษะ *" stack-label @update:model-value="(qa_plan_career_id) =>
                            onDescription(qa_plan_career_id)
                          ">
                          <template v-slot:prepend>
                            <q-icon name="school" />
                          </template>
                          <template v-slot:selected>
                            คุณสมบัติ:
                            <q-chip v-if="qa_plan_career" dense square color="white" text-color="primary"
                              class="q-pa-xs">
                              {{
                                qa_plan_career.label != ""
                                  ? qa_plan_career.label
                                  : ""
                              }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                          </template>
                          <template v-if="qa_plan_career" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="
                              onQa_Plan_career_((qa_plan_career = null))
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
                    </div>
                    <!-- ระดับความสำคัญ/ค่าเป้าหมาย -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <q-input type="textarea" color="blue-3" standout bottom-slots
                          v-model="qa_plan_career_description" label="ความสำคัญ/เป้าหมาย" clearable autogrow>
                          <template v-slot:prepend>
                            <q-icon name="play_lesson" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="favorite" />
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <!-- วันประเมินตนเอง -->
                    <div class="row">
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-input filled v-model="self_assessment_date" label="วันประเมินตนเอง *" mask="##/##/####"
                          fill-mask hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn clearable>
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="self_assessment_date" mask="DD/MM/YYYY">
                                  <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                </q-date>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <!-- ประเมินตนเอง -->
                      <div class="col-md-6 col-xs-12 q-pa-xs">
                        <q-select @filter="filterPerform" use-input color="green" v-model="perform_id"
                          :options="perform.options" label="ผลการพัฒนาตนเอง" emit-value map-options>
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
                          <template v-if="perform_id" v-slot:append>
                            <q-icon name="cancel" @click.stop.prevent="perform_id = null" class="cursor-pointer" />
                          </template>
                        </q-select>
                      </div>
                    </div>
                    <!-- การอ้างอิง -->
                    <div class="row">
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <div class="q-pa-xs">
                          <q-table title="ข้อมูลผลงาน" :rows="references1" :columns="references" row-key="name"
                            :filter="filter_reference" :loading="loading" :visible-columns="visibleColumnsReference"
                            separator="cell" table-header-style="height: 65px; " table-header-class="bg-blue-5"
                            :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home"
                            icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                            :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                              return `หน้า : ${endRowIndex}/${totalRowsNumber}`
                            }">
                            <!-- ค้นหา -->
                            <template v-slot:top-right="props">
                              <!-- ค้นหา -->
                              <div class="row">
                                <div class="col-md-3 col-xs-4 q-pa-xs">
                                  <q-input borderless dense debounce="300" v-model="filter_reference"
                                    placeholder="ค้นหาผลงาน">
                                    <template v-slot:append>
                                      <q-icon name="search" />
                                    </template>
                                  </q-input>
                                </div>
                                <!-- ส่งออก excel -->
                                <div class="col-md-3 col-xs-4 q-pa-xs">
                                  <q-input borderless dense debounce="300" v-model="file_export"
                                    placeholder="ชื่อไฟล์นำออก" outlined>
                                    <template v-slot:append>
                                      <q-icon name="save" />
                                    </template>
                                  </q-input>
                                </div>
                                <div class="col-md-3 col-xs-4 q-pa-xs">
                                  <q-btn flat icon-right="archive" label="ส่งออกไฟล์" @click="exportTable()" />
                                </div>
                                <!-- ปุ่มเพิ่มแหล่งอ้างอิง -->
                                <div class="col-md-2 col-xs-4 q-pa-xs">
                                  <q-btn rounded flat @click="show_dialog = true" icon="add_circle" label="เพิ่มข้อมูล"
                                    no-caps>
                                    <q-tooltip class="bg-accent">เพิ่มแหล่งอ้างอิง/ผลงาน</q-tooltip>
                                  </q-btn>
                                </div>
                                <div class="col-md-1 col-xs-4 q-pa-xs">
                                  <q-btn flat round dense :icon="props.inFullscreen
                                    ? 'fullscreen_exit'
                                    : 'fullscreen'
                                    " @click="props.toggleFullscreen" class="q-ml-md" />
                                </div>
                              </div>
                              <!-- dialog เพิ่มข้อมูล -->
                              <div class="q-pa-sm q-gutter-sm">
                                <q-dialog v-model="show_dialog">
                                  <q-card>
                                    <q-card-section>
                                      <div class="text-h6">
                                        เพิ่มข้อมูลอ้างอิง/ผลงาน
                                      </div>
                                    </q-card-section>
                                    <q-card-section>
                                      <!-- <q-input v-model="editedReference.reference_id" label="รหัสผลงาน" :disable="true" /> -->
                                      <q-input v-model="editedReference.reference_description
                                        " label="แหล่งช้อมูลอ้างอิง/ผลงาน" />
                                    </q-card-section>
                                    <q-card-actions align="right">
                                      <q-btn flat :label="btnLabel_" color="primary" v-close-popup
                                        @click="addRow"></q-btn>
                                    </q-card-actions>
                                  </q-card>
                                </q-dialog>
                              </div>
                              <!-- แหล่งข้อมูลอ้างอิง -->
                            </template>
                            <!-- แก้ไขข้อมูล + ลบข้อมูล -->
                            <template v-slot:body-cell-actions="props">
                              <q-td :props="props">
                                <!-- แก้ไขข้อมูล -->
                                <q-btn color="blue" label="แก้ไข" @click="editItem(props.row)" no-caps></q-btn>
                                <!-- ลบข้อมูล -->
                                <q-btn color="red" label="ลบ" @click="deleteItem(props.row)" no-caps></q-btn>
                              </q-td>
                            </template>
                          </q-table>
                        </div>
                      </div>
                    </div>
                    <!-- ปุ่มควบคุม -->
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
                        <q-btn color="primary" label="กลับฟอร์มการพัฒนาตนเอง" no-caps flat icon="skip_previous"
                          to="/SuserFormPlan">
                          <q-tooltip class="bg-accent">กลับฟอร์มการพัฒนาตนเอง</q-tooltip>
                        </q-btn>
                        <!-- ไปรายงานการประเมินตนเอง -->
                        <q-btn color="primary" label="ไปฟอร์มการแจ้งเตือน" no-caps flat icon="skip_next"
                          to="/SuserFormNotification">
                          <q-tooltip class="bg-accent">ไปฟอร์มการแจ้งเตือน</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <!-- ส่วนการกรองข้อมูล (Filter Section) -->
                    <div class="row q-col-gutter-sm q-mb-md">
                      <div class="col-12">
                        <q-card flat bordered class="bg-blue-1">
                          <q-item class="bg-blue-2">
                            <q-item-section avatar>
                              <q-icon name="manage_search" color="primary" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-bold text-primary text-subtitle1">ส่วนที่ 1:
                                ค้นหาและกรองข้อมูล</q-item-label>
                              <q-item-label caption
                                class="text-primary">ระบุเงื่อนไขเพื่อดึงข้อมูลการประเมินที่ต้องการ</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-card-section class="q-py-md">
                            <div class="row q-col-gutter-sm items-center">
                              <!-- ส่วนเลือกปี -->
                              <div class="col-md-10 col-xs-12">
                                <q-select dense outlined bg-color="white" v-model="years_id" :options="years.options"
                                  label="เลือกปีที่ต้องการค้นหา" emit-value map-options
                                  @update:model-value="(val) => on_years(val)" @filter="filterYear">
                                  <template v-slot:prepend>
                                    <q-icon name="calendar_today" color="primary" />
                                  </template>
                                </q-select>
                              </div>
                              <!-- ปุ่มกรองข้อมูล -->
                              <div class="col-md-2 col-xs-12">
                                <q-btn color="primary" unelevated icon="search" label="ค้นหา" @click="getFilterMonth()"
                                  class="full-width" style="height: 40px">
                                  <q-tooltip>ค้นหาข้อมูลตามปีที่เลือก</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>

                      <!-- Section 2: Report Export Tools -->
                      <div class="col-12 q-mt-sm">
                        <q-card flat bordered class="bg-green-1">
                          <q-item class="bg-green-2">
                            <q-item-section avatar>
                              <q-icon name="file_download_done" color="green-10" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-bold text-green-10 text-subtitle1">เครื่องมือส่งออกรายงาน
                                (Excel)</q-item-label>
                              <q-item-label caption
                                class="text-green-8">ระบบจะส่งออกข้อมูลตามเงื่อนไขที่เลือกในส่วนการกรอง</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-card-section class="q-py-md">
                            <div class="row q-col-gutter-md items-center">
                              <!-- Export Filename -->
                              <div class="col-md-5 col-xs-12">
                                <q-input dense outlined bg-color="white" v-model="file_export"
                                  placeholder="ตั้งชื่อไฟล์รายงาน (ตัวอย่าง: assessment_report_2567)">
                                  <template v-slot:prepend>
                                    <q-icon name="drive_file_rename_outline" color="green" />
                                  </template>
                                </q-input>
                              </div>
                              <!-- Export Button -->
                              <div class="col-md-3 col-xs-12 text-center">
                                <q-btn color="green-9" icon="file_present" label="ส่งออก Excel Report"
                                  @click="exportTableRef()" class="full-width q-py-xs" unelevated />
                              </div>
                              <div class="col-md-4 col-xs-12">
                                <div class="bg-white q-pa-sm rounded-borders text-caption text-grey-8"
                                  style="border: 1px dashed #4caf50">
                                  <q-icon name="lightbulb" color="orange" />
                                  <b>Tip:</b> ข้อมูลใน Excel จะถูกจัดกลุ่มตามนักเรียน อาชีพ และคุณสมบัติ
                                  เพื่อให้อ่านง่ายและเป็นระเบียบ
                                </div>
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>

                    <!-- ตารางการประเมินตนเอง -->
                    <div class="row">
                      <!-- ตารางการประเมินตนเอง -->
                      <div class="col-md-12 col-xs-12 q-pa-xs">
                        <div class="q-pa-xs">
                          <q-table ref="myTable" title="ประวัติการประเมินตนเอง" :rows="selfAssessments1"
                            :columns="main_columns" row-key="self_assessment_id" :filter="filter" :loading="loading"
                            v-model:selected="selected" style="min-height: 50vh"
                            :visible-columns="visibleColumnsAssessment" separator="cell"
                            table-header-style="height: 65px; " table-header-class="bg-blue-5"
                            :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home"
                            icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                            :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
                              return `ข้อมูลที่ : ${firstRowIndex + 1} - ${endRowIndex} จากทั้งหมด ${totalRowsNumber}`
                            }">
                            <template v-slot:top-right="props">
                              <div class="row q-gutter-sm items-center">
                                <q-input dense debounce="300" v-model="filter" placeholder="ค้นหาในตาราง..." outlined
                                  bg-color="white">
                                  <template v-slot:append>
                                    <q-icon name="search" />
                                  </template>
                                </q-input>
                                <q-select v-model="visibleColumnsAssessment" multiple outlined dense options-dense
                                  :display-value="$q.lang.table.columns" emit-value map-options :options="main_columns"
                                  option-value="name" options-cover style="min-width: 150px" bg-color="white" />
                                <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                  @click="props.toggleFullscreen" />
                              </div>
                            </template>
                            <template v-slot:body-cell-actions="props">
                              <q-tr :props="props">
                                <q-td auto-width>
                                  <q-btn color="blue" label="แก้ไข" @click="
                                    OnEdit(props.row.self_assessment_id)
                                    " no-caps />
                                  <q-btn color="red" label="ลบ" @click="
                                    onDelete(
                                      props.row.self_assessment_id,
                                      props.row.self_assessment_date
                                    )
                                    " no-caps />
                                </q-td>
                                <q-td auto-width>
                                  <q-toggle v-model="props.expand" checked-icon="add" unchecked-icon="remove"
                                    label="ผลงาน" @update:model-value="
                                      subRow(props.row.self_assessment_id)
                                      " no-caps />
                                </q-td>
                              </q-tr>
                              <q-tr v-show="props.expand" :props="props">
                                <q-td colspan="100%">
                                  <div class="text-left">
                                    <q-table :rows="references2" :columns="sub_columns" row-key="reference_id"
                                      separator="cell">
                                      <template v-slot:body-cell="props1">
                                        <q-td key="perform_value" v-if="props1.row.self_assessment_id ==
                                          props.row.self_assessment_id
                                        " :props="props1" :class="props1.row.self_assessment_id ==
                                          props.row.self_assessment_id
                                          ? 'bg-indigo-5 text-white'
                                          : 'bg-white text-black'
                                          ">
                                          <div>{{ props1.value }}</div>
                                        </q-td>
                                      </template>
                                    </q-table>
                                  </div>
                                </q-td>
                              </q-tr>
                            </template>
                          </q-table>
                        </div>
                      </div>
                    </div>
                    <!-- end -->
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
import { ref } from "vue";
import { useQuasar } from "quasar";
import { exportFile } from "quasar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl } from "../../utils/apiConfig.js";
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
  name: "FormSelfAssessmentSuperUser",
  data() {
    return {
      file_export: "assessment_report_" + new Date().toISOString().split('T')[0],
      title: "การประเมินตนเอง(ผู้ดูแลกลุ่ม)",
      isEdit: false,
      isEditRef: false,
      btnLabel: "เพิ่มข้อมูล",
      btnLabel_: "เพิ่มผลงาน",
      show_dialog: false,
      loading: ref(false),
      $q: useQuasar(),
      filter: ref(""),
      filter_reference: ref(""),

      self_assessment_id: "",
      self_assessment_date: "",
      perform_id: null,
      perform: { options: [] },
      perform_: { options: [] },

      members: { options: [] },
      members_: { options: [] },
      member: ref({ label: "", value: "", description: "" }),

      plan_careers: { options: [] },
      plan_careers_: { options: [] },
      plan_career: ref({ label: "", value: "", description: "" }),

      qa_plan_careers: { options: [] },
      qa_plan_careers_: { options: [] },
      qa_plan_career: ref({ label: "", value: "", description: "" }),
      qa_plan_career_description: "",

      years: { options: [] },
      years_: { options: [] },
      years_id: null,

      months: { options: [] },
      months_: { options: [] },
      months_id: null,

      qualification_names: { options: [] },
      qualification_names_: { options: [] },
      career_names: { options: [] },
      career_names_: { options: [] },
      full_names: { options: [] },
      full_names_: { options: [] },

      references1: [],
      references2: [],
      editedReference: { reference_id: "", reference_description: "" },
      editedIndex: -1,

      visibleColumnsAssessment: ref(["actions", "full_name", "self_assessment_date", "career_name", "qualification_name", "importance_name", "target_value", "perform_value", "plan_title", "reference_description"]),
      visibleColumnsReference: ref(["actions", "reference_description"]),
      main_columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ : ผลงาน" },
        { name: "full_name", align: "left", label: "ชื่อ-สกุล", field: "full_name", sortable: true },
        { name: "self_assessment_date", align: "center", label: "วันประเมิน", field: "self_assessment_date", sortable: true },
        { name: "career_name", align: "left", label: "อาชีพ", field: "career_name", sortable: true },
        { name: "qualification_name", align: "left", label: "คุณสมบัติ", field: "qualification_name", sortable: true },
        { name: "importance_name", align: "center", label: "ความสำคัญ", field: "importance_name", sortable: true },
        { name: "target_value", align: "center", label: "ค่าเป้าหมาย", field: "target_value", sortable: true },
        { name: "perform_value", align: "center", label: "ผลการประเมิน", field: "perform_value", sortable: true },
        { name: "plan_title", align: "left", label: "แผนพัฒนาคุณสมบัติ/ทักษะ", field: "plan_title", sortable: true },
        { name: "reference_description", align: "left", label: "หลักฐาน", field: "reference_description", sortable: true },
      ],
      references: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        { name: "reference_description", align: "left", label: "แหล่งอ้างอิง/ผลงาน", field: "reference_description", sortable: true },
      ],
      sub_columns: [
        { name: "reference_description", align: "left", label: "แหล่งอ้างอิง/ผลงาน", field: "reference_description", sortable: true },
      ],
      selfAssessments1: [],
      expansionsToggled: false,
      filterConditions: { full_name: "", career_name: "", qualification_name: "", year: "", month: "" },
      plans1: [],
      selected: [],
    };
  },
  methods: {
    yearToDay(d) {
      if (!d) return "";
      const [day, month, year] = d.split("/");
      return `${year}/${month}/${day}`;
    },
    dayToYear(d) {
      if (!d || d === "0000/00/00") return "00/00/0000";
      const [year, month, day] = d.split("/");
      return `${day}/${month}/${year}`;
    },
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.self_assessment_id = "";
      this.self_assessment_date = "";
      this.perform_id = null;
      this.member = { label: "", value: "", description: "" };
      this.plan_career = { label: "", value: "", description: "" };
      this.qa_plan_career = { label: "", value: "", description: "" };
      this.qa_plan_career_description = "";
      this.references1 = [];
    },
    async submitForm() {
      const msg = this.isEdit ? "บันทึกการแก้ไขหรือไม่?" : "เพิ่มข้อมูลการประเมินหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message: msg, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            const payload = {
              self_assessment_date: this.yearToDay(this.self_assessment_date),
              qa_plan_career_id: this.qa_plan_career.value,
              perform_id: this.perform_id,
            };
            if (!this.isEdit) {
              const res = await axios.post(`${getRestApiUrl(this.$store)}/self-assessments`, payload);
              if (this.references1.length > 0) {
                await axios.post(`${getRestApiUrl(this.$store)}/self-assessments/${res.data.insertId}/references/bulk`, {
                  references: this.references1.map(r => r.reference_description)
                });
              }
              this.$q.notify({ message: "บันทึกสำเร็จ", color: "positive" });
            } else {
              await axios.put(`${getRestApiUrl(this.$store)}/self-assessments/${this.self_assessment_id}`, payload);
              this.$q.notify({ message: "แก้ไขสำเร็จ", color: "positive" });
            }
            this.resetForm();
            this.getUpdate();
            this.getFilterMonth();
          } catch (error) {
            this.$q.notify({ message: "Error: " + error.message, color: "negative" });
          }
        });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/self-assessments`);
        this.selfAssessments1 = res.data;
      } catch (error) { console.error(error); }
      finally { this.loading = false; }
    },
    async OnEdit(id) {
      this.isEdit = true;
      this.btnLabel = "เปลี่ยนเป็นเพิ่ม";
      this.self_assessment_id = id;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/self-assessments/${id}`);
        const d = res.data;
        this.member = { label: d.full_name, value: d.member_id, description: d.status };
        this.plan_career = { label: d.career_name, value: d.plan_career_id, description: d.start_date };
        this.qa_plan_career = { label: d.qualification_name, value: d.qa_plan_career_id, description: d.level_description };
        this.qa_plan_career_description = d.level_description + "\n" + d.target_name;
        this.perform_id = d.perform_id;
        this.self_assessment_date = this.dayToYear(d.self_assessment_date);
        const refRes = await axios.get(`${getRestApiUrl(this.$store)}/self-assessments/${id}/references`);
        this.references1 = refRes.data;
      } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
    },
    onDelete(id, dateStr) {
      this.$q.dialog({ title: "ยืนยัน", message: `ลบผลการประเมินวัน ${dateStr} หรือไม่?`, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            await axios.delete(`${getRestApiUrl(this.$store)}/self-assessments/${id}`);
            this.$q.notify({ message: "ลบสำเร็จ", color: "positive" });
            this.getUpdate();
            this.getFilterMonth();
          } catch (error) { this.$q.notify({ message: "Error: " + error.message, color: "negative" }); }
        });
    },
    async getMember() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`);
        this.members.options = res.data.map(i => ({ label: i.full_name, value: i.member_id, description: i.status }));
        this.members_.options = this.members.options;
      } catch (error) { console.error(error); }
    },
    onMemberNames(m) { if (m) this.getPlan_career(m.value); },
    onMember(val) { if (!val) this.member = { label: "", value: "", description: "" }; },
    async getPlan_career(member_id) {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/plan-careers`, { params: { member_id } });
        this.plan_careers.options = res.data.map(i => ({ label: i.career_name, value: i.plan_career_id, description: i.start_date }));
        this.plan_careers_.options = this.plan_careers.options;
      } catch (error) { console.error(error); }
    },
    addRow() {
      if (this.editedIndex > -1) {
        Object.assign(this.references1[this.editedIndex], this.editedReference);
        if (this.isEdit) this.updateReferenceData(this.editedReference.reference_id, this.editedReference.reference_description);
      } else {
        this.references1.push({ ...this.editedReference });
        if (this.isEdit) this.addReferenceAndUpdate(this.self_assessment_id, this.editedReference.reference_description);
      }
      this.close();
    },
    async addReferenceAndUpdate(sid, desc) {
      try {
        await axios.post(`${getRestApiUrl(this.$store)}/self-assessments/${sid}/references`, { reference_description: desc });
        this.subRow(sid);
      } catch (error) { console.error(error); }
    },
    async updateReferenceData(rid, desc) {
      try {
        await axios.put(`${getRestApiUrl(this.$store)}/self-assessments/references/${rid}`, { reference_description: desc });
      } catch (error) { console.error(error); }
    },
    async subRow(sid) {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/self-assessments/${sid}/references`);
        this.references2 = res.data;
      } catch (error) { console.error(error); }
    },
    deleteItem(item) {
      if (this.isEdit) {
        this.$q.dialog({ title: "ยืนยัน", message: `ลบผลงาน: ${item.reference_description} หรือไม่?`, cancel: true, persistent: true })
          .onOk(async () => {
            try {
              await axios.delete(`${getRestApiUrl(this.$store)}/self-assessments/references/${item.reference_id}`);
              this.subRow(item.self_assessment_id);
            } catch (error) { console.error(error); }
          });
      } else {
        const index = this.references1.indexOf(item);
        if (index > -1) this.references1.splice(index, 1);
      }
    },
    editItem(item) {
      this.isEditRef = true;
      this.btnLabel_ = "แก้ไขผลงาน";
      this.editedIndex = this.references1.indexOf(item);
      this.editedReference = { ...item };
      this.show_dialog = true;
    },
    close() {
      this.show_dialog = false;
      this.editedReference = { reference_id: "", reference_description: "" };
      this.editedIndex = -1;
      this.btnLabel_ = "เพิ่มผลงาน";
      this.isEditRef = false;
    },
    toggleExpansions() {
      this.expansionsToggled = !this.expansionsToggled;
      this.$refs.myTable.setExpanded(this.expansionsToggled ? this.selfAssessments1.map(r => r.self_assessment_id) : []);
    },
    async onPlan_career(pc) {
      if (pc) {
        try {
          const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers`, {
            params: { plan_career_id: pc.value }
          });
          this.qa_plan_careers.options = res.data.map(i => ({ label: i.qualification_name, value: i.qa_plan_career_id, description: (i.level_description || '') + "\n" + (i.target_name || '') }));
          this.qa_plan_careers_.options = this.qa_plan_careers.options;
        } catch (error) { console.error(error); }
      }
    },
    onPlan_career_(val) { if (!val) this.plan_career = { label: "", value: "", description: "" }; },
    onQa_Plan_career_(val) { if (!val) this.qa_plan_career = { label: "", value: "", description: "" }; },
    onDescription(qa) {
      if (qa) this.qa_plan_career_description = qa.description;
    },
    async getPerform() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/performs`);
        this.perform.options = res.data.map(i => ({ label: i.perform_name, value: i.perform_id }));
        this.perform_.options = this.perform.options;
      } catch (error) { console.error(error); }
    },
    async getFullName() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers/full-names`, { params: { member_id: this.$store.getters.myMember_id } });
        this.full_names.options = res.data.map(i => ({ label: i.full_name, value: i.full_name }));
        this.full_names_.options = this.full_names.options;
      } catch (error) { console.error(error); }
    },
    async getCareer_name() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers/career-names`, { params: { member_id: this.$store.getters.myMember_id } });
        this.career_names.options = res.data.map(i => ({ label: i.career_name, value: i.career_name }));
        this.career_names_.options = this.career_names.options;
      } catch (error) { console.error(error); }
    },
    async getQualification_name() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers/qualification-names`, { params: { member_id: this.$store.getters.myMember_id } });
        this.qualification_names.options = res.data.map(i => ({ label: i.qualification_name, value: i.qualification_name }));
        this.qualification_names_.options = this.qualification_names.options;
      } catch (error) { console.error(error); }
    },
    async getYear() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers/years`, { params: { member_id: this.$store.getters.myMember_id } });
        this.years.options = res.data.map(i => ({ label: i.Year, value: i.Year }));
        this.years_.options = this.years.options;
      } catch (error) { console.error(error); }
    },
    async getMonth() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/qa-plan-careers/months`, { params: { member_id: this.$store.getters.myMember_id } });
        this.months.options = res.data.map(i => ({ label: i.Month, value: i.Month }));
        this.months_.options = this.months.options;
      } catch (error) { console.error(error); }
    },
    async getFilterMonth() {
      try {
        const res = await axios.post(`${getRestApiUrl(this.$store)}/qa-plan-careers/filter-month`, {
          member_id: null, // super user sees everything
          full_name: this.filterConditions.full_name || "%",
          career_name: this.filterConditions.career_name || "%",
          qualification_name: this.filterConditions.qualification_name || "%",
          year: this.filterConditions.year || "%",
          month: this.filterConditions.month || "%",
        });
        this.selfAssessments1 = res.data;
      } catch (error) { console.error(error); }
    },
    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterPlan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.plan_careers.options = this.plan_careers_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterQa_plan_career(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.qa_plan_careers.options = this.qa_plan_careers_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterPerform(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.perform.options = this.perform_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterYear(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.years.options = this.years_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterFull_name(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.full_names.options = this.full_names_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterCareer_name(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.career_names.options = this.career_names_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterQualification_name(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.qualification_names.options = this.qualification_names_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterMonth(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.months.options = this.months_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    on_years(y) { this.filterConditions.year = y ? y.value : ""; this.getFilterMonth(); },
    on_months(m) { this.filterConditions.month = m ? m.value : ""; this.getFilterMonth(); },
    on_full_name(n) { this.filterConditions.full_name = n ? n.value : ""; this.getFilterMonth(); },
    on_career_names(n) { this.filterConditions.career_name = n ? n.value : ""; this.getFilterMonth(); },
    on_qualification_names(n) { this.filterConditions.qualification_name = n ? n.value : ""; this.getFilterMonth(); },

    async exportTable() {
      if (!this.selfAssessments1 || this.selfAssessments1.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูลสำหรับส่งออก', icon: 'warning' });
        return;
      }
      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Self Assessment');
        worksheet.columns = this.main_columns.slice(1).map(c => ({ header: c.label, key: c.name, width: 25 }));
        this.selfAssessments1.forEach(row => {
          worksheet.addRow(this.main_columns.slice(1).map(c => row[c.field] || ''));
        });
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${this.file_export}.xlsx`);
        this.$q.notify({ color: 'positive', message: 'ส่งออกสำเร็จ' });
      } catch (error) {
        this.$q.notify({ color: 'negative', message: 'Error: ' + error.message });
      } finally { this.$q.loading.hide(); }
    },

    async exportTableRef() {
      if (!this.selfAssessments1 || this.selfAssessments1.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูลเพื่อส่งออก', icon: 'warning' });
        return;
      }
      this.$q.loading.show({ message: 'กำลังจัดทำรายงาน Excel...' });
      try {
        if (this.plans1.length === 0) {
          const pRes = await axios.get(`${getRestApiUrl(this.$store)}/plans`);
          this.plans1 = Array.isArray(pRes.data) ? pRes.data : [];
        }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Styles
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        worksheet.addRow(['รายงานการประเมินตนเอง (Super User)']);
        worksheet.mergeCells('A1:V1');
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        const h2 = worksheet.addRow(['ชื่อ-สกุล', 'คุณสมบัติ', 'ความสำคัญ', 'เป้าหมาย', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.', 'แผนพัฒนา 1', 'หลักฐาน 1', 'แผนพัฒนา 2', 'หลักฐาน 2', 'แผนพัฒนา 3', 'หลักฐาน 3']);
        h2.eachCell(c => {
          c.fill = headerFill;
          c.border = border;
          c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          c.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const grouped = {};
        this.selfAssessments1.forEach(sa => {
          const key = sa.full_name;
          if (!grouped[key]) grouped[key] = {};
          if (!grouped[key][sa.qualification_name]) grouped[key][sa.qualification_name] = [];
          grouped[key][sa.qualification_name].push(sa);
        });

        let rowIndex = 0;
        for (const name in grouped) {
          for (const qName in grouped[name]) {
            const assessments = grouped[name][qName];
            const first = assessments[0];
            const monthly = Array(12).fill('-');
            assessments.forEach(ass => {
              if (ass.self_assessment_date) {
                const parts = ass.self_assessment_date.split('/');
                if (parts.length >= 2) {
                  const m = parseInt(parts[1]) - 1;
                  if (m >= 0 && m < 12) monthly[m] = ass.perform_value;
                }
              }
            });
            const dataRow = worksheet.addRow([name, qName, first.importance_name, first.target_value, ...monthly, first.plan_title, first.reference_description]);
            dataRow.eachCell((c, colIdx) => {
              c.border = border;
              if (rowIndex % 2 !== 0) c.fill = zebraFill;
              c.alignment = { vertical: 'top', wrapText: true };
            });
            rowIndex++;
          }
        }

        worksheet.columns = [
          { width: 25 }, { width: 35 }, { width: 12 }, { width: 10 },
          ...Array(12).fill({ width: 6 }),
          { width: 25 }, { width: 30 }, { width: 25 }, { width: 30 }, { width: 25 }, { width: 30 }
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${this.file_export}_report.xlsx`);
        this.$q.notify({ color: 'positive', message: 'ส่งออกสำเร็จ' });
      } catch (error) {
        console.error(error);
        this.$q.notify({ color: 'negative', message: 'Error: ' + error.message });
      } finally { this.$q.loading.hide(); }
    },
  },
  mounted() {
    this.getMember();
    this.getPerform();
    this.getUpdate();
    this.getFullName();
    this.getCareer_name();
    this.getQualification_name();
    this.getYear();
    this.getMonth();
    this.getFilterMonth();
  },
};
</script>

<style scoped></style>
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
