"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "handoff";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    project: "",
    stack: "",
    message: "",
    company: "", // honeypot
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Name, email, and a short message are required.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // A fixable problem with what was typed stays on the form.
        if (res.status === 400) {
          setStatus("idle");
          setError(data.error || "Please check the form and try again.");
          return;
        }
        // Anything else: hand the message over to email or WhatsApp, filled in.
        setStatus("handoff");
        return;
      }
      setStatus("sent");
      setForm({ name: "", email: "", project: "", stack: "", message: "", company: "" });
    } catch {
      setStatus("handoff");
    }
  }

  if (status === "handoff") {
    const text = [
      form.message,
      "",
      form.project && `Project: ${form.project}`,
      form.stack && `Platform: ${form.stack}`,
      `From: ${form.name} (${form.email})`,
    ]
      .filter((l) => typeof l === "string")
      .join("\n");
    const mail = `mailto:victorv3925@gmail.com?subject=${encodeURIComponent(
      "New project inquiry"
    )}&body=${encodeURIComponent(text)}`;
    const whatsapp = `https://wa.me/2348123421589?text=${encodeURIComponent(text)}`;
    const choice =
      "flex items-center justify-center rounded-[10px] px-6 py-3.5 text-[15px] font-semibold transition-colors";
    return (
      <div className="rounded-xl border border-line bg-panel p-7">
        <div className="mb-2 text-lg font-semibold text-ink">One more step to send it</div>
        <p className="mb-5 text-muted">
          Your message is ready. Choose how to send it and it opens already filled in.
        </p>
        <div className="flex flex-col gap-3">
          <a href={mail} className={`${choice} bg-acid text-bg`}>
            Send by email
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener"
            className={`${choice} border border-line text-ink hover:border-acid`}
          >
            Send on WhatsApp
          </a>
        </div>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm text-muted hover:text-ink"
        >
          Back to the form
        </button>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-line bg-panel p-8 text-center">
        <div className="mb-2 font-semibold text-acid">Message sent</div>
        <p className="text-muted">
          Thanks. I&apos;ll reply by email. For anything urgent, write to{" "}
          <a className="text-ink underline" href="mailto:victorv3925@gmail.com">
            victorv3925@gmail.com
          </a>
          .
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm text-muted hover:text-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-line bg-panel px-4 py-3 text-[15px] text-ink placeholder:text-muted focus:border-acid focus:outline-none transition-colors";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className={input}
          placeholder="Your name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <input
          className={input}
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className={input}
          placeholder="Project type (optional)"
          value={form.project}
          onChange={(e) => update("project", e.target.value)}
        />
        <input
          className={input}
          placeholder="Platform / stack (optional)"
          value={form.stack}
          onChange={(e) => update("stack", e.target.value)}
        />
      </div>
      <textarea
        className={`${input} min-h-[120px] resize-y`}
        placeholder="Where is your project stuck?"
        value={form.message}
        onChange={(e) => update("message", e.target.value)}
      />
      {/* Honeypot — hidden from real users */}
      <input
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        value={form.company}
        onChange={(e) => update("company", e.target.value)}
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        onClick={submit}
        disabled={status === "sending"}
        className="mt-1 rounded-[10px] bg-acid px-6 py-3.5 text-[15px] font-semibold text-bg transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </div>
  );
}
