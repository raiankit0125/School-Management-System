import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import axiosInstance from "../../api/axiosInstance";

const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

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

export default function MyFees() {
  const [fee, setFee] = useState(null);

  useEffect(() => {
    axiosInstance.get("/fees/me").then((res) => setFee(res.data.data));
  }, []);

  const downloadReceipt = async (payment) => {
    const res = await axiosInstance.get(`/fees/me/receipt/${payment._id}`, { responseType: "blob" });
    downloadBlob(res.data, `${payment.receiptNumber}.pdf`);
  };

  return (
    <Layout>
      <PageTitle
        title="My Fees"
        subtitle="View your fee status, payment history, and download official receipts."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="metric-card">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{fee?.status || "Due"}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Total Fee</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{money(fee?.totalFee)}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Paid Amount</p>
          <p className="mt-2 text-xl font-semibold text-emerald-700">{money(fee?.paidAmount)}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Due Amount</p>
          <p className="mt-2 text-xl font-semibold text-rose-700">{money(fee?.dueAmount)}</p>
        </div>
      </section>

      <section className="card mt-6 p-5">
        <div className="border-b border-slate-200 pb-4">
          <p className="label">Payment History</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            {fee?.student?.user?.name || "Student"} receipts
          </h3>
        </div>

        <div className="mt-5 space-y-3">
          {(fee?.paymentHistory || []).length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No payment history available yet.
            </p>
          ) : (
            fee.paymentHistory.map((payment) => (
              <div
                key={payment._id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{money(payment.amount)}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {payment.receiptNumber} | {payment.mode} | {String(payment.date).slice(0, 10)}
                  </p>
                </div>
                <Button variant="outline" onClick={() => downloadReceipt(payment)}>
                  Download PDF
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
}
