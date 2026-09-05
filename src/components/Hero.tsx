import { content } from "@/data/content";
import { Button } from "./ui";
import { TypedSlogan } from "./TypedSlogan";

export function Hero() {
  const { site } = content;

  return (
    <section className="relative overflow-hidden border-b border-line px-6 pt-20 pb-24 md:px-10 md:pt-28 md:pb-32">
      <div className="mx-auto w-full max-w-5xl">
        <p className="display text-sm tracking-[0.18em] text-accent uppercase">
          {site.dateLabel} · {site.timeLabel}
        </p>

        <TypedSlogan
          text={site.slogan}
          className="mt-6 text-4xl leading-[1.15] font-extrabold text-ink md:text-6xl"
        />

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{site.lead}</p>

        <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-3">
          {[
            ["일시", `${site.dateLabel}\n${site.timeLabel}`],
            ["장소", site.venue],
            ["참가비", site.fee],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs tracking-wider text-dim">{k}</dt>
              <dd className="mt-1 leading-snug font-bold whitespace-pre-line text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        {/*
          * 신청을 열기 전에도 누를 것이 있어야 한다. 신청 주소가 비어 있으면
          * 회색 버튼을 세워 두는 대신 수요조사를 받는다.
          */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {site.applyUrl ? (
            <Button href={site.applyUrl} external>
              참가 신청하기
            </Button>
          ) : (
            <Button href={site.surveyUrl} external disabledLabel="참가 신청 준비 중">
              수요조사 참여하기
            </Button>
          )}
          <Button href="/#program" variant="outline">
            프로그램 보기
          </Button>
        </div>

        {site.applyUrl
          ? site.applyDeadline && (
              <p className="mt-4 text-sm text-dim">신청 마감 · {site.applyDeadline}</p>
            )
          : site.surveyUrl &&
            site.surveyNote && <p className="mt-4 text-sm text-dim">{site.surveyNote}</p>}
      </div>

      {/* 거대한 워드마크. 화면 밖으로 잘려 나가는 배경 요소라 읽히지 않아도 된다. */}
      <div
        aria-hidden
        className="display pointer-events-none absolute -right-6 -bottom-10 hidden text-[10rem] leading-none text-surface select-none md:block"
      >
        {site.name}
      </div>
    </section>
  );
}
