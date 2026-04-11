<template>
  <q-page padding class="bg-grey-2">
    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-md-11">
        <q-card flat bordered class="no-shadow" style="border-radius: 8px;">
          <!-- Header Toolbar -->
          <q-card-section class="bg-primary text-white row items-center q-py-sm">
            <div class="text-h6 text-weight-bold">
              <q-icon name="grid_on" class="q-mr-sm" />
              จัดการข้อมูล Excel (Import / Export)
            </div>
            <q-space />
            <div class="q-gutter-sm">
              <input type="file" ref="fileInput" style="display: none" accept=".xlsx, .xls" @change="handleFileUpload" />
              <q-btn flat dense icon="upload_file" label="นำเข้า Excel" @click="$refs.fileInput.click()" />
              <q-btn flat dense icon="download" label="ส่งออก excel" @click="exportToExcel" />
              <q-btn flat dense icon="delete_sweep" label="ล้างข้อมูล" @click="clearTable" />
            </div>
          </q-card-section>

          <!-- Instructions -->
          <q-card-section class="bg-blue-1 q-py-xs text-caption text-blue-9">
            <q-icon name="info" class="q-mr-xs" />
            <b>คำแนะนำ:</b> สามารถพิมพ์สูตรได้โดยขึ้นต้นด้วยเครื่องหมาย <b>=</b> (เช่น <code>=A1+B1</code>) | ดับเบิลคลิกที่เซลล์เพื่อแก้ไข
          </q-card-section>

          <!-- Spreadsheet View -->
          <q-card-section class="q-pa-none scroll" style="max-height: 70vh;">
            <div class="table-container">
              <table class="spreadsheet-table">
                <thead>
                  <tr>
                    <th class="index-cell"></th>
                    <th v-for="(_, j) in cols" :key="'header' + j" class="header-cell">
                      {{ letters[j] }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, i) in rows" :key="i">
                    <td class="index-cell text-weight-bold">
                      {{ i + 1 }}
                    </td>
                    <td v-for="(__, j) in cols" :key="i + '-' + j" class="data-cell" :class="{
                      'cell-editing': isEditing(i, j),
                      'cell-formula': isFormula(i, j)
                    }" @dblclick="startEdit(i, j)">
                      <div v-if="isEditing(i, j)">
                        <input :ref="'input-' + i + '-' + j" v-model="raw_values[i][j]" @blur="stopEdit"
                          @keydown.enter.prevent="nextRow" @keydown.esc="stopEdit" class="cell-input" />
                      </div>
                      <div v-else class="cell-display">
                        {{ getDisplayValue(i, j) }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </q-card-section>

          <!-- Footer Status -->
          <q-card-section class="bg-grey-1 text-grey-7 row items-center q-py-xs">
            <div class="text-caption">แถว: {{ rows }} | คอลัมน์: {{ cols }}</div>
            <q-space />
            <div class="text-caption">การคำนวณ: {{ calculations }} ครั้ง</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, reactive, computed, nextTick } from "vue";
import { useQuasar } from "quasar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default {
  name: "ImportExcelPage",
  setup() {
    const $q = useQuasar();
    const rows = ref(30);
    const cols = ref(15); // ลดลงเพื่อความสวยงามในหน้าจอปกติ
    const editingCell = reactive({ i: null, j: null });
    const calculations = ref(0);

    const letters = Array(26)
      .fill(0)
      .map((_, i) => String.fromCharCode("A".charCodeAt(0) + i));

    // ฟังก์ชันสร้าง Table เปล่า
    const makeTable = (val = "") =>
      Array(rows.value)
        .fill(null)
        .map(() => Array(cols.value).fill(val));

    const raw_values = reactive(makeTable(""));
    const computed_values = reactive(makeTable(null));

    const asNumber = (val) => /^[0-9]+(\.[0-9]+)?$/.test(val) ? parseFloat(val) : val;

    const transpile = (str) => {
      let cellReplacer = (match, prepend, col, row) => {
        const colIdx = letters.indexOf(col);
        const rowIdx = parseInt(row) - 1;
        if (colIdx >= 0 && rowIdx >= 0 && rowIdx < rows.value && colIdx < cols.value) {
          return prepend + ` computed_values[${rowIdx}][${colIdx}].value `;
        }
        return match;
      };
      return str.replace(/(^|[^A-Z])([A-Z])([0-9]+)/g, cellReplacer);
    };

    const computedCellGenerator = (i, j) => {
      return computed(() => {
        nextTick(() => ++calculations.value);
        let raw = (raw_values[i][j] || "").toString().trim();
        if (!raw || raw[0] != "=") return asNumber(raw);

        let code = transpile(raw.substring(1));
        try {
          let fn = new Function(["computed_values"], `return ${code};`);
          return fn(computed_values);
        } catch (e) {
          return "#ERR";
        }
      });
    };

    // Initialize computed cells
    for (let i = 0; i < rows.value; ++i) {
      for (let j = 0; j < cols.value; ++j) {
        computed_values[i][j] = computedCellGenerator(i, j);
      }
    }

    // Actions
    const isEditing = (i, j) => editingCell.i === i && editingCell.j === j;
    const isFormula = (i, j) => (raw_values[i][j] || "").toString().startsWith("=");

    const startEdit = (i, j) => {
      editingCell.i = i;
      editingCell.j = j;
      nextTick(() => {
        const el = document.querySelector(`.cell-input`);
        if (el) el.focus();
      });
    };

    const stopEdit = () => {
      editingCell.i = null;
      editingCell.j = null;
    };

    const nextRow = () => {
      const nextI = editingCell.i + 1;
      const j = editingCell.j;
      stopEdit();
      if (nextI < rows.value) startEdit(nextI, j);
    };

    const getDisplayValue = (i, j) => {
      const val = computed_values[i][j].value;
      return val === null || val === undefined ? "" : val;
    };

    const clearTable = () => {
      $q.dialog({
        title: 'ยืนยัน',
        message: 'ต้องการล้างข้อมูลทั้งหมดในตารางใช่หรือไม่?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        for (let i = 0; i < rows.value; i++) {
          for (let j = 0; j < cols.value; j++) {
            raw_values[i][j] = "";
          }
        }
      });
    };

    // Excel Export
    const exportToExcel = async () => {
      try {
        $q.loading.show({ message: 'กำลังเตรียมไฟล์ Excel...' });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        for (let i = 0; i < rows.value; i++) {
          const rowData = [];
          for (let j = 0; j < cols.value; j++) {
            rowData.push(getDisplayValue(i, j));
          }
          worksheet.addRow(rowData);
        }

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `ICP_Export_${Date.now()}.xlsx`);
        $q.notify({ color: 'positive', message: 'ส่งออกไฟล์สำเร็จ', icon: 'check' });
      } catch (err) {
        $q.notify({ color: 'negative', message: 'เกิดข้อผิดพลาดในการส่งออก' });
      } finally {
        $q.loading.hide();
      }
    };

    // Excel Import
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        $q.loading.show({ message: 'กำลังนำเข้าข้อมูล...' });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file);
        const worksheet = workbook.getWorksheet(1);

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber <= rows.value) {
            row.eachCell((cell, colNumber) => {
              if (colNumber <= cols.value) {
                raw_values[rowNumber - 1][colNumber - 1] = cell.text;
              }
            });
          }
        });
        $q.notify({ color: 'positive', message: 'นำเข้าข้อมูลสำเร็จ', icon: 'check' });
      } catch (err) {
        $q.notify({ color: 'negative', message: 'ไม่สามารถอ่านไฟล์ได้' });
      } finally {
        $q.loading.hide();
        event.target.value = ""; // Clear input
      }
    };

    return {
      rows, cols, letters, raw_values, calculations,
      editingCell, isEditing, isFormula, startEdit, stopEdit, nextRow,
      getDisplayValue, clearTable, exportToExcel, handleFileUpload
    };
  }
};
</script>

<style scoped>
.table-container {
  overflow: auto;
  border: 1px solid #ddd;
}

.spreadsheet-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

.index-cell {
  background: #f1f3f4;
  width: 40px;
  text-align: center;
  border: 1px solid #ccc;
  font-size: 11px;
}

.header-cell {
  background: #f1f3f4;
  height: 25px;
  text-align: center;
  border: 1px solid #ccc;
  width: 100px;
}

.data-cell {
  border: 1px solid #eee;
  height: 25px;
  padding: 0;
  vertical-align: middle;
  background: white;
  cursor: cell;
}

.data-cell:hover {
  background: #f8f9fa;
}

.cell-display {
  padding: 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.cell-input {
  width: 100%;
  height: 100%;
  border: 2px solid #1976d2;
  padding: 0 4px;
  font-size: 13px;
  outline: none;
}

.cell-formula {
  background: #fff8e1;
}

.cell-editing {
  background: white;
  z-index: 10;
}
</style>
