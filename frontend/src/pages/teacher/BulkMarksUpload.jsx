import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import Input from "../../components/Input";
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

export default function BulkMarksUpload() {
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [subject, setSubject] = useState("Math");
    const [maxMarks, setMaxMarks] = useState(100);

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    useEffect(() => {
        axiosInstance.get("/teacher/classes").then((res) => setClasses(res.data.data));
    }, []);

    const template =
        "rollNo,marks\n" +
        "12,85\n" +
        "13,90\n";

    const downloadTemplate = () => {
        downloadCSV("marks_template.csv", template);
    };

    const uploadMarks = async () => {
        if (!classId) return alert("Please select class");
        if (!file) return alert("Please choose CSV file");

        try {
            setLoading(true);
            setReport(null);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("classId", classId);
            formData.append("subject", subject);
            formData.append("maxMarks", maxMarks);

            const res = await axiosInstance.post("/teacher/bulk/marks", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setReport(res.data.data);
            alert("Bulk Marks Uploaded ✅");
        } catch (err) {
            console.log("BULK MARKS ERROR:", err?.response?.data);
            alert(err?.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <PageTitle title="Bulk Marks Upload" subtitle="Upload marks CSV class-wise" />

            <div className="bg-white border rounded-2xl p-6 shadow space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm text-gray-600">Class</label>
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="w-full border rounded-xl p-3 mt-1"
                        >
                            <option value="">Select class</option>
                            {classes.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    <Input label="Max Marks" type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} />

                    <div>
                        <label className="text-sm text-gray-600">CSV File</label>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => setFile(e.target.files?.[0])}
                            className="w-full border rounded-xl p-3 mt-1"
                        />

                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={downloadTemplate}>
                        Download Template
                    </Button>

                    <Button onClick={uploadMarks} disabled={loading}>
                        {loading ? "Uploading..." : "Upload Marks CSV"}
                    </Button>
                </div>

                {report && (
                    <div className="mt-4 bg-gray-50 border rounded-2xl p-4">
                        <h3 className="font-bold mb-2">Upload Report</h3>
                        <p>Total Rows: <b>{report.total}</b></p>
                        <p>Created/Updated: <b className="text-green-700">{report.created}</b></p>
                        <p>Failed: <b className="text-red-700">{report.failed}</b></p>

                        {report.errors?.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold mb-1">Failed Rows:</p>
                                <div className="max-h-48 overflow-auto border rounded-xl bg-white">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-gray-100 border-b">
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
