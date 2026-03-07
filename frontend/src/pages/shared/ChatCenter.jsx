import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import axiosInstance from "../../api/axiosInstance";

export default function ChatCenter() {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");

  const fetchContacts = async () => {
    const res = await axiosInstance.get("/chat/contacts");
    setContacts(res.data.data);
    if (!activeContact && res.data.data.length > 0) {
      setActiveContact(res.data.data[0]);
    }
  };

  const fetchThread = async (userId) => {
    if (!userId) return;
    const res = await axiosInstance.get(`/chat/thread/${userId}`);
    setMessages(res.data.data);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeContact?._id) fetchThread(activeContact._id);
  }, [activeContact?._id]);

  const sendMessage = async () => {
    if (!activeContact?._id || !body.trim()) return;

    await axiosInstance.post("/chat/send", {
      recipientId: activeContact._id,
      body,
    });

    setBody("");
    fetchThread(activeContact._id);
  };

  return (
    <Layout>
      <PageTitle
        title="Chat Center"
        subtitle="Role-based communication for admin, faculty, and students."
      />

      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#eef5ff_0%,#f2fbf8_46%,#fff3ea_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(68,99,179,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.12),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="label text-sky-800/80">Communication Center</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-900">Keep academic conversations clear, direct, and role-aware.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Admin, faculty, and students can continue contextual conversations here based on the permissions available to their role.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="label">Contacts</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{contacts.length}</p>
            </div>
            <div className="metric-card">
              <p className="label">Active Thread</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{activeContact?.name || "None selected"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="card p-4">
          <p className="label">Contacts</p>
          <div className="mt-4 space-y-3">
            {contacts.length === 0 ? (
              <p className="text-sm text-slate-500">No chat contacts available.</p>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact._id}
                  type="button"
                  onClick={() => setActiveContact(contact)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    activeContact?._id === contact._id
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">{contact.role}</p>
                  <p className="mt-1 text-xs text-slate-500">{contact.email}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="card flex min-h-[540px] flex-col p-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xl font-semibold text-slate-900">
              {activeContact?.name || "Select a contact"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {activeContact ? `${activeContact.role} conversation thread` : "Choose someone from the left panel"}
            </p>
          </div>

          <div className="mt-4 flex-1 space-y-3 overflow-auto rounded-3xl bg-slate-50 p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-500">No messages yet.</p>
            ) : (
              messages.map((message) => {
                const own = message?.sender?._id !== activeContact?._id;
                return (
                  <div
                    key={message._id}
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      own
                        ? "ml-auto bg-slate-900 text-white"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    <p className="text-xs opacity-70">{message?.sender?.name}</p>
                    <p className="mt-1">{message.body}</p>
                    <p className="mt-2 text-[11px] opacity-70">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <textarea
              className="input-field min-h-24 flex-1"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a message"
            />
            <div className="flex items-end">
              <Button onClick={sendMessage} disabled={!activeContact?._id}>Send</Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
