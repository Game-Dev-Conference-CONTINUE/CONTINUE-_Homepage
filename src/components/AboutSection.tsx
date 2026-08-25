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

      {/* 모든 강연이 따르는 4단. 이 행사의 뼈대라 가장 눈에 띄게 둔다. */}
      <div className="mt-16">
        <h3 className="text-xl font-bold text-ink">모든 강연은 이 네 칸을 지납니다</h3>
        <ol className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {structure.map((s) => {
            /* 셋째 칸이 이 행사의 핵심이라 색을 뒤집어 강조한다. */
            const hot = s.no === "03";
            return (
              <li
                key={s.no}
                className={"p-6 " + (hot ? "bg-accent text-bg" : "bg-bg text-ink")}
              >
                <p className={"display text-3xl " + (hot ? "text-bg" : "text-accent")}>{s.no}</p>
                <p className="mt-3 font-bold">{s.name}</p>
                <p
                  className={
                    "display mt-1 text-[0.7rem] tracking-widest uppercase " +
                    (hot ? "text-bg/70" : "text-dim")
                  }
                >
                  {s.en}
                </p>
                <p className={"mt-3 text-sm leading-relaxed " + (hot ? "text-bg" : "text-muted")}>
                  {s.desc}
                </p>
              </li>
            );
          })}
        </ol>
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
