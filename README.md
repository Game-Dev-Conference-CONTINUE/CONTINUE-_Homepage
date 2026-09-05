# GAME OVER? 컨퍼런스 홈페이지

동명대학교 게임 개발 동아리 연합이 여는 게임 개발 컨퍼런스 **GAME OVER?** (약칭 GO) 의 공식 홈페이지입니다.
Next.js(App Router) + TypeScript + Tailwind CSS v4 로 만들어졌고, 모든 페이지가 정적으로 생성되어 GitHub Pages 에 배포됩니다.

**공개 주소** — https://game-dev-conference-continue.github.io/GAMEOVER_Homepage/

> 저장소 이름을 바꾸면 이 주소도 함께 바뀌고 **예전 주소는 되살아나지 않습니다.**
> 이름을 바꾼 뒤에는 반드시 Actions 에서 워크플로를 다시 돌려야 합니다.
> 페이지 안의 자원 경로(`/저장소이름/_next/...`)가 빌드할 때 구워지기 때문에,
> 다시 빌드하지 않으면 화면이 스타일 없이 깨진 채로 남습니다.

UPTRAND 홈페이지와 같은 구조를 씁니다. 운영 방식이 동일하므로 한쪽을 다뤄 봤다면 그대로 통합니다.

## 운영하시는 분께

홈페이지 내용은 **구글 시트에서 수정합니다.** 코드나 git 을 볼 필요가 없습니다.

```
구글 시트 수정  →  [사이트 업데이트] 실행  →  1~2분 뒤 반영
```

자세한 방법, 시트 탭 설명, 문제 해결은 **[관리자 매뉴얼](docs/관리자-매뉴얼.md)** 에 정리되어 있습니다.

## 구조

```
src/
├─ app/
│  ├─ page.tsx              메인 (Hero · About · Program · Venue · FAQ)
│  ├─ sessions/[slug]/      세션별 전용 페이지 (공유 시 미리보기용)
│  └─ speakers/             연사 안내 (섭외 메일에 넣는 주소)
├─ components/              섹션과 공용 UI
├─ data/
│  ├─ content.json          사이트의 유일한 콘텐츠 원본 (시트에서 생성됨)
│  └─ content.ts            타입을 입혀 내보내는 래퍼
└─ lib/asset.ts             public/ 이미지 경로에 배포 경로를 붙임
scripts/
├─ sheet-schema.mjs         시트 탭·열 정의 (양식 생성과 읽기 공용)
├─ sheet-io.mjs             시트 읽기와 탭 모양 검사 (배포·점검 공용)
├─ fetch-sheet.mjs          시트 → content.json (검증 포함)
├─ sheet-check.mjs          시트 상태 점검 (읽기 전용)
├─ sheet-template.mjs       content.json → 시트 양식 CSV (왕복 검증 포함)
└─ flatten-prefetch.mjs     Next.js 정적 내보내기 버그 우회
sheet-template/             구글 시트로 가져올 CSV 8개
docs/관리자-매뉴얼.md        운영자용 문서
```

## 콘텐츠 모델에서 하나만 기억할 것

**타임테이블 · 연사 목록 · 세션 상세가 모두 `일정` 탭 하나에서 나옵니다.**

연사 목록을 따로 관리하지 않기 때문에 타임테이블과 연사 정보가 어긋날 수 없습니다.
한 줄이 곧 한 순서이고, `구분` 값이 그 줄의 성격을 정합니다.

| 구분 값 | 뜻 |
| --- | --- |
| `공통` | 주제를 가리지 않는 순서 (개회식, 키노트, 네트워킹, 폐회) |
| `휴식` | 쉬는 시간·식사. 화면에서 흐리게 처리되고 상세 페이지를 만들지 않습니다 |
| 주제 이름 | `트랙` 탭에 적은 이름 그대로 (기업 / 인디) |

**시작 시각이 같은 줄은 화면에서 한 행에 나란히 놓입니다.** 지금은 트랙을 나누지 않아 한 시각에
한 줄만 서지만, 나중에 병렬 세션이 생기면 그대로 나란히 표현됩니다.
`주소이름`을 적은 줄만 세션 상세 페이지(`/sessions/주소이름/`)가 생깁니다.

## 개발

```bash
npm install
```

```bash
npm run dev
```

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 (http://localhost:3000) |
| `npm run build` | 정적 사이트를 `out/` 에 생성 |
| `npm run sheet:check` | 시트가 배포 가능한 상태인지 점검 (읽기만 함) |
| `npm run content` | 구글 시트를 읽어 `content.json` 갱신 (`SHEET_ID` 필요) |
| `npm run sheet:template` | 현재 내용으로 시트 양식 CSV 재생성 |

`SHEET_ID` 가 없으면 시트를 건너뛰고 저장소의 `content.json` 으로 빌드하므로, 인터넷 없이도 개발할 수 있습니다.

## 배포

`master` 에 푸시하거나 Actions 에서 수동 실행하면 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 이 시트를 읽어 빌드하고 GitHub Pages 에 올립니다. 하루 두 번 자동 실행도 걸려 있습니다.

처음 설정하는 방법은 [관리자 매뉴얼 6번](docs/관리자-매뉴얼.md#6-처음-한-번만-하는-설정) 을 보세요.

## 디자인 기준

확정된 GAME OVER? 아이덴티티를 그대로 옮겼습니다.

- **강조색은 마젠타 `#FF2E88` 하나뿐입니다.** 트랙별 색 구분은 하지 않습니다 — 트랙은 이름과 배치로 구분합니다.
- 배경 딥블랙 `#0D0D12`, 본문 `#F4F4F6`.
  인쇄물의 회색 `#5A5A5A` 는 딥블랙 위에서 읽히지 않아 화면용으로 `#A0A0AC` 를 씁니다.
- **Anton 은 라틴 전용 폰트라 한글에 쓰지 않습니다.** 큰 숫자와 영문 라벨(`.display`)에만 붙이고, 한글은 self-host 하는 Pretendard 가 맡습니다.
- 언더스코어를 대신하는 **커서 블록**(`.cursor-block`)이 로고와 제목 끝에 붙습니다.

토큰은 [`src/app/globals.css`](src/app/globals.css) 상단 `@theme` 블록에 있습니다.
