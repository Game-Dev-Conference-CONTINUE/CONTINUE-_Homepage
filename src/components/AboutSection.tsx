import { content } from "@/data/content";
import { Eyebrow, Lead, Section, Title } from "./ui";

export function AboutSection() {
  const { about, structure } = content;

  return (
    <Section id="about">
      <Eyebrow>About</Eyebrow>
      <Title>{about.title}</Title>
      <Lead>{about.lead}</Lead>

      <div className="mt-8 max-w-3xl space-y-5">
        {about.body.map((p, i) => (
          <p key={i} className="leading-relaxed text-muted">
            {p}
          </p>
        ))}
      </div>

      {/*
        * 모든 강연이 지나는 칸. 시작과 끝만 정하고 사이는 연사가 채운다.
        * 칸 수가 바뀔 수 있으므로 개수를 글에도 격자에도 박지 않는다.
        */}
      <div className="mt-16">
        <h3 className="text-xl font-bold text-ink">{about.structureTitle}</h3>
        <ol className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2">
          {structure.map((s) => (
            <li key={s.no} className="bg-bg p-6 text-ink">
              <p className="display text-3xl text-accent">{s.no}</p>
              <p className="mt-3 font-bold">{s.name}</p>
              <p className="display mt-1 text-[0.7rem] tracking-widest text-dim uppercase">
                {s.en}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.desc}</p>
            </li>
          ))}
        </ol>
        {about.structureNote && (
          <p className="mt-5 border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
            {about.structureNote}
          </p>
        )}
      </div>

      {/* 무엇이 아닌지를 밝히는 것이 성격을 잡는 절반이다. */}
      {about.excluded.length > 0 && (
        <div className="mt-14 border-l-2 border-accent pl-6">
          <h3 className="font-bold text-ink">이런 발표는 하지 않습니다</h3>
          <ul className="mt-4 space-y-2">
            {about.excluded.map((x, i) => (
              <li key={i} className="flex gap-3 text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-dim" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
