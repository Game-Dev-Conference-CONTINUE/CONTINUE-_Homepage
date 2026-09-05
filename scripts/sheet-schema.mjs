/**
 * 구글 시트의 탭·열 구조를 정의한다.
 *
 * 이 파일 하나를 두 곳에서 함께 쓴다.
 *   - sheet-template.mjs : content.json -> 시트 양식 CSV (양식을 만들 때)
 *   - fetch-sheet.mjs    : 시트 CSV -> content.json (배포할 때)
 *
 * 양쪽이 같은 정의를 보므로 양식과 읽는 코드가 어긋날 일이 없다.
 * 열을 추가하려면 여기만 고치면 된다.
 */

/* ---------- CSV ---------- */

export function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const v = cell === null || cell === undefined ? "" : String(cell);
          return /[",\n\r]/.test(v) ? '"' + v.replaceAll('"', '""') + '"' : v;
        })
        .join(","),
    )
    .join("\r\n");
}

export function fromCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];

    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i += 1; }
        else quoted = false;
      } else cell += ch;
      continue;
    }

    if (ch === '"') { quoted = true; continue; }
    if (ch === ",") { row.push(cell); cell = ""; continue; }
    if (ch === "\r") continue;
    if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; continue; }
    cell += ch;
  }

  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  // 시트 끝의 빈 줄은 버린다.
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/* ---------- 값 변환 ---------- */

const text = (v) => String(v ?? "").trim();

/** 셀 안에서 줄바꿈(Alt+Enter)으로 구분된 목록. 빈 줄은 버린다. */
const lines = (v) =>
  String(v ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
const linesOut = (arr) => (arr ?? []).join("\n");

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

/**
 * public 폴더 안의 파일은 / 로 시작해야 배포 경로가 제대로 붙는다.
 * 시트에 "images/..." 처럼 앞의 / 를 빼고 적기 쉬워서 여기서 채워 준다.
 */
const assetPath = (v) => {
  const s = text(v);
  if (!s) return null;
  if (/^https?:\/\//.test(s) || s.startsWith("/")) return s;
  return "/" + s.replace(/^\.?\/*/, "");
};

/* 점으로 이어진 경로("site.name")로 값을 읽고 쓴다. */
const getPath = (obj, path) =>
  path.split(".").reduce((o, k) => (o === null || o === undefined ? o : o[k]), obj);

const setPath = (obj, path, value) => {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((o, k) => (o[k] ??= {}), obj);
  target[last] = value;
};

/**
 * "09:30" 을 분으로. 정렬과 겹침 검사에 쓴다.
 * 형식이 아니면 null 을 돌려주고, 판정은 부르는 쪽에서 한다.
 */
export function toMinutes(v) {
  const m = text(v).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** 일정 탭의 구분 값 중 트랙이 아닌 것들. */
export const COMMON = "공통";
export const BREAK = "휴식";

/* ---------- 탭 정의 ---------- */

export const TABS = [
  {
    name: "기본정보",
    kind: "kv",
    note: "행사 이름, 날짜, 신청 주소처럼 한 번 적고 거의 안 바뀌는 값들",
    fields: [
      ["행사명", "site.name", "예: GAME OVER?"],
      ["슬로건", "site.slogan", "히어로 큰 문구"],
      ["한 줄 소개", "site.lead", "슬로건 아래 설명 한 줄"],
      ["날짜", "site.dateLabel", "예: 2026년 10월 31일 (토)"],
      ["시간", "site.timeLabel", "예: 09:30 ~ 18:10"],
      ["장소", "site.venue", "예: 동명대학교 (강의실 확정 후 공지)"],
      ["주최", "site.host", "푸터 표기"],
      ["참가비", "site.fee", "예: 무료"],
      ["신청 주소", "site.applyUrl", "구글 폼 주소. 비우면 신청 버튼이 '준비 중'으로 보입니다"],
      ["신청 마감", "site.applyDeadline", "예: 10월 24일 (토)"],
      ["수요조사 주소", "site.surveyUrl", "신청을 열기 전 받는 폼. 신청 주소가 비어 있을 때 이 버튼이 대신 나옵니다"],
      ["수요조사 안내", "site.surveyNote", "수요조사 버튼 아래 한 줄"],
      ["문의 메일", "site.email", ""],
      ["사이트 주소", "site.url", "https:// 로 시작하는 배포 주소"],
      ["공유 이미지", "site.shareImage", "카톡 등에 링크를 붙였을 때 뜨는 그림"],
    ],
    read(get, draft) {
      for (const [label, path] of this.fields) {
        const raw = get(label);
        if (raw === undefined) continue;
        setPath(draft, path, path === "site.shareImage" ? assetPath(raw) : text(raw));
      }
    },
    write(content) {
      return this.fields.map(([label, path, note]) => [label, String(getPath(content, path) ?? ""), note]);
    },
  },

  {
    name: "소개",
    kind: "kv",
    note: "행사 성격을 설명하는 부분. 본문과 배제 사항은 한 칸 안에서 줄바꿈(Alt+Enter)으로 여러 줄 적으세요",
    fields: [
      ["제목", "about.title", ""],
      ["리드 문장", "about.lead", "가장 굵게 나오는 한 문장"],
      ["본문", "about.body", "한 줄이 한 문단이 됩니다"],
      ["이런 발표가 아닙니다", "about.excluded", "한 줄에 하나씩"],
      ["발표 구성 제목", "about.structureTitle", "강연구성 표 위에 나오는 문장"],
      ["발표 구성 덧말", "about.structureNote", "강연구성 표 아래 작은 글씨"],
    ],
    read(get, draft) {
      const t = get("제목"); if (t !== undefined) draft.about.title = text(t);
      const l = get("리드 문장"); if (l !== undefined) draft.about.lead = text(l);
      const b = get("본문"); if (b !== undefined) draft.about.body = lines(b);
      const e = get("이런 발표가 아닙니다"); if (e !== undefined) draft.about.excluded = lines(e);
      const st = get("발표 구성 제목"); if (st !== undefined) draft.about.structureTitle = text(st);
      const sn = get("발표 구성 덧말"); if (sn !== undefined) draft.about.structureNote = text(sn);
    },
    write(content) {
      return [
        ["제목", content.about.title, ""],
        ["리드 문장", content.about.lead, "가장 굵게 나오는 한 문장"],
        ["본문", linesOut(content.about.body), "한 줄이 한 문단이 됩니다"],
        ["이런 발표가 아닙니다", linesOut(content.about.excluded), "한 줄에 하나씩"],
        ["발표 구성 제목", content.about.structureTitle, "강연구성 표 위에 나오는 문장"],
        ["발표 구성 덧말", content.about.structureNote, "강연구성 표 아래 작은 글씨"],
      ];
    },
  },

  {
    name: "강연구성",
    kind: "rows",
    note: "모든 강연이 지나는 칸. 시작과 끝만 정하고 사이는 연사에게 맡깁니다. 순서대로 적으세요",
    header: ["번호", "이름", "영문", "설명"],
    read: (rows, draft) => {
      draft.structure = rows.map((r) => ({
        no: text(r[0]), name: text(r[1]), en: text(r[2]), desc: text(r[3]),
      }));
    },
    write: (content) => content.structure.map((s) => [s.no, s.name, s.en, s.desc]),
  },

  {
    name: "트랙",
    kind: "rows",
    note: "발표 주제 구분. 트랙을 나누지 않으므로 표식으로만 쓰입니다. 주소이름은 영문 소문자·숫자·하이픈만 씁니다",
    header: ["주소이름", "이름", "설명"],
    read: (rows, draft) => {
      draft.tracks = rows.map((r) => ({ slug: text(r[0]), name: text(r[1]), desc: text(r[2]) }));
    },
    write: (content) => content.tracks.map((t) => [t.slug, t.name, t.desc]),
  },

  {
    name: "일정",
    kind: "rows",
    note:
      `타임테이블·연사 목록·세션 상세가 모두 이 탭에서 나옵니다. ` +
      `구분에는 "${COMMON}", "${BREAK}", 또는 트랙 탭의 이름을 적으세요. ` +
      `주소이름을 적은 줄만 상세 페이지가 생깁니다`,
    header: [
      "시작", "종료", "구분", "제목", "연사", "소속", "장소", "주소이름", "요약", "사진",
    ],
    read: (rows, draft) => {
      draft.schedule = rows.map((r) => ({
        start: text(r[0]),
        end: text(r[1]),
        kind: text(r[2]),
        title: text(r[3]),
        speaker: text(r[4]),
        affiliation: text(r[5]),
        room: text(r[6]),
        slug: text(r[7]),
        summary: text(r[8]),
        photo: assetPath(r[9]),
      }));
    },
    write: (content) =>
      content.schedule.map((s) => [
        s.start, s.end, s.kind, s.title, s.speaker, s.affiliation, s.room, s.slug, s.summary, s.photo ?? "",
      ]),
  },

  {
    name: "오시는길",
    kind: "kv",
    note: "교통 안내는 한 칸 안에서 줄바꿈(Alt+Enter)으로 여러 줄 적으세요",
    fields: [
      ["장소명", "venue.name", ""],
      ["주소", "venue.address", ""],
      ["교통 안내", "venue.transit", "한 줄에 하나씩"],
      ["지도 주소", "venue.mapUrl", "카카오맵·네이버지도 공유 주소"],
      ["참고 사항", "venue.note", "주차, 출입 등"],
    ],
    read(get, draft) {
      const n = get("장소명"); if (n !== undefined) draft.venue.name = text(n);
      const a = get("주소"); if (a !== undefined) draft.venue.address = text(a);
      const t = get("교통 안내"); if (t !== undefined) draft.venue.transit = lines(t);
      const m = get("지도 주소"); if (m !== undefined) draft.venue.mapUrl = text(m);
      const o = get("참고 사항"); if (o !== undefined) draft.venue.note = text(o);
    },
    write(content) {
      return [
        ["장소명", content.venue.name, ""],
        ["주소", content.venue.address, ""],
        ["교통 안내", linesOut(content.venue.transit), "한 줄에 하나씩"],
        ["지도 주소", content.venue.mapUrl, "카카오맵·네이버지도 공유 주소"],
        ["참고 사항", content.venue.note, "주차, 출입 등"],
      ];
    },
  },

  {
    name: "연사안내",
    kind: "kv",
    note: "연사에게 보여줄 페이지(/speakers). 자료 마감과 템플릿 주소를 여기서 바꿉니다",
    fields: [
      ["제목", "speakerGuide.title", ""],
      ["리드 문장", "speakerGuide.lead", ""],
      ["자료 제출 마감", "speakerGuide.deadline", ""],
      ["템플릿(다크) 주소", "speakerGuide.templateDark", ""],
      ["템플릿(라이트) 주소", "speakerGuide.templateLight", ""],
      ["제출 방법", "speakerGuide.submit", ""],
      ["당일 안내", "speakerGuide.dayOf", "한 줄에 하나씩"],
    ],
    read(get, draft) {
      for (const [label, path] of this.fields) {
        const raw = get(label);
        if (raw === undefined) continue;
        setPath(draft, path, path.endsWith("dayOf") ? lines(raw) : text(raw));
      }
    },
    write(content) {
      return this.fields.map(([label, path, note]) => {
        const v = getPath(content, path);
        return [label, Array.isArray(v) ? linesOut(v) : String(v ?? ""), note];
      });
    },
  },

  {
    name: "FAQ",
    kind: "rows",
    note: "자주 묻는 질문. 답변은 한 칸 안에서 줄바꿈해도 됩니다",
    header: ["질문", "답변"],
    read: (rows, draft) => {
      draft.faq = rows.map((r) => ({ q: text(r[0]), a: text(r[1]) }));
    },
    write: (content) => content.faq.map((f) => [f.q, f.a]),
  },
];

/** 탭별 표를 읽어 content 객체를 만든다. 시트에 없는 항목은 base 값이 남는다. */
export function tablesToContent(tables, base) {
  const draft = structuredClone(base);

  for (const tab of TABS) {
    const table = tables[tab.name];
    if (!table || table.length === 0) continue;

    if (tab.kind === "kv") {
      const map = new Map(table.slice(1).map((r) => [String(r[0]).trim(), r[1]]));
      tab.read((label) => map.get(label), draft);
    } else {
      const width = tab.header.length;
      const rows = table.slice(1).map((r) => {
        const padded = r.slice(0, width);
        while (padded.length < width) padded.push("");
        return padded;
      });
      tab.read(rows, draft);
    }
  }

  return draft;
}

/** content 객체를 탭별 표(머리글 포함)로 만든다. */
export function contentToTables(content) {
  const out = {};
  for (const tab of TABS) {
    const header = tab.kind === "kv" ? ["항목", "값", "설명"] : tab.header;
    out[tab.name] = [header, ...tab.write(content)];
  }
  return out;
}

export { text, lines, linesOut, assetPath, getPath, setPath, IMAGE_EXT };
