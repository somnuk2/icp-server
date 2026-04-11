<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page padding class="page-bg page-full">
          <div class="row">
            <div class="col-12">
              <q-card flat class="bg-white text-black form-card form-card-full">
                <!-- HEADER -->
                <q-card-section class="bg-primary">
                  <h4 class="text-h5 text-white q-my-xs text-center">
                    {{ title }}
                  </h4>
                </q-card-section>

                <!-- FORM -->
                <q-card-section class="q-pa-sm form-section">
                  <q-form @submit.prevent="submitForm()" @reset="resetForm()" method="post" class="q-gutter-md">
                    <!-- ข้อมูลส่วนตัว (ผู้ดูแลระบบ) -->
                    <div class="row q-col-gutter-sm">
                      <div class="col-12">
                        <q-expansion-item group="main-form" icon="person"
                          label="ข้อมูลส่วนตัว (ผู้ดูแลระบบ) - คลิกเพื่อ ย่อ/ขยาย"
                          header-class="text-white text-subtitle1 bg-primary" class="shadow-1 overflow-hidden"
                          style="border-radius: 8px" default-opened>
                          <q-card>
                            <q-card-section class="q-gutter-md">
                              <!-- รายชื่อ -->
                              <div class="row">
                                <div class="col-12 q-pa-xs">
                                  <q-select ref="name" use-input @filter="filterMember" color="primary" v-model="member"
                                    :options="members.options" label="ชื่อ-สกุล *" stack-label>
                                    <template v-slot:prepend>
                                      <q-icon name="school" />
                                    </template>

                                    <template v-slot:selected>
                                      ชื่อ-สกุล:
                                      <q-chip v-if="member && member.label" dense square color="white"
                                        text-color="primary" class="q-pa-xs">
                                        {{
                                          member.label !== ""
                                            ? member.label + " (" + member.description + ")"
                                            : ""
                                        }}
                                      </q-chip>
                                      <q-badge v-else>*none*</q-badge>
                                    </template>

                                    <template v-if="member && member.label" v-slot:append>
                                      <q-icon name="cancel" @click.stop.prevent="onMember((member = null))"
                                        class="cursor-pointer" />
                                    </template>

                                    <template v-slot:option="scope">
                                      <q-item v-bind="scope.itemProps">
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                                          <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                  </q-select>
                                </div>
                              </div>

                              <!-- วัน-เดือน-ปี เกิด+หมายเลขโทรศัพท์ -->
                              <div class="row">
                                <div class="col-md-6 col-xs-12 q-pa-xs">
                                  <q-input standout bottom-slots filled v-model="individual.birthday"
                                    label="ปีเกิด ค.ศ. *" clearable mask="####" fill-mask hint="ปีเกิด ค.ศ.: ####">
                                    <template v-slot:prepend><q-icon name="school" /></template>
                                    <template v-slot:append><q-icon name="favorite" /></template>
                                  </q-input>
                                </div>

                                <div class="col-md-6 col-xs-12 q-pa-xs">
                                  <q-input standout bottom-slots v-model="individual.telephone"
                                    label="หมายเลขโทรศัพท์ *" mask="##-####-####" fill-mask
                                    hint="โทรศัพท์: ##-####-####" clearable>
                                    <template v-slot:prepend><q-icon name="person_add" /></template>
                                    <template v-slot:append><q-icon name="favorite" /></template>
                                  </q-input>
                                </div>
                              </div>

                              <!-- สถาบันการศึกษา + คณะ -->
                              <div class="row">
                                <div class="col-md-6 col-xs-12 q-pa-xs">
                                  <q-select use-input @filter="filterInstitute" color="primary" v-model="institute"
                                    :options="institutes.options" label="สถาบันการศึกษา *" stack-label
                                    @update:model-value="(val) => onInstituteValueChange(val)">
                                    <template v-slot:prepend><q-icon name="school" /></template>

                                    <template v-slot:selected>
                                      สถาบัน:
                                      <q-chip v-if="institute" dense square color="white" text-color="primary"
                                        class="q-pa-xs">
                                        {{ institute.label }}
                                      </q-chip>
                                      <q-badge v-else>*none*</q-badge>
                                    </template>

                                    <template v-if="institute" v-slot:append>
                                      <q-icon name="cancel" @click.stop.prevent="OnInstitute((institute = null))"
                                        class="cursor-pointer" />
                                    </template>
                                  </q-select>
                                </div>

                                <div class="col-md-6 col-xs-12 q-pa-xs">
                                  <q-select use-input @filter="filterFaculty" color="primary" v-model="faculty"
                                    :options="facultys.options" label="คณะ *" stack-label
                                    @update:model-value="(val) => onFacultyValueChange(val)">
                                    <template v-slot:prepend><q-icon name="school" /></template>

                                    <template v-slot:selected>
                                      คณะ:
                                      <q-chip v-if="faculty" dense square color="white" text-color="primary"
                                        class="q-pa-xs">
                                        {{ faculty.label }}
                                      </q-chip>
                                      <q-badge v-else>*none*</q-badge>
                                    </template>

                                    <template v-if="faculty" v-slot:append>
                                      <q-icon name="cancel" @click.stop.prevent="OnFaculty((faculty = null))"
                                        class="cursor-pointer" />
                                    </template>
                                  </q-select>
                                </div>
                              </div>

                              <!-- ระดับการศึกษา + สาขาวิชา -->
                              <div class="row">
                                <div class="col-md-6 col-xs-12 q-pa-xs">
                                  <q-select use-input @filter="filterDegree" color="primary" v-model="degree"
                                    :options="degrees.options" label="ระดับการศึกษา *" stack-label
                                    @update:model-value="(val) => onDegreeValueChange(val)">
                                    <template v-slot:prepend><q-icon name="school" /></template>

                                    <template v-slot:selected>
                                      ระดับการศึกษา:
                                      <q-chip v-if="degree" dense square color="white" text-color="primary"
                                        class="q-pa-xs">
                                        {{ degree.label }}
                                      </q-chip>
                                      <q-badge v-else>*none*</q-badge>
                                    </template>

                                    <template v-if="degree" v-slot:append>
                                      <q-icon name="cancel" @click.stop.prevent="OnDegree((degree = null))"
                                        class="cursor-pointer" />
                                    </template>
                                  </q-select>
                                </div>

                                <div class="col-md-6 col-xs-12 q-pa-xs">
                                  <q-select use-input @filter="filterDepartment" color="primary" v-model="department"
                                    :options="departments.options" label="สาขาวิชา *" stack-label
                                    @update:model-value="(val) => onDepartmentValueChange(val)">
                                    <template v-slot:prepend><q-icon name="school" /></template>

                                    <template v-slot:selected>
                                      สาขาวิชา:
                                      <q-chip v-if="department" dense square color="white" text-color="primary"
                                        class="q-pa-xs">
                                        {{ department.label }}
                                      </q-chip>
                                      <q-badge v-else>*none*</q-badge>
                                    </template>

                                    <template v-if="department" v-slot:append>
                                      <q-icon name="cancel" @click.stop.prevent="OnDepartment((department = null))"
                                        class="cursor-pointer" />
                                    </template>
                                  </q-select>
                                </div>
                              </div>

                              <!-- จบการศึกษา + ปีที่สำเร็จการศึกษา + ชั้นปีที่กำลังศึกษา -->
                              <div class="row">
                                <div class="col-md-4 col-xs-4 q-pa-xs">
                                  <q-checkbox v-model="individual.is_graduate" val="is_graduate" label="จบการศึกษา"
                                    color="teal" true-value="1" false-value="0" />
                                </div>

                                <div class="col-md-4 col-xs-8 q-pa-xs">
                                  <q-input standout bottom-slots filled v-model="individual.date" label="ปีที่จบ ค.ศ."
                                    clearable mask="####" fill-mask hint="ปีที่จบการศึกษา ค.ศ.: ####"
                                    :disable="individual.is_graduate == '1' ? false : true">
                                    <template v-slot:prepend><q-icon name="school" /></template>
                                    <template v-slot:append><q-icon name="favorite" /></template>
                                  </q-input>
                                </div>

                                <div class="col-md-4 col-xs-12 q-pa-xs">
                                  <q-input standout bottom-slots filled v-model="individual.year" label="ชั้นปี"
                                    clearable mask="#" fill-mask hint="ชั้นปี: #"
                                    :disable="individual.is_graduate == '0' ? false : true">
                                    <template v-slot:prepend><q-icon name="school" /></template>
                                    <template v-slot:append><q-icon name="favorite" /></template>
                                  </q-input>
                                </div>
                              </div>

                              <!-- ภาวะความพิการ + ชนิดความพิการ -->
                              <div class="row">
                                <div class="col-md-4 col-xs-12 q-pa-xs">
                                  <q-checkbox v-model="individual.is_disability" val="is_disability"
                                    label="มีภาวะความพิการ" color="teal" true-value="1" false-value="0" />
                                </div>

                                <div class="col-md-8 col-xs-12 q-pa-xs">
                                  <q-select use-input @filter="filterDisability" color="primary" v-model="disability"
                                    :options="disabilitys.options" label="เลือกประเภทความพิการ" stack-label
                                    @update:model-value="(val) => onDisabilityValueChange(val)"
                                    :disable="individual.is_disability == '1' ? false : true">
                                    <template v-slot:prepend><q-icon name="assist_walker" /></template>

                                    <template v-slot:selected>
                                      ความพิการ:
                                      <q-chip v-if="disability" dense square color="white" text-color="primary"
                                        class="q-pa-xs">
                                        {{ disability.label }}
                                      </q-chip>
                                      <q-badge v-else>*none*</q-badge>
                                    </template>

                                    <template v-if="disability" v-slot:append>
                                      <q-icon name="cancel" @click.stop.prevent="OnDisability((disability = null))"
                                        class="cursor-pointer" />
                                    </template>
                                  </q-select>
                                </div>
                              </div>

                              <div class="row">
                                <div class="col-12 q-pa-xs">
                                  <q-input standout bottom-slots filled v-model="individual.dis_description"
                                    label="รายละเอียด" clearable
                                    :disable="individual.is_disability == '1' ? false : true">
                                    <template v-slot:prepend><q-icon name="assist_walker" /></template>
                                    <template v-slot:append><q-icon name="favorite" /></template>
                                  </q-input>
                                </div>
                              </div>

                              <!-- โครงการ + ผู้ดูแลกลุ่ม -->
                              <div class="row">
                                <div class="col-md-6 col-xs-12 q-pa-xs">
                                  <q-select use-input @filter="filterProject" color="primary" v-model="project"
                                    :options="projects.options" label="โครงการ" stack-label
                                    @update:model-value="(val) => onProjectValueChange(val)">
                                    <template v-slot:prepend><q-icon name="assignment_turned_in" /></template>

                                    <template v-slot:selected>
                                      โครงการ:
                                      <q-chip v-if="project" dense square color="white" text-color="primary"
                                        class="q-pa-xs">
                                        {{ project.label }}
                                      </q-chip>
                                      <q-badge v-else>*none*</q-badge>
                                    </template>

                                    <template v-if="project" v-slot:append>
                                      <q-icon name="cancel" @click.stop.prevent="OnProject((project = null))"
                                        class="cursor-pointer" />
                                    </template>
                                  </q-select>
                                </div>

                                <div class="col-md-6 col-xs-12 q-pa-xs">
                                  <q-select use-input @filter="filterAdvisor" color="primary" v-model="advisor"
                                    :options="advisors.options" label="ผู้ดูแลกลุ่ม" stack-label
                                    @update:model-value="(val) => onProjectValueChange(val)">
                                    <template v-slot:prepend><q-icon name="assignment_turned_in" /></template>

                                    <template v-slot:selected>
                                      ผู้ดูแลกลุ่ม:
                                      <q-chip v-if="advisor" dense square color="white" text-color="primary"
                                        class="q-pa-xs">
                                        {{ advisor.label }}
                                      </q-chip>
                                      <q-badge v-else>*none*</q-badge>
                                    </template>

                                    <template v-if="advisor" v-slot:append>
                                      <q-icon name="cancel" @click.stop.prevent="OnAdvisor((advisor = null))"
                                        class="cursor-pointer" />
                                    </template>
                                  </q-select>
                                </div>
                              </div>
                            </q-card-section>
                          </q-card>
                        </q-expansion-item>
                      </div>
                    </div>

                    <!-- ✅ ข้อมูลพื้นฐานเพิ่มเติม (คืนกลับมาแล้ว) -->
                    <div class="row q-col-gutter-sm">
                      <div class="col-12">
                        <q-expansion-item group="extra-info" icon="info"
                          label="ข้อมูลพื้นฐานเพิ่มเติม (คลิกเพื่อ ย่อ/ขยาย)"
                          header-class="text-white text-subtitle1 bg-primary" class="shadow-1 overflow-hidden"
                          style="border-radius: 8px">
                          <q-card>
                            <q-card-section class="row q-col-gutter-sm">
                              <div class="col-md-6 col-xs-12 q-pa-xs">
                                <q-input standout bottom-slots filled v-model="individual.province"
                                  label="มาจากจังหวัด" />
                              </div>
                              <div class="col-md-6 col-xs-12 q-pa-xs">
                                <q-input standout bottom-slots filled v-model="individual.preferred_region"
                                  label="อยากอยู่ในจังหวัด" />
                              </div>
                              <div class="col-md-6 col-xs-12 q-pa-xs">
                                <q-input standout bottom-slots filled v-model="individual.favorite_subject"
                                  label="วิชาที่ชอบ" />
                              </div>
                              <div class="col-md-6 col-xs-12 q-pa-xs">
                                <q-input standout bottom-slots filled v-model="individual.unfavorite_subject"
                                  label="อุปกรณ์ที่จำเป็น" />
                              </div>
                              <div class="col-md-6 col-xs-12 q-pa-xs">
                                <q-input standout bottom-slots filled v-model="individual.favorite_activity"
                                  label="กิจกรรมที่ชอบทำ" />
                              </div>
                              <div class="col-md-6 col-xs-12 q-pa-xs">
                                <q-input standout bottom-slots filled v-model="individual.dream_career"
                                  label="อาชีพในฝัน" />
                              </div>
                              <div class="col-12 q-pa-xs">
                                <q-input standout bottom-slots filled v-model="individual.skill"
                                  label="ความถนัด / ทักษะเด่น" type="textarea" rows="3" />
                              </div>
                              <div class="col-12 q-pa-xs">
                                <q-input standout bottom-slots filled v-model="individual.additional_info"
                                  label="ข้อมูลเพิ่มเติม" type="textarea" rows="3" />
                              </div>
                            </q-card-section>
                          </q-card>
                        </q-expansion-item>
                      </div>
                    </div>

                    <!-- PDPA -->
                    <div class="row">
                      <div class="col-12 q-pa-xs row justify-center">
                        <q-checkbox right-label v-model="pdpa"
                          label="ข้าพเจ้ายินยอมให้ใช้ข้อมูลส่วนบุคคล เพื่อเป็นประโยชน์ต่อตัวข้าพเจ้าและแผนงานกลไกจ้างงานคนพิการเข้มแข็งและเตรียมความพร้อมพนักงานสู่การเกษียณแบบบูรณาการ สำนักงานกองทุนสนับสนุนการสร้างเสริมสุขภาพ (สสส.) ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)" />
                      </div>
                    </div>

                    <!-- ปุ่มควบคุม -->
                    <div class="row">
                      <div class="col-12 q-pa-xs row justify-center">
                        <q-btn :label="btnLabel" type="submit" color="primary" icon="save" :disable="!pdpa" />
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" icon="clear" />
                        <q-btn icon="logout" label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                        <q-btn color="primary" label="กลับฟอร์มการลงทะเบียน" no-caps flat icon="skip_previous"
                          to="/AdminFormRegistration">
                          <q-tooltip class="bg-accent">กลับฟอร์มการลงทะเบียน</q-tooltip>
                        </q-btn>
                        <q-btn color="primary" label="ไปฟอร์มกำหนดอาชีพเป้าหมาย" no-caps flat icon="skip_next"
                          to="/AdminFormPlanCareer">
                          <q-tooltip class="bg-accent">ไปฟอร์มกำหนดอาชีพเป้าหมาย</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </q-form>
                </q-card-section>

                <q-separator />

                <!-- TABLE (แบบ B: กินพื้นที่ที่เหลือ) -->
                <q-card-section class="q-pa-sm table-section">
                  <div class="table-wrap table-wrap-fill">
                    <q-table ref="tb" :title="`ข้อมูลส่วนตัว (${individuals1.length} รายการ)`" :rows="individuals1"
                      :columns="columns" row-key="individual_id" :filter="filter" :loading="loading" separator="cell"
                      wrap-cells flat bordered class="my-sticky-header-table" table-header-style="height: 65px;"
                      table-header-class="bg-primary text-white text-weight-bold"
                      :rows-per-page-options="[10, 20, 30, 50, 100, 0]" v-model:pagination="pagination"
                      icon-first-page="first_page" icon-last-page="last_page" icon-next-page="navigate_next"
                      icon-prev-page="navigate_before" :pagination-label="getPaginationLabel"
                      :visible-columns="visibleColumns">
                      <!-- Top-left -->
                      <template v-slot:top-left>
                        <div class="row q-gutter-sm items-center">
                          <div class="text-h6">ข้อมูลส่วนตัว</div>
                          <q-chip color="primary" text-color="white" icon="people">
                            {{ individuals1.length }} รายการ
                          </q-chip>

                          <q-btn v-if="pagination.rowsPerPage !== 0" dense flat color="primary" icon="unfold_more"
                            label="แสดงทั้งหมด" @click="showAllRows" size="sm">
                            <q-tooltip>แสดงข้อมูลทั้งหมด</q-tooltip>
                          </q-btn>

                          <q-btn v-else dense flat color="primary" icon="unfold_less" label="ย่อตาราง"
                            @click="collapseTable" size="sm">
                            <q-tooltip>แสดงแบบแบ่งหน้า</q-tooltip>
                          </q-btn>
                        </div>
                      </template>

                      <!-- Top-right -->
                      <template v-slot:top-right="props">
                        <div class="row items-center">
                          <div class="q-pr-sm">
                            <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาข้อมูลส่วนตัว">
                              <template v-slot:append><q-icon name="search" /></template>
                            </q-input>
                          </div>

                          <!-- Export -->
                          <div class="row q-pr-sm items-center">
                            <q-input borderless dense debounce="300" v-model="file_export" placeholder="ชื่อไฟล์นำออก"
                              outlined class="q-mr-xs" style="width: 150px;">
                              <template v-slot:append>
                                <q-icon name="save" />
                              </template>
                            </q-input>
                            <q-btn flat icon-right="archive" label="ส่งออก excel" @click="exportTable()" />
                          </div>

                          <div class="q-pr-sm">
                            <q-select v-model="visibleColumns" multiple outlined dense options-dense
                              :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                              option-value="name" options-cover style="min-width: 160px" />
                          </div>

                          <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                            @click="props.toggleFullscreen" />
                        </div>
                      </template>

                      <!-- ✅ ปุ่มแก้ไข/ลบ (คืนให้ทำงานแล้ว) -->
                      <template v-slot:body-cell-actions="props">
                        <q-td :props="props">
                          <div class="row q-gutter-xs justify-center no-wrap">
                            <q-btn round flat color="blue-7" icon="edit" size="sm"
                              @click="editUser(props.row.individual_id)" unelevated>
                              <q-tooltip class="bg-blue">แก้ไขข้อมูล</q-tooltip>
                            </q-btn>
                            <q-btn round flat color="red-7" icon="delete" size="sm"
                              @click="deleteUser(props.row.individual_id, props.row.full_name)" unelevated>
                              <q-tooltip class="bg-red">ลบข้อมูล</q-tooltip>
                            </q-btn>
                          </div>
                        </q-td>
                      </template>
                    </q-table>
                  </div>
                </q-card-section>
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
import { getRestApiUrl } from "../../utils/apiConfig.js";

export default {
  name: "FormIndividualAdmin",

  data() {
    return {
      file_export: "",
      pdpa: false,

      url_api_individual: "",
      url_api_institute: "",
      url_api_disability: "",
      url_api_project: "",
      url_api_advisor: "",
      url_api_member: "",

      title: "ข้อมูลส่วนตัว(ผู้ดูแลระบบ)",
      btnLabel: "เพิ่มข้อมูล",
      isEdit: false,

      individual: {
        individual_id: "",
        member_id: this.$store.getters.myMember_id,
        name: this.$store.getters.myName,
        birthday: "",
        telephone: "",
        institute_id: 1,
        faculty_id: "",
        degree_id: "",
        department_id: "",
        is_graduate: "0",
        year: "",
        date: "",
        is_disability: "0",
        disability_id: "",
        dis_description: "",
        project_id: "",
        advisor_id: "",
        province: "",
        favorite_subject: "",
        unfavorite_subject: "",
        favorite_activity: "",
        skill: "",
        dream_career: "",
        preferred_region: "",
        additional_info: "",
      },

      filter: "",
      loading: false,
      individuals1: [],

      pagination: {
        sortBy: "individual_id",
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },

      visibleColumns: [
        "actions",
        "status",
        "full_name",
        "birthday",
        "telephone",
        "institute_name",
        "faculty_name",
        "degree_name",
        "department_name",
        "is_graduate",
        "date",
        "year",
        "is_disability",
        "disability_name",
        "dis_description",
        "project_name",
        "advisor_name",
      ],

      columns: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ", style: "width: 120px;", headerStyle: "width: 120px;" },
        { name: "status", align: "left", label: "บทบาท", field: "status", sortable: true, style: "width: 100px;", headerStyle: "width: 100px;" },
        { name: "full_name", align: "left", label: "ชื่อ-สกุล", field: "full_name", sortable: true, style: "min-width: 180px;", headerStyle: "min-width: 180px;" },
        { name: "birthday", align: "center", label: "ปีเกิด", field: "birthday", style: "width: 80px;", headerStyle: "width: 80px;" },
        { name: "telephone", align: "center", label: "โทรศัพท์", field: "telephone", style: "width: 120px;", headerStyle: "width: 120px;" },
        { name: "institute_name", align: "left", label: "สถาบัน", field: "institute_name", style: "min-width: 160px;", headerStyle: "min-width: 160px;" },
        { name: "faculty_name", align: "left", label: "คณะ", field: "faculty_name", style: "min-width: 160px;", headerStyle: "min-width: 160px;" },
        { name: "degree_name", align: "center", label: "ระดับ", field: "degree_name", style: "width: 100px;", headerStyle: "width: 100px;" },
        { name: "department_name", align: "left", label: "สาขา", field: "department_name", style: "min-width: 170px;", headerStyle: "min-width: 170px;" },
        { name: "is_graduate", align: "center", label: "จบการศึกษา", field: "is_graduate", style: "width: 110px;", headerStyle: "width: 110px;" },
        { name: "date", align: "center", label: "ปีที่จบ", field: "date", sortable: true, style: "width: 80px;", headerStyle: "width: 80px;" },
        { name: "year", align: "center", label: "ชั้นปี", field: "year", sortable: true, style: "width: 70px;", headerStyle: "width: 70px;" },
        { name: "is_disability", align: "center", label: "มีความพิการ", field: "is_disability", style: "width: 110px;", headerStyle: "width: 110px;" },
        { name: "disability_name", align: "left", label: "ประเภทความพิการ", field: "disability_name", style: "min-width: 170px;", headerStyle: "min-width: 170px;" },
        { name: "dis_description", align: "left", label: "รายละเอียดความพิการ", field: "dis_description", style: "min-width: 220px;", headerStyle: "min-width: 220px;" },
        { name: "project_name", align: "left", label: "โครงการ", field: "project_name", style: "min-width: 170px;", headerStyle: "min-width: 170px;" },
        { name: "advisor_name", align: "left", label: "ผู้ดูแลกลุ่ม", field: "advisor_name", style: "min-width: 170px;", headerStyle: "min-width: 170px;" },
      ],

      members: { options: [] },
      members_: { options: [] },
      member: { label: "", value: "", description: "" },

      institutes_: { options: [] },
      institutes: { options: [] },
      institute: { label: "", value: "" },

      facultys: { options: [] },
      facultys_: { options: [] },
      faculty: { label: "", value: "" },

      degrees_: { options: [] },
      degrees: { options: [] },
      degree: { label: "", value: "" },

      departments_: { options: [] },
      departments: { options: [] },
      department: { label: "", value: "" },

      disabilitys_: { options: [] },
      disabilitys: { options: [] },
      disability: { label: "", value: "" },

      projects_: { options: [] },
      projects: { options: [] },
      project: { label: "", value: "" },

      advisors_: { options: [] },
      advisors: { options: [] },
      advisor: { label: "", value: "" },

      $q: useQuasar(),
    };
  },

  methods: {
    // นำออกไฟล์ excel
    async exportTable() {
      if (!this.individuals1 || this.individuals1.length === 0) {
        this.$q.notify({
          color: 'orange',
          message: 'ไม่พบข้อมูลในตาราง',
          icon: 'warning'
        });
        return;
      }

      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Individuals');

        // Styles
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        // const groupFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }; // Not used for flat list
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        // 1. Title
        worksheet.mergeCells('A1:P1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลส่วนตัว (Admin View) - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        // 2. Header
        const headerRow = worksheet.getRow(2);
        headerRow.values = [
          'ชื่อ-สกุล', 'บทบาท', 'ปีเกิด', 'โทรศัพท์',
          'สถาบัน', 'คณะ', 'ระดับ', 'สาขา',
          'จบการศึกษา', 'ปีที่จบ', 'ชั้นปี',
          'มีความพิการ', 'ประเภทความพิการ', 'รายละเอียด',
          'โครงการ', 'ผู้ดูแลกลุ่ม'
        ];
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = border;
        });

        // 3. Data Processing (Flat List)
        // Grouping not strictly needed for Individuals list as it is usually 1 row per person,
        // but if duplicates exist, they will just be listed.
        const sortedRows = [...this.individuals1].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

        let zebra = false;

        sortedRows.forEach(row => {
          const r = worksheet.addRow([
            row.full_name || '-',
            row.status || '-',
            row.birthday || '-',
            row.telephone || '-',
            row.institute_name || '-',
            row.faculty_name || '-',
            row.degree_name || '-',
            row.department_name || '-',
            row.is_graduate === '1' ? 'จบแล้ว' : 'กำลังศึกษา',
            row.date || '-',
            row.year || '-',
            row.is_disability === '1' ? 'มี' : 'ไม่มี',
            row.disability_name || '-',
            row.dis_description || '-',
            row.project_name || '-',
            row.advisor_name || '-'
          ]);

          r.eachCell((cell) => {
            cell.font = dataFont;
            cell.border = border;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            if (zebra) cell.fill = zebraFill;
          });
          zebra = !zebra;
        });

        // 4. Column Widths
        worksheet.columns = [
          { key: 'A', width: 25 }, // Name
          { key: 'B', width: 15 }, // Role
          { key: 'C', width: 10 }, // Birthday
          { key: 'D', width: 15 }, // Phone
          { key: 'E', width: 20 }, // Institute
          { key: 'F', width: 20 }, // Faculty
          { key: 'G', width: 15 }, // Degree
          { key: 'H', width: 20 }, // Dept
          { key: 'I', width: 12 }, // Grad Status
          { key: 'J', width: 10 }, // Grad Year
          { key: 'K', width: 8 },  // Year
          { key: 'L', width: 12 }, // Disability
          { key: 'M', width: 20 }, // Dis Type
          { key: 'N', width: 25 }, // Dis Desc
          { key: 'O', width: 20 }, // Project
          { key: 'P', width: 20 }  // Advisor
        ];

        // 5. Generate File
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Individual_Admin_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);

        this.$q.loading.hide();
        this.$q.notify({ color: 'positive', message: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว', icon: 'check' });

      } catch (error) {
        this.$q.loading.hide();
        console.error("Export error:", error);
        this.$q.notify({ color: 'negative', message: 'ส่งออกไม่สำเร็จ: ' + error.message, icon: 'error' });
      }
    },
    // label pagination
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      if (this.pagination.rowsPerPage === 0) return `แสดงทั้งหมด ${totalRowsNumber} รายการ`;
      return `แสดง ${firstRowIndex}-${endRowIndex} จาก ${totalRowsNumber} รายการ`;
    },

    showAllRows() {
      this.pagination.rowsPerPage = 0;
      this.$q.notify({ message: "แสดงข้อมูลทั้งหมด " + this.individuals1.length + " รายการ", color: "info", icon: "unfold_more", position: "top", timeout: 1500 });
    },

    collapseTable() {
      this.pagination.rowsPerPage = 10;
      this.pagination.page = 1;
      this.$q.notify({ message: "แสดงแบบแบ่งหน้า 10 รายการต่อหน้า", color: "info", icon: "unfold_less", position: "top", timeout: 1500 });
    },

    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";

      this.member = { label: "", value: "", description: "" };

      this.individual.birthday = "";
      this.individual.telephone = "";

      this.individual.is_graduate = "0";
      this.individual.year = "";
      this.individual.date = "";

      this.degree = { label: "", value: "" };
      this.faculty = { label: "", value: "" };
      this.department = { label: "", value: "" };
      this.institute = { label: "", value: "" };

      this.individual.is_disability = "0";
      this.disability = { label: "", value: "" };
      this.individual.dis_description = "";

      this.project = { label: "", value: "" };
      this.advisor = { label: "", value: "" };

      // ✅ ข้อมูลเพิ่มเติม
      this.individual.province = "";
      this.individual.favorite_subject = "";
      this.individual.unfavorite_subject = "";
      this.individual.favorite_activity = "";
      this.individual.skill = "";
      this.individual.dream_career = "";
      this.individual.preferred_region = "";
      this.individual.additional_info = "";

      this.pdpa = false;
    },

    // ✅ submitForm: คง logic เดิม (insert/update)
    async submitForm() {
      const data = {
        member_id: this.member?.value || "",
        birthday: this.individual.birthday,
        telephone: this.individual.telephone,
        department_id: this.department?.value || "",
        is_graduate: this.individual.is_graduate,
        year: this.individual.year,
        date: this.individual.date,
        is_disability: this.individual.is_disability,
        disability_id: this.disability?.value || "",
        dis_description: this.individual.dis_description,
        project_id: this.project?.value || "",
        advisor_id: this.advisor?.value || "",
        province: this.individual.province,
        favorite_subject: this.individual.favorite_subject,
        unfavorite_subject: this.individual.unfavorite_subject,
        favorite_activity: this.individual.favorite_activity,
        skill: this.individual.skill,
        dream_career: this.individual.dream_career,
        preferred_region: this.individual.preferred_region,
        additional_info: this.individual.additional_info,
      };

      const msg = this.isEdit
        ? "คุณต้องการบันทึกการเแก้ไขข้อมูลหรือไม่?"
        : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";

      this.$q.dialog({
        title: "ยืนยัน",
        message: msg,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          if (!this.isEdit) {
            await axios.post(this.url_api_individual, data);
            this.$q.notify({ message: "บันทึกข้อมูลสำเร็จ", color: "positive", icon: "check_circle" });
          } else {
            await axios.put(`${this.url_api_individual}/${this.individual.individual_id}`, data);
            this.$q.notify({ message: "แก้ไขข้อมูลสำเร็จ", color: "positive", icon: "check_circle" });
          }
          this.resetForm();
          await this.getUpdate();
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

    // ✅ editUser: คืน logic เดิมให้ปุ่มทำงาน
    async editUser(individual_id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;

      this.$q.loading.show({
        message: "กำลังโหลดข้อมูล...",
        spinnerColor: "blue",
      });

      try {
        const response = await axios.get(`${this.url_api_individual}/${individual_id}`);
        const data = response.data;

        this.individual.individual_id = data.individual_id;

        this.member = {
          value: data.member_id,
          label: data.full_name,
          description: data.status
        };

        this.individual.birthday = data.birthday;
        this.individual.telephone = data.telephone;

        this.institute = { value: data.institute_id, label: data.institute_name };
        this.faculty = { value: data.faculty_id, label: data.faculty_name };
        this.degree = { value: data.degree_id, label: data.degree_name };
        this.department = { value: data.department_id, label: data.department_name };

        this.individual.is_graduate = String(data.is_graduate);
        this.individual.date = data.date;
        this.individual.year = data.year;

        this.individual.is_disability = String(data.is_disability);
        this.disability = { value: data.disability_id, label: data.disability_name };
        this.individual.dis_description = data.dis_description;

        this.project = { value: data.project_id, label: data.project_name };
        this.advisor = { value: data.advisor_id, label: data.advisor_name };

        this.individual.province = data.province;
        this.individual.favorite_subject = data.favorite_subject;
        this.individual.unfavorite_subject = data.unfavorite_subject;
        this.individual.favorite_activity = data.favorite_activity;
        this.individual.skill = data.skill;
        this.individual.dream_career = data.dream_career;
        this.individual.preferred_region = data.preferred_region;
        this.individual.additional_info = data.additional_info;

        this.pdpa = true;
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "เกิดข้อผิดพลาดในการโหลดข้อมูล", color: "negative", icon: "error" });
      } finally {
        this.$q.loading.hide();
      }
    },

    // ✅ deleteUser: คืน logic เดิมให้ปุ่มทำงาน
    deleteUser(individual_id, full_name) {
      this.$q.dialog({
        title: "ยืนยัน",
        message: `คุณต้องการลบ [ ${individual_id} - ${full_name} ] หรือไม่ ?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        this.$q.loading.show({ message: "กำลังลบข้อมูล...", spinnerColor: "red" });
        try {
          await axios.delete(`${this.url_api_individual}/${individual_id}`);
          this.$q.notify({ message: "ลบข้อมูลสำเร็จ", color: "positive", icon: "check_circle" });
          this.resetForm();
          await this.getUpdate();
        } catch (error) {
          console.error(error);
          this.$q.notify({ message: "เกิดข้อผิดพลาดในการลบข้อมูล", color: "negative", icon: "error" });
        } finally {
          this.$q.loading.hide();
        }
      });
    },

    // โหลดตาราง
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(this.url_api_individual);
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error(error);
        this.$q.notify({ message: "โหลดข้อมูลไม่สำเร็จ", color: "negative", icon: "error" });
      } finally {
        this.loading = false;
      }
    },

    // โหลด option ต่าง ๆ (คงเดิม)
    async getMember() {
      try {
        const res = await axios.get(`${this.url_api_member}/options`);
        if (res.data && Array.isArray(res.data)) {
          this.members_.options = res.data.map(i => ({ label: i.full_name, value: i.member_id, description: i.status }));
          this.members.options = [...this.members_.options];
        }
      } catch (err) { console.error(err); }
    },

    async getInstitutes() {
      try {
        const res = await axios.get(this.url_api_institute);
        if (res.data && Array.isArray(res.data)) {
          this.institutes_.options = res.data.map(i => ({ label: i.institute_name, value: i.institute_id }));
          this.institutes.options = [...this.institutes_.options];
        }
      } catch (err) { console.error(err); }
    },

    async getFacultys() {
      if (!this.institute || !this.institute.value) return;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/faculties`, { params: { institute_id: this.institute.value } });
        if (res.data && Array.isArray(res.data)) {
          this.facultys_.options = res.data.map(i => ({ label: i.faculty_name, value: i.faculty_id }));
          this.facultys.options = [...this.facultys_.options];
        }
      } catch (err) { console.error(err); }
    },

    async getDegrees() {
      if (!this.institute || !this.institute.value || !this.faculty || !this.faculty.value) return;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/degrees`, { params: { faculty_id: this.faculty.value } });
        if (res.data && Array.isArray(res.data)) {
          this.degrees_.options = res.data.map(i => ({ label: i.degree_name, value: i.degree_id }));
          this.degrees.options = [...this.degrees_.options];
        }
      } catch (err) { console.error(err); }
    },

    async getDepartments() {
      if (!this.degree || !this.degree.value) return;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/departments`, {
          params: { degree_id: this.degree.value }
        });
        if (res.data && Array.isArray(res.data)) {
          this.departments_.options = res.data.map(i => ({ label: i.department_name, value: i.department_id }));
          this.departments.options = [...this.departments_.options];
        }
      } catch (err) { console.error(err); }
    },

    async getDisabilitys() {
      try {
        const res = await axios.get(this.url_api_disability);
        if (res.data && Array.isArray(res.data)) {
          this.disabilitys_.options = res.data.map(i => ({ label: i.disability_name, value: i.disability_id }));
          this.disabilitys.options = [...this.disabilitys_.options];
        }
      } catch (err) { console.error(err); }
    },

    async getProjects() {
      try {
        const res = await axios.get(this.url_api_project);
        if (res.data && Array.isArray(res.data)) {
          this.projects_.options = res.data.map(i => ({ label: i.project_name, value: i.project_id }));
          this.projects.options = [...this.projects_.options];
        }
      } catch (err) { console.error(err); }
    },

    async getAdvisors() {
      try {
        const res = await axios.get(this.url_api_advisor);
        if (res.data && Array.isArray(res.data)) {
          this.advisors_.options = res.data.map(i => ({ label: i.full_name, value: i.member_id }));
          this.advisors.options = [...this.advisors_.options];
        }
      } catch (err) { console.error(err); }
    },

    // events
    onInstituteValueChange(val) {
      // เมื่อเปลี่ยนสถาบัน ให้เคลียร์ คณะ ระดับ สาขา
      this.faculty = { label: "", value: "" };
      this.degree = { label: "", value: "" };
      this.department = { label: "", value: "" };
      this.facultys.options = [];
      this.facultys_.options = [];
      this.degrees.options = [];
      this.degrees_.options = [];
      this.departments.options = [];
      this.departments_.options = [];
      this.getFacultys();
    },
    onFacultyValueChange(val) {
      // เมื่อเปลี่ยนคณะ ให้เคลียร์ ระดับ สาขา
      this.degree = { label: "", value: "" };
      this.department = { label: "", value: "" };
      this.degrees.options = [];
      this.degrees_.options = [];
      this.departments.options = [];
      this.departments_.options = [];
      this.getDegrees();
    },
    onDegreeValueChange(val) {
      // เมื่อเปลี่ยนระดับ ให้เคลียร์ สาขา
      this.department = { label: "", value: "" };
      this.departments.options = [];
      this.departments_.options = [];
      this.getDepartments();
    },
    onDepartmentValueChange() { },
    onProjectValueChange() { },
    onDisabilityValueChange() { },

    // filters
    filterInstitute(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.institutes.options = this.institutes_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterFaculty(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.facultys.options = this.facultys_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterDegree(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.degrees.options = this.degrees_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterDepartment(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.departments.options = this.departments_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterDisability(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.disabilitys.options = this.disabilitys_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterProject(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.projects.options = this.projects_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },
    filterAdvisor(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.advisors.options = this.advisors_.options.filter((v) => v.label.toLowerCase().includes(needle));
      });
    },

    // clear helpers
    onMember(member) {
      if (!member) this.member = { label: "", value: "", description: "" };
    },
    OnInstitute(institute) {
      if (!institute) this.institute = { label: "", value: "" };
    },
    OnFaculty(faculty) {
      if (!faculty) this.faculty = { label: "", value: "" };
    },
    OnDegree(degree) {
      if (!degree) this.degree = { label: "", value: "" };
    },
    OnDepartment(department) {
      if (!department) this.department = { label: "", value: "" };
    },
    OnDisability(disability) {
      if (!disability) this.disability = { label: "", value: "" };
    },
    OnProject(project) {
      if (!project) this.project = { label: "", value: "" };
    },
    OnAdvisor(advisor) {
      if (!advisor) this.advisor = { label: "", value: "" };
    },
  },

  mounted() {
    this.getUpdate();
    this.getMember();
    this.getInstitutes();
    this.getFacultys();
    this.getDegrees();
    this.getDepartments();
    this.getDisabilitys();
    this.getProjects();
    this.getAdvisors();
  },

  created() {
    const restBaseUrl = getRestApiUrl(this.$store);
    this.url_api_individual = `${restBaseUrl}/individuals`;
    this.url_api_institute = `${restBaseUrl}/institutes`;
    this.url_api_disability = `${restBaseUrl}/disabilities`;
    this.url_api_project = `${restBaseUrl}/projects`;
    this.url_api_advisor = `${restBaseUrl}/members?role=advisor`;
    this.url_api_member = `${restBaseUrl}/members`;
  },
};
</script>

<style lang="sass">
.page-bg
  background: #f5f5f5

.page-full
  min-height: 100vh

.form-card
  width: 100%
  max-width: none !important
  border-radius: 12px

.form-card-full
  min-height: calc(100vh - 32px)
  display: flex
  flex-direction: column

.form-section
  flex: 0 0 auto

.table-section
  flex: 1 1 auto
  display: flex
  flex-direction: column
  min-height: 0

// ✅ wrapper วาด “ขอบนอก” แก้ขอบซ้าย/ขวาหายตอน scroll
.table-wrap
  width: 100%
  max-width: 100%
  overflow-x: auto
  -webkit-overflow-scrolling: touch
  border: 1px solid rgba(0,0,0,0.20)
  border-radius: 8px
  background: white

.table-wrap-fill
  flex: 1 1 auto
  min-height: 0
  overflow-y: auto

// ✅ เส้นตารางครบทุก cell ไม่ซ้อน ไม่หาย
.my-sticky-header-table
  background: transparent

  .q-table__container
    border: none !important
    box-shadow: none !important

  .q-table__middle
    overflow: visible !important
    max-height: none !important
    height: auto !important

  .q-table
    width: 100%
    border-collapse: collapse !important
    border-spacing: 0 !important

  .q-table thead th,
  .q-table tbody td
    border: 1px solid rgba(0,0,0,0.15) !important

  .q-table thead th
    position: sticky
    top: 0
    z-index: 5
    background: $primary !important
    color: white
    font-weight: 700

  .q-table tbody tr:hover
    background: #E3F2FD

  .q-table tbody td
    padding: 8px
    font-size: 13px
    vertical-align: middle
</style>
