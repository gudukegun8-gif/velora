"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

/**
 * Contact page. The form composes a mailto: link with the visitor's message —
 * no API, no data stored on our side.
 */
export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!CONTACT_EMAIL) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address so we can reply.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Please tell us a little more (at least a sentence or two).");
      return;
    }
    setError("");
    const body = `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject.trim() || "Message from VÉLORA visitor"
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  const inputClass =
    "w-full rounded-xl border border-sand bg-white/70 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-golddeep focus:outline-none";

  return (
    <>
      <Header />
      <main className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-golddeep">
            Say Hello
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            Contact Us
          </h1>
          <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-ink/70 md:text-base">
            Spotted an error, have a product we should feature, or just want to talk training
            gear? We read everything.
          </p>

          {CONTACT_EMAIL ? (
            <form
              onSubmit={submit}
              className="mt-10 rounded-3xl border border-sand bg-white/60 p-6 md:p-10"
              aria-label="Contact form"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Avery"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="contact-subject" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Product suggestion, correction, feedback…"
                  className={inputClass}
                />
              </div>
              <div className="mt-5">
                <label htmlFor="contact-message" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind…"
                  className={`${inputClass} resize-y`}
                />
              </div>
              {error && (
                <p role="alert" className="mt-4 font-sans text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="mt-6 rounded-full bg-ink px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-coal"
              >
                Compose Email
              </button>
              <p className="mt-4 font-sans text-xs leading-relaxed text-ink/55">
                This opens your email app addressed to us at {CONTACT_EMAIL} — nothing is sent
                or stored until you hit send there.
              </p>
            </form>
          ) : (
            <div className="mt-10 rounded-3xl border border-sand bg-white/60 p-8 md:p-10">
              <p className="font-sans text-sm leading-relaxed text-ink/70">
                Our contact email is being set up — please check back soon. In the meantime,
                you can explore our <Link href="/about" className="font-semibold text-golddeep underline-offset-4 hover:underline">about page</Link> to
                learn more about VÉLORA.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
