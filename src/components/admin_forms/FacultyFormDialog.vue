<template>
    <q-card style="min-width: 80vw; max-width: 95vw;">
        <q-card-section class="bg-blue-14 row items-center q-pb-none">
            <div class="text-h6 text-white">{{ title }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section class="q-pa-md">
            <div class="col-md-12 col-xs-12 q-pa-xs">
                <q-form @submit.prevent="submitForm()" @reset="resetForm()" method="post" class="q-gutter-md">
                    <div class="row">
                        <div class="col-md-12 col-xs-12 q-pa-xs">
                            <q-select use-input @filter="filterInstitute" color="blue-3" v-model="institute"
                                :options="institutes.options" label="สถาบันการศึกษา *" stack-label
                                @update:model-value="onInstituteValueChange">
                                <template v-slot:prepend>
                                    <q-icon name="school" />
                                </template>
                            </q-select>
                        </div>
                        <div class="col-md-12 col-xs-12 q-pa-xs">
                            <q-input color="white" bg-color="blue-5" standout bottom-slots
                                v-model="individual.faculty_name" label="คณะ *" clearable
                                :rules="[(val) => (val && val.length > 0) || 'ต้องใส่คณะ']">
                                <template v-slot:prepend>
                                    <q-icon name="account_balance" />
                                </template>
                            </q-input>
                        </div>
                    </div>
                    <div class="row justify-center q-mt-md">
                        <q-btn :label="btnLabel" type="submit" color="primary" icon="save" />
                        <q-btn label="ยกเลิก" type="reset" color="primary" flat class="q-pa-xs icon" icon="clear" />
                    </div>
                </q-form>
            </div>

            <div class="row q-mt-md">
                <div class="col-md-12 col-xs-12 q-pa-xs">
                    <q-table title="ข้อมูลคณะ" :rows="individuals1" :columns="columns" row-key="name" :filter="filter"
                        :loading="loading" :visible-columns="visibleColumns" separator="cell"
                        table-header-style="height: 65px; " table-header-class="bg-blue-5"
                        :rows-per-page-options="[10, 20, 50, 0]">
                        <template v-slot:top-right="props">
                            <q-input borderless dense debounce="300" v-model="filter" placeholder="ค้นหาข้อมูลคณะ">
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>
                            <q-btn flat icon-right="archive" label="ส่งออก" @click="exportTable()" class="q-ml-sm" />
                            <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                @click="props.toggleFullscreen" class="q-ml-md" />
                        </template>
                        <template v-slot:body-cell-actions="props">
                            <q-td :props="props">
                                <q-btn color="blue" label="แก้ไข" @click="editUser(props.row.faculty_id)" no-caps dense
                                    flat icon="edit"></q-btn>
                                <q-btn color="red" label="ลบ"
                                    @click="deleteUser(props.row.faculty_id, props.row.faculty_name)" no-caps dense flat
                                    icon="delete"></q-btn>
                            </q-td>
                        </template>
                    </q-table>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useQuasar, exportFile } from "quasar";
import { getRestApiUrl } from "src/utils/apiConfig.js";

function wrapCsvValue(val, formatFn, row) {
    let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
    formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
    formatted = formatted.split('"').join('""');
    return `"${formatted}"`;
}

export default {
    name: "FacultyFormDialog",
    data() {
        return {
            apiUrl: "",
            file_export: "ข้อมูลคณะ",
            title: "จัดการข้อมูลคณะ",
            btnLabel: "เพิ่มข้อมูล",
            individual: { faculty_id: "", institute_id: "", faculty_name: "" },
            institute: ref({ label: "", value: "" }),
            institutes: { options: [] },
            institutes_: { options: [] },
            isEdit: false,
            visibleColumns: ref(["actions", "institute_name", "faculty_name"]),
            columns: [
                { name: "actions", align: "center", label: "แก้ไข/ลบ" },
                { name: "institute_name", align: "left", label: "สถาบัน", field: "institute_name", sortable: true },
                { name: "faculty_name", align: "left", label: "คณะ", field: "faculty_name", sortable: true },
            ],
            filter: ref(""),
            loading: ref(false),
            individuals1: [],
            $q: useQuasar(),
        };
    },
    methods: {
        authHeaders() {
            const token = localStorage.getItem("token");
            return token ? { Authorization: `Bearer ${token}` } : {};
        },
        exportTable() {
            const content = [this.columns.map((col) => wrapCsvValue(col.label))].concat(
                this.individuals1.map((row) =>
                    this.columns.map((col) => wrapCsvValue(typeof col.field === "function" ? col.field(row) : row[col.field === void 0 ? col.name : col.field], col.format, row)).join(",")
                )
            ).join("\r\n");
            exportFile(this.file_export + ".csv", "\ufeff" + content, { encoding: "utf-8", mimeType: "text/csv;charset=utf-8;" });
        },
        resetForm() {
            this.isEdit = false;
            this.btnLabel = "เพิ่มข้อมูล";
            this.individual.faculty_id = "";
            this.individual.faculty_name = "";
            this.institute = ref({ label: "", value: "" });
        },
        onInstituteValueChange(val) {
            this.individual.institute_id = val.value;
        },
        filterInstitute(val, update) {
            if (val === "") { update(() => { this.institutes.options = this.institutes_.options; }); return; }
            update(() => {
                const needle = val.toLowerCase();
                this.institutes.options = this.institutes_.options.filter((v) => v.label.indexOf(needle) > -1);
            });
        },
        async getInstitutes() {
            try {
                const res = await axios.get(`${this.apiUrl}/institutes`, { headers: this.authHeaders() });
                this.institutes.options = res.data.map((item) => ({ label: item.institute_name, value: item.institute_id }));
                this.institutes_.options = this.institutes.options;
            } catch (err) { console.error("Get institutes error:", err); }
        },
        submitForm() {
            const message = this.isEdit ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?" : "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?";
            this.$q.dialog({ title: "ยืนยัน", message, cancel: true, persistent: true }).onOk(async () => {
                try {
                    if (this.isEdit) {
                        await axios.put(`${this.apiUrl}/faculties/${this.individual.faculty_id}`,
                            { faculty_name: this.individual.faculty_name, institute_id: this.individual.institute_id },
                            { headers: this.authHeaders() });
                    } else {
                        await axios.post(`${this.apiUrl}/faculties`,
                            { faculty_name: this.individual.faculty_name, institute_id: this.individual.institute_id },
                            { headers: this.authHeaders() });
                    }
                    this.getUpdate();
                    this.resetForm();
                    this.$emit("updated");
                } catch (err) {
                    console.error("Submit error:", err);
                    this.$q.dialog({ title: "ข้อผิดพลาด", message: err.response?.data?.error || "เกิดข้อผิดพลาด" });
                }
            });
        },
        async editUser(id) {
            this.isEdit = true;
            this.btnLabel = "แก้ไขข้อมูล";
            try {
                const res = await axios.get(`${this.apiUrl}/faculties/${id}`, { headers: this.authHeaders() });
                this.individual.faculty_id = res.data.faculty_id;
                this.individual.institute_id = res.data.institute_id;
                this.individual.faculty_name = res.data.faculty_name;
                this.institute = { label: res.data.institute_name, value: res.data.institute_id };
            } catch (err) { console.error("Edit error:", err); }
        },
        deleteUser(id, name) {
            this.$q.dialog({ title: "ยืนยัน", message: `คุณต้องการลบ [ ${id}-${name} ] หรือไม่ ?`, cancel: true, persistent: true })
                .onOk(async () => {
                    try {
                        await axios.delete(`${this.apiUrl}/faculties/${id}`, { headers: this.authHeaders() });
                        this.getUpdate();
                        this.$emit("updated");
                    } catch (err) { console.error("Delete error:", err); }
                });
        },
        async getUpdate() {
            this.loading = true;
            try {
                const res = await axios.get(`${this.apiUrl}/faculties`, { headers: this.authHeaders() });
                this.individuals1 = Array.isArray(res.data) ? res.data : [];
            } catch (err) { console.error("Get faculties error:", err); }
            finally { this.loading = false; }
        },
    },
    created() { this.apiUrl = getRestApiUrl(this.$store); },
    mounted() {
        this.getUpdate();
        this.getInstitutes();
    },
};
</script>
