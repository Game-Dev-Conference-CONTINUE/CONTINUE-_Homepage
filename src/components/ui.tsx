import Link from "next/link";
import type { ReactNode } from "react";

/** 섹션 하나. 좌우 여백과 최대 폭을 여기서만 정한다. */
export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-6 py-20 md:px-10 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

/** 섹션 제목 위의 작은 영문 라벨. Anton 을 쓰므로 영문·숫자만 넣는다. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="display mb-3 text-sm tracking-[0.18em] text-accent uppercase">{children}</p>
  );
}

/** 섹션 제목. 끝에 커서 블록이 붙는다. */
export function Title({ children, block = true }: { children: ReactNode; block?: boolean }) {
  return (
    <h2 className="text-3xl leading-tight font-extrabold text-ink md:text-4xl">
      {children}
      {block && <span className="cursor-block" aria-hidden />}
    </h2>
  );
}

/** 본문 위의 리드 문장. */
export function Lead({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-lg leading-relaxed text-ink md:text-xl">{children}</p>;
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** 주소가 비어 있으면 눌리지 않는 회색 버튼이 된다. */
  disabledLabel?: string;
  external?: boolean;
  variant?: "solid" | "outline";
};

export function Button({
  href,
  children,
  disabledLabel,
  external,
  variant = "solid",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-none px-7 py-4 text-base font-bold transition";

  if (!href) {
    return (
      <span className={`${base} cursor-not-allowed border border-line bg-surface text-dim`}>
        {disabledLabel ?? children}
      </span>
    );
  }

  const style =
    variant === "solid"
      ? "bg-accent text-bg hover:brightness-110"
      : "border border-line text-ink hover:border-accent hover:text-accent";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={`${base} ${style}`}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${base} ${style}`}>
      {children}
    </Link>
  );
}

/**
 * 주제·구분을 나타내는 작은 표식. 색은 마젠타 하나뿐이다.
 * 강조할 때도 면을 채우지 않고 테두리와 글자색만 마젠타로 바꾼다.
 */
export function Tag({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <span
      className={
        "inline-block px-2 py-1 text-xs font-bold " +
        (strong ? "border border-accent text-accent" : "border border-line text-muted")
      }
    >
      {children}
    </span>
  );
}
