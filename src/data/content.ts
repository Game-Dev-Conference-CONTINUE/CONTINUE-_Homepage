/**
 * content.json 에 타입을 입혀 내보낸다.
 *
 * 사이트의 모든 글과 값은 이 파일 하나를 거쳐 나간다. 페이지 코드에는
 * 문구를 직접 적지 않는다. 배포할 때 구글 시트가 content.json 을 덮어쓰므로,
 * 코드에 적힌 문구는 시트에서 고칠 수 없게 되기 때문이다.
 */
import raw from "./content.json";

export type Site = {
  name: string;
  slogan: string;
  lead: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  host: string;
  fee: string;
  applyUrl: string;
  applyDeadline: string;
  /** 신청 전 단계에서 받는 수요조사 폼. 신청 주소가 비었을 때 대신 안내한다. */
  surveyUrl: string;
  surveyNote: string;
  email: string;
  url: string;
  shareImage: string | null;
};

export type About = {
  title: string;
  lead: string;
  body: string[];
  excluded: string[];
  /** 발표 구성 묶음의 제목과 덧말. 칸 수가 바뀌어도 코드를 고치지 않도록 글은 여기 둔다. */
  structureTitle: string;
  structureNote: string;
};

/** 모든 강연이 지나는 칸. 시작과 끝만 정하고 사이는 연사에게 맡긴다. */
export type StructureStep = {
  no: string;
  name: string;
  en: string;
  desc: string;
};

export type Track = {
  slug: string;
  name: string;
  desc: string;
};

/**
 * 타임테이블 한 줄. 세션과 쉬는 시간이 같은 목록에 들어 있다.
 * 목록을 하나로 둬야 타임테이블과 연사 목록이 서로 어긋나지 않는다.
 */
export type Entry = {
  start: string;
  end: string;
  /** "공통" | "휴식" | 트랙 이름 */
  kind: string;
  title: string;
  speaker: string;
  affiliation: string;
  room: string;
  /** 비어 있으면 상세 페이지를 만들지 않는다. */
  slug: string;
  summary: string;
  photo: string | null;
};

export type Venue = {
  name: string;
  address: string;
  transit: string[];
  mapUrl: string;
  note: string;
};

export type SpeakerGuide = {
  title: string;
  lead: string;
  deadline: string;
  templateDark: string;
  templateLight: string;
  submit: string;
  dayOf: string[];
};

export type Faq = { q: string; a: string };

export type Content = {
  site: Site;
  about: About;
  structure: StructureStep[];
  tracks: Track[];
  schedule: Entry[];
  venue: Venue;
  speakerGuide: SpeakerGuide;
  faq: Faq[];
};

export const content = raw as Content;

export const COMMON = "공통";
export const BREAK = "휴식";

/** 쉬는 시간이 아닌 줄. 연사 목록과 세션 상세는 여기서 나온다. */
export const sessions = content.schedule.filter((e) => e.kind !== BREAK);

/** 상세 페이지를 가진 세션. */
export const detailed = sessions.filter((e) => e.slug !== "");

/** "09:30" -> 570. 정렬에 쓴다. */
export function minutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

/** 시작 시각이 같은 줄끼리 묶는다. 지금은 트랙을 나누지 않아 대개 한 줄이지만,
 *  병렬 세션이 생겨도 한 행에 나란히 놓이도록 묶는 구조를 남겨 둔다. */
export function groupByStart(entries: Entry[]): { start: string; end: string; items: Entry[] }[] {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const list = map.get(e.start);
    if (list) list.push(e);
    else map.set(e.start, [e]);
  }
  return [...map.entries()]
    .sort((a, b) => minutes(a[0]) - minutes(b[0]))
    .map(([start, items]) => ({ start, end: items[0].end, items }));
}

export default content;
