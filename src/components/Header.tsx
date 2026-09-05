import Link from "next/link";
import { content } from "@/data/content";

const NAV = [
  { href: "/#about", label: "소개" },
  { href: "/#program", label: "프로그램" },
  { href: "/#venue", label: "오시는 길" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const { site } = content;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="display text-xl text-ink" aria-label={site.name}>
          {site.name}
          <span className="cursor-block" aria-hidden />
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hidden text-muted hover:text-ink sm:block">
              {n.label}
            </Link>
          ))}
          {site.applyUrl || site.surveyUrl ? (
            <a
              href={site.applyUrl || site.surveyUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="bg-accent px-4 py-2 font-bold text-bg hover:brightness-110"
            >
              {site.applyUrl ? "참가 신청" : "수요조사"}
            </a>
          ) : (
            <span className="border border-line px-4 py-2 text-dim">신청 준비 중</span>
          )}
        </nav>
      </div>
    </header>
  );
}
