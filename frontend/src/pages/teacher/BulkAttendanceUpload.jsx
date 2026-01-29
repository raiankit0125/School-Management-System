import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import axiosInstance from "../../api/axiosInstance";

function downloadCSV(filename, csvContent) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function BulkAttendanceUpload() {
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    useEffect(() => {
        axiosInstance.get("/teacher/classes").then((res) => setClasses(res.data.data));
    }, []);

    const template =
        "rollNo,status\n" +
        "12,PRESENT\n" +
        "13,ABSENT\n";

    const downloadTemplate = () => {
        downloadCSV("attendance_template.csv", template);
    };

    const uploadAttendance = async () => {
        if (!classId) return alert("Please select class");
        if (!date) return alert("Please select date");
        if (!file) return alert("Please choose CSV file");

        try {
            setLoading(true);
            setReport(null);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("classId", classId);
            formData.append("date", date);

            const res = await axiosInstance.post("/teacher/bulk/attendance", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setReport(res.data.data);
            alert("Bulk Attendance Uploaded ✅");
        } catch (err) {
            console.log("BULK ATTENDANCE ERROR:", err?.response?.data);
            alert(err?.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <PageTitle title="Bulk Attendance Upload" subtitle="Upload attendance CSV class-wise" />

            <div className="card p-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="label">Class</label>
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="select-field mt-1"
                        >
                            <option value="">Select class</option>
                            {classes.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="input-field mt-1"
                        />
                    </div>

                    <div>
                        <label className="label">CSV File</label>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => setFile(e.target.files?.[0])}
                            className="input-field mt-1"
                        />

                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={downloadTemplate}>
                        Download Template
                    </Button>

                    <Button onClick={uploadAttendance} disabled={loading}>
                        {loading ? "Uploading..." : "Upload Attendance CSV"}
                    </Button>
                </div>

                {report && (
                    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4">
                        <h3 className="font-semibold text-slate-900 mb-2">Upload Report</h3>
                        <p>Total Rows: <b>{report.total}</b></p>
                        <p>Created/Updated: <b className="text-emerald-700">{report.created}</b></p>
                        <p>Failed: <b className="text-rose-700">{report.failed}</b></p>

                        {report.errors?.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold text-slate-800 mb-1">Failed Rows:</p>
                                <div className="max-h-48 overflow-auto border border-slate-200 rounded-xl bg-white">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="p-2 text-sm">Row</th>
                                                <th className="p-2 text-sm">RollNo</th>
                                                <th className="p-2 text-sm">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.errors.map((e, idx) => (
                                                <tr key={idx} className="border-b last:border-b-0">
                                                    <td className="p-2 text-sm">{e.row}</td>
                                                    <td className="p-2 text-sm">{e.rollNo || "-"}</td>
                                                    <td className="p-2 text-sm">{e.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
