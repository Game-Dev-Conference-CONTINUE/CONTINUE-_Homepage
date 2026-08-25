import { content } from "@/data/content";
import { Eyebrow, Section, Title } from "./ui";

export function FaqSection() {
  const { faq } = content;
  if (faq.length === 0) return null;

  return (
    <Section id="faq" className="border-t border-line">
      <Eyebrow>FAQ</Eyebrow>
      <Title>자주 묻는 질문</Title>

      {/* details 를 쓰면 자바스크립트 없이도 접히고 펼쳐진다. */}
      <div className="mt-10 border-t border-line">
        {faq.map((f, i) => (
          <details key={i} className="group border-b border-line">
            <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 font-bold text-ink marker:content-none">
              {f.q}
              <span
                className="display shrink-0 text-accent transition group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="pb-5 leading-relaxed whitespace-pre-line text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
