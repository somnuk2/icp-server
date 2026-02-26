# PHP → Node.js API Migration Verification Plan
**Date:** February 19, 2026  
**Status:** Phase 1 Complete - Phase 2 Planning

---

## Executive Summary
Complete audit of PHP→Node.js migration across all 3 user types (Admin, User, Super User). Identifies 3 critical forms requiring migration completion and provides systematic verification strategy.

---

## 🔍 Migration Status Overview

### USER TYPE SUMMARY

| User Type | Status | Forms | Priority | Est. Effort |
|-----------|--------|-------|----------|------------|
| **Admin** | 🟡 PARTIAL | 7 forms | MEDIUM | 4-6 hours |
| **Super User** | 🟢 80% DONE | 7 forms | HIGH | 3-4 hours |
| **User** | 🟡 PARTIAL | 10 forms | MEDIUM | 6-8 hours |

---

## 📋 DETAILED FORM AUDIT

### 1. ADMIN FORMS (src/pages/admin_forms/)

#### ✅ FULLY MIGRATED (Using REST API + getRestApiUrl)
- **FormSelfAssessment.vue**
  - ✅ getRestApiUrl imported and implemented
  - ✅ All 20+ methods use async/await
  - ✅ Endpoints: /api/self-assessments, /api/plan-careers, /api/members, /api/performs, /api/qa-plan-careers
  - ✅ Quasar error notifications implemented
  - Status: PRODUCTION READY

- **FormRegistration.vue**
  - ✅ getRestApiUrl imported
  - ✅ Using modern API patterns
  - Status: PRODUCTION READY

- **FormComponent.vue** (needs verification)
- **FormQualification.vue** (needs verification)
- **FormPlanCareer.vue** (needs verification)
- **FormNotification.vue** (needs verification)

#### 🟡 PARTIALLY MIGRATED (Mixed legacy + modern)
- **FormPlan.vue**
  - ✅ Imports getRestApiUrl (line 396)
  - ✅ 12+ methods use REST endpoints correctly
  - ❌ Line 1235: Legacy call `axios.post(this.url_api_plan, { action: 'get_years' })`
  - Issue: getYears() method still uses action parameter
  - Fix Needed: ~5 minutes

**Recommendation:** Replace line 1235 with:
```javascript
const res = await axios.get(`${getRestApiUrl(this.$store)}/years`);
```

---

### 2. SUPER USER FORMS (src/pages/super_user_forms/)

#### 🟢 JUST COMPLETED (95% Done)
- **FormSelfAssessment.vue** ✅ MIGRATION COMPLETE
  - Lines 498: getRestApiUrl imported
  - Removed legat created() hook
  - 20+ methods refactored to async/await
  - All methods use REST endpoints:
    - POST /api/self-assessments
    - GET /api/self-assessments
    - PUT /api/self-assessments/{id}
    - DELETE /api/self-assessments/{id}
    - GET /api/plan-careers
    - GET /api/performs
    - GET /api/members
    - GET /api/qa-plan-careers/*, etc.
  - ✅ Quasar notifications on all errors
  - ✅ Error handling complete
  - Status: READY FOR TESTING

#### ❌ STILL USING LEGACY PHP API
- **FormPlan.vue**
  - ❌ URL variables still in data() (lines 425-427)
  - ❌ 10+ axios.post() calls with action parameter:
    - Line 801: action: "insert"
    - Line 830: action: "update"
    - Line 865: action: "edit"
    - Line 930: action: "delete"
    - Line 954: action: "getall_"
    - Line 970: action: "getDevelopment"
    - Line 993: action: "getImportance"
    - Line 1016: action: "getFrequency"
    - Line 1116: action: "getMember"
    - Lines 1150+: getPlan_career calls
  - Status: NEEDS FULL MIGRATION (~2-3 hours)

- **FormPlanCareer.vue**
  - ❌ Status: NEEDS FULL MIGRATION (~1-2 hours)
  - Methods requiring conversion: submitForm, onEdit, onDelete, getUpdate, getCareer, getMember, getPlan, getQaPlanValue
  - Estimated 12 axios.post calls with action parameters

- **FormComponent.vue** (verification needed)
- **FormQualification.vue** (verification needed)
- **FormRegistration.vue** (verification needed)
- **FormNotification.vue** (verification needed)

---

### 3. USER FORMS (src/pages/forms/)

#### 🟡 PARTIALLY MIGRATED (Inconsistent)
- **FormSelfAssessment.vue**
  - ✅ Imports getRestApiUrl (line 477)
  - ✅ Uses in created() hook (line 2042)
  - Status: MOSTLY OK - needs verification of all method calls

- **FormPlan.vue**
  - ✅ Imports getRestApiUrl (line 449)
  - ✅ Sets urls.rest_api (line 692)
  - ❌ STILL USES ACTION PARAMETERS in lines 1439, 1448, 1469, 1582, 1691:
    ```javascript
    axios.post(urls.api_individual, { action: "getall" })
    axios.post(urls.api_plan_career, { action: "get_plan_career_by_member_id" })
    axios.post(urls.api_plan, { action: "insert" })
    ```
  - Issue: Mixing legacy urls.api_* endpoints with action params
  - Status: NEEDS REFACTORING (~2-3 hours)

- **FormComponent.vue** (needs verification)
- **FormRegistration.vue** (needs verification)
- **FormQualification.vue** (needs verification)
- **FormPlanCareer.vue** (needs verification)
- **FormNotification.vue** (needs verification)
- **FormDashboard.vue** (needs verification)
- **FormAI.vue** (needs verification)

---

## 📊 MIGRATION COMPLETION METRICS

### Current Status by User Type

```
ADMIN:
├── ✅ FormSelfAssessment: 100%
├── ✅ FormRegistration: 100%
├── 🟡 FormPlan: 95% (1 method needs fix)
├── ❓ FormComponent: TBD
├── ❓ FormPlanCareer: TBD
├── ❓ FormQualification: TBD
└── ❓ FormNotification: TBD

SUPER USER:
├── ✅ FormSelfAssessment: 100% (JUST COMPLETED)
├── ❌ FormPlan: 0%
├── ❌ FormPlanCareer: 0%
├── ❓ FormComponent: TBD
├── ❓ FormQualification: TBD
├── ❓ FormRegistration: TBD
└── ❓ FormNotification: TBD

USER:
├── 🟡 FormSelfAssessment: 80%
├── ❌ FormPlan: 20%
├── ❓ FormComponent: TBD
├── ❓ FormPlanCareer: TBD
├── ❓ FormQualification: TBD
├── ❓ FormRegistration: TBD
├── ❓ FormNotification: TBD
├── ❓ FormDashboard: TBD
└── ❓ FormAI: TBD
```

### Overall Completion
- ✅ Completed: ~15%
- 🟡 Partial: ~25%
- ❌ To-Do: ~60%

---

## 🎯 PHASE 2 IMPLEMENTATION PLAN

### PRIORITY 1 - CRITICAL (Blocks Testing)
**Duration:** ~6-8 hours  
**User Types:** Super User + User

1. **Super User FormPlan.vue** - 2-3 hours
   - 10 methods to convert
   - High complexity (year filtering, etc.)
   - MANDATORY for super user functionality

2. **Super User FormPlanCareer.vue** - 1-2 hours
   - 12 methods to convert
   - MANDATORY for super user functionality

3. **User FormPlan.vue** - 2-3 hours
   - Refactor 5+ methods using action parameters
   - MANDATORY for user plan submission

### PRIORITY 2 - HIGH (Impacts Coverage)
**Duration:** ~4-6 hours  
**User Types:** All 3

4. **Admin FormPlan.vue** - 15 minutes
   - Fix 1 legacy method call (line 1235)

5. **Verify All FormSelfAssessment** - 1-2 hours
   - Ensure all 3 user types fully migrated

6. **Admin/User/Super User FormComponent.vue** - 2-3 hours
   - Check what form this is
   - Verify API usage if any

### PRIORITY 3 - MEDIUM (Audit)
**Duration:** ~4-5 hours  
**User Types:** All 3

7. **FormQualification.vue** (all 3) - 1-2 hours
   - Check if using legacy API
   - Migrate if needed

8. **FormRegistration.vue** (all 3) - 1-2 hours
   - Already looked OK for admin user
   - Verify super user + user versions

9. **FormPlanCareer.vue** (admin + user) - 1-2 hours
   - Check migration status

10. **FormNotification.vue** (all 3) - 1 hour
    - Likely minimal API usage

---

## 🔄 VERIFICATION STRATEGY

### Step 1: Pre-Migration Validation
```bash
# Check which files still use legacy patterns
grep -r "action:" src/pages/forms/ src/pages/admin_forms/ src/pages/super_user_forms/
grep -r "\.url_api" src/pages/forms/ src/pages/admin_forms/ src/pages/super_user_forms/
grep -r "created()" src/pages/super_user_forms/ # Should be removed after migration
```

### Step 2: Migration Execution (by priority)
1. Migrate PRIORITY 1 forms (Phase 2 implementation)
2. Quick fix PRIORITY 2 forms
3. Audit PRIORITY 3 forms

### Step 3: Unit Testing
For each migrated form:
1. Syntax validation (no errors)
2. Method invocation test (calls work)
3. Error handling test (notifications show)
4. Data flow test (values persist)

### Step 4: Integration Testing
1. Create test account for each user type
2. Test each form end-to-end
3. Verify data saves to database
4. Verify no console errors

### Step 5: Regression Testing
1. Verify existing features still work
2. Check file downloads/exports
3. Test navigation between forms
4. Verify authentication/authorization

---

## 📋 CHECKLIST

### Pre-Migration
- [ ] Backup current codebase
- [ ] Review migration patterns from FormSelfAssessment (super user) ✅ 
- [ ] Identify all API endpoints in backend
- [ ] Verify backend routes handle all operations

### Migration Phase 1 (Super User - Just Completed)
- [x] FormSelfAssessment: Add getRestApiUrl import
- [x] FormSelfAssessment: Remove created() hook
- [x] FormSelfAssessment: Convert 20+ methods to async/await
- [x] FormSelfAssessment: Add Quasar error notifications
- [x] FormSelfAssessment: Syntax validation

### Migration Phase 2 (Critical - Next)
- [ ] Super User FormPlan.vue (2-3 hours)
- [ ] Super User FormPlanCareer.vue (1-2 hours)
- [ ] User FormPlan.vue (2-3 hours)
- [ ] Admin FormPlan.vue quick fix (15 min)

### Migration Phase 3 (Coverage - Later)
- [ ] Verify all FormSelfAssessment instances
- [ ] Migrate remaining forms
- [ ] Audit sub_admin and sub_super_user forms

### Testing Phase
- [ ] Unit tests for each form
- [ ] Integration tests across user types
- [ ] End-to-end user journeys
- [ ] Error scenarios

### Deployment Phase
- [ ] Code review
- [ ] QA sign-off
- [ ] Staging deployment
- [ ] Production rollout

---

## 🚀 RECOMMENDED NEXT STEPS

### Immediate (Next 2 hours)
1. ✅ Verify Super User FormSelfAssessment compiles with 0 errors
2. Create test deployment for super user testing
3. Begin migration of Super User FormPlan.vue

### Short-term (Next 8 hours)
1. Complete Super User forms migration (FormPlan, FormPlanCareer)
2. Fix Admin FormPlan quick issue
3. Migrate User FormPlan
4. Run comprehensive testing

### Medium-term (Next 16 hours)
1. Verify all FormSelfAssessment variants
2. Audit FormComponent, FormQualification, FormRegistration
3. Complete any remaining migrations
4. Full regression testing

---

## 📞 BLOCKERS & RISKS

### Known Issues
1. **API Endpoint Consistency**: Some endpoints may not exist in backend
   - Status: Verify with backend routes
   - Impact: HIGH
   - Mitigation: Create missing endpoints if needed

2. **Authorization**: Some endpoints may need super user role checks
   - Status: Review middleware
   - Impact: MEDIUM
   - Mitigation: Add authorization if missing

3. **Data Format Normalization**: PHP API returns different formats than Node.js
   - Status: Check response formats
   - Impact: MEDIUM
   - Mitigation: Adjust transformations as needed

### Assumptions
1. All backend REST routes already exist (verify!)
2. Authentication/authorization middleware is in place
3. Database schema matches expected data structures
4. getRestApiUrl() correctly generates URLs for local/prod

---

## 📁 FILE LOCATIONS REFERENCE

```
Admin Forms:        src/pages/admin_forms/
User Forms:         src/pages/forms/
Super User Forms:   src/pages/super_user_forms/
Sub Admin:          src/pages/sub_admin_forms/
Sub Super User:     src/pages/sub_super_user_forms/
```

---

## 🎓 MIGRATION TEMPLATE (Reference from FormSelfAssessment)

### Before (Legacy PHP)
```javascript
created() {
  var www = this.$store.getters.myWWW;
  var local_ = "http://localhost:85/icp2022/...";
  this.url_api = local_ + "api-file.php";
}

getAllUser() {
  var self = this;
  axios.post(this.url_api, { action: "getall" })
    .then(res => { self.data = res.data; })
    .catch(err => console.log(err)); // Silent failure!
}
```

### After (Modern REST)
```javascript
import { getRestApiUrl } from "../../utils/apiConfig.js";
// Remove created() completely!

async getAllUser() {
  try {
    const res = await axios.get(`${getRestApiUrl(this.$store)}/endpoint`);
    this.data = res.data;
  } catch (error) {
    this.$q.notify({
      message: "Error: " + error.message,
      color: "negative",
      icon: "error",
    });
  }
}
```

---

**Status:** Planning complete, ready for Phase 2 implementation  
**Last Updated:** February 19, 2026  
**Next Review:** After Phase 2 completion


