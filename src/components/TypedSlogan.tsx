"use client";

import { useEffect, useState } from "react";

/**
 * 슬로건을 한 글자씩 찍는다. 끝에는 터미널 커서처럼 깜빡이는 캐럿이 붙는다.
 *
 * 세 가지를 지킨다.
 *   1. 서버에서는 문장 전체를 그대로 내보낸다. 자바스크립트가 없거나 검색엔진이
 *      읽을 때 첫 화면이 비어 있으면 안 되기 때문이다. 타이핑은 브라우저에서만 시작한다.
 *   2. 줄마다 최소 높이를 잡아 둔다. 글자가 늘어나며 아래 내용이 밀리지 않게 하려는 것이다.
 *   3. 움직임을 줄이도록 설정한 사용자에게는 애니메이션 없이 바로 전체를 보여준다.
 */
export function TypedSlogan({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const total = text.length;

  /* 서버 렌더와 첫 페인트는 전체 문장. 브라우저에서 0으로 되돌린 뒤 다시 찍는다. */
  const [count, setCount] = useState(total);
  const [done, setDone] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /*
     * 되감기와 타이핑을 다음 프레임에서 시작한다.
     * 이펙트 본문에서 곧바로 상태를 바꾸면 렌더 도중 다시 렌더를 부르는 꼴이라
     * 리액트가 경고한다. 화면에 그려지기 직전에 실행되므로 눈에는 차이가 없다.
     */
    let timer = 0;
    const frame = window.requestAnimationFrame(() => {
      setCount(0);
      setDone(false);

      let n = 0;
      timer = window.setInterval(() => {
        n += 1;
        setCount(n);
        if (n >= total) {
          window.clearInterval(timer);
          setDone(true);
        }
      }, 45);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, [total]);

  /* 지금까지 찍은 글자 수를 줄별로 나눈다. 줄바꿈도 한 글자로 센다. */
  const shown: string[] = [];
  let remaining = count;
  for (const line of lines) {
    shown.push(line.slice(0, Math.max(0, Math.min(line.length, remaining))));
    remaining -= line.length + 1;
  }

  /* 캐럿이 놓일 줄. 다 찍고 나면 마지막 줄 끝에 머문다. */
  let caretLine = lines.length - 1;
  if (!done) {
    let acc = 0;
    for (let i = 0; i < lines.length; i += 1) {
      if (count <= acc + lines[i].length) {
        caretLine = i;
        break;
      }
      acc += lines[i].length + 1;
    }
  }

  return (
    <h1 className={className} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, i) => (
        <span
          key={i}
          aria-hidden
          className="block min-h-[1.15em]"
          /* 줄이 아직 비어 있어도 높이를 지키게 한다. */
        >
          {shown[i]}
          {i === caretLine && (
            <span className={"cursor-block" + (done ? " caret" : "")} aria-hidden />
          )}
        </span>
      ))}
    </h1>
  );
}
