import Link from "next/link";
import { BREAK, content, groupByStart, minutes } from "@/data/content";
import type { Entry } from "@/data/content";
import { Eyebrow, Lead, Section, Tag, Title } from "./ui";

/**
 * 타임테이블.
 *
 * 시작 시각이 같은 줄을 한 행에 나란히 놓는다. 오전 공통 세션은 한 칸,
 * 오후 병렬 트랙은 세 칸이 되어 "같은 시간에 무엇을 고를 수 있는가"가 그대로 보인다.
 * 트랙별 색 구분은 하지 않는다. 강조색은 마젠타 하나뿐이다.
 */
export function ProgramSection() {
  const { schedule, tracks } = content;
  const rows = groupByStart([...schedule].sort((a, b) => minutes(a.start) - minutes(b.start)));

  return (
    <Section id="program" className="border-t border-line">
      <Eyebrow>Program</Eyebrow>
      <Title>타임테이블</Title>
      <Lead>
        오전은 전원이 함께 듣고, 오후는 세 트랙이 나란히 진행됩니다. 세 트랙의 시작·종료 시각을
        맞춰 두어 세션 단위로 옮겨 다닐 수 있습니다.
      </Lead>

      <ul className="mt-8 flex flex-wrap gap-2">
        {tracks.map((t) => (
          <li key={t.slug}>
            <span className="border border-line px-3 py-1.5 text-sm text-muted">
              <span className="font-bold text-ink">{t.name}</span>
              <span className="ml-2 text-dim">{t.desc}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-10 border-t border-line">
        {rows.map((row) => (
          <div
            key={row.start}
            className="grid grid-cols-1 gap-px border-b border-line py-6 md:grid-cols-[7rem_1fr] md:gap-6"
          >
            <div className="display pt-1 text-sm tracking-wider text-muted">
              {row.start}
              <span className="mx-1 text-dim">–</span>
              {row.end}
            </div>

            <div
              className={
                row.items.length > 1
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid gap-4"
              }
            >
              {row.items.map((e, i) => (
                <Slot key={`${e.kind}-${i}`} entry={e} parallel={row.items.length > 1} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Slot({ entry, parallel }: { entry: Entry; parallel: boolean }) {
  const isBreak = entry.kind === BREAK;

  /* 쉬는 시간은 정보가 아니라 여백이다. 눈에 띄지 않게 둔다. */
  if (isBreak) {
    return (
      <div className="text-sm text-dim">
        {entry.title}
        {entry.room && <span className="ml-2">· {entry.room}</span>}
      </div>
    );
  }

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Tag strong={parallel}>{entry.kind}</Tag>
        {entry.room && <span className="text-xs text-dim">{entry.room}</span>}
      </div>

      <p className="mt-3 leading-snug font-bold text-ink">{entry.title}</p>

      {entry.speaker ? (
        <p className="mt-1 text-sm text-muted">
          {entry.speaker}
          {entry.affiliation && <span className="text-dim"> · {entry.affiliation}</span>}
        </p>
      ) : (
        /*
         * 연사를 기다리는 것은 강연뿐이다. 개회식·네트워킹·폐회처럼 강연이 아닌
         * 순서에까지 "섭외 중"을 붙이면 준비가 덜 된 행사처럼 보인다.
         * 강연인지 아닌지는 주소이름을 붙였는지로 구분한다.
         */
        entry.slug && <p className="mt-1 text-sm text-dim">연사 섭외 중</p>
      )}

      {entry.summary && (
        <p className="mt-3 text-sm leading-relaxed text-muted">{entry.summary}</p>
      )}
    </>
  );

  /* 주소이름이 있는 세션만 상세 페이지로 넘어간다. */
  if (entry.slug) {
    return (
      <Link
        href={`/sessions/${entry.slug}/`}
        className="block border border-line p-5 transition hover:border-accent"
      >
        {body}
        <span className="mt-4 inline-block text-sm font-bold text-accent">자세히 →</span>
      </Link>
    );
  }

  return <div className="border border-line p-5">{body}</div>;
}
