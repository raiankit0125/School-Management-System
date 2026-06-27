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
        "name,email,className,rollNo,phone,address,dob,gender,city,state,pincode,guardianName,guardianPhone,admissionNo,section,previousSchool,medicalNotes,transportMode,notes\n" +
        "Rahul Kumar,rahul@gmail.com,10-A,12,9876543210,Noida,2011-05-10,Male,Noida,UP,201301,Rakesh Kumar,9876500000,ADM-1001,A,City Public School,None,Bus,Merit student\n" +
        "Ankit Sharma,ankit@gmail.com,10-A,13,9999999999,Ghaziabad,2011-08-20,Male,Ghaziabad,UP,201010,Sunita Sharma,9811100000,ADM-1002,A,Bright Future School,Allergy alert,Van,Needs scholarship review\n";

    const teacherTemplate =
        "name,email,subject,phone,alternatePhone,dob,gender,address,city,state,pincode,qualification,specialization,certifications,certificates,subjects,preferredClasses,experienceYears,designation,institutions,onlineExperience,onlineExperienceDetails,preferredTimings,timeSlots,hoursPerWeek,devices,internetOptions,techRating,demoReady,demoTopic,whyBst,comments,declarationAccepted,signature,declarationDate\n" +
        "Mr Raj,raj@gmail.com,Mathematics,9000000000,9000000001,1990-04-15,Male,Delhi NCR,Noida,UP,201301,M.Sc,Algebra,TET Certified,Degree PDF,Mathematics|Physics,9-A|10-A,8,Senior Faculty,City School,Yes,Zoom and Meet batches,Evening|Weekend,5 PM - 8 PM,12,Laptop / Desktop|Tablet,Broadband|Mobile Data,5,Yes,Quadratic Equations,Looking for strong academic culture,Available immediately,true,Raj Kumar,2026-03-07\n" +
        "Ms Neha,neha@gmail.com,Science,9111111111,9111111112,1992-09-11,Female,Ghaziabad,Ghaziabad,UP,201010,B.Ed,Biology,CTET,Certificate Link,Science|Biology,8-A|9-A,5,Faculty,Bright School,Yes,Handled online science lab demos,Morning,9 AM - 12 PM,10,Laptop / Desktop|Smartphone,Broadband,4,Yes,Cell Structure,Interested in blended teaching,Part time support,true,Neha Sharma,2026-03-07\n";

    const downloadTemplate = () => {
        if (type === "students") downloadCSV("students_template.csv", studentTemplate);
        else downloadCSV("faculty_template.csv", teacherTemplate);
    };

    const uploadFile = async () => {
        if (!file) {
            alert("Please choose a CSV or Excel file first");
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
            alert("Bulk upload completed");
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
                subtitle="Upload CSV or Excel to create many students or faculty with full details"
            />
            <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#fef7eb_0%,#edf6ff_52%,#e8fbf4_100%)] p-6 lg:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,76,129,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.12),transparent_24%)]" />
                <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <p className="label text-sky-800/80">Bulk Operations</p>
                        <h3 className="mt-3 text-3xl font-semibold text-slate-900">Import faculty and students with cleaner operational flow.</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                            Download structured templates, upload completed files, and review row-wise validation reports without leaving the admin workspace.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="metric-card">
                            <p className="label">Upload Type</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900 capitalize">{type}</p>
                        </div>
                        <div className="metric-card">
                            <p className="label">Latest Report</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{report ? `${report.created} created` : "Pending"}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="card p-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="label">Upload Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="select-field mt-1"
                        >
                            <option value="students">Students</option>
                            <option value="teachers">Faculty</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">CSV or Excel File</label>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => setFile(e.target.files?.[0])}
                            className="input-field mt-1"
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
                    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4">
                        <h3 className="font-semibold text-slate-900 mb-2">Upload Report</h3>
                        <p>Total Rows: <b>{report.total}</b></p>
                        <p>Created: <b className="text-emerald-700">{report.created}</b></p>
                        <p>Failed: <b className="text-rose-700">{report.failed}</b></p>

                        {report.errors?.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold text-slate-800 mb-1">Failed Rows:</p>
                                <div className="max-h-48 overflow-auto border border-slate-200 rounded-xl bg-white">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200">
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
