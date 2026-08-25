/**
 * 구글 시트를 읽어 src/data/content.json 을 다시 만든다. 배포할 때만 실행된다.
 *
 *   SHEET_ID=<시트 주소 또는 그 안의 ID> node scripts/fetch-sheet.mjs
 *
 * SHEET_ID 가 없으면 아무것도 하지 않고 그대로 끝난다. 아직 시트를 연결하지
 * 않았거나 로컬에서 인터넷 없이 빌드할 때 저장소에 있는 내용으로 빌드된다.
 *
 * 시트에 문제가 있으면 잘못된 내용으로 배포하는 대신 여기서 실패시킨다.
 * 타임테이블이 조용히 어긋난 채 올라가는 것보다 배포가 멈추고 알려주는 편이 낫다.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TABS, tablesToContent, toMinutes, COMMON, BREAK } from "./sheet-schema.mjs";
import { loadAllTabs, readSheetId } from "./sheet-io.mjs";

const SOURCE = "src/data/content.json";

function stop(message) {
  // 프로그래머용 스택 대신 고칠 곳을 알려주는 문장만 남긴다.
  console.error("\n────────────────────────────────────────");
  console.error("시트를 읽지 못해 배포를 멈췄습니다.\n");
  console.error(message);
  console.error("\n시트를 고친 뒤 Actions 탭에서 다시 실행해 주세요.");
  console.error("────────────────────────────────────────\n");
  process.exit(1);
}

let SHEET_ID;
try {
  SHEET_ID = readSheetId(process.env.SHEET_ID);
} catch (error) {
  stop(error instanceof Error ? error.message : String(error));
}

if (!SHEET_ID) {
  console.log("[content] SHEET_ID 가 없어 저장소의 content.json 을 그대로 씁니다.");
  process.exit(0);
}

/** 배포하면 안 되는 상태를 미리 잡는다. */
function checkContent(content) {
  const problems = [];

  /* 트랙 주소이름은 주소가 되는 값이라 영문 소문자·숫자·하이픈만 쓸 수 있다. */
  const trackNames = new Set();
  const trackSlugs = new Set();
  for (const t of content.tracks) {
    if (!t.name) problems.push("트랙 이름이 비어 있는 줄이 있습니다.");
    if (!/^[a-z0-9-]+$/.test(t.slug))
      problems.push(`트랙 주소이름 "${t.slug}"에 영문 소문자·숫자·하이픈 외의 글자가 있습니다.`);
    if (trackSlugs.has(t.slug)) problems.push(`트랙 주소이름 "${t.slug}"이 두 번 쓰였습니다.`);
    if (trackNames.has(t.name)) problems.push(`트랙 이름 "${t.name}"이 두 번 쓰였습니다.`);
    trackSlugs.add(t.slug);
    trackNames.add(t.name);
  }
  if (content.tracks.length === 0) problems.push("트랙이 한 개도 없습니다.");

  /* 일정 한 줄씩 본다. 시간이 틀리면 타임테이블이 통째로 어긋난다. */
  const allowed = new Set([COMMON, BREAK, ...trackNames]);
  const slugs = new Set();

  for (const [i, e] of content.schedule.entries()) {
    const where = `일정 ${i + 1}번째 줄("${e.title || "제목 없음"}")`;

    const s = toMinutes(e.start);
    const t = toMinutes(e.end);
    if (s === null) problems.push(`${where}의 시작 "${e.start}"이 시:분 형식이 아닙니다. 예) 13:45`);
    if (t === null) problems.push(`${where}의 종료 "${e.end}"이 시:분 형식이 아닙니다. 예) 14:30`);
    if (s !== null && t !== null && t <= s)
      problems.push(`${where}의 종료(${e.end})가 시작(${e.start})보다 빠르거나 같습니다.`);

    if (!e.title) problems.push(`${where}의 제목이 비어 있습니다.`);

    if (!allowed.has(e.kind))
      problems.push(
        `${where}의 구분 "${e.kind}"을 알 수 없습니다. ` +
          `쓸 수 있는 값: ${[...allowed].join(", ")}`,
      );

    if (e.slug) {
      if (!/^[a-z0-9-]+$/.test(e.slug))
        problems.push(`${where}의 주소이름 "${e.slug}"에 영문 소문자·숫자·하이픈 외의 글자가 있습니다.`);
      if (slugs.has(e.slug)) problems.push(`세션 주소이름 "${e.slug}"이 두 번 쓰였습니다.`);
      slugs.add(e.slug);
      if (e.kind === BREAK)
        problems.push(`${where}는 휴식인데 주소이름이 있습니다. 휴식에는 상세 페이지를 만들지 않습니다.`);
    }
  }

  /*
   * 같은 트랙 안에서 시간이 겹치면 한 사람이 두 곳에 있어야 한다.
   * 오후 병렬 트랙을 손으로 적다 보면 실제로 자주 생기는 실수라 미리 잡는다.
   */
  const byKind = new Map();
  for (const e of content.schedule) {
    if (e.kind === BREAK) continue;
    const s = toMinutes(e.start);
    const t = toMinutes(e.end);
    if (s === null || t === null) continue;
    if (!byKind.has(e.kind)) byKind.set(e.kind, []);
    byKind.get(e.kind).push({ ...e, s, t });
  }
  for (const [kind, list] of byKind) {
    list.sort((a, b) => a.s - b.s);
    for (let i = 1; i < list.length; i += 1) {
      if (list[i].s < list[i - 1].t)
        problems.push(
          `"${kind}"의 "${list[i - 1].title}"(${list[i - 1].start}~${list[i - 1].end})과 ` +
            `"${list[i].title}"(${list[i].start}~${list[i].end})의 시간이 겹칩니다.`,
        );
    }
  }

  /* 4단 구성은 이 행사의 뼈대라 비면 안 된다. */
  if (content.structure.length === 0) problems.push("강연구성이 비어 있습니다.");

  /*
   * 주소이름이 하나도 없으면 세션 상세 페이지가 한 장도 만들어지지 않아
   * 정적 내보내기가 실패한다. 알아보기 어려운 영어 오류 대신 여기서 잡는다.
   */
  if (slugs.size === 0)
    problems.push(
      "일정 탭에 주소이름이 하나도 없습니다. 세션 줄에 최소 하나는 적어 주세요. " +
        "(영문 소문자·숫자·하이픈, 예: keynote)",
    );

  /* 신청 주소를 적었는데 형식이 틀리면 버튼이 엉뚱한 곳으로 간다. */
  const apply = content.site.applyUrl;
  if (apply && !/^https?:\/\//.test(apply))
    problems.push(`신청 주소 "${apply}"는 http:// 또는 https:// 로 시작해야 합니다.`);

  return problems;
}

/**
 * public 아래에서 그 경로에 해당하는 진짜 파일 경로를 찾는다. 없으면 null.
 *
 * existsSync 로 확인하지 않는 이유: 윈도우는 대소문자를 가리지 않아서 "Images" 도
 * 있다고 답한다. 그러면 정작 고쳐야 할 때 그대로 통과해 버린다.
 * 한글 이름은 자모를 쪼개 저장하는 운영체제가 있어 NFC 로 맞춘 뒤 비교한다.
 */
const key = (s) => s.normalize("NFC").toLowerCase();

function realPath(src) {
  let dir = "public";
  const found = [];

  for (const segment of src.slice(1).split("/")) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return null;
    }

    const match = entries.includes(segment)
      ? segment
      : entries.find((e) => key(e) === key(segment));
    if (!match) return null;

    found.push(match);
    dir = join(dir, match);
  }

  return "/" + found.join("/");
}

/**
 * 시트에 적힌 그림 경로를 저장소에 있는 진짜 파일 이름에 맞춘다.
 * 정말로 없는 파일은 그 자리만 조용히 비므로 경고만 남기고 배포는 계속한다.
 * 사진 한 장 때문에 사이트 전체가 옛날 내용으로 남는 편이 더 나쁘다.
 */
function fixImagePaths(content) {
  const spots = [];
  const add = (get, set, where) => {
    const src = get();
    if (src && src.startsWith("/")) spots.push({ src, set, where });
  };

  for (const e of content.schedule) {
    add(() => e.photo, (v) => (e.photo = v), `일정 "${e.title}" 사진`);
  }
  add(() => content.site.shareImage, (v) => (content.site.shareImage = v), "공유 이미지");

  const fixed = [];
  const missing = [];

  for (const { src, set, where } of spots) {
    const real = realPath(src);
    if (real === src) continue;
    if (real === null) {
      missing.push(`${where}: "${src}" 파일이 저장소에 없습니다.`);
      continue;
    }
    set(real);
    fixed.push(`${where}: "${src}" → "${real}"`);
  }

  return { fixed, missing };
}

console.log(`[content] 시트 ${SHEET_ID} 에서 내용을 읽습니다.`);

/* 한 탭이 잘못돼도 멈추지 않고 전부 본다. 고치고 다시 돌리기를 반복하지 않도록. */
const loaded = await loadAllTabs(SHEET_ID, TABS);
const broken = loaded.filter((r) => r.errors.length > 0);

if (broken.length) {
  const lines = broken.map(
    (r) => `[${r.tab.name}]\n` + r.errors.map((p) => "  · " + p).join("\n"),
  );
  stop(
    `탭 ${broken.length}개에 문제가 있습니다.\n\n` +
      lines.join("\n\n") +
      "\n\n정상인 탭: " +
      (loaded.length - broken.length) +
      "개",
  );
}

for (const { tab, table, notes } of loaded) {
  console.log(`[content] ${tab.name} — ${Math.max(0, table.length - 1)}줄`);
  for (const n of notes) console.log(`[content]   알림: ${n}`);
}

const tables = Object.fromEntries(loaded.map(({ tab, table }) => [tab.name, table]));
const base = JSON.parse(readFileSync(SOURCE, "utf8"));
const content = tablesToContent(tables, base);

const contentProblems = checkContent(content);
if (contentProblems.length) {
  stop("시트 내용에 문제가 있습니다:\n" + contentProblems.map((p) => "  · " + p).join("\n"));
}

const { fixed, missing } = fixImagePaths(content);
if (fixed.length) {
  console.log("\n[content] 그림 경로를 저장소의 실제 파일 이름에 맞췄습니다.");
  for (const f of fixed) console.log(`[content]   · ${f}`);
}
if (missing.length) {
  console.warn("\n[content] ⚠ 없는 그림 파일을 가리키는 칸이 있습니다. 그 자리는 빈 채로 배포됩니다.");
  for (const m of missing) console.warn(`[content]   · ${m}`);
}
if (fixed.length || missing.length) console.log("");

const before = readFileSync(SOURCE, "utf8");
const after = JSON.stringify(content, null, 2) + "\n";
writeFileSync(SOURCE, after, "utf8");

console.log(
  before === after
    ? "[content] 시트 내용이 저장소와 같습니다. 바뀐 것 없음."
    : "[content] 시트 내용으로 갱신했습니다.",
);
