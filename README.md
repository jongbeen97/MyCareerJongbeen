# 이종빈 · 백엔드 개발자 포트폴리오

React 19 + TypeScript + Vite로 만든 개인 포트폴리오 사이트입니다.

---

## 실행하기

터미널에서 이 폴더로 들어간 뒤 두 줄만 실행하면 됩니다.

```bash
npm install
npm run dev
```

터미널에 나오는 주소(보통 `http://localhost:5173`)를 브라우저에서 열면 됩니다.

> **Node.js가 필요합니다.** 설치되어 있지 않다면 [nodejs.org](https://nodejs.org)에서
> LTS 버전을 받아 설치한 뒤 위 명령을 실행하세요. 터미널에서 `node -v`를 쳤을 때
> 버전이 나오면 준비된 것입니다. (권장 20 이상)

### 그 외 명령어

| 명령어 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 (코드를 고치면 화면이 바로 바뀝니다) |
| `npm run build` | 배포용 파일 생성 → `dist/` 폴더 |
| `npm run preview` | 만들어진 `dist/`를 실제 서버처럼 띄워서 확인 |
| `npm run typecheck` | 타입 오류만 검사 (화면은 띄우지 않음) |

---

## 폴더 구조

```
jongbeen-portfolio/
├─ index.html              페이지 제목 · 검색 결과에 뜨는 설명(meta)
├─ package.json            의존성과 명령어
├─ vite.config.ts          빌드 설정
├─ public/
│  ├─ favicon.svg          브라우저 탭 아이콘
│  └─ decks/               발표자료 이미지
│     ├─ zipmap/   01.jpg … 25.jpg
│     └─ pleegie/  01.jpg … 28.jpg
└─ src/
   ├─ main.tsx             진입점 (건드릴 일 거의 없음)
   └─ App.tsx              ★ 사이트 전체가 이 파일 하나에 있습니다
```

---

## 문서 안내

| 파일 | 용도 |
| --- | --- |
| `README.md` | 실행 방법과 수정 위치 (이 문서) |
| `AGENTS.md` | AI 코딩 도구 공통 규칙 — Antigravity · Cursor · Claude Code |
| `CLAUDE.md` | Claude Code 보충 규칙 |
| `GEMINI.md` | Antigravity 보충 규칙 |
| `CONTENT.md` | 문구를 쓰고 고칠 때의 원칙 |
| `CHANGELOG.md` | 변경 이력 |
| `LICENSE` | 코드는 MIT, 사진·글·발표자료는 사용 불가 |

**AI에게 이 프로젝트 수정을 맡길 때는 `AGENTS.md`를 먼저 읽게 하세요.**
사실 관계를 지어내지 않도록 하는 규칙이 거기 들어 있습니다.

---

## App.tsx 안내

파일 하나에 다 들어있지만, 위에서부터 8개 구역으로 나눠 두었습니다.
고치고 싶은 곳을 찾을 때 이 표를 보세요.

| 구역 | 내용 | 자주 고치는 것 |
| --- | --- | --- |
| 1. TYPES | 데이터 모양 정의 | 프로젝트 추가할 때 |
| 2. STYLES | 전체 CSS | **색상 · 글꼴 · 여백** |
| 3. highlight() | 코드 블록 문법 강조 | 거의 없음 |
| 4. 공용 컴포넌트 | 헤더 · 갤러리 · 버튼 등 | 거의 없음 |
| 5. HOME / 각 페이지 | 화면 구성 | 문구 순서 바꿀 때 |
| 6. PROJECTS | **프로젝트 상세 내용 전부** | 프로젝트 내용 수정 |
| 7. ProjectPage | 상세 페이지 틀 | 거의 없음 |
| 8. App | 페이지 전환 | 거의 없음 |

### 자주 고칠 만한 곳

| 바꾸고 싶은 것 | 찾을 위치 (Ctrl+F) |
| --- | --- |
| 전체 색상 | `--accent:` (STYLES 맨 위) |
| 프로젝트별 색상 | `const HUE` |
| 자기소개 문단 | `const ABOUT` |
| 프로필 표 (이름·거주 등) | `const PROFILE` |
| 강점 3가지 | `const WHY` |
| 일하는 방식 3가지 | `const WAYS` |
| 입사 후 포부 | `const AMBITION` |
| 할 수 있는 일 8가지 | `const CAN_DO` |
| 기술 스택 3단계 | `const STACK` |
| 기술 × 프로젝트 표 | `const MATRIX` |
| 이력 · 타임라인 | `const TIMELINE` |
| 면접 질문 3가지 | `const ASK` |
| 핵심 지표 4개 | `const METRICS` |
| 채용 정보 | `const HIRE` |
| 프로젝트 상세 전부 | `const PROJECTS` |
| 메인 캐릭터 이미지 | `const CHARACTER` (맨 아래) |
| 증명사진 | `const PHOTO` (맨 아래) |

### 프로젝트를 추가하려면

1. `ProjectKey`에 키를 하나 추가합니다.
   ```ts
   export type ProjectKey = "zipmap" | "pleegie" | "basecamp" | "새프로젝트";
   ```
2. `PROJECTS` 객체에 같은 키로 내용을 채웁니다.

**필드를 빠뜨리면 `npm run build`가 실패하며 어디가 비었는지 알려줍니다.**
타입이 대신 검사해 주는 것이니, 오류가 나면 그 줄을 채우면 됩니다.

### 발표자료 이미지가 안 보인다면

`public/decks/` 폴더에 이미지가 있는지 확인하세요. 화면에도 안내가 뜹니다.
하위 경로(예: `example.com/portfolio/`)에 배포한다면 `App.tsx`에서
`const DECK_BASE = "/decks";` 한 줄만 바꾸면 됩니다.

---

## 배포하기 (Vercel)

1. 이 폴더를 GitHub 저장소에 올립니다.
2. [vercel.com](https://vercel.com)에서 **Add New → Project → 저장소 선택**
3. Vite를 자동으로 인식하므로 **설정은 건드리지 않고 Deploy**를 누르면 됩니다.

이후 GitHub에 push할 때마다 자동으로 다시 배포됩니다.

---

## 사이트 구성

```
홈  ─  전체 요약 · 지표 · 프로젝트 미리보기 · 메뉴 입구
│
├─ 자기소개   프로필 · 6문단 소개 · 강점 · 일하는 방식 · 포부 · 면접 질문
├─ 프로젝트   역할 요약 → 프로젝트 3건
│   ├─ 대동여집도   커뮤니티 · 관리자 백엔드
│   ├─ PLEEGIE     프론트엔드 + 서버 이슈 해결
│   └─ Basecamp    캠핑장 · 날씨 도메인 (진행 중)
├─ 기술       할 수 있는 일 8가지 · 숙련도 3단계 · 기술 × 프로젝트 표
├─ 이력       교육 · 프로젝트 · 경력 · 학력
└─ 연락       연락처 · 채용 담당자용 정보
```

각 프로젝트 상세 페이지는 **배경 → 시스템 구성도 → 담당 범위 → 핵심 구현 →
트러블슈팅 → 회고 → 발표자료** 순서로 이어집니다.

---

## 만든 것

- **React 19 + TypeScript** — 라우터 라이브러리 없이 `useState`와 주소 해시로 페이지 전환
- **CSS-in-JS 없이 순수 CSS** — `.jb` 클래스로 범위를 제한해 외부와 충돌하지 않음
- **외부 UI 라이브러리 0개** — 갤러리 · 라이트박스 · 진행바 · 모바일 메뉴 전부 직접 구현
- **시스템 구성도 3개** — SVG로 직접 그림
- **반응형** — 데스크톱 / 태블릿 / 모바일, 모바일은 전체화면 메뉴

---

© 2026 이종빈 · jongbeen97@naver.com