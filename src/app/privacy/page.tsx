import type { Metadata } from "next";
import Link from "next/link";
import { canonical } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "VÉLORA's privacy policy: what data we collect, how we use it, cookies, advertising, affiliate links, our use of the Pinterest API, and the choices you have.",
  alternates: { canonical: canonical("/privacy-policy") },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
            Your Data
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-cream md:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-4 font-sans text-sm text-cream/55">
            Effective date: October 23, 2026 · Last updated: October 23, 2026
          </p>

          <div className="article-body mt-8">
            <p>
              This Privacy Policy explains how VÉLORA (&ldquo;VÉLORA&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;) collects, uses, and protects information when you visit{" "}
              https://velora-nu-peach.vercel.app (the &ldquo;Site&rdquo;). VÉLORA is a fitness
              and lifestyle product discovery publication: we publish workout guides, exercise
              articles, and curated product recommendations. We collect as little personal
              information as possible, and we never sell it.
            </p>

            <h2>1. Information we collect</h2>
            <p>
              <strong>Information you provide to us:</strong>
            </p>
            <ul>
              <li>
                <strong>Newsletter signup:</strong> if you subscribe to The VÉLORA Edit, we
                store your email address so we can send you the newsletter. You can
                unsubscribe at any time via the link in every email.
              </li>
              <li>
                <strong>Contact messages:</strong> if you email us or use the contact form, we
                receive your name, email address, and whatever you include in your message so
                we can respond.
              </li>
              <li>
                <strong>Comments and feedback:</strong> anything you voluntarily send us in
                connection with our content.
              </li>
            </ul>
            <p>
              <strong>Information collected automatically:</strong> when you visit the Site,
              we and our service providers may automatically collect your device type, browser
              type and version, operating system, the pages you visit and the links you click,
              the referring page, and approximate location derived from your IP address. Your
              saved-products list is stored only in your own browser&apos;s local storage; it
              never leaves your device and we cannot see it.
            </p>

            <h2>2. Cookies and similar technologies</h2>
            <p>The Site uses cookies and similar technologies in three categories:</p>
            <ul>
              <li>
                <strong>Functional:</strong> strictly necessary items such as your
                saved-products list, stored locally in your browser so the feature works.
              </li>
              <li>
                <strong>Analytics:</strong> first-party, anonymous, aggregate measurement of
                page views and outbound-link clicks, used to understand what readers find
                useful. These events are not tied to your identity.
              </li>
              <li>
                <strong>Advertising:</strong> our advertising partner (see Section 3) may set
                cookies or use similar technologies to serve and measure ads. Those cookies
                are controlled by the advertising partner under its own privacy policy.
              </li>
            </ul>
            <p>
              You can disable cookies at any time in your browser settings, and you can clear
              local storage from the same settings. The Site remains readable with cookies
              disabled, although some features (such as your saved list) may not persist.
            </p>

            <h2>3. Analytics and advertising</h2>
            <p>
              <strong>Analytics.</strong> We use our own first-party, aggregate analytics
              (for example, which pages are viewed and which outbound links are clicked) to
              improve our content. We do not use Google Analytics, and we do not build
              cross-site profiles of individual visitors.
            </p>
            <p>
              <strong>Advertising.</strong> The Site displays advertising served by Adsterra,
              a third-party advertising network. Adsterra may use cookies or similar
              technologies to deliver and measure advertisements, subject to its own privacy
              policy. Advertisements on VÉLORA are labeled &ldquo;Advertisement&rdquo;.
            </p>

            <h2>4. Affiliate links disclosure</h2>
            <p>
              Some links on VÉLORA are affiliate links. If you click through to a merchant and
              make a purchase, we may earn a commission from that merchant at no extra cost to
              you. The moment you leave VÉLORA, the merchant&apos;s own privacy policy and
              terms apply to anything you do on their site. See our{" "}
              <Link href="/affiliate-disclosure">affiliate disclosure</Link> for how these
              links work.
            </p>

            <h2>5. Pinterest API</h2>
            <p>
              We use the Pinterest API to publish our own original content to our own
              Pinterest account (velorafitness) and to read our own boards, pins, and account
              information so we can select the correct board and avoid duplicate pins. Access
              tokens are stored securely on our server, are never sold, shared, or disclosed
              to third parties, and are used only for our own account. No Pinterest user data
              from any other account is collected, stored, or processed. Authorization can be
              revoked at any time from the Pinterest account&apos;s app settings.
            </p>

            <h2>6. How we use information</h2>
            <p>
              We use the information described above only to operate and improve the Site,
              publish and distribute our content, measure traffic and engagement in aggregate,
              display advertising, and respond to messages you send us.{" "}
              <strong>We do not sell personal information</strong>, and we do not share it
              with third parties for their own marketing.
            </p>

            <h2>7. Third-party services and links</h2>
            <p>
              The Site links to third-party websites and services, including merchants and
              social platforms such as Pinterest. Those services have their own privacy
              policies, which we do not control. We encourage you to review the policy of any
              site you visit after leaving VÉLORA.
            </p>

            <h2>8. Data retention and security</h2>
            <p>
              We keep personal information only for as long as needed for the purposes
              described in this policy — for example, your newsletter email is kept until you
              unsubscribe, and contact messages are kept only as long as needed to handle your
              enquiry. We apply reasonable technical and organizational measures, including
              encrypted connections (HTTPS) and restricted server-side storage of credentials
              and tokens, to protect the information we hold. No system is completely secure,
              but we take care proportionate to the limited data we collect.
            </p>

            <h2>9. Your rights</h2>
            <p>
              You may ask us at any time to access, correct, or delete the personal
              information we hold about you (for example, your newsletter subscription or a
              contact message). Email us at gudukegun8@gmail.com and we will respond within a
              reasonable time. If you are in the European Economic Area or the United Kingdom,
              data-protection law (including the GDPR) gives you rights to access, correct,
              delete, restrict, or object to the processing of your personal data, and to
              data portability. If you are a California resident, the CCPA gives you the right
              to know what personal information is collected, to request its deletion, and to
              opt out of any &ldquo;sale&rdquo; of personal information — we do not sell
              personal information, so there is nothing to opt out of.
            </p>

            <h2>10. Children&apos;s privacy</h2>
            <p>
              VÉLORA is not directed at children under 13, and we do not knowingly collect
              personal information from children under 13. If you believe a child has provided
              us with personal information, please contact us and we will delete it.
            </p>

            <h2>11. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. When we do, we will post the
              updated version on this page with a new &ldquo;last updated&rdquo; date. Material
              changes will be noted here for at least 30 days.
            </p>

            <h2>12. Contact</h2>
            <p>
              VÉLORA · https://velora-nu-peach.vercel.app
              <br />
              Email: gudukegun8@gmail.com
              <br />
              Or use our <Link href="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
