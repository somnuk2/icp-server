<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="dashboard-bg">
      <q-page padding class="flex justify-center">
        <!-- Wrapper for safety and transitions -->
        <div v-if="!isLoading" class="full-width flex justify-center" :class="{ 'is-exporting': isExporting }">
          <div class="dashboard-container shadow-24">
            <!-- Main Content Grid -->
            <div class="row full-height">
              <!-- Left Column: Profile & Info -->
              <div class="col-12 col-md-5 q-pa-xl left-column">
                <div class="profile-header">
                  <h1 class="display-name">{{ profile.first_name || 'Student' }} {{ profile.last_name
                    || '' }}</h1>
                  <h2 class="job-title">{{ profile.dream_career || 'Target Career' }}</h2>
                  <div class="accent-line"></div>
                </div>

                <div class="section-container q-mt-xl">
                  <h3 class="section-title">About Me</h3>
                  <p class="about-text">
                    {{ aboutMeText }}
                  </p>
                </div>

                <div class="section-container q-mt-xl">
                  <h3 class="section-title">อาชีพที่มีความพร้อม</h3>
                  <div v-if="analysis && analysis.readinessList" class="analysis-results dynamic-scroll-area">
                    <div v-for="(item, idx) in analysis.readinessList" :key="'r' + idx" class="q-mb-lg readiness-item">
                      <div class="text-weight-bold text-subtitle1 q-mb-sm">{{ item.name }}</div>

                      <!-- Target Avg Bar -->
                      <div class="q-mb-sm">
                        <div class="text-caption text-grey-8 flex justify-between">
                          <span>ค่าเฉลี่ยเป้าหมายคุณสมบัติ/ทักษะ</span>
                          <span>{{ item.avgTarget.toFixed(2) }}</span>
                        </div>
                        <q-linear-progress :value="item.avgTarget / 5" color="blue-4" size="10px" rounded
                          class="q-mt-xs" />
                      </div>

                      <!-- Current Avg Bar -->
                      <div class="q-mb-sm">
                        <div class="text-caption text-grey-9 text-weight-medium flex justify-between">
                          <span>ค่าเฉลี่ยผลการประเมินตนเอง</span>
                          <span>{{ item.avgCurrent.toFixed(2) }}</span>
                        </div>
                        <q-linear-progress :value="item.avgCurrent / 5" color="green" size="12px" rounded
                          class="q-mt-xs shadow-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section-container q-mt-xl">
                  <h3 class="section-title">Contact</h3>
                  <div class="contact-links">
                    <div class="contact-item">
                      <q-icon name="phone" class="q-mr-sm" size="xs" />
                      <span>{{ profile.phone || profile.telephone || 'N/A' }}</span>
                    </div>
                    <div class="contact-item">
                      <q-icon name="email" class="q-mr-sm" size="xs" />
                      <span>{{ profile.email || 'N/A' }}</span>
                    </div>
                    <div class="contact-item">
                      <q-icon name="language" class="q-mr-sm" size="xs" />
                      <span>www.icp2022.net</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Avatar, Education, Experience & AI Analysis -->
              <div class="col-12 col-md-7 q-pa-xl right-column">
                <div class="profile-image-section flex flex-center column">
                  <div class="profile-image-container shadow-15">
                    <q-avatar size="280px">
                      <img :src="profileImage || 'https://cdn.quasar.dev/img/avatar.png'" style="object-fit: cover;" />
                    </q-avatar>
                  </div>
                  <!-- Edit Button -->
                  <div class="q-mt-md q-gutter-md">
                    <q-btn round color="primary" icon="camera_alt" size="lg" @click="triggerFileInput"
                      class="btn-edit-photo hover-scale">
                      <q-tooltip>เปลี่ยนรูปโปรไฟล์</q-tooltip>
                    </q-btn>
                    <q-btn round color="negative" icon="picture_as_pdf" size="lg" @click="exportToPDF"
                      class="hover-scale">
                      <q-tooltip>ส่งออก PDF</q-tooltip>
                    </q-btn>
                    <q-btn round style="background: #00c4cc; color: white;" icon="auto_awesome" size="lg"
                      @click="exportToCanva" class="hover-scale">
                      <q-tooltip>ส่งออก Canva (SVG)</q-tooltip>
                    </q-btn>
                    <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="onFileChange" />
                  </div>
                </div>

                <div class="row q-col-gutter-xl">
                  <!-- Education & Experience -->
                  <div class="col-12">
                    <div class="section-container">
                      <h3 class="section-title">Education</h3>
                      <div class="education-item q-mb-md">
                        <div class="edu-title text-primary text-bold">{{ profile.institution ||
                          'ยังไม่ระบุสถาบันการศึกษา' }}</div>
                        <div class="q-mt-md grid-edu-info">
                          <div class="row items-center q-mb-sm">
                            <q-icon name="school" color="grey-7" size="20px" class="q-mr-sm" />
                            <span class="text-weight-bold q-mr-xs">ระดับการศึกษา:</span>
                            <span>{{ profile.education_level || '-' }}</span>
                            <q-badge
                              :color="profile.is_graduate === '1' || profile.is_graduate === 1 ? 'green' : 'blue'"
                              class="q-ml-sm">
                              {{ profile.is_graduate === '1' || profile.is_graduate === 1
                                ? 'จบการศึกษาแล้ว' : 'กำลังศึกษา' }}
                            </q-badge>
                          </div>

                          <div v-if="profile.is_graduate === '0' || profile.is_graduate === 0"
                            class="row items-center q-mb-sm">
                            <q-icon name="history_edu" color="grey-7" size="20px" class="q-mr-sm" />
                            <span class="text-weight-bold q-mr-xs">ชั้นปีที่กำลังศึกษา:</span>
                            <span>ชั้นปีที่ {{ profile.year || '-' }}</span>
                          </div>

                          <div v-if="profile.is_graduate === '1' || profile.is_graduate === 1"
                            class="row items-center q-mb-sm">
                            <q-icon name="event_available" color="grey-7" size="20px" class="q-mr-sm" />
                            <span class="text-weight-bold q-mr-xs">ปีที่สำเร็จการศึกษา:</span>
                            <span>{{ profile.date || '-' }}</span>
                          </div>

                          <div class="row items-center q-mb-sm">
                            <q-icon name="account_balance" color="grey-7" size="20px" class="q-mr-sm" />
                            <span class="text-weight-bold q-mr-xs">คณะ:</span>
                            <span>{{ profile.faculty_name || '-' }}</span>
                          </div>
                          <div class="row items-center q-mb-sm">
                            <q-icon name="schema" color="grey-7" size="20px" class="q-mr-sm" />
                            <span class="text-weight-bold q-mr-xs">สาขาวิชา:</span>
                            <span>{{ profile.department_name || '-' }}</span>
                          </div>

                          <!-- Project & Advisor -->
                          <div class="row items-center q-mb-sm q-mt-md">
                            <q-icon name="assignment" color="blue-7" size="20px" class="q-mr-sm" />
                            <span class="text-weight-bold q-mr-xs">โครงการ:</span>
                            <span>{{ profile.project_name || '-' }}</span>
                          </div>
                          <div class="row items-center q-mb-sm">
                            <q-icon name="person_pin" color="blue-7" size="20px" class="q-mr-sm" />
                            <span class="text-weight-bold q-mr-xs">ผู้ดูแลกลุ่ม:</span>
                            <span>{{ profile.advisor_name || '-' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="section-container q-mt-lg">
                      <h3 class="section-title">สรุปผลการวิเคราะห์โปรไฟล์</h3>
                      <div v-if="analysis" class="analysis-results">
                        <!-- 2. Important Skills -->
                        <div class="analysis-card bg-orange-1 q-pa-md q-mb-md rounded-borders border-orange">
                          <div class="text-subtitle1 text-orange-9 text-weight-bold q-mb-sm">
                            <q-icon name="visibility" class="q-mr-xs" />
                            คุณสมบัติ/ทักษะที่สำคัญ
                          </div>
                          <div class="dynamic-scroll-area" style="max-height: 250px;">
                            <div v-for="(item, idx) in analysis.importantSkills" :key="'i' + idx" class="q-mb-md">
                              <div class="text-weight-medium">{{ item.career }}: {{
                                item.skillName }}</div>

                              <div class="q-mt-xs">
                                <div class="flex justify-between text-caption text-grey-7">
                                  <span>ระดับความสำคัญ : {{ item.importanceLabel }}
                                    (ค่าเป้าหมาย: {{ item.rawTarget }})</span>
                                  <span>ความพร้อมปัจจุบัน: {{ item.rawCurrent
                                  }}</span>
                                </div>
                                <!-- Importance Bar -->
                                <q-linear-progress :value="item.importanceValue" color="orange-4" size="6px" rounded
                                  class="q-mb-xs" />
                                <!-- Recent Assessment Bar -->
                                <q-linear-progress :value="item.currentValue" color="orange-9" size="8px" rounded>
                                  <div class="absolute-full flex flex-center">
                                    <div class="text-white text-bold" style="font-size: 8px;">ผลประเมินล่าสุด
                                    </div>
                                  </div>
                                </q-linear-progress>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- 3. Development -->
                        <div
                          class="analysis-card bg-blue-1 q-pa-md rounded-borders border-blue hover-shadow transition-all">
                          <div class="text-subtitle1 text-blue-9 text-weight-bold q-mb-sm">
                            <q-icon name="trending_up" class="q-mr-xs" />
                            การพัฒนาคุณสมบัติ/ทักษะที่สำคัญ
                          </div>
                          <div class="dynamic-scroll-area" style="max-height: 250px;">
                            <div v-for="(item, idx) in analysis.developmentSkills" :key="'d' + idx"
                              class="q-mb-md career-dev-item">
                              <div class="text-weight-medium">{{ item.career }}: {{
                                item.skillName }}</div>
                              <div class="text-caption text-blue-8 q-pl-md">
                                ประเภท: {{ item.devType }}
                              </div>
                              <div class="text-body2 text-grey-8 q-pl-md border-left-blue">
                                {{ item.methodAndEvidence }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-center q-pa-lg text-grey">
                        <q-icon name="query_stats" size="xl" />
                        <p>กำลังรวบรวมข้อมูลเพื่อสรุปผล...</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer / Branding -->
                <div class="dashboard-footer text-right q-mt-auto q-pt-xl">
                  <div class="text-caption text-grey-6">Powered by AI • ICP 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-else class="full-width flex flex-center" style="min-height: 400px;">
          <q-spinner-dots color="primary" size="3em" />
          <div class="q-ml-md text-grey">กำลังโหลดข้อมูลโปรไฟล์...</div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { useQuasar } from "quasar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { getRestApiUrl, getChatUrl } from "../../utils/apiConfig.js";

const store = useStore();
const $q = useQuasar();
const member_id = store.getters.myMember_id;

// State
const profile = ref({});
const careerAnalyses = ref([]);
const isLoading = ref(true);
const profileImage = ref("");
const fileInput = ref(null);
const isExporting = ref(false);

const exportToPDF = async () => {
  isExporting.value = true;
  $q.loading.show({
    message: 'กำลังจัดเตรียมข้อมูลและขยายหน้าจอเพื่อส่งออก PDF...',
    backgroundColor: 'primary',
    messageColor: 'white'
  });

  try {
    // Wait for DOM to expand (the is-exporting class triggers CSS changes)
    await new Promise(resolve => setTimeout(resolve, 800));

    const element = document.querySelector(".dashboard-container");
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    // Calculate dimensions to fit width (A4 width approx 210mm) but dynamic height
    const imgWidth = 210;
    const pageHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF with custom page size matching the content ratio
    const pdf = new jsPDF("p", "mm", [imgWidth, pageHeight]);

    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, pageHeight);
    pdf.save(`Dashboard_${profile.value.first_name || 'Student'}.pdf`);

    $q.notify({
      color: 'positive',
      message: 'ส่งออก PDF สำเร็จแล้ว!',
      icon: 'check'
    });
  } catch (error) {
    console.error("PDF Export error:", error);
    $q.notify({
      color: 'negative',
      message: 'เกิดข้อผิดพลาดในการส่งออก PDF',
      icon: 'error'
    });
  } finally {
    isExporting.value = false;
    $q.loading.hide();
  }
};

const exportToCanva = async () => {
  isExporting.value = true;
  $q.loading.show({
    message: 'กำลังจัดเตรียมไฟล์ SVG สำหรับ Canva...',
    backgroundColor: 'primary',
    messageColor: 'white'
  });

  try {
    // Wait for DOM to expand
    await new Promise(resolve => setTimeout(resolve, 800));

    const element = document.querySelector(".dashboard-container");

    // Step 1: Capture with html2canvas for visual accuracy
    const canvas = await html2canvas(element, {
      scale: 2, // Good balance
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL("image/png");
    const width = canvas.width;
    const height = canvas.height;

    // Step 2: Wrap PNG in SVG structure for Canva compatibility
    // This solves the 'blank page' issue while providing the .svg extension requested
    const svgData = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="${imgData}" />
</svg>
    `.trim();

    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, `Dashboard_${profile.value.first_name || 'Student'}_Canva.svg`);

    $q.notify({
      color: 'positive',
      message: 'ส่งออกไฟล์ SVG สำหรับ Canva สำเร็จแล้ว!',
      icon: 'check'
    });
  } catch (error) {
    console.error("Canva Export error:", error);
    $q.notify({
      color: 'negative',
      message: 'เกิดข้อผิดพลาดในการส่งออกไฟล์ SVG',
      icon: 'error'
    });
  } finally {
    isExporting.value = false;
    $q.loading.hide();
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      profileImage.value = event.target.result;
      $q.notify({
        color: 'positive',
        message: 'เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว (เฉพาะพรีวิว)',
        icon: 'check'
      });
    };
    reader.readAsDataURL(file);
  }
};

const analysis = computed(() => {
  if (!careerAnalyses.value.length) return null;

  let summaries = []; // For Item 1
  let importantSkills = []; // For Item 2
  let developmentSkills = []; // For Item 3

  careerAnalyses.value.forEach(c => {
    const importanceWeights = { "จำเป็นต้องมี": 2, "ควรจะมี": 1, "ทางเลือก": 0 };
    let maxWeight = -1;
    let diffSum = 0;
    let targetSum = 0;
    let currentSum = 0;
    let skillCount = 0;
    let mostImportantSkill = null;
    let devSkill = null;

    c.skills.forEach(s => {
      // 1.1 Readiness Difference (Current - Target)
      const diff = s.current - s.target;
      diffSum += diff;
      targetSum += s.target;
      currentSum += s.current;
      skillCount++;

      // 2.1 Find Max Importance Weight for this career
      const w = importanceWeights[s.importance] ?? -1;
      if (w > maxWeight) {
        maxWeight = w;
        mostImportantSkill = s;
      } else if (w === maxWeight && maxWeight !== -1) {
        // If weight is same, target value can be tie-breaker or just keep first
        if (s.target > (mostImportantSkill?.target || 0)) {
          mostImportantSkill = s;
        }
      }

      // 3.1 Development of Important Skills (Top one per career)
      if (!devSkill && s.hasPlan) {
        devSkill = s;
      }
    });

    // 1. Avg Readiness & Components
    const avgDiff = skillCount > 0 ? diffSum / skillCount : 0;
    const avgTarget = skillCount > 0 ? targetSum / skillCount : 0;
    const avgCurrent = skillCount > 0 ? currentSum / skillCount : 0;

    summaries.push({
      name: c.name,
      score: avgDiff,
      avgTarget: avgTarget,
      avgCurrent: avgCurrent,
      // Map -5..5 to 0..1 for progress bar visualization
      percent: (avgDiff + 5) / 10
    });

    // 2. Most important skills (All that match the career's max weight)
    // 3. Development plans for those specific most important skills
    c.skills.forEach(s => {
      const w = importanceWeights[s.importance] ?? -1;
      if (w === maxWeight && maxWeight !== -1) {
        // Item 2: Important Skills
        importantSkills.push({
          career: c.name,
          skillName: s.name,
          importanceValue: s.target / 5,
          currentValue: s.current / 5,
          rawCurrent: s.current,
          rawTarget: s.target,
          importanceLabel: s.importance
        });

        // Item 3: Development of these specific important skills
        if (s.hasPlan) {
          const title = s.planTitle && s.planTitle !== "-" ? s.planTitle : "ยังไม่มีชื่อแผน";
          const channel = s.planChannel && s.planChannel !== "-" ? s.planChannel : "-";
          const type = s.developmentName && s.developmentName !== "-" ? s.developmentName : "ไม่ระบุประเภท";
          developmentSkills.push({
            career: c.name,
            skillName: s.name,
            devType: type,
            methodAndEvidence: `${title}: ${channel}`
          });
        } else {
          // If no plan, still show the skill but with "-" per initial requirement
          developmentSkills.push({
            career: c.name,
            skillName: s.name,
            devType: "-",
            methodAndEvidence: "-: -"
          });
        }
      }
    });
  });

  return {
    readinessList: summaries,
    importantSkills: importantSkills,
    developmentSkills: developmentSkills
  };
});

const eduStatusDisplay = computed(() => {
  const p = profile.value;
  if (p.is_graduate === "1" || p.is_graduate === 1) {
    return p.date ? `จบการศึกษาเมื่อปี ${p.date}` : 'จบการศึกษาแล้ว';
  } else if (p.year) {
    return `กำลังศึกษาชั้นปีที่ ${p.year}`;
  }
  return 'ไม่ระบุสถานะ';
});

const aboutMeText = computed(() => {
  const p = profile.value;
  if (p.external_info) return p.external_info;

  const parts = [];

  // 1. Basic Background & Education
  const provinceText = p.province ? `ฉันมาจากจังหวัด ${p.province}` : '';
  const instText = p.institution ? ` ปัจจุบันกำลังศึกษาอยู่ที่ ${p.institution}` : '';
  const facText = p.faculty_name ? ` ในคณะ ${p.faculty_name}` : '';
  const depText = p.department_name ? ` สาขา ${p.department_name}` : '';

  let eduStatus = '';
  if (p.is_graduate === "1" || p.is_graduate === 1) {
    eduStatus = p.date ? ` (จบการศึกษาเมื่อปี ${p.date})` : ' (จบการศึกษาแล้ว)';
  } else if (p.year) {
    eduStatus = ` (ปัจจุบันอยู่ชั้นปีที่ ${p.year})`;
  }

  if (provinceText || instText) {
    parts.push(`${provinceText}${instText}${facText}${depText}${eduStatus}`);
  }

  // 2. Disability Info (If any)
  if (p.is_disability === "1" || p.is_disability === 1) {
    const disType = p.disability_name ? `ประเภท${p.disability_name}` : '';
    const disDesc = p.dis_description ? ` (${p.dis_description})` : '';
    parts.push(`ฉันเป็นผู้มีความบกพร่องทางร่างกาย${disType}${disDesc}`);
  }

  // 3. Skills, Interests & Challenges
  const skillText = p.skill ? `ฉันมีความชื่นชอบและถนัดในด้าน ${p.skill}` : '';
  const subjectText = p.favorite_subject ? ` โดยมีวิชาที่ชอบเป็นพิเศษคือ ${p.favorite_subject}` : '';
  const unfavText = p.unfavorite_subject ? ` และมีวิชาที่ไม่ถนัดนักคือ ${p.unfavorite_subject}` : '';

  if (skillText || subjectText || unfavText) {
    parts.push(`${skillText}${subjectText}${unfavText}`);
  }

  // 4. Activities
  if (p.favorite_activity) {
    parts.push(`ในยามว่างฉันมักจะทำกิจกรรมคือ ${p.favorite_activity}`);
  }

  // 5. Goals
  const dreamText = p.dream_career ? `ในอนาคตฉันตั้งเป้าหมายอยากเป็น ${p.dream_career}` : '';
  const regionText = p.preferred_region ? ` และมีความสนใจที่จะทำงานในพื้นที่ ${p.preferred_region}` : '';
  if (dreamText || regionText) {
    parts.push(`${dreamText}${regionText} เพื่อนำความรู้ความสามารถมาพัฒนาสายอาชีพที่เลือกไว้`);
  }

  // 6. Additional Info as falling back
  if (parts.length === 0) {
    return p.additional_info || "ยังไม่มีการระบุข้อมูลแนะนำตัว";
  }

  return parts.join(' ') + (p.additional_info ? ` [ข้อมูลเพิ่มเติม: ${p.additional_info}]` : '');
});

// URLs
const urls = {
  rest_api: "",
  chat_url: getChatUrl(store)
};

const initUrls = () => {
  urls.rest_api = getRestApiUrl(store);
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    // 1. Fetch Profile
    const resProf = await axios.get(`${urls.rest_api}/members/${member_id}/individual`);
    console.log("Dashboard Profile Data:", resProf.data);
    profile.value = resProf.data || {};

    // Handle profile image path (if exists in database or static)
    if (profile.value.image_path) {
      if (profile.value.image_path.startsWith('http')) {
        profileImage.value = profile.value.image_path;
      } else {
        profileImage.value = `${urls.rest_api}/${profile.value.image_path}`;
      }
    }

    // 2. Fetch Base Data (Assessments, Plans, Qualifications)
    const [resAssess, resPlans, resQA] = await Promise.all([
      axios.get(`${urls.rest_api}/self-assessments`),
      axios.get(`${urls.rest_api}/plans`),
      axios.get(`${urls.rest_api}/qa-plan-careers`)
    ]);

    const assessments = resAssess.data || [];
    const plans = resPlans.data || [];
    const quals = resQA.data || [];

    // Group assessments by qa_id (latest only)
    const groupedAssess = {};
    assessments.forEach(a => {
      const qid = a.qa_plan_career_id;
      if (!groupedAssess[qid] || new Date(a.self_assessment_date) > new Date(groupedAssess[qid].self_assessment_date)) {
        groupedAssess[qid] = a;
      }
    });

    // Group plans by qa_id
    const groupedPlans = {};
    plans.forEach(p => {
      groupedPlans[p.qa_plan_career_id] = p; // Keep full object
    });

    // 3. Process into Careers Structure
    const careersMap = {};
    quals.forEach(q => {
      if (!careersMap[q.plan_career_id]) {
        careersMap[q.plan_career_id] = {
          id: q.plan_career_id,
          name: q.career_name,
          skills: []
        };
      }
      const assess = groupedAssess[q.qa_plan_career_id];
      const planDetails = groupedPlans[q.qa_plan_career_id];
      careersMap[q.plan_career_id].skills.push({
        id: q.qa_plan_career_id,
        name: q.qualification_name,
        importance: q.level_description,
        target: Number(q.target_value) || 5,
        current: assess ? Number(assess.perform_value) : 0,
        hasPlan: !!planDetails,
        developmentName: planDetails ? planDetails.development_name : "-",
        planTitle: planDetails ? planDetails.plan_title : "-",
        planChannel: planDetails ? planDetails.plan_channel : "-"
      });
    });

    careerAnalyses.value = Object.values(careersMap);

  } catch (e) {
    console.error("Dashboard Fetch Error:", e);
  } finally {
    isLoading.value = false;
  }
};

const runAnalysis = () => {
  // Logic replaced by automatic computed property 'analysis'
  console.log("Programmatic analysis updated.");
};

onMounted(async () => {
  initUrls();
  await fetchData();
});
</script>

<style lang="scss" scoped>
.dashboard-bg {
  background-color: #f7f3f9;
  font-family: 'Sarabun', 'Roboto', sans-serif;
}

.dashboard-container {
  background: white;
  max-width: 1000px;
  width: 100%;
  min-height: 1200px;
  margin: 40px auto;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  // Decorative blobs (Inspired by modern resume designs)
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    left: -100px;
    width: 300px;
    height: 300px;
    background: #74c58855;
    border-radius: 50%;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 250px;
    height: 250px;
    background: #d1b4c355;
    clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 25% 100%, 0% 50%);
    z-index: 0;
  }
}

.left-column {
  background: white;
  z-index: 1;
}

.right-column {
  background: white;
  border-left: 1px solid #f0f0f0;
  z-index: 1;
}

.display-name {
  font-size: 4.5rem;
  font-weight: 700;
  line-height: 1.1;
  color: #3d2b1f;
  margin: 0;
  text-transform: uppercase;
}

.job-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #5d8a7c;
  margin: 15px 0 0 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.accent-line {
  width: 120px;
  height: 4px;
  background: #d1b4c3;
  margin-top: 30px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #3d2b1f;
  margin-bottom: 25px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.about-text {
  line-height: 1.7;
  color: #666;
  font-size: 1.1rem;
}

.skill-name {
  font-size: 1.05rem;
  font-weight: 500;
  color: #444;
}

// Custom Progress Bars matching the image style
.custom-progress-container {
  height: 12px;
  width: 100%;
  background: transparent;
  position: relative;
  display: flex;
  align-items: center;
}

.progress-bar-bg {
  position: absolute;
  height: 100%;
  background: #f0f0f0;
  border-radius: 0;
}

.progress-bar-fill {
  position: absolute;
  height: 100%;
  background: #d1b4c3; // Pinkish color from image
  transition: width 1s ease-in-out;
}

.progress-bar-remaining {
  position: absolute;
  height: 100%;
  width: 15px; // The small segment at the end
  background: #1a4d44; // Dark green color from image
  margin-left: -2px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #444;

  .q-icon {
    color: #3d2b1f;
    background: #f0f0f0;
    padding: 8px;
    border-radius: 50%;
  }
}

.edu-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #3d2b1f;
}

.edu-sub {
  color: #666;
  font-style: italic;
}

.p-box {
  margin-top: 50px;
}

.profile-image-section {
  margin-bottom: 40px;
}

.profile-image-container {
  padding: 8px;
  background: white;
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 4px solid #fff;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }
}

.btn-edit-photo {
  transition: all 0.3s ease;
  border: 3px solid white;
}

.hover-scale:hover {
  transform: scale(1.1);
}

.ai-analysis-content {
  border-left: 4px solid #74c588;
  line-height: 1.6;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}

.analysis-card {
  border: 1px solid transparent;
}

.border-green {
  border-color: #c8e6c9 !important;
}

.border-orange {
  border-color: #ffe0b2 !important;
}

.border-blue {
  border-color: #bbdefb !important;
}

.priority-item {
  border-left: 2px solid #2196f3;
  padding-left: 10px;
}

.border-left-blue {
  border-left: 2px solid #2196f3;
  margin-top: 4px;
}

.career-dev-item {
  padding-bottom: 8px;
  border-bottom: 1px solid #e3f2fd;
}

.career-dev-item:last-child {
  border-bottom: none;
}

@media (max-width: 600px) {
  .display-name {
    font-size: 3rem;
  }

  .dashboard-container {
    margin: 0;
  }

  .right-column {
    border-left: none;
    border-top: 1px solid #f0f0f0;
  }
}

.dynamic-scroll-area {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: #cfd8dc transparent;
}

.dynamic-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.dynamic-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.dynamic-scroll-area::-webkit-scrollbar-thumb {
  background-color: #cfd8dc;
  border-radius: 10px;
  border: 2px solid transparent;
}

.dynamic-scroll-area::-webkit-scrollbar-thumb:hover {
  background-color: #b0bec5;
}

// Export specific styles
.is-exporting {
  .dashboard-container {
    margin: 0 !important;
    box-shadow: none !important;
    max-width: none !important;
    width: 1000px !important; // Keep ratio
    border-radius: 0 !important;
  }

  .dynamic-scroll-area {
    max-height: none !important;
    overflow: visible !important;
  }

  // Hide scrollbars during export
  ::-webkit-scrollbar {
    display: none;
  }
}
</style>
