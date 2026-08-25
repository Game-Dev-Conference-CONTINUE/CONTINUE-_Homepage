import Link from "next/link";
import { content } from "@/data/content";

export function Footer() {
  const { site } = content;

  return (
    <>
      {/* 마지막 신청 유도. 페이지 끝까지 읽은 사람이 다시 위로 올라가지 않게 둔다. */}
      <section className="border-t border-line bg-accent px-6 py-20 text-bg md:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <p className="display text-sm tracking-[0.18em] uppercase">Join us</p>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold md:text-4xl">
            {site.dateLabel}, 만나요
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed">
            {site.fee} · {site.venue}
            {site.applyDeadline && ` · 신청 마감 ${site.applyDeadline}`}
          </p>
          <div className="mt-8">
            {site.applyUrl ? (
              <a
                href={site.applyUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex bg-bg px-7 py-4 text-base font-bold text-ink hover:brightness-125"
              >
                참가 신청하기
              </a>
            ) : (
              <span className="inline-flex bg-bg/20 px-7 py-4 text-base font-bold">
                참가 신청 준비 중
              </span>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-12 md:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="display text-lg text-ink">
              {site.name}
              <span className="cursor-block" aria-hidden />
            </p>
            <p className="mt-2 text-sm text-dim">{site.host}</p>
            {site.email && (
              <a href={`mailto:${site.email}`} className="mt-1 block text-sm text-muted hover:text-accent">
                {site.email}
              </a>
            )}
          </div>

          <Link href="/speakers/" className="text-sm text-muted hover:text-accent">
            연사 안내 →
          </Link>
        </div>
      </footer>
    </>
  );
}
