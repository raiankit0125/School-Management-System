import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

export default function MyMarks() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axiosInstance.get("/student/marks").then((res) => setData(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle title="My Marks" subtitle="Results & marks list" />
      <Table
        columns={[
          { key: "subject", title: "Subject", render: (m) => m.subject },
          { key: "marks", title: "Marks", render: (m) => `${m.marks} / ${m.maxMarks}` },
          { key: "date", title: "Uploaded", render: (m) => new Date(m.createdAt).toLocaleString() },
        ]}
        data={data}
      />
    </Layout>
  );
}
