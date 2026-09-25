"use client";
import { useState } from "react";
import Reveal from "./Reveal";
import { contact, events } from "@/lib/content";

const empty = { name: "", phone: "", email: "", event_type: "", event_date: "", city: "", message: "", website: "" };

export default function Booking() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
      setForm(empty);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <section id="book" className="section book">
      <div className="wrap book-grid">
        <Reveal className="book-copy">
          <h2 className="display">Book a live show</h2>
          <p className="lede">
            Tell us about your event. You will get a reply within one day.
          </p>

          <ul className="direct">
            <li>
              <span>Call</span>
              <a href={contact.phoneHref}>{contact.phone}</a>
            </li>
            <li>
              <span>Email</span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div className="shell">
            <div className="core form-core">
              {status === "done" ? (
                <div className="thanks" role="status">
                  <h3 className="display">Request received</h3>
                  <p>Thank you. We will call you on the number you gave within one day.</p>
                  <button className="btn btn-ghost" onClick={() => setStatus("idle")}>
                    Send another request
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <div className="row">
                    <label>
                      Your name
                      <input required value={form.name} onChange={set("name")} autoComplete="name" />
                    </label>
                    <label>
                      Phone number
                      <input required type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+91" />
                    </label>
                  </div>

                  <div className="row">
                    <label>
                      Email (optional)
                      <input type="email" value={form.email} onChange={set("email")} autoComplete="email" />
                    </label>
                    <label>
                      Type of event
                      <select required value={form.event_type} onChange={set("event_type")}>
                        <option value="" disabled>Select one</option>
                        {events.map((ev) => (
                          <option key={ev} value={ev}>{ev}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="row">
                    <label>
                      Event date
                      <input type="date" value={form.event_date} onChange={set("event_date")} />
                    </label>
                    <label>
                      City
                      <input value={form.city} onChange={set("city")} autoComplete="address-level2" />
                    </label>
                  </div>

                  <label>
                    Anything else we should know
                    <textarea rows={4} value={form.message} onChange={set("message")} />
                  </label>

                  {/* Honeypot for bots. Hidden from people. */}
                  <input
                    className="hp"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={form.website}
                    onChange={set("website")}
                    name="website"
                  />

                  {status === "error" && <p className="form-error" role="alert">{error}</p>}

                  <button className="btn btn-gold submit" disabled={status === "sending"}>
                    {status === "sending" ? "Sending…" : "Send booking request"}
                    <span className="dot" aria-hidden="true">↗</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
