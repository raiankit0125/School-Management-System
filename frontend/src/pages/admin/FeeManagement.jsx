import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const initialPaymentForm = {
  totalFee: "",
  amount: "",
  mode: "Cash",
  date: "",
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function FeeManagement() {
  const [filters, setFilters] = useState({ name: "", branch: "", year: "" });
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState(initialPaymentForm);

  const fetchRecords = async () => {
    const res = await axiosInstance.get("/fees/admin/search", { params: filters });
    setRecords(res.data.data || []);
  };

  useEffect(() => {
    Promise.resolve().then(fetchRecords);
  }, []);

  const selectedFee = selectedRecord?.fee || {};
  const selectedStudent = selectedRecord?.student || {};

  const summary = useMemo(
    () => ({
      paid: records.filter((item) => item.fee?.status === "Paid").length,
      due: records.filter((item) => item.fee?.status !== "Paid").length,
    }),
    [records]
  );

  const selectRecord = async (record) => {
    const res = await axiosInstance.get(`/fees/admin/student/${record.student._id}`);
    const fee = res.data.data;
    setSelectedRecord({ student: fee.student, fee });
    setForm({
      ...initialPaymentForm,
      totalFee: fee.totalFee || "",
    });
  };

  const updateFee = async () => {
    if (!selectedStudent?._id) return;
    if (!form.totalFee && !form.amount) {
      alert("Enter total fee or payment amount");
      return;
    }

    try {
      const res = await axiosInstance.put(`/fees/admin/student/${selectedStudent._id}`, form);
      const fee = res.data.data;
      setSelectedRecord({ student: fee.student, fee });
      setForm({ ...initialPaymentForm, totalFee: fee.totalFee || "" });
      fetchRecords();
      alert("Fee updated successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Fee update failed");
    }
  };

  const sendNotification = async (kind) => {
    if (!selectedStudent?._id) return;
    await axiosInstance.post(`/fees/admin/student/${selectedStudent._id}/notification`, { kind });
    alert(kind === "DUE" ? "Fee Due notification sent" : "Fee Cleared notification sent");
  };

  const downloadReceipt = async (payment) => {
    const res = await axiosInstance.get(
      `/fees/admin/student/${selectedStudent._id}/receipt/${payment._id}`,
      { responseType: "blob" }
    );
    downloadBlob(res.data, `${payment.receiptNumber}.pdf`);
  };

  return (
    <Layout>
      <PageTitle
        title="Fee Management"
        subtitle="Search students, update partial or full payments, and send fee notifications."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-sm text-slate-500">Students Listed</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{records.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Fee Cleared</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{summary.paid}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Fee Pending</p>
          <p className="mt-2 text-2xl font-semibold text-rose-700">{summary.due}</p>
        </div>
      </section>

      <section className="card mt-6 p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Input
            label="Name"
            placeholder="Student name"
            value={filters.name}
            onChange={(e) => setFilters((current) => ({ ...current, name: e.target.value }))}
          />
          <Input
            label="Branch"
            placeholder="Class / branch"
            value={filters.branch}
            onChange={(e) => setFilters((current) => ({ ...current, branch: e.target.value }))}
          />
          <Input
            label="Year"
            placeholder="Section / year"
            value={filters.year}
            onChange={(e) => setFilters((current) => ({ ...current, year: e.target.value }))}
          />
          <div className="flex items-end">
            <Button className="w-full" onClick={fetchRecords}>Search</Button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Table
          columns={[
            { key: "name", title: "Student", render: (item) => item.student?.user?.name || "-" },
            { key: "branch", title: "Branch", render: (item) => item.student?.classId?.name || "-" },
            { key: "year", title: "Year", render: (item) => item.student?.section || "-" },
            { key: "status", title: "Status", render: (item) => item.fee?.status || "Due" },
            { key: "due", title: "Due", render: (item) => money(item.fee?.dueAmount) },
            {
              key: "actions",
              title: "Actions",
              render: (item) => (
                <Button variant="outline" onClick={() => selectRecord(item)}>
                  Manage Fee
                </Button>
              ),
            },
          ]}
          data={records}
        />

        <section className="card p-5">
          {selectedRecord ? (
            <>
              <div className="border-b border-slate-200 pb-4">
                <p className="label">Selected Student</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{selectedStudent?.user?.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedStudent?.classId?.name || "-"} | Roll {selectedStudent?.rollNo || "-"}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="label">Total</p>
                  <p className="mt-1 font-semibold">{money(selectedFee.totalFee)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="label">Paid</p>
                  <p className="mt-1 font-semibold text-emerald-700">{money(selectedFee.paidAmount)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="label">Due</p>
                  <p className="mt-1 font-semibold text-rose-700">{money(selectedFee.dueAmount)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Input
                  label="Total Fee"
                  type="number"
                  min="0"
                  value={form.totalFee}
                  onChange={(e) => setForm((current) => ({ ...current, totalFee: e.target.value }))}
                />
                <Input
                  label="Payment Amount"
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))}
                />
                <div>
                  <label className="label">Payment Mode</label>
                  <select
                    className="select-field mt-1"
                    value={form.mode}
                    onChange={(e) => setForm((current) => ({ ...current, mode: e.target.value }))}
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <Input
                  label="Payment Date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={updateFee}>Update Fee</Button>
                <Button variant="outline" onClick={() => sendNotification("DUE")}>Send Fee Due</Button>
                <Button variant="outline" onClick={() => sendNotification("CLEARED")}>Send Fee Cleared</Button>
              </div>

              <div className="mt-6">
                <p className="label">Payment History</p>
                <div className="mt-3 space-y-2">
                  {(selectedFee.paymentHistory || []).length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">No payments yet.</p>
                  ) : (
                    selectedFee.paymentHistory.map((payment) => (
                      <div key={payment._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{money(payment.amount)}</p>
                          <p className="text-sm text-slate-500">
                            {payment.receiptNumber} | {payment.mode} | {String(payment.date).slice(0, 10)}
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => downloadReceipt(payment)}>Receipt PDF</Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Select a student from the list to update fees and download receipts.
            </p>
          )}
        </section>
      </section>
    </Layout>
  );
}
