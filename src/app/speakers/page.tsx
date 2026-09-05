import type { Metadata } from "next";
import { content } from "@/data/content";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button, Eyebrow, Lead, Section, Title } from "@/components/ui";

/*
 * 연사에게 보여줄 안내 페이지.
 *
 * 노션이 아니라 홈페이지에 두는 이유: 연사가 노션 계정 없이 링크만으로 열 수 있어야 한다.
 * 섭외 메일에 이 주소를 넣으면 그것으로 안내가 끝난다.
 */
export const metadata: Metadata = {
  title: content.speakerGuide.title,
  description: content.speakerGuide.lead,
};

export default function SpeakersPage() {
  const { speakerGuide: g, structure, about, site } = content;

  return (
    <>
      <Header />
      <main>
        <Section>
          <Eyebrow>For Speakers</Eyebrow>
          <Title>{g.title}</Title>
          <Lead>{g.lead}</Lead>

          <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {[
              ["행사", `${site.dateLabel} ${site.timeLabel}`],
              ["장소", site.venue],
              ["발표", "35분 (질의응답 포함)"],
              ["자료 제출 마감", g.deadline],
            ].map(([k, v]) => (
              <div key={k} className="bg-bg p-6">
                <p className="text-xs tracking-wider text-dim">{k}</p>
                <p className="mt-2 font-bold text-ink">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <h2 className="text-xl font-bold text-ink">발표 구성</h2>
            <ol className="mt-6 space-y-3">
              {structure.map((s) => (
                <li key={s.no} className="flex gap-5 border border-line p-5">
                  <span className="display shrink-0 text-2xl text-accent">{s.no}</span>
                  <div>
                    <p className="font-bold text-ink">{s.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            {about.structureNote && (
              <p className="mt-5 text-sm leading-relaxed text-dim">{about.structureNote}</p>
            )}
          </div>

          {(g.templateDark || g.templateLight) && (
            <div className="mt-14">
              <h2 className="text-xl font-bold text-ink">발표 자료 템플릿</h2>
              <p className="mt-3 text-muted">
                발표 구성이 이미 배치되어 있습니다. 강연장 프로젝터가 확정되기 전이라 두 벌을
                두었으니 밝은 화면이 걱정되면 라이트 버전을 쓰세요.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={g.templateDark} external disabledLabel="다크 버전 준비 중">
                  다크 버전 내려받기
                </Button>
                <Button
                  href={g.templateLight}
                  external
                  variant="outline"
                  disabledLabel="라이트 버전 준비 중"
                >
                  라이트 버전 내려받기
                </Button>
              </div>
            </div>
          )}

          {g.dayOf.length > 0 && (
            <div className="mt-14">
              <h2 className="text-xl font-bold text-ink">알아두실 것</h2>
              <ul className="mt-5 space-y-2">
                {g.dayOf.map((d, i) => (
                  <li key={i} className="flex gap-3 text-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {g.submit && (
            <p className="mt-14 border-l-2 border-accent pl-6 text-muted">
              <span className="font-bold text-ink">자료 제출</span>
              <br />
              {g.submit}
              {site.email && (
                <>
                  {" "}
                  <a href={`mailto:${site.email}`} className="text-accent hover:underline">
                    {site.email}
                  </a>
                </>
              )}
            </p>
          )}
        </Section>
      </main>
      <Footer />
    </>
  );
}
