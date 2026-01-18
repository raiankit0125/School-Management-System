import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

export default function MyAttendance() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axiosInstance.get("/student/attendance").then((res) => setData(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle title="My Attendance" subtitle="Attendance history" />
      <Table
        columns={[
          { key: "date", title: "Date", render: (a) => a.date },
          { key: "status", title: "Status", render: (a) => a.status },
        ]}
        data={data}
      />
    </Layout>
  );
}
