import React, { useState, useMemo } from "react";
import {
  Sunrise, BookOpen, Feather, HeartHandshake, Music, Church, Footprints,
  Sprout, Star, NotebookPen, MessageCircle, Award, User, Play, Check, Heart,
  Send, ChevronRight, ChevronLeft, Mail, Phone, Calendar, ShieldCheck,
  Sparkles, Flame, TreePine, X, PenLine, Clock, RotateCcw, Sun, CloudRain,
  Users, Plus, Copy, UserPlus, DoorOpen, Bell, Share2, Coffee, ExternalLink, Search, Lock, HandHeart
} from "lucide-react";

/* ─────────────────────────────────────────────
   디자인 토큰 — "새벽 예배 (Dawn Worship)"
────────────────────────────────────────────── */
const T = {
  ink: "#202A44", inkSoft: "#41507A",
  gold: "#D9A441", goldSoft: "#F2E4C0", goldGlow: "#FBECC6", goldDeep: "#B4832C",
  paper: "#FAF7F0", card: "#FFFFFF",
  sage: "#5F8468", sageSoft: "#E4EDE4",
  line: "#EBE5D6", muted: "#948E7E", rose: "#C97C6E", violet: "#7C6BB0",
  teal: "#4F8A93", olive: "#7A8B3D",
};
const serif = "'Gowun Batang', serif";
const sans = "'Noto Sans KR', sans-serif";

/* 오늘의 신앙 훈련 — 여덟 가지 (pts: 완료 시 점수) */
const DIMS = [
  { key: "word", label: "말씀", icon: BookOpen, c: T.inkSoft, sub: "성경 본문 찾아 읽기", prompt: "오늘 읽은 본문과 마음에 남은 구절", pts: 10 },
  { key: "qt", label: "QT", icon: Coffee, c: T.violet, sub: "큐티 영상·묵상으로 하루 열기", prompt: "오늘 큐티에서 받은 은혜", pts: 10 },
  { key: "prayer", label: "기도", icon: HeartHandshake, c: T.rose, sub: "주님과 나누는 대화", prompt: "오늘의 기도제목·기도한 내용", pts: 10 },
  { key: "praise", label: "찬양", icon: Music, c: T.teal, sub: "노래로 드리는 예배", prompt: "오늘 부르거나 들은 찬양과 마음", pts: 10 },
  { key: "worship", label: "예배", icon: Church, c: T.goldDeep, sub: "주님 앞에 나아가기", prompt: "예배·설교에서 받은 은혜", pts: 10 },
  { key: "practice", label: "실천", icon: Footprints, c: T.sage, sub: "삶으로 살아내기", prompt: "오늘 실천한 사랑 한 가지", pts: 20 },
  { key: "mission", label: "구제·선교", icon: HandHeart, c: "#4E7CA1", sub: "이웃과 열방을 품기", prompt: "오늘 나눈 사랑·품은 기도", pts: 20 },
  { key: "growth", label: "신앙계발", icon: Sprout, c: T.olive, sub: "배우며 자라기", prompt: "오늘 배우고 자란 것", pts: 10 },
];
const DIM = Object.fromEntries(DIMS.map((d) => [d.key, d]));

/* 믿음의 성장 여정 — 밭에서 열매까지 (pt: 누적 포인트 기준, day: 꾸준함 목표) */
const STAGES = [
  { stage: "밭 고르기", emoji: "⛏️", steps: [
    { label: "돌 고르기", pt: 20, day: "3일" },
    { label: "비료 주기", pt: 40, day: "3일" },
  ] },
  { stage: "씨앗", emoji: "🌰", steps: [
    { label: "물 주기", pt: 60, day: "5일" },
    { label: "양분 주기", pt: 90, day: "5일" },
  ] },
  { stage: "새싹", emoji: "🌱", steps: [
    { label: "물 주기", pt: 120, day: "10일" },
    { label: "양분 주기", pt: 150, day: "10일" },
  ] },
  { stage: "잎사귀", emoji: "🍃", steps: [
    { label: "물 주기", pt: 190, day: "20일" },
    { label: "양분 주기", pt: 230, day: "20일" },
  ] },
  { stage: "나무", emoji: "🌳", steps: [
    { label: "물 주기", pt: 290, day: "30일" },
    { label: "양분 주기", pt: 350, day: "30일" },
  ] },
  { stage: "열매", emoji: "🍎", steps: [
    { label: "수확하기", pt: 430, day: "10일" },
  ] },
  { stage: "성령의 아홉 열매 도전", emoji: "🍇", steps: [
    { label: "새로운 작품 시작", pt: 500, day: "새 여정" },
  ] },
];
const FLAT_STEPS = STAGES.flatMap((s) => s.steps.map((st) => ({ ...st, stage: s.stage, emoji: s.emoji })));
const stageInfo = (p) => {
  const doneCount = FLAT_STEPS.filter((s) => p >= s.pt).length;
  const current = FLAT_STEPS.find((s) => p < s.pt) || FLAT_STEPS[FLAT_STEPS.length - 1];
  const prev = [...FLAT_STEPS].reverse().find((s) => p >= s.pt);
  return { current, prevPt: prev ? prev.pt : 0, doneCount };
};

/* 성령의 아홉 열매 (열매 수확 후 하나씩 키워 뱃지 획득) */
const FRUITS = [
  { key: "love", name: "사랑", emoji: "❤️", c: T.rose },
  { key: "joy", name: "희락", emoji: "😊", c: T.gold },
  { key: "peace", name: "화평", emoji: "🕊️", c: T.teal },
  { key: "patience", name: "인내", emoji: "⏳", c: T.violet },
  { key: "kindness", name: "자비", emoji: "🤲", c: T.sage },
  { key: "goodness", name: "양선", emoji: "🌻", c: T.goldDeep },
  { key: "faithfulness", name: "충성", emoji: "🛡️", c: T.inkSoft },
  { key: "gentleness", name: "온유", emoji: "🌿", c: T.olive },
  { key: "selfcontrol", name: "절제", emoji: "⚖️", c: "#8A6BA0" },
];
const FRUIT = Object.fromEntries(FRUITS.map((f) => [f.key, f]));
const GROW_STEPS = ["물 주기", "양분 주기", "수확하기"];

const TODAY_VERSE = { text: "아침에 나로 하여금 주의 인자한 말씀을 듣게 하소서", ref: "시편 143:8" };

/* 오늘 서울 날씨 (데모 · 실제로는 기상 API로 매일 갱신) */
const WEATHER = { region: "서울", label: "흐리고 비", temp: 28, icon: CloudRain };

const READING = { plan: "맥체인 통독", today: "창세기 12장 · 마태복음 11장" };

/* 찬양 — 누르면 유튜브에서 감상 (검색 링크로 연결) */
const ytSearch = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const PRAISE = [
  { t: "주 은혜임을", a: "제이어스" },
  { t: "예배자", a: "어노인팅" },
  { t: "은혜 아니면", a: "손경민" },
  { t: "주께 가오니", a: "마커스" },
  { t: "성령이 오셨네", a: "제이어스" },
];

/* 예배 — 예배별 설교 링크 (교회 유튜브로 연결) */
const WORSHIP_INFO = [
  { d: "주일예배", t: "주일 오전 11:00", links: [
    { name: "이번 주 주일 설교", q: "주일예배 설교" },
    { name: "지난 주 주일 설교", q: "주일 대예배 설교 다시보기" },
  ] },
  { d: "수요예배", t: "수요일 오후 7:30", links: [
    { name: "수요예배 말씀", q: "수요예배 설교" },
  ] },
  { d: "새벽기도", t: "매일 오전 5:30", links: [
    { name: "새벽예배 말씀", q: "새벽예배 설교" },
  ] },
];

const PRACTICE_WWJD = "잠시 멈추고 떠올려 보세요. 예수님이라면, 지금 내 앞의 이 사람과 이 상황에서 어떻게 하셨을까요?";
const PRACTICE_IDEAS = ["가족에게 먼저 감사 표현하기", "이웃에게 밝게 인사하기", "가진 것 하나 나누기", "험담 대신 축복의 말", "도움이 필요한 이 돕기"];
const PRAYER_PROMPTS = ["오늘 하루를 주님께 맡기며", "감사한 일 세 가지를 떠올리며", "마음에 걸리는 이를 위하여"];

/* 신앙계발 — 추천 도서 · 생각해볼 이슈 */
const GROWTH_BOOKS = [
  { t: "순전한 기독교", a: "C.S. 루이스" },
  { t: "예수님이라면 어떻게 하실까", a: "찰스 쉘던" },
  { t: "묵상하는 그리스도인", a: "복 있는 사람" },
];
const GROWTH_NEWS = [
  { t: "AI 시대, 신앙은 어떻게 응답할까", q: "기독교 AI 윤리" },
  { t: "이웃을 향한 나눔과 환대", q: "교회 지역사회 나눔" },
];

/* 구제·선교 */
const MISSION_VERSE = { text: "너희가 여기 내 형제 중에 지극히 작은 자 하나에게 한 것이 곧 내게 한 것이니라", ref: "마태복음 25:40" };
const MISSION_PRAYERS = [
  "복음이 닿지 않은 미전도 종족을 위하여",
  "파송된 선교사들의 건강과 안전을 위하여",
  "전쟁·재난 지역의 이웃을 위하여",
];
const MISSION_IDEAS = ["작은 후원 한 곳 시작하기", "이웃에게 필요한 것 나누기", "선교 편지에 응원 답장하기", "한 끼 아껴 나눔에 보태기"];
const MISSION_LINKS = [
  { name: "월드비전", desc: "아동·구호 후원", url: "https://www.worldvision.or.kr" },
  { name: "컴패션", desc: "1:1 어린이 양육", url: "https://www.compassion.or.kr" },
  { name: "기아대책", desc: "국내외 구호·개발", url: "https://www.kfhi.or.kr" },
];

/* 성경 66권 (이름, 장수) */
const BIBLE_OT = [["창세기",50],["출애굽기",40],["레위기",27],["민수기",36],["신명기",34],["여호수아",24],["사사기",21],["룻기",4],["사무엘상",31],["사무엘하",24],["열왕기상",22],["열왕기하",25],["역대상",29],["역대하",36],["에스라",10],["느헤미야",13],["에스더",10],["욥기",42],["시편",150],["잠언",31],["전도서",12],["아가",8],["이사야",66],["예레미야",52],["예레미야애가",5],["에스겔",48],["다니엘",12],["호세아",14],["요엘",3],["아모스",9],["오바댜",1],["요나",4],["미가",7],["나훔",3],["하박국",3],["스바냐",3],["학개",2],["스가랴",14],["말라기",4]];
const BIBLE_NT = [["마태복음",28],["마가복음",16],["누가복음",24],["요한복음",21],["사도행전",28],["로마서",16],["고린도전서",16],["고린도후서",13],["갈라디아서",6],["에베소서",6],["빌립보서",4],["골로새서",4],["데살로니가전서",5],["데살로니가후서",3],["디모데전서",6],["디모데후서",4],["디도서",3],["빌레몬서",1],["히브리서",13],["야고보서",5],["베드로전서",5],["베드로후서",3],["요한일서",5],["요한이서",1],["요한삼서",1],["유다서",1],["요한계시록",22]];
const bibleUrl = (name, ch) => `https://www.biblegateway.com/passage/?search=${encodeURIComponent(name + " " + ch)}&version=KLB`;

/* 큐티 영상·묵상 링크 (kind: embed=앱 내 재생, site=새 탭) */
const QT_LINKS = [
  { name: "큐티인 — 오늘의 큐티", desc: "재생목록 · 앱 안에서 재생", kind: "embed", url: "https://www.youtube.com/embed/videoseries?list=PLvn_5y4iSsmxh7NVg8yhk9eqdyPGkm6fg", c: T.violet },
  { name: "생명의 삶 — 오늘의 큐티", desc: "재생목록 · 앱 안에서 재생", kind: "embed", url: "https://www.youtube.com/embed/videoseries?list=PLrH3J2Hst9zSfUE5jmSkGmOfHQ6V_k0aK", c: T.rose },
  { name: "새벽나라 (청소년 큐티)", desc: "재생목록 · 앱 안에서 재생", kind: "embed", url: "https://www.youtube.com/embed/videoseries?list=PLl8cxN5f4iM4-RpnRC8NuKmI0VXbuFA6F", c: T.teal },
  { name: "매일성경 (성서유니온)", desc: "매일 본문 묵상과 나눔", kind: "site", url: "https://qt.swim.org/user_utf//dailybibleeng/user_print_web.php", c: T.sage },
  { name: "두란노 생명의삶", desc: "오늘의 말씀·본문 해설", kind: "site", url: "https://www.duranno.com/qt/", c: T.goldDeep },
];

const SEED_POSTS = [
  { id: 1, name: "김은혜", init: "은", time: "오늘 06:20", text: "새벽에 시편 143편으로 큐티했어요. 아침에 주의 인자를 듣게 해달라는 구절이 하루를 붙잡아 주네요.", amen: 12, amened: false },
  { id: 2, name: "이믿음", init: "믿", time: "오늘 07:05", text: "요즘 마음이 무거웠는데 오늘 나눔 들으며 위로받았습니다. 함께 기도해 주세요 🙏", amen: 8, amened: false },
  { id: 3, name: "박소망", init: "소", time: "어제 21:40", text: "감사 노트 3주째. 작은 것까지 세어보니 하루가 달라져요.", amen: 21, amened: false },
];

const SEED_JOURNAL = [
  { id: 101, date: "7월 6일", dim: "word", note: "시편 143편. 아침에 주의 인자를 듣게 하소서. 하루의 방향을 다시 잡았다.", time: "06:40" },
  { id: 102, date: "7월 6일", dim: "praise", note: "'은혜 아니면'을 반복해서 들었다. 마음이 녹았다.", time: "21:30" },
  { id: 103, date: "7월 6일", dim: "prayer", note: "중고등부 아이들 이름을 하나씩 부르며 기도.", time: "22:10" },
  { id: 104, date: "7월 5일", dim: "word", note: "로마서 8장. 정죄함이 없다는 말씀에 쉼을 얻음.", time: "07:00" },
  { id: 105, date: "7월 5일", dim: "worship", note: "주일예배. 설교가 오래 마음에 남았다.", time: "13:00" },
];

const AV = [T.gold, T.sage, T.rose, T.violet, T.teal, T.inkSoft];

const SEED_ROOMS = [
  { id: "r1", name: "새벽예배 동행", desc: "매일 새벽 함께 깨어 기도해요", members: 12, mine: true, unread: 2, feed: [
    { id: 1, name: "김은혜", init: "은", c: T.gold, text: "오늘도 새벽에 눈이 떠졌어요. 함께라서 계속하게 되네요 🙏", time: "오늘 05:40" },
    { id: 2, name: "박소망", init: "소", c: T.rose, text: "시편 143편 같이 읽는 중이에요. 은혜.", time: "오늘 05:55" },
  ] },
  { id: "r2", name: "중고등부 3반", desc: "우리 반 아이들과 선생님의 나눔방", members: 8, mine: true, unread: 1, feed: [
    { id: 1, name: "이믿음", init: "믿", c: T.sage, text: "이번 주 암송 다 외웠어요 선생님!", time: "어제 21:10" },
  ] },
  { id: "r3", name: "말씀 통독 100일", desc: "100일 성경 통독 도전 공동체", members: 24, mine: false, unread: 0, feed: [
    { id: 1, name: "정충성", init: "충", c: T.teal, text: "오늘 창세기 12장까지. 아브라함의 부르심이 마음에 남네요.", time: "오늘 07:20" },
  ] },
];

const SEED_THREADS = [
  { id: "t1", name: "김은혜", init: "은", c: T.gold, unread: 2, msgs: [
    { me: false, text: "오늘 큐티 나눔 봤어요. 은혜였어요 🙏", time: "08:10" },
    { me: false, text: "이번 주 새벽예배도 같이 가요!", time: "08:11" },
  ] },
  { id: "t2", name: "이믿음", init: "믿", c: T.sage, unread: 0, msgs: [
    { me: true, text: "이번 주 암송 구절은 시편 143:8이에요~", time: "어제 20:00" },
    { me: false, text: "넵 선생님! 외워볼게요", time: "어제 20:05" },
  ] },
  { id: "t3", name: "박소망", init: "소", c: T.rose, unread: 0, msgs: [
    { me: false, text: "감사 노트 어떻게 쓰는지 알려줄 수 있어요?", time: "2일 전" },
  ] },
];

const todayLabel = () => new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

/* ─────────────────────────────────────────────
   앱
────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState("home");
  const [points, setPoints] = useState(0);
  const [log, setLog] = useState([]);
  const [posts, setPosts] = useState(SEED_POSTS);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const [done7, setDone7] = useState(Object.fromEntries(DIMS.map((d) => [d.key, false])));
  const [journal, setJournal] = useState(SEED_JOURNAL);
  const [memDone, setMemDone] = useState(false);
  const [memStreak, setMemStreak] = useState(3);
  const [sheet, setSheet] = useState(null); // 열린 훈련 key
  const [rooms, setRooms] = useState(SEED_ROOMS);
  const [threads, setThreads] = useState(SEED_THREADS);

  // 성령의 아홉 열매
  const [earnedFruits, setEarnedFruits] = useState(["love"]);
  const [growingFruit, setGrowingFruit] = useState("joy");
  const [growStep, setGrowStep] = useState(1);

  const selectFruit = (key) => { if (growingFruit || earnedFruits.includes(key)) return; setGrowingFruit(key); setGrowStep(0); };
  const growAction = () => setGrowStep((s) => Math.min(2, s + 1));
  const harvestFruit = () => {
    if (!growingFruit) return;
    const f = FRUIT[growingFruit];
    setEarnedFruits((a) => [...a, growingFruit]);
    setGrowingFruit(null); setGrowStep(0);
    award(50, `${f.name} 열매 수확`);
  };

  const award = (pts, label) => {
    setPoints((p) => p + pts);
    setLog((l) => [{ id: Date.now() + Math.random(), label, pts, time: "방금" }, ...l]);
    setToast({ pts, label });
    setTimeout(() => setToast(null), 1700);
  };

  const completeDim = (key, note) => {
    const first = !done7[key];
    setDone7((d) => ({ ...d, [key]: true }));
    setJournal((j) => [{ id: Date.now(), date: todayLabel(), dim: key, note: (note || "").trim(), time: "방금" }, ...j]);
    if (first) award(DIM[key].pts, `${DIM[key].label} 훈련`);
  };

  const doMemorize = () => {
    if (memDone) return;
    setMemDone(true);
    setMemStreak((s) => s + 1);
    award(5, "말씀 암송");
  };

  const doneCount = DIMS.filter((d) => done7[d.key]).length;
  const ctx = { tab, setTab, points, log, posts, setPosts, user, setUser, award, done7, doneCount, journal, memDone, memStreak, doMemorize, sheet, setSheet, completeDim, rooms, setRooms, threads, setThreads, earnedFruits, growingFruit, growStep, selectFruit, growAction, harvestFruit };

  return (
    <div style={{ background: "#E9E4D8", minHeight: "100vh", display: "flex", justifyContent: "center", fontFamily: sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        textarea, input { font-family: inherit; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        @keyframes rise { from { transform: translateY(6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes glow { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        @keyframes pop { 0% { transform: scale(.9); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 400, minHeight: "100vh", background: T.paper, position: "relative", boxShadow: "0 0 60px rgba(32,42,68,.15)", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 84 }}>
          {tab === "home" && <Home {...ctx} />}
          {tab === "journal" && <Journal {...ctx} />}
          {tab === "community" && <Community {...ctx} />}
          {tab === "points" && <Points {...ctx} />}
          {tab === "me" && <Me {...ctx} />}
        </div>

        {sheet && <TrainSheet dimKey={sheet} done={done7[sheet]} onClose={() => setSheet(null)} onComplete={completeDim} />}

        {toast && (
          <div style={{ position: "absolute", left: "50%", bottom: 100, transform: "translateX(-50%)", background: T.ink, color: "#fff", padding: "10px 16px", borderRadius: 999, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(32,42,68,.35)", animation: "pop .25s ease", zIndex: 50 }}>
            <Sparkles size={15} color={T.gold} />
            <span style={{ fontSize: 14.5, fontWeight: 500 }}>{toast.label} · <b style={{ color: T.gold }}>+{toast.pts}P</b></span>
          </div>
        )}

        <TabBar tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   홈
────────────────────────────────────────────── */
function Home(ctx) {
  const { done7, doneCount, setSheet, memDone, memStreak, doMemorize, threads, rooms, setTab } = ctx;
  const hour = new Date().getHours();
  const greet = hour < 11 ? "좋은 아침이에요" : hour < 18 ? "평안한 오후예요" : "고요한 저녁이에요";

  const dmUnread = threads.reduce((n, t) => n + t.unread, 0);
  const roomUnread = rooms.reduce((n, r) => n + (r.unread || 0), 0);
  const notifCount = dmUnread + roomUnread;
  const [openNotif, setOpenNotif] = useState(false);
  const [openShare, setOpenShare] = useState(false);

  return (
    <div>
      {/* 콤팩트 헤더 */}
      <div style={{ background: `linear-gradient(165deg, ${T.ink} 0%, #2C3A63 60%, #504B77 100%)`, padding: "34px 20px 18px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <StarField />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13.5, letterSpacing: 1.5, opacity: .7 }}>
                {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}
              </p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.13)", borderRadius: 999, padding: "4px 10px", fontSize: 13, marginTop: 7 }}>
                <WEATHER.icon size={13} color={T.goldGlow} />
                {WEATHER.region} {WEATHER.temp}° · {WEATHER.label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => setOpenNotif(true)} style={{ position: "relative", width: 38, height: 38, borderRadius: 999, background: "rgba(255,255,255,.13)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={18} color="#fff" />
                {notifCount > 0 && <span style={{ position: "absolute", top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 999, background: T.rose, color: "#fff", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: `2px solid ${T.ink}` }}>{notifCount}</span>}
              </button>
              <button onClick={() => setOpenShare(true)} style={{ width: 38, height: 38, borderRadius: 999, background: "rgba(255,255,255,.13)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Share2 size={17} color="#fff" />
              </button>
            </div>
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 23, fontWeight: 700, margin: "14px 0 0" }}>믿음님, {greet}</h1>

          {/* 별 7개 진행도 */}
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
              {DIMS.map((d) => {
                const on = done7[d.key];
                return <Star key={d.key} size={23} fill={on ? T.gold : "none"} color={on ? T.gold : "rgba(255,255,255,.3)"} strokeWidth={1.8} style={{ transition: "all .4s ease", filter: on ? "drop-shadow(0 0 5px rgba(217,164,65,.75))" : "none" }} />;
              })}
            </div>
            <p style={{ margin: "9px 0 0", fontSize: 13.5, color: "rgba(255,255,255,.75)" }}>
              {doneCount === DIMS.length ? "오늘의 신앙 훈련을 모두 밝혔어요 ✦" : <>오늘의 신앙 훈련 <b style={{ color: T.gold }}>{doneCount}</b> / {DIMS.length}</>}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px 6px" }}>
        {/* 오늘의 말씀 (암송) — 콤팩트 */}
        <MemorizeCard verse={TODAY_VERSE} done={memDone} streak={memStreak} onDone={doMemorize} />

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "18px 2px 10px" }}>
          <h2 style={{ fontFamily: serif, fontSize: 19.5, fontWeight: 700, color: T.ink, margin: 0 }}>오늘의 신앙 훈련</h2>
          <span style={{ fontSize: 13, color: T.muted }}>후기를 남기면 신앙일기가 돼요</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {DIMS.map((d, i) => {
            const wide = DIMS.length % 2 === 1 && i === DIMS.length - 1;
            return <TrainCard key={d.key} dim={d} done={done7[d.key]} wide={wide} onClick={() => setSheet(d.key)} />;
          })}
        </div>
      </div>

      {openNotif && <NotifSheet threads={threads} rooms={rooms} onClose={() => setOpenNotif(false)} onGo={() => { setOpenNotif(false); setTab("community"); }} />}
      {openShare && <InviteSheet onClose={() => setOpenShare(false)} share />}
    </div>
  );
}

function TrainCard({ dim, done, wide, onClick }) {
  const Ic = dim.icon;
  return (
    <button onClick={onClick} style={{
      gridColumn: wide ? "1 / -1" : "auto",
      display: "flex", alignItems: "center", gap: 9, textAlign: "left",
      background: T.card, borderRadius: 12, padding: "9px 11px",
      border: `1px solid ${done ? T.sageSoft : T.line}`, boxShadow: "0 1px 6px rgba(32,42,68,.03)",
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: done ? T.sage : `${dim.c}16`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {done ? <Check size={17} color="#fff" /> : <Ic size={17} color={dim.c} />}
      </div>
      <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dim.label}</span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: done ? T.sage : T.gold, flexShrink: 0 }}>{done ? "완료" : `+${dim.pts}P`}</span>
    </button>
  );
}

function MemorizeCard({ verse, done, streak, onDone }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={{ background: `linear-gradient(150deg, #FFFDF7, ${T.goldSoft})`, borderRadius: 16, padding: "14px 16px", border: `1px solid ${T.goldSoft}`, boxShadow: "0 2px 10px rgba(217,164,65,.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: T.goldDeep }}><Feather size={13} /> 오늘의 말씀 암송</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 13.5, fontWeight: 700, color: T.rose }}><Flame size={13} fill={T.rose} color={T.rose} /> {streak}일</span>
        </div>
        <p style={{ fontFamily: serif, fontSize: 18.5, lineHeight: 1.55, color: T.ink, margin: "0 0 4px" }}>"{verse.text}"</p>
        <p style={{ margin: "0 0 12px", fontSize: 13.5, color: T.goldDeep, fontWeight: 700 }}>{verse.ref}</p>
        <button onClick={() => setOpen(true)} disabled={done} style={{ width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 14.5, fontWeight: 700, background: done ? "rgba(95,132,104,.14)" : T.ink, color: done ? T.sage : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {done ? <><Check size={15} /> 오늘 암송 완료 · 🔥 {streak}일</> : <><Feather size={14} /> 암송 연습하기 · +5P</>}
        </button>
      </div>
      {open && <MemorizeModal verse={verse} done={done} onClose={() => setOpen(false)} onDone={() => { onDone(); setOpen(false); }} />}
    </div>
  );
}

function MemorizeModal({ verse, onClose, onDone, done }) {
  const words = verse.text.split(" ");
  const [level, setLevel] = useState(0);
  const [peek, setPeek] = useState(() => new Set());
  const names = ["전체 보기", "절반 가리기", "대부분 가리기", "모두 가리기"];
  const hidden = (i) => { if (peek.has(i)) return false; if (level === 0) return false; if (level === 1) return i % 2 === 1; if (level === 2) return i % 4 !== 0; return true; };

  return (
    <Sheet onClose={onClose} title={<><Feather size={15} color={T.gold} /> 말씀 암송 연습</>}>
      <p style={{ margin: "0 0 12px", fontSize: 13.5, color: T.muted }}>가려진 단어를 톡 누르면 살짝 볼 수 있어요.</p>
      <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.line}`, padding: "22px 18px", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 8px", justifyContent: "center" }}>
          {words.map((w, i) => hidden(i) ? (
            <button key={i} onClick={() => setPeek((s) => new Set(s).add(i))} style={{ fontFamily: serif, fontSize: 19.5, color: T.gold, borderBottom: `2px solid ${T.gold}`, minWidth: `${Math.max(1, w.length)}ch`, height: 25, background: "rgba(217,164,65,.08)", borderRadius: 3 }}>&nbsp;</button>
          ) : (
            <span key={i} style={{ fontFamily: serif, fontSize: 19.5, color: T.ink }}>{w}</span>
          ))}
        </div>
        <p style={{ textAlign: "center", margin: "14px 0 0", fontSize: 13.5, color: T.goldDeep, fontWeight: 700 }}>{verse.ref}</p>
      </div>
      <div style={{ display: "flex", gap: 5, margin: "14px 0" }}>
        {names.map((n, i) => (
          <button key={n} onClick={() => { setLevel(i); setPeek(new Set()); }} style={{ flex: 1, padding: "8px 0", borderRadius: 9, fontSize: 12, fontWeight: 700, background: level === i ? T.ink : T.card, color: level === i ? "#fff" : T.muted, border: `1px solid ${level === i ? T.ink : T.line}` }}>{n}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 9 }}>
        <button onClick={() => setPeek(new Set())} style={{ width: 50, borderRadius: 11, background: T.card, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}><RotateCcw size={17} color={T.muted} /></button>
        <button onClick={onDone} disabled={done} style={{ flex: 1, padding: "13px 0", borderRadius: 11, fontSize: 16, fontWeight: 700, background: done ? T.sageSoft : T.gold, color: done ? T.sage : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {done ? <><Check size={16} /> 오늘 암송 완료</> : <>다 외웠어요! · +5P</>}
        </button>
      </div>
    </Sheet>
  );
}

/* ─────────────────────────────────────────────
   훈련 상세 시트 (일곱 항목 공용)
────────────────────────────────────────────── */
function TrainSheet({ dimKey, done, onClose, onComplete }) {
  const dim = DIM[dimKey];
  const [note, setNote] = useState("");
  const [web, setWeb] = useState(null);
  const Ic = dim.icon;
  const openWeb = (url, title, kind) => setWeb({ url, title, kind });

  return (
    <Sheet onClose={onClose} accent={dim.c} title={<><Ic size={16} color={dim.c} /> {dim.label}</>}>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: T.muted }}>{dim.sub}</p>

      <div style={{ marginBottom: 16 }}>{renderContent(dimKey, { openWeb })}</div>

      <p style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, color: T.ink }}>오늘의 후기</p>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={dim.prompt}
        style={{ width: "100%", border: `1px solid ${T.line}`, borderRadius: 12, padding: "11px 13px", fontSize: 14.5, lineHeight: 1.6, color: T.ink, outline: "none", resize: "none", background: T.paper }} />

      <button onClick={() => { onComplete(dimKey, note); onClose(); }} disabled={done}
        style={{ width: "100%", padding: "13px 0", marginTop: 12, borderRadius: 12, fontSize: 16, fontWeight: 700, background: done ? T.sageSoft : dim.c, color: done ? T.sage : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        {done ? <><Check size={16} /> 오늘 완료됨</> : <><PenLine size={15} /> 훈련 완료 · 일기 저장 · +{dim.pts}P</>}
      </button>

      {web && <WebView url={web.url} title={web.title} kind={web.kind} onClose={() => setWeb(null)} />}
    </Sheet>
  );
}

function renderContent(key, { openWeb }) {
  if (key === "word") return <BibleFinder openWeb={openWeb} />;
  if (key === "qt") return <QTLinks openWeb={openWeb} />;
  if (key === "prayer")
    return (
      <div style={{ display: "grid", gap: 8 }}>
        {PRAYER_PROMPTS.map((p) => <InfoLine key={p} icon={HeartHandshake} text={p} c={T.rose} />)}
      </div>
    );
  if (key === "praise")
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <p style={{ margin: "0 0 2px", fontSize: 13.5, color: T.muted }}>곡을 누르면 유튜브에서 들을 수 있어요</p>
        {PRAISE.map((s) => (
          <button key={s.t} onClick={() => openWeb(ytSearch(`${s.t} ${s.a}`), `${s.t} · ${s.a}`)} style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: T.card, borderRadius: 12, padding: 10, border: `1px solid ${T.line}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${T.teal}16`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Play size={15} color={T.teal} fill={T.teal} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{s.t}</p><p style={{ margin: 0, fontSize: 13, color: T.muted }}>{s.a}</p></div>
            <ExternalLink size={15} color={T.muted} style={{ flexShrink: 0 }} />
          </button>
        ))}
        <p style={{ margin: "6px 2px 0", fontSize: 12, color: T.muted, lineHeight: 1.5 }}>* 유튜브는 광고가 있을 수 있어요. 정식 배포 땐 CCM 스트리밍 플레이리스트를 붙일 수 있어요.</p>
      </div>
    );
  if (key === "worship")
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {WORSHIP_INFO.map((w) => (
          <div key={w.d}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, display: "flex", alignItems: "center", gap: 7 }}><Church size={15} color={T.goldDeep} /> {w.d}</span>
              <span style={{ fontSize: 13.5, color: T.muted }}>{w.t}</span>
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {w.links.map((l) => (
                <button key={l.name} onClick={() => openWeb(ytSearch(l.q), l.name)} style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", background: T.card, borderRadius: 11, padding: "10px 12px", border: `1px solid ${T.line}` }}>
                  <Play size={14} color={T.goldDeep} fill={T.goldDeep} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</span>
                  <ExternalLink size={14} color={T.muted} style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        ))}
        <p style={{ margin: "2px 2px 0", fontSize: 12, color: T.muted, lineHeight: 1.5 }}>* 우리 교회 유튜브 설교 링크로 바꿔 넣을 수 있어요. 아래 후기에 설교 요약을 남겨도 좋아요.</p>
      </div>
    );
  if (key === "practice")
    return (
      <div>
        <div style={{ background: `${T.sage}0F`, borderRadius: 12, padding: "13px 14px", border: `1px solid ${T.sageSoft}`, marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: T.sage, marginBottom: 5 }}>예수님이라면 어떻게 하셨을까?</p>
          <p style={{ margin: 0, fontSize: 14, color: T.inkSoft, lineHeight: 1.65, fontFamily: serif }}>{PRACTICE_WWJD}</p>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 13.5, color: T.muted }}>오늘 이런 사랑을 실천해볼까요</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {PRACTICE_IDEAS.map((p) => <span key={p} style={{ fontSize: 14, color: T.sage, background: T.sageSoft, borderRadius: 999, padding: "7px 13px", fontWeight: 500 }}>{p}</span>)}
        </div>
      </div>
    );
  if (key === "mission")
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ background: "#4E7CA10F", borderRadius: 12, padding: "13px 14px", border: "1px solid #4E7CA133" }}>
          <p style={{ fontFamily: serif, fontSize: 16.5, lineHeight: 1.6, color: T.ink, margin: 0 }}>"{MISSION_VERSE.text}"</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#4E7CA1", fontWeight: 700 }}>{MISSION_VERSE.ref}</p>
        </div>
        <div>
          <p style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, color: "#4E7CA1" }}>🙏 선교·구제 기도제목</p>
          <div style={{ display: "grid", gap: 6 }}>
            {MISSION_PRAYERS.map((p) => <InfoLine key={p} icon={HeartHandshake} text={p} c="#4E7CA1" />)}
          </div>
        </div>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#4E7CA1" }}>🤲 오늘의 나눔 실천</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {MISSION_IDEAS.map((p) => <span key={p} style={{ fontSize: 14, color: "#3B617E", background: "#4E7CA114", borderRadius: 999, padding: "7px 13px", fontWeight: 500 }}>{p}</span>)}
          </div>
        </div>
        <div>
          <p style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, color: "#4E7CA1" }}>🔗 후원·기부처</p>
          <div style={{ display: "grid", gap: 6 }}>
            {MISSION_LINKS.map((l) => (
              <button key={l.name} onClick={() => openWeb(l.url, l.name)} style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", background: T.card, borderRadius: 11, padding: "10px 12px", border: `1px solid ${T.line}` }}>
                <HandHeart size={16} color="#4E7CA1" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}>{l.name}</p><p style={{ margin: 0, fontSize: 12, color: T.muted }}>{l.desc}</p></div>
                <ExternalLink size={14} color={T.muted} style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  if (key === "growth")
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <p style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, color: T.olive }}>📚 추천 도서</p>
          <div style={{ display: "grid", gap: 6 }}>
            {GROWTH_BOOKS.map((b) => (
              <button key={b.t} onClick={() => openWeb(ytSearch(`${b.t} ${b.a} 책 소개`), b.t)} style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", background: T.card, borderRadius: 11, padding: "10px 12px", border: `1px solid ${T.line}` }}>
                <BookOpen size={15} color={T.olive} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}>{b.t}</p><p style={{ margin: 0, fontSize: 12, color: T.muted }}>{b.a}</p></div>
                <ExternalLink size={14} color={T.muted} style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, color: T.olive }}>💡 생각해볼 이슈</p>
          <div style={{ display: "grid", gap: 6 }}>
            {GROWTH_NEWS.map((n) => (
              <button key={n.t} onClick={() => openWeb(ytSearch(n.q), n.t)} style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", background: T.card, borderRadius: 11, padding: "10px 12px", border: `1px solid ${T.line}` }}>
                <Search size={15} color={T.olive} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: T.ink, lineHeight: 1.4 }}>{n.t}</span>
                <ExternalLink size={14} color={T.muted} style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  return null;
}

/* 말씀 — 성경 찾기 */
function BibleFinder({ openWeb }) {
  const [testament, setTestament] = useState("nt");
  const [book, setBook] = useState(null);
  const books = testament === "ot" ? BIBLE_OT : BIBLE_NT;

  if (book) {
    const [name, ch] = book;
    return (
      <div>
        <button onClick={() => setBook(null)} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, color: T.muted, fontWeight: 600, marginBottom: 10 }}><ChevronLeft size={15} /> 성경 목록</button>
        <p style={{ margin: "0 0 10px", fontSize: 15.5, fontWeight: 700, color: T.ink }}>{name} <span style={{ fontSize: 13.5, color: T.muted, fontWeight: 400 }}>· 전체 {ch}장 · 읽을 장을 선택하세요</span></p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, maxHeight: 200, overflowY: "auto" }}>
          {Array.from({ length: ch }).map((_, i) => (
            <button key={i} onClick={() => openWeb(bibleUrl(name, i + 1), `${name} ${i + 1}장`)} style={{ padding: "9px 0", borderRadius: 8, background: T.card, border: `1px solid ${T.line}`, fontSize: 14, fontWeight: 700, color: T.inkSoft }}>{i + 1}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["nt", "신약"], ["ot", "구약"]].map(([k, l]) => (
          <button key={k} onClick={() => setTestament(k)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, background: testament === k ? T.ink : T.card, color: testament === k ? "#fff" : T.muted, border: `1px solid ${testament === k ? T.ink : T.line}` }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, maxHeight: 220, overflowY: "auto" }}>
        {books.map((b) => (
          <button key={b[0]} onClick={() => setBook(b)} style={{ padding: "10px 4px", borderRadius: 9, background: T.card, border: `1px solid ${T.line}`, fontSize: 14, fontWeight: 700, color: T.ink }}>{b[0]}</button>
        ))}
      </div>
      <p style={{ margin: "10px 2px 0", fontSize: 12, color: T.muted }}>장을 고르면 성경 본문 페이지가 프레임 안에서 열려요.</p>
    </div>
  );
}

/* QT — 큐티 영상·묵상 링크 */
function QTLinks({ openWeb }) {
  return (
    <div style={{ display: "grid", gap: 9 }}>
      <p style={{ margin: "0 0 2px", fontSize: 13.5, color: T.muted }}>영상은 앱 안에서 재생돼요</p>
      {QT_LINKS.map((l) => (
        <button key={l.name} onClick={() => openWeb(l.url, l.name, l.kind)} style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: T.card, borderRadius: 12, padding: 11, border: `1px solid ${T.line}` }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${l.c}16`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Play size={17} color={l.c} fill={l.c} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{l.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.desc}</p>
          </div>
          {l.kind === "embed"
            ? <span style={{ fontSize: 11.5, fontWeight: 700, color: l.c, background: `${l.c}18`, borderRadius: 999, padding: "3px 8px", flexShrink: 0 }}>앱 내 재생</span>
            : <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 700, color: T.muted, flexShrink: 0 }}><ExternalLink size={12} /> 새 탭</span>}
        </button>
      ))}
    </div>
  );
}

/* 프레임 안 웹뷰 */
function WebView({ url, title, kind, onClose }) {
  const embed = kind === "embed";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "center", background: "rgba(0,0,0,.45)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${T.line}`, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: 2 }}><ChevronLeft size={22} color={T.ink} /></button>
          <span style={{ flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
          <a href={url} target="_blank" rel="noreferrer" style={{ padding: 2, display: "flex" }}><ExternalLink size={19} color={T.muted} /></a>
        </div>
        {embed ? (
          <div style={{ flex: 1, background: "#000" }}>
            <iframe src={url} title={title} style={{ width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          </div>
        ) : (
          <div style={{ flex: 1, background: "#F7F3EC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(32,42,68,.1)" }}><ExternalLink size={26} color={T.gold} /></div>
            <p style={{ margin: 0, fontSize: 15.5, color: T.ink, fontWeight: 700 }}>{title}</p>
            <p style={{ margin: 0, fontSize: 14, color: T.muted, lineHeight: 1.6 }}>이 페이지는 보안 정책상 앱 안에<br />표시할 수 없어요. 새 탭에서 열어보세요.</p>
            <a href={url} target="_blank" rel="noreferrer" style={{ background: T.ink, color: "#fff", padding: "12px 22px", borderRadius: 999, fontSize: 15.5, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}><ExternalLink size={16} /> 새 탭에서 열기</a>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniVerse({ verse }) {
  return (
    <div style={{ background: `${T.gold}0F`, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.goldSoft}` }}>
      <p style={{ fontFamily: serif, fontSize: 16.5, lineHeight: 1.55, color: T.ink, margin: 0 }}>"{verse.text}"</p>
      <p style={{ margin: "5px 0 0", fontSize: 13, color: T.goldDeep, fontWeight: 700 }}>{verse.ref}</p>
    </div>
  );
}
function InfoLine({ icon: Icon, text, c = T.inkSoft }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, borderRadius: 12, padding: "11px 13px", border: `1px solid ${T.line}` }}>
      <Icon size={16} color={c} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14, color: T.ink }}>{text}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   신앙일기
────────────────────────────────────────────── */
function Journal({ journal, done7, doneCount }) {
  const groups = useMemo(() => {
    const map = new Map();
    journal.forEach((e) => { if (!map.has(e.date)) map.set(e.date, []); map.get(e.date).push(e); });
    return [...map.entries()];
  }, [journal]);
  const today = todayLabel();

  return (
    <div>
      <Header title="신앙일기" subtitle="매일의 훈련이 모여 나의 여정이 됩니다" />
      <div style={{ padding: "0 16px" }}>
        {/* 오늘 요약 */}
        <div style={{ background: `linear-gradient(155deg, ${T.ink}, #3A335E)`, borderRadius: 16, padding: "16px 18px", color: "#fff", marginBottom: 18, position: "relative", overflow: "hidden" }}>
          <StarField faint />
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={{ margin: 0, fontSize: 13.5, opacity: .75 }}>오늘의 신앙 훈련</p>
            <p style={{ margin: "3px 0 12px", fontFamily: serif, fontSize: 24.5, fontWeight: 700 }}>{doneCount} <span style={{ fontSize: 15.5, opacity: .7 }}>/ {DIMS.length} 완료</span></p>
            <div style={{ display: "flex", gap: 6 }}>
              {DIMS.map((d) => {
                const on = done7[d.key]; const Ic = d.icon;
                return <div key={d.key} title={d.label} style={{ width: 30, height: 30, borderRadius: 9, background: on ? d.c : "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={15} color={on ? "#fff" : "rgba(255,255,255,.4)"} /></div>;
              })}
            </div>
          </div>
        </div>

        {groups.length === 0 ? (
          <Empty icon={NotebookPen} text={"아직 기록이 없어요.\n홈에서 훈련 후기를 남겨보세요."} />
        ) : (
          groups.map(([date, entries]) => (
            <div key={date} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                <span style={{ fontFamily: serif, fontSize: 16.5, fontWeight: 700, color: T.ink }}>{date}</span>
                {date === today && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", background: T.gold, borderRadius: 999, padding: "2px 8px" }}>오늘</span>}
                <div style={{ flex: 1, height: 1, background: T.line }} />
              </div>
              <div style={{ display: "grid", gap: 9 }}>
                {entries.map((e) => {
                  const d = DIM[e.dim]; const Ic = d.icon;
                  return (
                    <div key={e.id} style={{ background: T.card, borderRadius: 13, padding: "12px 14px", border: `1px solid ${T.line}`, borderLeft: `3px solid ${d.c}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: e.note ? 7 : 0 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: d.c }}><Ic size={14} /> {d.label}</span>
                        <span style={{ fontSize: 12, color: T.muted }}>{e.time}</span>
                      </div>
                      {e.note ? <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: T.inkSoft }}>{e.note}</p>
                        : <p style={{ margin: 0, fontSize: 14, color: T.muted, fontStyle: "italic" }}>후기 없이 완료</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   함께 — 나눔 · 방 · 쪽지
────────────────────────────────────────────── */
function Community(ctx) {
  const [sub, setSub] = useState("feed");
  const [invite, setInvite] = useState(false);
  const unread = ctx.threads.reduce((n, t) => n + t.unread, 0);
  const tabs = [
    { k: "feed", label: "나눔" },
    { k: "rooms", label: "방" },
    { k: "dm", label: "쪽지", badge: unread },
  ];
  return (
    <div>
      <div style={{ padding: "40px 16px 12px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: serif, fontSize: 27.5, fontWeight: 700, color: T.ink, margin: 0 }}>함께</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: T.muted }}>지체들과 하루를 나누고 서로를 세워요</p>
        </div>
        <button onClick={() => setInvite(true)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.ink, color: "#fff", borderRadius: 999, padding: "8px 13px", fontSize: 14, fontWeight: 700 }}>
          <UserPlus size={14} /> 초대
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "0 16px 4px", position: "sticky", top: 0, background: T.paper, zIndex: 5 }}>
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setSub(t.k)} style={{ flex: 1, padding: "9px 0", borderRadius: 999, fontSize: 14, fontWeight: 700, background: sub === t.k ? T.ink : "transparent", color: sub === t.k ? "#fff" : T.muted, border: `1px solid ${sub === t.k ? T.ink : T.line}`, position: "relative" }}>
            {t.label}
            {t.badge > 0 && <span style={{ position: "absolute", top: 4, right: 12, minWidth: 15, height: 15, borderRadius: 999, background: T.rose, color: "#fff", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ paddingTop: 12 }}>
        {sub === "feed" && <Feed {...ctx} />}
        {sub === "rooms" && <Rooms {...ctx} />}
        {sub === "dm" && <Messages {...ctx} />}
      </div>

      {invite && <InviteSheet onClose={() => setInvite(false)} />}
    </div>
  );
}

function Feed({ posts, setPosts, award }) {
  const [text, setText] = useState("");
  const [writing, setWriting] = useState(false);
  const post = () => {
    if (!text.trim()) return;
    setPosts((ps) => [{ id: Date.now(), name: "믿음", init: "믿", time: "방금", text: text.trim(), amen: 0, amened: false }, ...ps]);
    setText(""); setWriting(false); award(10, "오늘의 나눔");
  };
  const amen = (id) => setPosts((ps) => ps.map((p) => { if (p.id !== id) return p; if (!p.amened) award(2, "아멘으로 격려"); return { ...p, amen: p.amened ? p.amen - 1 : p.amen + 1, amened: !p.amened }; }));

  return (
    <div>
      <div style={{ padding: "0 16px" }}>
        {!writing ? (
          <button onClick={() => setWriting(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, background: T.card, borderRadius: 14, padding: 13, border: `1px solid ${T.line}`, marginBottom: 16, textAlign: "left" }}>
            <Avatar init="믿" c={T.gold} /><span style={{ flex: 1, color: T.muted, fontSize: 14.5 }}>오늘 어떤 은혜가 있었나요?</span><PenLine size={17} color={T.gold} />
          </button>
        ) : (
          <div style={{ background: T.card, borderRadius: 14, padding: 14, border: `1px solid ${T.gold}`, marginBottom: 16, animation: "rise .3s ease" }}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} autoFocus rows={4} placeholder="오늘 묵상한 말씀, 마음에 남은 감정, 기도 제목을 나눠보세요."
              style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 15.5, lineHeight: 1.6, color: T.ink, background: "transparent" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, borderTop: `1px solid ${T.line}`, paddingTop: 11 }}>
              <button onClick={() => { setWriting(false); setText(""); }} style={{ fontSize: 14, color: T.muted, fontWeight: 500 }}>취소</button>
              <button onClick={post} style={{ background: T.ink, color: "#fff", padding: "8px 16px", borderRadius: 999, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><Send size={13} /> 올리기 · +10P</button>
            </div>
          </div>
        )}
        <div style={{ display: "grid", gap: 12, paddingBottom: 8 }}>
          {posts.map((p) => (
            <div key={p.id} style={{ background: T.card, borderRadius: 16, padding: 15, border: `1px solid ${T.line}`, boxShadow: "0 1px 6px rgba(32,42,68,.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar init={p.init} c={[T.gold, T.sage, T.rose, T.inkSoft][p.id % 4]} />
                <div><p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{p.name}</p><p style={{ margin: 0, fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} /> {p.time}</p></div>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.65, color: T.inkSoft }}>{p.text}</p>
              <button onClick={() => amen(p.id)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: p.amened ? T.rose : T.muted }}><Heart size={15} fill={p.amened ? T.rose : "none"} color={p.amened ? T.rose : T.muted} /> 아멘 {p.amen}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 방 (그룹) ── */
function Rooms({ rooms, setRooms, award }) {
  const [open, setOpen] = useState(null);
  const [creating, setCreating] = useState(false);
  if (open) { const room = rooms.find((r) => r.id === open); if (room) return <RoomDetail room={room} setRooms={setRooms} award={award} onBack={() => setOpen(null)} />; }

  return (
    <div style={{ padding: "0 16px" }}>
      <button onClick={() => setCreating(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: T.card, border: `1px dashed ${T.gold}`, borderRadius: 14, padding: 13, marginBottom: 14, fontSize: 14.5, fontWeight: 700, color: T.goldDeep }}>
        <Plus size={16} /> 새로운 방 만들기
      </button>

      <div style={{ display: "grid", gap: 11, paddingBottom: 8 }}>
        {rooms.map((r) => (
          <button key={r.id} onClick={() => { setOpen(r.id); setRooms((rs) => rs.map((x) => x.id === r.id ? { ...x, unread: 0 } : x)); }} style={{ width: "100%", textAlign: "left", background: T.card, borderRadius: 16, padding: 15, border: `1px solid ${T.line}`, boxShadow: "0 1px 6px rgba(32,42,68,.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${T.violet}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><DoorOpen size={21} color={T.violet} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: T.ink }}>{r.name}</p>
                  {r.mine && <span style={{ fontSize: 11.5, fontWeight: 700, color: T.sage, background: T.sageSoft, borderRadius: 999, padding: "1px 7px" }}>참여중</span>}
                </div>
                <p style={{ margin: "3px 0 0", fontSize: 13.5, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desc}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                {r.unread > 0 && <span style={{ minWidth: 18, height: 18, borderRadius: 999, background: T.rose, color: "#fff", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{r.unread}</span>}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 13.5, color: T.muted }}><Users size={13} /> {r.members}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {creating && <CreateRoomSheet onClose={() => setCreating(false)} onCreate={(name, desc) => { setRooms((rs) => [{ id: "r" + Date.now(), name, desc: desc || "함께 신앙을 나누는 방", members: 1, mine: true, feed: [] }, ...rs]); setCreating(false); }} />}
    </div>
  );
}

function RoomDetail({ room, setRooms, award, onBack }) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    setRooms((rs) => rs.map((r) => r.id === room.id ? { ...r, feed: [{ id: Date.now(), name: "믿음", init: "믿", c: T.gold, text: text.trim(), time: "방금" }, ...r.feed] } : r));
    setText(""); award(5, `${room.name}에 나눔`);
  };
  return (
    <div>
      <div style={{ padding: "0 16px 12px" }}>
        <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, color: T.muted, fontWeight: 500, marginBottom: 10 }}><ChevronLeft size={16} /> 방 목록</button>
        <div style={{ background: `linear-gradient(150deg, ${T.ink}, #3A335E)`, borderRadius: 16, padding: "16px 18px", color: "#fff", position: "relative", overflow: "hidden" }}>
          <StarField faint />
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={{ margin: 0, fontFamily: serif, fontSize: 21, fontWeight: 700 }}>{room.name}</p>
            <p style={{ margin: "3px 0 10px", fontSize: 13.5, opacity: .8 }}>{room.desc}</p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13.5, background: "rgba(255,255,255,.14)", borderRadius: 999, padding: "3px 10px" }}><Users size={12} /> {room.members}명 참여</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 8, background: T.card, borderRadius: 14, padding: 11, border: `1px solid ${T.line}`, marginBottom: 14 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="이 방에 오늘의 은혜를 나눠요" style={{ flex: 1, border: "none", outline: "none", fontSize: 14.5, color: T.ink, background: "transparent" }} />
          <button onClick={send} style={{ background: T.ink, color: "#fff", borderRadius: 999, padding: "0 14px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}><Send size={13} /> 나눔</button>
        </div>
        <div style={{ display: "grid", gap: 11, paddingBottom: 8 }}>
          {room.feed.length === 0 ? <Empty icon={DoorOpen} text={"아직 나눔이 없어요.\n첫 나눔을 남겨보세요."} /> : room.feed.map((p) => (
            <div key={p.id} style={{ background: T.card, borderRadius: 14, padding: 14, border: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <Avatar init={p.init} c={p.c} />
                <div><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}>{p.name}</p><p style={{ margin: 0, fontSize: 11.5, color: T.muted }}>{p.time}</p></div>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.inkSoft }}>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateRoomSheet({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <Sheet onClose={onClose} accent={T.violet} title={<><DoorOpen size={16} color={T.violet} /> 새로운 방 만들기</>}>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: T.muted }}>함께 신앙을 나눌 방을 만들어 친구를 초대해요.</p>
      <Field icon={DoorOpen} label="방 이름" placeholder="예 · 우리 구역 새벽기도" value={name} onChange={setName} />
      <Field icon={PenLine} label="방 소개 (선택)" placeholder="어떤 방인지 한 줄로 알려주세요" value={desc} onChange={setDesc} />
      <button onClick={() => name.trim() && onCreate(name.trim(), desc.trim())} disabled={!name.trim()} style={{ width: "100%", padding: "13px 0", marginTop: 6, borderRadius: 12, fontSize: 16, fontWeight: 700, background: name.trim() ? T.violet : T.line, color: name.trim() ? "#fff" : T.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        <Plus size={15} /> 방 만들기
      </button>
    </Sheet>
  );
}

/* ── 쪽지 (1:1) ── */
function Messages({ threads, setThreads }) {
  const [open, setOpen] = useState(null);
  if (open) { const th = threads.find((t) => t.id === open); if (th) return <Thread thread={th} setThreads={setThreads} onBack={() => setOpen(null)} />; }

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ display: "grid", gap: 9, paddingBottom: 8 }}>
        {threads.map((t) => {
          const last = t.msgs[t.msgs.length - 1];
          return (
            <button key={t.id} onClick={() => { setOpen(t.id); setThreads((ts) => ts.map((x) => x.id === t.id ? { ...x, unread: 0 } : x)); }} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, background: T.card, borderRadius: 14, padding: 13, border: `1px solid ${T.line}` }}>
              <Avatar init={t.init} c={t.c} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: T.ink }}>{t.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13.5, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{last.me ? "나 · " : ""}{last.text}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 11.5, color: T.muted }}>{last.time}</p>
                {t.unread > 0 && <span style={{ display: "inline-block", marginTop: 4, minWidth: 17, height: 17, borderRadius: 999, background: T.rose, color: "#fff", fontSize: 11.5, fontWeight: 700, lineHeight: "17px" }}>{t.unread}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Thread({ thread, setThreads, onBack }) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    setThreads((ts) => ts.map((t) => t.id === thread.id ? { ...t, msgs: [...t.msgs, { me: true, text: text.trim(), time: "방금" }] } : t));
    setText("");
  };
  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: `1px solid ${T.line}`, marginBottom: 14 }}>
        <button onClick={onBack} style={{ padding: 2 }}><ChevronLeft size={22} color={T.muted} /></button>
        <Avatar init={thread.init} c={thread.c} />
        <p style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: T.ink }}>{thread.name}</p>
      </div>

      <div style={{ display: "grid", gap: 9, paddingBottom: 12 }}>
        {thread.msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.me ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "75%" }}>
              <div style={{ background: m.me ? T.ink : T.card, color: m.me ? "#fff" : T.ink, border: m.me ? "none" : `1px solid ${T.line}`, borderRadius: m.me ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 13px", fontSize: 14.5, lineHeight: 1.55 }}>{m.text}</div>
              <p style={{ margin: "3px 6px 0", fontSize: 11.5, color: T.muted, textAlign: m.me ? "right" : "left" }}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, position: "sticky", bottom: 8, background: T.paper, paddingTop: 6 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="쪽지를 입력하세요" style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: 999, padding: "11px 15px", fontSize: 14.5, color: T.ink, outline: "none", background: T.card }} />
        <button onClick={send} style={{ width: 44, height: 44, borderRadius: 999, background: T.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Send size={17} /></button>
      </div>
    </div>
  );
}

/* ── 알림 ── */
function NotifSheet({ threads, rooms, onClose, onGo }) {
  const items = [
    ...rooms.filter((r) => r.unread > 0).map((r) => ({ id: "r" + r.id, kind: "room", title: r.name, text: `새 나눔 ${r.unread}개가 올라왔어요`, icon: DoorOpen, c: T.violet })),
    ...threads.filter((t) => t.unread > 0).map((t) => ({ id: "t" + t.id, kind: "dm", title: `${t.name}님의 쪽지`, text: t.msgs[t.msgs.length - 1].text, icon: MessageCircle, c: t.c })),
  ];
  return (
    <Sheet onClose={onClose} accent={T.rose} title={<><Bell size={16} color={T.rose} /> 알림</>}>
      {items.length === 0 ? (
        <Empty icon={Bell} text={"새로운 알림이 없어요.\n지체들의 소식이 오면 여기에 표시돼요."} />
      ) : (
        <div style={{ display: "grid", gap: 9 }}>
          <p style={{ margin: "0 0 2px", fontSize: 13.5, color: T.muted }}>읽지 않은 소식 {items.length}건</p>
          {items.map((it) => {
            const Ic = it.icon;
            return (
              <button key={it.id} onClick={onGo} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11, background: T.card, borderRadius: 13, padding: "12px 13px", border: `1px solid ${T.line}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${it.c}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic size={17} color={it.c} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{it.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13.5, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.text}</p>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: it.kind === "room" ? T.violet : T.rose, background: it.kind === "room" ? `${T.violet}12` : `${T.rose}12`, borderRadius: 999, padding: "3px 8px", flexShrink: 0 }}>{it.kind === "room" ? "방" : "쪽지"}</span>
              </button>
            );
          })}
          <button onClick={onGo} style={{ width: "100%", marginTop: 4, padding: "12px 0", borderRadius: 12, fontSize: 14.5, fontWeight: 700, background: T.ink, color: "#fff" }}>함께 탭에서 보기</button>
        </div>
      )}
    </Sheet>
  );
}

/* ── 앱 초대 / 공유 ── */
function InviteSheet({ onClose, share }) {
  const [copied, setCopied] = useState(false);
  const link = "https://dawn.worship/invite/BELIEVE24";
  const copy = () => { try { navigator.clipboard?.writeText(link); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const opts = [
    { label: "카카오톡", c: "#FEE500", t: "#3A1D1D" },
    { label: "문자", c: T.sage, t: "#fff" },
    { label: "링크 복사", c: T.ink, t: "#fff" },
  ];
  return (
    <Sheet onClose={onClose} accent={T.gold} title={share ? <><Share2 size={16} color={T.gold} /> 앱 공유하기</> : <><UserPlus size={16} color={T.gold} /> 친구 초대하기</>}>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
        {share ? "이 앱을 다른 분에게 공유해보세요. 링크를 받은 친구도 함께 매일의 신앙 훈련을 시작할 수 있어요." : "초대 링크나 코드를 나누면, 친구도 함께 매일의 신앙 훈련을 시작할 수 있어요."}
      </p>

      <div style={{ background: `linear-gradient(150deg, #FFFDF7, ${T.goldSoft})`, borderRadius: 16, padding: "18px 16px", border: `1px solid ${T.goldSoft}`, textAlign: "center", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: T.goldDeep, fontWeight: 700 }}>나의 초대 코드</p>
        <p style={{ margin: "6px 0 0", fontFamily: serif, fontSize: 33, fontWeight: 700, letterSpacing: 4, color: T.ink }}>BELIEVE24</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, borderRadius: 12, padding: "11px 14px", border: `1px solid ${T.line}`, marginBottom: 16 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</span>
        <button onClick={copy} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13.5, fontWeight: 700, color: copied ? T.sage : T.ink, flexShrink: 0 }}>
          {copied ? <><Check size={14} /> 복사됨</> : <><Copy size={14} /> 복사</>}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {opts.map((o) => (
          <button key={o.label} onClick={o.label === "링크 복사" ? copy : undefined} style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: o.c, color: o.t, fontSize: 14, fontWeight: 700 }}>{o.label}</button>
        ))}
      </div>
      <p style={{ margin: "12px 2px 0", fontSize: 12, color: T.muted, textAlign: "center" }}>* 카카오톡·문자 연동은 실제 배포 시 연결돼요</p>
    </Sheet>
  );
}

/* ─────────────────────────────────────────────
   포인트
────────────────────────────────────────────── */
function Points({ points, log, earnedFruits, growingFruit, growStep, selectFruit, growAction, harvestFruit }) {
  const { current, prevPt } = stageInfo(points);
  const span = current.pt - prevPt;
  const pct = span > 0 ? Math.min(100, ((points - prevPt) / span) * 100) : 100;
  const week = [45, 30, 60, 0, 40, 0, points % 60];
  const [fruitOpen, setFruitOpen] = useState(false);

  return (
    <div>
      <Header title="포인트" subtitle="꾸준함이 자라 열매가 됩니다" />
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: `linear-gradient(160deg, ${T.ink}, #3A335E)`, borderRadius: 18, padding: "22px 20px", color: "#fff", marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <StarField faint />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}><span style={{ fontSize: 17.5 }}>{current.emoji}</span><span style={{ fontSize: 14, color: T.gold, fontWeight: 700, letterSpacing: .5 }}>{current.stage} · {current.label}</span></div>
            <div style={{ fontFamily: serif, fontSize: 41.5, fontWeight: 700, lineHeight: 1 }}>{points}<span style={{ fontSize: 17.5, marginLeft: 4, opacity: .7 }}>P</span></div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: .8, marginBottom: 6 }}><span>다음 · {current.label}</span><span>{points >= current.pt ? "달성 ✦" : `${current.pt - points}P 남음 · 꾸준함 ${current.day}`}</span></div>
              <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,.15)" }}><div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${T.gold}, ${T.goldGlow})`, transition: "width .6s ease" }} /></div>
            </div>
          </div>
        </div>

        <div style={{ background: T.card, borderRadius: 16, padding: 16, border: `1px solid ${T.line}`, marginBottom: 16 }}>
          <p style={{ margin: "0 0 13px", fontSize: 14, fontWeight: 700, color: T.ink }}>이번 주 활동</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 80 }}>
            {week.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: "100%", height: `${Math.max(6, (v / 60) * 100)}%`, borderRadius: 5, background: i === 6 ? T.gold : v ? T.sageSoft : "#F1EDE3", transition: "height .5s ease" }} />
                <span style={{ fontSize: 11.5, color: T.muted }}>{["월", "화", "수", "목", "금", "토", "일"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setFruitOpen(true)} style={{ width: "100%", textAlign: "left", background: `linear-gradient(150deg, #F6F1FA, #EFE7F5)`, borderRadius: 16, padding: 16, border: `1px solid #E3DAF0`, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24.5, flexShrink: 0, boxShadow: "0 2px 8px rgba(124,107,176,.2)" }}>🍇</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.ink }}>성령의 아홉 열매 도전</p>
            <p style={{ margin: "2px 0 6px", fontSize: 13, color: T.violet }}>열매를 하나씩 키워 뱃지를 모아요 · {earnedFruits.length}/9 수확</p>
            <div style={{ display: "flex", gap: 3 }}>
              {FRUITS.map((f) => (
                <span key={f.key} style={{ fontSize: 14, opacity: earnedFruits.includes(f.key) ? 1 : .28, filter: earnedFruits.includes(f.key) ? "none" : "grayscale(1)" }}>{f.emoji}</span>
              ))}
            </div>
          </div>
          <ChevronRight size={18} color={T.violet} style={{ flexShrink: 0 }} />
        </button>

        <div style={{ background: T.card, borderRadius: 16, padding: "16px 16px 6px", border: `1px solid ${T.line}`, marginBottom: 16 }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: T.ink }}>믿음의 성장 여정</p>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: T.muted }}>{growingFruit ? `지금 키우는 열매 · ${FRUIT[growingFruit].emoji} ${FRUIT[growingFruit].name}` : "밭을 고르고 씨를 뿌려, 자라 열매 맺기까지"}</p>
          {STAGES.map((s, si) => {
            const allDone = s.steps.every((st) => points >= st.pt);
            const isCurrent = s.stage === stageInfo(points).current.stage;
            const started = points >= (si === 0 ? 0 : STAGES[si - 1].steps[STAGES[si - 1].steps.length - 1].pt);
            return (
              <div key={s.stage} style={{ display: "flex", gap: 11, marginBottom: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, background: allDone ? T.sage : isCurrent ? T.goldSoft : "#F1EDE3", border: isCurrent ? `2px solid ${T.gold}` : "none", opacity: started ? 1 : .5 }}>
                    {allDone ? <Check size={17} color="#fff" /> : s.emoji}
                  </div>
                  {si < STAGES.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: allDone ? T.sage : T.line, marginTop: 2 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: started ? T.ink : T.muted }}>{s.stage}</span>
                    {allDone ? <Tag c={T.sage} bg={T.sageSoft}>완료</Tag> : isCurrent ? <Tag c={T.goldDeep} bg={T.goldSoft}>진행중</Tag> : !started ? <Tag c={T.muted} bg="#F1EDE3"><Lock size={9} /> 잠김</Tag> : null}
                  </div>
                  <div style={{ display: "grid", gap: 5, marginTop: 7 }}>
                    {s.steps.map((st) => {
                      const d = points >= st.pt;
                      return (
                        <div key={st.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 15, height: 15, borderRadius: 999, flexShrink: 0, background: d ? T.sage : "transparent", border: d ? "none" : `2px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{d && <Check size={9} color="#fff" />}</span>
                          <span style={{ fontSize: 14, color: d ? T.ink : T.muted, fontWeight: d ? 600 : 400 }}>{st.label}</span>
                          <span style={{ fontSize: 11.5, color: T.muted, marginLeft: "auto" }}>누적 {st.pt}P · 꾸준함 {st.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ margin: "0 0 11px", fontSize: 14, fontWeight: 700, color: T.ink }}>적립 내역</p>
        {log.length === 0 ? (
          <Empty icon={Feather} text={"아직 오늘의 첫 걸음 전이에요.\n홈에서 훈련을 시작해 보세요."} />
        ) : (
          <div style={{ display: "grid", gap: 7, paddingBottom: 6 }}>
            {log.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T.card, borderRadius: 11, padding: "11px 14px", border: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: T.goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={14} color={T.gold} /></div>
                  <div><p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: T.ink }}>{e.label}</p><p style={{ margin: 0, fontSize: 11.5, color: T.muted }}>{e.time}</p></div>
                </div>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: T.sage }}>+{e.pts}P</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {fruitOpen && <FruitChallenge onClose={() => setFruitOpen(false)} earnedFruits={earnedFruits} growingFruit={growingFruit} growStep={growStep} selectFruit={selectFruit} growAction={growAction} harvestFruit={harvestFruit} />}
    </div>
  );
}

function FruitChallenge({ onClose, earnedFruits, growingFruit, growStep, selectFruit, growAction, harvestFruit }) {
  const earned = new Set(earnedFruits);
  const allDone = earned.size === FRUITS.length;
  const growing = growingFruit ? FRUIT[growingFruit] : null;

  return (
    <Sheet onClose={onClose} accent={T.violet} title={<>🍇 성령의 아홉 열매</>}>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
        열매 하나를 골라 키우고, 수확하면 그 열매의 뱃지를 받아요. 아홉 열매를 모두 거두면 <b style={{ color: T.violet }}>‘성령의 아홉 열매’</b> 뱃지를 얻어요.
      </p>

      {allDone && (
        <div style={{ background: `linear-gradient(150deg, ${T.gold}, ${T.goldDeep})`, borderRadius: 16, padding: "20px 16px", textAlign: "center", color: "#fff", marginBottom: 16 }}>
          <div style={{ fontSize: 37.5 }}>🍇</div>
          <p style={{ margin: "6px 0 2px", fontFamily: serif, fontSize: 19.5, fontWeight: 700 }}>성령의 아홉 열매 완성!</p>
          <p style={{ margin: 0, fontSize: 13.5, opacity: .9 }}>사랑·희락·화평·인내·자비·양선·충성·온유·절제를 모두 거두었어요 ✦</p>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.ink, whiteSpace: "nowrap" }}>수확 {earned.size} / 9</span>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: "#F1EDE3", marginLeft: 12 }}>
          <div style={{ width: `${(earned.size / 9) * 100}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${T.violet}, ${T.gold})`, transition: "width .5s ease" }} />
        </div>
      </div>

      {growing && (
        <div style={{ background: `${growing.c}0F`, borderRadius: 16, padding: 16, border: `1px solid ${growing.c}33`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 28.5 }}>{growing.emoji}</span>
            <div>
              <p style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: T.ink }}>{growing.name} 열매 키우는 중</p>
              <p style={{ margin: "1px 0 0", fontSize: 13, color: T.muted }}>물과 양분을 주고 수확해요</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {GROW_STEPS.map((s, i) => {
              const passed = i < growStep, now = i === growStep;
              return (
                <div key={s} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: 5, borderRadius: 999, background: passed ? growing.c : now ? `${growing.c}66` : "#EDE8DC", marginBottom: 5 }} />
                  <span style={{ fontSize: 11.5, fontWeight: now ? 700 : 400, color: passed || now ? growing.c : T.muted }}>{s}</span>
                </div>
              );
            })}
          </div>
          {growStep < 2 ? (
            <button onClick={growAction} style={{ width: "100%", padding: "12px 0", borderRadius: 12, fontSize: 15.5, fontWeight: 700, background: growing.c, color: "#fff" }}>
              {growStep === 0 ? "💧 물 주기" : "🍃 양분 주기"}
            </button>
          ) : (
            <button onClick={harvestFruit} style={{ width: "100%", padding: "12px 0", borderRadius: 12, fontSize: 15.5, fontWeight: 700, background: T.gold, color: "#fff" }}>
              🧺 {growing.name} 수확하기 · +50P
            </button>
          )}
        </div>
      )}

      {!growing && !allDone && (
        <p style={{ margin: "0 0 10px", fontSize: 14, color: T.violet, fontWeight: 600, textAlign: "center" }}>키울 열매를 하나 선택하세요 👇</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, paddingBottom: 6 }}>
        {FRUITS.map((f) => {
          const isEarned = earned.has(f.key);
          const isGrowing = growingFruit === f.key;
          const selectable = !growingFruit && !isEarned;
          return (
            <button key={f.key} onClick={() => selectable && selectFruit(f.key)} disabled={!selectable}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "14px 6px", borderRadius: 14, position: "relative",
                background: isEarned ? `${f.c}14` : isGrowing ? `${f.c}0F` : T.card,
                border: isGrowing ? `2px solid ${f.c}` : `1px solid ${isEarned ? `${f.c}55` : T.line}`,
                opacity: (!selectable && !isEarned && !isGrowing) ? .55 : 1 }}>
              <span style={{ fontSize: 26.5, filter: isEarned || isGrowing ? "none" : "grayscale(.4)" }}>{f.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: isEarned || isGrowing ? T.ink : T.muted }}>{f.name}</span>
              {isEarned ? (
                <span style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 999, background: f.c, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={11} color="#fff" /></span>
              ) : isGrowing ? (
                <span style={{ fontSize: 11.5, fontWeight: 700, color: f.c, background: `${f.c}1A`, borderRadius: 999, padding: "1px 7px" }}>키우는 중</span>
              ) : selectable ? (
                <span style={{ fontSize: 11.5, color: T.violet, fontWeight: 600 }}>선택하기</span>
              ) : (
                <span style={{ fontSize: 11.5, color: T.muted }}>대기</span>
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ─────────────────────────────────────────────
   내 정보 · 회원가입
────────────────────────────────────────────── */
function Me({ user, setUser, points }) {
  if (user) return <Profile user={user} points={points} onOut={() => setUser(null)} />;
  return <SignUp onDone={setUser} />;
}

function Profile({ user, points, onOut }) {
  const st = stageInfo(points).current;
  const [invite, setInvite] = useState(false);
  return (
    <div>
      <div style={{ background: `linear-gradient(170deg, ${T.ink}, #3A335E)`, padding: "40px 24px 28px", color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <StarField />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ width: 66, height: 66, borderRadius: 999, background: T.gold, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, color: T.ink, fontFamily: serif }}>{user.name[0]}</div>
          <h2 style={{ fontFamily: serif, fontSize: 23, margin: 0 }}>{user.name}님</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 7, background: "rgba(255,255,255,.14)", padding: "4px 13px", borderRadius: 999, fontSize: 13.5 }}><ShieldCheck size={13} color={T.gold} /> 본인인증 완료 · {st.emoji} {st.stage}</div>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <button onClick={() => setInvite(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: `linear-gradient(150deg, #FFFDF7, ${T.goldSoft})`, border: `1px solid ${T.goldSoft}`, borderRadius: 14, padding: 15, marginBottom: 16, textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><UserPlus size={20} color="#fff" /></div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.ink }}>친구 초대하기</p>
            <p style={{ margin: "2px 0 0", fontSize: 13.5, color: T.goldDeep }}>함께 매일의 신앙 훈련을 시작해요</p>
          </div>
          <ChevronRight size={18} color={T.goldDeep} />
        </button>
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.line}`, overflow: "hidden", marginBottom: 16 }}>
          <InfoRow icon={Mail} label="이메일" value={user.email} />
          <InfoRow icon={Phone} label="전화번호" value={user.phone} />
          <InfoRow icon={Calendar} label="생년월일" value={user.birth} last />
        </div>
        <button onClick={onOut} style={{ width: "100%", padding: "12px 0", borderRadius: 11, fontSize: 14.5, fontWeight: 700, color: T.rose, background: T.card, border: `1px solid ${T.line}` }}>로그아웃</button>
      </div>
      {invite && <InviteSheet onClose={() => setInvite(false)} />}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", borderBottom: last ? "none" : `1px solid ${T.line}` }}>
      <Icon size={18} color={T.gold} />
      <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 12, color: T.muted }}>{label}</p><p style={{ margin: "1px 0 0", fontSize: 15.5, color: T.ink, fontWeight: 500 }}>{value}</p></div>
    </div>
  );
}

function SignUp({ onDone }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", birth: "" });
  const [sent, setSent] = useState({ email: false, phone: false });
  const [code, setCode] = useState({ email: "", phone: "" });
  const [ok, setOk] = useState({ email: false, phone: false });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const steps = ["약관", "이메일 인증", "휴대폰 인증", "정보 입력"];

  return (
    <div>
      <Header title="회원가입" subtitle="크리스천 지체로 함께해요" />
      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 4, borderRadius: 999, background: i <= step ? T.gold : T.line, transition: "background .3s" }} />
              <p style={{ margin: "5px 0 0", fontSize: 11.5, textAlign: "center", color: i <= step ? T.ink : T.muted, fontWeight: i === step ? 700 : 400 }}>{s}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 9, background: T.goldSoft, borderRadius: 11, padding: "11px 13px", marginBottom: 18 }}>
          <ShieldCheck size={17} color={T.gold} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 13, color: T.ink, lineHeight: 1.5 }}>이메일·휴대폰·생년월일로 본인인증을 진행해요. <b>지금은 데모</b>라 인증번호에 아무 숫자나 넣어도 통과돼요.</p>
        </div>

        {step === 0 && (
          <div>
            <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.line}`, padding: 16, marginBottom: 16 }}>
              {["만 14세 이상이며 서비스 이용약관에 동의합니다.", "개인정보 수집·이용에 동의합니다.", "본인 명의의 정보로 인증함에 동의합니다."].map((t, i) => (
                <label key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderBottom: i < 2 ? `1px solid ${T.line}` : "none", cursor: "pointer" }}>
                  <span style={{ width: 19, height: 19, borderRadius: 6, background: T.sage, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><Check size={12} color="#fff" /></span>
                  <span style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.5 }}>{t}</span>
                </label>
              ))}
            </div>
            <NextBtn onClick={() => setStep(1)}>동의하고 시작하기</NextBtn>
          </div>
        )}
        {step === 1 && <VerifyStep icon={Mail} label="이메일" placeholder="name@example.com" type="email" value={form.email} onChange={(v) => set("email", v)} sent={sent.email} onSend={() => setSent((s) => ({ ...s, email: true }))} code={code.email} onCode={(v) => setCode((c) => ({ ...c, email: v }))} ok={ok.email} onVerify={() => setOk((o) => ({ ...o, email: true }))} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <VerifyStep icon={Phone} label="휴대폰 번호" placeholder="010-0000-0000" type="tel" value={form.phone} onChange={(v) => set("phone", v)} sent={sent.phone} onSend={() => setSent((s) => ({ ...s, phone: true }))} code={code.phone} onCode={(v) => setCode((c) => ({ ...c, phone: v }))} ok={ok.phone} onVerify={() => setOk((o) => ({ ...o, phone: true }))} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && (
          <div>
            <Field icon={User} label="이름" placeholder="홍길동" value={form.name} onChange={(v) => set("name", v)} />
            <Field icon={Calendar} label="생년월일" placeholder="YYYY-MM-DD" value={form.birth} onChange={(v) => set("birth", v)} />
            <div style={{ background: T.sageSoft, borderRadius: 11, padding: "11px 13px", margin: "4px 0 16px", display: "flex", gap: 8, alignItems: "center" }}><ShieldCheck size={16} color={T.sage} /><span style={{ fontSize: 13.5, color: "#3E5A44", fontWeight: 500 }}>이메일·휴대폰 인증 완료됨</span></div>
            <div style={{ display: "flex", gap: 9 }}>
              <BackBtn onClick={() => setStep(2)} />
              <NextBtn disabled={!form.name || !form.birth} onClick={() => onDone({ name: form.name, email: form.email || "name@example.com", phone: form.phone || "010-0000-0000", birth: form.birth })}>가입 완료</NextBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VerifyStep({ icon, label, placeholder, type, value, onChange, sent, onSend, code, onCode, ok, onVerify, onNext, onBack }) {
  return (
    <div>
      <div style={{ marginBottom: 13 }}>
        <p style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, color: T.ink }}>{label}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 13px" }}>
            {React.createElement(icon, { size: 17, color: T.gold })}
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, border: "none", outline: "none", padding: "12px 0", fontSize: 15.5, color: T.ink, background: "transparent" }} />
          </div>
          <button onClick={onSend} disabled={!value} style={{ padding: "0 15px", borderRadius: 11, background: value ? T.ink : T.line, color: value ? "#fff" : T.muted, fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{sent ? "재발송" : "인증요청"}</button>
        </div>
      </div>
      {sent && (
        <div style={{ marginBottom: 16, animation: "rise .3s ease" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={code} onChange={(e) => onCode(e.target.value)} placeholder="인증번호 6자리" inputMode="numeric" style={{ flex: 1, border: `1px solid ${ok ? T.sage : T.line}`, outline: "none", borderRadius: 11, padding: "12px 13px", fontSize: 15.5, color: T.ink, background: T.card, letterSpacing: 2 }} />
            <button onClick={onVerify} disabled={!code} style={{ padding: "0 15px", borderRadius: 11, background: ok ? T.sage : (code ? T.gold : T.line), color: code || ok ? "#fff" : T.muted, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>{ok ? <><Check size={14} /> 완료</> : "확인"}</button>
          </div>
          {ok && <p style={{ margin: "7px 2px 0", fontSize: 13, color: T.sage, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}><ShieldCheck size={12} /> 인증되었어요</p>}
        </div>
      )}
      <div style={{ display: "flex", gap: 9 }}><BackBtn onClick={onBack} /><NextBtn disabled={!ok} onClick={onNext}>다음</NextBtn></div>
    </div>
  );
}

function Field({ icon: Icon, label, placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <p style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, color: T.ink }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 13px" }}>
        <Icon size={17} color={T.gold} />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, border: "none", outline: "none", padding: "12px 0", fontSize: 15.5, color: T.ink, background: "transparent" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   공용
────────────────────────────────────────────── */
function Sheet({ children, onClose, title, accent }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(32,42,68,.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 45 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, maxHeight: "88vh", overflowY: "auto", background: T.paper, borderRadius: "22px 22px 0 0", padding: "20px 18px 26px", animation: "rise .3s ease", borderTop: accent ? `3px solid ${accent}` : "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: serif, fontSize: 19, fontWeight: 700, color: T.ink }}>{title}</span>
          <button onClick={onClose} style={{ padding: 5 }}><X size={21} color={T.muted} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div style={{ padding: "40px 16px 16px" }}>
      <h1 style={{ fontFamily: serif, fontSize: 27.5, fontWeight: 700, color: T.ink, margin: 0 }}>{title}</h1>
      <p style={{ margin: "4px 0 0", fontSize: 14, color: T.muted }}>{subtitle}</p>
    </div>
  );
}
function Empty({ icon: Icon, text }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, padding: "30px 20px", textAlign: "center", border: `1px dashed ${T.line}` }}>
      <Icon size={24} color={T.muted} style={{ margin: "0 auto 9px" }} />
      <p style={{ margin: 0, fontSize: 14, color: T.muted, lineHeight: 1.6, whiteSpace: "pre-line" }}>{text}</p>
    </div>
  );
}
function Avatar({ init, c }) {
  return <div style={{ width: 38, height: 38, borderRadius: 999, background: `${c}22`, color: c, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15.5, fontFamily: serif, flexShrink: 0 }}>{init}</div>;
}
function Tag({ children, c, bg }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 700, color: c, background: bg, borderRadius: 999, padding: "2px 8px" }}>{children}</span>;
}
function NextBtn({ children, onClick, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ flex: 1, padding: "14px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, background: disabled ? T.line : T.ink, color: disabled ? T.muted : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{children} <ChevronRight size={16} /></button>;
}
function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{ width: 50, borderRadius: 12, background: T.card, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={19} color={T.muted} /></button>;
}
function StarField({ faint }) {
  const stars = useMemo(() => Array.from({ length: 16 }, () => ({ x: Math.random() * 100, y: Math.random() * 100, s: Math.random() * 2 + 1, d: Math.random() * 3 })), []);
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>{stars.map((st, i) => <div key={i} style={{ position: "absolute", left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, borderRadius: 999, background: "#fff", opacity: faint ? .3 : .55, animation: `glow ${2 + st.d}s ease ${st.d}s infinite` }} />)}</div>;
}
function TabBar({ tab, setTab }) {
  const items = [
    { k: "home", label: "오늘", icon: Sunrise },
    { k: "journal", label: "신앙일기", icon: NotebookPen },
    { k: "community", label: "함께", icon: Users },
    { k: "points", label: "포인트", icon: Award },
    { k: "me", label: "내 정보", icon: User },
  ];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,.94)", backdropFilter: "blur(12px)", borderTop: `1px solid ${T.line}`, display: "flex", padding: "8px 4px calc(8px + env(safe-area-inset-bottom))", zIndex: 20 }}>
      {items.map((it) => {
        const on = tab === it.k; const Ic = it.icon;
        return (
          <button key={it.k} onClick={() => setTab(it.k)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "3px 0" }}>
            <Ic size={21} color={on ? T.ink : T.muted} strokeWidth={on ? 2.3 : 1.8} />
            <span style={{ fontSize: 11.5, fontWeight: on ? 700 : 500, color: on ? T.ink : T.muted }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}