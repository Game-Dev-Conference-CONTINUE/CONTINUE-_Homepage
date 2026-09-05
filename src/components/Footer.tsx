import Link from "next/link";
import { content } from "@/data/content";

export function Footer() {
  const { site } = content;

  return (
    <>
      {/*
        * 마지막 신청 유도. 페이지 끝까지 읽은 사람이 다시 위로 올라가지 않게 둔다.
        * 넓은 면을 마젠타로 채우면 눈이 아프다는 의견이 있어 테두리로만 강조한다.
        */}
      <section className="border-t border-line px-6 py-20 md:px-10">
        <div className="mx-auto w-full max-w-5xl border-2 border-accent p-8 md:p-12">
          <p className="display text-sm tracking-[0.18em] text-accent uppercase">Join us</p>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold text-ink md:text-4xl">
            {site.dateLabel}, 만나요
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            {site.fee} · {site.venue}
            {site.applyUrl && site.applyDeadline && ` · 신청 마감 ${site.applyDeadline}`}
          </p>
          <div className="mt-8">
            {site.applyUrl || site.surveyUrl ? (
              <a
                href={site.applyUrl || site.surveyUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex bg-accent px-7 py-4 text-base font-bold text-bg hover:brightness-110"
              >
                {site.applyUrl ? "참가 신청하기" : "수요조사 참여하기"}
              </a>
            ) : (
              <span className="inline-flex border border-line px-7 py-4 text-base font-bold text-dim">
                참가 신청 준비 중
              </span>
            )}
          </div>
          {!site.applyUrl && site.surveyUrl && site.surveyNote && (
            <p className="mt-4 max-w-xl text-sm text-dim">{site.surveyNote}</p>
          )}
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
