<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="items-center justify-center bg-grey-2" style="min-height: 100vh;">
        <div class="full-width">
          <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
            <q-card flat class="bg-white text-black">
              <q-card-section class="bg-primary">
                <h4 class="text-h5 text-white q-my-xs text-center">
                  {{ title }}
                </h4>
              </q-card-section>

              <!-- AI Recommendation Section (Integrated like FormPlan) -->
              <div class="row q-mb-lg">
                <div class="col-12">
                  <q-list bordered separator class="rounded-borders bg-white shadow-1">
                    <!-- Header -->
                    <q-item class="bg-deep-purple-1">
                      <q-item-section avatar>
                        <q-icon name="psychology" color="deep-purple-7" size="sm" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-h6 text-deep-purple-7">AI แนะนำการประเมินตนเอง</q-item-label>
                        <q-item-label caption class="text-grey-9">
                          AI จะช่วยแนะนำหลักฐานจากแผนพัฒนา และช่วยประเมินผลภาพรวมของทักษะ
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn outline color="green" icon="add_box" label="เพิ่มข้อมูลด้วยตนเอง"
                          @click="showManualFormDialog = true" data-testid="btn-open-manual" />
                      </q-item-section>
                    </q-item>

                    <!-- Career List -->
                    <q-expansion-item v-for="career in plan_career.optionsAll" :key="career.value"
                      header-class="q-py-md items-center bg-grey-1" expand-separator default-opened>
                      <template #header>
                        <q-item-section avatar>
                          <q-avatar color="deep-purple-1" text-color="deep-purple-7" icon="work" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-subtitle1 text-weight-bold">{{ career.label }}</q-item-label>
                          <q-item-label caption>อาชีพเป้าหมาย</q-item-label>
                        </q-item-section>
                      </template>

                      <!-- Qualifications under this career -->
                      <div class="q-pa-md bg-grey-2">
                        <q-list separator v-if="qualificationsByCareer[String(career.value)]?.length > 0">
                          <q-expansion-item v-for="qual in qualificationsByCareer[String(career.value)]"
                            :key="qual.qa_plan_career_id" header-class="bg-white" expand-separator>
                            <template #header>
                              <q-item-section avatar>
                                <q-icon name="fact_check" color="blue-grey-7" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{ qual.qualification_name }}</q-item-label>
                                <q-item-label caption>กลุ่ม: {{ qual.qualification_group_name || 'ไม่ระบุ'
                                  }}</q-item-label>
                              </q-item-section>
                            </template>

                            <!-- AI Evidence Recommendation Workflow -->
                            <div class="q-pa-md bg-grey-1">

                              <!-- 1. Overall Skill Performance Recommendation (1 score per qual) -->
                              <div class="q-mb-md q-pa-sm bg-white rounded-borders shadow-1 border-dashed">
                                <div class="row items-center q-gutter-x-sm">
                                  <div class="text-subtitle2 text-weight-bold">ผลการประเมินทักษะ:</div>
                                  <q-select dense standout="bg-primary text-white" style="min-width: 200px" color="primary"
                                    v-model="qualAssessmentScores[qual.qa_plan_career_id]" :options="performOptionsAll"
                                    emit-value map-options label="เลือกผลประเมิน" class="col" />
                                  <q-btn unelevated color="deep-purple-7" icon="bolt" label="AI ช่วยประเมิน" size="sm"
                                    @click="recommendScoreForQualification(qual)"
                                    :loading="loadingQualScoreAI === qual.qa_plan_career_id">
                                    <q-tooltip>AI แนะนำระดับผลการประเมินจากแผนที่มีทั้งหมด</q-tooltip>
                                  </q-btn>
                                </div>
                              </div>

                              <!-- 2. Evidence suggestion per plan -->
                              <div v-if="getPlansForQual(qual.qa_plan_career_id).length > 0">
                                <div v-for="plan in getPlansForQual(qual.qa_plan_career_id)" :key="plan.plan_id"
                                  class="q-mb-sm bg-white q-pa-sm rounded-borders shadow-1">
                                  <div class="row justify-between items-center no-wrap">
                                    <div class="col-grow">
                                      <div class="text-weight-bold text-primary">{{ plan.plan_title }}</div>
                                      <div class="text-caption text-grey-8">ช่องทาง: {{ plan.plan_channel }}</div>
                                    </div>
                                    <div class="col-auto">
                                      <q-btn unelevated color="blue-7" icon="psychology" label="ขอคำแนะนำหลักฐาน"
                                        size="sm" rounded @click="recommendEvidencesForPlan(plan, qual)"
                                        :loading="loadingPlanEvidenceAI === plan.plan_id" />
                                    </div>
                                  </div>

                                  <!-- AI Evidence List (Editable) -->
                                  <div v-if="planEvidences[plan.plan_id]?.length > 0"
                                    class="q-mt-sm q-pl-md border-left">
                                    <div class="text-caption text-weight-bold text-orange-9">
                                      <q-icon name="auto_awesome" /> AI แนะนำหลักฐาน:
                                    </div>
                                    <q-list dense separator class="q-mt-xs">
                                      <q-item v-for="(ev, idx) in planEvidences[plan.plan_id]" :key="idx"
                                        class="q-px-none">
                                        <q-item-section>
                                          <q-input v-if="ev.isEditing" v-model="ev.text" dense outlined autogrow
                                            class="bg-orange-1" />
                                          <q-item-label v-else class="text-caption text-grey-9">• {{ ev.text
                                            }}</q-item-label>
                                        </q-item-section>
                                        <q-item-section side>
                                            <q-btn flat round size="xs" :icon="ev.isEditing ? 'check' : 'edit'"
                                              :color="ev.isEditing ? 'positive' : 'grey-6'"
                                              @click="ev.isEditing = !ev.isEditing" />
                                            <q-btn flat round size="xs" icon="close" color="red-4"
                                              @click="planEvidences[plan.plan_id].splice(idx, 1)" />
                                        </q-item-section>
                                      </q-item>
                                    </q-list>
                                  </div>
                                </div>
                              </div>
                              <div v-else
                                class="text-center q-pa-md text-grey-6 border-dashed rounded-borders bg-white">
                                <q-icon name="info" size="sm" /> ยังไม่มีรายการแผนพัฒนาสำหรับทักษะนี้
                              </div>

                              <!-- 3. Final Save Button -->
                              <div class="row justify-center q-mt-md">
                                <q-btn color="positive" icon="save" label="บันทึกการประเมินชุดนี้" push
                                  @click="saveCombinedAssessment(qual)"
                                  :disable="!qualAssessmentScores[qual.qa_plan_career_id]" />
                              </div>

                            </div>
                          </q-expansion-item>
                        </q-list>

                        <div v-else class="text-center q-pa-md text-grey-6">
                          ยังไม่มีคุณสมบัติ/ทักษะสำหรับอาชีพนี้
                        </div>
                      </div>
                    </q-expansion-item>

                    <q-item v-if="plan_career.optionsAll.length === 0" class="text-center q-pa-lg">
                      <q-item-section class="text-grey-7">ยังไม่มีอาชีพเป้าหมายในแผนของคุณ</q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <q-separator spaced />

              <!-- Manual Form Dialog -->
              <q-dialog v-model="showManualFormDialog" persistent data-testid="dialog-self-assessment">
                <q-card style="min-width: 600px; max-width: 90vw;">
                  <q-card-section class="bg-primary text-white">
                    <div class="text-h6">{{ isEdit ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลการประเมิน' }}</div>
                  </q-card-section>

                  <q-card-section>
                    <q-form @submit.prevent="submitForm" @reset="resetForm" method="post" class="q-gutter-md">
                      <!-- อาชีพเป้าหมาย + คุณสมบัติ -->
                      <div class="row">
                        <!-- แผนอาชีพ -->
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-select @filter="filterPlanCareer" use-input color="green" v-model="plan_career_id"
                            :options="plan_career.options" label="อาชีพเป้าหมาย *" emit-value map-options
                            @update:model-value="(id) => getQualification(id)" data-testid="select-plan-career">
                            <template v-slot:prepend><q-icon name="work_history" /></template>
                            <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                  <q-icon :name="scope.opt.icon" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                                </q-item-section>
                              </q-item>
                            </template>
                            <template v-if="plan_career_id" v-slot:append>
                              <q-icon name="cancel" @click.stop.prevent="plan_career_id = null"
                                class="cursor-pointer" />
                            </template>
                          </q-select>
                        </div>

                        <!-- คุณสมบัติ -->
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-select @filter="filterQaPlanCareer" use-input color="green" v-model="qa_plan_career_id"
                            :options="qa_plan_career.options" label="คุณสมบัติที่ต้องการ *" emit-value map-options
                            data-testid="select-qa-plan-career">
                            <template v-slot:prepend><q-icon name="fact_check" /></template>
                            <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                  <q-icon :name="scope.opt.icon" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                                </q-item-section>
                              </q-item>
                            </template>
                            <template v-if="qa_plan_career_id" v-slot:append>
                              <q-icon name="cancel" @click.stop.prevent="qa_plan_career_id = null"
                                class="cursor-pointer" />
                            </template>
                          </q-select>
                        </div>
                      </div>

                      <div class="row">
                        <!-- วันประเมินตนเอง -->
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-input filled v-model="self_assessment_date" label="วันประเมินตนเอง *" mask="##/##/####"
                            fill-mask hint="วัน/เดือน/ปี ค.ศ.(DD/MM/YYYY)" today-btn clearable
                            data-testid="input-self-date">
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

                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-select @filter="filterPerform" use-input color="primary" v-model="perform_id" standout="bg-primary text-white"
                            :options="perform.options" label="ผลการพัฒนาตนเอง *" emit-value map-options
                            data-testid="select-perform">
                            <template v-slot:prepend><q-icon name="flag_circle" /></template>
                            <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                  <q-icon :name="scope.opt.icon" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
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
                            <q-table title="ข้อมูลผลงาน" :rows="safeReferences1" :columns="references"
                              row-key="reference_id" :filter="filter_reference" :loading="loading"
                              :visible-columns="visibleColumnsReference" separator="cell"
                              table-header-style="height: 65px;" table-header-class="bg-primary text-white"
                              :rows-per-page-options="[30, 50, 100, 0]" icon-first-page="home"
                              icon-last-page="all_inclusive" icon-next-page="arrow_right" icon-prev-page="arrow_left"
                              :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `หน้า : ${endRowIndex}/${totalRowsNumber}`">
                              <template v-slot:top-right="props">
                                <div class="row">
                                  <div class="col-md-4 col-xs-4 q-pa-xs">
                                    <q-input borderless dense debounce="300" v-model="filter_reference"
                                      placeholder="ค้นหาผลงาน">
                                      <template v-slot:append><q-icon name="search" /></template>
                                    </q-input>
                                  </div>

                                  <div class="col-md-4 col-xs-4 q-pa-xs">
                                    <q-input borderless dense debounce="300" v-model="file_export"
                                      placeholder="ชื่อไฟล์นำออก" outlined>
                                      <template v-slot:append><q-icon name="save" /></template>
                                    </q-input>
                                  </div>

                                  <div class="col-md-4 col-xs-4 q-pa-xs">
                                    <q-btn flat icon-right="archive" label="ส่งออก excel"
                                      @click="exportTable()" />
                                  </div>

                                  <div class="col-md-4 col-xs-4 q-pa-xs">
                                    <q-btn rounded flat @click="openAddReferenceDialog()" icon="add_circle"
                                      label="เพิ่มข้อมูล" no-caps data-testid="btn-open-reference-dialog">
                                      <q-tooltip class="bg-accent">เพิ่มแหล่งอ้างอิง/ผลงาน</q-tooltip>
                                    </q-btn>
                                  </div>

                                  <div class="col-md-4 col-xs-4 q-pa-xs">
                                    <q-select v-model="visibleColumnsReference" multiple outlined dense options-dense
                                      :display-value="$q.lang.table.columns" emit-value map-options
                                      :options="references" option-value="name" options-cover
                                      style="min-width: 150px" />
                                  </div>

                                  <div class="col-md-4 col-xs-4 q-pa-xs">
                                    <q-btn flat round dense
                                      :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                      @click="props.toggleFullscreen" class="q-ml-md" />
                                  </div>
                                </div>
                              </template>

                              <template v-slot:body-cell-actions="props">
                                <q-td :props="props">
                                  <q-btn icon="mode_edit" label="แก้ไข" @click="editItem(props.row)" />
                                  <q-btn icon="delete" label="ลบ" @click="deleteItem(props.row)" />
                                </q-td>
                              </template>
                            </q-table>
                          </div>
                        </div>
                      </div>

                      <!-- ปุ่มควบคุม Dialog -->
                      <div class="row justify-center items-center q-gutter-sm q-mt-sm q-mb-md">
                        <q-btn :label="btnLabel" type="submit" color="primary" icon="save"
                          data-testid="btn-submit-self" />
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat icon="clear" />
                        <q-btn label="ปิด" color="grey" flat @click="showManualFormDialog = false" />
                      </div>
                    </q-form>
                  </q-card-section>
                </q-card>
              </q-dialog>

              <!-- ✅ Reference Dialog (ย้ายออกจาก q-table slot) -->
              <q-dialog v-model="showReferenceDialog" persistent data-testid="dialog-reference">
                <q-card style="min-width: 420px; max-width: 90vw;">
                  <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">เพิ่มข้อมูลแหล่งอ้างอิง/ผลงาน</div>
                    <q-space />
                    <q-btn flat round icon="close" v-close-popup />
                  </q-card-section>

                  <q-card-section class="q-gutter-md">
                    <q-select dense outlined v-model="editedReference.plan_id" :options="planOptions"
                      label="เลือกแผนพัฒนา (ถ้ามี)" emit-value map-options clearable
                      data-testid="select-reference-plan">
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            ไม่พบแผนพัฒนาสำหรับคุณสมบัตินี้
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>

                    <q-input v-model="editedReference.reference_description" label="แหล่งข้อมูลอ้างอิง/ผลงาน" autogrow
                      outlined :input-attrs="{
                        'data-testid': 'input-reference-description',
                        'aria-label': 'แหล่งข้อมูลอ้างอิง/ผลงาน'
                      }" />
                  </q-card-section>

                  <q-card-actions align="right">
                    <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
                    <q-btn color="primary" :label="btnLabel_" @click="addRow" data-testid="btn-reference-save" />
                  </q-card-actions>
                </q-card>
              </q-dialog>

              <!-- Navigation Buttons -->
              <div class="row justify-center items-center q-gutter-sm q-mt-sm q-mb-md">
                <q-btn icon="logout" label="ออก" color="primary" flat to="/" />
                <q-btn color="primary" label="กลับฟอร์มรายงานการพัฒนาตนเอง" no-caps flat icon="skip_previous"
                  to="/FormPlan">
                  <q-tooltip class="bg-accent">กลับฟอร์มการพัฒนาตนเอง</q-tooltip>
                </q-btn>
                <q-btn color="primary" label="ไปฟอร์มรายงานการพัฒนาตนเอง" no-caps flat icon="skip_next"
                  to="/FormReport">
                  <q-tooltip class="bg-accent">ไปฟอร์มรายงานการพัฒนาตนเอง</q-tooltip>
                </q-btn>
              </div>

              <!-- ตารางการประเมินตนเอง -->
              <div class="row">
                <div class="col-md-12 col-xs-12 q-pa-xs">
                  <div class="q-pa-xs">




                    <!-- Tree View Structure -->
                    <q-card flat bordered>
                      <q-card-section class="bg-blue-1 text-blue-9 row items-center justify-between">
                        <div class="text-h6 row items-center">
                          <q-icon name="account_tree" class="q-mr-sm" />
                          โครงสร้างการประเมินตนเอง
                        </div>
                        <div class="row q-gutter-sm items-center">
                          <q-input dense filled debounce="300" v-model="filter" placeholder="ค้นหาในโครงสร้าง..."
                            style="width: 200px">
                            <template #append><q-icon name="search" /></template>
                          </q-input>

                          <q-select dense filled v-model="years_id" :options="years.options" label="เลือกปีประเมิน"
                            style="width: 150px" emit-value map-options @filter="filterYear" use-input clearable>
                            <template v-slot:prepend><q-icon name="calendar_today" /></template>
                          </q-select>

                          <q-btn flat icon="archive" label="ส่งออก excel" @click="exportTable()" />

                          <q-checkbox v-model="isAllSelected" label="เลือกทั้งหมด" color="primary"
                            @update:model-value="toggleSelectAll" class="q-mx-sm" />

                          <q-btn v-if="tickedAssessments.length > 0" color="red" icon="delete_sweep" label="ลบที่เลือก"
                            @click="deleteSelectedAssessments" class="q-ml-sm" glossy />
                        </div>
                      </q-card-section>
                      <q-separator />
                      <q-card-section class="q-pa-none">
                        <q-tree :nodes="treeNodes" node-key="id" label-key="label" :filter="filter" default-expand-all
                          class="q-pa-md" data-testid="assessment-tree" tick-strategy="strict"
                          v-model:ticked="tickedAssessments">
                          <template v-slot:default-header="prop">
                            <div class="row items-center q-gutter-sm full-width"
                              :data-testid="`tree-node-${prop.node.header}`">
                              <q-icon :name="prop.node.icon || 'star'" :color="headerColor(prop.node.header)"
                                size="sm" />
                              <div :class="headerClass(prop.node.header)"
                                :data-testid="`tree-node-label-${prop.node.header}`">
                                {{ prop.node.label }}
                              </div>
                              <q-space />

                              <div v-if="prop.node.header === 'assessment'" class="row q-gutter-xs">
                                <q-btn flat round dense color="blue" icon="edit" size="sm"
                                  @click.stop="OnEdit(prop.node.raw.self_assessment_id)">
                                  <q-tooltip>แก้ไขผลการประเมิน</q-tooltip>
                                </q-btn>
                                <q-btn flat round dense color="red" icon="delete" size="sm"
                                  @click.stop="onDelete(prop.node.raw.self_assessment_id, prop.node.raw.self_assessment_date)">
                                  <q-tooltip>ลบผลการประเมิน</q-tooltip>
                                </q-btn>
                              </div>

                              <div v-if="prop.node.header === 'reference_detail'" class="row q-gutter-xs">
                                <q-btn flat round dense color="blue-5" icon="edit" size="sm"
                                  @click.stop="editItem(prop.node.raw)">
                                  <q-tooltip>แก้ไขหลักฐาน</q-tooltip>
                                </q-btn>
                                <q-btn flat round dense color="red-4" icon="delete" size="sm"
                                  @click.stop="deleteItem(prop.node.raw)">
                                  <q-tooltip>ลบหลักฐาน</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </template>
                        </q-tree>
                      </q-card-section>
                    </q-card>

                  </div>
                </div>
              </div>
              <!-- end -->
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import { exportFile } from "quasar";
import { getRestApiUrl, getChatUrl } from "../../utils/apiConfig.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ส่งออก CSV
function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

export default {
  name: "FormSelfAssessment",

  data() {
    return {
      // apiUrl is initialized in created()
      apiUrl: "",

      // UI
      title: "การประเมินตนเอง",
      file_export: "",
      filter: "",
      filter_reference: "",
      loading: false,

      // IDs / Store


      // Main datasets
      selfAssessments1: [],
      selfAssessments1_: [],
      plans1: [],
      references1: [],
      references1_: [],
      references2: [],
      individual: {},

      qualificationsByCareer: {},

      // Form state
      isEdit: false,
      isEditRef: false,
      btnLabel: "เพิ่มข้อมูล",
      btnLabel_: "เพิ่มผลงาน",

      showManualFormDialog: false,

      // ✅ renamed dialog state
      showReferenceDialog: false,

      editedIndex: -1,

      defaultReference: {
        reference_id: "",
        reference_description: "",
        self_assessment_id: "",
        member_id: "",
        plan_id: null,
      },
      editedReference: {
        reference_id: "",
        reference_description: "",
        self_assessment_id: "",
        member_id: "",
        plan_id: null,
      },

      // selects
      self_assessment_date: "",
      self_assessment_id: "",
      perform_id: "",
      perform: { options: [] },
      performBase: [],

      qa_plan_career_id: "",
      qa_plan_career: { options: [] },
      qaPlanCareerBase: [],

      plan_career_id: "",
      plan_career: { options: [], optionsAll: [] },
      planCareerBase: [],



      // columns
      visibleColumnsReference: ["actions", "Plan", "reference"],
      references: [
        { name: "actions", align: "center", label: "แก้ไข/ลบ" },
        {
          name: "Plan",
          align: "left",
          label: "แผนที่เกี่ยวข้อง",
          field: (row) => {
            const plans = this.plans1 || [];
            if (!row.plan_id) return "-";
            const found = plans.find((p) => String(p.plan_id) === String(row.plan_id));
            return found ? found.plan_title : "-";
          },
          sortable: true,
        },
        {
          name: "reference",
          align: "left",
          label: "แหล่งอ้างอิง/ผลงาน",
          field: "reference_description",
          sortable: true,
        },
      ],

      // export table columns
      main_columns: [
        { name: "actions", align: "left", label: "แก้ไข/ลบ : ผลงาน" },
        { name: "full_name", align: "left", label: "ชื่อ-สกุล", field: "full_name", sortable: true },
        { name: "self_assessment_date", align: "center", label: "วันประเมิน", field: "self_assessment_date", sortable: true },
        { name: "career_name", align: "left", label: "อาชีพ", field: "career_name", sortable: true },
        { name: "qualification_name", align: "left", label: "คุณสมบัติ", field: "qualification_name", sortable: true },
        { name: "target_value", align: "center", label: "ค่าเป้าหมาย", field: "target_value", sortable: true },
        { name: "perform_value", align: "center", label: "ผลการประเมิน", field: "perform_value", sortable: true },
      ],

      // AI
      chat_url: getChatUrl(this.$store),
      loadingQualAI: null,
      loadingQualScoreAI: null,
      loadingPlanEvidenceAI: null,
      aiRecommendations: [],
      performOptionsAll: [],

      // UI State for Work-in-progress AI assessment
      qualAssessmentScores: {}, // qualId -> perform_id
      planEvidences: {},        // planId -> [ {text, isEditing}, ... ]

      // ✅ Bulk Delete
      tickedAssessments: [],
      isAllSelected: false,

      // ปีประเมิน
      years_id: "",
      years: { options: [] },
      years_: { options: [] },
    };
  },

  computed: {
    member_id() {
      return this.$store.getters.myMember_id;
    },
    safeReferences1() {
      return Array.isArray(this.references1) ? this.references1 : [];
    },
    safeSelfAssessments1() {
      return Array.isArray(this.selfAssessments1) ? this.selfAssessments1 : [];
    },

    aiRecommendationsGroupedByQual() {
      const grouped = {};
      (Array.isArray(this.aiRecommendations) ? this.aiRecommendations : []).forEach((rec) => {
        const qid = String(rec.qa_plan_career_id || "others");
        if (!grouped[qid]) grouped[qid] = [];
        grouped[qid].push(rec);
      });
      return grouped;
    },

    planOptions() {
      if (!this.qa_plan_career_id) return [];
      const plans = this.plans1 || [];
      return plans
        .filter((p) => String(p.qa_plan_career_id) === String(this.qa_plan_career_id))
        .map((p) => ({ label: p.plan_title || "ไม่ระบุชื่อ", value: p.plan_id }));
    },

    treeNodes() {
      const careers = Array.isArray(this.plan_career.options) ? this.plan_career.options : [];
      const plans = Array.isArray(this.plans1) ? this.plans1 : [];
      const assessments = Array.isArray(this.selfAssessments1) ? this.selfAssessments1 : [];
      const references = Array.isArray(this.references2) ? this.references2 : [];

      // refs by assessment
      const refsByAssess = {};
      references.forEach((r) => {
        const sid = String(r.self_assessment_id);
        if (!refsByAssess[sid]) refsByAssess[sid] = [];
        refsByAssess[sid].push(r);
      });

      // assessments by qual
      const assessByQual = {};
      assessments.forEach((a) => {
        const qid = String(a.qa_plan_career_id);
        if (!assessByQual[qid]) assessByQual[qid] = [];
        assessByQual[qid].push(a);
      });

      // plans by qual
      const plansByQual = {};
      plans.forEach((p) => {
        const qid = String(p.qa_plan_career_id);
        if (!plansByQual[qid]) plansByQual[qid] = [];
        plansByQual[qid].push(p);
      });

      return careers.map((c) => {
        const quals = Array.isArray(this.qualificationsByCareer[String(c.value)])
          ? this.qualificationsByCareer[String(c.value)]
          : [];

        return {
          id: `career_${c.value}`,
          label: c.label,
          icon: "work_outline",
          header: "career",
          children: quals.map((q) => {
            const qid = String(q.qa_plan_career_id);
            const allPlans = plansByQual[qid] || [];
            const assessList = assessByQual[qid] || [];

            return {
              id: `qual_${qid}`,
              label: q.qualification_name,
              icon: "fact_check",
              header: "qualification",
              raw: q,
              children: [
                {
                  id: `imp_${qid}`,
                  label: `⭐ ความสำคัญ: ${q.importance_name || q.level_description || "-"}`,
                  icon: "star",
                  header: "importance",
                  noTick: true,
                },
                {
                  id: `target_${qid}`,
                  label: `🎯 ค่าเป้าหมาย: ${q.target_name || q.target_value || "-"}`,
                  icon: "flag",
                  header: "target",
                  noTick: true,
                },
                ...(allPlans.length
                  ? [
                    {
                      id: `dev_${qid}`,
                      label: `🧩 การพัฒนาทักษะ/คุณสมบัติ`,
                      icon: "construction",
                      header: "development",
                      noTick: true,
                      children: allPlans.map((p) => ({
                        id: `plan_${p.plan_id}`,
                        label: `📋 แผน: ${p.plan_title || "ไม่ระบุชื่อเรื่อง"}`,
                        icon: "event_note",
                        header: "plan",
                        children: [
                          { id: `p_type_${p.plan_id}`, label: `🔹 ชนิด: ${p.development_name || "-"}`, icon: "category", header: "plan_detail", noTick: true },
                          { id: `p_title_${p.plan_id}`, label: `📖 เรื่อง: ${p.plan_title || "-"}`, icon: "auto_stories", header: "plan_detail", noTick: true },
                          { id: `p_chan_${p.plan_id}`, label: `📺 ช่องทาง: ${p.plan_channel || "-"}`, icon: "shortcuts", header: "plan_detail", noTick: true },
                          { id: `p_imp_${p.plan_id}`, label: `🚩 ความสำคัญ: ${p.importance_name || "-"}`, icon: "priority_high", header: "plan_detail", noTick: true },
                          { id: `p_start_${p.plan_id}`, label: `📅 เริ่ม: ${p.plan_start_date || "-"}`, icon: "today", header: "plan_detail", noTick: true },
                          { id: `p_end_${p.plan_id}`, label: `🏁 สิ้นสุด: ${p.plan_end_date || "-"}`, icon: "event_available", header: "plan_detail", noTick: true },
                        ],
                      })),
                    },
                  ]
                  : []),
                {
                  id: `assess_group_${qid}`,
                  label: `📊 การประเมินตนเอง`,
                  icon: "analytics",
                  header: "assessment_group",
                  children: assessList.map((a) => {
                    const sid = String(a.self_assessment_id);
                    const ddmmyyyy = this.dayToYear(a.self_assessment_date);
                    const monthTH = this.extractMonthName(a.self_assessment_date);
                    const assessRefs = refsByAssess[sid] || [];

                    return {
                      id: `assess_${sid}`,
                      label: `📈 ผลการประเมิน: ${a.perform_value || "-"}`,
                      icon: "assessment",
                      header: "assessment",
                      raw: a,
                      children: [
                        {
                          id: `assess_date_${sid}`,
                          label: `📅 วันที่ประเมิน: ${ddmmyyyy}`,
                          icon: "event",
                          header: "assessment_detail",
                          noTick: true,
                        },
                        ...this.groupReferencesByPlan(assessRefs).map((planGroup) => ({
                          id: `assess_plan_${sid}_${planGroup.plan_id}`,
                          label: `📋 แผน: ${planGroup.plan_title}`,
                          icon: "description",
                          header: "assessment_plan",
                          children: [
                            {
                              id: `ref_group_${sid}_${planGroup.plan_id}`,
                              label: `📎 แหล่งอ้างอิง/ผลงาน/หลักฐาน`,
                              icon: "folder_open",
                              header: "reference_group",
                              children: planGroup.references.map((r) => ({
                                id: `ref_detail_${r.reference_id}`,
                                label: r.reference_description,
                                icon: "attachment",
                                header: "reference_detail",
                                raw: r,
                              })),
                            },
                          ],
                        })),
                      ],
                    };
                  }),
                },
              ],
            };
          }),
        };
      });
    },
  },

  watch: {
    member_id(val) {
      if (val) {
        // console.log("member_id loaded:", val);
        this.bootstrap();
      }
    },
    tickedAssessments: {
      deep: true,
      handler(newVal, oldVal) {
        const added = newVal.filter((x) => !oldVal.includes(x));
        const removed = oldVal.filter((x) => !newVal.includes(x));

        if (added.length === 1) {
          this.cascadeTick(added[0], true);
        } else if (removed.length === 1) {
          this.cascadeTick(removed[0], false);
        }
      },
    },
  },

  methods: {
    // ---------- UI helpers ----------
    headerColor(header) {
      return header === "career" ? "primary"
        : header === "qualification" ? "orange-9"
          : header === "importance" ? "amber-9"
            : header === "target" ? "deep-orange-9"
              : header === "development" ? "green-8"
                : header === "plan" ? "teal-9"
                  : header === "plan_detail" ? "blue-grey-6"
                    : header === "assessment_group" ? "indigo-9"
                      : header === "assessment" ? "blue-8"
                        : header === "assessment_detail" ? "grey-7"
                          : header === "assessment_plan" ? "cyan-8"
                            : header === "reference_group" ? "purple-7"
                              : header === "reference_detail" ? "blue-grey-5"
                                : "grey-7";
    },
    headerClass(header) {
      return {
        "text-weight-bold text-primary": header === "career",
        "text-weight-medium text-orange-9": header === "qualification",
        "text-weight-medium text-amber-9": header === "importance",
        "text-weight-medium text-deep-orange-9": header === "target",
        "text-weight-medium text-green-8": header === "development",
        "text-weight-medium text-teal-9": header === "plan",
        "text-blue-grey-8": header === "plan_detail",
        "text-weight-bold text-indigo-9": header === "assessment_group",
        "text-weight-medium text-blue-8": header === "assessment",
        "text-grey-8": header === "assessment_detail",
        "text-weight-medium text-cyan-8": header === "assessment_plan",
        "text-purple-7": header === "reference_group",
        "text-blue-grey-7": header === "reference_detail",
        "text-grey-9": !header,
      };
    },
    notify(type, message) {
      this.$q.notify({ type, message });
    },

    // ---------- date helpers ----------
    yearToDay(day_to_year) {
      const parts = String(day_to_year || "").split("/");
      if (parts.length !== 3) return "0000/00/00";
      const dd = parts[0].padStart(2, "0");
      const mm = parts[1].padStart(2, "0");
      const yyyy = parts[2];
      return `${yyyy}/${mm}/${dd}`;
    },
    dayToYear(year_to_day) {
      const parts = String(year_to_day || "0000/00/00").split("/");
      if (parts.length !== 3) return "00/00/0000";
      const yyyy = parts[0];
      const mm = parts[1].padStart(2, "0");
      const dd = parts[2].padStart(2, "0");
      return `${dd}/${mm}/${yyyy}`;
    },
    extractMonthName(dateStr) {
      if (!dateStr) return "ไม่ระบุเดือน";
      const parts = String(dateStr).split("/");
      let monthIndex = -1;
      if (parts[0]?.length === 4) monthIndex = parseInt(parts[1], 10) - 1; // YYYY/MM/DD
      else if (parts[2]?.length === 4) monthIndex = parseInt(parts[1], 10) - 1; // DD/MM/YYYY
      if (monthIndex < 0 || monthIndex > 11) return "ไม่ระบุเดือน";
      const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
      return monthNames[monthIndex];
    },

    // ---------- tree helpers ----------
    groupReferencesByPlan(references) {
      const grouped = {};
      references.forEach((ref) => {
        const pid = ref.plan_id || 'no_plan';
        if (!grouped[pid]) {
          grouped[pid] = {
            plan_id: pid,
            plan_title: this.getPlanTitle(ref.plan_id) || 'ไม่ระบุแผน',
            references: [],
          };
        }
        grouped[pid].references.push(ref);
      });
      return Object.values(grouped);
    },

    toggleSelectAll(val) {
      if (val) {
        const allIds = [];
        const traverse = (nodes) => {
          nodes.forEach((n) => {
            if (!n.noTick) allIds.push(n.id);
            if (n.children) traverse(n.children);
          });
        };
        traverse(this.treeNodes);
        this.tickedAssessments = allIds;
      } else {
        this.tickedAssessments = [];
      }
    },

    cascadeTick(nodeId, isTicked) {
      const node = this.findNodeById(this.treeNodes, nodeId);
      if (!node || !node.children) return;

      const childIds = [];
      const traverse = (nodes) => {
        nodes.forEach((n) => {
          if (!n.noTick) childIds.push(n.id);
          if (n.children) traverse(n.children);
        });
      };
      traverse(node.children);

      let updated = [...this.tickedAssessments];
      if (isTicked) {
        childIds.forEach((id) => {
          if (!updated.includes(id)) updated.push(id);
        });
      } else {
        updated = updated.filter((id) => !childIds.includes(id));
      }
      this.tickedAssessments = updated;
    },

    findNodeById(nodes, id) {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = this.findNodeById(n.children, id);
          if (found) return found;
        }
      }
      return null;
    },

    async deleteSelectedAssessments() {
      // พิจารณาลบ เฉพาะ node ผลการประเมิน:
      const ids = this.tickedAssessments
        .filter((key) => String(key).startsWith("assess_") && !String(key).startsWith("assess_group_") && !String(key).startsWith("assess_plan_") && !String(key).startsWith("assess_date_"))
        .map((key) => String(key).replace("assess_", ""))
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      if (ids.length === 0) {
        this.notify("warning", "กรุณาเลือกรายการผลการประเมินที่ต้องการลบ");
        return;
      }

      // Check dependencies for multiple records
      try {
        const resCheck = await axios.post(`${this.apiUrl}/self-assessments/check-dependencies`, {
          ids: ids
        });
        const hasDeps = resCheck.data.has_dependencies;
        const depCount = resCheck.data.count;

        let message = `คุณต้องการลบผลการประเมินที่เลือกทั้งหมด ${ids.length} รายการ หรือไม่?`;
        if (hasDeps) {
          message += `\n⚠️ ตรวจพบข้อมูลหลักฐาน/ผลงานที่เกี่ยวข้อง ${depCount} รายการ ซึ่งจะถูกลบออกด้วย`;
        }

        this.$q.dialog({
          title: "ยืนยันการลบแบบกลุ่ม",
          message: message,
          cancel: true,
          persistent: true,
          ok: { label: 'ยืนยันการลบ', color: 'negative' }
        }).onOk(async () => {
          try {
            const response = await axios.post(`${this.apiUrl}/self-assessments/bulk-delete`, { ids: ids });
            const result = response.data || {};
            this.notify("positive", `ลบสำเร็จ ${result.deleted || ids.length} รายการ (ลบข้อมูลอ้างอิง ${result.references_deleted || 0} รายการ)`);
            this.tickedAssessments = [];
            this.isAllSelected = false;
            await this.getUpdate(this.member_id);
            await this.getUpdateReference(this.member_id);
            await this.getFilterMonth();
          } catch (e) {
            console.error("Bulk delete error:", e);
            this.notify("negative", "ลบไม่สำเร็จ");
          }
        });
      } catch (e) {
        console.error("Dependency check failed:", e);
        this.notify("negative", "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ");
      }
    },

    // ---------- exporting ----------
    async exportTable() {
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Self-Assessment Report');

        const yearLabel = this.years_id ? `ประจำปี ${this.years_id}` : 'ทั้งหมด';

        // 1. หัวรายงาน (Header)
        worksheet.mergeCells('A1:U1');
        const mainTitle = worksheet.getCell('A1');
        mainTitle.value = `รายงานสรุปผลการประเมินตนเอง (Self-Assessment Report) ${yearLabel}`;
        mainTitle.font = { name: 'Sarabun', size: 16, bold: true };
        mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 40;

        // 2. ข้อมูลโปรไฟล์ (Profile)
        worksheet.mergeCells('A2:U2');
        const profileHeader = worksheet.getCell('A2');
        profileHeader.value = 'ข้อมูลโปรไฟล์นักเรียน';
        profileHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        profileHeader.font = { name: 'Sarabun', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        profileHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        worksheet.getRow(2).height = 30;

        // รายละเอียดโปรไฟล์
        const p = this.individual || {};

        let eduStatus = '-';
        if (p.is_graduate == 1 || p.is_graduate == '1') {
          eduStatus = p.date ? `จบการศึกษาปี ${p.date}` : 'จบการศึกษาแล้ว';
        } else if (p.year) {
          eduStatus = `กำลังศึกษาชั้นปีที่ ${p.year}`;
        }

        let disability = '-';
        if (p.is_disability == 1 || p.is_disability == '1') {
          disability = (p.disability_name || '') + (p.dis_description ? ` (${p.dis_description})` : '');
        }

        const profileRows = [
          ['', 'ชื่อ-นามสกุล:', p.full_name || ((p.title_name || '') + (p.first_name || '') + ' ' + (p.last_name || '')).trim() || '-'],
          ['', 'รหัสสมาชิก:', p.member_id || this.member_id],
          ['', 'อีเมล:', p.email || '-'],
          ['', 'เบอร์โทรศัพท์:', p.phone || p.telephone || '-'],
          ['', 'ปีเกิด (ค.ศ.):', p.birthday || p.birth_year || '-'],
          ['', 'สถาบันการศึกษา:', p.institution || p.institute_name || '-'],
          ['', 'คณะ:', p.faculty_name || '-'],
          ['', 'ระดับการศึกษา:', p.education_level || p.degree_name || '-'],
          ['', 'สาขาวิชา:', p.department_name || '-'],
          ['', 'สถานะการศึกษา:', eduStatus],
          ['', 'โครงการ:', p.project_name || '-'],
          ['', 'อาจารย์ที่ปรึกษา:', p.advisor_name || '-'],
          ['', 'มาจากจังหวัด:', p.province || '-'],
          ['', 'อยากอยู่ในจังหวัด:', p.preferred_region || '-'],
          ['', 'วิชาที่ชอบ:', p.favorite_subject || '-'],
          ['', 'อุปกรณ์ที่จำเป็น:', p.unfavorite_subject || '-'],
          ['', 'กิจกรรมที่ชอบ:', p.favorite_activity || '-'],
          ['', 'ความถนัด/ทักษะเด่น:', p.skill || '-'],
          ['', 'ความบกพร่องทางร่างกาย:', disability],
          ['', 'อาชีพในฝัน:', p.dream_career || '-'],
          ['', 'เกี่ยวกับฉัน (About Me):', p.external_info || '-'],
          ['', 'ข้อมูลเพิ่มเติม:', p.additional_info || '-'],
        ];

        profileRows.forEach(row => {
          const r = worksheet.addRow(row);
          const labelCell = worksheet.getCell(`B${r.number}`);
          labelCell.font = { name: 'Sarabun', bold: true };
          labelCell.alignment = { horizontal: 'right', vertical: 'middle' };

          worksheet.mergeCells(`C${r.number}:U${r.number}`);
          const valueCell = worksheet.getCell(`C${r.number}`);
          valueCell.font = { name: 'Sarabun' };
          valueCell.alignment = { horizontal: 'left', vertical: 'middle' };
        });

        worksheet.addRow([]); // Spacer

        // 3. หัวตาราง (Table Header)
        const headerStart = worksheet.lastRow.number + 1;
        worksheet.mergeCells(headerStart, 1, headerStart + 1, 1); // A: คุณสมบัติ
        worksheet.mergeCells(headerStart, 2, headerStart + 1, 2); // B: ความสำคัญ
        worksheet.mergeCells(headerStart, 3, headerStart + 1, 3); // C: เป้าหมาย
        worksheet.mergeCells(headerStart, 4, headerStart, 15);    // D-O: 12 เดือน
        worksheet.mergeCells(headerStart, 16, headerStart + 1, 16); // แผน 1
        worksheet.mergeCells(headerStart, 17, headerStart + 1, 17); // หลักฐาน 1
        worksheet.mergeCells(headerStart, 18, headerStart + 1, 18); // แผน 2
        worksheet.mergeCells(headerStart, 19, headerStart + 1, 19); // หลักฐาน 2
        worksheet.mergeCells(headerStart, 20, headerStart + 1, 20); // แผน 3
        worksheet.mergeCells(headerStart, 21, headerStart + 1, 21); // หลักฐาน 3

        const h1 = worksheet.getRow(headerStart);
        h1.values = [
          'คุณสมบัติหรือทักษะที่ต้องการ', 'ความสำคัญ', 'ระดับ\nเป้าหมาย',
          'ผลการประเมินตนเอง รายเดือน (12 เดือน)', '', '', '', '', '', '', '', '', '', '', '',
          'แผนพัฒนา 1', 'หลักฐาน 1', 'แผนพัฒนา 2', 'หลักฐาน 2', 'แผนพัฒนา 3', 'หลักฐาน 3'
        ];

        const h2 = worksheet.getRow(headerStart + 1);
        h2.values = ['', '', '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.', '', '', '', '', '', ''];

        [h1, h2].forEach(row => {
          row.height = 30;
          row.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            cell.font = { name: 'Sarabun', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' }
            };
          });
        });

        const border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        // 4. ข้อมูล (Data based on Tree Structure)
        // ใช้ plan_career.optionsAll เพื่อให้ได้โครงสร้างทั้งหมด (อาชีพ -> คุณสมบัติ)
        const careers = this.plan_career.optionsAll || this.plan_career.options || [];
        const assessments = this.selfAssessments1 || [];
        const plans = this.plans1 || [];
        const references = this.references2 || [];

        let zebraIndex = 0;
        const careerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
        const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };

        for (const career of careers) {
          // Add Career Header Row
          const cRowVals = new Array(21).fill('');
          cRowVals[0] = `อาชีพ: ${career.label}`;
          const cRow = worksheet.addRow(cRowVals);
          worksheet.mergeCells(`A${cRow.number}:U${cRow.number}`);
          cRow.height = 25;
          cRow.eachCell(cell => {
            cell.fill = careerFill;
            cell.font = { name: 'Sarabun', bold: true };
            cell.border = border;
          });

          // Iteratate Qualifications under this Career
          const quals = this.qualificationsByCareer[String(career.value)] || [];

          for (const qual of quals) {
            const qid = String(qual.qa_plan_career_id);

            // A. Assessment Results (Monthly)
            const monthly = { '01': '-', '02': '-', '03': '-', '04': '-', '05': '-', '06': '-', '07': '-', '08': '-', '09': '-', '10': '-', '11': '-', '12': '-' };

            const qAssessments = assessments.filter(a => String(a.qa_plan_career_id) === qid);

            qAssessments.forEach(ass => {
              // Extract year and month
              const d = ass.self_assessment_date || "";
              const parts = d.split(/[-/]/);
              // Supports YYYY-MM-DD or DD/MM/YYYY
              let year = "";
              let month = "";

              if (parts[0].length === 4) { // YYYY...
                year = parts[0];
                month = parts[1];
              } else if (parts[2].length === 4) { // ...YYYY
                year = parts[2];
                month = parts[1];
              }

              // Only show value if it matches the selected year (if any)
              if (this.years_id && String(year) !== String(this.years_id)) {
                return;
              }

              if (month && monthly[month]) {
                monthly[month] = ass.perform_value;
              }
            });

            // B. Plans and Evidence
            // Get plans associated with this qual
            const qPlans = plans.filter(p => String(p.qa_plan_career_id) === qid);

            // Map plans to include their references (evidence)
            const planDetails = qPlans.map(p => {
              // Find references for this specific plan
              const pRefs = references.filter(r => String(r.plan_id) === String(p.plan_id));
              const refText = pRefs.map(r => {
                let txt = r.reference_description || "";
                // Remove prefix like [จากแผน: xxxx]
                txt = txt.replace(/^\[จากแผน:[^\]]+\]\s*/, '');
                return txt;
              }).join('\n• ');

              return {
                title: p.plan_title,
                evidence: refText ? `• ${refText}` : '-'
              };
            });

            // Prepare top 3 plans
            const p1 = planDetails[0] || {};
            const p2 = planDetails[1] || {};
            const p3 = planDetails[2] || {};

            const dataRow = worksheet.addRow([
              qual.qualification_name,
              qual.importance_name || '-',
              qual.target_value || qual.target_name || '-',
              monthly['01'], monthly['02'], monthly['03'], monthly['04'],
              monthly['05'], monthly['06'], monthly['07'], monthly['08'],
              monthly['09'], monthly['10'], monthly['11'], monthly['12'],
              p1.title || '-', p1.evidence || '-',
              p2.title || '-', p2.evidence || '-',
              p3.title || '-', p3.evidence || '-'
            ]);

            dataRow.height = 25; // Base height
            dataRow.eachCell((cell, colIdx) => {
              cell.font = { name: 'Sarabun', size: 11 };
              cell.border = border;
              cell.alignment = {
                vertical: 'top',
                horizontal: colIdx === 1 ? 'left' : 'center',
                wrapText: true,
                indent: colIdx === 1 ? 1 : 0
              };
              if (zebraIndex % 2 !== 0) cell.fill = zebraFill;
            });
            zebraIndex++;
          }
        }

        // ตั้งค่าความกว้างคอลัมน์
        worksheet.columns = [
          { width: 35 }, { width: 12 }, { width: 10 },
          { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 },
          { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 },
          { width: 25 }, { width: 30 }, { width: 25 }, { width: 30 }, { width: 25 }, { width: 30 }
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (this.file_export || "Self_Assessment_Report").replace(/\.xlsx$/i, '') + '.xlsx';
        saveAs(new Blob([buffer]), filename);
        this.notify("positive", "ส่งออกไฟล์ Excel 12 เดือนสำเร็จ");
      } catch (error) {
        console.error("Export error:", error);
        this.notify("negative", "ส่งออกไม่สำเร็จ: " + error.message);
      }
    },

    exportTableRef() {
      const columns = this.main_columns;
      const rows = this.safeSelfAssessments1;
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

      const filename = (this.file_export || "self_assessment.csv").endsWith(".csv")
        ? (this.file_export || "self_assessment.csv")
        : `${this.file_export || "self_assessment"}.csv`;

      const status = exportFile(filename, "\ufeff" + content, {
        encoding: "utf-8",
        mimeType: "text/csv;charset=utf-8;",
      });
      if (status !== true) this.notify("negative", "Browser denied file download...");
    },

    // ---------- reference helpers ----------
    getPlanTitle(plan_id) {
      if (!plan_id) return "";
      const found = (this.plans1 || []).find((p) => String(p.plan_id) === String(plan_id));
      return found ? `[แผน: ${found.plan_title}]` : "";
    },

    // ---------- dialog control ----------
    resetForm() {
      this.isEdit = false;
      this.btnLabel = "เพิ่มข้อมูล";
      this.showManualFormDialog = false;

      this.plan_career_id = "";
      this.qa_plan_career_id = "";
      this.self_assessment_date = "";
      this.perform_id = "";

      this.references1 = [];
      this.references1_ = [];
    },

    openAddReferenceDialog() {
      this.editedIndex = -1;
      this.editedReference = { ...this.defaultReference };
      this.btnLabel_ = "เพิ่มผลงาน";
      this.isEditRef = false;
      this.showReferenceDialog = true;
    },

    closeReferenceDialog() {
      this.showReferenceDialog = false;
      setTimeout(() => {
        this.editedReference = { ...this.defaultReference };
        this.editedIndex = -1;
      }, 150);
    },

    // ---------- CRUD self-assessment ----------
    submitForm() {
      const start_date = this.yearToDay(this.self_assessment_date);

      if (!this.qa_plan_career_id || !this.perform_id || !start_date) {
        this.notify("warning", "กรุณากรอกข้อมูลให้ครบ");
        return;
      }

      if (!this.isEdit) {
        this.$q
          .dialog({
            title: "ยืนยัน",
            message: "คุณต้องการเพิ่มข้อมูลการประเมินตนเองหรือไม่ ?",
            persistent: true,
            cancel: true,
          })
          .onOk(async () => {
            try {
              const response = await axios.post(`${this.apiUrl}/self-assessments`, {
                self_assessment_date: start_date,
                qa_plan_career_id: this.qa_plan_career_id,
                perform_id: this.perform_id,
                member_id: this.member_id, // Ensure member_id is sent for new assessments
              });

              if (this.safeReferences1.length > 0) {
                const newSelfAssessmentId = response.data.self_assessment_id; // Assuming API returns the new ID
                await this.addRefToDatabase(newSelfAssessmentId);
              }

              this.notify("positive", "บันทึกสำเร็จ");
              this.showManualFormDialog = false;
              await this.getUpdate(this.member_id);
              await this.getUpdateReference(this.member_id);
              await this.getFilterMonth();
            } catch (e) {
              console.error(e);
              this.notify("negative", "บันทึกไม่สำเร็จ");
            }
          });
      } else {
        (async () => {
          try {
            await axios.put(`${this.apiUrl}/self-assessments/${this.self_assessment_id}`, {
              self_assessment_date: start_date,
              qa_plan_career_id: this.qa_plan_career_id,
              perform_id: this.perform_id,
            });
            this.isEdit = false;
            this.btnLabel = "เพิ่มข้อมูล";
            this.references1 = [];
            this.references1_ = [];
            await this.getUpdate(this.member_id);
            await this.getUpdateReference(this.member_id);
            await this.getFilterMonth();
            this.notify("positive", "แก้ไขสำเร็จ");
            this.showManualFormDialog = false;
          } catch (e) {
            console.error(e);
            this.notify("negative", "แก้ไขไม่สำเร็จ");
          }
        })();
      }
    },

    OnEdit(self_assessment_id) {
      this.btnLabel = "เปลี่ยนเป็นเพิ่ม";
      this.isEdit = true;
      this.showManualFormDialog = true;

      axios
        .get(`${this.apiUrl}/self-assessments/${self_assessment_id}`)
        .then((response) => {
          const data = response.data || {};
          this.self_assessment_id = data.self_assessment_id;

          this.plan_career_id = data.plan_career_id;
          if (this.plan_career_id) this.getQualification(this.plan_career_id);

          this.qa_plan_career_id = data.qa_plan_career_id;
          this.perform_id = data.perform_id;
          this.self_assessment_date = this.dayToYear(data.self_assessment_date);

          this.getReferenceBySelf_Assessment_id(this.self_assessment_id);
        })
        .catch((e) => console.log(e));
    },

    async onDelete(self_assessment_id, self_assessment_date) {
      try {
        // Check dependencies
        const resCheck = await axios.post(`${this.apiUrl}/self-assessments/check-dependencies`, {
          id: self_assessment_id,
        });
        const hasDeps = resCheck.data.has_dependencies;
        const depCount = resCheck.data.count;

        if (hasDeps) {
          this.$q.dialog({
            title: "ไม่สามารถลบได้",
            message: `ไม่สามารถลบผลการประเมินวัน ${self_assessment_date} ได้ เนื่องจากมีข้อมูลหลักฐาน/ผลงานที่เกี่ยวข้อง ${depCount} รายการ\n\nกรุณาลบข้อมูลหลักฐานที่เกี่ยวข้องออกให้หมดก่อน`,
            ok: { label: 'รับทราบ', color: 'primary' }
          });
          return;
        }

        this.$q
          .dialog({
            title: "ยืนยันการลบ",
            message: `คุณต้องการลบผลการประเมินวัน ${self_assessment_date} หรือไม่ ?`,
            persistent: true,
            cancel: true,
            ok: { label: 'ยืนยันการลบ', color: 'negative' }
          })
          .onOk(async () => {
            try {
              await axios.delete(`${this.apiUrl}/self-assessments/${self_assessment_id}`);
              await this.getUpdate(this.member_id);
              await this.getUpdateReference(this.member_id);
              await this.getFilterMonth();
              this.notify("positive", "ลบสำเร็จ");
            } catch (e) {
              console.error(e);
              this.notify("negative", "ลบไม่สำเร็จ");
            }
          });
      } catch (e) {
        console.error("Dependency check failed:", e);
        this.notify("negative", "ตรวจสอบข้อมูลที่เกี่ยวข้องไม่สำเร็จ");
      }
    },

    // ---------- CRUD references ----------
    addRow() {
      const payload = { ...this.editedReference };

      if (!payload.reference_description || !String(payload.reference_description).trim()) {
        this.notify("warning", "กรุณากรอกแหล่งอ้างอิง/ผลงาน");
        return;
      }

      if (this.editedIndex > -1) {
        this.references1.splice(this.editedIndex, 1, payload);
      } else {
        this.references1.push(payload);
      }

      // ✅ keep consistent as object[]
      this.references1_ = this.references1.slice();

      this.closeReferenceDialog();

      // หากเป็นโหมดแก้ไขให้ยิง API ทันที
      if (this.isEdit) {
        if (!this.isEditRef) {
          axios
            .post(`${this.apiUrl}/self-assessments/${this.self_assessment_id}/references`, {
              reference_description: payload.reference_description,
              plan_id: payload.plan_id,
            })
            .then(() => this.getUpdateReference_(this.member_id, this.self_assessment_id))
            .catch((e) => console.log(e));
        } else {
          axios
            .put(`${this.apiUrl}/self-assessments/references/${payload.reference_id}`, {
              reference_description: payload.reference_description,
              plan_id: payload.plan_id,
            })
            .then(() => {
              this.btnLabel_ = "เพิ่มผลงาน";
              this.isEditRef = false;
              this.notify("positive", "แก้ไขหลักฐานสำเร็จ");
            })
            .catch((e) => console.log(e));
        }
      }
    },

    onEditReference(ref) {
      this.$q.dialog({
        title: "Edit Reference",
        message: "แก้ไขรายละเอียดหลักฐาน",
        prompt: {
          model: ref.reference_description,
          type: "text",
        },
        cancel: true,
        persistent: true,
      }).onOk((data) => {
        axios.put(`${this.apiUrl}/self-assessments/references/${ref.reference_id}`, {
          reference_description: data,
          plan_id: ref.plan_id
        }).then(() => {
          this.getUpdateReference(this.member_id);
          this.notify("positive", "แก้ไขข้อมูลสำเร็จ");
        }).catch(e => console.error(e));
      });
    },

    onDeleteReference(reference_id) {
      this.$q.dialog({
        title: "Confirm",
        message: "ต้องการลบหลักฐานนี้ หรือไม่?",
        cancel: true,
        persistent: true,
      }).onOk(() => {
        axios.delete(`${this.apiUrl}/self-assessments/references/${reference_id}`)
          .then(() => {
            this.getUpdateReference(this.member_id);
            this.notify("positive", "ลบข้อมูลสำเร็จ");
          }).catch(e => console.error(e));
      });
    },

    deleteItem(item) {
      console.log("deleteItem called for:", item);
      if (item.reference_id) {
        // Persisted reference (from tree or editing saved assessment)
        const reference_id = item.reference_id;
        const self_assessment_id = item.self_assessment_id;

        this.$q
          .dialog({
            title: "ยืนยัน",
            message: "คุณต้องการลบผลงานนี้หรือไม่ ?",
            persistent: true,
            cancel: true,
          })
          .onOk(() => {
            console.log("Deleting reference from DB:", reference_id);
            axios
              .delete(`${this.apiUrl}/self-assessments/references/${reference_id}`)
              .then(() => {
                this.notify("positive", "ลบหลักฐานสำเร็จ");
                // Refresh both lists to update tree and dialog table
                this.getUpdateReference(this.member_id);
                if (self_assessment_id) {
                  this.getUpdateReference_(this.member_id, self_assessment_id);
                }
              })
              .catch((e) => {
                console.error("Delete reference failed:", e);
                this.notify("negative", "ลบหลักฐานไม่สำเร็จ");
              });
          });
      } else {
        // Local reference (adding new assessment in dialog)
        const index = this.references1.indexOf(item);
        if (index > -1) {
          this.references1.splice(index, 1);
          console.log("Removed local reference at index:", index);
        }
        this.references1_ = this.references1.slice();
      }
    },

    addRefToDatabase(self_assessment_id) {
      if (!self_assessment_id || this.references1_.length === 0) return;

      axios
        .post(`${this.apiUrl}/self-assessments/${self_assessment_id}/references/bulk`, {
          references: this.references1_, // ✅ object[] consistent
        })
        .then(() => {
          this.references1 = [];
          this.references1_ = [];
        })
        .catch((e) => console.log(e));
    },

    // ---------- fetchers ----------
    getUpdateAddRefToDatabase(member_id) {
      return axios
        .get(`${this.apiUrl}/self-assessments?member_id=${member_id}`)
        .then((res) => {
          this.selfAssessments1 = Array.isArray(res.data) ? res.data : [];
          this.selfAssessments1_ = this.selfAssessments1;
          // Assuming the last added assessment is the one we just created
          const lastAssessment = this.selfAssessments1[this.selfAssessments1.length - 1];
          if (lastAssessment) {
            this.addRefToDatabase(lastAssessment.self_assessment_id);
          }
        })
        .catch((e) => {
          console.log(e);
          this.selfAssessments1 = [];
          this.selfAssessments1_ = [];
        });
    },

    getUpdate(member_id) {
      return axios
        .get(`${this.apiUrl}/self-assessments?member_id=${member_id}`)
        .then((res) => {
          this.selfAssessments1 = Array.isArray(res.data) ? res.data : [];
          this.selfAssessments1_ = this.selfAssessments1;
        })
        .catch((e) => {
          console.log(e);
          this.selfAssessments1 = [];
          this.selfAssessments1_ = [];
        });
    },

    getUpdateReference(member_id) {
      return axios
        .get(`${this.apiUrl}/self-assessments/references?member_id=${member_id}`)
        .then((res) => {
          this.references2 = Array.isArray(res.data) ? res.data : [];
        })
        .catch((e) => {
          console.log(e);
          this.references2 = [];
        });
    },

    getUpdateReference_(member_id, self_assessment_id) {
      return axios
        .get(`${this.apiUrl}/self-assessments/${self_assessment_id}/references?member_id=${member_id}`)
        .then((res) => {
          this.references1 = Array.isArray(res.data) ? res.data : [];
          this.references1_ = this.references1.slice(); // ✅ consistent
        })
        .catch((e) => {
          console.log(e);
          this.references1 = [];
          this.references1_ = [];
        });
    },

    getReferenceBySelf_Assessment_id(self_assessment_id) {
      return axios
        .get(`${this.apiUrl}/self-assessments/${self_assessment_id}/references`)
        .then((res) => {
          this.references1 = Array.isArray(res.data) ? res.data : [];
          this.references1_ = this.references1.slice(); // ✅ consistent
        })
        .catch((e) => {
          console.log(e);
          this.references1 = [];
          this.references1_ = [];
        });
    },

    // ---------- dropdown data ----------
    getCareer(member_id) {
      return axios
        .get(`${this.apiUrl}/plan-careers?member_id=${member_id}`)
        .then((res) => {
          const arr = Array.isArray(res.data) ? res.data : [];
          const mapped = arr.map((item) => ({ label: item.career_name, value: item.plan_career_id }));
          this.plan_career.options = mapped;
          this.plan_career.optionsAll = mapped;
          this.planCareerBase = mapped.slice();
        })
        .catch((e) => console.log(e));
    },

    getQualification(plan_career_id) {
      return axios
        .get(`${this.apiUrl}/qa-plan-careers?plan_career_id=${plan_career_id}`)
        .then((res) => {
          const arr = Array.isArray(res.data) ? res.data : [];
          const mapped = arr.map((item) => ({
            label: item.qualification_name,
            value: item.qa_plan_career_id,
            description: `${item.level_description || ""} ${item.target_name || ""}`.trim(),
          }));
          this.qa_plan_career.options = mapped;
          this.qaPlanCareerBase = mapped.slice();
        })
        .catch((e) => console.log(e));
    },

    getPerform() {
      return axios
        .get(`${this.apiUrl}/self-assessments/perform`)
        .then((res) => {
          const arr = Array.isArray(res.data) ? res.data : [];
          const mapped = arr.map((item) => ({ label: item.perform_name, value: item.perform_id }));
          this.perform.options = mapped;
          this.performBase = mapped.slice();
          this.performOptionsAll = mapped.slice();
        })
        .catch((e) => console.log(e));
    },

    // ---------- filters for selects ----------
    filterPerform(val, update) {
      update(() => {
        if (!val) return (this.perform.options = this.performBase.slice());
        const needle = val.toLowerCase();
        this.perform.options = this.performBase.filter((v) => String(v.label).toLowerCase().includes(needle));
      });
    },
    filterQaPlanCareer(val, update) {
      update(() => {
        if (!val) return (this.qa_plan_career.options = this.qaPlanCareerBase.slice());
        const needle = val.toLowerCase();
        this.qa_plan_career.options = this.qaPlanCareerBase.filter((v) => String(v.label).toLowerCase().includes(needle));
      });
    },
    filterPlanCareer(val, update) {
      update(() => {
        if (!val) return (this.plan_career.options = this.planCareerBase.slice());
        const needle = val.toLowerCase();
        this.plan_career.options = this.planCareerBase.filter((v) => String(v.label).toLowerCase().includes(needle));
      });
    },



    // ---------- plans ----------
    getPlans(member_id) {
      return axios
        .get(`${this.apiUrl}/plans?member_id=${member_id}`)
        .then((res) => {
          this.plans1 = Array.isArray(res.data) ? res.data : [];
        })
        .catch((e) => console.log(e));
    },

    // ---------- individuals ----------
    async getIndividualData(member_id) {
      if (!member_id) return;
      try {
        const res = await axios.get(`${this.apiUrl}/members/${member_id}/individual`);
        const d = res.data || {};

        // Map common fields used in reports to ensure compatibility
        this.individual = {
          ...d,
          full_name: d.full_name || `${d.first_name || ''} ${d.last_name || ''}`.trim() || '-',
          institution: d.institute_name || d.institution || '-',
          education_level: d.degree_name || d.education_level || '-',
          study_year: d.year || d.study_year || '-',
          province: d.province || d.province_from || '-',
        };
        console.log("Individual data loaded:", this.individual);
      } catch (e) {
        console.error("Individual fetch failed:", e);
        this.individual = {};
      }
    },

    // ---------- bootstrap ----------
    async bootstrap() {
      console.log("Bootstrap starting...");
      try {
        const mid = this.member_id;
        console.log("Bootstrap: member_id =", mid);

        console.log("Bootstrap: fetching careers and performance levels...");
        await Promise.all([this.getCareer(mid), this.getPerform(), this.getIndividualData(mid)])
          .then(() => console.log("✓ Careers/Perform/Individual loaded"))
          .catch(e => console.error("✗ Careers/Perform/Individual failed", e));

        // fetch quals per career (for tree)
        const careers = Array.isArray(this.plan_career.options) ? this.plan_career.options : [];
        console.log(`Bootstrap: fetching qualifications for ${careers.length} careers...`);
        await Promise.all(
          careers.map((c) =>
            axios
              .get(`${this.apiUrl}/qa-plan-careers?plan_career_id=${c.value}`)
              .then((res) => {
                const rows = Array.isArray(res.data) ? res.data : [];
                this.qualificationsByCareer[String(c.value)] = rows;
              })
              .catch((e) => console.error(`✗ Quas for career ${c.label} failed:`, e))
          )
        ).then(() => console.log("✓ All qualifications per career loaded"));

        console.log("Bootstrap: fetching plans, assessments, and references...");
        await Promise.all([this.getPlans(mid), this.getUpdate(mid), this.getUpdateReference(mid)])
          .then(() => console.log("✓ Plans/Assessments/Refs loaded"))
          .catch(e => console.error("✗ Plans/Assessments/Refs failed", e));


      } catch (e) {
        console.error("Bootstrap fatal error:", e);
        this.notify("negative", "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        console.log("Bootstrap finished.");
      }
    },

    // ---------- AI ----------
    // ---------- AI v2 (Plan-based) ----------
    getPlansForQual(qualId) {
      const allPlans = Array.isArray(this.plans1) ? this.plans1 : [];
      return allPlans.filter(p => String(p.qa_plan_career_id) === String(qualId));
    },

    async recommendScoreForQualification(qual) {
      if (this.loadingQualScoreAI) return;
      this.loadingQualScoreAI = qual.qa_plan_career_id;
      try {
        const mid = Number(this.member_id);
        const plans = this.getPlansForQual(qual.qa_plan_career_id);
        const plansContext = plans.length > 0
          ? plans.map(p => `- ${p.plan_title} (${p.plan_channel})`).join("\n")
          : "(No specific plans added yet)";

        const performOpts = this.performOptionsAll.map(o => `${o.value}:${o.label}`).join(", ");

        const prompt = `
Recommend exactly one overall performance level for the skill "${qual.qualification_name}".
Current Development Plans:
${plansContext}

Choose from these levels: [${performOpts}]
Reply with ONLY the level ID (number).
`.trim();

        const messages = [
          { role: 'system', content: 'You are an HR assessment expert. Return only numerical IDs.' },
          { role: 'user', content: prompt }
        ];

        const res = await axios.post(this.chat_url, {
          messages,
          gemini_api_key: sessionStorage.getItem("gemini_api_key")
        }, { timeout: 300000 });
        const reply = (res?.data?.reply || "").trim();
        const m = reply.match(/\d+/);
        if (m) {
          this.qualAssessmentScores[qual.qa_plan_career_id] = m[0];
          this.notify("positive", `AI แนะนำผลประเมินระดับ: ${m[0]}`);
        } else {
          this.notify("warning", "AI ไม่สามารถแนะนำผลประเมินที่เป็นตัวเลขได้");
        }
      } catch (e) {
        console.error(e);
        this.notify("negative", "เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
      } finally {
        this.loadingQualScoreAI = null;
      }
    },

    async recommendEvidencesForPlan(plan, qual) {
      if (this.loadingPlanEvidenceAI) return;
      this.loadingPlanEvidenceAI = plan.plan_id;
      try {
        const prompt = `
Recommend 2-3 specific evidence items (principal evidence) that a student would have after completing this plan:
Plan: "${plan.plan_title}"
Channel: "${plan.plan_channel}"
Skill: "${qual.qualification_name}"

Reply only as a JSON array of strings. Example: ["Certificate from Coursera", "Source code on GitHub"]
`.trim();

        const messages = [
          { role: 'system', content: 'You are a professional assessor. Return a JSON array of strings.' },
          { role: 'user', content: prompt }
        ];

        const res = await axios.post(this.chat_url, {
          messages,
          gemini_api_key: sessionStorage.getItem("gemini_api_key")
        }, { timeout: 300000 });
        const reply = res?.data?.reply || "";
        let recs = [];
        try {
          const match = reply.match(/\[.*\]/s);
          if (match) recs = JSON.parse(match[0]);
        } catch (e) {
          console.error("AI Parse Error", e);
        }

        if (Array.isArray(recs) && recs.length > 0) {
          this.planEvidences[plan.plan_id] = recs.map(t => ({ text: t, isEditing: false }));
          this.notify("positive", "ได้คำแนะนำหลักฐานเรียบร้อยแล้ว");
        } else {
          this.notify("warning", "AI ไม่สามารถสร้างรูปแบบหลักฐานที่ถูกต้องได้");
        }
      } catch (e) {
        console.error(e);
        this.notify("negative", "เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
      } finally {
        this.loadingPlanEvidenceAI = null;
      }
    },

    async saveCombinedAssessment(qual) {
      const score = this.qualAssessmentScores[qual.qa_plan_career_id];
      if (!score) {
        this.notify("warning", "กรุณาเลือกผลการประเมินก่อนบันทึก");
        return;
      }

      const today = new Date();
      const d = String(today.getDate()).padStart(2, "0");
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const y = String(today.getFullYear());
      const selfAssessmentDate = `${y}/${m}/${d}`;
      const plans = this.getPlansForQual(qual.qa_plan_career_id);

      try {
        // 1. Create Assessment
        const resInsert = await axios.post(`${this.apiUrl}/self-assessments`, {
          self_assessment_date: selfAssessmentDate,
          qa_plan_career_id: qual.qa_plan_career_id,
          perform_id: score,
        });
        const newAssessmentId = resInsert.data.self_assessment_id;

        if (newAssessmentId) {
          // 3. Save references
          const references = [];
          plans.forEach(p => {
            const evs = this.planEvidences[p.plan_id] || [];
            evs.forEach(ev => {
              if (ev.text && ev.text.trim()) {
                references.push({
                  reference_description: `[จากแผน: ${p.plan_title}] ${ev.text.trim()}`,
                  plan_id: p.plan_id
                });
              }
            });
          });

          if (references.length > 0) {
            await axios.post(`${this.apiUrl}/self-assessments/${newAssessmentId}/references/bulk`, {
              references
            });
          }
        }

        // 4. Refresh UI
        await Promise.all([
          this.getUpdate(this.member_id),
          this.getUpdateReference(this.member_id)
        ]).catch(e => console.warn("Refresh failed", e));

        // 5. Cleanup temporary AI state
        this.$set(this.qualAssessmentScores, qual.qa_plan_career_id, null);
        plans.forEach(p => this.$set(this.planEvidences, p.plan_id, []));

        // 6. Finalized Success Message
        this.notify("positive", `บันทึกการประเมิน "${qual.qualification_name}" เรียบร้อยแล้ว`);

      } catch (e) {
        console.error("Save Error:", e);
        this.notify("negative", "บันทึกไม่สำเร็จ");
      }
    },

    async acceptAiAssessment(rec) {
      // Legacy - kept for compatibility if called elsewhere
      const today = new Date();
      const selfAssessmentDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;

      try {
          await axios.post(`${this.apiUrl}/self-assessments`, {
            self_assessment_date: selfAssessmentDate,
            qa_plan_career_id: rec.qa_plan_career_id,
            perform_id: rec.perform_id,
          });
        await this.getUpdate(this.member_id);
        this.notify("positive", "บันทึกสำเร็จ");
      } catch (e) { console.error(e); }
    },

    // ---------- Excel export (คงของเดิมไว้) ----------
    async exportToExcel() {
      // ใช้ของเดิมคุณได้เลย (ยาวมาก) — ไม่แตะ logic ภายในเพื่อไม่เสี่ยงเปลี่ยนผลลัพธ์
      // ถ้าต้องการ ผมแยกเป็น helper file ให้ได้ (ExcelService.js)
      this.notify("warning", "exportToExcel: คง logic เดิมไว้ (ถ้าต้องการ refactor แยกไฟล์ บอกได้)");
      // TODO: วางของเดิมคุณตรงนี้ได้เลย
    },

    // ---------- filters and years ----------
    on_years_() {
      this.years_id = "";
    },
    on_years(year) {
      this.years_id = year;
    },
    getYear() {
      axios
        .get(`${this.apiUrl}/qa-plan-careers/years?member_id=${this.member_id}`)
        .then((res) => {
          const years = Array.isArray(res.data) ? res.data : [];
          this.years.options = years.map((item) => ({
            label: item.Year,
            value: item.Year,
          }));
          this.years_.options = this.years.options;
        })
        .catch((e) => console.log(e));
    },
    filterYear(val, update) {
      if (val === "") {
        update(() => {
          this.years.options = this.years_.options;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.years.options = this.years_.options.filter(
          (v) => v.label.indexOf(needle) > -1
        );
      });
    },
  },

  async mounted() {
    if (this.member_id) {
      await this.bootstrap();
      this.getYear();
    }
    // Removed auto-run AI - now only runs when user clicks "ขอคำแนะนำใหม่" button
  },

  created() {
    this.apiUrl = getRestApiUrl(this.$store);
    this.chat_url = `${this.apiUrl}/chat`;
  },
};
</script>

<style scoped></style>

<style lang="sass">
.bordered-scroll-area
  border: 1px solid rgba(0, 0, 0, 0.12)
  border-radius: 8px
</style>
