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
  const [file, setFile] = useState(null);

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
    if (!activeContact?._id || (!body.trim() && !file)) return;

    const payload = new FormData();
    payload.append("recipientId", activeContact._id);
    payload.append("body", body);
    if (file) payload.append("attachment", file);

    await axiosInstance.post("/chat/send", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setBody("");
    setFile(null);
    fetchThread(activeContact._id);
  };

  const renderAttachment = (attachment) => {
    if (!attachment?.dataUrl) return null;
    const isImage = attachment.mimetype?.startsWith("image/");
    const isVideo = attachment.mimetype?.startsWith("video/");

    if (isImage) {
      return (
        <a href={attachment.dataUrl} target="_blank" rel="noreferrer" className="mt-3 block">
          <img src={attachment.dataUrl} alt={attachment.filename} className="max-h-64 rounded-2xl object-contain" />
        </a>
      );
    }

    if (isVideo) {
      return (
        <video controls className="mt-3 max-h-64 w-full rounded-2xl">
          <source src={attachment.dataUrl} type={attachment.mimetype} />
        </video>
      );
    }

    return (
      <a
        href={attachment.dataUrl}
        download={attachment.filename}
        className="mt-3 inline-flex rounded-xl border border-current px-3 py-2 text-xs font-semibold"
      >
        Download {attachment.filename || "file"}
      </a>
    );
  };

  return (
    <Layout>
      <PageTitle
        title="Messages"
        subtitle="Private role-based conversations with preserved history and file sharing."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="card h-fit p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Message Sidebar</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Contacts</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {contacts.length}
            </span>
          </div>
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

        <section className="card flex min-h-[640px] flex-col p-6">
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
                    {message.body ? <p className="mt-1 whitespace-pre-wrap">{message.body}</p> : null}
                    {renderAttachment(message.attachment)}
                    <p className="mt-2 text-[11px] opacity-70">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-3">
            {file ? (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <span className="truncate">{file.name}</span>
                <button type="button" className="font-semibold text-rose-600" onClick={() => setFile(null)}>
                  Remove
                </button>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 md:flex-row">
              <textarea
                className="input-field min-h-24 flex-1"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a message"
              />
              <div className="flex items-end gap-2">
                <label className="btn btn-outline cursor-pointer">
                  Attach
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                <Button onClick={sendMessage} disabled={!activeContact?._id}>Send</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
