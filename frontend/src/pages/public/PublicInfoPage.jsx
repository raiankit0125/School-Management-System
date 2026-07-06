import { Link } from "react-router-dom";
import SiteFooter from "../../components/SiteFooter";

const pages = {
  about: {
    eyebrow: "About Us",
    title: "A smarter way to manage academic operations",
    intro:
      "Smart Management is built to keep daily operations simple, organized, and easy to access for admins, faculty, and students.",
    cards: [
      {
        title: "Our Purpose",
        body: "We help institutions manage profiles, classes, attendance, marks, fees, notices, calendars, and messages from one connected portal.",
      },
      {
        title: "Role Based Experience",
        body: "Admins get full control, faculty get teaching tools, and students get access to their own academic records and updates.",
      },
      {
        title: "Our Approach",
        body: "The platform focuses on clear design, secure access, fast workflows, and practical tools that reduce manual management work.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact Us",
    title: "Need help? Reach the support team",
    intro:
      "For login, account, payment receipt, dashboard, notification, or general portal questions, contact the support team.",
    cards: [
      {
        title: "Contact Person",
        body: "Ankit Rai",
      },
      {
        title: "Email",
        body: "raiankit0125@gmail.com",
        link: "mailto:raiankit0125@gmail.com",
      },
      {
        title: "How To Send A Query",
        body: "Include your name, role, email, and the page or feature where you need help so the issue can be understood quickly.",
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy Policy",
    title: "Privacy Policy for Smart Management",
    intro:
      "This policy explains what information the portal may use, why it is used, and how access is controlled inside the system.",
    cards: [
      {
        title: "Information We Collect",
        body: "The portal may store account details, role information, profile data, attendance records, marks, fee records, notices, messages, calendar entries, and uploaded files required for portal features.",
      },
      {
        title: "How We Use Information",
        body: "Data is used to provide dashboards, manage users, assign classes, mark attendance, upload marks, generate receipts, send notifications, and support communication between authorized users.",
      },
      {
        title: "Role Based Access",
        body: "Admins can manage records. Faculty can access assigned academic workflows. Students can view only their own records such as attendance, marks, notices, fees, and receipts.",
      },
      {
        title: "Data Protection",
        body: "Access is controlled through login authentication and role permissions. Users should keep their credentials private and report any unauthorized access immediately.",
      },
      {
        title: "Receipts And Files",
        body: "Payment receipts, profile images, attachments, and uploaded documents are used only for portal operations and record keeping.",
      },
      {
        title: "Contact For Privacy Queries",
        body: "For privacy, correction, deletion, or access questions, contact the support team from the Contact Us page.",
      },
    ],
  },
};

export default function PublicInfoPage({ type }) {
  const page = pages[type] || pages.about;
  const isContact = type === "contact";

  const sendQuery = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const subject = String(form.get("subject") || "Portal Query").trim();
    const message = String(form.get("message") || "").trim();

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Query:",
      message,
    ].join("\n");

    window.location.href = `mailto:raiankit0125@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="app-shell login-shell flex min-h-screen flex-col px-4 py-8">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between rounded-[24px] border border-white/55 bg-white/80 px-5 py-4 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.42)] backdrop-blur dark:border-slate-700 dark:bg-slate-950/82">
        <Link to="/login" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Smart Management
        </Link>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link to="/about" className="text-slate-600 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300">About</Link>
          <Link to="/contact" className="text-slate-600 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300">Contact</Link>
          <Link to="/privacy" className="text-slate-600 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300">Privacy</Link>
          <Link to="/login" className="rounded-2xl bg-teal-700 px-4 py-2 text-white hover:bg-teal-800">Login</Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center py-10">
        <section className="w-full rounded-[32px] border border-white/60 bg-white/86 p-6 shadow-[0_26px_70px_-46px_rgba(15,23,42,0.5)] backdrop-blur dark:border-slate-700 dark:bg-slate-950/86 sm:p-8">
          <p className="label text-teal-700 dark:text-teal-300">{page.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 dark:text-white">
            {page.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {page.intro}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {page.cards.map((card) => (
              <div key={card.title} className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/80">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{card.title}</h2>
                {card.link ? (
                  <a className="mt-3 block font-semibold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200" href={card.link}>
                    {card.body}
                  </a>
                ) : (
                  <p className="mt-3 leading-6 text-slate-600 dark:text-slate-300">{card.body}</p>
                )}
              </div>
            ))}
          </div>

          {isContact ? (
            <form onSubmit={sendQuery} className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/80">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Send us a note</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Fill your query below. It will open your email app with the message ready to send.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input name="name" className="input-field" placeholder="Your name" required />
                <input name="email" type="email" className="input-field" placeholder="Your email" required />
                <input name="subject" className="input-field md:col-span-2" placeholder="Subject" defaultValue="Portal Query" required />
                <textarea name="message" className="input-field min-h-32 md:col-span-2" placeholder="Write your query here" required />
              </div>
              <button type="submit" className="btn btn-primary mt-5">
                Send Query
              </button>
            </form>
          ) : null}
        </section>
      </main>

      <div className="mx-auto w-full max-w-6xl">
        <SiteFooter compact />
      </div>
    </div>
  );
}
