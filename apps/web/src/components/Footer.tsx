import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { COMPANY_NAME, SOCIAL_LINKS, SUPPORT_EMAIL, WEB_URL } from "@rovotools/config";
import { t } from "@rovotools/localization";
import { RovoToolsImageLogo } from "@/components/RovoToolsLogo";

const TOOL_LINKS = [
  { label: "All Tools", href: "/tools" },
  { label: "PDF Tools", href: "/tools/category/pdf" },
  { label: "Image Tools", href: "/tools/category/image" },
  { label: "Developer Tools", href: "/tools/category/developer" },
  { label: "Text Tools", href: "/tools/category/text" },
  { label: "Security Tools", href: "/tools/category/security" },
];

const COMPANY_LINKS = [
  { label: t("en", "navigation.about"), href: "/about" },
  { label: t("en", "navigation.categories"), href: "/tools#categories" },
  { label: t("en", "navigation.blog"), href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: t("en", "navigation.privacyPolicy"), href: "/privacy" },
  { label: t("en", "navigation.terms"), href: "/terms" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Security", href: "/security" },
];

const SOCIAL_ICONS = [Linkedin, Twitter, Facebook, Instagram];

// Signature logo gradient underline: grows left -> right on hover/focus.
const FOOTER_UNDERLINE =
  "relative inline-block w-fit after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[linear-gradient(90deg,#0066FF_0%,#00D2FF_28%,#00E676_48%,#FFB300_74%,#F44336_100%)] after:transition-transform after:duration-300 motion-safe:after:transition-transform hover:after:scale-x-100 focus-visible:after:scale-x-100";

export default function Footer(): React.ReactElement {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200/70 bg-gradient-to-b from-indigo-50/60 via-white to-white dark:border-white/10 dark:from-indigo-950/30 dark:via-[#0B132B] dark:to-[#0B132B]">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/4 h-48 w-96 rounded-full bg-gradient-to-r from-indigo-400/20 via-fuchsia-400/15 to-amber-300/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div>
          <RovoToolsImageLogo height={44} />
          <div className="mt-6 flex items-center gap-2" aria-label="Social media">
            {SOCIAL_LINKS.map((social, index) => {
              const Icon = SOCIAL_ICONS[index % SOCIAL_ICONS.length] ?? Linkedin;
              return social.href === "" ? (
                <span
                  key={social.label}
                  title={`${social.label} — coming soon`}
                  aria-label={`${social.label} (coming soon)`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5B6B82] dark:text-[#93A1B8]"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              ) : (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5B6B82] hover:bg-[#EFF3F9] hover:text-[#0066FF] dark:text-[#93A1B8] dark:hover:bg-[#1A2B4D] dark:hover:text-[#5C9CFF]"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
        <nav aria-label={t("en", "footer.tools")}>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0A1A33] dark:text-[#F1F5F9]">
            {t("en", "footer.tools")}
          </p>
          <ul className="mt-3 space-y-2">
            {TOOL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={`text-sm font-medium text-[#5B6B82] hover:text-[#0066FF] dark:text-[#93A1B8] dark:hover:text-[#5C9CFF] ${FOOTER_UNDERLINE}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t("en", "footer.company")}>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0A1A33] dark:text-[#F1F5F9]">
            {t("en", "footer.company")}
          </p>
          <ul className="mt-3 space-y-2">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={`text-sm font-medium text-[#5B6B82] hover:text-[#0066FF] dark:text-[#93A1B8] dark:hover:text-[#5C9CFF] ${FOOTER_UNDERLINE}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t("en", "footer.legal")}>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0A1A33] dark:text-[#F1F5F9]">
            {t("en", "footer.legal")}
          </p>
          <ul className="mt-3 space-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={`text-sm font-medium text-[#5B6B82] hover:text-[#0066FF] dark:text-[#93A1B8] dark:hover:text-[#5C9CFF] ${FOOTER_UNDERLINE}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0A1A33] dark:text-[#F1F5F9]">
            {t("en", "footer.contact")}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#5B6B82] dark:text-[#93A1B8]">
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`} className={`font-medium hover:text-[#0066FF] dark:hover:text-[#5C9CFF] ${FOOTER_UNDERLINE}`}>
                {SUPPORT_EMAIL}
              </a>
            </li>
            <li>
              <a href={WEB_URL} className={`font-medium hover:text-[#0066FF] dark:hover:text-[#5C9CFF] ${FOOTER_UNDERLINE}`}>
                {WEB_URL}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#E1E8F2] dark:border-[#1E2F52]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[#5B6B82] sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {COMPANY_NAME}. {t("en", "footer.rights")}
          </p>
          <p className="font-medium">
            {t("en", "footer.poweredBy")}
          </p>
        </div>
      </div>
    </footer>
  );
}

