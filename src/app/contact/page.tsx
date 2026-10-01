"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const inputClass =
  "w-full min-h-[48px] rounded-xl border border-cream/10 bg-coal px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none";

const labelClass =
  "mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/60";

const errorClass = "mt-1.5 font-sans text-sm text-red-300";

/**
 * Contact page. The form composes a mailto: link with the visitor's message —
 * no API, no data stored on our side. Includes a honeypot field for basic
 * spam protection.
 */
export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see it
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (name.trim() && name.trim().length < 2) {
      errs.name = "Please enter your name, or leave this field blank.";
    }
    if (!email.trim()) {
      errs.email = "Email address is required so we can reply to you.";
    } else if (!EMAIL_RE.test(email.trim())) {
      errs.email = "Please enter a valid email address (e.g. you@example.com).";
    }
    if (subject.trim().length > 120) {
      errs.subject = "Please keep the subject under 120 characters.";
    }
    if (!message.trim()) {
      errs.message = "Please write your message.";
    } else if (message.trim().length < 10) {
      errs.message = "Please tell us a little more — at least a sentence or two.";
    }
    return errs;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // Honeypot filled: almost certainly a bot — show success, send nothing.
    if (website.trim()) {
      setSubmitted(true);
      return;
    }
    setSubmitted(true);
    if (CONTACT_EMAIL) {
      const body = `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`;
      const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        subject.trim() || "Message from VÉLORA visitor"
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
    }
  };

  const reset = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setWebsite("");
    setErrors({});
    setSubmitted(false);
  };

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  return (
    <>
      <Header />
      <main className="bg-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
            Say Hello
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-cream md:text-6xl">
            Contact Us
          </h1>
          <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-cream/70 md:text-base">
            Spotted an error, have a product we should feature, or just want to talk training
            gear? We read everything.
          </p>

          {CONTACT_EMAIL ? (
            submitted ? (
              <div
                role="status"
                className="mt-10 rounded-3xl border border-gold/30 bg-coal p-8 md:p-10"
              >
                <p className="font-display text-2xl font-semibold text-cream md:text-3xl">
                  Message ready — thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}.
                </p>
                <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-cream/70">
                  We&apos;ve opened your email app with your message addressed to us
                  {CONTACT_EMAIL ? <> at {CONTACT_EMAIL}</> : ""} — just hit send there. Nothing
                  is stored on our servers.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full border border-cream/20 px-8 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:border-gold hover:text-gold"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                noValidate
                className="relative mt-10 rounded-3xl border border-cream/10 bg-coal p-6 md:p-10"
                aria-label="Contact form"
              >
                {/* Honeypot — visually hidden from humans, tempting for bots */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
                >
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className={labelClass}>
                      Your name{" "}
                      <span className="font-normal normal-case tracking-normal text-cream/40">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearError("name");
                      }}
                      placeholder="Jordan Avery"
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      className={inputClass}
                    />
                    {errors.name && (
                      <p id="contact-name-error" role="alert" className={errorClass}>
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={labelClass}>
                      Email address{" "}
                      <span aria-hidden="true" className="text-gold">
                        *
                      </span>
                      <span className="sr-only">(required)</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      placeholder="you@example.com"
                      aria-required="true"
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      className={inputClass}
                    />
                    {errors.email && (
                      <p id="contact-email-error" role="alert" className={errorClass}>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-5">
                  <label htmlFor="contact-subject" className={labelClass}>
                    Subject{" "}
                    <span className="font-normal normal-case tracking-normal text-cream/40">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      clearError("subject");
                    }}
                    placeholder="Product suggestion, correction, feedback…"
                    aria-invalid={errors.subject ? true : undefined}
                    aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                    className={inputClass}
                  />
                  {errors.subject && (
                    <p id="contact-subject-error" role="alert" className={errorClass}>
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div className="mt-5">
                  <label htmlFor="contact-message" className={labelClass}>
                    Message{" "}
                    <span aria-hidden="true" className="text-gold">
                      *
                    </span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearError("message");
                    }}
                    placeholder="Tell us what's on your mind…"
                    aria-required="true"
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                    className={`${inputClass} resize-y`}
                  />
                  {errors.message && (
                    <p id="contact-message-error" role="alert" className={errorClass}>
                      {errors.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-8 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-golddeep hover:text-cream"
                >
                  Compose Email
                </button>
                <p className="mt-4 font-sans text-xs leading-relaxed text-cream/55">
                  This opens your email app addressed to us at {CONTACT_EMAIL} — nothing is sent
                  or stored until you hit send there. We only use your details to reply, never
                  for marketing.
                </p>
              </form>
            )
          ) : (
            <div className="mt-10 rounded-3xl border border-cream/10 bg-coal p-8 md:p-10">
              <p className="font-sans text-sm leading-relaxed text-cream/70">
                Our contact email is being set up — please check back soon. In the meantime,
                you can explore our{" "}
                <Link
                  href="/about"
                  className="font-semibold text-gold underline-offset-4 hover:underline"
                >
                  about page
                </Link>{" "}
                to learn more about VÉLORA.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
