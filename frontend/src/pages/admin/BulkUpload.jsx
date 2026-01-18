import { useState } from "react";
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

export default function BulkUpload() {
    const [type, setType] = useState("students");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    const studentTemplate =
        "name,email,className,rollNo,phone,address\n" +
        "Rahul Kumar,rahul@gmail.com,10-A,12,9876543210,Noida\n" +
        "Ankit Sharma,ankit@gmail.com,10-A,13,9999999999,Ghaziabad\n";

    const teacherTemplate =
        "name,email,subject,phone\n" +
        "Mr Raj,raj@gmail.com,Math,9000000000\n" +
        "Ms Neha,neha@gmail.com,Science,9111111111\n";

    const downloadTemplate = () => {
        if (type === "students") downloadCSV("students_template.csv", studentTemplate);
        else downloadCSV("teachers_template.csv", teacherTemplate);
    };

    const uploadFile = async () => {
        if (!file) {
            alert("Please choose a CSV file first");
            return;
        }

        try {
            setLoading(true);
            setReport(null);

            const formData = new FormData();
            formData.append("file", file);

            const endpoint = type === "students" ? "/bulk/students" : "/bulk/teachers";

            const res = await axiosInstance.post(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setReport(res.data.data);
            alert("Bulk upload completed ✅");
        } catch (err) {
            console.log("BULK UPLOAD ERROR:", err?.response?.data);
            alert(err?.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <PageTitle
                title="Bulk Upload"
                subtitle="Upload CSV to create many Students/Teachers automatically"
            />

            <div className="bg-white border rounded-2xl p-6 shadow space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm text-gray-600">Upload Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border rounded-xl p-3 mt-1"
                        >
                            <option value="students">Students</option>
                            <option value="teachers">Teachers</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">CSV File</label>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => setFile(e.target.files?.[0])}
                            className="w-full border rounded-xl p-3 mt-1"
                        />

                    </div>

                    <div className="flex items-end gap-3">
                        <Button variant="outline" onClick={downloadTemplate} className="w-full">
                            Download Template
                        </Button>
                        <Button onClick={uploadFile} disabled={loading} className="w-full">
                            {loading ? "Uploading..." : "Upload"}
                        </Button>
                    </div>
                </div>

                {report && (
                    <div className="mt-4 bg-gray-50 border rounded-2xl p-4">
                        <h3 className="font-bold mb-2">Upload Report</h3>
                        <p>Total Rows: <b>{report.total}</b></p>
                        <p>Created: <b className="text-green-700">{report.created}</b></p>
                        <p>Failed: <b className="text-red-700">{report.failed}</b></p>

                        {report.errors?.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold mb-1">Failed Rows:</p>
                                <div className="max-h-48 overflow-auto border rounded-xl bg-white">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="p-2 text-sm">Row</th>
                                                <th className="p-2 text-sm">Email</th>
                                                <th className="p-2 text-sm">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.errors.map((e, idx) => (
                                                <tr key={idx} className="border-b last:border-b-0">
                                                    <td className="p-2 text-sm">{e.row}</td>
                                                    <td className="p-2 text-sm">{e.email || "-"}</td>
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
