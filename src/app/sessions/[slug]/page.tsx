import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content, detailed } from "@/data/content";
import { absoluteUrl, asset } from "@/lib/asset";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Tag } from "@/components/ui";

/*
 * 세션 하나의 전용 페이지. 링크를 공유했을 때 미리보기가 뜨게 하는 것이 목적이다.
 * 주소이름(slug)을 적은 세션만 만들어진다.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return detailed.map((s) => ({ slug: s.slug }));
}

const find = (slug: string) => detailed.find((s) => s.slug === slug);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = find(slug);
  if (!s) return {};

  const title = s.speaker ? `${s.title} — ${s.speaker}` : s.title;
  const image = absoluteUrl(s.photo) ?? absoluteUrl(content.site.shareImage);

  return {
    title,
    description: s.summary,
    openGraph: {
      title,
      description: s.summary,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function SessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = find(slug);
  if (!s) notFound();

  return (
    <>
      <Header />
      <main className="px-6 py-16 md:px-10 md:py-24">
        <article className="mx-auto w-full max-w-3xl">
          <Link href="/#program" className="text-sm text-muted hover:text-accent">
            ← 타임테이블
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Tag strong>{s.kind}</Tag>
            <span className="display text-sm tracking-wider text-muted">
              {s.start} – {s.end}
            </span>
            {s.room && <span className="text-sm text-dim">· {s.room}</span>}
          </div>

          <h1 className="mt-5 text-3xl leading-tight font-extrabold text-ink md:text-4xl">
            {s.title}
          </h1>

          {s.speaker && (
            <p className="mt-4 text-lg text-ink">
              {s.speaker}
              {s.affiliation && <span className="text-muted"> · {s.affiliation}</span>}
            </p>
          )}

          {s.photo && (
            /* 정적 내보내기라 next/image 대신 img 를 쓴다. 경로 앞에 배포 경로를 직접 붙인다. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset(s.photo)}
              alt={s.speaker || s.title}
              className="mt-8 w-full border border-line object-cover"
            />
          )}

          {s.summary && (
            <p className="mt-8 leading-relaxed whitespace-pre-line text-muted">{s.summary}</p>
          )}

          {/* 이 행사의 모든 발표가 같은 구조를 따른다는 것을 세션 페이지에서도 알린다. */}
          <section className="mt-14 border-t border-line pt-10">
            <h2 className="text-sm tracking-wider text-dim">이 발표가 지나는 네 칸</h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {content.structure.map((st) => (
                <li key={st.no} className="border border-line p-4">
                  <span className="display text-accent">{st.no}</span>
                  <span className="ml-2 font-bold text-ink">{st.name}</span>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{st.desc}</p>
                </li>
              ))}
            </ol>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
