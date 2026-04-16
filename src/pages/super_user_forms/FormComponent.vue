<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page padding class="items-center justify-center" style="background: linear-gradient(135deg, #74c588 0%, #0ad13c 100%); min-height: 100vh;">
          <div class="full-width">
            <div class="col-md-10 offset-md-1 col-xs-12 q-pa-xs">
              <q-card flat class="bg-white text-black">
                <q-card-section class="bg-blue-14">
                  <h4 class="text-h5 text-white q-my-xs text-center">
                    {{ title }}
                  </h4>
                </q-card-section>
                <div class="row full-width">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <q-form @submit.prevent="submitForm()" @reset="resetForm()" method="post" class="q-gutter-md">
                      <!-- ข้อมูลส่วนตัว (ผู้ดูแลระบบ) -->
                      <div class="row q-col-gutter-sm">
                        <div class="col-12">
                          <q-expansion-item group="main-form" label="ข้อมูลส่วนตัว (ผู้ดูแลกลุ่ม) - คลิกเพื่อ ย่อ/ขยาย"
                            header-class="text-white text-subtitle1 bg-blue-9" class="shadow-1 overflow-hidden"
                            style="border-radius: 8px" default-opened>
                            <q-card>
                              <q-card-section class="q-gutter-md">
                                <!-- รายชื่อ -->
                                <div class="row">
                                  <div class="col-md-12 col-xs-12 q-pa-xs">
                                    <q-select use-input @filter="filterMember" color="blue-3" v-model="member"
                                      :options="members.options" label="ชื่อ-สกุล *">
                                      <template v-slot:prepend>
                                        <q-icon name="school" />
                                      </template>
                                      <template v-slot:selected>
                                        ชื่อ-สกุล:
                                        <q-chip v-if="member" dense square color="white" text-color="primary"
                                          class="q-pa-xs">
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
                                <!-- วัน-เดือน-ปี เกิด+หมายเลขโทรศัพท์ -->
                                <div class="row">
                                  <!-- วัน-เดือน-ปี เกิด -->
                                  <div class="col-md-6 col-xs-12 q-pa-xs">
                                    <q-input standout bottom-slots filled v-model="individual.birthday"
                                      label="ปีเกิด ค.ศ.*" clearable mask="####" fill-mask hint="ปีเกิด ค.ศ.: ####"
                                      v-on:keyup.up="onTelephone()" v-on:keyup.left="onTelephone()">
                                      <template v-slot:prepend>
                                        <q-icon name="school" />
                                      </template>
                                      <template v-slot:append>
                                        <q-icon name="favorite" />
                                      </template>
                                    </q-input>
                                  </div>
                                  <!-- หมายเลขโทรศัพท์ -->
                                  <div class="col-md-6 col-xs-12 q-pa-xs">
                                    <q-input standout bottom-slots v-model="individual.telephone"
                                      label="หมายเลขโทรศัพท์ *" mask="##-####-####" fill-mask
                                      hint="โทรศัพท์: ##-####-####" clearable>
                                      <template v-slot:prepend>
                                        <q-icon name="person_add" />
                                      </template>
                                      <template v-slot:append>
                                        <q-icon name="favorite" />
                                      </template>
                                    </q-input>
                                  </div>
                                </div>
                                <!-- สถาบันการศึกษา + ระดับการศึกษา -->
                                <div class="row">
                                  <!-- สถาบันการศึกษา -->
                                  <div class="col-md-6 col-xs-12 q-pa-xs">
                                    <q-select use-input @filter="filterInstitute" color="blue-3" v-model="institute"
                                      :options="institutes.options" label="สถาบันการศึกษา *" stack-label
                                      @update:model-value="(val) => onInstituteValueChange(val)
                                      ">
                                      <template v-slot:prepend>
                                        <q-icon name="school" />
                                      </template>
                                      <template v-slot:selected>
                                        สถาบัน:
                                        <q-chip v-if="institute" dense square color="white" text-color="primary"
                                          class="q-pa-xs">
                                          {{ institute.label }}
                                        </q-chip>
                                        <q-badge v-else>*none*</q-badge>
                                      </template>
                                      <template v-if="institute" v-slot:append>
                                        <q-icon name="cancel" @click.stop.prevent="
                                          OnInstitute((institute = null))
                                          " class="cursor-pointer" />
                                      </template>
                                    </q-select>
                                  </div>
                                  <!-- คณะ -->
                                  <div class="col-md-6 col-xs-12 q-pa-xs">
                                    <q-select use-input @filter="filterFaculty" color="blue-3" v-model="faculty"
                                      :options="facultys.options" label="คณะ *" stack-label @update:model-value="(val) => onFacultyValueChange(val)
                                      ">
                                      <template v-slot:prepend>
                                        <q-icon name="school" />
                                      </template>
                                      <template v-slot:selected>
                                        คณะ:
                                        <q-chip v-if="faculty" dense square color="white" text-color="primary"
                                          class="q-pa-xs">
                                          {{ faculty.label }}
                                        </q-chip>
                                        <q-badge v-else>*none*</q-badge>
                                      </template>
                                      <template v-if="faculty" v-slot:append>
                                        <q-icon name="cancel" @click.stop.prevent="
                                          OnFaculty((faculty = null))
                                          " class="cursor-pointer" />
                                      </template>
                                    </q-select>
                                  </div>
                                </div>
                                <!-- สาขาวิชา -->
                                <div class="row">
                                  <!-- ระดับการศึกษา -->
                                  <div class="col-md-6 col-xs-12 q-pa-xs">
                                    <q-select use-input @filter="filterDegree" color="blue-3" v-model="degree"
                                      :options="degrees.options" label="ระดับการศึกษา *" stack-label
                                      @update:model-value="(val) => onDegreeValueChange(val)
                                      ">
                                      <template v-slot:prepend>
                                        <q-icon name="school" />
                                      </template>
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
                                  <!-- สาขาวิชา -->
                                  <div class="col-md-6 col-xs-12 q-pa-xs">
                                    <q-select use-input @filter="filterDepartment" color="blue-3" v-model="department"
                                      :options="departments.options" label="สาขาวิชา *" stack-label @update:model-value="(val) => onDepartmentValueChange(val)
                                      ">
                                      <template v-slot:prepend>
                                        <q-icon name="school" />
                                      </template>
                                      <template v-slot:selected>
                                        สาขาวิชา:
                                        <q-chip v-if="department" dense square color="white" text-color="primary"
                                          class="q-pa-xs">
                                          {{ department.label }}
                                        </q-chip>
                                        <q-badge v-else>*none*</q-badge>
                                      </template>
                                      <template v-if="department" v-slot:append>
                                        <q-icon name="cancel" @click.stop.prevent="
                                          OnDepartment((department = null))
                                          " class="cursor-pointer" />
                                      </template>
                                    </q-select>
                                  </div>
                                </div>
                                <!-- จบการศึกษา + ปีที่สำเร็จการศึกษา + ชั้นปีที่กำลังศึกษา -->
                                <div class="row">
                                  <!-- จบการศึกษา -->
                                  <div class="col-md-4 col-xs-4 q-pa-xs">
                                    <q-checkbox v-model="individual.is_graduate" val="is_graduate" label="จบการศึกษา"
                                      color="teal" true-value="1" false-value="0" />
                                  </div>
                                  <!-- ปีที่สำเร็จการศึกษา -->
                                  <div class="col-md-4 col-xs-8 q-pa-xs">
                                    <q-input standout bottom-slots filled v-model="individual.date" label="ปีที่จบ ค.ศ."
                                      clearable mask="####" fill-mask hint="ปีที่จบการศึกษา ค.ศ.: ####" :disable="individual.is_graduate == '1' ? false : true
                                        ">
                                      <template v-slot:prepend>
                                        <q-icon name="school" />
                                      </template>
                                      <template v-slot:append>
                                        <q-icon name="favorite" />
                                      </template>
                                    </q-input>
                                  </div>
                                  <!-- ชั้นปีที่กำลังศึกษา -->
                                  <div class="col-md-4 col-xs-12 q-pa-xs">
                                    <q-input standout bottom-slots filled v-model="individual.year" label="ชั้นปี"
                                      clearable mask="#" fill-mask hint="ชั้นปี: #" :disable="individual.is_graduate == '0' ? false : true
                                        ">
                                      <template v-slot:prepend>
                                        <q-icon name="school" />
                                      </template>
                                      <template v-slot:append>
                                        <q-icon name="favorite" />
                                      </template>
                                    </q-input>
                                  </div>
                                </div>
                                <!-- ภาวะความพิการ + ชนิดความพิการ + รายละเอียดความพิการ -->
                                <div class="row">
                                  <!-- ภาวะความพิการ -->
                                  <div class="col-md-4 col-xs-12 q-pa-xs">
                                    <q-checkbox v-model="individual.is_disability" val="is_disability"
                                      label="มีภาวะความพิการ" color="teal" true-value="1" false-value="0" />
                                  </div>
                                  <!-- ชนิดความพิการ -->
                                  <div class="col-md-8 col-xs-12 q-pa-xs">
                                    <q-select use-input @filter="filterDisability" color="blue-3" v-model="disability"
                                      :options="disabilitys.options" label="เลือกประเภทความพิการ" stack-label
                                      @update:model-value="(val) => onDisabilityValueChange(val)
                                      " :disable="individual.is_disability == '1' ? false : true
                                        ">
                                      <template v-slot:prepend>
                                        <q-icon name="assist_walker" />
                                      </template>
                                      <template v-slot:selected>
                                        ความพิการ:
                                        <q-chip v-if="disability" dense square color="white" text-color="primary"
                                          class="q-pa-xs">
                                          {{ disability.label }}
                                        </q-chip>
                                        <q-badge v-else>*none*</q-badge>
                                      </template>
                                      <template v-if="disability" v-slot:append>
                                        <q-icon name="cancel" @click.stop.prevent="
                                          OnDisability((disability = null))
                                          " class="cursor-pointer" />
                                      </template>
                                    </q-select>
                                  </div>
                                </div>
                                <div class="row">
                                  <!-- รายละเอียดความพิการ -->
                                  <div class="col-md-12 col-xs-12 q-pa-xs">
                                    <q-input standout bottom-slots filled v-model="individual.dis_description"
                                      label="รายละเอียด" clearable :disable="individual.is_disability == '1' ? false : true
                                        ">
                                      <template v-slot:prepend>
                                        <q-icon name="assist_walker" />
                                      </template>
                                      <template v-slot:append>
                                        <q-icon name="favorite" />
                                      </template>
                                    </q-input>
                                  </div>
                                </div>
                                <div class="row">
                                  <!-- โครงการ -->
                                  <div class="col-md-12 col-xs-12 q-pa-xs">
                                    <q-select use-input @filter="filterProject" color="blue-3" v-model="project"
                                      :options="projects.options" label="โครงการ" stack-label @update:model-value="(val) => onProjectValueChange(val)
                                      ">
                                      <template v-slot:prepend>
                                        <q-icon name="assignment_turned_in" />
                                      </template>
                                      <template v-slot:selected>
                                        โครงการ:
                                        <q-chip v-if="project" dense square color="white" text-color="primary"
                                          class="q-pa-xs">
                                          {{ project.label }}
                                        </q-chip>
                                        <q-badge v-else>*none*</q-badge>
                                      </template>
                                      <template v-if="project" v-slot:append>
                                        <q-icon name="cancel" @click.stop.prevent="
                                          OnProject((project = null))
                                          " class="cursor-pointer" />
                                      </template>
                                    </q-select>
                                  </div>
                                  <!-- อาจารย์ที่ปรึกษา -->
                                </div>
                              </q-card-section>
                            </q-card>
                          </q-expansion-item>
                        </div>
                      </div>

                      <!-- ข้อมูลพื้นฐานเพิ่มเติม -->
                      <div class="row q-col-gutter-sm">
                        <div class="col-12">
                          <q-expansion-item group="extra-info" label="ข้อมูลพื้นฐานเพิ่มเติม (คลิกเพื่อ ย่อ/ขยาย)"
                            header-class="text-primary text-subtitle1 bg-blue-1" class="shadow-1 overflow-hidden"
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
                                <div class="col-md-12 col-xs-12 q-pa-xs">
                                  <q-input standout bottom-slots filled v-model="individual.skill"
                                    label="ความถนัด / ทักษะเด่น" type="textarea" rows="3" />
                                </div>
                                <div class="col-md-12 col-xs-12 q-pa-xs">
                                  <q-input standout bottom-slots filled v-model="individual.additional_info"
                                    label="ข้อมูลเพิ่มเติม" type="textarea" rows="3" />
                                </div>
                              </q-card-section>
                            </q-card>
                          </q-expansion-item>
                        </div>
                      </div>

                      <!-- ข้าพเจ้ายินยอม -->
                      <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                          <q-checkbox right-label v-model="pdpa"
                            label="ข้าพเจ้ายินยอมให้ใช้ข้อมูลส่วนบุคคล เพื่อเป็นประโยชน์ต่อตัวข้าพเจ้าและแผนงานกลไกจ้างงานคนพิการเข้มแข็งและเตรียมความพร้อมพนักงานสู่การเกษียณแบบบูรณาการ สำนักงานกองทุนสนับสนุนการสร้างเสริมสุขภาพ (สสส.) ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)" />
                        </div>
                      </div>
                      <!-- ปุ่มตวบคุม -->
                      <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs row justify-center">
                          <!-- บันทึก/แก้ไข -->
                          <q-btn :label="btnLabel" type="submit" color="primary" :disable="!pdpa" />
                          <!-- ยกเลิก -->
                          <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs" />
                          <!-- ออก -->
                          <q-btn label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                          <!-- กลับฟอร์มการลงทะเบียน -->
                          <q-btn color="primary" label="กลับฟอร์มการลงทะเบียน" no-caps flat to="/SuserFormRegistration">
                            <q-tooltip class="bg-accent">กลับฟอร์มการลงทะเบียน</q-tooltip>
                          </q-btn>
                          <!-- ไปฟอร์มกำหนดอาชีพเป้าหมาย -->
                          <q-btn color="primary" label="ไปฟอร์มกำหนดอาชีพเป้าหมาย" no-caps flat to="/SuserFormPlanCareer">
                            <q-tooltip class="bg-accent">ไปฟอร์มกำหนดอาชีพเป้าหมาย</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-form>
                  </div>
                </div>

                <!-- Section 2: Report Export Tools -->
                <div class="row q-mt-sm q-mb-md">
                  <div class="col-12">
                    <q-card flat bordered class="bg-green-1">
                      <q-item class="bg-green-2">
                        <q-item-section avatar>
                          <q-icon name="file_download_done" color="green-10" size="md" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-bold text-green-10 text-subtitle1">เครื่องมือส่งออกรายงาน
                            (Excel)</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-card-section class="q-py-md">
                        <div class="row q-col-gutter-md items-center">
                          <!-- Export Filename -->
                          <div class="col-md-6 col-xs-12">
                            <q-input dense outlined bg-color="white" v-model="file_export"
                              placeholder="ตั้งชื่อไฟล์รายงาน">
                              <template v-slot:prepend>
                                <q-icon name="drive_file_rename_outline" color="green" />
                              </template>
                            </q-input>
                          </div>
                          <!-- Export Button -->
                          <div class="col-md-6 col-xs-12 text-center">
                            <q-btn flat color="black" label="ส่งออก excel" @click="exportTable()" />
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <div class="q-pa-xs">
                      <q-table ref="tb" title="ข้อมูลส่วนตัว" :rows="individuals1" :columns="columns" row-key="individual_id"
                        :filter="filter" :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        selection="multiple" v-model:selected="selected"
                        table-header-style="height: 65px;" table-header-class="bg-primary text-white"
                        :rows-per-page-options="[10, 20, 30, 50, 100, 0]" v-model:pagination="pagination"
                        icon-first-page="home" icon-last-page="all_inclusive" icon-next-page="arrow_right"
                        icon-prev-page="arrow_left" :pagination-label="getPaginationLabel">
                        <template v-slot:top-left>
                          <div class="row q-gutter-sm items-center">
                            <div class="text-h6">ข้อมูลส่วนตัว</div>

                            <q-btn v-if="selected.length > 0" flat color="red" :label="`ลบที่เลือก (${selected.length})`" @click="deleteSelected" />

                            <q-chip color="primary" text-color="white" >
                              {{ individuals1.length }} รายการ
                            </q-chip>

                            <q-btn v-if="pagination.rowsPerPage !== 0" dense flat color="primary" label="แสดงทั้งหมด" @click="showAllRows" size="sm">
                              <q-tooltip>แสดงข้อมูลทั้งหมด</q-tooltip>
                            </q-btn>

                            <q-btn v-else dense flat color="primary" label="ย่อตาราง"
                              @click="collapseTable" size="sm">
                              <q-tooltip>แสดงแบบแบ่งหน้า</q-tooltip>
                            </q-btn>
                          </div>
                        </template>
                        <!-- ปุ่มค้นหา -->
                        <template v-slot:top-right="props">
                          <div class="row">
                            <div class="col-md-5 col-xs-5 q-pa-xs">
                              <q-input borderless dense debounce="300" v-model="filter"
                                placeholder="ค้นหาข้อมูลส่วนตัว">
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
                              <q-btn flat round dense :@click="props.toggleFullscreen" class="q-ml-md" />
                            </div>
                          </div>
                        </template>
                        <!-- ปุ่มควบคุม -->
                        <template v-slot:body-cell-actions="props">
                          <q-td :props="props" class="text-center">
                            <q-btn size="sm" color="blue" label="แก้ไข" unelevated no-caps @click="editUser(props.row.individual_id)" />
                            <q-btn size="sm" color="red" label="ลบ" unelevated no-caps @click="
                              deleteUser(
                                props.row.individual_id,
                                props.row.full_name
                              )
                              " />
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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getRestApiUrl } from "../../utils/apiConfig.js";
// ส่งออกไฟล์ excel

export default {
  name: "FormIndividualSuperUser",
  components: {},
  data() {
    return {
      file_export: "",
      pdpa: ref(false),
      picked: new Date(),
      title: "ข้อมูลส่วนตัว(ผู้ดูแลกลุ่ม)",
      btnLabel: "เพิ่มข้อมูล",
      pagination: ref({ sortBy: "full_name", descending: false, page: 1, rowsPerPage: 10 }),
      individual: {
        individual_id: "",
        member_id: this.$store.getters.myMember_id,
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
        province: "",
        favorite_subject: "",
        unfavorite_subject: "",
        favorite_activity: "",
        skill: "",
        dream_career: "",
        preferred_region: "",
        additional_info: "",
      },
      isEdit: false,
      status: "บันทึก",
      visibleColumns: ref([
        "actions",
        "individual_id",
        "status",
        "member_id",
        "full_name",
        "birthday",
        "telephone",
        "institute_id",
        "institute_name",
        "faculty_name",
        "degree_name",
        "department_id",
        "department_name",
        "is_graduate",
        "date",
        "year",
        "is_disability",
        "disability_id",
        "disability_name",
        "dis_describtion",
        "project_id",
        "project_name",
        "advisor_name",
        "province",
        "favorite_subject",
        "unfavorite_subject",
        "favorite_activity",
        "skill",
        "dream_career",
        "preferred_region",
        "additional_info",
      ]),
      columns: [
        // ข้อมูลส่วนตัว
        { name: "actions", align: "center", label: "แก้ไข/ลบ", style: "width: 170px;", headerStyle: "width: 170px;" },
        // {
        //   name: "individual_id",
        //   label: "รหัสข้อมูลส่วนตัว",
        //   align: "center",
        //   field: (row) => row.individual_id,
        //   format: (val) => `${val}`,
        //   sortable: true,
        //   required: true,
        // },
        {
          name: "status",
          align: "left",
          label: "บทบาท",
          field: "status",
          sortable: true,
        },
        {
          name: "full_name",
          align: "left",
          label: "ชื่อ-สกุล",
          field: "full_name",
          sortable: true,
        },
        {
          name: "birthday",
          align: "center",
          label: "วันเกิด",
          field: "birthday",
          sortable: true,
        },
        {
          name: "telephone",
          align: "center",
          label: "โทรศัพท์",
          field: "telephone",
          sortable: true,
        },
        {
          name: "institute_name",
          align: "left",
          label: "สถาบัน",
          field: "institute_name",
          sortable: true,
        },
        {
          name: "faculty_name",
          align: "center",
          label: "คณะ",
          field: "faculty_name",
          sortable: true,
        },
        {
          name: "degree_name",
          align: "center",
          label: "ระดับ",
          field: "degree_name",
          sortable: true,
        },
        {
          name: "department_name",
          align: "center",
          label: "สาขา",
          field: "department_name",
          sortable: true,
        },
        {
          name: "is_graduate",
          align: "center",
          label: "จบการศึกษา",
          field: "is_graduate",
          sortable: true,
        },
        {
          name: "date",
          align: "center",
          label: "ปีที่สำเร็จการศึกษา",
          field: "date",
          sortable: true,
        },
        {
          name: "year",
          align: "center",
          label: "ปีที่กำลังศึกษา",
          field: "year",
          sortable: true,
        },
        // ข้อมูลความพิการ
        {
          name: "is_disability",
          align: "center",
          label: "ภาวะความพิการ",
          field: "is_disability",
          sortable: true,
        },
        {
          name: "disability_name",
          align: "left",
          label: "ความพิการ",
          field: "disability_name",
          sortable: true,
        },
        {
          name: "dis_describtion",
          align: "left",
          label: "รายละเอียดความพิการ",
          field: "dis_description",
          sortable: true,
        },
        {
          name: "project_name",
          align: "left",
          label: "โครงการ",
          field: "project_name",
          sortable: true,
        },
        {
          name: "advisor_name",
          align: "left",
          label: "ผู้ดูแลกลุ่ม",
          field: "advisor_name",
          sortable: true,
        },
        { name: "province", label: "จังหวัด", field: "province", sortable: true },
        { name: "favorite_subject", label: "วิชาที่ชอบ", field: "favorite_subject", sortable: true },
        { name: "unfavorite_subject", label: "อุปกรณ์ที่จำเป็น", field: "unfavorite_subject", sortable: true },
        { name: "favorite_activity", label: "กิจกรรมที่ชอบทำ", field: "favorite_activity", sortable: true },
        { name: "skill", label: "ความถนัด", field: "skill", sortable: true },
        { name: "dream_career", label: "อาชีพในฝัน", field: "dream_career", sortable: true },
        { name: "preferred_region", label: "ภาค/จังหวัดที่อยากอยู่", field: "preferred_region", sortable: true },
        { name: "additional_info", label: "ข้อมูลเพิ่มเติม", field: "additional_info", sortable: true },
      ],
      filter: ref(""),
      loading: ref(false),
      individuals1: [],
      pagination: {
        sortBy: "individual_id",
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
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
      institutes_: {
        options: [],
      },
      institutes: {
        options: [],
      },
      institute: ref({
        label: "",
        value: "",
      }),
      facultys: {
        options: [],
      },
      facultys_: {
        options: [],
      },
      faculty: ref({
        label: "",
        value: "",
      }),
      degrees_: {
        options: [],
      },
      degrees: {
        options: [],
      },
      degree: ref({
        label: "",
        value: "",
      }),
      departments_: {
        options: [],
      },
      departments: {
        options: [],
      },
      department: ref({
        label: "",
        value: "",
      }),
      disabilitys_: {
        options: [],
      },
      disabilitys: {
        options: [],
      },
      disability: ref({
        label: "",
        value: "",
      }),
      projects_: {
        options: [],
      },
      projects: {
        options: [],
      },
      project: ref({
        label: "",
        value: "",
      }),
      advisors_: {
        options: [],
      },
      advisors: {
        options: [],
      },
      advisor: ref({
        label: "",
        value: "",
      }),
      selected: ref([]),
      $q: useQuasar(),
    };
  },

  methods: {
    async exportTable() {
      if (!this.individuals1 || this.individuals1.length === 0) {
        this.$q.notify({ color: 'orange', message: 'ไม่พบข้อมูลในตาราง', icon: 'warning' });
        return;
      }

      this.$q.loading.show({ message: 'กำลังสร้างไฟล์ Excel...' });

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Personal Info');

        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        const headerFont = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        const dataFont = { name: 'Sarabun', size: 10 };
        const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        worksheet.mergeCells('A1:E1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานข้อมูลส่วนตัว (Super User Form) - ${new Date().toLocaleDateString('th-TH')}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        const filteredCols = this.columns.filter(c => c.name !== 'actions');
        const headerRow = worksheet.getRow(2);
        headerRow.values = filteredCols.map(c => c.label);
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = border;
        });

        const rows = this.selected.length > 0 ? this.selected : this.individuals1;
        rows.forEach((row, idx) => {
          const r = worksheet.addRow(filteredCols.map(c => {
            const val = typeof c.field === 'function' ? c.field(row) : row[c.field || c.name];
            return val !== undefined && val !== null ? val : '-';
          }));
          r.eachCell((cell) => {
            cell.font = dataFont;
            cell.border = border;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            if (idx % 2 === 1) cell.fill = zebraFill;
          });
        });

        worksheet.columns = filteredCols.map(() => ({ width: 25 }));

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Personal_Info_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);

        this.$q.notify({ color: 'positive', message: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว', icon: 'check' });
      } catch (error) {
        console.error("Export error:", error);
        this.$q.notify({ color: 'negative', message: 'ส่งออกไม่สำเร็จ: ' + error.message, icon: 'error' });
      } finally {
        this.$q.loading.hide();
      }
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      if (this.pagination.rowsPerPage === 0) return `แสดงทั้งหมด ${totalRowsNumber} รายการ`;
      return `แสดง ${firstRowIndex}-${endRowIndex} จาก ${totalRowsNumber} รายการ`;
    },
    showAllRows() {
      this.pagination.rowsPerPage = 0;
      this.$q.notify({ message: "แสดงข้อมูลทั้งหมด", color: "info", position: "top", timeout: 1500 });
    },
    collapseTable() {
      this.pagination.rowsPerPage = 10;
      this.pagination.page = 1;
      this.$q.notify({ message: "แสดงแบบแบ่งหน้า", color: "info", position: "top", timeout: 1500 });
    },
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.individual = {
        individual_id: "", member_id: this.member_id, birthday: "", telephone: "", institute_id: 1, faculty_id: "", degree_id: "", department_id: "", is_graduate: "0", year: "", date: "", is_disability: "0", disability_id: "", dis_description: "", project_id: "", province: "", favorite_subject: "", unfavorite_subject: "", favorite_activity: "", skill: "", dream_career: "", preferred_region: "", additional_info: "",
      };
      this.institute = { label: "", value: "" };
      this.faculty = { label: "", value: "" };
      this.degree = { label: "", value: "" };
      this.department = { label: "", value: "" };
      this.disability = { label: "", value: "" };
      this.project = { label: "", value: "" };
      this.member = { label: "", value: "", description: "" };
      this.advisor = { label: "", value: "" };
    },
    async submitForm() {
      const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
      this.$q.dialog({ title: "ยืนยัน", message: message, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            const payload = {
              ...this.individual,
              member_id: this.member.value,
              institute_id: this.institute.value,
              faculty_id: this.faculty.value,
              degree_id: this.degree.value,
              department_id: this.department.value,
              disability_id: this.disability.value,
              project_id: this.project.value,
              advisor_id: this.advisor.value,
            };
            if (!this.isEdit) {
              await axios.post(`${getRestApiUrl(this.$store)}/individuals`, payload);
              this.$q.notify({ message: "บันทึกสำเร็จ", color: "positive" });
            } else {
              await axios.put(`${getRestApiUrl(this.$store)}/individuals/${this.individual.individual_id}`, payload);
              this.$q.notify({ message: "แก้ไขสำเร็จ", color: "positive" });
            }
            this.resetForm();
            this.getUpdate();
          } catch (error) {
            this.$q.notify({ message: "Error: " + (error.response?.data?.error || error.message), color: "negative" });
          }
        });
    },
    async editUser(id) {
      this.btnLabel = "แก้ไขข้อมูล";
      this.isEdit = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/individuals/${id}`);
        const data = res.data;
        this.individual = { ...data };
        this.member = { label: data.full_name, value: data.member_id, description: data.status };
        this.institute = { label: data.institute_name, value: data.institute_id };
        this.faculty = { label: data.faculty_name, value: data.faculty_id };
        this.degree = { label: data.degree_name, value: data.degree_id };
        this.department = { label: data.department_name, value: data.department_id };
        this.disability = { label: data.disability_name, value: data.disability_id };
        this.project = { label: data.project_name, value: data.project_id };
        this.advisor = { label: data.advisor_name, value: data.advisor_id };
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      }
    },
    async deleteUser(id, name) {
      this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบข้อมูลของ [ ${name} ] หรือไม่ ?`, cancel: true, persistent: true })
        .onOk(async () => {
          try {
            await axios.delete(`${getRestApiUrl(this.$store)}/individuals/${id}`);
            this.$q.notify({ message: "ลบสำเร็จ", color: "positive" });
            this.getUpdate();
          } catch (error) {
            this.$q.notify({ message: "Error: " + error.message, color: "negative" });
          }
        });
    },
    deleteSelected() {
      if (this.selected.length === 0) return;
      this.$q.dialog({
        title: "ยืนยันการลบหลายรายการ",
        message: `คุณต้องการลบข้อมูลที่เลือกทั้งหมด ${this.selected.length} รายการหรือไม่?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        this.$q.loading.show({ message: "กำลังลบข้อมูลที่เลือก...", spinnerColor: "red" });
        let successCount = 0;
        let failCount = 0;
        try {
          for (const item of this.selected) {
            try {
              await axios.delete(`${getRestApiUrl(this.$store)}/individuals/${item.individual_id}`);
              successCount++;
            } catch (err) {
              console.error(`Failed to delete ID ${item.individual_id}:`, err);
              failCount++;
            }
          }
          this.$q.notify({
            color: successCount > 0 ? "positive" : "negative",
            message: `ลบสำเร็จ ${successCount} รายการ${failCount > 0 ? `, ล้มเหลว ${failCount} รายการ` : ""}`,
            icon: successCount > 0 ? "check" : "error",
          });
          this.selected = [];
          await this.getUpdate();
        } finally {
          this.$q.loading.hide();
        }
      });
    },
    async getUpdate() {
      this.loading = true;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/individuals`);
        this.individuals1 = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        this.$q.notify({ message: "Error: " + error.message, color: "negative" });
      } finally {
        this.loading = false;
      }
    },
    async getMember() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`);
        this.members_.options = res.data.map(i => ({ label: i.full_name, value: i.member_id, description: i.status }));
        this.members.options = [...this.members_.options];
      } catch (error) { console.error(error); }
    },
    async getInstitutes() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/institutes`);
        this.institutes_.options = res.data.map(i => ({ label: i.institute_name, value: i.institute_id }));
        this.institutes.options = [...this.institutes_.options];
      } catch (error) { console.error(error); }
    },
    async getFacultys() {
      if (!this.institute?.value) return;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/faculties`, { params: { institute_id: this.institute.value } });
        this.facultys_.options = res.data.map(i => ({ label: i.faculty_name, value: i.faculty_id }));
        this.facultys.options = [...this.facultys_.options];
      } catch (error) { console.error(error); }
    },
    async getDegrees() {
      if (!this.faculty?.value) return;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/degrees`, { params: { faculty_id: this.faculty.value } });
        this.degrees_.options = res.data.map(i => ({ label: i.degree_name, value: i.degree_id }));
        this.degrees.options = [...this.degrees_.options];
      } catch (error) { console.error(error); }
    },
    async getDepartments() {
      if (!this.degree?.value) return;
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/departments`, { params: { degree_id: this.degree.value } });
        this.departments_.options = res.data.map(i => ({ label: i.department_name, value: i.department_id }));
        this.departments.options = [...this.departments_.options];
      } catch (error) { console.error(error); }
    },
    async getDisabilitys() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/disabilities`);
        this.disabilitys_.options = res.data.map(i => ({ label: i.disability_name, value: i.disability_id }));
        this.disabilitys.options = [...this.disabilitys_.options];
      } catch (error) { console.error(error); }
    },
    async getProjects() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/projects`);
        this.projects_.options = res.data.map(i => ({ label: i.project_name, value: i.project_id }));
        this.projects.options = [...this.projects_.options];
      } catch (error) { console.error(error); }
    },
    async getAdvisors() {
      try {
        const res = await axios.get(`${getRestApiUrl(this.$store)}/members`, { params: { role: 'advisor' } });
        this.advisors_.options = res.data.map(i => ({ label: i.full_name, value: i.member_id }));
        this.advisors.options = [...this.advisors_.options];
      } catch (error) { console.error(error); }
    },
    onInstituteValueChange() {
      this.faculty = this.degree = this.department = { label: "", value: "" };
      this.getFacultys();
    },
    onFacultyValueChange() {
      this.degree = this.department = { label: "", value: "" };
      this.getDegrees();
    },
    onDegreeValueChange() {
      this.department = { label: "", value: "" };
      this.getDepartments();
    },
    filterMember(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.members.options = this.members_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterInstitute(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.institutes.options = this.institutes_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterFaculty(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.facultys.options = this.facultys_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterDegree(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.degrees.options = this.degrees_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterDepartment(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.departments.options = this.departments_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterDisability(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.disabilitys.options = this.disabilitys_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterProject(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.projects.options = this.projects_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
    },
    filterAdvisor(val, update) {
      update(() => {
        const needle = (val || "").toLowerCase();
        this.advisors.options = this.advisors_.options.filter(v => v.label.toLowerCase().includes(needle));
      });
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
};
</script>
<style lang="sass">
.my-sticky-header-table
  height: 500px
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
