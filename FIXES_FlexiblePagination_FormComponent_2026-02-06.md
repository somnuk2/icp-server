# สรุปการปรับปรุงการแสดงผลจำนวนแถวในตาราง FormComponent.vue

## วันที่: 2026-02-06 (อัพเดทครั้งที่ 3)

## 🎯 วัตถุประสงค์
ปรับปรุงตารางให้สามารถย่อ/ขยายการแสดงผลได้ตามจำนวนข้อมูลจริง พร้อมปุ่มควบคุมที่ใช้งานง่าย

---

## ✨ ฟีเจอร์ใหม่ที่เพิ่มเข้ามา

### 1. **ปุ่มแสดงทั้งหมด/ย่อตาราง** 🆕

#### ปุ่มแสดงทั้งหมด (Show All)
```vue
<q-btn
  v-if="pagination.rowsPerPage !== 0"
  dense
  flat
  color="primary"
  icon="unfold_more"
  label="แสดงทั้งหมด"
  @click="showAllRows"
  size="sm">
  <q-tooltip>แสดงข้อมูลทั้งหมด</q-tooltip>
</q-btn>
```
- ✅ แสดงเมื่ออยู่ในโหมดแบ่งหน้า
- ✅ คลิกเพื่อแสดงข้อมูลทั้งหมดในหน้าเดียว
- ✅ มี icon `unfold_more` และ tooltip

#### ปุ่มย่อตาราง (Collapse)
```vue
<q-btn
  v-else
  dense
  flat
  color="primary"
  icon="unfold_less"
  label="ย่อตาราง"
  @click="collapseTable"
  size="sm">
  <q-tooltip>แสดงแบบแบ่งหน้า</q-tooltip>
</q-btn>
```
- ✅ แสดงเมื่ออยู่ในโหมดแสดงทั้งหมด
- ✅ คลิกเพื่อกลับไปแบ่งหน้า (20 รายการต่อหน้า)
- ✅ มี icon `unfold_less` และ tooltip

### 2. **แสดงจำนวนข้อมูลทั้งหมด** 🆕

#### Chip แสดงจำนวน
```vue
<q-chip 
  color="primary" 
  text-color="white" 
  icon="people">
  {{ individuals1.length }} รายการ
</q-chip>
```
- ✅ แสดงจำนวนข้อมูลทั้งหมดแบบ real-time
- ✅ มี icon `people` 
- ✅ สีน้ำเงิน (primary) พร้อมตัวอักษรสีขาว

#### Title แบบ Dynamic
```vue
:title="`ข้อมูลส่วนตัว (${individuals1.length} รายการ)`"
```
- ✅ แสดงจำนวนในหัวตาราง
- ✅ อัพเดทอัตโนมัติเมื่อข้อมูลเปลี่ยน

### 3. **Pagination ที่ยืดหยุ่น** 🆕

#### Rows Per Page Options
```javascript
:rows-per-page-options="[0, 10, 20, 30, 50, 100]"
```
- ✅ **0** = แสดงทั้งหมด
- ✅ 10, 20, 30, 50, 100 = จำนวนแถวต่อหน้า
- ✅ ค่าเริ่มต้น 20 แถว

#### Custom Pagination Label
```javascript
getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
  if (this.pagination.rowsPerPage === 0) {
    return `แสดงทั้งหมด ${totalRowsNumber} รายการ`;
  }
  return `แสดง ${firstRowIndex}-${endRowIndex} จาก ${totalRowsNumber} รายการ`;
}
```
- ✅ แสดงข้อความภาษาไทย
- ✅ เปลี่ยนข้อความตามโหมดการแสดงผล

---

## 📊 การเปลี่ยนแปลงในโค้ด

### 1. Template (HTML)

#### Before:
```vue
<q-table 
  title="ข้อมูลส่วนตัว"
  :pagination="{ rowsPerPage: 20 }"
  :rows-per-page-options="[10, 20, 30, 50, 100, 0]"
  :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => {
    return `แสดง ${firstRowIndex}-${endRowIndex} จาก ${totalRowsNumber} รายการ`
  }">
```

#### After:
```vue
<q-table 
  :title="`ข้อมูลส่วนตัว (${individuals1.length} รายการ)`"
  v-model:pagination="pagination"
  :rows-per-page-options="[0, 10, 20, 30, 50, 100]"
  :pagination-label="getPaginationLabel">
  
  <!-- ปุ่มควบคุมด้านบน -->
  <template v-slot:top-left>
    <div class="row q-gutter-sm items-center">
      <div class="text-h6">ข้อมูลส่วนตัว</div>
      <q-chip color="primary" text-color="white" icon="people">
        {{ individuals1.length }} รายการ
      </q-chip>
      <q-btn v-if="pagination.rowsPerPage !== 0" ... @click="showAllRows">
        แสดงทั้งหมด
      </q-btn>
      <q-btn v-else ... @click="collapseTable">
        ย่อตาราง
      </q-btn>
    </div>
  </template>
```

### 2. Data (JavaScript)

#### เพิ่ม pagination object:
```javascript
data() {
  return {
    // ... existing data
    pagination: ref({
      sortBy: 'individual_id',
      descending: false,
      page: 1,
      rowsPerPage: 20,  // ค่าเริ่มต้น
    }),
  };
}
```

### 3. Methods (JavaScript)

#### เพิ่ม 3 methods ใหม่:

**1. getPaginationLabel()**
```javascript
getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
  if (this.pagination.rowsPerPage === 0) {
    return `แสดงทั้งหมด ${totalRowsNumber} รายการ`;
  }
  return `แสดง ${firstRowIndex}-${endRowIndex} จาก ${totalRowsNumber} รายการ`;
}
```
- แสดง label ที่เหมาะสมตามโหมด

**2. showAllRows()**
```javascript
showAllRows() {
  this.pagination.rowsPerPage = 0;
  this.$q.notify({
    message: 'แสดงข้อมูลทั้งหมด ' + this.individuals1.length + ' รายการ',
    color: 'info',
    icon: 'unfold_more',
    position: 'top',
    timeout: 1500,
  });
}
```
- ตั้งค่า rowsPerPage = 0 เพื่อแสดงทั้งหมด
- แจ้งเตือนผู้ใช้

**3. collapseTable()**
```javascript
collapseTable() {
  this.pagination.rowsPerPage = 20;
  this.pagination.page = 1;
  this.$q.notify({
    message: 'แสดงแบบแบ่งหน้า 20 รายการต่อหน้า',
    color: 'info',
    icon: 'unfold_less',
    position: 'top',
    timeout: 1500,
  });
}
```
- ตั้งค่า rowsPerPage = 20 และกลับไปหน้าแรก
- แจ้งเตือนผู้ใช้

### 4. CSS (SASS)

#### เพิ่ม transitions และ styles:
```sass
.my-sticky-header-table
  max-height: 600px
  transition: max-height 0.3s ease  // เพิ่ม transition
  
  // เมื่อแสดงทั้งหมด ให้ขยายความสูงได้
  &.show-all
    max-height: none
  
  // สไตล์สำหรับปุ่มควบคุม
  .q-table__top
    padding: 12px 16px
    
    .q-chip
      font-weight: 600
      
    .q-btn
      transition: all 0.2s ease
      
      &:hover
        transform: translateY(-2px)
        box-shadow: 0 2px 8px rgba(0,0,0,0.15)
  
  // Responsive สำหรับปุ่มและ chip
  @media (max-width: 768px)
    .q-table__top
      padding: 8px
      
      .text-h6
        font-size: 16px
        
      .q-chip
        font-size: 11px
        padding: 4px 8px
        
      .q-btn
        font-size: 11px
        padding: 4px 8px
```

---

## 🎨 การทำงานของฟีเจอร์

### Flow การแสดงผล:

#### โหมดแบ่งหน้า (Default)
```
1. ตารางแสดง 20 รายการต่อหน้า
2. แสดงปุ่ม "แสดงทั้งหมด"
3. Pagination label: "แสดง 1-20 จาก 100 รายการ"
4. มี pagination controls ด้านล่าง
```

#### โหมดแสดงทั้งหมด
```
1. คลิกปุ่ม "แสดงทั้งหมด"
2. แสดง notification "แสดงข้อมูลทั้งหมด 100 รายการ"
3. ตารางแสดงข้อมูลทั้งหมดในหน้าเดียว
4. แสดงปุ่ม "ย่อตาราง"
5. Pagination label: "แสดงทั้งหมด 100 รายการ"
6. ซ่อน pagination controls
```

#### กลับโหมดแบ่งหน้า
```
1. คลิกปุ่ม "ย่อตาราง"
2. แสดง notification "แสดงแบบแบ่งหน้า 20 รายการต่อหน้า"
3. กลับไปหน้าแรก (page 1)
4. แสดง 20 รายการต่อหน้า
5. แสดงปุ่ม "แสดงทั้งหมด"
```

---

## 📋 ตัวอย่างการใช้งาน

### Scenario 1: ข้อมูลน้อย (< 20 รายการ)
```
- แสดงข้อมูลทั้งหมดในหน้าเดียว
- ยังคงมีปุ่ม "แสดงทั้งหมด" (ใช้งานได้)
- Pagination label: "แสดง 1-15 จาก 15 รายการ"
```

### Scenario 2: ข้อมูลปานกลาง (20-100 รายการ)
```
- แสดง 20 รายการต่อหน้า (default)
- คลิก "แสดงทั้งหมด" → แสดงทั้งหมดในหน้าเดียว
- คลิก "ย่อตาราง" → กลับไปแบ่งหน้า
```

### Scenario 3: ข้อมูลมาก (> 100 รายการ)
```
- แสดง 20 รายการต่อหน้า (default)
- สามารถเลือก 50 หรือ 100 รายการต่อหน้า
- คลิก "แสดงทั้งหมด" → แสดงทั้งหมด (อาจช้า)
- แนะนำให้ใช้ filter ก่อนแสดงทั้งหมด
```

---

## 🎯 ประโยชน์ที่ได้รับ

### 1. ความยืดหยุ่น
- ✅ ผู้ใช้เลือกได้ว่าจะดูแบบแบ่งหน้าหรือทั้งหมด
- ✅ สลับโหมดได้ง่ายด้วยปุ่มเดียว
- ✅ มีตัวเลือก pagination หลากหลาย

### 2. UX ที่ดีขึ้น
- ✅ แสดงจำนวนข้อมูลชัดเจน
- ✅ มี notification แจ้งเตือนเมื่อเปลี่ยนโหมด
- ✅ ปุ่มมี tooltip อธิบายการใช้งาน
- ✅ Icon ที่เข้าใจง่าย (unfold_more/unfold_less)

### 3. Performance
- ✅ Default แสดง 20 รายการ (โหลดเร็ว)
- ✅ แสดงทั้งหมดเมื่อต้องการเท่านั้น
- ✅ มี transition ที่นุ่มนวล

### 4. Accessibility
- ✅ ปุ่มมี label ชัดเจน
- ✅ มี tooltip สำหรับผู้ใช้ใหม่
- ✅ Responsive บนหน้าจอเล็ก

---

## 🧪 การทดสอบที่แนะนำ

### 1. ทดสอบปุ่มแสดงทั้งหมด
- ✅ คลิกปุ่ม "แสดงทั้งหมด"
- ✅ ตรวจสอบว่าแสดงข้อมูลทั้งหมด
- ✅ ตรวจสอบว่ามี notification
- ✅ ตรวจสอบว่าปุ่มเปลี่ยนเป็น "ย่อตาราง"
- ✅ ตรวจสอบ pagination label

### 2. ทดสอบปุ่มย่อตาราง
- ✅ คลิกปุ่ม "ย่อตาราง"
- ✅ ตรวจสอบว่ากลับไปหน้าแรก
- ✅ ตรวจสอบว่าแสดง 20 รายการ
- ✅ ตรวจสอบว่ามี notification
- ✅ ตรวจสอบว่าปุ่มเปลี่ยนเป็น "แสดงทั้งหมด"

### 3. ทดสอบ Pagination Manual
- ✅ เลือก "แสดงทั้งหมด" จาก dropdown
- ✅ เลือก 10, 20, 30, 50, 100 รายการ
- ✅ ตรวจสอบว่า pagination label ถูกต้อง

### 4. ทดสอบกับข้อมูลต่างๆ
- ✅ ข้อมูล 0 รายการ
- ✅ ข้อมูล 5 รายการ (น้อยกว่า 20)
- ✅ ข้อมูล 50 รายการ
- ✅ ข้อมูล 200 รายการ (มาก)

### 5. ทดสอบ Responsive
- ✅ ทดสอบบนหน้าจอขนาดต่างๆ
- ✅ ตรวจสอบว่าปุ่มและ chip ปรับขนาด
- ✅ ตรวจสอบว่า layout ไม่แตก

### 6. ทดสอบ Filter + Show All
- ✅ ใช้ filter ค้นหาข้อมูล
- ✅ คลิก "แสดงทั้งหมด"
- ✅ ตรวจสอบว่าแสดงเฉพาะข้อมูลที่ filter แล้ว

---

## 📊 สรุปการเปลี่ยนแปลง

| ฟีเจอร์ | Before | After |
|---------|--------|-------|
| ปุ่มแสดงทั้งหมด | ❌ | ✅ |
| ปุ่มย่อตาราง | ❌ | ✅ |
| แสดงจำนวนรายการ | ใน title | ✅ Chip + Title |
| Pagination Options | [10, 20, 30, 50, 100, 0] | [0, 10, 20, 30, 50, 100] |
| Default Rows | 20 | 20 |
| Pagination Label | Static function | Dynamic method |
| Notifications | ❌ | ✅ |
| Tooltips | ❌ | ✅ |
| Transitions | ❌ | ✅ |
| Responsive Buttons | ❌ | ✅ |

---

## ✅ สรุป

**ตารางได้รับการปรับปรุงให้ยืดหยุ่นและใช้งานง่ายขึ้นมาก!**

### ฟีเจอร์หลัก:
- ✅ ปุ่มแสดงทั้งหมด/ย่อตาราง
- ✅ แสดงจำนวนข้อมูลแบบ real-time
- ✅ Pagination ที่ยืดหยุ่น (0, 10, 20, 30, 50, 100)
- ✅ Notifications แจ้งเตือน
- ✅ Tooltips อธิบายการใช้งาน
- ✅ Smooth transitions
- ✅ Responsive design

### การใช้งาน:
1. 📊 ดูจำนวนข้อมูลจาก chip
2. 🔍 ใช้ filter ค้นหาข้อมูล (ถ้าต้องการ)
3. 📖 คลิก "แสดงทั้งหมด" เพื่อดูข้อมูลทั้งหมด
4. 📑 คลิก "ย่อตาราง" เพื่อกลับไปแบ่งหน้า
5. ⚙️ หรือเลือกจำนวนแถวจาก dropdown

**พร้อมใช้งานแล้ว!** 🚀


