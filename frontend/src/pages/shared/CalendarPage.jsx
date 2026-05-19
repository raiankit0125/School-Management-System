import HolidayCalendar from "../../components/HolidayCalendar";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";

export default function CalendarPage() {
  return (
    <Layout>
      <PageTitle
        title="Calendar"
        subtitle="View Google Calendar holidays, birthdays, joining dates, and academic events in one place."
      />
      <HolidayCalendar className="p-5" />
    </Layout>
  );
}
