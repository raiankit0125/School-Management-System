import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axiosInstance.get("/teacher/classes").then((res) => setClasses(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle title="My Classes" subtitle="Classes assigned to you" />
      <Table
        columns={[
          { key: "name", title: "Class Name", render: (c) => c.name },
          { key: "id", title: "Class ID", render: (c) => c._id },
        ]}
        data={classes}
      />
    </Layout>
  );
}
