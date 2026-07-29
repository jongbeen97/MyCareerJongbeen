/* ══════════════════════════════════════════════════════════════════════
   이종빈 백엔드 포트폴리오 — TypeScript + React 단일 파일
   ----------------------------------------------------------------------
   구조
     1. TYPES         화면이 요구하는 데이터 모양을 타입으로 고정
     2. STYLES        디자인 토큰 + 전체 CSS (.jb 로 스코프)
     3. highlight()   코드 블록 문법 강조기
     4. 공용 컴포넌트   Nav / Reveal / Code / Chip ...
     5. HomePage      메인 화면
     6. PROJECTS      프로젝트 데이터 (Record<ProjectKey, Project>)
     7. ProjectPage   상세 화면
     8. App           페이지 전환

   ══════════════════════════════════════════════════════════════════════ */

import React, { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════════════
   1. TYPES
   ══════════════════════════════════════════════════════════════════════ */

export type ProjectKey = "zipmap" | "pleegie" | "basecamp";
/** 헤더 메뉴에 노출되는 주요 페이지 */
export type SubPage = "about" | "work" | "stack" | "history" | "contact";
export type Page = "home" | SubPage | ProjectKey;

export type StepKind = "result" | "learn";
export type Step = [label: string, body: string, kind?: StepKind];

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type ApiRow = [method: HttpMethod, path: string, desc: string];

export interface Fact {
  k: string;
  v?: string;
  s?: string;
  link?: { href: string; text: string };
}

export interface Problem {
  t: string;
  p: string;
}

export interface ScopeBlock {
  badge: string;
  /** true 면 회색 배지 — 제가 만들지 않은 부분 */
  sub?: boolean;
  h: string;
  items: string[];
  memo?: string;
}

export interface Impl {
  h: string;
  before: string;
  flow?: string[];
  code: string;
  caption: string;
  after?: string;
  code2?: string;
  caption2?: string;
}

export interface Trouble {
  kick: string;
  h: string;
  steps: Step[];
}

export interface Retro {
  good: string[];
  bad: string[];
  next: string[];
}

export interface PagerLink {
  key: ProjectKey;
  t: string;
}

/** 발표자료 슬라이드 묶음. 이미지는 public/decks/<base>/01.jpg … 로 둡니다. */
export interface Deck {
  base: string;
  count: number;
  label: string;
}

export interface RepoLink {
  label: string;
  text: string;
  href: string;
  foot: string;
}

export type CardTag = [label: string, highlighted: boolean];

/** 프로젝트별 고유 색. CSS 변수로 주입해 그 페이지 전체 강조색을 바꿉니다. */
export interface Hue {
  a: string;
  lt: string;
  deep: string;
  soft: string;
  glow: string;
  grad: string;
}

const HUE = {
  /** 대동여집도 — 지도 · 초록 */
  emerald: {
    a: "#0A8C64", lt: "#45C89A", deep: "#046B4B",
    soft: "rgba(10,140,100,.09)", glow: "rgba(10,140,100,.22)",
    grad: "linear-gradient(135deg,#0A8C64,#2FB183 55%,#45C89A)",
  },
  /** PLEEGIE — 식재료 · 시장 · 따뜻한 주황 */
  amber: {
    a: "#B9631A", lt: "#F0A85C", deep: "#8A4910",
    soft: "rgba(185,99,26,.10)", glow: "rgba(185,99,26,.24)",
    grad: "linear-gradient(135deg,#A9540F,#D4842A 55%,#F0A85C)",
  },
  /** Basecamp — 캠핑 · 하늘 · 날씨 */
  sky: {
    a: "#1B6E9E", lt: "#5FB6E0", deep: "#0F4E73",
    soft: "rgba(27,110,158,.10)", glow: "rgba(27,110,158,.24)",
    grad: "linear-gradient(135deg,#12587F,#2E8CC0 55%,#5FB6E0)",
  },
} as const satisfies Record<string, Hue>;

/** Hue 를 CSS 변수로 변환 */
const hueVars = (h: Hue): React.CSSProperties =>
  ({
    "--accent": h.a,
    "--accent-lt": h.lt,
    "--accent-deep": h.deep,
    "--accent-soft": h.soft,
    "--accent-glow": h.glow,
    "--grad": h.grad,
  } as React.CSSProperties);

export interface Project {
  /* 메인 카드 */
  index: string;
  no: string;
  when: string;
  title: string;
  sub: string;
  cardDesc: string;
  cardTags: CardTag[];
  myPartLabel: string;
  myPartText: string;
  /** 진행 중 표시 (예: "진행 중"). 값이 있으면 카드에 배지가 붙습니다. */
  status?: string;
  /** 메인 카드에 쓸 표지 이미지. 없으면 "준비 중" 자리표시가 나옵니다. */
  cover?: string;

  /* 상세 히어로 */
  lead: string;
  facts: Fact[];

  /* 01 배경 */
  bgTitle: string;
  bgLead: string;
  problems: Problem[];

  /** 이 프로젝트의 고유 강조색 */
  hue: Hue;

  /* 02 시스템 구성 */
  archLead: string;
  Diagram: React.FC<{ h: Hue }>;
  legend: [color: string | null, label: string][];
  archCap: string;

  /* 03 담당 범위 */
  scopeTitle: string;
  scopeLead: string;
  scope: ScopeBlock[];
  apiTitle: string;
  api: ApiRow[];
  apiNote: string;

  /* 04 핵심 구현 */
  implLead: string;
  impls: Impl[];

  /* 05 트러블슈팅 */
  tsLead: string;
  troubles: Trouble[];

  /* 06 회고 */
  retro: Retro;

  /* 발표자료 (선택) */
  deck?: Deck;

  /* 이동 · 연락 */
  prev: PagerLink | null;
  next: PagerLink | null;
  contactLead: string;
  repo: RepoLink;
}

/* ══════════════════════════════════════════════════════════════════════
   2. STYLES
   ══════════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');

.jb{
  /* 색 — 바탕 */
  --bg:#F5F7F8;
  --surface:#FFFFFF;
  --surface-2:#EDF1F2;
  --ink:#08121C;
  --ink-2:#0E1B27;
  --ink-3:#16283A;
  --text:#0D1720;
  --text-2:#394856;
  --muted:#6A7885;
  --on-dark:rgba(255,255,255,.74);
  --on-dark-2:rgba(255,255,255,.46);
  --line:rgba(8,18,28,.085);
  --line-2:rgba(8,18,28,.05);
  --line-d:rgba(255,255,255,.10);

  /* 색 — 강조 (프로젝트 페이지에서 덮어씁니다) */
  --accent:#0A8C64;
  --accent-lt:#45C89A;
  --accent-deep:#046B4B;
  --accent-soft:rgba(10,140,100,.09);
  --accent-glow:rgba(10,140,100,.22);
  --grad:linear-gradient(135deg,#0A8C64,#2FB183 55%,#45C89A);
  --warn:#CE4F38;
  --warn-soft:rgba(206,79,56,.085);

  /* 형태 */
  --r:18px;
  --r-sm:10px;
  --r-pill:999px;
  --sh-sm:0 1px 2px rgba(8,18,28,.04), 0 2px 6px rgba(8,18,28,.05);
  --sh-md:0 10px 30px -14px rgba(8,18,28,.2);
  --sh-lg:0 30px 70px -30px rgba(8,18,28,.32);
  --sh-glow:0 24px 60px -26px var(--accent-glow);

  /* 글꼴 */
  --body:"Pretendard Variable","Pretendard",-apple-system,system-ui,"Malgun Gothic",sans-serif;
  --mono:"JetBrains Mono","IBM Plex Mono",ui-monospace,Menlo,monospace;
  --wrap:1160px;

  background:var(--bg);
  background-image:
    radial-gradient(900px 460px at 82% 4%, rgba(10,140,100,.055), transparent 62%),
    radial-gradient(760px 420px at 8% 42%, rgba(29,110,158,.045), transparent 60%);
  background-attachment:fixed;
  color:var(--text);
  font-family:var(--body); font-size:16.5px; line-height:1.75;
  letter-spacing:-.011em; -webkit-font-smoothing:antialiased;
  /* 한글은 단어 단위로 끊고, 긴 영문·경로는 필요할 때만 줄바꿈 */
  word-break:keep-all; overflow-wrap:break-word;
  /* 의도한 가로 스크롤은 .arch / .code 안에서만 일어나게 한다 */
  overflow-x:hidden;
}
.jb *{box-sizing:border-box}
.jb img{max-width:100%;height:auto;display:block}
.jb a{color:inherit}
.jb :focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}
.jb button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;text-align:left}
.jb code.mono,.jb span.mono{font-family:var(--mono);font-size:.92em;background:var(--surface-2);
  padding:1px 6px;border-radius:5px;letter-spacing:-.01em}

.jb .grain{position:absolute;inset:0;pointer-events:none;opacity:.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.jb .wrap{max-width:var(--wrap);margin:0 auto;padding:0 32px}
.jb section{padding:112px 0;scroll-margin-top:78px}
.jb .sec-head{max-width:74ch;margin-bottom:52px}
.jb .eyebrow{font-family:var(--mono);font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--accent);margin:0 0 16px;display:flex;align-items:center;gap:10px}
.jb .eyebrow::before{content:"";width:26px;height:2px;border-radius:2px;
  background:linear-gradient(90deg,var(--accent),var(--accent-lt))}
.jb h2.sec{font-size:clamp(29px,3.9vw,45px);font-weight:700;line-height:1.24;
  margin:0 0 16px;letter-spacing:-.035em}
.jb .sec-lead{color:var(--muted);margin:0;font-size:16.5px;line-height:1.8}
.jb .sec-lead b{color:var(--text-2);font-weight:600}

/* ── 모바일 메뉴 ── */
.jb .nav .nav-toggle{display:none;width:40px;height:40px;border-radius:12px;position:relative;
  flex:none;transition:background .2s}
.jb .nav-toggle span{position:absolute;left:11px;width:18px;height:2px;border-radius:2px;
  background:#fff;transition:transform .28s cubic-bezier(.2,.7,.3,1),opacity .2s}
.jb .nav-toggle span:first-child{top:16px}
.jb .nav-toggle span:last-child{top:22px}
.jb .nav.scrolled .nav-toggle span{background:var(--text)}
.jb .nav.open .nav-toggle span:first-child{transform:translateY(3px) rotate(45deg)}
.jb .nav.open .nav-toggle span:last-child{transform:translateY(-3px) rotate(-45deg)}
.jb .nav.open .nav-toggle span{background:#fff}

.jb .nav-panel{position:fixed;inset:0;z-index:55;background:rgba(8,18,28,.97);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  display:flex;align-items:center;padding:88px 24px 40px;animation:jbFade .2s ease}
.jb .nav-panel nav{display:grid;gap:6px;width:100%}
.jb .nav-panel button{display:grid;grid-template-columns:34px 1fr 24px;align-items:center;gap:14px;
  padding:20px 18px;border-radius:14px;color:rgba(255,255,255,.9);font-size:22px;font-weight:700;
  letter-spacing:-.03em;opacity:0;transform:translateY(10px);
  animation:jbRise .4s cubic-bezier(.2,.7,.3,1) forwards;transition:background .2s}
.jb .nav-panel button:active{background:rgba(255,255,255,.08)}
.jb .nav-panel button.on{background:rgba(69,200,154,.14);color:#fff}
.jb .nav-panel .mn{font-family:var(--mono);font-size:12px;font-weight:500;color:var(--accent-lt);letter-spacing:.1em}
.jb .nav-panel .ma{color:var(--accent-lt);font-size:17px;font-weight:400}

/* ── 읽기 진행 바 ── */
.jb .progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:70;background:transparent;pointer-events:none}
.jb .progress i{display:block;height:100%;background:var(--grad);
  box-shadow:0 0 12px var(--accent-glow);transition:width .1s linear}

/* ── 고정 내비게이션 ── */
/* 높이·여백은 절대 바뀌지 않는다. 스크롤 시 배경만 서서히 나타난다. */
.jb .nav{position:fixed;top:0;left:0;right:0;z-index:60;height:68px;
  display:flex;align-items:center;background:transparent;
  border-bottom:1px solid transparent;
  transition:background .28s ease,border-color .28s ease,box-shadow .28s ease}
.jb .nav-in{width:100%;max-width:var(--wrap);margin:0 auto;padding:0 32px;
  display:flex;align-items:center;justify-content:space-between;gap:24px}
.jb .nav .brand{font-family:var(--mono);font-size:12.5px;letter-spacing:.1em;color:#fff;
  display:inline-flex;align-items:center;gap:10px;transition:color .3s}
.jb .nav .brand i{width:7px;height:7px;border-radius:50%;background:var(--accent-lt);display:block}
.jb .nav nav{display:flex;gap:4px}
.jb .nav nav a,.jb .nav nav button{font-size:14px;color:rgba(255,255,255,.68);padding:8px 13px;
  border-radius:var(--r-pill);text-decoration:none;transition:color .2s,background .2s}
.jb .nav nav a:hover,.jb .nav nav button:hover{color:#fff;background:rgba(255,255,255,.09)}
.jb .nav.scrolled{background:rgba(255,255,255,.9);
  backdrop-filter:blur(20px) saturate(1.8);-webkit-backdrop-filter:blur(20px) saturate(1.8);
  border-bottom-color:var(--line);box-shadow:0 4px 22px -14px rgba(8,18,28,.2)}
.jb .nav.scrolled .brand{color:var(--text)}
.jb .nav.scrolled nav a,.jb .nav.scrolled nav button{color:var(--muted)}
.jb .nav.scrolled nav a:hover,.jb .nav.scrolled nav button:hover{color:var(--text);background:var(--surface-2)}

/* ── 히어로 ── */
.jb .hero{background:var(--ink);color:#fff;position:relative;overflow:hidden;padding:150px 0 96px}
.jb .glow{position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(720px 420px at 10% -8%, var(--accent-glow), transparent 60%),
    radial-gradient(600px 400px at 86% 2%, rgba(69,200,154,.14), transparent 62%),
    radial-gradient(900px 520px at 50% 108%, rgba(29,110,158,.16), transparent 66%),
    radial-gradient(420px 300px at 74% 62%, rgba(10,140,100,.09), transparent 64%)}
.jb .grid-lines{position:absolute;inset:0;pointer-events:none;opacity:.5;
  background-image:linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size:64px 64px;
  mask-image:radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%);
  -webkit-mask-image:radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%)}
.jb .hero .wrap,.jb .p-hero .wrap{position:relative;z-index:2}
.jb .hero-main{display:grid;grid-template-columns:1fr 280px;gap:56px;align-items:center}

.jb .pill{display:inline-flex;align-items:center;gap:9px;font-family:var(--mono);font-size:11.5px;
  letter-spacing:.13em;padding:7px 14px;border-radius:var(--r-pill);
  background:rgba(63,191,146,.13);color:var(--accent-lt);border:1px solid rgba(63,191,146,.22)}
.jb .pill i{width:6px;height:6px;border-radius:50%;background:var(--accent-lt);display:block;
  box-shadow:0 0 0 3px rgba(63,191,146,.22)}

.jb h1{font-size:clamp(54px,8.2vw,92px);font-weight:800;line-height:.96;
  letter-spacing:-.05em;margin:26px 0 0}
.jb h1 .sub{display:block;font-size:clamp(16px,2vw,21px);font-weight:500;letter-spacing:-.01em;
  color:var(--accent-lt);margin-top:20px;font-family:var(--mono)}
.jb .hero-lead{font-size:18.5px;line-height:1.85;color:var(--on-dark);max-width:50ch;margin:28px 0 0}
.jb .hero-lead b{color:#fff;font-weight:600}
.jb .hero-lead .hl{color:#fff;font-weight:600;position:relative;
  background:linear-gradient(transparent 64%, rgba(69,200,154,.34) 64%, rgba(69,200,154,.1) 100%)}

.jb .character{margin:0;position:relative;display:flex;justify-content:center;align-items:flex-end;
  animation:jbFloat 6s ease-in-out infinite}
.jb .character img{height:min(56vh,600px);width:auto;max-width:100%;position:relative;z-index:1;
  filter:drop-shadow(0 26px 44px rgba(0,0,0,.5))}
.jb .character::before{content:"";position:absolute;left:50%;bottom:6px;transform:translateX(-50%);
  width:78%;aspect-ratio:1;border-radius:50%;
  background:radial-gradient(closest-side, var(--accent-glow), transparent 72%);
  filter:blur(6px)}
.jb .character::after{content:"";position:absolute;left:50%;bottom:-2px;transform:translateX(-50%);
  width:56%;height:16px;border-radius:50%;background:rgba(0,0,0,.34);filter:blur(9px)}
@keyframes jbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}

.jb .portrait{margin:0;border-radius:var(--r);overflow:hidden;position:relative;
  border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);
  box-shadow:0 30px 70px -30px rgba(0,0,0,.7), 0 0 60px -20px var(--accent-glow)}
.jb .portrait::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(180deg,transparent 62%,rgba(8,18,28,.28))}
.jb .portrait img{width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;object-position:center 22%;
  filter:grayscale(.12) contrast(1.02)}
.jb .portrait figcaption{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;
  color:var(--on-dark-2);padding:11px 0;text-align:center;border-top:1px solid rgba(255,255,255,.1)}

.jb .cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:38px}
.jb .btn{display:inline-flex;align-items:center;gap:9px;text-decoration:none;
  font-size:14.5px;font-weight:600;padding:13px 22px;border-radius:var(--r-pill);
  border:1px solid rgba(255,255,255,.2);color:#fff;transition:all .22s ease}
.jb .btn:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.34);transform:translateY(-1px)}
.jb .btn.primary{background:var(--grad);border-color:transparent;color:#fff;
  box-shadow:0 10px 28px -10px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,.18)}
.jb .btn.primary:hover{filter:brightness(1.1);transform:translateY(-2px);
  box-shadow:0 16px 36px -12px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,.24)}

/* ── 여정 레일 ── */
.jb .route{margin-top:76px;padding-top:40px;border-top:1px solid var(--line-d)}
.jb .route-head{font-family:var(--mono);font-size:11px;letter-spacing:.18em;
  color:var(--on-dark-2);margin:0 0 26px;text-transform:uppercase}
.jb .rail{display:flex;flex-wrap:wrap;align-items:stretch;gap:8px;list-style:none;margin:0;padding:0}
.jb .rail li{opacity:0;transform:translateY(8px);animation:jbRise .5s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes jbRise{to{opacity:1;transform:none}}
.jb .stop{display:block;padding:13px 16px;border-radius:14px;background:rgba(255,255,255,.045);
  border:1px solid rgba(255,255,255,.08);min-width:0;height:100%;transition:background .25s,border-color .25s}
.jb .stop:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16)}
.jb .stop .yr{font-family:var(--mono);font-size:10.5px;letter-spacing:.09em;color:var(--accent-lt);display:block}
.jb .stop .what{font-size:13.5px;font-weight:600;color:rgba(255,255,255,.92);display:block;margin-top:5px;line-height:1.4}
.jb .stop .note{font-size:11.5px;color:var(--on-dark-2);display:block;margin-top:3px;line-height:1.4}
.jb .rail .arrow{display:flex;align-items:center;color:rgba(255,255,255,.2);font-size:13px;padding:0 1px}
.jb .stop.now{background:var(--accent);border-color:var(--accent)}
.jb .stop.now .yr{color:rgba(255,255,255,.86)}
.jb .stop.now .what{color:#fff}
.jb .stop.now .note{color:rgba(255,255,255,.78)}
.jb .stop.live{border-color:rgba(63,191,146,.34);background:rgba(63,191,146,.1)}

/* ── 지표 카드 (히어로에 겹침) ── */
.jb .metrics{position:relative;z-index:5;margin-top:-52px}
.jb .metrics .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.jb .metric{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:28px 24px 24px;box-shadow:var(--sh-md);position:relative;overflow:hidden;
  transition:transform .3s cubic-bezier(.2,.7,.3,1),box-shadow .3s}
.jb .metric::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad)}
.jb .metric:hover{transform:translateY(-3px);box-shadow:var(--sh-lg)}
.jb .metric .n{font-size:40px;font-weight:800;line-height:1;letter-spacing:-.05em;
  background:linear-gradient(135deg,var(--text),var(--accent-deep));
  -webkit-background-clip:text;background-clip:text;color:transparent}
.jb .metric .n em{font-style:normal;font-size:17px;font-weight:700;margin-left:3px;letter-spacing:-.02em;
  -webkit-text-fill-color:var(--accent);color:var(--accent)}
.jb .metric .l{font-size:13.5px;color:var(--muted);margin-top:12px;line-height:1.6}

/* ── 강점 ── */
.jb .why{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.jb .why article{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:32px 28px;transition:box-shadow .25s,transform .25s}
.jb .why article{position:relative;overflow:hidden}
.jb .why article::after{content:"";position:absolute;inset:0;opacity:0;transition:opacity .3s;
  background:radial-gradient(420px 200px at 100% 0%, var(--accent-soft), transparent 70%)}
.jb .why article:hover{box-shadow:var(--sh-glow);transform:translateY(-3px);border-color:var(--accent-soft)}
.jb .why article:hover::after{opacity:1}
.jb .why article > *{position:relative;z-index:1}
.jb .why .tagline{display:inline-block;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;
  color:var(--accent);background:var(--accent-soft);padding:5px 10px;border-radius:var(--r-pill);margin-bottom:18px}
.jb .why h3{font-size:20px;font-weight:700;margin:0 0 12px;line-height:1.4;letter-spacing:-.025em}
.jb .why p{margin:0;font-size:15px;color:var(--muted);line-height:1.8}

/* ── 프로젝트 카드 ── */
.jb .cards{display:grid;gap:18px}
.jb .card{display:grid;grid-template-columns:1fr 296px;gap:40px;align-items:center;
  width:100%;background:var(--surface);border:1px solid var(--line);
  border-radius:22px;padding:38px 40px 32px;position:relative;overflow:hidden;
  transition:transform .3s cubic-bezier(.2,.7,.3,1),box-shadow .3s,border-color .3s}
.jb .card-body{min-width:0}
.jb .card-cover{border-radius:12px;overflow:hidden;border:1px solid var(--line);
  line-height:0;background:var(--bg);transition:transform .3s cubic-bezier(.2,.7,.3,1)}
.jb .card:hover .card-cover{transform:scale(1.02)}
.jb .card-cover img{width:100%;height:auto;display:block}
.jb .cover-wip{aspect-ratio:1316/924;border:1.5px dashed var(--line);border-radius:12px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;line-height:1.5}
.jb .cover-wip span{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;color:var(--muted)}
.jb .cover-wip b{font-size:17px;font-weight:700;color:var(--accent);letter-spacing:-.02em}
.jb .cover-wip em{font-style:normal;font-size:11.5px;color:var(--muted)}
.jb .card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;
  background:linear-gradient(180deg,var(--accent),var(--accent-lt));
  opacity:0;transition:opacity .35s}
.jb .card::after{content:"";position:absolute;inset:0;opacity:0;transition:opacity .35s;pointer-events:none;
  background:radial-gradient(560px 260px at 88% 0%, var(--accent-soft), transparent 68%)}
.jb .card:hover{transform:translateY(-5px);box-shadow:var(--sh-glow);border-color:var(--accent-soft)}
.jb .card:hover::before,.jb .card:hover::after{opacity:1}
.jb .card-body,.jb .card-cover{position:relative;z-index:1}
.jb .card-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}
.jb .card-no{font-family:var(--mono);font-size:11.5px;letter-spacing:.13em;color:var(--accent);
  background:var(--accent-soft);padding:5px 11px;border-radius:var(--r-pill)}
.jb .card-when{font-family:var(--mono);font-size:12px;color:var(--muted);margin-left:auto}
.jb .card-status{font-size:11.5px;font-weight:600;letter-spacing:.02em;color:var(--accent);
  background:var(--accent-soft);border:1px solid rgba(11,138,99,.2);
  padding:4px 11px;border-radius:var(--r-pill);display:inline-flex;align-items:center;gap:6px}
.jb .card-status i{width:5px;height:5px;border-radius:50%;background:var(--accent);display:block;
  animation:jbPulse 2s ease-in-out infinite}
@keyframes jbPulse{0%,100%{opacity:1}50%{opacity:.35}}
.jb .card h3{font-size:clamp(28px,4vw,38px);font-weight:800;margin:0 0 8px;
  letter-spacing:-.04em;line-height:1.1}
.jb .card .sub{font-family:var(--mono);font-size:13.5px;color:var(--muted);margin:0 0 20px;letter-spacing:-.01em}
.jb .card .desc{font-size:16px;color:var(--text-2);max-width:64ch;margin:0 0 24px;line-height:1.8}
.jb .card .desc b{color:var(--text);font-weight:600}
.jb .card-keys{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:26px}
.jb .card-foot{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;
  border-top:1px solid var(--line-2);padding-top:22px}
.jb .card-role{font-size:14.5px;color:var(--muted);max-width:56ch;line-height:1.7}
.jb .card-role b{color:var(--accent);font-weight:600;display:block;font-family:var(--mono);
  font-size:10.5px;letter-spacing:.14em;margin-bottom:6px}
.jb .card-go{display:inline-flex;align-items:center;gap:10px;font-size:14.5px;font-weight:600;
  color:var(--text);white-space:nowrap}
.jb .card-go span{width:40px;height:40px;border-radius:50%;border:1px solid var(--line);
  display:grid;place-items:center;transition:all .3s cubic-bezier(.2,.7,.3,1);font-size:15px}
.jb .card:hover .card-go span{background:var(--grad);border-color:transparent;color:#fff;
  transform:translateX(4px);box-shadow:0 8px 20px -8px var(--accent-glow)}

/* ── 태그 ── */
.jb .tag{font-size:12.5px;font-weight:500;padding:6px 13px;border-radius:var(--r-pill);
  background:var(--surface-2);color:var(--muted);letter-spacing:-.01em;
  border:1px solid transparent;transition:all .2s}
.jb .tag.on{background:var(--accent-soft);color:var(--accent);font-weight:600;
  border-color:color-mix(in srgb, var(--accent) 22%, transparent)}

/* ── 코드 ── */
.jb .code{margin:22px 0 0;border-radius:14px;overflow:hidden;box-shadow:var(--sh-md);
  background:linear-gradient(160deg,#0C1926,#08121C 60%);border:1px solid rgba(255,255,255,.06)}
.jb .code-head{font-family:var(--mono);font-size:11.5px;color:rgba(255,255,255,.46);
  padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:9px}
.jb .code-head::before{content:"";width:7px;height:7px;border-radius:50%;background:rgba(63,191,146,.55);flex:none}
.jb .code pre{margin:0;padding:20px 22px 22px;overflow-x:auto;color:#DCE6E2;
  font-family:var(--mono);font-size:12.5px;line-height:1.85}
.jb .code pre .c{color:#5F7683;font-style:italic}
.jb .code pre .k{color:#7FC4F5}
.jb .code pre .s{color:#E8B27A}
.jb .code pre .a{color:#59D6A6}

/* ── 기술 스택 ── */
.jb .stack{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.jb .stack > div{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:30px 28px;position:relative;overflow:hidden;transition:transform .3s cubic-bezier(.2,.7,.3,1),box-shadow .3s}
.jb .stack > div::before{content:"";position:absolute;top:0;left:0;right:0;height:3px}
.jb .stack > div:nth-child(1)::before{background:linear-gradient(90deg,#0A8C64,#45C89A)}
.jb .stack > div:nth-child(2)::before{background:linear-gradient(90deg,#1B6E9E,#5FB6E0)}
.jb .stack > div:nth-child(3)::before{background:linear-gradient(90deg,#8C93A0,#C3C9D1)}
.jb .stack > div:hover{transform:translateY(-3px);box-shadow:var(--sh-md)}
.jb .lv-row{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.jb .stack .lv{display:inline-block;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;
  padding:5px 10px;border-radius:var(--r-pill);margin:0}
.jb .stack > div:nth-child(1) .lv{background:rgba(10,140,100,.09);color:#0A8C64}
.jb .stack > div:nth-child(2) .lv{background:rgba(27,110,158,.09);color:#1B6E9E}
.jb .stack > div:nth-child(3) .lv{background:var(--surface-2);color:var(--muted)}
.jb .stack .cnt{margin-left:auto;font-family:var(--mono);font-size:11.5px;color:var(--muted)}
.jb .stack .cnt::after{content:" 개";letter-spacing:0}
.jb .stack h3{font-size:18px;font-weight:700;margin:0 0 16px;letter-spacing:-.025em}
.jb .stack ul{list-style:none;margin:0;padding:0}
.jb .stack li{padding:10px 0;border-bottom:1px solid var(--line-2);font-size:14.5px;font-weight:500;
  display:flex;justify-content:space-between;gap:14px;align-items:baseline;transition:color .2s}
.jb .stack li:hover{color:var(--accent)}
.jb .stack li:last-child{border-bottom:0}
.jb .stack li span{color:var(--muted);font-size:12px;font-family:var(--mono);text-align:right;font-weight:400}
.jb .stack .memo{font-size:13.5px;color:var(--muted);margin:18px 0 0;line-height:1.75;
  padding-top:16px;border-top:1px solid var(--line-2)}

/* ── 일하는 방식 ── */
.jb .ways{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.jb .way{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:30px 28px}
.jb .way .no{font-family:var(--mono);font-size:11.5px;color:var(--accent);letter-spacing:.1em}
.jb .way h3{font-size:19px;font-weight:700;margin:10px 0 12px;letter-spacing:-.025em}
.jb .way p{margin:0;font-size:15px;color:var(--muted);line-height:1.8}

/* ── 자기소개 ── */
.jb .about{display:grid;grid-template-columns:1fr 372px;gap:56px;align-items:start;margin-bottom:44px}
.jb .about-text p{font-size:17.5px;line-height:1.95;color:var(--text-2);margin:0 0 22px;
  letter-spacing:-.015em}
.jb .about-text p:last-child{margin-bottom:0}
.jb .about-text b{color:var(--text);font-weight:600}

.jb .profile{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:0 26px 6px;box-shadow:var(--sh-md);position:relative;overflow:hidden}
.jb .profile::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad)}
.jb .profile-head{display:flex;align-items:center;gap:9px;font-family:var(--mono);font-size:10.5px;
  letter-spacing:.18em;color:var(--muted);padding:22px 0 14px}
.jb .profile-head .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);
  box-shadow:0 0 0 3px var(--accent-soft)}
.jb .profile dl{display:grid;grid-template-columns:74px 1fr;gap:0 18px;margin:0}
.jb .profile dt{font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--muted);
  padding:14px 0;border-top:1px solid var(--line-2);line-height:1.5}
.jb .profile dd{margin:0;font-size:14.5px;font-weight:500;padding:14px 0;
  border-top:1px solid var(--line-2);line-height:1.55;letter-spacing:-.015em}

/* ── 섹션 안의 소제목 ── */
.jb .subhead{display:flex;align-items:center;gap:16px;margin:68px 0 26px}
.jb .subhead .n{font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;color:var(--accent);
  background:var(--accent-soft);padding:5px 11px;border-radius:var(--r-pill);flex:none}
.jb .subhead h3{font-size:21px;font-weight:700;letter-spacing:-.03em;margin:0;flex:none}
.jb .subhead .ln{flex:1;height:1px;background:linear-gradient(90deg,var(--line),transparent)}

/* ── 홈: 한눈에 보기 ── */
.jb .glance{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.jb .glance > div{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:26px 26px 28px;position:relative;overflow:hidden}
.jb .glance > div::before{content:"";position:absolute;top:0;left:0;width:56px;height:3px;background:var(--grad)}
.jb .gl-k{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;color:var(--accent);margin-bottom:14px}
.jb .glance p{margin:0;font-size:15px;color:var(--muted);line-height:1.85}
.jb .glance p b{color:var(--text);font-weight:600}

/* ── 홈: 프로젝트 미리보기 ── */
.jb .minis{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.jb .mini{display:block;width:100%;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r);padding:14px 14px 22px;text-align:left;position:relative;overflow:hidden;
  transition:transform .3s cubic-bezier(.2,.7,.3,1),box-shadow .3s,border-color .3s}
.jb .mini:hover{transform:translateY(-4px);box-shadow:var(--sh-glow);border-color:var(--accent-soft)}
.jb .mini-img{display:block;border-radius:12px;overflow:hidden;border:1px solid var(--line);
  background:var(--bg);line-height:0;margin-bottom:18px}
.jb .mini-img img{width:100%;height:auto;display:block}
.jb .mini-img .cover-wip{border:0;border-radius:0}
.jb .mini-top{display:flex;align-items:center;gap:8px;padding:0 8px;margin-bottom:8px}
.jb .mini-no{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;color:var(--accent)}
.jb .mini-live{font-size:10.5px;font-weight:600;color:var(--accent);background:var(--accent-soft);
  padding:3px 9px;border-radius:var(--r-pill)}
.jb .mini-t{display:block;padding:0 8px;font-size:22px;font-weight:800;letter-spacing:-.04em;line-height:1.2}
.jb .mini-s{display:block;padding:0 8px;font-family:var(--mono);font-size:12px;color:var(--muted);
  margin-top:7px;line-height:1.55}
.jb .mini-role{display:inline-block;margin:14px 8px 0;font-size:12.5px;font-weight:600;color:var(--accent);
  background:var(--accent-soft);padding:6px 12px;border-radius:var(--r-pill)}

/* ── 더 보기 버튼 ── */
.jb .more{display:inline-flex;align-items:center;gap:10px;font-size:14.5px;font-weight:600;
  padding:13px 22px;border:1px solid var(--line);border-radius:var(--r-pill);background:var(--surface);
  transition:all .25s}
.jb .more span{transition:transform .25s}
.jb .more:hover{border-color:var(--accent);color:var(--accent);box-shadow:var(--sh-md)}
.jb .more:hover span{transform:translateX(4px)}

/* ── 홈: 메뉴 입구 ── */
.jb .entries{display:grid;gap:12px}
.jb .entry{display:grid;grid-template-columns:70px 1fr auto 44px;align-items:center;gap:26px;
  width:100%;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:26px 28px;position:relative;overflow:hidden;
  transition:transform .28s cubic-bezier(.2,.7,.3,1),box-shadow .28s,border-color .28s}
.jb .entry::after{content:"";position:absolute;inset:0;opacity:0;transition:opacity .3s;pointer-events:none;
  background:linear-gradient(90deg,var(--accent-soft),transparent 55%)}
.jb .entry:hover{transform:translateX(6px);box-shadow:var(--sh-glow);border-color:var(--accent-soft)}
.jb .entry:hover::after{opacity:1}
.jb .entry > *{position:relative;z-index:1}
.jb .entry-no{font-family:var(--mono);font-size:26px;font-weight:600;letter-spacing:-.04em;
  color:var(--line);transition:color .28s}
.jb .entry:hover .entry-no{color:var(--accent)}
.jb .entry-main{display:block;min-width:0}
.jb .entry-t{display:block;font-size:22px;font-weight:700;letter-spacing:-.035em}
.jb .entry-d{display:block;font-size:14.5px;color:var(--muted);margin-top:5px;line-height:1.6}
.jb .entry-meta{font-family:var(--mono);font-size:11.5px;color:var(--muted);text-align:right;
  white-space:nowrap;letter-spacing:-.01em}
.jb .entry-arr{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);
  display:grid;place-items:center;font-size:16px;transition:all .3s cubic-bezier(.2,.7,.3,1)}
.jb .entry:hover .entry-arr{background:var(--grad);border-color:transparent;color:#fff;
  box-shadow:0 8px 20px -8px var(--accent-glow)}

/* ── 기술: 프로젝트별 사용 매트릭스 ── */
.jb .matrix-wrap{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  overflow:hidden;box-shadow:var(--sh-sm)}
.jb .matrix{width:100%;border-collapse:collapse;font-size:14.5px}
.jb .matrix th{background:var(--surface-2);padding:14px 18px;text-align:center;font-weight:500;
  border-bottom:1px solid var(--line)}
.jb .matrix th:first-child{text-align:left;font-family:var(--mono);font-size:10.5px;
  letter-spacing:.16em;color:var(--muted)}
.jb .matrix th .mh{display:block;font-family:var(--mono);font-size:11px;letter-spacing:.12em;font-weight:600}
.jb .matrix th em{display:block;font-style:normal;font-size:12.5px;color:var(--muted);margin-top:3px}
.jb .matrix td{padding:12px 18px;border-top:1px solid var(--line-2);text-align:center}
.jb .matrix td.mt{text-align:left;font-weight:500;color:var(--text)}
.jb .matrix tr:hover td{background:var(--bg)}
.jb .matrix .mk{display:inline-block;width:9px;height:9px;border-radius:50%}

/* ── 연락 페이지 ── */
.jb .reach{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:8px}
.jb .reach a{display:block;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:30px 28px;text-decoration:none;position:relative;overflow:hidden;
  transition:transform .28s cubic-bezier(.2,.7,.3,1),box-shadow .28s,border-color .28s}
.jb .reach a::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad);
  opacity:0;transition:opacity .28s}
.jb .reach a:hover{transform:translateY(-4px);box-shadow:var(--sh-glow);border-color:var(--accent-soft)}
.jb .reach a:hover::before{opacity:1}
.jb .reach .l{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;
  color:var(--accent);margin-bottom:12px}
.jb .reach .v{display:block;font-family:var(--mono);font-size:16px;letter-spacing:-.02em;
  word-break:break-all;font-weight:500}
.jb .reach .g{display:block;font-size:13px;color:var(--muted);margin-top:16px;
  padding-top:14px;border-top:1px solid var(--line-2);transition:color .28s}
.jb .reach a:hover .g{color:var(--accent)}

.jb .hire{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line);
  border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.jb .hire > div{background:var(--surface);padding:24px 26px}
.jb .hire .hk{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;color:var(--muted);margin-bottom:10px}
.jb .hire .hv{font-size:15.5px;font-weight:600;line-height:1.6;letter-spacing:-.02em}

/* ── 페이지 헤더 + 사진 ── */
.jb .p-head-grid{display:grid;grid-template-columns:1fr 216px;gap:56px;align-items:center}

/* ── 프로필 카드 상단 ── */
.jb .profile-top{display:flex;align-items:center;gap:16px;padding:24px 0 20px}
.jb .profile-top img{width:56px;height:56px;border-radius:14px;object-fit:cover;object-position:top center;
  border:1px solid var(--line)}
.jb .profile-top b{display:block;font-size:17px;font-weight:700;letter-spacing:-.03em}
.jb .profile-top span{display:block;font-size:13px;color:var(--muted);margin-top:3px}
.jb .profile .profile-head{padding:0 0 14px}

/* ── 자기소개 문단 ── */
.jb .ab{padding:0 0 30px;margin-bottom:30px;border-bottom:1px solid var(--line-2)}
.jb .ab:last-child{border-bottom:0;padding-bottom:0;margin-bottom:0}
.jb .ab h4{display:flex;align-items:center;gap:12px;margin:0 0 14px;
  font-size:17px;font-weight:700;letter-spacing:-.03em}
.jb .ab-no{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--accent);
  background:var(--accent-soft);padding:5px 10px;border-radius:var(--r-pill);flex:none}
.jb .ab p{margin:0}

/* ── 할 수 있는 일 ── */
.jb .cando{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.jb .cd{display:grid;grid-template-columns:30px 1fr auto;gap:16px;align-items:start;
  background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:22px 24px;
  transition:transform .25s cubic-bezier(.2,.7,.3,1),box-shadow .25s,border-color .25s}
.jb .cd:hover{transform:translateY(-2px);box-shadow:var(--sh-md);border-color:var(--accent-soft)}
.jb .cd .ck{width:26px;height:26px;border-radius:50%;background:var(--accent-soft);color:var(--accent);
  display:grid;place-items:center;font-size:13px;font-weight:700;margin-top:2px}
.jb .cd .ct{font-size:16px;font-weight:700;letter-spacing:-.025em;margin-bottom:6px}
.jb .cd .cd-d{font-size:14px;color:var(--muted);line-height:1.75}
.jb .cd .cs{font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;color:var(--muted);
  background:var(--surface-2);padding:5px 10px;border-radius:var(--r-pill);white-space:nowrap;margin-top:2px}

/* ── 프로젝트 역할 요약 ── */
.jb .roles{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:26px}
.jb .role-sum{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:24px 26px;position:relative;overflow:hidden}
.jb .role-sum::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad)}
.jb .rs-no{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;color:var(--accent);margin-bottom:10px}
.jb .rs-t{font-size:19px;font-weight:800;letter-spacing:-.035em}
.jb .rs-r{display:inline-block;font-size:12.5px;font-weight:600;color:var(--accent);
  background:var(--accent-soft);padding:5px 11px;border-radius:var(--r-pill);margin:10px 0 12px}
.jb .role-sum p{margin:0;font-size:13.5px;color:var(--muted);line-height:1.7}

/* ── 인용 블록 ── */
.jb .quote{background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--accent);
  border-radius:var(--r);padding:30px 34px;margin-bottom:44px;max-width:82ch}
.jb .quote p{margin:0;font-size:17px;line-height:1.9;color:var(--text-2);letter-spacing:-.015em}
.jb .quote p b{color:var(--text);font-weight:600}
.jb .quote .by{display:block;margin-top:14px;font-family:var(--mono);font-size:11.5px;
  letter-spacing:.08em;color:var(--muted)}
.jb .ct-note{display:inline-flex;align-items:center;gap:9px;font-size:13.5px;
  color:var(--accent-lt);background:rgba(63,191,146,.1);border:1px solid rgba(63,191,146,.2);
  padding:9px 16px;border-radius:var(--r-pill);margin:0 0 32px}

/* ── 타임라인 ── */
.jb .tl{list-style:none;margin:0;padding:0;position:relative}
.jb .tl::before{content:"";position:absolute;left:7px;top:10px;bottom:10px;width:1.5px;background:var(--line)}
.jb .tl li{position:relative;padding:0 0 34px 40px}
.jb .tl li:last-child{padding-bottom:0}
.jb .tl li::before{content:"";position:absolute;left:0;top:7px;width:15px;height:15px;border-radius:50%;
  background:var(--bg);border:2px solid var(--line)}
.jb .tl li.on::before{background:var(--grad);border-color:transparent;
  box-shadow:0 0 0 5px var(--accent-soft), 0 4px 12px -4px var(--accent-glow)}
.jb .tl::before{background:linear-gradient(180deg,var(--accent-soft),var(--line) 22%,var(--line))}
.jb .tl .when{font-family:var(--mono);font-size:12px;color:var(--accent);letter-spacing:.02em}
.jb .tl .what{font-size:17px;font-weight:700;margin-top:4px;letter-spacing:-.025em}
.jb .tl .detail{font-size:14.5px;color:var(--muted);margin-top:6px;line-height:1.75;max-width:76ch}
.jb .tl .kids{display:grid;gap:8px;margin-top:16px;max-width:76ch}
.jb .tl .kid{display:flex;gap:14px;align-items:baseline;width:100%;text-align:left;
  background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:14px 18px;
  transition:border-color .22s,background .22s,transform .22s}
.jb .tl button.kid:hover{border-color:rgba(11,138,99,.32);background:var(--surface);transform:translateX(3px)}
.jb .tl .kid .kl{font-size:14.5px;font-weight:700;flex:none;letter-spacing:-.02em}
.jb .tl .kid .kd{font-size:13.5px;color:var(--muted);line-height:1.6}
.jb .tl .kid .karr{margin-left:auto;color:var(--accent);font-size:14px;flex:none;font-weight:600}

/* ── 면접 질문 ── */
.jb .ask{background:var(--ink);color:#fff;position:relative;overflow:hidden}
.jb .ask .eyebrow{color:var(--accent-lt)}
.jb .ask .eyebrow::before{background:var(--accent-lt)}
.jb .ask h2.sec{color:#fff}
.jb .ask .sec-lead{color:var(--on-dark)}
.jb .ask .sec-lead b{color:#fff}
.jb .qa{display:grid;gap:14px;list-style:none;margin:0;padding:0}
.jb .qa li{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);
  border-radius:var(--r);padding:30px 32px;transition:background .25s,border-color .25s}
.jb .qa li:hover{background:rgba(255,255,255,.075);border-color:rgba(63,191,146,.28)}
.jb .qa .num{font-family:var(--mono);font-size:11.5px;color:var(--accent-lt);letter-spacing:.12em;margin-bottom:12px}
.jb .qa .q{font-size:clamp(19px,2.4vw,24px);font-weight:700;line-height:1.45;margin:0 0 12px;letter-spacing:-.03em}
.jb .qa .a{margin:0;color:var(--on-dark);font-size:15.5px;line-height:1.85;max-width:72ch}
.jb .qa .a b{color:var(--accent-lt);font-weight:600}

/* ── 연락 ── */
.jb .contact{background:var(--ink-2);color:#fff;position:relative;overflow:hidden}
.jb .contact h2{font-size:clamp(30px,4.6vw,48px);font-weight:800;margin:0 0 18px;
  line-height:1.2;letter-spacing:-.04em}
.jb .contact p.lead{color:var(--on-dark);max-width:56ch;margin:0 0 40px;font-size:16.5px;line-height:1.8}
.jb .ct{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.jb .ct a{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  border-radius:var(--r);padding:24px 26px;text-decoration:none;display:block;
  transition:background .22s,border-color .22s,transform .22s}
.jb .ct a:hover{background:rgba(255,255,255,.09);border-color:rgba(63,191,146,.34);transform:translateY(-2px)}
.jb .ct .l{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;color:var(--accent-lt);margin-bottom:10px}
.jb .ct .v{font-size:15.5px;font-family:var(--mono);word-break:break-all;letter-spacing:-.02em}
.jb footer{margin-top:56px;padding-top:28px;border-top:1px solid rgba(255,255,255,.1);
  font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;color:var(--on-dark-2);
  display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}

/* ══ 상세 페이지 ══ */
.jb .p-hero{background:var(--ink);color:#fff;position:relative;overflow:hidden;padding:132px 0 0}
.jb .p-no{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11.5px;
  letter-spacing:.14em;color:var(--accent-lt);background:rgba(63,191,146,.11);
  border:1px solid rgba(63,191,146,.2);padding:7px 14px;border-radius:var(--r-pill);margin:0 0 26px}
.jb .p-title{font-size:clamp(44px,7vw,80px);font-weight:800;line-height:1;
  letter-spacing:-.05em;margin:0}
.jb .p-sub{font-family:var(--mono);font-size:clamp(13.5px,2vw,16px);color:var(--accent-lt);
  margin:18px 0 0;letter-spacing:-.01em}
.jb .p-lead{font-size:18px;line-height:1.9;color:var(--on-dark);max-width:62ch;margin:30px 0 0}
.jb .p-lead b{color:#fff;font-weight:600}
.jb .p-facts{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:56px 0 0;padding-bottom:56px}
.jb .p-facts > div{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  border-radius:14px;padding:20px 22px}
.jb .p-facts .k{font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--accent-lt);margin-bottom:10px}
.jb .p-facts .v{font-size:15px;line-height:1.5;font-weight:600}
.jb .p-facts .v small{font-family:var(--mono);font-size:12px;color:var(--on-dark-2);font-weight:400}
.jb .p-facts .v a{color:var(--accent-lt);font-family:var(--mono);font-size:13px;
  text-decoration:none;font-weight:500}
.jb .p-facts .v a:hover{color:#fff}

/* 진행 중 안내 */
.jb .notice{display:flex;gap:16px;background:var(--accent-soft);border:1px solid rgba(11,138,99,.22);
  border-radius:var(--r);padding:22px 26px;margin-bottom:44px}
.jb .notice .ico{width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;
  display:grid;place-items:center;font-size:14px;font-weight:700;flex:none;margin-top:1px}
.jb .notice b{display:block;font-size:15px;margin-bottom:5px;letter-spacing:-.02em}
.jb .notice p{margin:0;font-size:14.5px;color:var(--text-2);line-height:1.8}

/* 문제 정의 */
.jb .problem{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.jb .problem > div{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:28px 26px}
.jb .problem .t{font-size:18px;font-weight:700;margin-bottom:12px;letter-spacing:-.025em}
.jb .problem p{margin:0;font-size:14.5px;color:var(--muted);line-height:1.8}

/* 아키텍처 */
.jb .arch{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:34px 32px;margin-bottom:18px;overflow-x:auto}
.jb .arch svg{display:block;min-width:720px;width:100%;height:auto}
.jb .arch-legend{display:flex;gap:20px;flex-wrap:wrap;margin-top:22px;padding-top:20px;
  border-top:1px solid var(--line-2);font-family:var(--mono);font-size:11.5px;color:var(--muted)}
.jb .arch-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:8px;vertical-align:-1px}
.jb .arch-cap{font-size:15px;color:var(--muted);line-height:1.85;margin:0;max-width:86ch}
.jb .arch-cap b{color:var(--text-2);font-weight:600}

/* 담당 범위 */
.jb .scope{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.jb .scope article{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:30px 28px}
.jb .scope .badge{display:inline-block;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;
  color:var(--accent);background:var(--accent-soft);padding:5px 11px;border-radius:var(--r-pill);margin-bottom:16px}
.jb .scope .badge.sub{color:var(--muted);background:var(--surface-2)}
.jb .scope h3{font-size:19px;font-weight:700;margin:0 0 14px;line-height:1.4;letter-spacing:-.025em}
.jb .scope ul{margin:0;padding:0;list-style:none}
.jb .scope li{font-size:14.5px;color:var(--muted);margin-bottom:11px;line-height:1.75;
  padding-left:17px;position:relative}
.jb .scope li::before{content:"";position:absolute;left:0;top:9px;width:5px;height:5px;
  border-radius:50%;background:var(--accent);opacity:.5}
.jb .scope li b{color:var(--text);font-weight:600}
.jb .scope li:last-child{margin-bottom:0}
.jb .scope .memo{font-size:13.5px;color:var(--muted);margin:16px 0 0;line-height:1.75;
  padding-top:14px;border-top:1px solid var(--line-2)}

/* API 표 */
.jb .api-wrap{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  overflow:hidden;margin-top:24px}
.jb .api{width:100%;border-collapse:collapse;font-size:14px}
.jb .api th{text-align:left;font-family:var(--mono);font-size:10px;letter-spacing:.16em;
  color:var(--muted);background:var(--surface-2);padding:13px 24px;font-weight:500}
.jb .api td{border-top:1px solid var(--line-2);padding:13px 24px;vertical-align:top;color:var(--text-2)}
.jb .api tr:hover td{background:var(--bg)}
.jb .api td.m{font-family:var(--mono);font-size:12px;white-space:nowrap;color:var(--text)}
.jb .api td.m i{font-style:normal;padding:2px 7px;border-radius:5px;margin-right:9px;
  font-size:9.5px;font-weight:600;letter-spacing:.05em;color:#fff}
.jb .api td.m i.GET{background:var(--accent)}
.jb .api td.m i.POST{background:#2563A8}
.jb .api td.m i.PUT{background:#B4761C}
.jb .api td.m i.DELETE{background:var(--warn)}
.jb .api-note{font-size:13.5px;color:var(--muted);margin-top:16px;line-height:1.75}

/* 핵심 구현 */
.jb .impl{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:34px 36px;margin-bottom:18px}
.jb .impl .h-no{display:inline-block;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;
  color:var(--accent);background:var(--accent-soft);padding:5px 11px;border-radius:var(--r-pill);margin-bottom:16px}
.jb .impl h3{font-size:clamp(21px,3vw,26px);font-weight:700;margin:0;line-height:1.4;letter-spacing:-.03em}
.jb .impl p{font-size:15.5px;color:var(--muted);line-height:1.85;max-width:76ch;margin:16px 0 0}
.jb .impl p b{color:var(--text);font-weight:600}
.jb .flow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:22px 0 0;
  font-family:var(--mono);font-size:11.5px;color:var(--muted)}
.jb .flow span{background:var(--surface-2);padding:8px 13px;border-radius:var(--r-pill)}
.jb .flow em{font-style:normal;color:var(--accent);font-size:12px}

/* 트러블슈팅 */
.jb .ts{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  overflow:hidden;margin-bottom:18px}
.jb .ts-head{padding:28px 34px 24px;border-bottom:1px solid var(--line-2)}
.jb .ts-kick{display:inline-block;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;
  color:var(--warn);background:var(--warn-soft);padding:5px 11px;border-radius:var(--r-pill);margin-bottom:14px}
.jb .ts-head h3{font-size:clamp(19px,2.7vw,24px);font-weight:700;margin:0;line-height:1.45;letter-spacing:-.03em}
.jb .ts-body{padding:10px 34px 30px}
.jb .step{display:grid;grid-template-columns:96px 1fr;gap:22px;padding:18px 0;border-bottom:1px solid var(--line-2)}
.jb .step:last-of-type{border-bottom:0}
.jb .step dt{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--muted);padding-top:6px}
.jb .step dd{margin:0;font-size:15px;color:var(--muted);line-height:1.85}
.jb .step dd b{color:var(--text);font-weight:600}
.jb .step.result dt{color:var(--accent);font-weight:600}
.jb .step.result dd{color:var(--text-2)}
.jb .step.learn dt{color:var(--text);font-weight:600}
.jb .step.learn dd{color:var(--text-2);font-weight:500}

/* 회고 */
.jb .retro{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.jb .retro > div{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:28px 26px;border-top:3px solid var(--muted)}
.jb .retro > div.good{border-top-color:var(--accent)}
.jb .retro > div.warn{border-top-color:var(--warn)}
.jb .retro > div.next{border-top-color:#2563A8}
.jb .retro h3{font-size:18px;font-weight:700;margin:0 0 16px;letter-spacing:-.025em}
.jb .retro ul{margin:0;padding:0;list-style:none}
.jb .retro li{font-size:14.5px;color:var(--muted);line-height:1.8;margin-bottom:14px;
  padding-left:17px;position:relative}
.jb .retro li:last-child{margin-bottom:0}
.jb .retro li::before{content:"";position:absolute;left:0;top:9px;width:5px;height:5px;
  border-radius:50%;background:var(--muted);opacity:.45}
.jb .retro li b{color:var(--text);font-weight:600}

/* 발표자료 갤러리 */
.jb .deck{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.jb .slide{position:relative;display:block;width:100%;padding:0;border:1px solid var(--line);
  border-radius:12px;overflow:hidden;background:var(--surface);line-height:0;
  transition:transform .25s cubic-bezier(.2,.7,.3,1),box-shadow .25s,border-color .25s}
.jb .slide:hover{transform:translateY(-4px) scale(1.015);box-shadow:var(--sh-glow);
  border-color:color-mix(in srgb, var(--accent) 34%, transparent)}
.jb .slide img{width:100%;height:auto;display:block}
.jb .slide .pg{position:absolute;left:8px;bottom:8px;font-family:var(--mono);font-size:10.5px;
  color:#fff;background:rgba(11,20,32,.72);padding:3px 8px;border-radius:var(--r-pill);line-height:1.4}
.jb .deck-note{font-size:13.5px;color:var(--muted);margin:18px 0 0}

/* 이미지 없을 때 안내 */
.jb .deck-missing{background:var(--warn-soft);border:1px solid var(--warn);border-radius:var(--r);padding:26px 30px}
.jb .deck-missing b{display:block;color:var(--warn);font-size:15.5px;margin-bottom:10px;letter-spacing:-.02em}
.jb .deck-missing p{margin:0;font-size:14.5px;color:var(--text-2);line-height:1.8}
.jb .deck-missing pre{margin:16px 0 0;background:var(--ink);color:#DCE6E2;border-radius:10px;
  padding:16px 18px;font-family:var(--mono);font-size:12.5px;line-height:1.8;overflow-x:auto}

/* 라이트박스 */
.jb .lb{position:fixed;inset:0;z-index:200;background:rgba(6,11,18,.93);
  display:flex;align-items:center;justify-content:center;padding:56px 76px;
  animation:jbFade .18s ease}
@keyframes jbFade{from{opacity:0}to{opacity:1}}
.jb .lb img{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;
  box-shadow:0 30px 80px -30px rgba(0,0,0,.8)}
.jb .lb-x{position:absolute;top:20px;right:24px;color:rgba(255,255,255,.75);font-size:22px;
  width:42px;height:42px;border-radius:50%;display:grid;place-items:center;transition:all .2s}
.jb .lb-x:hover{background:rgba(255,255,255,.12);color:#fff}
.jb .lb-nav{position:absolute;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.75);
  font-size:34px;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;transition:all .2s}
.jb .lb-nav:hover:not(:disabled){background:rgba(255,255,255,.12);color:#fff}
.jb .lb-nav:disabled{opacity:.2;cursor:default}
.jb .lb-nav.prev{left:16px}
.jb .lb-nav.next{right:16px}
.jb .lb-cnt{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
  font-family:var(--mono);font-size:12px;color:rgba(255,255,255,.6)}

/* 페이지 이동 */
.jb .pager{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:0 0 96px}
.jb .pager button{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:30px 32px;display:block;width:100%;transition:all .25s ease}
.jb .pager button:hover{border-color:rgba(11,138,99,.3);box-shadow:var(--sh-md);transform:translateY(-2px)}
.jb .pager .l{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;color:var(--accent);margin-bottom:10px}
.jb .pager .t{font-size:19px;font-weight:700;line-height:1.4;letter-spacing:-.03em}
.jb .pager button.right{text-align:right}

/* 스크롤 등장 */
.jb .soft-top{border-top:1px solid transparent !important;
  border-image:linear-gradient(90deg,transparent,var(--line) 18%,var(--line) 82%,transparent) 1}

.jb .rv{opacity:0;transform:translateY(16px);transition:opacity .65s ease,transform .65s cubic-bezier(.2,.7,.3,1)}
.jb .rv.in{opacity:1;transform:none}

/* 반응형 */
@media (max-width:1080px){
  .jb .metrics .grid{grid-template-columns:repeat(2,1fr)}
  .jb .why,.jb .stack,.jb .ways,.jb .ct,.jb .problem,.jb .retro{grid-template-columns:1fr}
  .jb .about{grid-template-columns:1fr;gap:36px}
  .jb .p-head-grid{grid-template-columns:1fr;gap:34px}
  .jb .p-head-grid .portrait{max-width:170px}
  .jb .reach,.jb .hire,.jb .cando,.jb .roles{grid-template-columns:1fr}
  .jb .glance,.jb .minis{grid-template-columns:1fr}
  .jb .entry{grid-template-columns:52px 1fr 44px;gap:18px}
  .jb .entry-meta{display:none}
  .jb .deck{grid-template-columns:repeat(3,1fr)}
  .jb .card{grid-template-columns:1fr;gap:28px}
  .jb .card-cover{max-width:420px}
  .jb .p-facts{grid-template-columns:repeat(2,1fr)}
  .jb .scope{grid-template-columns:1fr}
  .jb .hero-main{grid-template-columns:1fr;gap:24px}
  .jb .portrait{max-width:170px}
  .jb .character{justify-content:flex-start}
  .jb .character img{height:auto;width:200px}
  .jb .character::before{left:105px}
  .jb .character::after{left:105px}
}
@media (max-width:860px){
  .jb .nav .nav-desk{display:none}
  .jb .nav .nav-toggle{display:block}
  .jb .nav .brand span{display:none}
  .jb .nav-in{padding:0 20px}
}
@media (max-width:720px){
  .jb{font-size:16px}
  .jb section{padding:76px 0}
  .jb .wrap,.jb .nav-in{padding:0 20px}
  .jb .hero{padding:118px 0 76px}
  .jb .p-hero{padding:104px 0 0}
  .jb .metrics .grid{grid-template-columns:1fr}
  .jb .metrics{margin-top:-40px}
  .jb .p-facts{grid-template-columns:1fr}
  .jb .rail{flex-direction:column;align-items:stretch}
  .jb .rail .arrow{display:none}
  .jb .card{padding:30px 24px 26px;grid-template-columns:1fr;gap:24px}
  .jb .about-text p{font-size:16.5px}
  .jb .subhead{flex-wrap:wrap;gap:10px;margin:52px 0 22px}
  .jb .entry{grid-template-columns:1fr 40px;gap:14px;padding:22px 20px}
  .jb .entry-no{display:none}
  .jb .entry-t{font-size:19px}
  .jb .entry-arr{width:40px;height:40px}
  .jb .cd{grid-template-columns:26px 1fr;gap:12px}
  .jb .cd .cs{grid-column:2;justify-self:start;margin-top:10px}
  .jb .ab h4{flex-wrap:wrap;gap:9px;font-size:16px}
  .jb .matrix{font-size:13px}
  .jb .matrix th,.jb .matrix td{padding:11px 10px}
  .jb .matrix th em{display:none}
  .jb .subhead .ln{display:none}
  .jb .profile dl{grid-template-columns:70px 1fr;gap:0 14px}
  .jb .impl{padding:28px 24px}
  .jb .ts-head{padding:24px 22px 20px}
  .jb .ts-body{padding:6px 22px 24px}
  .jb .arch{padding:20px 16px}
  .jb .api th,.jb .api td{padding:12px 16px}
  .jb .deck{grid-template-columns:repeat(2,1fr);gap:10px}
  .jb .lb{padding:56px 12px}
  .jb .lb-nav{width:40px;height:40px;font-size:26px}
  .jb .lb-nav.prev{left:2px}
  .jb .lb-nav.next{right:2px}
  .jb .step{grid-template-columns:1fr;gap:6px}
  .jb .tl .kid{flex-direction:column;gap:6px;align-items:flex-start}
  .jb .tl .kid .karr{margin-left:0}
  .jb .pager{grid-template-columns:1fr}
  .jb .pager button.right{text-align:left}
}
@media (prefers-reduced-motion:reduce){
  .jb *{animation-duration:.001ms !important;animation-delay:0ms !important;transition-duration:.001ms !important}
  .jb .rail li,.jb .rv{opacity:1;transform:none}
  .jb .character{animation:none}
}
`;

/* ══════════════════════════════════════════════════════════════════════
   3. highlight()
   ══════════════════════════════════════════════════════════════════════ */
const KEYWORDS =
  /\b(public|private|protected|static|final|void|int|long|boolean|return|new|class|if|else|try|catch|const|let|useEffect|useRef|select|from|where|order|by|and|not)\b/g;

function highlight(src: string): string {
  const esc = (s: string): string =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return src
    .split("\n")
    .map((line) => {
      // 1) 줄 주석 분리
      const at = line.indexOf("//");
      let code = at >= 0 ? line.slice(0, at) : line;
      const comment = at >= 0 ? line.slice(at) : "";

      // 2) 문자열을 임시 토큰으로 빼두기 (안쪽이 다시 치환되지 않도록)
      const strings: string[] = [];
      code = esc(code).replace(/"""|"(?:[^"\\]|\\.)*"/g, (m) => {
        strings.push(m);
        return "\u0001" + (strings.length - 1) + "\u0001";
      });

      // 3) 키워드 → 애너테이션 순서 (뒤집으면 class="a" 의 class 가 키워드로 잡힙니다)
      code = code.replace(KEYWORDS, (m) => `<span class="k">${m}</span>`);
      code = code.replace(/@\w+/g, (m) => `<span class="a">${m}</span>`);

      // 4) 문자열 복원
      code = code.replace(
        /\u0001(\d+)\u0001/g,
        (_m, n: string) => `<span class="s">${strings[Number(n)]}</span>`
      );

      return comment ? code + `<span class="c">${esc(comment)}</span>` : code;
    })
    .join("\n");
}

/* ══════════════════════════════════════════════════════════════════════
   4. 공용 컴포넌트
   ══════════════════════════════════════════════════════════════════════ */

function useReveal(page: Page): void {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".jb .rv");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [page]);
}

/** 스크롤 위치에 따라 내비게이션 배경을 바꿉니다. */
function useScrolled(threshold = 60): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

interface RvProps {
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  dangerouslySetInnerHTML?: { __html: string };
}

const Rv: React.FC<RvProps> = ({ as: Tag = "div", className = "", children, ...rest }) => (
  <Tag className={`rv ${className}`.trim()} {...rest}>
    {children}
  </Tag>
);

const Code: React.FC<{ children: string; caption?: string }> = ({ children, caption }) => (
  <div className="code">
    {caption && <div className="code-head">{caption}</div>}
    <pre dangerouslySetInnerHTML={{ __html: highlight(children.trim()) }} />
  </div>
);

const Chip: React.FC<{ on?: boolean; children: React.ReactNode }> = ({ on, children }) => (
  <span className={on ? "tag on" : "tag"}>{children}</span>
);

/** 프로젝트 카드 표지. 이미지가 없거나 못 불러오면 자리표시를 보여줍니다. */
const Cover: React.FC<{ src?: string; title: string }> = ({ src, title }) => {
  const [fail, setFail] = useState(false);
  if (!src || fail) {
    return (
      <div className="cover-wip">
        <span>발표자료</span>
        <b>{src ? "불러오지 못함" : "준비 중"}</b>
        <em>{src ? "public/decks 확인" : "과정 종료 후 공개"}</em>
      </div>
    );
  }
  return <img src={src} alt={`${title} 발표자료 표지`} loading="lazy" onError={() => setFail(true)} />;
};

interface NavProps {
  page: Page;
  go: (p: Page) => void;
}

/** 메뉴 = 페이지. 순서대로 이어보게 만듭니다. */
const NAV: [SubPage, string][] = [
  ["about", "자기소개"],
  ["work", "프로젝트"],
  ["stack", "기술"],
  ["history", "이력"],
  ["contact", "연락"],
];

/** 프로젝트 상세도 '프로젝트' 메뉴에 속한 것으로 표시합니다. */
const isWorkPage = (p: Page): boolean =>
  p === "work" || p === "zipmap" || p === "pleegie" || p === "basecamp";

/** 페이지 상단의 읽기 진행 표시줄 */
const Progress: React.FC = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = (): void => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="progress">
      <i style={{ width: `${pct}%` }} />
    </div>
  );
};

const Nav: React.FC<NavProps> = ({ page, go }) => {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  // 페이지가 바뀌면 모바일 메뉴는 닫는다.
  useEffect(() => setOpen(false), [page]);

  // 메뉴가 열려 있는 동안 뒤 배경이 스크롤되지 않게 한다.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const item = (key: SubPage, label: string): React.ReactElement => {
    const on = key === "work" ? isWorkPage(page) : page === key;
    return (
      <button key={key} className={on ? "on" : ""} onClick={() => go(key)}>
        {label}
      </button>
    );
  };

  return (
    <>
      <div className={`nav${scrolled ? " scrolled" : ""}${open ? " open" : ""}`}>
        <div className="nav-in">
          <button className="brand" onClick={() => go("home")}>
            <i />
            <span>LEE JONGBEEN · BACKEND</span>
          </button>
          <nav className="nav-desk">{NAV.map(([k, l]) => item(k, l))}</nav>
          <button
            className="nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-panel" onClick={() => setOpen(false)}>
          <nav onClick={(e) => e.stopPropagation()}>
            {NAV.map(([k, l], i) => (
              <button
                key={k}
                className={(k === "work" ? isWorkPage(page) : page === k) ? "on" : ""}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => go(k)}
              >
                <span className="mn">{String(i + 1).padStart(2, "0")}</span>
                {l}
                <span className="ma">→</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

/* ── 페이지 상단 헤더 (자기소개 · 기술 · 이력 · 연락 공용) ── */
const PageHead: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** true 면 오른쪽에 프로필 사진을 보여줍니다 */
  photo?: boolean;
  children?: React.ReactNode;
}> = ({ eyebrow, title, lead, photo, children }) => (
  <header className="p-hero">
    <div className="glow" />
    <div className="grid-lines" />
    <div className="grain" />
    <div className="wrap">
      <div className={photo ? "p-head-grid" : ""}>
        <div>
          <span className="p-no">{eyebrow}</span>
          <h1 className="p-title">{title}</h1>
          {lead && <p className="p-lead">{lead}</p>}
        </div>
        {photo && (
          <figure className="portrait">
            <img src={PHOTO} alt="이종빈 프로필 사진" width="400" height="533" />
            <figcaption>LEE JONGBEEN · 1997</figcaption>
          </figure>
        )}
      </div>
      {children}
    </div>
  </header>
);

/* ── 다음 페이지로 이어지는 흐름 ── */
const PageFlow: React.FC<{ current: SubPage; go: (p: Page) => void }> = ({ current, go }) => {
  const i = NAV.findIndex(([k]) => k === current);
  const prev = i > 0 ? NAV[i - 1] : null;
  const next = i < NAV.length - 1 ? NAV[i + 1] : null;
  return (
    <div className="wrap">
      <nav className="pager" style={{ paddingBottom: 96 }}>
        {prev ? (
          <button onClick={() => go(prev[0])}>
            <div className="l">← 이전</div>
            <div className="t">{prev[1]}</div>
          </button>
        ) : (
          <button onClick={() => go("home")}>
            <div className="l">← 처음으로</div>
            <div className="t">메인</div>
          </button>
        )}
        {next ? (
          <button className="right" onClick={() => go(next[0])}>
            <div className="l">다음 →</div>
            <div className="t">{next[1]}</div>
          </button>
        ) : (
          <button className="right" onClick={() => go("home")}>
            <div className="l">처음으로 →</div>
            <div className="t">메인</div>
          </button>
        )}
      </nav>
    </div>
  );
};

/**
 * 발표자료 이미지가 놓인 경로.
 *
 * portfolio-decks.zip 을 프로젝트의 public 폴더에 풀면
 *   public/decks/zipmap/01.jpg … 25.jpg
 *   public/decks/pleegie/01.jpg … 28.jpg
 * 구조가 되고, 브라우저에서는 /decks/... 로 접근됩니다.
 *
 * 하위 경로(예: example.com/portfolio/)에 배포한다면 "/portfolio/decks" 처럼 바꾸세요.
 */
const DECK_BASE = "/decks";

/** 슬라이드 한 장의 실제 주소 */
const slideSrc = (base: string, n: number): string =>
  `${DECK_BASE}/${base}/${String(n).padStart(2, "0")}.jpg`;

/**
 * 발표자료 갤러리.
 * 썸네일을 누르면 라이트박스가 열리고, ← → 키와 ESC 로 조작할 수 있습니다.
 * 이미지를 못 찾으면 깨진 아이콘 대신 설치 안내를 보여줍니다.
 */
const DeckGallery: React.FC<{ deck: Deck }> = ({ deck }) => {
  const [open, setOpen] = useState<number | null>(null);
  const [missing, setMissing] = useState(false);
  const pages = Array.from({ length: deck.count }, (_, i) => i + 1);
  const src = (n: number) => slideSrc(deck.base, n);

  // 라이트박스가 열려 있을 때만 키보드를 듣는다. 닫히면 정리한다.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((v) => (v === null ? v : Math.min(deck.count, v + 1)));
      if (e.key === "ArrowLeft") setOpen((v) => (v === null ? v : Math.max(1, v - 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deck.count]);

  if (missing) {
    return (
      <div className="deck-missing">
        <b>발표자료 이미지를 찾지 못했습니다</b>
        <p>
          <code className="mono">portfolio-decks.zip</code> 을 프로젝트의{" "}
          <code className="mono">public</code> 폴더에 풀어 주세요. 아래 구조가 되면 바로 보입니다.
        </p>
        <pre>{`public/
└─ decks/
   ├─ zipmap/   01.jpg … 25.jpg
   └─ pleegie/  01.jpg … 28.jpg`}</pre>
      </div>
    );
  }

  return (
    <>
      <div className="deck">
        {pages.map((n) => (
          <button className="slide" key={n} onClick={() => setOpen(n)} aria-label={`${n}번 슬라이드 크게 보기`}>
            <img
              src={src(n)}
              alt={`발표자료 ${n}쪽`}
              loading="lazy"
              onError={() => n === 1 && setMissing(true)}
            />
            <span className="pg">{n}</span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="lb" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <button className="lb-x" onClick={() => setOpen(null)} aria-label="닫기">✕</button>
          <button
            className="lb-nav prev"
            onClick={(e) => { e.stopPropagation(); setOpen(Math.max(1, open - 1)); }}
            disabled={open === 1}
            aria-label="이전 장"
          >‹</button>
          <img src={src(open)} alt={`발표자료 ${open}쪽`} onClick={(e) => e.stopPropagation()} />
          <button
            className="lb-nav next"
            onClick={(e) => { e.stopPropagation(); setOpen(Math.min(deck.count, open + 1)); }}
            disabled={open === deck.count}
            aria-label="다음 장"
          >›</button>
          <span className="lb-cnt">{open} / {deck.count}</span>
        </div>
      )}
    </>
  );
};

interface ContactProps {
  title: string;
  lead: string;
  /** 채용 담당자에게 도움이 되는 부가 정보 (선택) */
  note?: string;
  third: RepoLink;
}

const Contact: React.FC<ContactProps> = ({ title, lead, note, third }) => (
  <section className="contact" id="contact">
    <div className="glow" />
    <div className="grain" />
    <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
      <h2 dangerouslySetInnerHTML={{ __html: title }} />
      <p className="lead">{lead}</p>
      {note && <p className="ct-note">{note}</p>}
      <div className="ct">
        <a href="mailto:jongbeen97@naver.com">
          <div className="l">EMAIL</div>
          <div className="v">jongbeen97@naver.com</div>
        </a>
        <a href="tel:01091206601">
          <div className="l">PHONE</div>
          <div className="v">010-9120-6601</div>
        </a>
        <a href={third.href} target="_blank" rel="noopener noreferrer">
          <div className="l">{third.label}</div>
          <div className="v">{third.text}</div>
        </a>
      </div>
      <footer>
        <span>© 2026 LEE JONGBEEN · 이 사이트는 React 19 + TypeScript로 직접 만들었습니다</span>
        <span>{third.foot}</span>
      </footer>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   5. HomePage
   ══════════════════════════════════════════════════════════════════════ */

interface RouteStop {
  yr: string;
  what: string;
  note: string;
  /** 지금 진행 중 */
  live?: boolean;
  /** 마지막(현재) 지점 */
  now?: boolean;
}

const ROUTE: RouteStop[] = [
  { yr: "2017", what: "안양대 식품영양학과", note: "비전공의 출발점" },
  { yr: "2024", what: "물류 · 영업 사무", note: "숫자와 검증을 배움" },
  { yr: "2025.11", what: "한국정보교육원", note: "자바 풀스택 & 생성형 AI · 6개월" },
  { yr: "2026.05", what: "SeSAC", note: "AWS·AI 활용 MSA · ~11.20", live: true },
  { yr: "NOW", what: "백엔드 개발자로", note: "함께할 팀을 찾는 중", now: true },
];

interface Metric {
  /** 애니메이션에 쓸 실제 숫자 */
  num: number;
  u: string;
  l: string;
}

/** 화면에 들어오면 0부터 목표까지 올라가는 숫자. 모션 최소화 설정은 존중합니다. */
const CountUp: React.FC<{ to: number; run: boolean }> = ({ to, run }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setV(to);
      return;
    }
    const dur = 1200;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number): void => {
      const p = Math.min(1, (t - t0) / dur);
      setV(to * (1 - Math.pow(1 - p, 3))); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return <>{Math.round(v).toLocaleString("ko-KR")}</>;
};

const Metrics: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setRun(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setRun(true)),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="metrics">
      <div className="wrap">
        <div className="grid" ref={ref}>
          {METRICS.map((m) => (
            <div className="metric" key={m.l}>
              <div className="n">
                <CountUp to={m.num} run={run} />
                <em>{m.u}</em>
              </div>
              <div className="l" dangerouslySetInnerHTML={{ __html: m.l }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const METRICS: Metric[] = [
  { num: 3, u: "건", l: "4~5인 팀 프로젝트<br>기획부터 배포까지 완주" },
  { num: 12, u: "개월", l: "국비 6개월 + SeSAC 6개월<br>2025.11 ~ 2026.11 · 공백 없이" },
  { num: 59, u: "개", l: "<b>제가 직접 만든</b> HTTP 엔드포인트<br>1차 44개 + 3차 15개" },
  { num: 1900, u: "줄", l: "1차 프로젝트에서 제가 담당한<br>게시판 · 관리자 도메인 코드" },
];

/** 자기소개 — 누구인가 / 왜 개발 / 왜 백엔드 / 지금 고민 / 어떻게 일하나 / 앞으로 */
const ABOUT: [string, string][] = [
  [
    "지금 어디에 있는가",
    "<b>1997년생, 서울 구로구에 삽니다.</b> 안양대학교 식품영양학과를 4년제 수료했고, 물류·영업·회계 사무로 1년 11개월을 일했습니다. 2025년 11월 한국정보교육원에서 처음 개발을 시작해 6개월 과정을 수료했고, 이어서 2026년 5월부터 <b>SeSAC의 「AWS와 AI를 활용한 MSA 기반 웹 서비스 개발」 과정</b>을 듣고 있습니다(~11.20). 그 사이 팀 프로젝트를 세 건 맡았습니다.",
  ],
  [
    "왜 개발을 시작했는가",
    "개발은 어릴 때부터 하고 싶었지만 전공이 아니라는 이유로 계속 미뤄뒀습니다. 군 제대 후 진로를 두고 한참 방황하다 국비 지원 과정을 알게 되어, 반쯤은 막연한 마음으로 신청했습니다. 그런데 첫 팀 미션에서 클래스 다이어그램을 그리고 로그인 기능을 붙여보면서 <b>“내가 짠 것이 실제로 동작한다”</b>는 감각을 처음 느꼈습니다. 그때부터는 미뤄둔 일이 아니라 하고 싶은 일이 됐습니다.",
  ],
  [
    "왜 백엔드인가",
    "1차 프로젝트에서는 게시판과 관리자 페이지를 맡아 서버를 만들었고, 2차에서는 화면을 맡았습니다. 그런데 <b>2차에서 제가 해결한 두 건 모두 원인이 서버에 있었습니다.</b> 시장 검색이 비어 있던 건 데이터가 연결되지 않아서였고, QR이 안 뜬 건 서버에 이미지를 만드는 로직 자체가 없어서였습니다. 원인을 따라 계층을 내려가는 일이 화면을 다듬는 일보다 재미있었습니다. 그래서 백엔드를 택했습니다.",
  ],
  [
    "지금 무엇을 고민하는가",
    "3차 프로젝트에서는 <b>캠핑장과 날씨 도메인</b>을 맡았습니다. 공공데이터·지도·날씨, 외부 API 세 곳과 맞닿은 영역이다 보니 기능을 만드는 것보다 <b>남의 서버가 멈췄을 때 우리 서비스는 어떻게 버틸지</b>를 정하는 데 시간을 더 썼습니다. 트랜잭션을 어디까지 열지, 실패한 응답을 캐시에 담을지 말지 같은 것들이 요즘 제 관심사입니다.",
  ],
  [
    "어떻게 일하는가",
    "혼자 빨리 가는 것보다 팀이 같이 가는 쪽을 좋아합니다. 1차 프로젝트에서 팀원들이 부담스러워한 발표자료 제작과 최종 발표를 맡았는데, 그러려면 <b>제가 짜지 않은 OAuth와 WebSocket까지 이해해야 했습니다.</b> 결과적으로 프로젝트 전체를 설명할 수 있는 사람이 됐고, 그게 제가 가장 많이 배운 방식이었습니다.",
  ],
  [
    "무엇이 부족하고, 무엇을 채울 것인가",
    "부족한 곳은 분명합니다. <b>쿼리 실행 계획을 읽고 인덱스를 스스로 판단하는 단계</b>까지는 아직 가지 못했고, 제 도메인에 테스트 코드를 직접 붙여본 적도 없습니다. 세 번의 회고에 같은 아쉬움을 적어놓고 미뤄왔으니 다음엔 그것부터 하려 합니다. 코드만 아는 개발자가 아니라 <b>데이터와 배포까지 설명할 수 있는 사람</b>이 되는 것이 목표입니다.",
  ],
];

/** 프로필 기본 정보 */
const PROFILE: [string, string][] = [
  ["이름", "이종빈 · LEE JONGBEEN"],
  ["출생", "1997년"],
  ["거주", "서울 구로구"],
  ["학력", "안양대학교 식품영양학과 (4년제 수료)"],
  ["이전 경력", "물류 · 영업 · 회계 사무 1년 11개월"],
  ["개발 시작", "2025년 11월"],
  ["현재", "SeSAC 재학 중 (~2026.11.20)"],
  ["희망 직무", "백엔드 개발자 (Java · Spring Boot)"],
];

/** 입사 후 포부 (이력서 기준) */
const AMBITION: [string, string][] = [
  [
    "빠르게 적응하겠습니다",
    "회사의 매뉴얼과 코드 규칙을 먼저 익혀 조직에 신속히 적응하겠습니다. 새로운 기술을 빠르게 습득하는 편이라, 첫 목표는 1인분 이상을 해내는 것입니다.",
  ],
  [
    "요구사항을 먼저 확인하겠습니다",
    "기획 의도와 사용자 요구를 정확히 이해한 뒤 손대겠습니다. 필드명 하나가 어긋나 반나절을 쓴 경험이 있어, 묻는 5분이 디버깅 반나절보다 싸다는 걸 알고 있습니다.",
  ],
  [
    "낮은 자세로 넓게 배우겠습니다",
    "맡은 코드만 보지 않고 데이터와 배포, 나아가 네트워크와 보안까지 이해하는 개발자가 되겠습니다. 남는 일을 가져가는 방식으로 그동안 배워왔습니다.",
  ],
];

/** 지금 바로 맡을 수 있는 일 — [일, 설명, 근거 프로젝트] */
const CAN_DO: [string, string, string][] = [
  [
    "REST API 설계 · 구현",
    "요청/응답 DTO 분리, 공통 예외 처리, Swagger 문서화까지. 컨트롤러 3개·매핑 44개를 직접 작성했습니다.",
    "1차 · 3차",
  ],
  [
    "CRUD + 검색 · 필터 · 페이징",
    "키워드·카테고리·지역·가격 조건 조합, 정렬 4종, 페이지/커서 방식 모두 다뤄봤습니다.",
    "1차 · 3차",
  ],
  [
    "관리자 · 운영 기능",
    "회원 상태 변경, 신고 접수와 처리, 게시글 블라인드, 인증 심사, 공지 발행까지 한 세트로 만들어봤습니다.",
    "1차",
  ],
  [
    "외부 API 연동",
    "공공데이터·지도·날씨·LLM 연동. 타임아웃, 실패 시 대체 동작, 캐시 정책까지 함께 설계합니다.",
    "1차 · 2차 · 3차",
  ],
  [
    "인증 · 인가 붙이기",
    "Spring Security 기반 로그인/권한 분기, JWT, OAuth2 소셜 로그인이 붙은 코드를 읽고 다룰 수 있습니다.",
    "2차 · 3차",
  ],
  [
    "Redis 캐시 설계",
    "TTL 기반 중복 방지, 조회수 누적 후 스케줄러로 DB 반영, 실패 응답은 캐시하지 않는 정책까지.",
    "1차 · 3차",
  ],
  [
    "DB 설계와 조회",
    "ERD 작성, 연관관계 매핑, JPQL·MyBatis 쿼리 작성. 위치 기반 정렬 같은 조건도 쿼리로 풀어봤습니다.",
    "1차 · 2차 · 3차",
  ],
  [
    "화면 연동과 문제 추적",
    "React로 API를 붙이고, 이상이 보이면 브라우저 → 프록시 → 컨트롤러 → 서비스 순으로 범위를 좁힙니다.",
    "2차 · 3차",
  ],
];

interface WhyCard {
  tag: string;
  h: string;
  p: string;
}

const WHY: WhyCard[] = [
  {
    tag: "01 · 디버깅",
    h: "“서버는 제대로 보내고 있었습니다”",
    p: "무한 스크롤이 로딩만 반복하던 날, 코드를 다시 읽는 대신 네트워크 탭부터 열었습니다. 응답은 멀쩡했고, 범인은 병합 과정에서 어긋난 필드명이었습니다. 고치기 전에 <b>문제 범위부터 반으로 줄이는 순서</b>를 이때 배웠습니다.",
  },
  {
    tag: "02 · 경계를 넘는 시야",
    h: "화면을 맡았지만<br>서버를 고쳤습니다",
    p: "2차 프로젝트에서 제 담당은 프론트엔드였습니다. 그런데 QR이 안 뜨는 이유도, 시장 검색이 비는 이유도 전부 서버에 있었습니다. <b>내 담당이 아니라는 이유로 멈추지 않고</b> 원인이 있는 계층까지 내려갔습니다. 그 경험이 백엔드를 택한 이유가 됐습니다.",
  },
  {
    tag: "03 · 이어지는 성장",
    h: "1차에서 배운 것을<br>3차에서 써먹었습니다",
    p: "1차에서 “에러가 없다고 정상은 아니다”를 배웠습니다. 3차에서 날씨가 엉뚱하게 나왔을 때도 응답이 200이라고 넘기지 않고 <b>값이 말이 되는지</b>부터 확인해, 좌표 순서가 뒤바뀐 걸 찾아냈습니다. <b>회고에 적은 것은 다음 프로젝트에서 갚는 편</b>입니다.",
  },
];

interface StackGroup {
  h: string;
  lv: string;
  items: [string, string][];
  memo?: string;
}

const STACK: StackGroup[] = [
  {
    h: "직접 만들어 본 것",
    lv: "HANDS-ON",
    items: [
      ["Java 17 / 21", "주 언어"],
      ["Spring Boot", "1·2·3차 전부"],
      ["Thymeleaf", "1차 · 서버 렌더링"],
      ["MyBatis", "Mapper XML"],
      ["JPA", "엔티티 · JPQL"],
      ["MySQL", "ERD · DDL · DML"],
      ["Spring Security", "인증 · 인가"],
      ["REST API 설계", "DTO · 예외 처리"],
      ["Git · GitHub", "브랜치 · 머지"],
    ],
  },
  {
    h: "팀 안에서 함께 다룬 것",
    lv: "WORKING KNOWLEDGE",
    items: [
      ["TypeScript", "3차 · 이 사이트"],
      ["React", "2·3차 화면"],
      ["JavaScript · jQuery", "AJAX · DOM"],
      ["JSP · Servlet", "교육 과정"],
      ["Redis", "캐시 · 토큰"],
      ["OAuth2 · JWT", "소셜 로그인"],
      ["WebSocket", "실시간 알림"],
      ["LLM · RAG", "Gemini · Groq · ChromaDB"],
      ["Python · FastAPI", "AI 서버 연동"],
    ],
  },
  {
    h: "읽고 따라갈 수 있는 것",
    lv: "LEARNING",
    items: [
      ["AWS", "SeSAC 과정 · 진행 중"],
      ["MSA 설계", "SeSAC 과정 · 진행 중"],
      ["Docker · CI/CD", "배포 자동화 실습"],
      ["QueryDSL", "3차 동적 쿼리"],
      ["JUnit · Mockito", "3차 테스트 코드"],
      ["TanStack Query", "서버 상태 관리"],
      ["Swagger", "API 문서화"],
    ],
    memo:
      "가장 채우고 싶은 것은 <b>쿼리 성능</b>입니다. 실행 계획을 읽고 인덱스를 스스로 판단하는 단계까지는 아직 가지 못했습니다.",
  },
];

interface Way {
  h: string;
  p: string;
}

const WAYS: Way[] = [
  {
    h: "하루 먼저 준비합니다",
    p: "수업도 프로젝트도 30분 일찍 앉는 편입니다. 새 기능을 맡으면 착수 하루이틀 전부터 미리 찾아봤고, 배운 적 없던 무한 스크롤과 LLM 연동을 기한 안에 붙일 수 있었던 것도 그 시간 덕분이었습니다.",
  },
  {
    h: "남는 일을 가져갑니다",
    p: "1차 프로젝트에서 팀원들이 부담스러워한 발표자료 제작과 최종 발표를 맡았습니다. 발표하려면 제가 짜지 않은 OAuth·WebSocket까지 이해해야 했고, 결과적으로 <b>프로젝트 전체를 설명할 수 있는 사람</b>이 됐습니다.",
  },
  {
    h: "먼저 확인하고 시작합니다",
    p: "필드명 하나가 어긋나 반나절을 날린 뒤로, 기능에 손대기 전에 응답 규격부터 맞추고 시작합니다. <b>묻는 데 드는 5분이 디버깅 반나절보다 싸다</b>는 걸 몸으로 배웠습니다.",
  },
];

/** 교육과정 안에 들어가는 프로젝트. key 가 있으면 눌러서 상세로 이동합니다. */
interface TimelineChild {
  label: string;
  desc: string;
  key?: ProjectKey;
}

interface TimelineItem {
  when: string;
  what: string;
  detail: string;
  on?: boolean;
  /** 이 과정 안에서 진행한 프로젝트 */
  children?: TimelineChild[];
}

const TIMELINE: TimelineItem[] = [
  {
    when: "2026.05.18 – 11.20",
    what: "SeSAC · AWS와 AI를 활용한 MSA 기반 웹 서비스 개발",
    detail: "6개월 과정, 현재 수강 중. 클라우드 배포와 마이크로서비스 구조를 다루고 있습니다.",
    on: true,
    children: [
      {
        label: "3차 · Basecamp",
        desc: "캠핑장 예약 플랫폼 — 캠핑장 · 날씨 도메인 담당 (2026.07.27 완료)",
        key: "basecamp",
      },
    ],
  },
  {
    when: "2025.11.10 – 2026.05.13",
    what: "한국정보교육원 · 자바 풀스택 & 생성형 AI 서비스 개발",
    detail:
      "6개월 과정 수료. Java·Spring·MySQL·React·LLM/RAG·AWS·Docker를 배우며 팀 프로젝트 두 건을 완주했습니다.",
    children: [
      {
        label: "2차 · PLEEGIE",
        desc: "냉장고 재료 관리 & 전통시장 커머스 — 프론트엔드 + 서버 이슈 해결",
        key: "pleegie",
      },
      {
        label: "1차 · 대동여집도",
        desc: "인증 거주 후기 커뮤니티 — 게시판 · 관리자 백엔드 + 팀 대표 발표",
        key: "zipmap",
      },
    ],
  },
  {
    when: "2024.10 – 2025.01",
    what: "한국일본통운 · 경리부 사무보조",
    detail: "회계·총무 지원. 숫자 하나가 틀리면 뒤가 전부 어긋나는 일을 하며 검증하는 습관이 생겼습니다.",
  },
  {
    when: "2024.08 – 09",
    what: "엑소코바이오 · 국내영업 영업지원",
    detail: "샘플 관리와 엑셀 기반 영업자료 작업. 요청한 사람의 의도를 먼저 확인하는 법을 배웠습니다.",
  },
  {
    when: "2024.02 – 07",
    what: "카레 전문점 · 매장 운영 지원",
    detail:
      "6개월. 매장 관리와 고객 응대, 사장님을 도와 홍보까지 맡았습니다. 사람이 실제로 서비스를 어떻게 쓰는지 가장 가까이서 본 시간입니다.",
  },
  {
    when: "2017.07 – 2018.05",
    what: "캘리스코 사보텐 · 주방·홀 보조",
    detail: "11개월. 주방 보조와 홀·매장 관리. 팀으로 움직이는 일에 익숙해진 첫 경험이었습니다.",
  },
  {
    when: "2017.03 –",
    what: "안양대학교 식품영양학과 (4년제 수료)",
    detail:
      "학점 3.1 / 4.5 · 2017.06 아리비교과 에세이 공모전 3등. 그 전에는 대일고등학교 이과계열을 졸업했습니다.",
  },
];

interface AskItem {
  q: string;
  a: string;
}

const ASK: AskItem[] = [
  {
    q: "무한 로딩의 원인을 어떻게 찾으셨나요?",
    a: '코드를 다시 읽는 대신 <b>네트워크 탭부터 열었던 이유</b>와, 서버가 정상이라는 걸 확인한 뒤 범위를 어떻게 좁혔는지 말씀드리겠습니다. 지금이라면 로그와 DTO를 어떻게 미리 설계할지도 함께 말씀드릴 수 있습니다.',
  },
  {
    q: "의존하는 외부 API가 죽으면 어떻게 하실 건가요?",
    a: '3차 프로젝트에서 가장 오래 붙들었던 질문입니다. 날씨 클라이언트를 <b>실패해도 예외를 던지지 않도록</b> 두고, 상태를 “정상 / 예보 없음 / 조회 실패” 셋으로 나눈 이유를 말씀드리겠습니다. 반대로 <b>토큰 캐시는 실패를 반드시 위로 전파해야 하는데</b>, 왜 같은 캐시인데 정책이 다른지도 함께요.',
  },
  {
    q: "비전공인데, 이 정도로 충분한가요?",
    a: '충분하지 않습니다. 개발을 시작한 지 아직 <b>1년이 되지 않았습니다.</b> 그래서 완성도 대신 <b>모르는 것을 얼마나 빨리 좁혀왔는지</b>로 보여드리고 싶습니다. 시작할 때는 <code class="mono">main</code> 메서드도 몰랐고, 지금은 비관적 락과 커서 페이징이 왜 필요한지 코드를 짚어 설명할 수 있습니다. 다음 1년에 무엇을 채울지도 정해두었습니다.',
  },
];

/* ══════════════════════════════════════════════════════════════════════
   메뉴 입구 (홈 랜딩)
   ══════════════════════════════════════════════════════════════════════ */
interface Entry {
  key: SubPage;
  title: string;
  desc: string;
  meta: string;
}

const ENTRIES: Entry[] = [
  {
    key: "about",
    title: "자기소개",
    desc: "비전공에서 백엔드까지 — 어떤 사람이고 어떻게 일하는지",
    meta: "프로필 · 강점 · 일하는 방식 · 면접 질문",
  },
  {
    key: "work",
    title: "프로젝트",
    desc: "세 개의 서비스, 매번 더 깊어진 문제",
    meta: "대동여집도 · PLEEGIE · Basecamp",
  },
  {
    key: "stack",
    title: "기술",
    desc: "할 수 있는 것과 아직 못 하는 것을 나눠 적었습니다",
    meta: "숙련도 3단계 · 프로젝트별 사용 기술",
  },
  {
    key: "history",
    title: "이력",
    desc: "교육과정 안에 프로젝트를 함께 묶은 연대기",
    meta: "교육 · 프로젝트 · 경력 · 학력",
  },
  {
    key: "contact",
    title: "연락",
    desc: "30분이면 어떤 개발자인지 판단하실 수 있습니다",
    meta: "이메일 · 전화 · GitHub · 채용 정보",
  },
];

/* ══════════════════════════════════════════════════════════════════════
   HOME — 랜딩
   ══════════════════════════════════════════════════════════════════════ */
const HomePage: React.FC<{ go: (p: Page) => void }> = ({ go }) => (
  <>
    <header className="hero">
      <div className="glow" />
      <div className="grid-lines" />
      <div className="grain" />
      <div className="wrap">
        <div className="hero-main">
          <div>
            <span className="pill">
              <i />
              BACKEND ENGINEER · 신입 · SEOUL
            </span>
            <h1>
              이종빈
              <span className="sub">Java · Spring Boot · MySQL</span>
            </h1>
            <p className="hero-lead">
              식품영양학과를 나와 사무직으로 일하다, 2025년 11월에 개발을 시작했습니다. 그 뒤로
              교육과정 두 개를 쉬지 않고 이어가며 팀 프로젝트 세 건을 맡았습니다. 제가 가장 잘하는 일은{" "}
              <span className="hl">안 되는 이유를 끝까지 찾아내는 것</span>입니다.
            </p>
            <div className="cta">
              <button className="btn primary" onClick={() => go("work")}>
                프로젝트 3건 보기
              </button>
              <button className="btn" onClick={() => go("about")}>
                자기소개
              </button>
              <a
                className="btn"
                href="https://github.com/jongbeen97?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
          <figure className="character">
            <img src={CHARACTER} alt="이종빈 캐릭터" width="520" height="1330" />
          </figure>
        </div>

        <div className="route">
          <p className="route-head">비전공에서 백엔드까지 — 지나온 경로</p>
          <ol className="rail">
            {ROUTE.map((s, i) => (
              <React.Fragment key={s.yr + s.what}>
                <li style={{ animationDelay: `${0.15 + i * 0.07}s` }}>
                  <div className={`stop${s.now ? " now" : ""}${s.live ? " live" : ""}`}>
                    <span className="yr">{s.yr}</span>
                    <span className="what">{s.what}</span>
                    <span className="note">{s.note}</span>
                  </div>
                </li>
                {i < ROUTE.length - 1 && (
                  <li className="arrow" style={{ animationDelay: `${0.19 + i * 0.07}s` }}>
                    ›
                  </li>
                )}
              </React.Fragment>
            ))}
          </ol>
        </div>
      </div>
    </header>

    <Metrics />

    {/* 한눈에 보기 */}
    <section>
      <div className="wrap">
        <Rv className="sec-head">
          <p className="eyebrow">한눈에 보기</p>
          <h2 className="sec">3분이면 충분합니다</h2>
          <p className="sec-lead">
            자세한 내용은 각 페이지에 있습니다. 여기서는 <b>제일 중요한 것만</b> 먼저 보여드립니다.
          </p>
        </Rv>

        <Rv className="glance">
          <div>
            <div className="gl-k">어떤 사람인가</div>
            <p>
              식품영양학과를 나와 사무직으로 <b>1년 11개월</b>. 2025년 11월 개발을 시작해{" "}
              <b>교육과정 두 개를 쉬지 않고</b> 이어오고 있습니다.
            </p>
          </div>
          <div>
            <div className="gl-k">무엇을 만들었나</div>
            <p>
              4~5인 팀 프로젝트 <b>세 건</b>. 인증 거주 후기 커뮤니티, 전통시장 연계 커머스, 캠핑장 예약
              플랫폼을 기획부터 배포까지 완주했습니다.
            </p>
          </div>
          <div>
            <div className="gl-k">무엇을 할 수 있나</div>
            <p>
              <b>REST API 설계</b>와 CRUD·검색·페이징, 관리자 기능, <b>외부 API 연동</b>과 캐시 설계까지
              직접 만들어봤습니다.
            </p>
          </div>
        </Rv>

        {/* 프로젝트 미리보기 */}
        <Rv className="subhead">
          <span className="n">PROJECTS</span>
          <h3>세 개의 서비스</h3>
          <span className="ln" />
        </Rv>
        <Rv className="minis">
          {(Object.keys(PROJECTS) as ProjectKey[]).map((key, i) => {
            const p = PROJECTS[key];
            return (
              <button className="mini" key={key} style={hueVars(p.hue)} onClick={() => go(key)}>
                <span className="mini-img">
                  <Cover src={p.cover} title={p.title} />
                </span>
                <span className="mini-top">
                  <span className="mini-no">{i + 1}차 프로젝트</span>
                  {p.status && <span className="mini-live">{p.status}</span>}
                </span>
                <span className="mini-t">{p.title}</span>
                <span className="mini-s">{p.sub}</span>
                <span className="mini-role">{p.myPartLabel.replace("MY PART · ", "")}</span>
              </button>
            );
          })}
        </Rv>

        {/* 할 수 있는 일 요약 */}
        <Rv className="subhead">
          <span className="n">CAN DO</span>
          <h3>이런 업무를 맡을 수 있습니다</h3>
          <span className="ln" />
        </Rv>
        <Rv className="cando">
          {CAN_DO.slice(0, 4).map(([t, d, src]) => (
            <div className="cd" key={t}>
              <span className="ck">✓</span>
              <div>
                <div className="ct">{t}</div>
                <div className="cd-d">{d}</div>
              </div>
              <span className="cs">{src}</span>
            </div>
          ))}
        </Rv>
        <Rv style={{ marginTop: 18 }}>
          <button className="more" onClick={() => go("stack")}>
            할 수 있는 일 8가지 전체 보기 <span>→</span>
          </button>
        </Rv>
      </div>
    </section>

    {/* 메뉴 입구 */}
    <section style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Rv className="sec-head">
          <p className="eyebrow">둘러보기</p>
          <h2 className="sec">더 보시겠습니까?</h2>
          <p className="sec-lead">
            다섯 개의 페이지로 나눠 두었습니다. <b>시간이 없으시다면 프로젝트</b>부터 권합니다.
          </p>
        </Rv>
        <Rv className="entries">
          {ENTRIES.map((e, i) => (
            <button className="entry" key={e.key} onClick={() => go(e.key)}>
              <span className="entry-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="entry-main">
                <span className="entry-t">{e.title}</span>
                <span className="entry-d">{e.desc}</span>
              </span>
              <span className="entry-meta">{e.meta}</span>
              <span className="entry-arr">→</span>
            </button>
          ))}
        </Rv>
      </div>
    </section>

    {/* 마무리 연락 */}
    <section className="contact" style={{ paddingTop: 0 }}>
      <div className="glow" />
      <div className="grain" />
      <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 88 }}>
        <h2>
          30분이면 제가 어떤 개발자인지
          <br />
          판단하실 수 있습니다.
        </h2>
        <p className="lead">
          코드 리뷰든 과제 전형이든, 확인하고 싶으신 방식으로 검증받고 싶습니다. 편하게 연락 주세요.
        </p>
        <div className="ct">
          <a href="mailto:jongbeen97@naver.com">
            <div className="l">EMAIL</div>
            <div className="v">jongbeen97@naver.com</div>
          </a>
          <a href="tel:01091206601">
            <div className="l">PHONE</div>
            <div className="v">010-9120-6601</div>
          </a>
          <a href="https://github.com/jongbeen97?tab=repositories" target="_blank" rel="noopener noreferrer">
            <div className="l">GITHUB</div>
            <div className="v">github.com/jongbeen97</div>
          </a>
        </div>
        <footer>
          <span>© 2026 LEE JONGBEEN · 이 사이트는 React 19 + TypeScript로 직접 만들었습니다</span>
          <span>SEOUL, KR · 2026.11 SeSAC 수료 예정 · 입사 시기 협의 가능</span>
        </footer>
      </div>
    </section>
  </>
);

/* ══════════════════════════════════════════════════════════════════════
   ABOUT — 자기소개
   ══════════════════════════════════════════════════════════════════════ */
const AboutPage: React.FC<{ go: (p: Page) => void }> = ({ go }) => (
  <div style={hueVars(HUE.emerald)}>
    <PageHead
      eyebrow="01 · ABOUT"
      title={
        <>
          식품영양학과를 나와,
          <br />
          서버 앞에 앉기까지.
        </>
      }
      lead="이력서 한 장으로는 잘 전달되지 않는 것들을 적었습니다. 어떤 사람이고, 왜 백엔드이고, 팀에서는 어떻게 움직이는지."
      photo
    >
      <div className="p-facts">
        {PROFILE.slice(0, 4).map(([k, v]) => (
          <div key={k}>
            <div className="k">{k}</div>
            <div className="v">{v}</div>
          </div>
        ))}
      </div>
    </PageHead>

    <section>
      <div className="wrap">
        <Rv className="about">
          <div className="about-text">
            {ABOUT.map(([q, t], i) => (
              <section className="ab" key={q}>
                <h4>
                  <span className="ab-no">{String(i + 1).padStart(2, "0")}</span>
                  {q}
                </h4>
                <p dangerouslySetInnerHTML={{ __html: t }} />
              </section>
            ))}
          </div>
          <aside className="profile">
            <div className="profile-top">
              <img src={PHOTO} alt="이종빈" />
              <div>
                <b>이종빈</b>
                <span>백엔드 개발자 지망 · 신입</span>
              </div>
            </div>
            <div className="profile-head">
              <span className="dot" />
              PROFILE
            </div>
            <dl>
              {PROFILE.map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          </aside>
        </Rv>

        <Rv className="quote">
          <p>
            군 제대 후 진로를 두고 한참을 방황했습니다. 개발은 어릴 때부터 하고 싶었지만 전공이 아니라
            어디서 시작해야 할지 몰랐습니다. 국비 지원 과정을 알게 되어 반쯤 막연하게 신청했는데,
            수업을 들으며 <b>웹 개발이 재미있다는 걸 알았습니다.</b> 지금은 제가 만든 것을 남들이 쓸 수
            있게 <b>배포하는 일까지 재미있습니다.</b>
          </p>
          <span className="by">— 자기소개서 중에서</span>
        </Rv>

        <Rv className="subhead">
          <span className="n">STRENGTH</span>
          <h3>말보다 확인 가능한 근거 세 가지</h3>
          <span className="ln" />
        </Rv>
        <Rv className="why">
          {WHY.map((w) => (
            <article key={w.tag}>
              <span className="tagline">{w.tag}</span>
              <h3 dangerouslySetInnerHTML={{ __html: w.h }} />
              <p dangerouslySetInnerHTML={{ __html: w.p }} />
            </article>
          ))}
        </Rv>

        <Rv className="subhead">
          <span className="n">HOW I WORK</span>
          <h3>같이 일하면 이런 사람입니다</h3>
          <span className="ln" />
        </Rv>
        <Rv className="ways">
          {WAYS.map((w, i) => (
            <div className="way" key={w.h}>
              <div className="no">0{i + 1}</div>
              <h3>{w.h}</h3>
              <p dangerouslySetInnerHTML={{ __html: w.p }} />
            </div>
          ))}
        </Rv>

        <Rv className="subhead">
          <span className="n">AMBITION</span>
          <h3>입사 후에는</h3>
          <span className="ln" />
        </Rv>
        <Rv className="ways">
          {AMBITION.map(([h, p2], i) => (
            <div className="way" key={h}>
              <div className="no">0{i + 1}</div>
              <h3>{h}</h3>
              <p>{p2}</p>
            </div>
          ))}
        </Rv>
      </div>
    </section>

    <section className="ask">
      <div className="glow" />
      <div className="grain" />
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <Rv className="sec-head">
          <p className="eyebrow">면접관님께</p>
          <h2 className="sec">이 세 가지는 꼭 물어봐 주세요</h2>
          <p className="sec-lead">
            모범답안을 준비했다는 뜻이 아니라, <b>제가 가장 오래 붙들고 있었던 질문</b>이라는 뜻입니다.
          </p>
        </Rv>
        <Rv as="ol" className="qa">
          {ASK.map((x, i) => (
            <li key={x.q}>
              <div className="num">QUESTION {i + 1}</div>
              <p className="q">{x.q}</p>
              <p className="a" dangerouslySetInnerHTML={{ __html: x.a }} />
            </li>
          ))}
        </Rv>
      </div>
    </section>

    <PageFlow current="about" go={go} />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   WORK — 프로젝트 목록
   ══════════════════════════════════════════════════════════════════════ */
const WorkPage: React.FC<{ go: (p: Page) => void }> = ({ go }) => (
  <div>
    <PageHead
      eyebrow="02 · PROJECTS"
      title={
        <>
          세 개의 서비스,
          <br />
          매번 더 깊어진 문제.
        </>
      }
      lead="기능 목록 대신 무엇이 막혔고 왜 그랬는지를 적었습니다. 카드를 누르면 설계 배경 · 시스템 구성도 · 담당 API · 실제 코드 · 트러블슈팅까지 이어집니다."
    />
    <section>
      <div className="wrap">
        <Rv className="roles">
          {(Object.keys(PROJECTS) as ProjectKey[]).map((key) => {
            const p = PROJECTS[key];
            return (
              <div className="role-sum" key={key} style={hueVars(p.hue)}>
                <div className="rs-no">{Number(p.index.replace("PROJECT ", ""))}차 프로젝트</div>
                <div className="rs-t">{p.title}</div>
                <div className="rs-r">{p.myPartLabel.replace("MY PART · ", "")}</div>
                <p>{p.myPartText}</p>
              </div>
            );
          })}
        </Rv>

        <Rv className="cards">
          {(Object.keys(PROJECTS) as ProjectKey[]).map((key) => {
            const p = PROJECTS[key];
            return (
              <button className="card" key={key} style={hueVars(p.hue)} onClick={() => go(key)}>
                <div className="card-body">
                  <div className="card-top">
                    <span className="card-no">{p.index}</span>
                    {p.status && (
                      <span className="card-status">
                        <i />
                        {p.status}
                      </span>
                    )}
                    <span className="card-when">{p.when}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p className="sub">{p.sub}</p>
                  <p className="desc" dangerouslySetInnerHTML={{ __html: p.cardDesc }} />
                  <div className="card-keys">
                    {p.cardTags.map(([t, on]) => (
                      <Chip key={t} on={on}>
                        {t}
                      </Chip>
                    ))}
                  </div>
                  <div className="card-foot">
                    <div className="card-role">
                      <b>{p.myPartLabel}</b>
                      {p.myPartText}
                    </div>
                    <span className="card-go">
                      자세히 보기 <span>→</span>
                    </span>
                  </div>
                </div>
                <div className="card-cover">
                  <Cover src={p.cover} title={p.title} />
                </div>
              </button>
            );
          })}
        </Rv>
      </div>
    </section>
    <PageFlow current="work" go={go} />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   STACK — 기술
   ══════════════════════════════════════════════════════════════════════ */
/** 프로젝트별 사용 기술 매트릭스 [기술, 1차, 2차, 3차] */
const MATRIX: [string, boolean, boolean, boolean][] = [
  ["Java", true, true, true],
  ["Spring Boot", true, true, true],
  ["Spring Security", true, true, true],
  ["OAuth2 · JWT", true, true, true],
  ["JPA", true, true, true],
  ["MyBatis", true, false, false],
  ["QueryDSL", false, true, true],
  ["MySQL", true, true, true],
  ["Redis", true, true, true],
  ["Thymeleaf", true, false, false],
  ["jQuery · AJAX", true, false, false],
  ["React", false, true, true],
  ["TypeScript", false, false, true],
  ["Python · FastAPI", false, true, false],
  ["LLM · RAG", true, true, false],
  ["WebSocket", true, false, false],
  ["공공 · 외부 API", true, true, true],
  ["Docker · CI/CD", false, true, true],
];

const StackPage: React.FC<{ go: (p: Page) => void }> = ({ go }) => (
  <div style={hueVars(HUE.sky)}>
    <PageHead
      eyebrow="03 · SKILLS"
      title={
        <>
          할 수 있는 것과
          <br />
          아직 못 하는 것.
        </>
      }
      lead="신입에게 중요한 건 목록의 길이가 아니라 어디까지 해봤는지라고 생각합니다. 그래서 세 단계로 나누고, 어느 프로젝트에서 썼는지까지 표로 적었습니다."
    />

    <section>
      <div className="wrap">
        <Rv className="sec-head">
          <p className="eyebrow">할 수 있는 일</p>
          <h2 className="sec">이런 업무를 맡을 수 있습니다</h2>
          <p className="sec-lead">
            기술 이름이 아니라 <b>실제로 맡을 수 있는 일</b>로 적었습니다. 오른쪽은 그 일을 해본
            프로젝트입니다.
          </p>
        </Rv>
        <Rv className="cando">
          {CAN_DO.map(([t, d, src]) => (
            <div className="cd" key={t}>
              <span className="ck">✓</span>
              <div>
                <div className="ct">{t}</div>
                <div className="cd-d">{d}</div>
              </div>
              <span className="cs">{src}</span>
            </div>
          ))}
        </Rv>

        <Rv className="subhead">
          <span className="n">LEVEL</span>
          <h3>숙련도는 세 단계로 나눴습니다</h3>
          <span className="ln" />
        </Rv>
        <Rv className="stack">
          {STACK.map((s) => (
            <div key={s.lv}>
              <div className="lv-row">
                <span className="lv">{s.lv}</span>
                <span className="cnt">{s.items.length}</span>
              </div>
              <h3>{s.h}</h3>
              <ul>
                {s.items.map(([a, b]) => (
                  <li key={a}>
                    {a}
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {s.memo && <p className="memo" dangerouslySetInnerHTML={{ __html: s.memo }} />}
            </div>
          ))}
        </Rv>

        <Rv className="subhead">
          <span className="n">MATRIX</span>
          <h3>어느 프로젝트에서 썼는지</h3>
          <span className="ln" />
        </Rv>
        <Rv className="matrix-wrap">
          <table className="matrix">
            <thead>
              <tr>
                <th>기술</th>
                <th>
                  <span className="mh" style={{ color: HUE.emerald.a }}>
                    1차
                  </span>
                  <em>대동여집도</em>
                </th>
                <th>
                  <span className="mh" style={{ color: HUE.amber.a }}>
                    2차
                  </span>
                  <em>PLEEGIE</em>
                </th>
                <th>
                  <span className="mh" style={{ color: HUE.sky.a }}>
                    3차
                  </span>
                  <em>Basecamp</em>
                </th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map(([name, a, b2, c]) => (
                <tr key={name}>
                  <td className="mt">{name}</td>
                  <td>{a && <i className="mk" style={{ background: HUE.emerald.a }} />}</td>
                  <td>{b2 && <i className="mk" style={{ background: HUE.amber.a }} />}</td>
                  <td>{c && <i className="mk" style={{ background: HUE.sky.a }} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Rv>
        <Rv as="p" className="api-note">
          팀 프로젝트라 <b>제가 직접 다룬 것만</b> 표시했습니다. 팀원이 구현하고 저는 발표를 위해 읽기만 한
          기능(예: 1차의 WebSocket 알림)은 “읽고 따라갈 수 있는 것”에 가깝습니다.
        </Rv>
      </div>
    </section>

    <PageFlow current="stack" go={go} />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   HISTORY — 이력
   ══════════════════════════════════════════════════════════════════════ */
const HistoryPage: React.FC<{ go: (p: Page) => void }> = ({ go }) => (
  <div style={hueVars(HUE.amber)}>
    <PageHead
      eyebrow="04 · HISTORY"
      title={
        <>
          돌아온 길도
          <br />
          이력입니다.
        </>
      }
      lead="전공을 바꾸는 데 시간이 걸렸습니다. 대신 그 시간에 사람을 상대하고, 데이터를 만지고, 책임지는 법을 배웠습니다. 교육과정 안에 프로젝트를 함께 묶었습니다."
    />
    <section>
      <div className="wrap">
        <Rv as="ol" className="tl">
          {TIMELINE.map((t) => (
            <li key={t.what} className={t.on ? "on" : ""}>
              <div className="when">{t.when}</div>
              <div className="what">{t.what}</div>
              <div className="detail">{t.detail}</div>
              {t.children && (
                <div className="kids">
                  {t.children.map((c) =>
                    c.key ? (
                      <button className="kid" key={c.label} onClick={() => go(c.key as Page)}>
                        <span className="kl">{c.label}</span>
                        <span className="kd">{c.desc}</span>
                        <span className="karr">→</span>
                      </button>
                    ) : (
                      <div className="kid" key={c.label}>
                        <span className="kl">{c.label}</span>
                        <span className="kd">{c.desc}</span>
                      </div>
                    )
                  )}
                </div>
              )}
            </li>
          ))}
        </Rv>
      </div>
    </section>
    <PageFlow current="history" go={go} />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   CONTACT — 연락
   ══════════════════════════════════════════════════════════════════════ */
const HIRE: [string, string][] = [
  ["근무 가능 시기", "2026년 11월 20일 SeSAC 수료 후 · 시기 협의 가능"],
  ["희망 직무", "백엔드 개발자 (Java · Spring Boot)"],
  ["근무 지역", "서울 · 수도권"],
  ["고용 지원", "청년취업지원 프로그램 이수 · 고용지원금 지원 대상"],
];

const ContactPage: React.FC<{ go: (p: Page) => void }> = ({ go }) => (
  <div style={hueVars(HUE.emerald)}>
    <PageHead
      eyebrow="05 · CONTACT"
      title={
        <>
          30분이면 어떤 개발자인지
          <br />
          판단하실 수 있습니다.
        </>
      }
      lead="코드 리뷰든 과제 전형이든, 확인하고 싶으신 방식으로 검증받고 싶습니다. 입사 후 첫 목표는 회사의 코드와 규칙을 빠르게 익혀 1인분 이상을 해내는 것입니다."
    />
    <section>
      <div className="wrap">
        <Rv className="reach">
          <a href="mailto:jongbeen97@naver.com">
            <span className="l">EMAIL</span>
            <span className="v">jongbeen97@naver.com</span>
            <span className="g">메일 보내기 →</span>
          </a>
          <a href="tel:01091206601">
            <span className="l">PHONE</span>
            <span className="v">010-9120-6601</span>
            <span className="g">전화 걸기 →</span>
          </a>
          <a href="https://github.com/jongbeen97?tab=repositories" target="_blank" rel="noopener noreferrer">
            <span className="l">GITHUB</span>
            <span className="v">github.com/jongbeen97</span>
            <span className="g">저장소 보기 →</span>
          </a>
        </Rv>

        <Rv className="subhead">
          <span className="n">FOR RECRUITERS</span>
          <h3>채용 담당자께</h3>
          <span className="ln" />
        </Rv>
        <Rv className="hire">
          {HIRE.map(([k, v]) => (
            <div key={k}>
              <div className="hk">{k}</div>
              <div className="hv">{v}</div>
            </div>
          ))}
        </Rv>
        <Rv as="p" className="api-note" style={{ marginTop: 20 }}>
          이 사이트는 <b>React 19 + TypeScript</b>로 직접 만들었고, 소스는 GitHub에 공개되어 있습니다.
        </Rv>
      </div>
    </section>
    <PageFlow current="contact" go={go} />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   6. PROJECTS
   ══════════════════════════════════════════════════════════════════════ */

const C = {
  ink: "#08121C",
  ink2: "#0E1B27",
  line: "#08121C",
  muted: "#6A7885",
  onDark: "#93A3B0",
  warn: "#CE4F38",
} as const;

const F = { sans: "Pretendard, sans-serif", mono: "JetBrains Mono, monospace" } as const;

/* ── 대동여집도 구성도 ── */
const ZipmapDiagram: React.FC<{ h: Hue }> = ({ h }) => (
  <svg viewBox="0 0 960 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="대동여집도 시스템 구성도">
    <defs>
      <marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
        <path d="M0 0 L9 4.5 L0 9 z" fill={C.muted} />
      </marker>
    </defs>
    <g fontFamily={F.mono} fontSize="10" letterSpacing="1.5" fill={C.muted}>
      <text x="100" y="14">CLIENT</text>
      <text x="100" y="122">APPLICATION — SPRING BOOT 3 (MVC)</text>
      <text x="100" y="330">DATA &amp; EXTERNAL</text>
    </g>

    <rect x="180" y="24" width="600" height="58" rx="12" fill={C.ink} />
    <text x="480" y="49" textAnchor="middle" fill="#fff" fontFamily={F.sans} fontSize="15" fontWeight="600">브라우저</text>
    <text x="480" y="69" textAnchor="middle" fill={C.onDark} fontFamily={F.mono} fontSize="11">Thymeleaf · Bootstrap · jQuery AJAX</text>
    <line x1="480" y1="82" x2="480" y2="130" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah)" />

    <rect x="100" y="132" width="760" height="150" rx="14" fill="none" stroke={C.muted} strokeWidth="1" strokeDasharray="5 5" />
    {([["Controller", "Post · Reply · Admin", 128], ["Service", "Post · Report · Gemini", 380], ["Mapper", "MyBatis XML", 632]] as [string, string, number][]).map(
      ([t, s, x]) => (
        <g key={t}>
          <rect x={x} y="178" width="200" height="62" rx="10" fill={h.a} />
          <text x={x + 100} y="204" textAnchor="middle" fill="#fff" fontFamily={F.sans} fontSize="14.5" fontWeight="600">{t}</text>
          <text x={x + 100} y="223" textAnchor="middle" fill="rgba(255,255,255,.78)" fontFamily={F.mono} fontSize="10.5">{s}</text>
        </g>
      )
    )}
    <line x1="328" y1="209" x2="372" y2="209" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah)" />
    <line x1="580" y1="209" x2="624" y2="209" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah)" />

    <rect x="112" y="120" width="216" height="26" rx="13" fill={C.ink2} />
    <text x="220" y="138" textAnchor="middle" fill={h.lt} fontFamily={F.mono} fontSize="10.5">Spring Security · OAuth2</text>

    <path d="M480 282 L480 312 L228 312 L228 338" fill="none" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah)" />
    <line x1="480" y1="282" x2="480" y2="338" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah)" />
    <line x1="732" y1="282" x2="732" y2="338" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah)" />

    {([["외부 API", "Gemini · Kakao · 경찰청", 128], ["Redis", "조회수 · 랭킹 · 중복방지", 380], ["MySQL", "회원 · 게시글 · 리뷰 · 신고", 632]] as [string, string, number][]).map(
      ([t, s, x]) => (
        <g key={t}>
          <rect x={x} y="344" width="200" height="60" rx="10" fill="none" stroke={C.line} strokeWidth="1.3" strokeOpacity=".22" />
          <text x={x + 100} y="369" textAnchor="middle" fill={C.ink} fontFamily={F.sans} fontSize="14" fontWeight="600">{t}</text>
          <text x={x + 100} y="388" textAnchor="middle" fill={C.muted} fontFamily={F.mono} fontSize="10.5">{s}</text>
        </g>
      )
    )}

    <path d="M480 404 L480 428 L732 428 L732 410" fill="none" stroke={C.warn} strokeWidth="1.3" strokeDasharray="4 4" markerEnd="url(#ah)" />
    <text x="606" y="450" textAnchor="middle" fill={C.warn} fontFamily={F.mono} fontSize="10.5">@Scheduled — 10분마다 Redis → MySQL 반영</text>

    <rect x="800" y="24" width="60" height="58" rx="10" fill="none" stroke={C.muted} strokeWidth="1" strokeDasharray="4 4" />
    <text x="830" y="49" textAnchor="middle" fill={C.muted} fontFamily={F.mono} fontSize="9.5">WEB</text>
    <text x="830" y="63" textAnchor="middle" fill={C.muted} fontFamily={F.mono} fontSize="9.5">SOCKET</text>
    <line x1="800" y1="53" x2="782" y2="53" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" />
  </svg>
);

/* ── PLEEGIE 구성도 ── */
const PleegieDiagram: React.FC<{ h: Hue }> = ({ h }) => (
  <svg viewBox="0 0 960 510" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PLEEGIE 시스템 구성도">
    <defs>
      <marker id="ah2" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
        <path d="M0 0 L9 4.5 L0 9 z" fill={C.muted} />
      </marker>
    </defs>
    <g fontFamily={F.mono} fontSize="10" letterSpacing="1.5" fill={C.muted}>
      <text x="60" y="14">CLIENT</text>
      <text x="60" y="200">SERVER</text>
      <text x="60" y="418">DATA &amp; EXTERNAL</text>
    </g>

    <rect x="300" y="24" width="360" height="62" rx="12" fill={h.a} />
    <text x="480" y="50" textAnchor="middle" fill="#fff" fontFamily={F.sans} fontSize="15" fontWeight="600">React + Vite</text>
    <text x="480" y="70" textAnchor="middle" fill="rgba(255,255,255,.78)" fontFamily={F.mono} fontSize="10.5">라우팅 · 냉장고 · 레시피 · 시장 QR</text>
    <line x1="480" y1="86" x2="480" y2="112" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah2)" />

    <rect x="300" y="114" width="360" height="44" rx="10" fill="none" stroke={C.line} strokeWidth="1.3" strokeOpacity=".28" strokeDasharray="5 4" />
    <text x="480" y="141" textAnchor="middle" fill={C.ink} fontFamily={F.mono} fontSize="12">Vite Proxy — 포트 분기 / CORS 우회</text>

    <path d="M400 158 L400 186 L250 186 L250 212" fill="none" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah2)" />
    <path d="M560 158 L560 186 L710 186 L710 212" fill="none" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah2)" />

    <rect x="70" y="214" width="360" height="140" rx="12" fill={C.ink} />
    <text x="250" y="242" textAnchor="middle" fill="#fff" fontFamily={F.sans} fontSize="15" fontWeight="600">Spring Boot : 8080</text>
    <g fill={C.onDark} fontFamily={F.mono} fontSize="11">
      <text x="98" y="268">· REST Controller / DTO / 공통 예외</text>
      <text x="98" y="290">· Spring Security + JWT · OAuth2</text>
      <text x="98" y="312">· JPA — 회원 / 냉장고 / 시장 / 레시피</text>
      <text x="98" y="334">· Scheduler — 유통기한 · 할인 마감</text>
    </g>

    <rect x="530" y="214" width="360" height="140" rx="12" fill={C.ink2} />
    <text x="710" y="242" textAnchor="middle" fill="#fff" fontFamily={F.sans} fontSize="15" fontWeight="600">Python FastAPI : 8000</text>
    <g fill={C.onDark} fontFamily={F.mono} fontSize="11">
      <text x="558" y="268">· LangChain + Groq LLM</text>
      <text x="558" y="290">· 레시피 추천 / 대화형 검색</text>
      <text x="558" y="312">· SentenceTransformer 임베딩</text>
      <text x="558" y="334">· RAG — 재료 유사도 검색</text>
    </g>
    <line x1="430" y1="284" x2="522" y2="284" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah2)" />
    <text x="476" y="276" textAnchor="middle" fill={C.muted} fontFamily={F.mono} fontSize="9.5">AiClient</text>

    <g fill="none" stroke={C.muted} strokeWidth="1.4">
      <path d="M250 354 L250 400" />
      <path d="M170 400 L380 400" />
      <path d="M170 400 L170 426" markerEnd="url(#ah2)" />
      <path d="M380 400 L380 426" markerEnd="url(#ah2)" />
      <path d="M710 354 L710 400" />
      <path d="M590 400 L800 400" />
      <path d="M590 400 L590 426" markerEnd="url(#ah2)" />
      <path d="M800 400 L800 426" markerEnd="url(#ah2)" />
    </g>

    {([["MySQL", "회원·냉장고·시장·레시피", 70, 200], ["Redis", "토큰·레시피 캐싱", 290, 180], ["ChromaDB", "식재료 907개 벡터", 490, 200], ["외부 API", "Kakao Map · 식약처", 710, 180]] as [string, string, number, number][]).map(
      ([t, s, x, w]) => (
        <g key={t}>
          <rect x={x} y="432" width={w} height="58" rx="10" fill="none" stroke={C.line} strokeWidth="1.3" strokeOpacity=".22" />
          <text x={x + w / 2} y="456" textAnchor="middle" fill={C.ink} fontFamily={F.sans} fontSize="14" fontWeight="600">{t}</text>
          <text x={x + w / 2} y="475" textAnchor="middle" fill={C.muted} fontFamily={F.mono} fontSize="10.5">{s}</text>
        </g>
      )
    )}
  </svg>
);

/* ── Basecamp 구성도 ── */
const BasecampDiagram: React.FC<{ h: Hue }> = ({ h }) => (
  <svg viewBox="0 0 960 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Basecamp 시스템 구성도">
    <defs>
      <marker id="ah3" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
        <path d="M0 0 L9 4.5 L0 9 z" fill={C.muted} />
      </marker>
    </defs>
    <g fontFamily={F.mono} fontSize="10" letterSpacing="1.5" fill={C.muted}>
      <text x="60" y="14">CLIENT</text>
      <text x="60" y="190">SERVER</text>
      <text x="60" y="410">DATA &amp; EXTERNAL</text>
    </g>

    <rect x="280" y="24" width="400" height="62" rx="12" fill={h.a} />
    <text x="480" y="50" textAnchor="middle" fill="#fff" fontFamily={F.sans} fontSize="15" fontWeight="600">React 19 + TypeScript</text>
    <text x="480" y="70" textAnchor="middle" fill="rgba(255,255,255,.78)" fontFamily={F.mono} fontSize="10.5">Router v7 · TanStack Query · Zustand</text>
    <line x1="480" y1="86" x2="480" y2="112" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah3)" />

    <rect x="280" y="114" width="400" height="44" rx="10" fill="none" stroke={C.line} strokeWidth="1.3" strokeOpacity=".28" strokeDasharray="5 4" />
    <text x="480" y="141" textAnchor="middle" fill={C.ink} fontFamily={F.mono} fontSize="12">Vite Proxy — /api → :8080 · withCredentials</text>
    <line x1="480" y1="158" x2="480" y2="196" stroke={C.muted} strokeWidth="1.4" markerEnd="url(#ah3)" />

    <rect x="140" y="200" width="680" height="150" rx="14" fill={C.ink} />
    <text x="480" y="228" textAnchor="middle" fill="#fff" fontFamily={F.sans} fontSize="15" fontWeight="600">Spring Boot 3 · Java 21 : 8080</text>
    <g fill={C.onDark} fontFamily={F.mono} fontSize="11">
      <text x="176" y="254">· REST Controller · Swagger 문서화 · 공통 예외(ErrorCode)</text>
      <text x="176" y="276">· Spring Security + JWT — access 30분 / refresh 회전 · 재사용 탐지</text>
      <text x="176" y="298">· JPA + QueryDSL — 예약 / 캠핑장 / 리뷰 / 게시글 / 신고</text>
      <text x="176" y="320">· Scheduler — 결제 만료 처리 · 체크인 D-1 알림</text>
      <text x="176" y="342">· 이벤트 기반 알림 (ApplicationEventPublisher)</text>
    </g>

    <g fill="none" stroke={C.muted} strokeWidth="1.4">
      <path d="M480 350 L480 392" />
      <path d="M160 392 L795 392" />
      <path d="M160 392 L160 414" markerEnd="url(#ah3)" />
      <path d="M370 392 L370 414" markerEnd="url(#ah3)" />
      <path d="M580 392 L580 414" markerEnd="url(#ah3)" />
      <path d="M795 392 L795 414" markerEnd="url(#ah3)" />
    </g>

    {([["MySQL 8", "Flyway 마이그레이션", 70, 180], ["Redis", "토큰 캐시 · 무효화", 280, 180], ["MinIO", "리뷰·게시글 이미지", 490, 180], ["외부 API", "고캠핑 · Kakao · PortOne", 700, 190]] as [string, string, number, number][]).map(
      ([t, s, x, w]) => (
        <g key={t}>
          <rect x={x} y="420" width={w} height="58" rx="10" fill="none" stroke={C.line} strokeWidth="1.3" strokeOpacity=".22" />
          <text x={x + w / 2} y="444" textAnchor="middle" fill={C.ink} fontFamily={F.sans} fontSize="14" fontWeight="600">{t}</text>
          <text x={x + w / 2} y="463" textAnchor="middle" fill={C.muted} fontFamily={F.mono} fontSize="10.5">{s}</text>
        </g>
      )
    )}
  </svg>
);

const PROJECTS: Record<ProjectKey, Project> = {
  /* ──────────────────────────── 대동여집도 ──────────────────────────── */
  zipmap: {
    index: "PROJECT 01",
    no: "1차 팀 프로젝트 · 한국정보교육원",
    when: "2026.02 – 03 · 4주 · 5명",
    title: "대동여집도",
    sub: "zipmap — 자취생을 위한 인증 거주 후기 & 커뮤니티",
    cardDesc:
      "직방·당근을 참고해 <b>실제로 살아본 사람만 후기를 남기는</b> 지도 기반 커뮤니티를 만들었습니다. 카카오 지도에 경찰청 범죄 통계를 얹고, Gemini로 후기를 요약합니다.",
    cardTags: [["Java 17", true], ["Spring Boot 3", true], ["MyBatis", true], ["JPA", true], ["MySQL", true], ["Redis", false], ["Thymeleaf", false], ["Gemini API", false], ["WebSocket", false]],
    cover: `${DECK_BASE}/zipmap/01.jpg`,
    myPartLabel: "MY PART · 백엔드",
    myPartText: "커뮤니티(게시판) 도메인 전체 · 관리자 페이지 · Gemini 요약 서비스 · 팀 대표 발표",

    lead: '방을 구할 때 정말 궁금한 건 평면도가 아니라 <b>“진짜 살아본 사람의 말”</b>입니다. 그런데 그 말은 어디에도 정리돼 있지 않았습니다. 그래서 <b>실거주가 인증된 사람만 후기를 남기는</b> 지도 기반 커뮤니티를 만들었습니다. 저는 <b>커뮤니티 도메인 전체와 관리자 페이지, Gemini 요약 서비스</b>를 맡았습니다.',
    facts: [
      { k: "PERIOD", v: "2026.02.09 – 03.09", s: "4주" },
      { k: "TEAM / ROLE", v: "5명 팀", s: "백엔드 · 발표 담당" },
      { k: "STACK", v: "Java 17 · Spring Boot 3", s: "Thymeleaf · MyBatis · JPA · Redis" },
      { k: "REPOSITORY", link: { href: "https://github.com/jongbeen97/zipmap", text: "jongbeen97/zipmap ↗" } },
    ],

    bgTitle: "직방에는 매물이 있고,<br>커뮤니티에는 소문이 있습니다.",
    bgLead: "둘 다 방을 고르는 데는 부족했습니다. 저희가 정의한 문제는 세 가지였습니다.",
    problems: [
      { t: "후기를 믿을 수 없다", p: "누구나 쓸 수 있는 후기는 광고와 구분되지 않습니다. <b>거주 인증을 통과한 사용자만</b> 후기를 남기게 하고, 관리자가 인증을 심사하는 구조로 설계했습니다." },
      { t: "동네 정보가 흩어져 있다", p: "치안·편의시설 정보는 각각 다른 사이트에 있습니다. 카카오 지도 위에 <b>경찰청 API의 구별 범죄 통계</b>를 겹쳐, 지도를 보며 동네를 판단할 수 있게 했습니다." },
      { t: "읽을 게 너무 많다", p: "후기가 쌓일수록 오히려 읽기 힘들어집니다. <b>Gemini API로 지역별 후기를 요약</b>해, 스크롤을 내리지 않아도 핵심을 먼저 볼 수 있게 했습니다." },
    ],

    hue: HUE.emerald,

    archLead: "Spring Boot 3 + Thymeleaf 기반 서버 렌더링 구조에, 조회수·랭킹만 Redis로 분리했습니다. 초록색이 <b>제가 작성한 영역</b>입니다.",
    Diagram: ZipmapDiagram,
    legend: [[HUE.emerald.a, "제가 작성한 계층"], [null, "저장소 · 외부 연동"], ["#CE4F38", "스케줄러 동기화"]],
    archCap: '게시글 조회수처럼 <b>쓰기는 잦지만 즉시 정확할 필요는 없는 값</b>은 Redis에 누적하고, 10분마다 스케줄러가 MySQL로 한 번에 반영합니다. 매 조회마다 <code class="mono">UPDATE</code>를 날리지 않아도 되는 구조입니다.',

    scopeTitle: "제가 맡은 범위",
    scopeLead: "컨트롤러 3개(Post · Reply · Admin), 매핑 44개, 코드 약 1,900줄. 팀에서 공용으로 만든 부분은 따로 표시했습니다.",
    scope: [
      {
        badge: "담당 01",
        h: "커뮤니티(게시판) 도메인",
        items: [
          "<b>게시글 CRUD</b> — 작성·수정·삭제, 작성자 본인 확인, 카테고리·지역 필터와 검색 조건 조합",
          "<b>에디터 연동</b> — 본문 이미지 업로드·삭제 엔드포인트, 미사용 파일 정리",
          '<b>댓글</b> — 권한 검증, <code class="mono">/reply/list</code> 비동기 조회(10건 단위 무한 스크롤)',
          "<b>좋아요·조회수</b> — Redis 누적 및 인기글 랭킹 반영",
          "<b>신고 접수</b> — 중복 신고 차단, 첨부파일 저장",
        ],
      },
      {
        badge: "담당 02",
        h: "관리자 페이지",
        items: [
          "<b>회원 관리</b> — 상태 변경(정상·정지), 목록 검색",
          "<b>게시글·리뷰 관리</b> — 블라인드 토글, 삭제, 사유 기반 반려",
          "<b>신고 처리</b> — 미처리 신고 조회, 상태 전환, 처리 완료",
          "<b>거주 인증 심사</b> — 대기 목록 조회 및 승인",
          "<b>공지사항</b> — 작성·수정·삭제·노출 토글",
        ],
      },
      {
        badge: "담당 03",
        h: "Gemini 요약 서비스",
        items: [
          "<b>지역 리뷰 요약</b> — 지역 단위로 후기를 모아 정해진 양식으로 요약",
          "<b>게시글 요약</b> — 카테고리별 / 선택한 글 / 단일 글 3종",
          "<b>프롬프트 설계</b> — 역할·입력 설명·출력 양식 분리, 마크다운 금지",
          '<b>캐싱 + 타임아웃</b> — <code class="mono">@Cacheable</code>, 연결·읽기 5초',
        ],
      },
      {
        badge: "팀 공용",
        sub: true,
        h: "제가 만들지 않은 부분",
        items: [
          "OAuth2 소셜 로그인, WebSocket 실시간 알림 — <b>팀원이 구현</b>. 저는 발표를 맡으며 동작 흐름을 학습했습니다",
          "지도·범죄율 화면, 리뷰 등록 화면 — 팀원 담당",
          'Redis 통계 유틸(<code class="mono">StatsUtil</code>) — 팀 공용 모듈. 저는 <b>게시판 도메인에 연결</b>하고 장애 격리를 추가했습니다',
        ],
        memo: "면접에서 제 몫이 아닌 것을 제 몫처럼 말하고 싶지 않아 분리해 적었습니다.",
      },
    ],

    apiTitle: "제가 담당한 주요 엔드포인트",
    api: [
      ["GET", "/post/list", "게시글 목록 — 검색어·카테고리·지역 조건 + 페이징"],
      ["GET", "/post/detail/{id}", "상세 조회 — 조회수 증가(Redis), 좋아요·댓글 포함"],
      ["POST", "/post/write", "글 작성 — 첨부파일 저장"],
      ["POST", "/post/edit/{id}", "글 수정 — 작성자 본인만 허용"],
      ["POST", "/post/delete/{id}", "글 삭제 — 권한 검증 후 처리"],
      ["POST", "/post/uploadSummernoteImage", "에디터 본문 이미지 업로드"],
      ["GET", "/post/summarize-detail/{id}", "단일 게시글 AI 요약"],
      ["POST", "/post/summarize-selected", "선택한 여러 글 묶음 요약"],
      ["GET", "/reply/list", "댓글 비동기 조회 — 10건 단위, 무한 스크롤용"],
      ["POST", "/reply/write", "댓글 작성 — 로그인 세션 검증"],
      ["GET", "/admin/members", "회원 목록 — 검색·페이징"],
      ["POST", "/admin/updateStatus", "회원 상태 변경(정상·정지)"],
      ["POST", "/admin/posts/toggle-status", "게시글 블라인드 전환"],
      ["GET", "/admin/report/pending-reports", "미처리 신고 목록"],
      ["GET", "/admin/report/complete/{id}", "신고 처리 완료"],
      ["GET", "/admin/certification/confirm/{id}", "거주 인증 승인"],
    ],
    apiNote: '제가 작성한 컨트롤러 3개의 매핑 44개 중 16개입니다. 전체는 저장소의 <code class="mono">controller</code> 패키지에서 확인하실 수 있습니다.',

    implLead: "전부 저장소에 있는 실제 코드입니다. 무엇을 만들었는지보다 <b>왜 그렇게 짰는지</b>를 적었습니다.",
    impls: [
      {
        h: "댓글 무한 스크롤 — 페이지를 다시 그리지 않는 방식",
        before:
          '댓글이 많은 글에서 페이지 번호를 누르면 <b>본문까지 다시 내려받고 읽던 위치도 잃습니다.</b> 그래서 댓글만 <code class="mono">@ResponseBody</code>로 JSON을 내려주고, 스크롤이 바닥에 닿으면 <code class="mono">page</code>만 1 올려 다음 10건을 이어 붙였습니다.',
        flow: ["스크롤 바닥 감지", "GET /reply/list?page=n", "JSON 10건", "DOM에 append"],
        code: String.raw`
// 뷰가 아니라 데이터만 응답 — 본문은 다시 내려보내지 않는다
@GetMapping("/list")
@ResponseBody
public List<ReplyDTO> getReplyList(
        @RequestParam String targetType,
        @RequestParam Long targetId,
        @RequestParam(defaultValue = "0") int page) {

    int size = 10;
    return replyService.getReplies(targetType, targetId, page, size);
}`,
        caption: "controller/ReplyController.java",
        after:
          '<b>한계도 함께 알고 있습니다.</b> <code class="mono">page</code> 기반이라 스크롤 도중 새 댓글이 달리면 경계에서 항목이 밀립니다. 이 회고를 3차 Basecamp에서 <b>커서 페이징</b>으로 실제 확인했습니다.',
      },
      {
        h: "Gemini 요약 — 형식을 고정하고, 두 번 부르지 않기",
        before:
          "LLM은 매번 다르게 대답합니다. 화면에 그대로 붙이려면 <b>형식이 고정돼야</b> 합니다. 프롬프트를 ①역할 ②입력 설명 ③출력 양식 세 덩어리로 나눠 조립하고 마크다운을 금지했습니다. 같은 지역을 다시 요약할 때는 외부 호출 없이 캐시로 응답합니다.",
        code: String.raw`
// 지역명을 캐시 키로 — 같은 지역은 두 번 호출하지 않는다
@Cacheable(value = "aiSummaryCache", key = "#regionName")
public String summarizeReviews(String regionName, List<String> reviews) {

    StringBuilder prompt = new StringBuilder();
    // ① 역할 부여
    prompt.append("너는 동네 분위기와 실거주 후기를 전달하는 '동네 찐주민'이야.");
    // ② 입력 데이터 설명
    prompt.append("데이터는 [장점], [단점], [리뷰 내용]으로 구성되어 있어.");
    // ③ 출력 양식 강제 — 딴소리를 못 하게 틀을 잡는다
    prompt.append("[출력 양식] 주요 장점 : ... / 주의할 점 : ... / 총평 : ...");
    prompt.append("마크다운(*) 같은 특수기호는 쓰지 말고 이모지만 섞어줘.");
    ...
}

// 외부 API가 느려도 우리 서버 스레드가 묶이지 않도록
factory.setConnectTimeout(5000);
factory.setReadTimeout(5000);`,
        caption: "service/GeminiService.java",
      },
      {
        h: "조회수 — 매번 UPDATE 하지 않는 구조",
        before:
          "조회수는 <b>쓰기는 가장 잦은데 1초 늦게 맞아도 아무도 불편하지 않은 값</b>입니다. 그래서 조회마다 DB를 건드리지 않고 Redis Hash에 누적하고, 10분마다 스케줄러가 벌크로 반영합니다. 인기글 랭킹은 Sorted Set으로 실시간 갱신합니다.",
        flow: ["상세 조회", "Redis Hash 누적", "@Scheduled 10분", "MyBatis 벌크 UPDATE"],
        code: String.raw`
// 새로고침으로 조회수가 폭발하지 않도록: 식별자당 6시간 1회만 인정
String viewLimitKey = "view:limit:" + domain + ":" + id + ":" + identifier;
Boolean isFirstView = redisTemplate.opsForValue()
        .setIfAbsent(viewLimitKey, "v", 6, TimeUnit.HOURS);
if (Boolean.FALSE.equals(isFirstView) || isFirstView == null) return;

redisTemplate.opsForHash().increment("stats:" + domain + ":" + id, "viewCount", 1);

// 10분마다 Redis → DB 로 한 번에 반영 (Write-Back)
@Scheduled(fixedDelay = 600000)
@Transactional
public void syncRedisToDb() { ... postMapper.updatePostStatsBatch(updateList); }`,
        caption: "util/StatsUtil.java — 팀 공용 모듈, 게시판 연결은 제가 담당",
        after:
          '붙이면서 하나를 더 넣었습니다. <b>Redis가 죽으면 게시글이 아예 안 열리는 게 더 큰 문제</b>라고 판단해, 조회수 증가를 <code class="mono">try-catch</code>로 감싸 실패해도 본문은 정상적으로 보이게 했습니다.',
        code2: String.raw`
// Redis 장애가 '게시글 조회' 자체를 막지 않도록 격리
try {
    statsUtil.updateViewCount("post", id, identifier);
} catch (Exception e) {
    // 카운트는 포기하고 본문은 보여준다
    log.warn("조회수 증가 실패 - postId: {}", id);
}`,
        caption2: "service/PostService.java",
      },
    ],

    tsLead: "해결한 결과보다 <b>원인에 도달한 순서</b>를 적었습니다.",
    troubles: [
      {
        kick: "TROUBLE 01 · 프론트–백엔드 규격",
        h: "무한 스크롤이 로딩만 반복하고 데이터가 붙지 않았습니다",
        steps: [
          ["현상", "댓글 무한 스크롤에서 스피너만 계속 돌고 목록이 그려지지 않았습니다. <b>콘솔 에러도 없었습니다.</b>"],
          ["가설", "“서버가 데이터를 안 주는 것 같다”가 첫 추측이었습니다. 하지만 추측으로 코드를 고치면 시간만 씁니다."],
          ["확인", '개발자도구 <b>Network 탭</b>에서 <code class="mono">/reply/list</code>의 Response를 직접 열었습니다. → <b>서버는 JSON을 정상 응답</b>하고 있었습니다. 이 한 번으로 문제 범위가 절반으로 줄었습니다.'],
          ["원인", '병합 과정에서 <b>응답 필드명과 JS가 참조하는 변수명이 어긋나</b> 있었습니다. 값이 <code class="mono">undefined</code>라 아무것도 그려지지 않았고, JS는 에러 없이 조용히 넘어갔습니다.'],
          ["해결", "DTO 기준으로 필드명을 통일하고, 조회를 페이지 단위로 정리했습니다.", "result"],
          ["배운 점", "“에러가 없다”는 “정상”이 아니라 <b>조용한 실패</b>일 수 있습니다. 그리고 이건 코드 문제가 아니라 <b>합의 문제</b>였습니다. 이후 팀 규칙으로 착수 전에 필드명부터 맞췄고, 같은 유형은 재발하지 않았습니다. 3차에서 TypeScript를 쓰며 <b>이 문제가 컴파일 단계에서 잡힌다</b>는 것도 알게 됐습니다.", "learn"],
        ],
      },
      {
        kick: "TROUBLE 02 · 외부 API",
        h: "AI 요약이 매번 다른 형식으로, 그것도 느리게 나왔습니다",
        steps: [
          ["현상", "같은 지역을 요약해도 형식이 매번 달라 화면이 깨졌고, 버튼을 누를 때마다 외부 API를 호출해 응답이 느렸습니다."],
          ["원인", "프롬프트가 “요약해 줘” 수준이라 <b>출력 형태에 제약이 없었습니다.</b> 결과를 저장하지 않아 같은 요청을 매번 다시 물어봤습니다."],
          ["해결 ①", "프롬프트에 <b>출력 양식을 명시</b>하고 마크다운을 금지했습니다. 화면에서 별도 파싱 없이 그대로 출력할 수 있게 됐습니다.", "result"],
          ["해결 ②", '지역명을 키로 <code class="mono">@Cacheable</code>을 걸어 두 번째 조회부터 즉시 응답합니다.', "result"],
          ["해결 ③", "연결·읽기 <b>5초 타임아웃</b>을 지정했습니다.", "result"],
          ["배운 점", "<b>외부 API는 언제든 느려지거나 죽습니다.</b> 남의 서비스를 부를 때는 잘 될 때가 아니라 <b>안 될 때를 먼저 코드에 적어둬야 한다</b>는 걸 배웠습니다.", "learn"],
        ],
      },
      {
        kick: "TROUBLE 03 · 데이터 신뢰성",
        h: "새로고침만 해도 조회수가 올라갔습니다",
        steps: [
          ["현상", "상세 페이지를 열 때마다 조회수가 증가해, 작성자가 새로고침 몇 번이면 인기글이 될 수 있었습니다. 랭킹의 신뢰도가 무너집니다."],
          ["원인", "조회 = 카운트 증가로만 처리하고 <b>“누가” 봤는지 구분하지 않았습니다.</b>"],
          ["해결", '로그인 사용자는 <b>userId</b>, 비로그인은 <b>IP</b>를 식별자로 삼아 키를 만들고, <code class="mono">setIfAbsent</code>(SETNX)로 <b>6시간에 1회만</b> 인정하도록 했습니다. TTL이 지나면 자동으로 다시 셀 수 있습니다.', "result"],
          ["배운 점", "이 키 하나가 “중복 방지 테이블”을 대신합니다. <b>만료가 필요한 데이터는 DB보다 Redis의 TTL이 훨씬 싸다</b>는 걸 처음 체감했습니다.", "learn"],
        ],
      },
    ],

    retro: {
      good: [
        "수업에서 배우지 않은 무한 스크롤·LLM 연동을 <b>스스로 찾아 기한 안에</b> 붙였습니다.",
        "추측으로 고치지 않고 <b>네트워크 탭 → 응답 확인 → 범위 축소</b> 순서를 몸에 익혔습니다.",
        "발표를 맡으면서 제가 짜지 않은 OAuth·WebSocket까지 설명할 수 있게 됐습니다.",
      ],
      bad: [
        "<b>테스트 코드가 없습니다.</b> 손으로 눌러 확인했고, 그래서 병합 사고를 늦게 발견했습니다.",
        "페이지 기반 페이징이라 데이터가 많아지면 뒤 페이지가 느려집니다.",
        "예외 처리가 컨트롤러마다 흩어져 있습니다. 공통 처리로 모았어야 했습니다.",
      ],
      next: [
        "댓글 조회를 <b>커서(마지막 ID) 방식</b>으로 → 3차 Basecamp에서 실제로 다뤘습니다.",
        "목록 조회 쿼리에 <b>실행 계획을 찍어보고</b> 필요한 인덱스를 잡겠습니다.",
        "Service 계층에 <b>단위 테스트</b>부터 → 3차에서 JUnit 테스트가 있는 코드베이스를 경험했습니다.",
      ],
    },

    deck: { base: "zipmap", count: 25, label: "대동여집도 발표자료 — 제가 직접 제작하고 발표했습니다" },

    prev: null,
    next: { key: "pleegie", t: "PLEEGIE — 냉장고 재료 관리 & 전통시장 커머스" },
    contactLead: "코드 어느 줄이든 왜 그렇게 썼는지 설명드릴 수 있습니다. 편하게 연락 주세요.",
    repo: { label: "REPOSITORY", text: "github.com/jongbeen97/zipmap", href: "https://github.com/jongbeen97/zipmap", foot: "PROJECT 01 — 대동여집도" },
  },

  /* ──────────────────────────── PLEEGIE ──────────────────────────── */
  pleegie: {
    index: "PROJECT 02",
    no: "2차 팀 프로젝트 · 한국정보교육원",
    when: "2026.04 – 05 · 4명",
    title: "PLEEGIE",
    sub: "냉장고 재료 관리 + 전통시장 연계 커머스 · LLM/RAG 기반",
    cardDesc:
      "냉장고에 있는 재료로 만들 수 있는 요리를 추천하고, 부족한 재료는 <b>가까운 전통시장</b>에서 바로 살 수 있게 연결합니다. Spring Boot · Python FastAPI · React, <b>세 개의 서버를 하나의 서비스로</b> 묶었습니다.",
    cardTags: [["Spring Boot", true], ["JPA · QueryDSL", true], ["JWT", true], ["React · Vite", false], ["FastAPI", false], ["ChromaDB · RAG", false], ["Kakao Map", false], ["GitHub Actions", false]],
    cover: `${DECK_BASE}/pleegie/01.jpg`,
    myPartLabel: "MY PART · 프론트엔드 + 서버 이슈 해결",
    myPartText: "냉장고·레시피 화면 · 시장 QR 발급 · 부족 재료↔시장 매칭과 위치 기반 조회 문제 해결",

    lead: '냉장고를 열면 늘 <b>“이걸로 뭘 해 먹지”</b>와 <b>“이거 언제 산 거지”</b>가 문제입니다. PLEEGIE는 보유 재료로 만들 수 있는 요리를 추천하고, <b>부족한 재료는 가장 가까운 전통시장에서 바로 살 수 있게</b> 연결합니다. Spring Boot · FastAPI · React <b>세 서버를 하나의 서비스로</b> 묶은 것이 이 프로젝트의 핵심이었습니다.',
    facts: [
      { k: "PERIOD", v: "2026.04 – 05.11", s: "최종 발표 5/11" },
      { k: "TEAM / ROLE", v: "4명 팀", s: "프론트엔드 + 서버 이슈" },
      { k: "STACK", v: "Java 21 · Spring Boot · FastAPI", s: "React · MySQL · Redis · ChromaDB" },
      { k: "REPOSITORY", link: { href: "https://github.com/jongbeen97/pleegie", text: "jongbeen97/pleegie ↗" } },
    ],

    bgTitle: "버려지는 재료와<br>비어가는 시장을 한 줄로 이었습니다.",
    bgLead: "따로 있던 세 개의 문제가, 사실은 같은 문제의 앞뒤였습니다.",
    problems: [
      { t: "식재료가 버려진다", p: "1인 가구는 재료를 사고도 다 못 씁니다. 유통기한을 놓치기 때문입니다. <b>뭐가 며칠 남았는지</b>를 먼저 보이게 하고, 임박한 재료를 우선 추천에 올렸습니다." },
      { t: "레시피 검색이 반대다", p: "보통은 요리를 정하고 재료를 삽니다. 저희는 순서를 뒤집어 <b>가진 재료에서 출발</b>합니다. 공공 API 레시피 850여 개를 매칭하고, 없으면 LLM이 보완합니다." },
      { t: "전통시장은 검색되지 않는다", p: "시장 상인은 온라인에 상품을 올릴 곳이 없습니다. <b>부족한 재료 → 가까운 시장의 실제 재고·할인</b>으로 연결해, 상인에게는 노출을 사용자에게는 가격을 줬습니다." },
    ],

    hue: HUE.amber,

    archLead: "Java가 잘하는 일(트랜잭션·인증·정합성)과 Python이 잘하는 일(임베딩·LLM)을 나눴습니다. 초록색이 <b>제가 담당한 영역</b>입니다.",
    Diagram: PleegieDiagram,
    legend: [[HUE.amber.a, "제가 담당한 화면 계층"], ["#08121C", "Java 서버"], ["#0E1B27", "Python AI 서버"], [null, "저장소 · 외부 연동"]],
    archCap: '브라우저는 항상 <b>같은 주소</b>로만 요청하고, Vite 프록시가 <code class="mono">/api</code>는 8080으로 <code class="mono">/ai</code>는 8000으로 나눠 보냅니다. 화면 입장에서는 서버가 하나로 보이고, 서버끼리는 <code class="mono">AiClient</code>로 통신합니다.',

    scopeTitle: "화면을 맡았지만,<br>원인이 서버에 있으면 서버로 갔습니다",
    scopeLead: "공식 역할은 프론트엔드였습니다. 다만 제가 해결한 두 건은 <b>원인이 전부 서버에 있었고</b>, 그 과정에서 JPA와 위치 기반 쿼리를 직접 읽고 고쳤습니다. 백엔드로 지원하는 이유이기도 합니다.",
    scope: [
      {
        badge: "담당 01",
        h: "냉장고 · 레시피 화면",
        items: [
          "<b>React 라우팅과 공통 컴포넌트</b> — 페이지 래퍼, 네비게이션, 버튼·뱃지 등 UI 기본형",
          "<b>메인 냉장고 화면</b> — 재료 등록·수정·삭제, 수량·단위·유통기한 관리, 임박 재료 강조 (약 700줄)",
          "<b>레시피 추천 · 상세</b> — 보유 재료 매칭률, 부족 재료 목록, 시장 연결 진입 (약 620줄)",
          "<b>로그인 · 회원가입</b> — 소셜 로그인 콜백 처리, 토큰 저장",
        ],
      },
      {
        badge: "담당 02",
        h: "상인 · 시장 기능",
        items: [
          '<b>상품 등록 화면</b> — 입력 중 RAG 유사 재료 실시간 추천(디바운스 300ms), 선택 시 <code class="mono">item_master</code> 자동 연결 (약 560줄)',
          "<b>시장 QR 발급 화면</b> — 토큰을 URL로 조합해 QR 이미지 생성",
          "<b>부족 재료 ↔ 시장 매칭</b> — 서버 로직 문제 원인 분석 및 수정 참여",
          "<b>위치 기반 시장 조회</b> — 거리 정렬 쿼리 적용",
        ],
      },
      {
        badge: "팀원 담당",
        sub: true,
        h: "제가 만들지 않은 부분",
        items: [
          "Spring Boot 세팅·공통 설정, 인증/권한(OAuth·JWT), 냉장고·재료 API, 유통기한 스케줄러, 레시피 API — <b>김아라</b>",
          "프로젝트 총괄, Python 레시피 추천 알고리즘, 부족 재료 시장 연동 알고리즘 — <b>허하영</b>",
          "장바구니·가계부 API, 관리자·신고 도메인 — <b>황준호</b>",
        ],
      },
      {
        badge: "협업 방식",
        sub: true,
        h: "어떻게 맞춰 일했는지",
        items: [
          "API 명세를 <b>Notion에 먼저 확정</b>하고 화면과 서버가 각자 진행했습니다.",
          "1차의 병합 사고 이후, <b>응답 필드명을 먼저 합의</b>하는 것을 규칙으로 삼았습니다.",
          "이상이 보이면 <b>브라우저 → 프록시 → 컨트롤러 → 서비스</b> 순으로 내려가며 범위를 좁혔습니다.",
        ],
      },
    ],

    apiTitle: "제가 연동하거나 수정에 참여한 엔드포인트",
    api: [
      ["GET", "/user/fridge/items", "내 냉장고 재료 목록 — 유통기한 임박 강조"],
      ["POST", "/user/fridge/items", "재료 등록 — item_master 연결"],
      ["PUT", "/user/fridge/items/{id}", "수량·단위·유통기한 수정"],
      ["GET", "/recipe/recommend", "보유 재료 기반 레시피 추천 — 매칭률·부족 재료"],
      ["GET", "/recipe/search", "레시피 검색 (공공 API + LLM 보완)"],
      ["POST", "/market/missing-items", "부족 재료 → 가까운 시장의 판매 상품 매칭"],
      ["GET", "/market", "시장 정보 조회 (거리순)"],
      ["GET", "/market/qr", "시장 QR 토큰 조회"],
      ["PUT", "/market/qr", "QR 토큰 재발급"],
      ["POST", "/market/items", "상인 상품 등록 — item_master_id 매핑 추가"],
      ["GET", "/items/search", "재료 마스터 검색 — RAG 유사어 추천에 사용"],
      ["POST", "/user/recipebook", "레시피 저장(레시피북)"],
    ],
    apiNote: "서비스 전체는 74개 매핑입니다. 위는 제 화면이 실제로 호출하거나, 문제 해결 과정에서 수정에 참여한 것들입니다.",

    implLead: '이 서비스에서 가장 어려웠던 건 화면이 아니라 <b>“계란”과 “달걀”을 같은 것으로 보게 만드는 일</b>이었습니다.',
    impls: [
      {
        h: "재료 이름 정규화 — 매칭이 안 되는 진짜 이유",
        before:
          '레시피의 재료는 <code class="mono">"양파 1/2개"</code>처럼 <b>수량과 단위가 붙은 문장</b>으로 들어옵니다. 시장 상품은 <code class="mono">"양파"</code>로 등록돼 있습니다. 문자열 그대로 비교하면 영원히 만나지 못합니다. 매칭 전에 정규식으로 단위·용량을 떼어내고 표준명으로 바꾼 뒤 조회합니다.',
        flow: ['"양파 1/2개"', "단위·수량 제거", "표준명 변환", "item_master 조회", "시장 상품 매칭"],
        code: String.raw`
// 재료명 정제 — 수량/단위/부가설명 제거 후 표준명으로
String cleanName = ingredientName
        .replaceAll("\s*\d+(\.\d+)?\s*(g|ml|kg|L|개|큰술|작은술|컵|줄기|알|장|마리).*", "")
        .replaceAll("\s*:.*", "")
        .trim();

cleanName = normalizeIngredientName(cleanName);

// 표준 재료 테이블에서 찾고 → 해당 시장에서 파는지 확인
itemMasterRepository.findByNameContaining(cleanName).stream()
    .findFirst()
    .ifPresent(itemMaster ->
        marketItemRepository.findByMarketIdsAndItemMasterId(marketIds, itemMaster.getId())
        ...
    );`,
        caption: "recipe/service/RecipeService.java",
        after:
          "규칙으로 잡히지 않는 동의어(<b>계란 ↔ 달걀</b>)는 Python 서버의 RAG 유사도 검색이 보완합니다. <b>규칙으로 되는 건 규칙으로, 안 되는 것만 AI로</b> 넘기는 구조입니다.",
      },
      {
        h: "가까운 시장 정렬 — 계산을 DB로 내리기",
        before:
          '전체 시장을 가져와 자바에서 거리를 계산하면 <b>필요 없는 데이터까지 전부 메모리에 올라옵니다.</b> 그래서 <b>Haversine 공식을 JPQL의 <code class="mono">ORDER BY</code>에 직접 넣어</b> DB가 정렬하게 하고, 서비스는 상위 5개만 사용합니다.',
        code: String.raw`
// 승인된 시장을 사용자 좌표 기준 가까운 순으로 (지구 반지름 6371km)
@Query("""
        SELECT m FROM Market m
        WHERE m.status = 'APPROVED'
        ORDER BY (
            6371 * acos(
                cos(radians(:latitude)) * cos(radians(m.latitude)) *
                cos(radians(m.longitude) - radians(:longitude)) +
                sin(radians(:latitude)) * sin(radians(m.latitude))
            )
        ) ASC
        """)
List<Market> findNearestMarkets(@Param("latitude") Double latitude,
                                @Param("longitude") Double longitude);`,
        caption: "market/repository/MarketRepository.java",
        after:
          '<b>한계도 분명합니다.</b> <code class="mono">ORDER BY</code> 안에서 함수를 계산하므로 인덱스를 타지 못합니다. 규모가 커지면 <b>위경도 범위로 후보를 먼저 좁힌 뒤(bounding box) 정렬</b>하거나 공간 인덱스를 써야 한다고 봅니다. 지금 규모에서는 단순함을 택했습니다.',
      },
      {
        h: "상품 등록 화면 — 상인이 오타를 내도 연결되게",
        before:
          '상품명을 자유롭게 적으면 표준 재료와 연결되지 않고, 목록에서만 고르게 하면 등록이 번거롭습니다. 그래서 <b>입력 중에 유사 재료를 실시간 추천</b>하고, 고르면 <code class="mono">item_master</code>에 자동 연결되게 했습니다. 타이핑마다 요청하지 않도록 <b>300ms 디바운스</b>를 걸었습니다.',
        code: String.raw`
// 타이핑이 멈춘 뒤에만 검색 요청 — 입력 1글자마다 API를 때리지 않는다
const debounceTimer = useRef(null);

useEffect(() => {
  if (debounceTimer.current) clearTimeout(debounceTimer.current);
  debounceTimer.current = setTimeout(() => {
    searchSimilarItems(keyword);   // RAG 유사도 검색 (임계값 이상만)
  }, 300);
}, [keyword]);`,
        caption: "pages/market/ShopItemAddPage.jsx",
        after:
          '일치하는 재료가 없으면 <code class="mono">item_master</code>에 <b>신규로 등록</b>하고 연결합니다. “매칭 실패”를 막다른 길이 아니라 <b>데이터가 늘어나는 계기</b>로 만든 부분입니다.',
      },
    ],

    tsLead: "두 건 모두 <b>화면에서 발견하고 서버에서 해결</b>했습니다.",
    troubles: [
      {
        kick: "TROUBLE 01 · 데이터 연결",
        h: "상품을 등록했는데 “주변 시장” 결과가 비어 있었습니다",
        steps: [
          ["현상", "상품을 정상 등록했는데도, 사용자가 부족한 재료로 시장을 검색하면 <b>결과가 하나도 나오지 않았습니다.</b>"],
          ["확인", "API 응답은 200에 빈 배열이었습니다. 즉 <b>에러가 아니라 “찾지 못한 것”</b>이었습니다. 그래서 화면이 아니라 매칭 로직을 따라 내려갔습니다."],
          ["원인 ①", '<b>매핑 누락</b> — 상품 등록 시 <code class="mono">item_master_id</code> 없이 상품명 텍스트만 저장되고 있었습니다. 표준 재료와 이어지지 않으니 비교 기준이 없었습니다.'],
          ["원인 ②", '<b>연결 로직 부재</b> — 부족 재료와 <code class="mono">market_item</code>을 이어주는 API 자체가 없었습니다. 화면은 있는데 뒤가 비어 있던 상태였습니다.'],
          ["원인 ③", "<b>거리 계산 없음</b> — 위치와 무관하게 전체 시장을 반환했습니다. 서울 사용자에게 부산 시장이 나올 수 있는 구조였습니다."],
          ["해결", "① 상품 등록 시 표준 재료와 연결, ② 부족 재료 ↔ 시장 상품 매칭 API 신설, ③ <b>Haversine 정렬</b>로 가까운 5개 시장 안에서만 조회. 재료명은 정규식으로 정제한 뒤 매칭합니다.", "result"],
          ["배운 점", "화면이 비어 있다고 화면 문제가 아니었습니다. <b>기능이 없는 것과 고장 난 것은 다르고</b>, 데이터가 연결되지 않은 설계는 코드를 아무리 고쳐도 해결되지 않습니다. 이때부터 <b>엔티티 관계를 먼저 확인하는 습관</b>이 생겼습니다.", "learn"],
        ],
      },
      {
        kick: "TROUBLE 02 · 계층 간 착각",
        h: "QR 토큰은 있는데, QR 이미지가 없었습니다",
        steps: [
          ["현상", "QR 화면에 실제 QR이 뜨지 않았습니다. 프론트는 임시로 Canvas에 <b>QR처럼 보이는 사각형</b>을 그리고 있어, 스캔해도 아무 일이 없었습니다."],
          ["확인", '응답을 열어보니 <code class="mono">qrToken</code>은 UUID로 잘 내려오는데 <code class="mono">qrCodeUrl</code>이 계속 <code class="mono">null</code>이었습니다.'],
          ["원인", '<code class="mono">Market</code> 엔티티에 필드는 있었지만, 서비스는 <b>토큰만 발급하고 이미지를 만드는 로직이 아예 없었습니다.</b> 필드가 존재한다는 것과 값이 채워진다는 것을 팀 전체가 혼동하고 있었습니다.'],
          ["해결", '이미지 저장소를 새로 붙이는 대신 <code class="mono">qrcode.react</code>로 <b>토큰을 URL로 조합해 클라이언트에서 QR을 생성</b>했습니다. 서버는 토큰만 책임지고 표현은 화면이 책임지는 구조입니다.', "result"],
          ["배운 점", "남은 기간을 고려한 선택이었습니다. 다만 <b>QR을 이메일이나 인쇄물로 보내야 한다면 서버 생성이 맞다</b>는 것도 알고 있습니다. 화면에서만 쓰이기에 이 선택이 합리적이라고 판단했습니다.", "learn"],
        ],
      },
    ],

    retro: {
      good: [
        "화면만 보지 않고 <b>서버 코드를 읽고 원인을 짚어냈습니다.</b> 백엔드로 방향을 정한 결정적 계기였습니다.",
        "React 컴포넌트를 분리하면서 <b>프론트와 백엔드의 계약(API 명세)</b>이 왜 중요한지 체감했습니다.",
        "Java · Python · React가 각각 어떤 일에 강한지 직접 비교하며 배웠습니다.",
      ],
      bad: [
        "<b>리팩터링을 못 했습니다.</b> 매칭 로직이 이중 반복문이라 시장·재료가 늘면 호출이 급격히 늘어납니다.",
        "거리 정렬 쿼리가 인덱스를 타지 못합니다.",
        "여기서도 <b>테스트 코드가 없습니다.</b> 조건이 많은 로직일수록 꼭 필요했습니다.",
      ],
      next: [
        "재료 목록을 <b>한 번의 쿼리로 모아 조회</b>하도록 바꾸겠습니다(N+1 제거).",
        "위경도 <b>bounding box로 후보를 먼저 좁힌 뒤</b> 거리 정렬을 하겠습니다.",
        "재료명 정규화 규칙을 분리해 <b>테스트 가능한 단위</b>로 만들겠습니다.",
      ],
    },

    deck: { base: "pleegie", count: 28, label: "PLEEGIE 최종 발표자료 (2026.05.11)" },

    prev: { key: "zipmap", t: "대동여집도 — 인증 거주 후기 & 커뮤니티" },
    next: { key: "basecamp", t: "Basecamp — 캠핑장 예약 플랫폼" },
    contactLead: "서버 세 개를 어떻게 붙였는지, 왜 그렇게 나눴는지 설명드릴 수 있습니다.",
    repo: { label: "REPOSITORY", text: "github.com/jongbeen97/pleegie", href: "https://github.com/jongbeen97/pleegie", foot: "PROJECT 02 — PLEEGIE" },
  },

  /* ──────────────────────────── Basecamp ──────────────────────────── */
  basecamp: {
    index: "PROJECT 03",
    no: "3차 팀 프로젝트 · SeSAC",
    when: "2026.06 – 2026.07.27 · 4명",
    title: "Basecamp",
    sub: "캠핑장 예약 플랫폼 — React 19 + TypeScript / Spring Boot 3",
    cardDesc:
      "고캠핑 공공 API로 전국 캠핑장을 모으고 <b>예약·결제·업체 정산</b>까지 잇는 플랫폼입니다. 저는 <b>캠핑장(camp)과 날씨(weather) 도메인</b>을 맡아, 외부 API 세 곳과 맞닿은 가장 바깥쪽 계층을 담당했습니다.",
    cardTags: [["TypeScript", true], ["Spring Boot 3", true], ["JPA", true], ["Redis 캐시", true], ["공공 OpenAPI", false], ["Kakao 지오코딩", false], ["OpenWeatherMap", false], ["MinIO", false]],
    myPartLabel: "MY PART · 캠핑장 + 날씨 도메인",
    myPartText: "고캠핑 API 동기화 · 캠핑장 검색/상세/업체 관리 · 날씨 조회와 캐시 정책 설계",
    cover: `${DECK_BASE}/basecamp/01.jpg`,

    lead: '캠핑장 예약은 아직도 전화로 이뤄집니다. Basecamp는 <b>고캠핑 공공 API</b>로 전국 캠핑장을 모으고 예약·결제·리뷰·업체 정산까지 한 서비스에서 처리합니다. 저는 이 중 <b>캠핑장(camp)과 날씨(weather) 두 도메인</b>을 맡았습니다. 공공데이터·지오코딩·날씨 <b>외부 API 세 곳과 맞닿은 영역</b>이라, “남의 서버가 죽었을 때 우리 서비스는 어떻게 버틸까”를 가장 많이 고민한 파트입니다.',
    facts: [
      { k: "PERIOD", v: "2026.06 – 07.27", s: "SeSAC 과정 내 프로젝트" },
      { k: "MY DOMAIN", v: "camp · weather", s: "4인 팀 / 명세 53개 중 12개" },
      { k: "STACK", v: "Spring Boot 3 · Java 21", s: "JPA · Redis · MinIO · TypeScript" },
      { k: "REPOSITORY", link: { href: "https://github.com/team-basecamp/basecamp-back", text: "team-basecamp/basecamp-back ↗" } },
    ],

    bgTitle: "예약은 전화로,<br>정산은 수첩으로 하고 있었습니다.",
    bgLead: "캠핑 인구는 늘었는데, 캠핑장을 고르고 예약하는 과정은 그대로였습니다.",
    problems: [
      { t: "정보가 흩어져 있다", p: "캠핑장 정보는 공공데이터에, 후기는 블로그에, 예약은 전화에 있습니다. <b>고캠핑 OpenAPI</b>로 전국 캠핑장을 우리 DB로 모으고 검색·지도·후기를 한곳에 얹었습니다." },
      { t: "날씨를 따로 찾아본다", p: "캠핑은 날씨가 곧 만족도입니다. 그런데 예약할 때는 날씨 앱을 따로 켜야 했습니다. <b>예약 날짜의 예보를 캠핑장 상세에서 바로</b> 보여주도록 붙였습니다." },
      { t: "업체는 관리 도구가 없다", p: "상인 입장에서는 캠핑장을 온라인에 올릴 곳이 없습니다. <b>업체가 직접 캠핑장을 등록·수정</b>하고 예약과 매출을 보는 전용 화면을 만들었습니다." },
    ],

    hue: HUE.sky,

    archLead: "앞선 두 프로젝트와 달리 <b>화면도 서버도 타입이 있는</b> 구조입니다. 초록색이 제가 담당한 <b>camp · weather 도메인</b>이 놓인 계층입니다.",
    Diagram: BasecampDiagram,
    legend: [[HUE.sky.a, "React 19 + TypeScript"], ["#08121C", "Spring Boot 3 서버"], [null, "저장소 · 외부 연동"]],
    archCap: '제 도메인은 <b>외부 API 세 곳</b>(고캠핑 공공데이터 · 카카오 지오코딩 · OpenWeatherMap)에 의존합니다. 셋 다 우리가 통제할 수 없는 서버라, 각 클라이언트를 <b>실패해도 예외를 던지지 않는(fail-soft)</b> 방식으로 두고 날씨는 Redis에 TTL 캐시를 붙였습니다.',

    scopeTitle: "캠핑장과 날씨,<br>두 도메인을 맡았습니다",
    scopeLead: "서비스에서 <b>가장 바깥쪽</b> — 외부 API와 직접 맞닿은 영역입니다. 기능을 만드는 것보다 <b>남의 서버가 느려지거나 죽었을 때 우리 서비스가 어떻게 버틸지</b>를 정하는 데 시간을 더 썼습니다.",
    scope: [
      {
        badge: "담당 01",
        h: "캠핑장 조회 · 검색",
        items: [
          "<b>고캠핑 공공 API 동기화</b> — 신규 <code class=\"mono\">contentId</code>만 저장, 대표 이미지 없는 항목은 제외",
          "<b>앱 기동 시 자동 초기 적재</b> — 비동기 실행, 데이터가 이미 있으면 건너뛰고 실패해도 앱은 정상 구동",
          "<b>검색</b> — 키워드·지역·유형·최대금액 필터 + 정렬 4종(추천·평점·가격·최신) + 페이징",
          "<b>상세 조회 2종</b> — PK(campId) / 고캠핑 contentId. 자체 등록 캠핑장은 contentId가 없어 경로를 나눴습니다",
          "<b>HOT 캠핑장</b> — 평점순 · 예약건수순",
        ],
      },
      {
        badge: "담당 02",
        h: "캠핑업체 캠핑장 관리",
        items: [
          "<b>등록</b> — multipart(정보 JSON + 이미지). 카카오 지오코딩으로 주소 → 좌표 자동 변환, 이미지는 MinIO 업로드",
          "<b>수정</b> — 남길 기존 이미지와 새 이미지를 조합하는 부분 교체 방식",
          "<b>삭제</b> — 소프트 삭제 + 저장소 파일 정리",
          "<b>권한</b> — <code class=\"mono\">CAMP_OWNER</code> 역할 검증 + 캠핑장 소유자 본인 확인 이중 체크",
        ],
      },
      {
        badge: "담당 03",
        h: "날씨 도메인",
        items: [
          "<b>시/도별 현재 날씨</b> — 홈 위젯용. 한 지역이 실패해도 나머지는 그대로 내려갑니다",
          "<b>캠핑장 예약 기간 예보</b> — 5일/3시간 예보를 받아 <b>날짜별 1건</b>으로 요약",
          "<b>Redis 캐시</b> — 지역 30분 / 캠핑장 10분으로 TTL 차등",
          "<b>조회 상태 3분류</b> — OK · NO_DATA(예보 범위 밖, 정상) · FETCH_FAILED(외부 실패)",
        ],
      },
      {
        badge: "팀 구성",
        sub: true,
        h: "4명이 어떻게 나눴는지",
        items: [
          "API 명세 <b>53개</b>를 요청·응답·에러 케이스까지 문서로 먼저 확정하고 담당을 나눴습니다.",
          "김진아 16개 · <b>이종빈 12개(캠핑장 · 날씨)</b> · 박범훈 16개 · 이경석 9개",
          "예약 · 결제 · 리뷰 · 커뮤니티 · 관리자 도메인은 <b>팀원 담당</b>입니다.",
        ],
        memo: "앞선 두 프로젝트와 같은 기준입니다 — 제 몫이 아닌 것은 적지 않았습니다.",
      },
    ],

    apiTitle: "제가 만든 엔드포인트",
    api: [
      ["GET", "/api/v1/camps", "전체 캠핑장 목록"],
      ["GET", "/api/v1/camps/search", "검색 — 키워드·지역·유형·가격 + 정렬 + 페이징"],
      ["GET", "/api/v1/camps/search/name", "캠핑장 이름 검색"],
      ["GET", "/api/v1/camps/search/address", "지역(주소) 검색"],
      ["GET", "/api/v1/camps/hot", "HOT 캠핑장 — 평점순 / 예약건수순"],
      ["GET", "/api/v1/camps/{campId}", "상세 조회 (PK) — 자체 등록 캠핑장 포함"],
      ["GET", "/api/v1/camps/content/{contentId}", "상세 조회 (고캠핑 contentId)"],
      ["GET", "/api/v1/camps/{campId}/weather", "예약 기간 날씨 예보"],
      ["GET", "/api/v1/camps/my", "내 캠핑장 목록 (CAMP_OWNER)"],
      ["POST", "/api/v1/camps/register", "캠핑장 등록 — multipart, 지오코딩 + 이미지 업로드"],
      ["POST", "/api/v1/camps/{campId}/update", "캠핑장 수정 — 이미지 부분 교체"],
      ["POST", "/api/v1/camps/{campId}/delete", "캠핑장 소프트 삭제"],
      ["POST", "/api/v1/camps/sync", "고캠핑 데이터 동기화 (ADMIN)"],
      ["POST", "/api/v1/camps/fetch", "고캠핑 전체 직접 호출 동기화 (ADMIN)"],
      ["GET", "/api/v1/weather/regions", "시/도별 현재 날씨 (비로그인 허용)"],
    ],
    apiNote:
      '명세 단계에서 12개를 배분받았고, 구현하면서 조회 경로가 나뉘어 15개가 됐습니다. 이 프로젝트는 팀 규칙상 <b>GET·POST만 사용</b>하기로 해서, 삭제도 <code class="mono">POST /{campId}/delete</code>로 표현합니다.',

    implLead: "세 가지 모두 <b>외부 API를 어떻게 믿을 것인가</b>에 대한 답입니다.",
    impls: [
      {
        h: "공공데이터를 우리 DB로 — 무엇을 저장하지 않을지부터",
        before:
          "고캠핑 API는 페이지로 나눠 오고, <b>가격 정보가 없고</b>, 일부 필드는 우리 컬럼 길이를 넘습니다. 그래서 받은 걸 전부 넣지 않고 규칙을 먼저 정했습니다. <b>이미 있는 캠핑장은 건너뛰고, 대표 이미지가 없는 항목은 저장하지 않습니다.</b> 목록에서 빈 카드가 되기 때문입니다.",
        flow: ["고캠핑 API 호출", "기존 contentId 제외", "대표 이미지 없는 항목 제외", "가격 부여 후 저장"],
        code: String.raw`
// 반환값은 "실제로 새로 저장한 건수". 받은 개수(apiCamps.size())와 다르다 —
// 이미 있는 contentId 와 대표 이미지가 없는 항목은 걸러지기 때문.
@Transactional
public int saveCampsFromApi(List<GocampingApiResponseDto> apiCamps) {
    if (apiCamps == null || apiCamps.isEmpty()) return 0;

    // DB 에 이미 저장된 contentId 를 한 번에 가져와 Set 으로 (건마다 조회하지 않는다)
    Set<Long> existingContentIds = campRepository.findAllContentIds()
            .stream().collect(Collectors.toSet());

    List<Camp> newCamps = apiCamps.stream()
            .filter(dto -> !existingContentIds.contains(dto.getContentId()))
            .filter(dto -> StringUtils.hasText(dto.getFirstImageUrl()))
            .map(dto -> Camp.fromGocampingApi(dto, generateRandomPrice()))
            .collect(Collectors.toList());

    if (!newCamps.isEmpty()) campRepository.saveAll(newCamps);
    return newCamps.size();
}`,
        caption: "camp/service/CampService.java",
        after:
          "가격이 없는 문제는 설정값 범위 안에서 정책적으로 부여해 해결했습니다. 다만 <b>설정이 잘못되면 나중에 조용히 터진다</b>는 게 마음에 걸려, 앱이 뜨는 시점에 미리 검증하도록 했습니다. 앱 기동 시 초기 적재도 같은 관점입니다 — <b>동기화가 실패해도 서비스는 떠야 합니다.</b>",
        code2: String.raw`
// 설정이 잘못되면 generateRandomPrice() 가 나중에 조용히 실패하므로, 앱 시작 시점에 미리 검증한다.
@PostConstruct
private void validatePricePolicy() {
    if (defaultPriceMin < 0 || defaultPriceMax < defaultPriceMin || defaultPriceUnit <= 0) {
        throw new IllegalStateException("camp.default-price 설정이 올바르지 않습니다.");
    }
}

// 앱이 완전히 준비된 뒤 별도 스레드에서 초기 적재 (메인 스레드를 막지 않는다)
@EventListener(ApplicationReadyEvent.class)
@Async
public void initGocampingData() {
    try {
        if (campRepository.count() > 0) return;          // 이미 있으면 건너뛴다
        campService.fetchAndSaveCampsFromGocampingApi();
    } catch (Exception e) {
        // 동기화가 실패해도 앱 구동은 막지 않는다
        logger.error("고캠핑 데이터 동기화 실패 (앱은 정상 구동됩니다): {}", e.getMessage(), e);
    }
}`,
        caption2: "camp/config/CampDataInitializer.java",
      },
      {
        h: "등록에 외부 호출이 둘 — 트랜잭션은 어디까지 열까",
        before:
          "캠핑장 등록에는 <b>카카오 지오코딩(HTTP)</b>과 <b>이미지 업로드(MinIO)</b>가 들어갑니다. 이 둘을 <code class=\"mono\">@Transactional</code> 안에 두면, 외부 응답을 기다리는 내내 <b>DB 커넥션을 붙잡고 있게 됩니다.</b> 사용자가 몰리면 커넥션 풀이 먼저 마릅니다. 그래서 외부 호출을 트랜잭션 밖에서 끝내고, DB 반영만 짧은 쓰기 트랜잭션에 맡겼습니다.",
        flow: ["권한 검증", "지오코딩 (트랜잭션 밖)", "이미지 업로드 (트랜잭션 밖)", "DB 저장 (짧은 트랜잭션)"],
        code: String.raw`
// 지오코딩(외부 HTTP)과 이미지 업로드(저장소 IO)를 트랜잭션 밖에서 먼저 끝내고,
// DB 반영만 CampTransactionService 의 짧은 쓰기 트랜잭션에 맡긴다.
// 이 메서드 자체에 @Transactional 을 걸지 않는 이유 — 외부 호출 지연이 DB 커넥션을 점유하지 않도록.
public Camp registerCamp(CampRegistrationRequest request, Long ownerId,
                         List<MultipartFile> images) {

    if (ownerId == null || ownerId <= 0) {
        throw new BusinessException(ErrorCode.ACCESS_DENIED, "캠핑장 등록 권한이 없습니다.");
    }

    // 주소로 좌표를 조회한다. 못 찾아도 등록은 그대로 진행한다(좌표만 null).
    GeoPoint geoPoint = kakaoGeocodingClient.geocode(request.getAddr1());
    ...
}`,
        caption: "camp/service/CampService.java",
        after:
          "지오코딩이 실패하면 <b>좌표를 비워둡니다.</b> 주소를 수정할 때도 마찬가지입니다. 옛 좌표를 그대로 두면 <b>“새 주소 + 옛 위치”</b>라는 더 위험한 상태가 되고, 지도에는 엉뚱한 곳이 찍히기 때문입니다. 값이 없는 것보다 <b>틀린 값이 남아 있는 게 더 나쁘다</b>고 판단했습니다.",
      },
      {
        h: "날씨 캐시 — 실패는 저장하지 않는다",
        before:
          "날씨는 우리 서비스의 진실 데이터가 아니라 <b>외부에서 잠시 빌려온 값</b>이고 몇 분이면 낡습니다. 그래서 DB가 아니라 TTL이 붙는 Redis에 두고, <b>지역 위젯 30분 / 캠핑장 예보 10분</b>으로 다르게 잡았습니다. 캠핑장 예보는 조회량이 훨씬 많아 신선도가 더 중요합니다.",
        flow: ["캐시 조회", "미스 → 외부 API 호출", "성공한 결과만 캐시", "TTL 만료 시 자동 정리"],
        code: String.raw`
// 1) 캐시 먼저. 있으면 외부 호출 없이 끝난다.
RegionWeatherResponseDto cached = weatherCache.get(region);
if (cached != null) return cached;

// 2) 캐시 미스 → 외부 API 호출 (실패 시 response 는 null)
CurrentWeatherResponse response =
        weatherClient.getCurrentWeather(region.getMapX(), region.getMapY());
RegionWeatherResponseDto dto = RegionWeatherResponseDto.of(region, response);

// 3) 성공한 결과만 캐시한다. 실패 응답까지 캐시하면 장애가 TTL 동안 고정되어,
//    외부 API 가 복구돼도 캐시가 만료될 때까지 "정보 없음"이 계속 나간다.
if (dto.getTemp() != null) {
    weatherCache.put(region, dto);
}
return dto;`,
        caption: "weather/service/WeatherService.java",
        after:
          "예보는 <b>3시간 간격 40개</b>로 옵니다. 이걸 날짜별 하루 1건으로 줄여야 하는데, 기온은 평균 낼 수 있어도 <b>“맑음/비” 같은 상태와 아이콘은 평균이 불가능합니다.</b> 그래서 하루의 <b>대표 시각(정오에 가장 가까운 항목)</b> 하나를 통째로 골라 씁니다. 캠핑은 낮 시간대가 중심이라 새벽보다 정오가 그날을 더 잘 대표한다고 봤습니다.",
      },
    ],

    tsLead: "세 건 모두 <b>외부 API를 어디까지 믿을 것인가</b>에서 나온 문제입니다.",
    troubles: [
      {
        kick: "TROUBLE 01 · 외부 의존성",
        h: "날씨 API가 느려지면 캠핑장 상세도 함께 느려졌습니다",
        steps: [
          ["상황", "캠핑장 상세 화면에 예약 날짜의 날씨를 붙였습니다. 그런데 날씨 조회가 상세 응답 경로 안에 있어서, <b>OpenWeatherMap이 느려지면 상세 페이지 전체가 함께 느려졌습니다.</b>"],
          ["판단", "날씨는 <b>부가 정보</b>입니다. 날씨를 못 가져왔다고 캠핑장을 못 볼 이유가 없습니다. 그렇다면 실패를 <b>예외로 위로 던지면 안 됩니다.</b>"],
          ["해결", "날씨 클라이언트가 실패 시 예외 대신 <b>null을 반환</b>하도록 바꿨습니다(fail-soft). 좌표가 없는 캠핑장은 아예 호출하지 않고 조기 반환합니다.", "result"],
          ["해결", "다만 화면에 “정보 없음”만 뜨면 <b>예보가 없는 건지 조회가 실패한 건지</b> 구분이 안 됩니다. 그래서 상태를 <b>OK / NO_DATA(예보 범위 밖, 정상) / FETCH_FAILED(외부 실패)</b> 셋으로 나눠 내려주고 프론트가 다르게 표시하게 했습니다.", "result"],
          ["추가", "로그에 <code class=\"mono\">e.getMessage()</code>를 남기지 않았습니다. 예외 메시지에 요청 URL이 들어가고, <b>그 URL에는 API 키가 붙어 있기 때문</b>입니다. 예외 종류와 좌표만 남깁니다."],
          ["배운 점", "<b>같은 캐시라도 정책이 달라야 합니다.</b> 날씨 캐시는 실패해도 조용히 넘어가지만, 팀원이 만든 토큰 블랙리스트 캐시는 반대로 실패를 위로 전파합니다 — 폐기됐어야 할 토큰이 되살아나면 안 되니까요. <b>담는 데이터의 성격이 정책을 정한다</b>는 걸 두 코드를 나란히 놓고 이해했습니다.", "learn"],
        ],
      },
      {
        kick: "TROUBLE 02 · 캐시",
        h: "외부 API가 복구됐는데도 “정보 없음”이 계속 나왔습니다",
        steps: [
          ["현상", "날씨 조회가 잠깐 실패한 뒤, 외부 API가 정상으로 돌아왔는데도 화면에는 <b>한동안 계속 “정보 없음”</b>이 나왔습니다."],
          ["원인", "캐시에 <b>실패한 응답까지 저장</b>하고 있었습니다. 한 번 실패가 캐시에 들어가면 TTL이 만료될 때까지 그 상태가 <b>고정</b>됩니다. 캐시가 장애를 줄여주는 게 아니라 <b>장애를 연장</b>하고 있었습니다."],
          ["해결", "저장 직전에 조건을 하나 넣었습니다 — <b>기온 값이 들어온 경우에만 캐시합니다.</b> 실패하면 저장하지 않으므로, 다음 요청이 외부 API를 다시 부르고 복구되는 즉시 정상값이 나갑니다.", "result"],
          ["배운 점", "캐시는 <b>무엇을 담을지보다 무엇을 담지 않을지가 중요</b>합니다. “빠르게 하려고 넣은 것이 오히려 문제를 오래 끌 수 있다”는 걸 처음 체감했습니다.", "learn"],
        ],
      },
      {
        kick: "TROUBLE 03 · 조용한 실패",
        h: "에러도 없이 엉뚱한 지역 날씨가 나왔습니다",
        steps: [
          ["현상", "특정 캠핑장의 날씨가 계절과 전혀 맞지 않게 나왔습니다. <b>예외도 없고 응답도 200</b>이라 한참 못 찾았습니다."],
          ["원인", "우리 DB는 좌표를 <code class=\"mono\">mapX = 경도</code>, <code class=\"mono\">mapY = 위도</code>로 두는데, OpenWeatherMap 파라미터는 <code class=\"mono\">lat = 위도</code>, <code class=\"mono\">lon = 경도</code>입니다. <b>순서를 바꿔 넣어도 API는 정상 응답을 줍니다</b> — 지구 반대편 좌표도 유효한 좌표니까요."],
          ["해결", "호출부에 좌표 대응을 <b>경고 주석으로 명시</b>하고, 파라미터 문서에 단위를 못 박았습니다. 한국 기준 위도 33~38 · 경도 126~130이라는 범위도 함께 적었습니다.", "result"],
          ["배운 점", "1차 프로젝트의 무한 스크롤과 <b>같은 유형</b>이었습니다. 에러가 없다고 정상이 아니라 <b>조용한 실패</b>일 수 있습니다. 값이 “있는지”가 아니라 <b>“말이 되는지”</b>를 확인해야 한다는 걸 다시 배웠습니다.", "learn"],
        ],
      },
    ],

    retro: {
      good: [
        "<b>외부 API 세 곳과 맞닿은 영역</b>을 맡아, 통제할 수 없는 의존성을 어떻게 다룰지 코드로 정하는 법을 배웠습니다.",
        "트랜잭션 범위를 <b>DB 작업만</b>으로 좁히는 이유를 처음 이해했습니다. 외부 호출이 커넥션을 점유하면 안 된다는 감각이 생겼습니다.",
        "TypeScript로 프론트와 규격을 맞추면서, 1차에서 겪은 필드명 사고가 <b>왜 컴파일 단계에서 잡히는지</b> 알게 됐습니다.",
      ],
      bad: [
        "검색이 <b>Specification 기반</b>이라 조건이 늘수록 읽기 어려워집니다. QueryDSL로 옮기고 싶습니다.",
        "동기화가 <b>단일 트랜잭션</b>이라 데이터가 커지면 오래 붙잡습니다. 묶음 단위로 나눠야 합니다.",
        "팀에 테스트 코드가 있는데도 <b>제 도메인에는 아직 붙이지 못했습니다.</b> 세 번째 프로젝트에서도 같은 아쉬움이 남습니다.",
      ],
      next: [
        "검색 필터·정렬 로직부터 <b>단위 테스트</b>를 붙이겠습니다. 조건 조합이 많아 테스트 효과가 가장 큰 지점입니다.",
        "검색 쿼리에 <b>실행 계획을 찍어보고</b> 지역·가격 인덱스가 필요한지 직접 판단해보겠습니다.",
        "SeSAC에서 배우는 <b>컨테이너 배포와 CI/CD</b>를 이 프로젝트에 적용해보겠습니다.",
      ],
    },

    deck: { base: "basecamp", count: 24, label: "Basecamp 최종 발표자료 (2026.07.27)" },

    prev: { key: "pleegie", t: "PLEEGIE — 냉장고 재료 관리 & 전통시장 커머스" },
    next: null,
    contactLead: "가장 최근에 마친 프로젝트입니다. 캠핑장·날씨 도메인은 어느 줄이든 왜 그렇게 썼는지 설명드릴 수 있습니다.",
    repo: { label: "REPOSITORY", text: "github.com/team-basecamp/basecamp-back", href: "https://github.com/team-basecamp/basecamp-back", foot: "PROJECT 03 — Basecamp" },
  },
};

/* ══════════════════════════════════════════════════════════════════════
   7. ProjectPage
   ══════════════════════════════════════════════════════════════════════ */
const ProjectPage: React.FC<{ p: Project; go: (page: Page) => void }> = ({ p, go }) => {
  const Diagram = p.Diagram;

  // 이 프로젝트의 고유 색을 하위 전체에 CSS 변수로 흘려보낸다.
  return (
    <div style={hueVars(p.hue)}>
      <header className="p-hero">
        <div className="glow" />
        <div className="grid-lines" />
        <div className="grain" />
        <div className="wrap">
          <span className="p-no">
            {p.index} · {p.no}
          </span>
          <h1 className="p-title">{p.title}</h1>
          <p className="p-sub">{p.sub}</p>
          <p className="p-lead" dangerouslySetInnerHTML={{ __html: p.lead }} />

          <div className="p-facts">
            {p.facts.map((f) => (
              <div key={f.k}>
                <div className="k">{f.k}</div>
                <div className="v">
                  {f.link ? (
                    <a href={f.link.href} target="_blank" rel="noopener noreferrer">
                      {f.link.text}
                    </a>
                  ) : (
                    <>
                      {f.v}
                      <br />
                      <small>{f.s}</small>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* 01 배경 */}
      <section id="bg">
        <div className="wrap">
          {p.status && (
            <Rv className="notice">
              <span className="ico">i</span>
              <div>
                <b>{p.status}인 프로젝트입니다</b>
                <p>
                  SeSAC 과정(~2026.11.20) 안에서 <b>지금도 만들고 있는 서비스</b>입니다. 아래 내용은 현재
                  저장소에 올라가 있는 제 담당 코드 기준이며, 기능이 추가되면 함께 갱신합니다.
                </p>
              </div>
            </Rv>
          )}
          <Rv className="sec-head">
            <p className="eyebrow">01 — Background</p>
            <h2 className="sec" dangerouslySetInnerHTML={{ __html: p.bgTitle }} />
            <p className="sec-lead">{p.bgLead}</p>
          </Rv>
          <Rv className="problem">
            {p.problems.map((x) => (
              <div key={x.t}>
                <div className="t">{x.t}</div>
                <p dangerouslySetInnerHTML={{ __html: x.p }} />
              </div>
            ))}
          </Rv>
        </div>
      </section>

      {/* 02 시스템 구성 */}
      <section id="arch" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <Rv className="sec-head">
            <p className="eyebrow">02 — Architecture</p>
            <h2 className="sec">시스템 구성</h2>
            <p className="sec-lead" dangerouslySetInnerHTML={{ __html: p.archLead }} />
          </Rv>
          <Rv className="arch">
            <Diagram h={p.hue} />
            <div className="arch-legend">
              {p.legend.map(([c, t]) => (
                <span key={t}>
                  <i style={c ? { background: c } : { border: "1.5px solid rgba(11,20,32,.3)" }} />
                  {t}
                </span>
              ))}
            </div>
          </Rv>
          <Rv as="p" className="arch-cap" dangerouslySetInnerHTML={{ __html: p.archCap }} />
        </div>
      </section>

      {/* 03 담당 범위 */}
      <section id="scope">
        <div className="wrap">
          <Rv className="sec-head">
            <p className="eyebrow">03 — My Part</p>
            <h2 className="sec" dangerouslySetInnerHTML={{ __html: p.scopeTitle }} />
            <p className="sec-lead" dangerouslySetInnerHTML={{ __html: p.scopeLead }} />
          </Rv>
          <Rv className="scope">
            {p.scope.map((s) => (
              <article key={s.h}>
                <span className={s.sub ? "badge sub" : "badge"}>{s.badge}</span>
                <h3>{s.h}</h3>
                <ul>
                  {s.items.map((it, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
                  ))}
                </ul>
                {s.memo && <p className="memo">{s.memo}</p>}
              </article>
            ))}
          </Rv>

          <Rv>
            <h3 style={{ fontSize: 21, fontWeight: 700, margin: "48px 0 0", letterSpacing: "-.03em" }}>
              {p.apiTitle}
            </h3>
            <div className="api-wrap">
              <table className="api">
                <thead>
                  <tr>
                    <th style={{ width: "46%" }}>METHOD / PATH</th>
                    <th>설명</th>
                  </tr>
                </thead>
                <tbody>
                  {p.api.map(([m, path, desc]) => (
                    <tr key={m + path}>
                      <td className="m">
                        <i className={m}>{m}</i>
                        {path}
                      </td>
                      <td>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="api-note" dangerouslySetInnerHTML={{ __html: p.apiNote }} />
          </Rv>
        </div>
      </section>

      {/* 04 핵심 구현 */}
      <section id="impl" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <Rv className="sec-head">
            <p className="eyebrow">04 — Implementation</p>
            <h2 className="sec">핵심 구현 세 가지</h2>
            <p className="sec-lead" dangerouslySetInnerHTML={{ __html: p.implLead }} />
          </Rv>

          {p.impls.map((im, i) => (
            <Rv className="impl" key={im.h}>
              <div className="h-no">IMPL 0{i + 1}</div>
              <h3>{im.h}</h3>
              <p dangerouslySetInnerHTML={{ __html: im.before }} />
              {im.flow && (
                <div className="flow">
                  {im.flow.map((f, j) => (
                    <React.Fragment key={f}>
                      <span>{f}</span>
                      {im.flow && j < im.flow.length - 1 && <em>→</em>}
                    </React.Fragment>
                  ))}
                </div>
              )}
              <Code caption={im.caption}>{im.code}</Code>
              {im.after && <p dangerouslySetInnerHTML={{ __html: im.after }} />}
              {im.code2 && <Code caption={im.caption2}>{im.code2}</Code>}
            </Rv>
          ))}
        </div>
      </section>

      {/* 05 트러블슈팅 */}
      <section id="ts">
        <div className="wrap">
          <Rv className="sec-head">
            <p className="eyebrow">05 — Troubleshooting</p>
            <h2 className="sec">막혔던 지점과 빠져나온 방법</h2>
            <p className="sec-lead" dangerouslySetInnerHTML={{ __html: p.tsLead }} />
          </Rv>

          {p.troubles.map((t) => (
            <Rv className="ts" key={t.h}>
              <div className="ts-head">
                <span className="ts-kick">{t.kick}</span>
                <h3>{t.h}</h3>
              </div>
              <div className="ts-body">
                {t.steps.map(([dt, dd, kind], i) => (
                  <dl className={kind ? `step ${kind}` : "step"} key={i}>
                    <dt>{dt}</dt>
                    <dd dangerouslySetInnerHTML={{ __html: dd }} />
                  </dl>
                ))}
              </div>
            </Rv>
          ))}
        </div>
      </section>

      {/* 06 회고 */}
      <section id="retro" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <Rv className="sec-head">
            <p className="eyebrow">06 — Retrospective</p>
            <h2 className="sec">이 프로젝트에서 남은 것</h2>
          </Rv>
          <Rv className="retro">
            {([["잘한 것", "good", p.retro.good], ["아쉬운 것", "warn", p.retro.bad], ["다시 만든다면", "next", p.retro.next]] as [string, string, string[]][]).map(
              ([title, cls, list]) => (
                <div key={title} className={cls}>
                  <h3>{title}</h3>
                  <ul>
                    {list.map((x, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: x }} />
                    ))}
                  </ul>
                </div>
              )
            )}
          </Rv>

          {p.deck && (
            <Rv style={{ marginTop: 64 }}>
              <p className="eyebrow">07 — Deck</p>
              <h2 className="sec" style={{ fontSize: 26, marginBottom: 10 }}>
                발표자료
              </h2>
              <p className="sec-lead" style={{ marginBottom: 28 }}>
                {p.deck.label} · 총 {p.deck.count}장. 썸네일을 누르면 크게 볼 수 있습니다.
              </p>
              <DeckGallery deck={p.deck} />
              <p className="deck-note">
                기획 배경부터 아키텍처, 트러블슈팅, 시연까지 팀이 실제로 발표한 자료 원본입니다.
              </p>
            </Rv>
          )}

          <div className="pager" style={{ marginTop: 56, paddingBottom: 0 }}>
            {p.prev ? (
              <button onClick={() => go(p.prev!.key)}>
                <div className="l">← 이전 프로젝트</div>
                <div className="t">{p.prev.t}</div>
              </button>
            ) : (
              <button onClick={() => go("work")}>
                <div className="l">← 목록</div>
                <div className="t">프로젝트 전체 보기</div>
              </button>
            )}
            {p.next ? (
              <button className="right" onClick={() => go(p.next!.key)}>
                <div className="l">다음 프로젝트 →</div>
                <div className="t">{p.next.t}</div>
              </button>
            ) : (
              <button className="right" onClick={() => go("stack")}>
                <div className="l">다음 →</div>
                <div className="t">기술</div>
              </button>
            )}
          </div>
        </div>
      </section>

      <Contact title="이 프로젝트에 대해<br>더 물어보고 싶으시다면" lead={p.contactLead} third={p.repo} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   8. App
   ══════════════════════════════════════════════════════════════════════ */

const isProjectKey = (v: string): v is ProjectKey =>
  Object.prototype.hasOwnProperty.call(PROJECTS, v);

const SUB_PAGES: SubPage[] = ["about", "work", "stack", "history", "contact"];
const isSubPage = (v: string): v is SubPage => (SUB_PAGES as string[]).includes(v);

const readHash = (): Page => {
  try {
    const k = window.location.hash.replace(/^#\/?/, "");
    if (isProjectKey(k)) return k;
    if (isSubPage(k)) return k;
    return "home";
  } catch {
    return "home";
  }
};

export default function App(): React.ReactElement {
  const [page, setPage] = useState<Page>(readHash);
  const first = useRef(true);

  useReveal(page);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    try {
      const want = page === "home" ? "#/" : `#/${page}`;
      if (window.location.hash !== want) window.location.hash = want;
    } catch {
      /* 샌드박스에서 주소 변경이 막혀 있어도 화면 전환은 그대로 동작합니다 */
    }
  }, [page]);

  useEffect(() => {
    const onHash = (): void => setPage(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="jb">
      <style>{STYLES}</style>
      <Progress />
      <Nav page={page} go={setPage} />
      {page === "home" && <HomePage go={setPage} />}
      {page === "about" && <AboutPage go={setPage} />}
      {page === "work" && <WorkPage go={setPage} />}
      {page === "stack" && <StackPage go={setPage} />}
      {page === "history" && <HistoryPage go={setPage} />}
      {page === "contact" && <ContactPage go={setPage} />}
      {isProjectKey(page) && <ProjectPage p={PROJECTS[page]} go={setPage} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   프로필 사진 (base64). 다른 사진으로 바꾸려면 이 값만 교체하세요.
   ══════════════════════════════════════════════════════════════════════ */
/** 메인 히어로에 쓰는 캐릭터 일러스트 (배경 제거 · WebP) */
const CHARACTER = "data:image/webp;base64,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";

const PHOTO = "data:image/jpeg;base64,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";
