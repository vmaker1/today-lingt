import React, { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import {
  Sunrise, BookOpen, Feather, HeartHandshake, Music, Church, Footprints,
  Sprout, Star, NotebookPen, MessageCircle, Award, User, Play, Check, Heart,
  Send, ChevronRight, ChevronLeft, Mail, Phone, Calendar, ShieldCheck,
  Sparkles, Flame, TreePine, X, PenLine, Clock, RotateCcw, Sun, CloudRain,
  Cloud, CloudSun, CloudLightning, Snowflake, CloudFog,
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
/* 믿음의 성장 여정 — "성실한 하루"(하루 60점 이상)를 며칠 쌓았는지로 자란다.
   하루에 몰아서 해도 하루는 하루! 꾸준히 매일 와야 다음 단계로 넘어가요. */
/* 하루 목표 점수 — 본인이 고를 수 있어요 (기본 60) */
const GOAL_OPTIONS = [
  { pts: 40,  emoji: "🌱", label: "가볍게", desc: "훈련 3~4개 · 부담 없이 매일" },
  { pts: 60,  emoji: "🔥", label: "꾸준히", desc: "훈련 5~6개 · 균형 잡힌 하루" },
  { pts: 100, emoji: "⚡", label: "깊이",   desc: "훈련 대부분 · 깊이 있는 하루" },
];
const DEFAULT_GOAL = 60;

const STAGES = [
  { stage: "밭 고르기", emoji: "⛏️", steps: [
    { label: "돌 고르기", days: 3 },
    { label: "비료 주기", days: 6 },
  ] },
  { stage: "씨앗", emoji: "🌰", steps: [
    { label: "물 주기", days: 11 },
    { label: "양분 주기", days: 16 },
  ] },
  { stage: "새싹", emoji: "🌱", steps: [
    { label: "물 주기", days: 26 },
    { label: "양분 주기", days: 36 },
  ] },
  { stage: "잎사귀", emoji: "🍃", steps: [
    { label: "물 주기", days: 56 },
    { label: "양분 주기", days: 76 },
  ] },
  { stage: "나무", emoji: "🌳", steps: [
    { label: "물 주기", days: 106 },
    { label: "양분 주기", days: 136 },
  ] },
  { stage: "열매", emoji: "🍎", steps: [
    { label: "수확하기", days: 146 },
  ] },
  { stage: "성령의 아홉 열매 도전", emoji: "🍇", steps: [
    { label: "새로운 작품 시작", days: 156 },
  ] },
];
const FLAT_STEPS = STAGES.flatMap((s) => s.steps.map((st) => ({ ...st, stage: s.stage, emoji: s.emoji })));
/* faithDays = 하루 60점 이상 달성한 날의 수 */
const stageInfo = (faithDays) => {
  const doneCount = FLAT_STEPS.filter((s) => faithDays >= s.days).length;
  const current = FLAT_STEPS.find((s) => faithDays < s.days) || FLAT_STEPS[FLAT_STEPS.length - 1];
  const prev = [...FLAT_STEPS].reverse().find((s) => faithDays >= s.days);
  return { current, prevDays: prev ? prev.days : 0, doneCount };
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

/* 오늘의 암송 구절 — 날짜에 따라 매일 바뀜
   ko: 개역한글(1961) · web: World English Bible · asv: American Standard Version
   세 번역 모두 저작권이 만료·포기된 공개 도메인이라 자유롭게 사용할 수 있어요. */
const VERSES = [
  { ref: "요한복음 3:16", refEn: "John 3:16",
    ko: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라",
    web: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.",
    asv: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth on him should not perish, but have eternal life." },
  { ref: "시편 23:1", refEn: "Psalm 23:1",
    ko: "여호와는 나의 목자시니 내가 부족함이 없으리로다",
    web: "Yahweh is my shepherd; I shall lack nothing.",
    asv: "Jehovah is my shepherd; I shall not want." },
  { ref: "빌립보서 4:13", refEn: "Philippians 4:13",
    ko: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라",
    web: "I can do all things through Christ, who strengthens me.",
    asv: "I can do all things in him that strengtheneth me." },
  { ref: "마태복음 11:28", refEn: "Matthew 11:28",
    ko: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라",
    web: "Come to me, all you who labor and are heavily burdened, and I will give you rest.",
    asv: "Come unto me, all ye that labor and are heavy laden, and I will give you rest." },
  { ref: "시편 119:105", refEn: "Psalm 119:105",
    ko: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다",
    web: "Your word is a lamp to my feet, and a light for my path.",
    asv: "Thy word is a lamp unto my feet, and light unto my path." },
  { ref: "이사야 41:10", refEn: "Isaiah 41:10",
    ko: "두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라 내가 너를 굳세게 하리라",
    web: "Don't you be afraid, for I am with you. Don't be dismayed, for I am your God. I will strengthen you.",
    asv: "Fear thou not, for I am with thee; be not dismayed, for I am thy God; I will strengthen thee." },
  { ref: "잠언 3:5", refEn: "Proverbs 3:5",
    ko: "너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라",
    web: "Trust in Yahweh with all your heart, and don't lean on your own understanding.",
    asv: "Trust in Jehovah with all thy heart, and lean not upon thine own understanding." },
  { ref: "로마서 8:28", refEn: "Romans 8:28",
    ko: "우리가 알거니와 하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라",
    web: "We know that all things work together for good for those who love God, for those who are called according to his purpose.",
    asv: "And we know that to them that love God all things work together for good, even to them that are called according to his purpose." },
  { ref: "빌립보서 4:6", refEn: "Philippians 4:6",
    ko: "아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라",
    web: "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.",
    asv: "In nothing be anxious; but in everything by prayer and supplication with thanksgiving let your requests be made known unto God." },
  { ref: "이사야 40:31", refEn: "Isaiah 40:31",
    ko: "오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리의 날개치며 올라감 같을 것이요",
    web: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles.",
    asv: "But they that wait for Jehovah shall renew their strength; they shall mount up with wings as eagles." },
  { ref: "고린도전서 13:4", refEn: "1 Corinthians 13:4",
    ko: "사랑은 오래 참고 사랑은 온유하며 투기하는 자가 되지 아니하며 사랑은 자랑하지 아니하며 교만하지 아니하며",
    web: "Love is patient and is kind. Love doesn't envy. Love doesn't brag, is not proud.",
    asv: "Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up." },
  { ref: "마태복음 6:33", refEn: "Matthew 6:33",
    ko: "너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라",
    web: "But seek first God's Kingdom and his righteousness; and all these things will be given to you as well.",
    asv: "But seek ye first his kingdom, and his righteousness; and all these things shall be added unto you." },
  { ref: "여호수아 1:9", refEn: "Joshua 1:9",
    ko: "마음을 강하게 하고 담대히 하라 두려워 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라",
    web: "Be strong and courageous. Don't be afraid. Don't be dismayed, for Yahweh your God is with you wherever you go.",
    asv: "Be strong and of good courage; be not affrighted, neither be thou dismayed: for Jehovah thy God is with thee whithersoever thou goest." },
  { ref: "시편 46:1", refEn: "Psalm 46:1",
    ko: "하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라",
    web: "God is our refuge and strength, a very present help in trouble.",
    asv: "God is our refuge and strength, a very present help in trouble." },
  { ref: "베드로전서 5:7", refEn: "1 Peter 5:7",
    ko: "너희 염려를 다 주께 맡겨 버리라 이는 저가 너희를 권고하심이니라",
    web: "Cast all your worries on him, because he cares for you.",
    asv: "Casting all your anxiety upon him, because he careth for you." },
  { ref: "갈라디아서 5:22", refEn: "Galatians 5:22",
    ko: "오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과",
    web: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith.",
    asv: "But the fruit of the Spirit is love, joy, peace, longsuffering, kindness, goodness, faithfulness." },
  { ref: "예레미야애가 3:22-23", refEn: "Lamentations 3:22-23",
    ko: "여호와의 인자와 긍휼이 무궁하시므로 우리가 진멸되지 아니함이니이다 이것이 아침마다 새로우니 주의 성실이 크도소이다",
    web: "It is because of Yahweh's loving kindnesses that we are not consumed, because his compassion doesn't fail. They are new every morning. Great is your faithfulness.",
    asv: "It is of Jehovah's lovingkindnesses that we are not consumed, because his compassions fail not. They are new every morning; great is thy faithfulness." },
  { ref: "마태복음 5:14", refEn: "Matthew 5:14",
    ko: "너희는 세상의 빛이라 산 위에 있는 동네가 숨기우지 못할 것이요",
    web: "You are the light of the world. A city located on a hill can't be hidden.",
    asv: "Ye are the light of the world. A city set on a hill cannot be hid." },
  { ref: "시편 27:1", refEn: "Psalm 27:1",
    ko: "여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요",
    web: "Yahweh is my light and my salvation. Whom shall I fear?",
    asv: "Jehovah is my light and my salvation; whom shall I fear?" },
  { ref: "잠언 16:3", refEn: "Proverbs 16:3",
    ko: "너의 행사를 여호와께 맡기라 그리하면 너의 경영하는 것이 이루리라",
    web: "Commit your deeds to Yahweh, and your plans shall succeed.",
    asv: "Commit thy works unto Jehovah, and thy purposes shall be established." },
  { ref: "데살로니가전서 5:16-18", refEn: "1 Thessalonians 5:16-18",
    ko: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이는 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라",
    web: "Always rejoice. Pray without ceasing. In everything give thanks, for this is the will of God in Christ Jesus toward you.",
    asv: "Rejoice always; pray without ceasing; in everything give thanks: for this is the will of God in Christ Jesus to you-ward." },
  { ref: "마태복음 28:20", refEn: "Matthew 28:20",
    ko: "볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라",
    web: "Behold, I am with you always, even to the end of the age.",
    asv: "and lo, I am with you always, even unto the end of the world." },
  { ref: "요한복음 13:34", refEn: "John 13:34",
    ko: "새 계명을 너희에게 주노니 서로 사랑하라 내가 너희를 사랑한 것 같이 너희도 서로 사랑하라",
    web: "A new commandment I give to you, that you love one another. Just as I have loved you, you also love one another.",
    asv: "A new commandment I give unto you, that ye love one another; even as I have loved you, that ye also love one another." },
  { ref: "히브리서 11:1", refEn: "Hebrews 11:1",
    ko: "믿음은 바라는 것들의 실상이요 보지 못하는 것들의 증거니",
    web: "Now faith is assurance of things hoped for, proof of things not seen.",
    asv: "Now faith is assurance of things hoped for, a conviction of things not seen." },
  { ref: "마태복음 25:40", refEn: "Matthew 25:40",
    ko: "너희가 여기 내 형제 중에 지극히 작은 자 하나에게 한 것이 곧 내게 한 것이니라",
    web: "Most certainly I tell you, because you did it to one of the least of these my brothers, you did it to me.",
    asv: "Verily I say unto you, Inasmuch as ye did it unto one of these my brethren, even these least, ye did it unto me." },
  { ref: "시편 121:1-2", refEn: "Psalm 121:1-2",
    ko: "내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올꼬 나의 도움이 천지를 지으신 여호와에게서로다",
    web: "I will lift up my eyes to the hills. Where does my help come from? My help comes from Yahweh, who made heaven and earth.",
    asv: "I will lift up mine eyes unto the mountains: From whence shall my help come? My help cometh from Jehovah, who made heaven and earth." },
  { ref: "고린도후서 12:9", refEn: "2 Corinthians 12:9",
    ko: "내 은혜가 네게 족하도다 이는 내 능력이 약한 데서 온전하여짐이라",
    web: "My grace is sufficient for you, for my power is made perfect in weakness.",
    asv: "My grace is sufficient for thee: for my power is made perfect in weakness." },
  { ref: "잠언 4:23", refEn: "Proverbs 4:23",
    ko: "무릇 지킬 만한 것보다 더욱 네 마음을 지키라 생명의 근원이 이에서 남이니라",
    web: "Keep your heart with all diligence, for out of it is the wellspring of life.",
    asv: "Keep thy heart with all diligence; for out of it are the issues of life." },
  { ref: "고린도전서 13:13", refEn: "1 Corinthians 13:13",
    ko: "그런즉 믿음, 소망, 사랑 이 세 가지는 항상 있을 것인데 그 중의 제일은 사랑이라",
    web: "But now faith, hope, and love remain—these three. The greatest of these is love.",
    asv: "But now abideth faith, hope, love, these three; and the greatest of these is love." },
  { ref: "시편 37:5", refEn: "Psalm 37:5",
    ko: "너의 길을 여호와께 맡기라 저를 의지하면 저가 이루시고",
    web: "Commit your way to Yahweh. Trust also in him, and he will do this.",
    asv: "Commit thy way unto Jehovah; Trust also in him, and he will bring it to pass." },
];
const BIBLE_VERSIONS = [
  { key: "ko", label: "개역한글" },
  { key: "web", label: "WEB" },
  { key: "asv", label: "ASV" },
];
/* 오늘 날짜 기준으로 구절 고르기 (매일 자동으로 바뀜) */
const dayIndex = () => Math.floor((Date.now() + 9 * 3600e3) / 86400e3); // 한국 기준 일수
const todayKey = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // YYYY-MM-DD (한국)
const TODAY_VERSE = VERSES[dayIndex() % VERSES.length];

/* 오늘 날씨 — Open-Meteo (무료 · API키 불필요 · 실제 데이터) */
const WMO = (c) => {
  if (c === 0) return { label: "맑음", icon: Sun };
  if (c <= 2) return { label: "구름 조금", icon: CloudSun };
  if (c === 3) return { label: "흐림", icon: Cloud };
  if (c <= 48) return { label: "안개", icon: CloudFog };
  if (c <= 57) return { label: "이슬비", icon: CloudRain };
  if (c <= 67) return { label: "비", icon: CloudRain };
  if (c <= 77) return { label: "눈", icon: Snowflake };
  if (c <= 82) return { label: "소나기", icon: CloudRain };
  if (c <= 86) return { label: "눈", icon: Snowflake };
  return { label: "천둥번개", icon: CloudLightning };
};

const SEOUL = { lat: 37.5665, lon: 126.978, region: "서울" };

/* 좌표 → 지역 이름 (BigDataCloud · 무료 · 키 불필요) */
async function regionName(lat, lon) {
  try {
    const r = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`
    );
    const j = await r.json();
    return j.city || j.locality || j.principalSubdivision || "현재 위치";
  } catch { return "현재 위치"; }
}

function useWeather() {
  const [w, setW] = useState(null);   // 못 받아오면 null → 화면에 아예 안 나옴

  useEffect(() => {
    let dead = false;

    const load = async (lat, lon, region) => {
      try {
        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );
        const j = await r.json();
        const c = j?.current;
        if (dead || !c || typeof c.temperature_2m !== "number") return;
        setW({ region, temp: Math.round(c.temperature_2m), ...WMO(c.weather_code) });
      } catch { /* 실패하면 조용히 숨김 */ }
    };

    const useSeoul = () => load(SEOUL.lat, SEOUL.lon, SEOUL.region);

    (async () => {
      // 1) 전에 받아둔 위치가 있으면 그대로 사용 (팝업 안 뜸)
      try {
        const cached = JSON.parse(localStorage.getItem("tl_geo") || "null");
        if (cached && Date.now() - cached.at < 1000 * 60 * 60 * 24 * 7) {   // 7일간 유효
          load(cached.lat, cached.lon, cached.region);
          return;
        }
      } catch {}

      // 2) 전에 위치를 거부했으면 다시 묻지 않고 서울
      try { if (localStorage.getItem("tl_geo_denied") === "1") { useSeoul(); return; } } catch {}

      if (!navigator.geolocation) { useSeoul(); return; }

      navigator.geolocation.getCurrentPosition(
        async (p) => {
          const { latitude: lat, longitude: lon } = p.coords;
          const region = await regionName(lat, lon);
          try { localStorage.setItem("tl_geo", JSON.stringify({ lat, lon, region, at: Date.now() })); } catch {}
          load(lat, lon, region);
        },
        (err) => {
          // 사용자가 거부(PERMISSION_DENIED = 1) → 다신 안 물어봄
          if (err && err.code === 1) { try { localStorage.setItem("tl_geo_denied", "1"); } catch {} }
          useSeoul();
        },
        { timeout: 6000, maximumAge: 1000 * 60 * 30 }
      );
    })();

    return () => { dead = true; };
  }, []);

  return w;
}

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

/* 커뮤니티 — 아직 DB 연결 전. 지금은 샘플(데모) 화면이에요 */
const SEED_POSTS = [
  { id: 1, name: "김은혜", init: "은", time: "오늘 06:20", text: "새벽에 시편 143편으로 큐티했어요. 아침에 주의 인자를 듣게 해달라는 구절이 하루를 붙잡아 주네요.", amen: 12, amened: false },
  { id: 2, name: "이믿음", init: "믿", time: "오늘 07:05", text: "요즘 마음이 무거웠는데 오늘 나눔 들으며 위로받았습니다. 함께 기도해 주세요 🙏", amen: 8, amened: false },
  { id: 3, name: "박소망", init: "소", time: "어제 21:40", text: "감사 노트 3주째. 작은 것까지 세어보니 하루가 달라져요.", amen: 21, amened: false },
];

const AV = [T.gold, T.sage, T.rose, T.violet, T.teal, T.inkSoft];

const SEED_ROOMS = [
  { id: "r1", name: "새벽예배 동행", desc: "매일 새벽 함께 깨어 기도해요", members: 12, mine: true, unread: 0, feed: [
    { id: 1, name: "김은혜", init: "은", c: T.gold, text: "오늘도 새벽에 눈이 떠졌어요. 함께라서 계속하게 되네요 🙏", time: "오늘 05:40" },
    { id: 2, name: "박소망", init: "소", c: T.rose, text: "시편 143편 같이 읽는 중이에요. 은혜.", time: "오늘 05:55" },
  ] },
  { id: "r2", name: "중고등부 3반", desc: "우리 반 아이들과 선생님의 나눔방", members: 8, mine: true, unread: 0, feed: [
    { id: 1, name: "이믿음", init: "믿", c: T.sage, text: "이번 주 암송 다 외웠어요 선생님!", time: "어제 21:10" },
  ] },
  { id: "r3", name: "말씀 통독 100일", desc: "100일 성경 통독 도전 공동체", members: 24, mine: false, unread: 0, feed: [
    { id: 1, name: "정충성", init: "충", c: T.teal, text: "오늘 창세기 12장까지. 아브라함의 부르심이 마음에 남네요.", time: "오늘 07:20" },
  ] },
];

const SEED_THREADS = [
  { id: "t1", name: "김은혜", init: "은", c: T.gold, unread: 0, msgs: [
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
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_GOAL); // 내가 정한 하루 목표
  const [todayPts, setTodayPts] = useState(0);   // 오늘 얻은 점수
  const [faithDays, setFaithDays] = useState(0); // 하루 60점 이상 달성한 날의 수
  const [goalHitToday, setGoalHitToday] = useState(false);
  const [posts, setPosts] = useState(SEED_POSTS);
  const [toast, setToast] = useState(null);

  // Supabase 로그인 세션
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [recovery, setRecovery] = useState(false); // 비밀번호 재설정 링크로 들어온 상태
  useEffect(() => {
    // 재설정 링크(#type=recovery)로 들어왔는지 확인
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) setRecovery(true);
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((ev, s) => {
      setSession(s);
      if (ev === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const user = session ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.nickname || "",
    church: session.user.user_metadata?.church || "미입력",
    method: session.user.app_metadata?.provider === "kakao" ? "kakao" : "email",
  } : null;
  const profileComplete = !!(user && user.name);
  const signOut = () => supabase.auth.signOut();

  // 관리자 여부 + DB 콘텐츠
  const [isAdmin, setIsAdmin] = useState(false);
  const [dbContents, setDbContents] = useState([]);
  const [dbVerses, setDbVerses] = useState([]);

  const loadContents = async () => {
    const { data } = await supabase.from("contents").select("*").eq("active", true).order("sort_order");
    if (data) setDbContents(data);
    const { data: v } = await supabase.from("verses").select("*").eq("active", true).order("sort_order");
    if (v) setDbVerses(v);
  };
  useEffect(() => { loadContents(); }, []);
  useEffect(() => {
    if (!session) { setIsAdmin(false); return; }
    supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()
      .then(({ data }) => setIsAdmin(!!data?.is_admin));
  }, [session]);

  // DB에 콘텐츠가 있으면 그걸 쓰고, 없으면 기본값 사용
  const byCat = (cat, fallback) => {
    const rows = dbContents.filter((c) => c.category === cat);
    return rows.length ? rows : fallback;
  };
  const verseToday = dbVerses.length
    ? dbVerses[dayIndex() % dbVerses.length]
    : VERSES[dayIndex() % VERSES.length];

  const [done7, setDone7] = useState(Object.fromEntries(DIMS.map((d) => [d.key, false])));
  const [journal, setJournal] = useState([]);
  const [memDone, setMemDone] = useState(false);
  const [memStreak, setMemStreak] = useState(0);
  const [sheet, setSheet] = useState(null); // 열린 훈련 key
  const [rooms, setRooms] = useState(SEED_ROOMS);
  const [threads, setThreads] = useState(SEED_THREADS);

  // 성령의 아홉 열매
  const [earnedFruits, setEarnedFruits] = useState([]);
  const [growingFruit, setGrowingFruit] = useState(null);
  const [growStep, setGrowStep] = useState(0);


  // ── 로그인하면 내 기록 불러오기 ──
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!session) { setLoaded(false); return; }
    const uid = session.user.id;
    (async () => {
      // 프로필 (포인트 · 성실한 날 · 목표 · 열매)
      const { data: p } = await supabase.from("profiles")
        .select("points, faith_days, daily_goal, mem_streak, earned_fruits, growing_fruit, grow_step")
        .eq("id", uid).single();
      if (p) {
        setPoints(p.points || 0);
        setFaithDays(p.faith_days || 0);
        setDailyGoal(p.daily_goal || DEFAULT_GOAL);
        setMemStreak(p.mem_streak || 0);
        setEarnedFruits(p.earned_fruits?.length ? p.earned_fruits : []);
        setGrowingFruit(p.growing_fruit || null);
        setGrowStep(p.grow_step || 0);
      }
      // 오늘 기록
      const { data: d } = await supabase.from("daily_logs")
        .select("*").eq("user_id", uid).eq("day", todayKey()).maybeSingle();
      if (d) {
        setTodayPts(d.today_pts || 0);
        setGoalHitToday(!!d.goal_hit);
        setMemDone(!!d.mem_done);
        setDone7(Object.fromEntries(DIMS.map((x) => [x.key, (d.done_dims || []).includes(x.key)])));
      } else {
        setTodayPts(0); setGoalHitToday(false); setMemDone(false);
        setDone7(Object.fromEntries(DIMS.map((x) => [x.key, false])));
      }
      // 신앙일기
      const { data: j } = await supabase.from("journal")
        .select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(60);
      if (j) setJournal(j.map((r) => ({ id: r.id, date: r.day, dim: r.dim, note: r.note || "", time: "" })));
      setLoaded(true);
    })();
  }, [session]);

  // ── 루틴 알림 (앱이 열려 있을 때 정해진 시간에 알림) ──
  const uid = session?.user?.id;
  useEffect(() => {
    if (!uid || typeof window === "undefined" || typeof Notification === "undefined") return;
    let fired = {};
    const tick = async () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const dow = now.getDay();
      const stamp = `${todayKey()} ${hhmm}`;
      if (fired[stamp]) return;
      const { data } = await supabase.from("routines").select("*").eq("user_id", uid).eq("active", true);
      (data || []).forEach((r) => {
        if (r.time?.slice(0, 5) === hhmm && (r.days || []).includes(dow)) {
          fired[stamp] = true;
          new Notification("오늘의 빛 ✦", { body: `${r.title} 시간이에요. 함께 걸어요 🌱`, icon: "/favicon.ico" });
        }
      });
    };
    const id = setInterval(tick, 30000);
    tick();
    return () => clearInterval(id);
  }, [uid]);

  // ── 바뀌면 저장 ──
  useEffect(() => {
    if (!uid || !loaded) return;
    supabase.from("profiles").update({
      points, faith_days: faithDays, daily_goal: dailyGoal, mem_streak: memStreak,
      earned_fruits: earnedFruits, growing_fruit: growingFruit, grow_step: growStep,
    }).eq("id", uid).then(() => {});
  }, [uid, loaded, points, faithDays, dailyGoal, memStreak, earnedFruits, growingFruit, growStep]);

  useEffect(() => {
    if (!uid || !loaded) return;
    supabase.from("daily_logs").upsert({
      user_id: uid, day: todayKey(), today_pts: todayPts, goal_hit: goalHitToday,
      mem_done: memDone, done_dims: DIMS.filter((x) => done7[x.key]).map((x) => x.key),
    }, { onConflict: "user_id,day" }).then(() => {});
  }, [uid, loaded, todayPts, goalHitToday, memDone, done7]);

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
    setTodayPts((t) => {
      const nt = t + pts;
      // 오늘 목표(60점)를 처음 넘긴 순간에만 '성실한 하루' 1일 적립
      if (t < dailyGoal && nt >= dailyGoal && !goalHitToday) {
        setGoalHitToday(true);
        setFaithDays((d) => d + 1);
        setTimeout(() => setToast({ pts: 0, label: "오늘의 성실한 하루 달성 ✦" }), 1800);
        setTimeout(() => setToast(null), 3600);
      }
      return nt;
    });
  };

  const completeDim = async (key, note, isPublic = false) => {
    const first = !done7[key];
    setDone7((d) => ({ ...d, [key]: true }));
    setJournal((j) => [{ id: Date.now(), date: todayKey(), dim: key, note: (note || "").trim(), time: "방금", is_public: isPublic }, ...j]);
    if (first) award(DIM[key].pts, `${DIM[key].label} 훈련`);
    if (uid) await supabase.from("journal").insert({ user_id: uid, day: todayKey(), dim: key, note: (note || "").trim(), is_public: isPublic });
    return true;
  };

  const doMemorize = () => {
    if (memDone) return;
    setMemDone(true);
    setMemStreak((s) => s + 1);
    award(5, "말씀 암송");
  };

  const doneCount = DIMS.filter((d) => done7[d.key]).length;
  const ctx = { tab, setTab, points, log, posts, setPosts, user, profileComplete, authReady, signOut, award, done7, doneCount, journal, memDone, memStreak, doMemorize, sheet, setSheet, completeDim, rooms, setRooms, threads, setThreads, earnedFruits, growingFruit, growStep, selectFruit, growAction, harvestFruit, isAdmin, dbContents, dbVerses, byCat, verseToday, loadContents, todayPts, faithDays, goalHitToday, dailyGoal, setDailyGoal };

  if (recovery) return (
    <div style={{ background: "#E9E4D8", minHeight: "100vh", display: "flex", justifyContent: "center", fontFamily: sans }}>
      <div style={{ width: "100%", maxWidth: 400, background: T.paper, minHeight: "100vh" }}>
        <NewPassword onDone={() => { setRecovery(false); if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname); }} />
      </div>
    </div>
  );

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

        {sheet && <TrainSheet dimKey={sheet} done={done7[sheet]} onClose={() => setSheet(null)} onComplete={completeDim} byCat={byCat} verseToday={verseToday} />}

        {toast && (
          <div style={{ position: "absolute", left: "50%", bottom: 100, transform: "translateX(-50%)", background: T.ink, color: "#fff", padding: "10px 16px", borderRadius: 999, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(32,42,68,.35)", animation: "pop .25s ease", zIndex: 50 }}>
            <Sparkles size={15} color={T.gold} />
            <span style={{ fontSize: 14.5, fontWeight: 500 }}>{toast.label}{toast.pts ? <> · <b style={{ color: T.gold }}>+{toast.pts}P</b></> : null}</span>
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
  const { done7, doneCount, setSheet, memDone, memStreak, doMemorize, threads, rooms, setTab, verseToday, todayPts, dailyGoal, user } = ctx;
  const weather = useWeather();      // 실제 날씨 (못 받아오면 표시 안 됨)
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
              {weather && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.13)", borderRadius: 999, padding: "4px 10px", fontSize: 13, marginTop: 7 }}>
                  <weather.icon size={13} color={T.goldGlow} />
                  {weather.region} {weather.temp}° · {weather.label}
                </span>
              )}
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
          <h1 style={{ fontFamily: serif, fontSize: 23, fontWeight: 700, margin: "14px 0 0" }}>{user?.name || "반가워요"}님, {greet}</h1>

          {/* 별 7개 진행도 */}
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
              {DIMS.map((d) => {
                const on = done7[d.key];
                return <Star key={d.key} size={23} fill={on ? T.gold : "none"} color={on ? T.gold : "rgba(255,255,255,.3)"} strokeWidth={1.8} style={{ transition: "all .4s ease", filter: on ? "drop-shadow(0 0 5px rgba(217,164,65,.75))" : "none" }} />;
              })}
            </div>
            <p style={{ margin: "9px 0 0", fontSize: 13.5, color: "rgba(255,255,255,.75)" }}>
              {doneCount === DIMS.length ? "오늘의 신앙 훈련을 모두 밝혔어요 ✦" : <>오늘의 신앙 훈련 <b style={{ color: T.gold }}>{doneCount}</b> / {DIMS.length} · 오늘 <b style={{ color: T.gold }}>{todayPts}</b>/{dailyGoal}P</>}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px 6px" }}>
        {/* 오늘의 말씀 (암송) — 콤팩트 */}
        <MemorizeCard verse={verseToday} done={memDone} streak={memStreak} onDone={doMemorize} />

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
  const [ver, setVer] = useState("ko");
  const text = verse[ver];
  const ref = ver === "ko" ? verse.ref : verse.refEn;
  return (
    <div>
      <div style={{ background: `linear-gradient(150deg, #FFFDF7, ${T.goldSoft})`, borderRadius: 16, padding: "14px 16px", border: `1px solid ${T.goldSoft}`, boxShadow: "0 2px 10px rgba(217,164,65,.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: T.goldDeep }}><Feather size={13} /> 오늘의 말씀 암송</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 13.5, fontWeight: 700, color: T.rose }}><Flame size={13} fill={T.rose} color={T.rose} /> {streak}일</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 9 }}>
          {BIBLE_VERSIONS.map((v) => (
            <button key={v.key} onClick={() => setVer(v.key)} style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 999, background: ver === v.key ? T.goldDeep : "rgba(255,255,255,.7)", color: ver === v.key ? "#fff" : T.goldDeep, border: `1px solid ${ver === v.key ? T.goldDeep : T.goldSoft}` }}>{v.label}</button>
          ))}
        </div>
        <p style={{ fontFamily: serif, fontSize: ver === "ko" ? 18.5 : 16, lineHeight: 1.55, color: T.ink, margin: "0 0 4px" }}>"{text}"</p>
        <p style={{ margin: "0 0 12px", fontSize: 13.5, color: T.goldDeep, fontWeight: 700 }}>{ref}</p>
        <button onClick={() => setOpen(true)} disabled={done} style={{ width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 14.5, fontWeight: 700, background: done ? "rgba(95,132,104,.14)" : T.ink, color: done ? T.sage : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {done ? <><Check size={15} /> 오늘 암송 완료 · 🔥 {streak}일</> : <><Feather size={14} /> 암송 연습하기 · +5P</>}
        </button>
      </div>
      {open && <MemorizeModal verse={{ text, ref }} done={done} onClose={() => setOpen(false)} onDone={() => { onDone(); setOpen(false); }} />}
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
function TrainSheet({ dimKey, done, onClose, onComplete, byCat, verseToday }) {
  const dim = DIM[dimKey];
  const [note, setNote] = useState("");
  const [pub, setPub] = useState(false);
  const [web, setWeb] = useState(null);
  const [saved, setSaved] = useState(done);   // 이미 완료했으면 저장됨 상태로 시작
  const [busy, setBusy] = useState(false);
  const Ic = dim.icon;
  const openWeb = (url, title, kind) => setWeb({ url, title, kind });

  // ★ 저장만 함 (창은 닫지 않음)
  const save = async () => {
    if (busy) return;
    setBusy(true);
    await onComplete(dimKey, note, pub);
    setBusy(false);
    setSaved(true);
  };

  return (
    <Sheet onClose={onClose} accent={dim.c} title={<><Ic size={16} color={dim.c} /> {dim.label}</>}>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: T.muted }}>{dim.sub}</p>

      <div style={{ marginBottom: 16 }}>{renderContent(dimKey, { openWeb, byCat })}</div>

      <p style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, color: T.ink }}>오늘의 후기</p>
      <textarea value={note} onChange={(e) => { setNote(e.target.value); if (saved) setSaved(false); }} rows={3} placeholder={dim.prompt}
        style={{ width: "100%", border: `1px solid ${T.line}`, borderRadius: 12, padding: "11px 13px", fontSize: 14.5, lineHeight: 1.6, color: T.ink, outline: "none", resize: "none", background: T.paper }} />

      <button onClick={() => { setPub((v) => !v); if (saved) setSaved(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, background: pub ? T.sageSoft : T.card, border: `1px solid ${pub ? T.sage : T.line}`, borderRadius: 11, padding: "11px 13px", marginTop: 10, marginBottom: 2, textAlign: "left" }}>
        <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: pub ? T.sage : "#fff", border: `1px solid ${pub ? T.sage : T.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{pub && <Check size={12} color="#fff" />}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: T.ink }}>{pub ? "함께 나눔에 공개" : "나만 보기 (비공개)"}</span>
          <span style={{ display: "block", fontSize: 11.5, color: T.muted, marginTop: 1 }}>{pub ? "다른 지체들이 이 후기를 볼 수 있어요" : "이 후기는 나만 볼 수 있어요"}</span>
        </span>
        {pub ? <Users size={16} color={T.sage} /> : <Lock size={15} color={T.muted} />}
      </button>

      {/* ★ 저장 버튼 — 눌러도 창은 그대로. 저장되면 안내가 뜨고 계속 이어갈 수 있어요 */}
      <button onClick={save} disabled={busy}
        style={{ width: "100%", padding: "13px 0", marginTop: 12, borderRadius: 12, fontSize: 16, fontWeight: 700, background: saved ? T.sageSoft : dim.c, color: saved ? T.sage : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        {busy ? "저장 중…" : saved ? <><Check size={16} /> 저장됨 · 다시 저장</> : <><PenLine size={15} /> {done ? "후기 저장하기" : `훈련 완료 · 일기 저장 · +${dim.pts}P`}</>}
      </button>

      {saved && (
        <p style={{ margin: "9px 2px 0", fontSize: 12, color: T.sage, textAlign: "center", fontWeight: 600 }}>
          신앙일기에 저장됐어요 ✦ 이어서 더 훈련하거나 아래로 닫을 수 있어요
        </p>
      )}

      {/* ★ 닫기 — 저장과 완전히 분리 */}
      <button onClick={onClose}
        style={{ width: "100%", padding: "12px 0", marginTop: 9, borderRadius: 12, fontSize: 14.5, fontWeight: 700, background: T.card, color: T.muted, border: `1px solid ${T.line}` }}>
        닫기
      </button>

      {web && <WebView url={web.url} title={web.title} kind={web.kind} onClose={() => setWeb(null)}
        note={note} setNote={setNote} pub={pub} setPub={setPub} done={done} dim={dim}
        onComplete={onComplete} dimKey={dimKey} />}
    </Sheet>
  );
}

function renderContent(key, { openWeb, byCat }) {
  if (key === "word") return <BibleFinder openWeb={openWeb} />;
  if (key === "qt") return <QTLinks openWeb={openWeb} items={byCat("qt", QT_LINKS.map(l => ({ title: l.name, subtitle: l.desc, url: l.url, kind: l.kind })))} />;
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
            {byCat("mission", MISSION_LINKS.map(m => ({ title: m.name, subtitle: m.desc, url: m.url }))).map((l) => (
              <button key={l.id || l.title} onClick={() => openWeb(l.url, l.title)} style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", background: T.card, borderRadius: 11, padding: "10px 12px", border: `1px solid ${T.line}` }}>
                <HandHeart size={16} color="#4E7CA1" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}>{l.title}</p><p style={{ margin: 0, fontSize: 12, color: T.muted }}>{l.subtitle}</p></div>
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

/* 목소리 이름을 사람이 읽기 좋게 다듬기 */
function voiceLabel(v) {
  const raw = v.name || "";
  let n = raw
    .replace(/^Microsoft\s+/i, "")
    .replace(/^Google\s+/i, "")
    .replace(/Online\s*\(Natural\)/i, "")
    .replace(/\(Natural\)/i, "")
    .replace(/-\s*Korean.*$/i, "")
    .replace(/-\s*English.*$/i, "")
    .replace(/한국의|대한민국/g, "")
    .trim();
  const natural = /natural|neural|premium|enhanced|고품질/i.test(raw);
  const male = /injoon|인준|male|남/i.test(raw);
  const female = /sunhi|heami|yuna|female|여/i.test(raw);
  return (n || "기본") + (male ? " · 남" : female ? " · 여" : "") + (natural ? " ✨" : "");
}

/* 말씀 — 성경 찾기 */
function BibleFinder({ openWeb }) {
  const [testament, setTestament] = useState("nt");
  const [book, setBook] = useState(null);   // [이름, 장수]
  const [chapter, setChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [found, setFound] = useState(null);
  const [ver, setVer] = useState("ko");   // ko | asv | kjv
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);      // 읽기 속도
  const [voices, setVoices] = useState([]); // 이 기기에서 쓸 수 있는 목소리들
  const [voiceURI, setVoiceURI] = useState("");
  const stopRef = useRef(false);            // 사용자가 직접 멈췄는지 표시
  const [curIdx, setCurIdx] = useState(-1); // 지금 읽고 있는 절 (index)
  const [savedIdx, setSavedIdx] = useState(0); // 멈춘 지점 (이어 듣기용)
  const verseRefs = useRef({});
  const [noVoice, setNoVoice] = useState(false); // 이 기기에 해당 언어 음성이 없음
  const [readSet, setReadSet] = useState(new Set()); // 읽은 장 "책번호:장"
  const [uid, setUid] = useState(null);
  const books = testament === "ot" ? BIBLE_OT : BIBLE_NT;
  const bookNo = (name) => {
    const oi = BIBLE_OT.findIndex((b) => b[0] === name);
    if (oi >= 0) return oi + 1;
    const ni = BIBLE_NT.findIndex((b) => b[0] === name);
    return ni >= 0 ? 39 + ni + 1 : 0;
  };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u?.user?.id; setUid(id);
      if (!id) return;
      const { data } = await supabase.from("bible_progress").select("book_no, chapter").eq("user_id", id);
      if (data) setReadSet(new Set(data.map((r) => `${r.book_no}:${r.chapter}`)));
    })();
    return () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); };
  }, []);

  // 기기에 깔린 목소리 불러오기 (비동기로 로드돼서 이벤트도 같이 걸어둠)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const score = (v) => {
      const n = (v.name || "").toLowerCase();
      const lg = (v.lang || "").toLowerCase();
      let s = 0;
      if (/natural|neural/.test(n)) s += 6;      // 엣지 뉴럴 = 가장 자연스러움
      if (/premium|enhanced|고품질/.test(n)) s += 4;
      if (/online/.test(n)) s += 3;
      if (/google/.test(n)) s += 2;
      if (lg === "en-us" || lg === "en-gb") s += 2;  // 영어는 미/영 발음 우선
      return s;
    };
    const load = () => {
      const want = ver === "ko" ? "ko" : "en";
      const list = (window.speechSynthesis.getVoices() || [])
        .filter((v) => (v.lang || "").toLowerCase().startsWith(want))
        .sort((a, b) => score(b) - score(a));
      setVoices(list);
      setVoiceURI((cur) => {
        if (list.some((v) => v.voiceURI === cur)) return cur;
        let saved = "";
        try { saved = localStorage.getItem("tl_voice_" + want) || ""; } catch {}
        if (list.some((v) => v.voiceURI === saved)) return saved;
        return list[0]?.voiceURI || "";
      });
    };
    setNoVoice(false);
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [ver]);

  // 크롬이 긴 낭독 중간에 멈추는 버그 방지
  useEffect(() => {
    if (!speaking) return;
    const t = setInterval(() => {
      const s = typeof window !== "undefined" ? window.speechSynthesis : null;
      if (s && s.speaking && !s.paused) { s.pause(); s.resume(); }
    }, 8000);
    return () => clearInterval(t);
  }, [speaking]);

  const markRead = async (name, ch) => {
    const no = bookNo(name);
    const key = `${no}:${ch}`;
    if (readSet.has(key) || !uid) return;
    setReadSet((s) => new Set(s).add(key));
    await supabase.from("bible_progress").insert({ user_id: uid, book_no: no, chapter: ch });
  };

  // 읽기표에서 취소 (DB에서도 삭제)
  const unmarkRead = async (name, ch) => {
    const no = bookNo(name);
    const key = `${no}:${ch}`;
    if (!uid || !readSet.has(key)) return;
    setReadSet((s) => { const n = new Set(s); n.delete(key); return n; });
    await supabase.from("bible_progress").delete()
      .eq("user_id", uid).eq("book_no", no).eq("chapter", ch);
  };

  // 멈춘 지점 기억하기 (이 기기에만 저장)
  const posKey = (name, ch) => `tl_pos_${bookNo(name)}:${ch}`;
  const savePos = (name, ch, idx) => {
    try { localStorage.setItem(posKey(name, ch), String(idx)); } catch {}
    setSavedIdx(idx);
  };
  const clearPos = (name, ch) => {
    try { localStorage.removeItem(posKey(name, ch)); } catch {}
    setSavedIdx(0);
  };

  // 지금 읽는 절이 화면 밖이면 따라 내려가기
  useEffect(() => {
    if (curIdx < 0) return;
    const el = verseRefs.current[curIdx];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [curIdx]);

  const stopSpeak = () => {
    stopRef.current = true;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
    setCurIdx(-1);
  };

  // startIdx 절부터 읽기 시작 (0 = 처음부터)
  const startSpeak = (list, name, ch, startIdx = 0) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;

    // ★ 절 번호는 읽지 않음
    const from = Math.max(0, Math.min(startIdx, list.length - 1));
    const items = list
      .map((v, i) => ({ i, text: (v[ver] || "").trim() }))
      .filter((x) => x.text && x.i >= from);
    if (!items.length) return;

    const picked = voices.find((v) => v.voiceURI === voiceURI) || null;

    // ★ 이 기기에 해당 언어 음성이 없으면 읽지 않음 (한국어 엔진이 영어를 읽는 참사 방지)
    if (!picked) { setNoVoice(true); return; }
    setNoVoice(false);

    // ★ 여러 절을 한 덩어리로 묶어 읽어서 뚝뚝 끊기지 않게 (약 220자 단위)
    //   덩어리 안에서도 절이 바뀌는 지점을 표시해 하이라이트는 절 단위로 유지
    const CHUNK = 220;
    const chunks = [];
    let cur = null;
    for (const it of items) {
      if (!cur || (cur.text.length + it.text.length > CHUNK)) {
        cur = { text: it.text, startI: it.i, marks: [{ at: 0, i: it.i }] };
        chunks.push(cur);
      } else {
        cur.marks.push({ at: cur.text.length + 1, i: it.i });
        cur.text += " " + it.text;   // 절 사이를 공백으로만 이어 자연스럽게
      }
    }

    stopRef.current = true;
    synth.cancel();
    setCurIdx(-1);

    // cancel 직후 바로 speak하면 크롬에서 씹히는 경우가 있어 살짝 텀을 둠
    setTimeout(() => {
      stopRef.current = false;
      chunks.forEach((chunk, k) => {
        const u = new SpeechSynthesisUtterance(chunk.text);
        u.lang = ver === "ko" ? "ko-KR" : "en-US";
        if (picked) u.voice = picked;
        // 한국어는 살짝 낮고 느리게(부드럽게), 영어는 원래 톤 그대로가 자연스러움
        u.rate = ver === "ko" ? rate * 0.95 : rate;
        u.pitch = ver === "ko" ? 0.95 : 1;
        u.volume = 1;
        u.onstart = () => { setCurIdx(chunk.startI); savePos(name, ch, chunk.startI); };
        // 덩어리 안에서 절이 바뀌는 지점마다 하이라이트를 옮김
        u.onboundary = (e) => {
          const idx = e.charIndex || 0;
          let now = chunk.marks[0].i;
          for (const m of chunk.marks) { if (idx >= m.at) now = m.i; else break; }
          setCurIdx(now);
        };
        // ★ 끝까지 다 들었을 때만 읽기표에 체크 (중간에 멈추면 체크 안 함)
        if (k === chunks.length - 1) u.onend = () => {
          setSpeaking(false);
          setCurIdx(-1);
          if (!stopRef.current) { clearPos(name, ch); markRead(name, ch); }
        };
        u.onerror = () => { setSpeaking(false); setCurIdx(-1); };
        synth.speak(u);
      });
      setSpeaking(true);
    }, 120);
  };

  const VERS = [{ k: "ko", l: "개역한글" }, { k: "asv", l: "ASV" }, { k: "kjv", l: "KJV" }];

  const openChapter = async (name, ch) => {
    stopSpeak();
    verseRefs.current = {};
    let pos = 0;
    try { pos = parseInt(localStorage.getItem(posKey(name, ch)) || "0", 10) || 0; } catch {}
    setSavedIdx(pos);
    setChapter(ch); setLoading(true); setVerses([]);
    const { data } = await supabase.from("bible").select("verse, ko, asv, kjv")
      .eq("book", name).eq("chapter", ch).order("verse");
    setVerses(data || []); setLoading(false);
  };

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true); setFound(null);
    const { data } = await supabase.from("bible").select("book, chapter, verse, ko")
      .ilike("ko", `%${q.trim()}%`).limit(40);
    setFound(data || []); setLoading(false);
  };

  // 본문 읽기 화면
  if (book && chapter) {
    return (
      <div>
        <button onClick={() => { setChapter(null); setVerses([]); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, color: T.muted, fontWeight: 600, marginBottom: 10 }}><ChevronLeft size={15} /> 장 선택</button>
        <p style={{ margin: "0 0 9px", fontFamily: serif, fontSize: 19, fontWeight: 700, color: T.ink }}>{book[0]} {chapter}장</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          {VERS.map((v) => (
            <button key={v.k} onClick={() => setVer(v.k)} style={{ fontSize: 12, fontWeight: 700, padding: "5px 11px", borderRadius: 999, background: ver === v.k ? T.ink : T.card, color: ver === v.k ? "#fff" : T.muted, border: `1px solid ${ver === v.k ? T.ink : T.line}` }}>{v.l}</button>
          ))}
          {readSet.has(`${bookNo(book[0])}:${chapter}`) && (
            <button onClick={() => unmarkRead(book[0], chapter)}
              style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 700, color: T.sage, background: T.sageSoft, borderRadius: 999, padding: "3px 9px", border: `1px solid ${T.sage}33` }}>
              <Check size={11} /> 읽음 <X size={10} />
            </button>
          )}
        </div>

        {/* 음성으로 듣기 */}
        <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "9px 11px", marginBottom: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => (speaking ? stopSpeak() : startSpeak(verses, book[0], chapter, savedIdx))} disabled={!verses.length}
              style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: speaking ? T.rose : T.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {speaking ? <X size={16} color="#fff" /> : <Play size={15} color="#fff" fill="#fff" />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: T.ink }}>
                {speaking ? `읽는 중… ${verses[curIdx]?.verse ?? ""}${curIdx >= 0 ? "절" : ""} (누르면 정지)`
                  : savedIdx > 0 ? `이어 듣기 · ${verses[savedIdx]?.verse ?? savedIdx + 1}절부터`
                  : "성경 읽어주기"}
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 11, color: T.muted }}>
                {savedIdx > 0 && !speaking ? "멈춘 자리부터 이어서 읽어드려요" : "다 들으면 읽기표에 자동 체크돼요"}
              </p>
            </div>
            {savedIdx > 0 && !speaking && (
              <button onClick={() => startSpeak(verses, book[0], chapter, 0)}
                style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "5px 8px", borderRadius: 7, color: T.muted, border: `1px solid ${T.line}`, background: "transparent" }}>처음부터</button>
            )}
            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
              {[0.75, 1, 1.25, 1.5].map((r) => (
                <button key={r} onClick={() => setRate(r)} style={{ fontSize: 11, fontWeight: 700, padding: "4px 7px", borderRadius: 7, background: rate === r ? T.gold : "transparent", color: rate === r ? "#fff" : T.muted, border: `1px solid ${rate === r ? T.gold : T.line}` }}>{r}x</button>
              ))}
            </div>
          </div>

          {/* 진행바 — 누르면 그 절로 이동 */}
          {verses.length > 0 && (() => {
            const at = curIdx >= 0 ? curIdx : savedIdx;
            const pct = ((at + (speaking ? 1 : 0)) / verses.length) * 100;
            return (
              <div style={{ marginTop: 9 }}>
                <div
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const p = Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width));
                    startSpeak(verses, book[0], chapter, Math.floor(p * verses.length));
                  }}
                  style={{ padding: "6px 0", cursor: "pointer" }}>
                  <div style={{ position: "relative", width: "100%", height: 6, borderRadius: 999, background: T.line }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.max(0, Math.min(100, pct))}%`, borderRadius: 999, background: T.gold, transition: "width .3s" }} />
                    <div style={{ position: "absolute", top: -3, left: `calc(${Math.max(0, Math.min(100, pct))}% - 6px)`, width: 12, height: 12, borderRadius: 999, background: "#fff", border: `2px solid ${T.gold}`, transition: "left .3s" }} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: T.muted }}>
                  <span style={{ fontWeight: 700 }}>{verses[at]?.verse ?? 1}절</span>
                  <span>총 {verses.length}절 · 바나 본문을 눌러 이동</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 목소리 고르기 — ✨ 표시가 더 자연스러운 목소리예요 */}
        {voices.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, overflowX: "auto", marginBottom: 11, paddingBottom: 2 }}>
            <span style={{ flexShrink: 0, fontSize: 11, color: T.muted, fontWeight: 700, marginRight: 2 }}>목소리</span>
            {voices.slice(0, 8).map((v) => (
              <button key={v.voiceURI}
                onClick={() => {
                  setVoiceURI(v.voiceURI);
                  try { localStorage.setItem("tl_voice_" + (ver === "ko" ? "ko" : "en"), v.voiceURI); } catch {}
                  if (speaking) { stopRef.current = true; window.speechSynthesis.cancel(); setSpeaking(false); }
                }}
                style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 999, whiteSpace: "nowrap",
                  background: voiceURI === v.voiceURI ? T.violet : T.card,
                  color: voiceURI === v.voiceURI ? "#fff" : T.muted,
                  border: `1px solid ${voiceURI === v.voiceURI ? T.violet : T.line}` }}>
                {voiceLabel(v)}
              </button>
            ))}
          </div>
        )}

        {/* 이 기기에 해당 언어 음성이 없을 때 */}
        {(noVoice || (voices.length === 0 && ver !== "ko")) && (
          <div style={{ display: "flex", gap: 7, background: `${T.rose}10`, border: `1px solid ${T.rose}44`, borderRadius: 10, padding: "9px 11px", marginBottom: 11 }}>
            <X size={13} color={T.rose} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 11.5, color: T.inkSoft, lineHeight: 1.55 }}>
              <b>이 기기에 영어 음성이 없어요.</b><br />
              한국어 엔진으로 영어를 읽으면 많이 어색해서 재생을 막았어요.
              엣지(Edge) 브라우저로 열거나, 기기 설정에서 영어 음성을 추가하면 들을 수 있어요.
            </span>
          </div>
        )}

        {loading ? <p style={{ fontSize: 14, color: T.muted, textAlign: "center", padding: 24 }}>불러오는 중…</p> : verses.length === 0 ? (
          <p style={{ fontSize: 13.5, color: T.muted, textAlign: "center", padding: 24, lineHeight: 1.6 }}>본문을 불러오지 못했어요.<br />성경 데이터가 등록되었는지 확인해 주세요.</p>
        ) : (
          <div style={{ maxHeight: 320, overflowY: "auto", background: T.card, borderRadius: 12, border: `1px solid ${T.line}`, padding: "14px 15px" }}>
            {verses.map((v, i) => (
              <p key={v.verse}
                ref={(el) => { verseRefs.current[i] = el; }}
                onClick={() => startSpeak(verses, book[0], chapter, i)}
                style={{ margin: "0 -7px 4px", padding: "5px 7px", borderRadius: 8, cursor: "pointer",
                  background: curIdx === i ? `${T.gold}22` : "transparent",
                  fontSize: ver === "ko" ? 15 : 14, lineHeight: 1.75, color: T.inkSoft, fontFamily: serif, transition: "background .2s" }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: T.gold, marginRight: 5, verticalAlign: "super" }}>{v.verse}</span>
                {v[ver] || <span style={{ color: T.muted, fontSize: 13 }}>(본문 없음)</span>}
              </p>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
          {chapter > 1 && <button onClick={() => openChapter(book[0], chapter - 1)} style={{ flex: 1, padding: "10px 0", borderRadius: 9, background: T.card, border: `1px solid ${T.line}`, fontSize: 13.5, fontWeight: 700, color: T.inkSoft }}>← {chapter - 1}장</button>}
          {chapter < book[1] && <button onClick={() => openChapter(book[0], chapter + 1)} style={{ flex: 1, padding: "10px 0", borderRadius: 9, background: T.card, border: `1px solid ${T.line}`, fontSize: 13.5, fontWeight: 700, color: T.inkSoft }}>{chapter + 1}장 →</button>}
        </div>
        {(() => {
          const isRead = readSet.has(`${bookNo(book[0])}:${chapter}`);
          return (
            <button onClick={() => (isRead ? unmarkRead(book[0], chapter) : markRead(book[0], chapter))}
              style={{ width: "100%", padding: "11px 0", marginTop: 8, borderRadius: 10, fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: isRead ? T.sageSoft : T.card, color: isRead ? T.sage : T.inkSoft, border: `1px solid ${isRead ? T.sage : T.line}` }}>
              {isRead ? <><Check size={14} /> 읽기표에 기록됨 · 누르면 취소</> : <><Check size={14} /> 이 장 읽음으로 표시</>}
            </button>
          );
        })()}
        <p style={{ margin: "9px 2px 0", fontSize: 11, color: T.muted, textAlign: "center" }}>개역한글(1961) · ASV(1901) · KJV(1611) — 모두 공개 도메인</p>
      </div>
    );
  }

  // 장 선택
  if (book) {
    return (
      <div>
        <button onClick={() => setBook(null)} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, color: T.muted, fontWeight: 600, marginBottom: 10 }}><ChevronLeft size={15} /> 성경 목록</button>
        <p style={{ margin: "0 0 4px", fontSize: 15.5, fontWeight: 700, color: T.ink }}>{book[0]} <span style={{ fontSize: 13.5, color: T.muted, fontWeight: 400 }}>· 전체 {book[1]}장</span></p>
        {(() => {
          const no = bookNo(book[0]);
          const read = Array.from({ length: book[1] }).filter((_, i) => readSet.has(`${no}:${i + 1}`)).length;
          return (
            <div style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, marginBottom: 5 }}>
                <span>읽기표</span><span>{read} / {book[1]}장</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "#F1EDE3" }}>
                <div style={{ width: `${(read / book[1]) * 100}%`, height: "100%", borderRadius: 999, background: T.sage, transition: "width .4s ease" }} />
              </div>
            </div>
          );
        })()}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, maxHeight: 240, overflowY: "auto" }}>
          {Array.from({ length: book[1] }).map((_, i) => {
            const done = readSet.has(`${bookNo(book[0])}:${i + 1}`);
            return (
              <button key={i} onClick={() => openChapter(book[0], i + 1)} style={{ padding: "9px 0", borderRadius: 8, background: done ? T.sage : T.card, border: `1px solid ${done ? T.sage : T.line}`, fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.inkSoft }}>{i + 1}</button>
            );
          })}
        </div>
      </div>
    );
  }

  // 검색 결과
  if (found) {
    return (
      <div>
        <button onClick={() => { setFound(null); setQ(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, color: T.muted, fontWeight: 600, marginBottom: 10 }}><ChevronLeft size={15} /> 성경 목록</button>
        <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: T.ink }}>"{q}" 검색 결과 {found.length}개</p>
        {found.length === 0 ? <p style={{ fontSize: 13.5, color: T.muted, textAlign: "center", padding: 20 }}>결과가 없어요.</p> : (
          <div style={{ maxHeight: 300, overflowY: "auto", display: "grid", gap: 7 }}>
            {found.map((v, i) => (
              <div key={i} style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.line}`, padding: "10px 12px" }}>
                <p style={{ margin: "0 0 3px", fontSize: 11.5, fontWeight: 700, color: T.gold }}>{v.book} {v.chapter}:{v.verse}</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.inkSoft, fontFamily: serif }}>{v.ko}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 성경 목록 + 검색
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 12px", marginBottom: 11 }}>
        <Search size={16} color={T.muted} />
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="성경 구절 검색 (예 · 사랑)"
          style={{ flex: 1, border: "none", outline: "none", padding: "11px 0", fontSize: 14, color: T.ink, background: "transparent" }} />
        {q && <button onClick={search} style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>검색</button>}
      </div>
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
      <p style={{ margin: "10px 2px 0", fontSize: 12, color: T.muted }}>장을 고르면 앱 안에서 바로 읽을 수 있어요 · 개역한글</p>
    </div>
  );
}

/* QT — 큐티 영상·묵상 링크 */
function QTLinks({ openWeb, items }) {
  const COLORS = [T.violet, T.rose, T.teal, T.sage, T.goldDeep];
  return (
    <div style={{ display: "grid", gap: 9 }}>
      <p style={{ margin: "0 0 2px", fontSize: 13.5, color: T.muted }}>영상은 앱 안에서 재생돼요</p>
      {items.map((l, i) => {
        const c = COLORS[i % COLORS.length];
        return (
          <button key={l.id || l.title} onClick={() => openWeb(l.url, l.title, l.kind)} style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: T.card, borderRadius: 12, padding: 11, border: `1px solid ${T.line}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c}16`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Play size={17} color={c} fill={c} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{l.title}</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.subtitle}</p>
            </div>
            {l.kind === "embed"
              ? <span style={{ fontSize: 11.5, fontWeight: 700, color: c, background: `${c}18`, borderRadius: 999, padding: "3px 8px", flexShrink: 0 }}>앱 내 재생</span>
              : <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 700, color: T.muted, flexShrink: 0 }}><ExternalLink size={12} /> 새 탭</span>}
          </button>
        );
      })}
    </div>
  );
}

/* 프레임 안 웹뷰 */
function WebView({ url, title, kind, onClose, note, setNote, pub, setPub, done, dim, onComplete, dimKey }) {
  const embed = kind === "embed";
  const dateStr = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
  const QUESTIONS = [
    "오늘 본문에서 하나님은 어떤 분으로 보이나요?",
    "마음에 남은 한 구절은 무엇인가요?",
    "오늘 내 삶에 적용할 한 가지는?",
  ];
  const canWrite = !!setNote;
  const [saved, setSaved] = useState(done);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy) return;
    setBusy(true);
    await onComplete(dimKey, note, pub);
    setBusy(false);
    setSaved(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "center", background: "rgba(0,0,0,.45)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, height: "100%", background: T.paper, display: "flex", flexDirection: "column" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${T.line}`, flexShrink: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ padding: 2 }}><ChevronLeft size={22} color={T.ink} /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
            <p style={{ margin: "1px 0 0", fontSize: 12, color: T.gold, fontWeight: 700 }}>오늘 · {dateStr}</p>
          </div>
          <a href={url} target="_blank" rel="noreferrer" style={{ padding: 2, display: "flex" }}><ExternalLink size={19} color={T.muted} /></a>
        </div>

        {embed ? (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* 영상 — 16:9 */}
            <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", flexShrink: 0 }}>
              <iframe src={url} title={title} style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            </div>
            <p style={{ margin: "8px 16px 0", fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>영상 왼쪽 위 <b>목록 아이콘</b>을 누르면 날짜별 큐티 목록을 볼 수 있어요.</p>

            <div style={{ padding: "14px 16px 28px" }}>
              {/* 묵상 질문 */}
              <div style={{ background: T.card, borderRadius: 13, border: `1px solid ${T.line}`, padding: "14px 15px", marginBottom: 14 }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: T.ink, display: "flex", alignItems: "center", gap: 6 }}><Feather size={14} color={T.violet} /> 묵상 질문</p>
                {QUESTIONS.map((q) => (
                  <div key={q} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: T.violet, flexShrink: 0, marginTop: 7 }} />
                    <span style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.55 }}>{q}</span>
                  </div>
                ))}
              </div>

              {/* 후기 바로 쓰기 */}
              {canWrite && (
                <>
                  <p style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, color: T.ink }}>오늘의 후기</p>
                  <textarea value={note} onChange={(e) => { setNote(e.target.value); if (saved) setSaved(false); }} rows={4} placeholder={dim?.prompt || "오늘 받은 은혜를 적어보세요"}
                    style={{ width: "100%", border: `1px solid ${T.line}`, borderRadius: 12, padding: "11px 13px", fontSize: 14.5, lineHeight: 1.6, color: T.ink, outline: "none", resize: "none", background: "#fff", fontFamily: "inherit" }} />

                  {setPub && (
                    <button onClick={() => { setPub((v) => !v); if (saved) setSaved(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, background: pub ? T.sageSoft : "#fff", border: `1px solid ${pub ? T.sage : T.line}`, borderRadius: 11, padding: "10px 12px", marginTop: 9, textAlign: "left" }}>
                      <span style={{ width: 19, height: 19, borderRadius: 6, flexShrink: 0, background: pub ? T.sage : "#fff", border: `1px solid ${pub ? T.sage : T.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{pub && <Check size={11} color="#fff" />}</span>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: T.ink }}>{pub ? "함께 나눔에 공개" : "나만 보기 (비공개)"}</span>
                      {pub ? <Users size={15} color={T.sage} /> : <Lock size={14} color={T.muted} />}
                    </button>
                  )}

                  {/* ★ 저장만 — 창은 유지 */}
                  <button onClick={save} disabled={busy}
                    style={{ width: "100%", padding: "13px 0", marginTop: 11, borderRadius: 12, fontSize: 16, fontWeight: 700, background: saved ? T.sageSoft : (dim?.c || T.ink), color: saved ? T.sage : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    {busy ? "저장 중…" : saved ? <><Check size={16} /> 저장됨 · 다시 저장</> : <><PenLine size={15} /> {done ? "후기 저장하기" : `훈련 완료 · 일기 저장 · +${dim?.pts}P`}</>}
                  </button>
                  <p style={{ margin: "9px 2px 0", fontSize: 11.5, color: saved ? T.sage : T.muted, textAlign: "center", fontWeight: saved ? 600 : 400 }}>
                    {saved ? "신앙일기에 저장됐어요 ✦ 영상은 계속 볼 수 있어요" : "영상을 보면서 후기를 저장해도 창이 닫히지 않아요 ✦"}
                  </p>
                </>
              )}
            </div>
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
  const [mode, setMode] = useState("cal");     // cal(달력) | list(목록)
  const [pickDay, setPickDay] = useState(null); // 선택한 날짜
  const [filter, setFilter] = useState(null);   // 훈련 필터
  const [q, setQ] = useState("");               // 검색어
  const [month, setMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });

  // 날짜별 그룹
  const byDay = useMemo(() => {
    const map = {};
    journal.forEach((e) => { (map[e.date] = map[e.date] || []).push(e); });
    return map;
  }, [journal]);

  // 필터 적용된 목록
  const filtered = useMemo(() => {
    let list = journal;
    if (filter) list = list.filter((e) => e.dim === filter);
    if (pickDay) list = list.filter((e) => e.date === pickDay);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      list = list.filter((e) => (e.note || "").toLowerCase().includes(k) || (DIM[e.dim]?.label || "").includes(k));
    }
    return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [journal, filter, pickDay, q]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => { if (!map.has(e.date)) map.set(e.date, []); map.get(e.date).push(e); });
    return [...map.entries()];
  }, [filtered]);

  // 달력 계산
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const startDow = new Date(month.y, month.m, 1).getDay();
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const ymd = (d) => `${month.y}-${String(month.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const shift = (n) => { const d = new Date(month.y, month.m + n, 1); setMonth({ y: d.getFullYear(), m: d.getMonth() }); };
  const searching = !!q.trim();
  const active = filter || pickDay || searching;

  return (
    <div>
      <Header title="신앙일기" subtitle="매일의 훈련이 모여 나의 여정이 됩니다" />
      <div style={{ padding: "0 16px" }}>
        {/* 오늘 요약 · 아이콘 누르면 그 훈련만 보기 */}
        <div style={{ background: `linear-gradient(155deg, ${T.ink}, #3A335E)`, borderRadius: 16, padding: "16px 18px", color: "#fff", marginBottom: 14, position: "relative", overflow: "hidden" }}>
          <StarField faint />
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={{ margin: 0, fontSize: 13.5, opacity: .75 }}>오늘의 신앙 훈련 <span style={{ opacity: .6 }}>· 아이콘을 누르면 그 훈련만 볼 수 있어요</span></p>
            <p style={{ margin: "3px 0 12px", fontFamily: serif, fontSize: 24.5, fontWeight: 700 }}>{doneCount} <span style={{ fontSize: 15.5, opacity: .7 }}>/ {DIMS.length} 완료</span></p>
            <div style={{ display: "flex", gap: 6 }}>
              {DIMS.map((d) => {
                const on = done7[d.key]; const Ic = d.icon; const sel = filter === d.key;
                return (
                  <button key={d.key} title={d.label} onClick={() => { setFilter(sel ? null : d.key); setPickDay(null); }}
                    style={{ width: 30, height: 30, borderRadius: 9, background: sel ? "#fff" : on ? d.c : "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", border: sel ? `2px solid ${T.gold}` : "none", flexShrink: 0 }}>
                    <Ic size={15} color={sel ? d.c : on ? "#fff" : "rgba(255,255,255,.4)"} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 12px", marginBottom: 12 }}>
          <Search size={16} color={T.muted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="일기 내용 검색"
            style={{ flex: 1, border: "none", outline: "none", padding: "11px 0", fontSize: 14, color: T.ink, background: "transparent" }} />
          {q && <button onClick={() => setQ("")}><X size={15} color={T.muted} /></button>}
        </div>

        {/* 필터 상태 표시 */}
        {active && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
            {filter && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: DIM[filter].c, borderRadius: 999, padding: "4px 10px" }}>{DIM[filter].label}</span>}
            {pickDay && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: T.gold, borderRadius: 999, padding: "4px 10px" }}>{pickDay}</span>}
            {searching && <span style={{ fontSize: 12, fontWeight: 700, color: T.ink, background: T.goldSoft, borderRadius: 999, padding: "4px 10px" }}>"{q}"</span>}
            <span style={{ fontSize: 12, color: T.muted }}>{filtered.length}개</span>
            <button onClick={() => { setFilter(null); setPickDay(null); setQ(""); }} style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: T.gold }}>전체 보기</button>
          </div>
        )}

        {/* 달력 (필터·검색 중이 아닐 때만) */}
        {!active && (
          <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.line}`, padding: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button onClick={() => shift(-1)} style={{ padding: 4 }}><ChevronLeft size={18} color={T.muted} /></button>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{month.y}년 {month.m + 1}월</span>
              <button onClick={() => shift(1)} style={{ padding: 4 }}><ChevronRight size={18} color={T.muted} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => <span key={d} style={{ fontSize: 11, color: T.muted, textAlign: "center", fontWeight: 600 }}>{d}</span>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {cells.map((d, i) => {
                if (!d) return <div key={`e${i}`} />;
                const key = ymd(d);
                const entries = byDay[key] || [];
                const n = entries.length;
                const isToday = key === todayKey();
                return (
                  <button key={d} onClick={() => n && setPickDay(key)} disabled={!n}
                    style={{ aspectRatio: "1", borderRadius: 8, background: n ? `rgba(217,164,65,${0.18 + Math.min(1, n / 8) * 0.55})` : "#F4F0E6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: isToday ? `2px solid ${T.ink}` : "none" }}>
                    <span style={{ fontSize: 11.5, fontWeight: n ? 700 : 400, color: n ? T.ink : T.muted }}>{d}</span>
                    {n > 0 && <span style={{ fontSize: 8.5, color: T.inkSoft }}>{n}개</span>}
                  </button>
                );
              })}
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 11.5, color: T.muted, textAlign: "center" }}>기록이 있는 날을 누르면 그날의 일기를 볼 수 있어요</p>
          </div>
        )}

        {/* 일기 목록 */}
        {groups.length === 0 ? (
          <Empty icon={NotebookPen} text={active ? "조건에 맞는 기록이 없어요." : "아직 기록이 없어요.\n홈에서 훈련 후기를 남겨보세요."} />
        ) : (
          groups.map(([date, entries]) => (
            <div key={date} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                <span style={{ fontFamily: serif, fontSize: 16.5, fontWeight: 700, color: T.ink }}>{date}</span>
                {date === todayKey() && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", background: T.gold, borderRadius: 999, padding: "2px 8px" }}>오늘</span>}
                <div style={{ flex: 1, height: 1, background: T.line }} />
              </div>
              <div style={{ display: "grid", gap: 9 }}>
                {entries.map((e) => {
                  const d = DIM[e.dim]; if (!d) return null; const Ic = d.icon;
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

      {/* 아직 DB 연결 전이라 샘플 화면임을 정직하게 알려줌 */}
      <div style={{ margin: "10px 16px 0", display: "flex", alignItems: "center", gap: 7, background: `${T.gold}12`, border: `1px solid ${T.gold}44`, borderRadius: 10, padding: "8px 11px" }}>
        <Sparkles size={13} color={T.goldDeep} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 11.5, color: T.inkSoft, lineHeight: 1.5 }}>
          <b>미리보기 화면이에요.</b> 아래 나눔·방·쪽지는 예시이고, 실제 지체들과의 연결은 곧 열려요.
        </span>
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
  const [reported, setReported] = useState(() => new Set());
  const report = (id) => setReported((s) => new Set(s).add(id));

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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={() => amen(p.id)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: p.amened ? T.rose : T.muted }}><Heart size={15} fill={p.amened ? T.rose : "none"} color={p.amened ? T.rose : T.muted} /> 아멘 {p.amen}</button>
                {reported.has(p.id)
                  ? <span style={{ fontSize: 12, color: T.muted }}>신고 접수됨</span>
                  : <button onClick={() => report(p.id)} style={{ fontSize: 12.5, color: T.muted, fontWeight: 500 }}>신고</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 방 (그룹) ── */
function Rooms({ award }) {
  const [rooms, setRooms] = useState([]);
  const [members, setMembers] = useState([]);   // 내 멤버십
  const [counts, setCounts] = useState({});     // 방별 인원
  const [pending, setPending] = useState({});   // 방별 신청 수 (방장용)
  const [uid, setUid] = useState(null);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState("all");        // all | mine
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    const id = u?.user?.id; setUid(id);
    const { data: rs } = await supabase.from("rooms").select("*").order("created_at", { ascending: false });
    const { data: ms } = await supabase.from("room_members").select("*");
    setRooms(rs || []);
    const mine = (ms || []).filter((m) => m.user_id === id);
    setMembers(mine);
    const c = {}, p = {};
    (ms || []).forEach((m) => {
      if (m.status === "member") c[m.room_id] = (c[m.room_id] || 0) + 1;
      if (m.status === "pending") p[m.room_id] = (p[m.room_id] || 0) + 1;
    });
    setCounts(c); setPending(p); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const myStatus = (roomId) => members.find((m) => m.room_id === roomId)?.status || null;

  const create = async (form) => {
    if (!uid) return;
    const { data, error } = await supabase.from("rooms")
      .insert({ name: form.name, description: form.desc, church: form.church || null, is_private: form.isPrivate, owner_id: uid })
      .select().single();
    if (!error && data) {
      await supabase.from("room_members").insert({ room_id: data.id, user_id: uid, status: "member", role: "owner" });
      award(10, "새로운 방 개설");
      setCreating(false); load();
    }
  };
  const join = async (room) => {
    if (!uid) return;
    await supabase.from("room_members").insert({
      room_id: room.id, user_id: uid,
      status: room.is_private ? "pending" : "member",
    });
    if (!room.is_private) award(5, "방 참여");
    load();
  };
  const leave = async (room) => {
    if (!uid) return;
    await supabase.from("room_members").delete().eq("room_id", room.id).eq("user_id", uid);
    load();
  };

  const shown = tab === "mine" ? rooms.filter((r) => myStatus(r.id)) : rooms;

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["all", "모든 방"], ["mine", "내 방"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 700, background: tab === k ? T.ink : T.card, color: tab === k ? "#fff" : T.muted, border: `1px solid ${tab === k ? T.ink : T.line}` }}>{l}</button>
        ))}
      </div>

      <button onClick={() => setCreating(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: T.card, border: `1px dashed ${T.gold}`, borderRadius: 14, padding: 13, marginBottom: 14, fontSize: 14.5, fontWeight: 700, color: T.goldDeep }}>
        <Plus size={16} /> 새로운 방 만들기
      </button>

      {loading ? <p style={{ fontSize: 13.5, color: T.muted, textAlign: "center", padding: 20 }}>불러오는 중…</p>
        : shown.length === 0 ? <Empty icon={DoorOpen} text={tab === "mine" ? "아직 참여한 방이 없어요.\n관심 있는 방에 들어가 보세요." : "아직 만들어진 방이 없어요.\n첫 방을 만들어보세요."} />
        : (
        <div style={{ display: "grid", gap: 11, paddingBottom: 8 }}>
          {shown.map((r) => {
            const st = myStatus(r.id);
            const isOwner = r.owner_id === uid;
            const n = counts[r.id] || 0;
            const waiting = isOwner ? (pending[r.id] || 0) : 0;
            return (
              <div key={r.id} style={{ background: T.card, borderRadius: 15, border: `1px solid ${T.line}`, padding: 15 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <span style={{ fontSize: 15.5, fontWeight: 700, color: T.ink }}>{r.name}</span>
                  {r.is_private
                    ? <Tag c={T.violet} bg={`${T.violet}18`}><Lock size={9} /> 비공개</Tag>
                    : <Tag c={T.sage} bg={T.sageSoft}>공개</Tag>}
                  {isOwner && <Tag c={T.goldDeep} bg={T.goldSoft}>방장</Tag>}
                </div>
                {r.description && <p style={{ margin: "0 0 8px", fontSize: 13.5, color: T.muted, lineHeight: 1.5 }}>{r.description}</p>}
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: T.muted, marginBottom: 11 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Users size={13} /> {n}명</span>
                  {r.church && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Church size={13} /> {r.church}</span>}
                  {waiting > 0 && <span style={{ color: T.rose, fontWeight: 700 }}>신청 {waiting}건</span>}
                </div>

                {isOwner ? (
                  <RoomManage room={r} onChanged={load} />
                ) : st === "member" ? (
                  <button onClick={() => leave(r)} style={{ width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 700, background: T.sageSoft, color: T.sage, border: "none" }}>참여 중 · 나가기</button>
                ) : st === "pending" ? (
                  <button onClick={() => leave(r)} style={{ width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 700, background: T.goldSoft, color: T.goldDeep, border: "none" }}>수락 대기 중 · 신청 취소</button>
                ) : (
                  <button onClick={() => join(r)} style={{ width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 700, background: T.ink, color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {r.is_private ? <><Lock size={13} /> 참여 신청하기</> : <><DoorOpen size={14} /> 바로 입장하기</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {creating && <NewRoom onClose={() => setCreating(false)} onCreate={create} />}
    </div>
  );
}

/* 방장용 — 신청 수락/거절 */
function RoomManage({ room, onChanged }) {
  const [reqs, setReqs] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("room_members").select("id, user_id, status").eq("room_id", room.id).eq("status", "pending");
    if (!data?.length) { setReqs([]); return; }
    const { data: ps } = await supabase.from("profiles").select("id, nickname, church").in("id", data.map((d) => d.user_id));
    setReqs(data.map((d) => ({ ...d, p: ps?.find((x) => x.id === d.user_id) })));
  };
  useEffect(() => { load(); }, [room.id]);

  const accept = async (id) => { await supabase.from("room_members").update({ status: "member" }).eq("id", id); load(); onChanged(); };
  const reject = async (id) => { await supabase.from("room_members").delete().eq("id", id); load(); onChanged(); };

  if (!reqs.length) return <div style={{ padding: "9px 0", textAlign: "center", fontSize: 12.5, color: T.muted, background: T.goldSoft, borderRadius: 10 }}>내가 만든 방이에요</div>;

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} style={{ width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 700, background: T.rose, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <UserPlus size={14} /> 참여 신청 {reqs.length}건 {open ? "닫기" : "보기"}
      </button>
      {open && (
        <div style={{ marginTop: 9, display: "grid", gap: 7 }}>
          {reqs.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 9, background: T.paper, borderRadius: 10, padding: "9px 11px", border: `1px solid ${T.line}` }}>
              <Avatar init={(r.p?.nickname || "?")[0]} c={T.violet} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: T.ink }}>{r.p?.nickname || "이름 없음"}</p>
                <p style={{ margin: 0, fontSize: 11.5, color: T.muted }}>{r.p?.church || "미입력"}</p>
              </div>
              <button onClick={() => accept(r.id)} style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", background: T.sage, borderRadius: 8, padding: "6px 11px" }}>수락</button>
              <button onClick={() => reject(r.id)} style={{ fontSize: 12.5, fontWeight: 700, color: T.muted }}>거절</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewRoom({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [church, setChurch] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  return (
    <Sheet onClose={onClose} accent={T.violet} title={<><DoorOpen size={16} color={T.violet} /> 새로운 방 만들기</>}>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: T.muted }}>교회 모임이나 소모임 방을 만들어 지체들을 초대해요.</p>
      <Field icon={DoorOpen} label="방 이름" placeholder="예 · 은혜교회 청년부 / 우리 구역 새벽기도" value={name} onChange={setName} />
      <Field icon={PenLine} label="소개 (선택)" placeholder="어떤 모임인지 알려주세요" value={desc} onChange={setDesc} />
      <Field icon={Church} label="소속 교회 (선택)" placeholder="예 · 은혜교회" value={church} onChange={setChurch} />

      <p style={{ margin: "4px 0 8px", fontSize: 13.5, fontWeight: 700, color: T.ink }}>공개 방식</p>
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {[
          { v: false, ic: DoorOpen, t: "공개 방", d: "누구나 바로 들어올 수 있어요", c: T.sage },
          { v: true, ic: Lock, t: "비공개 방", d: "참여 신청을 방장이 수락해야 들어와요", c: T.violet },
        ].map((o) => {
          const on = isPrivate === o.v; const Ic = o.ic;
          return (
            <button key={String(o.v)} onClick={() => setIsPrivate(o.v)} style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", padding: "13px 14px", borderRadius: 12, background: on ? `${o.c}0F` : T.card, border: `2px solid ${on ? o.c : T.line}` }}>
              <Ic size={19} color={on ? o.c : T.muted} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{o.t}</p>
                <p style={{ margin: "1px 0 0", fontSize: 12, color: T.muted }}>{o.d}</p>
              </div>
              {on && <span style={{ width: 20, height: 20, borderRadius: 999, background: o.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={12} color="#fff" /></span>}
            </button>
          );
        })}
      </div>

      <button onClick={() => onCreate({ name, desc, church, isPrivate })} disabled={!name.trim()}
        style={{ width: "100%", padding: "13px 0", borderRadius: 11, fontSize: 15, fontWeight: 700, background: name.trim() ? T.ink : T.line, color: name.trim() ? "#fff" : T.muted }}>방 만들기 · +10P</button>
    </Sheet>
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
      <p style={{ margin: "0 0 14px", fontSize: 14, color: T.muted }}>교회 모임이나 소모임 방을 만들어 지체들을 초대해요.</p>
      <Field icon={DoorOpen} label="방 이름" placeholder="예 · 은혜교회 청년부 / 우리 구역 새벽기도" value={name} onChange={setName} />
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
  const [blocked, setBlocked] = useState(false);
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
        <p style={{ margin: 0, flex: 1, fontSize: 16.5, fontWeight: 700, color: T.ink }}>{thread.name}</p>
        <button onClick={() => setBlocked((b) => !b)} style={{ fontSize: 12.5, fontWeight: 600, color: blocked ? T.sage : T.rose }}>{blocked ? "차단됨" : "신고·차단"}</button>
      </div>

      {blocked && <div style={{ background: `${T.rose}0F`, borderRadius: 11, padding: "11px 13px", marginBottom: 14, fontSize: 12.5, color: T.ink, lineHeight: 1.6 }}>신고가 접수되고 이 사용자를 차단했어요. 더 이상 쪽지를 받지 않아요. <span style={{ color: T.muted }}>(배포 후 실제 적용)</span></div>}

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
  const link = "https://today-light.vercel.app/";
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
function Points({ points, log, earnedFruits, growingFruit, growStep, selectFruit, growAction, harvestFruit, todayPts, faithDays, goalHitToday, dailyGoal, setDailyGoal }) {
  const { current, prevDays } = stageInfo(faithDays);
  const span = current.days - prevDays;
  const pct = span > 0 ? Math.min(100, ((faithDays - prevDays) / span) * 100) : 100;
  const [fruitOpen, setFruitOpen] = useState(false);
  const todayPct = Math.min(100, (todayPts / dailyGoal) * 100);
  const [goalOpen, setGoalOpen] = useState(false);
  const [allStages, setAllStages] = useState(false);
  const [statOpen, setStatOpen] = useState(false);
  const myGoal = GOAL_OPTIONS.find((g) => g.pts === dailyGoal) || GOAL_OPTIONS[1];

  return (
    <div>
      <Header title="포인트" subtitle="꾸준함이 자라 열매가 됩니다" />
      <div style={{ padding: "0 16px" }}>
        {/* 오늘의 목표 */}
        <div style={{ background: goalHitToday ? `linear-gradient(150deg, ${T.sage}, #4A6B52)` : `linear-gradient(160deg, ${T.ink}, #3A335E)`, borderRadius: 18, padding: "20px", color: "#fff", marginBottom: 12, position: "relative", overflow: "hidden" }}>
          <StarField faint />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: goalHitToday ? "#fff" : T.gold, fontWeight: 700 }}>오늘의 목표 · {dailyGoal}P</span>
              <span style={{ fontSize: 12.5, opacity: .85 }}>{goalHitToday ? "오늘 달성 ✦" : `${Math.max(0, dailyGoal - todayPts)}P 남음`}</span>
            </div>
            <div style={{ fontFamily: serif, fontSize: 38, fontWeight: 700, lineHeight: 1 }}>{todayPts}<span style={{ fontSize: 16, marginLeft: 4, opacity: .7 }}>/ {dailyGoal}P</span></div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,.15)", marginTop: 14 }}>
              <div style={{ width: `${todayPct}%`, height: "100%", borderRadius: 999, background: goalHitToday ? "#fff" : `linear-gradient(90deg, ${T.gold}, ${T.goldGlow})`, transition: "width .6s ease" }} />
            </div>
            <button onClick={() => setGoalOpen(true)} style={{ marginTop: 12, width: "100%", padding: "9px 0", borderRadius: 10, background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {myGoal.emoji} {myGoal.label} · 목표 바꾸기
            </button>
            <p style={{ margin: "9px 0 0", fontSize: 11.5, opacity: .75, lineHeight: 1.5 }}>목표를 넘긴 날 <b>성실한 하루</b> 1일이 쌓여요. 몰아서 해도 하루는 하루예요.</p>
          </div>
        </div>

        {/* 성실한 날 · 현재 단계 */}
        <div style={{ background: T.card, borderRadius: 16, padding: 16, border: `1px solid ${T.line}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: T.ink }}><span style={{ fontSize: 17 }}>{current.emoji}</span>{current.stage} · {current.label}</span>
            <button onClick={() => setStatOpen(true)} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 13, fontWeight: 700, color: T.gold }}>총 {points}P <ChevronRight size={14} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
            <span style={{ fontFamily: serif, fontSize: 30, fontWeight: 700, color: T.ink }}>{faithDays}</span>
            <span style={{ fontSize: 13.5, color: T.muted }}>일째 성실하게 걷는 중 🔥</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, marginBottom: 6 }}>
            <span>다음 · {current.label}</span>
            <span>{faithDays >= current.days ? "달성 ✦" : `${current.days - faithDays}일 더 · 총 ${current.days}일`}</span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: "#F1EDE3" }}><div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${T.gold}, ${T.goldGlow})`, transition: "width .6s ease" }} /></div>
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
          {(() => {
            const curStage = stageInfo(faithDays).current.stage;
            const curIdx = STAGES.findIndex((x) => x.stage === curStage);
            const shown = allStages ? STAGES.map((x, i) => i) : [curIdx - 1, curIdx, curIdx + 1].filter((i) => i >= 0 && i < STAGES.length);
            return STAGES.map((s, si) => {
            if (!shown.includes(si)) return null;
            const allDone = s.steps.every((st) => faithDays >= st.days);
            const isCurrent = s.stage === stageInfo(faithDays).current.stage;
            const started = faithDays >= (si === 0 ? 0 : STAGES[si - 1].steps[STAGES[si - 1].steps.length - 1].days);
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
                      const d = faithDays >= st.days;
                      return (
                        <div key={st.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 15, height: 15, borderRadius: 999, flexShrink: 0, background: d ? T.sage : "transparent", border: d ? "none" : `2px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{d && <Check size={9} color="#fff" />}</span>
                          <span style={{ fontSize: 14, color: d ? T.ink : T.muted, fontWeight: d ? 600 : 400 }}>{st.label}</span>
                          <span style={{ fontSize: 11.5, color: T.muted, marginLeft: "auto" }}>성실한 {st.days}일</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
            });
          })()}
          <button onClick={() => setAllStages((v) => !v)} style={{ width: "100%", padding: "10px 0", marginTop: 2, marginBottom: 8, borderRadius: 10, background: "transparent", color: T.gold, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            {allStages ? "접기" : `전체 여정 보기 (${STAGES.length}단계)`}
            <ChevronRight size={15} style={{ transform: allStages ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .2s" }} />
          </button>
        </div>
      </div>

      {fruitOpen && <FruitChallenge onClose={() => setFruitOpen(false)} earnedFruits={earnedFruits} growingFruit={growingFruit} growStep={growStep} selectFruit={selectFruit} growAction={growAction} harvestFruit={harvestFruit} />}
      {goalOpen && <GoalSheet current={dailyGoal} onPick={(g) => { setDailyGoal(g); setGoalOpen(false); }} onClose={() => setGoalOpen(false)} />}
      {statOpen && <StatSheet onClose={() => setStatOpen(false)} points={points} log={log} dailyGoal={dailyGoal} faithDays={faithDays} />}
    </div>
  );
}

/* 상세 보기 — 달력 · 훈련별 합계 · 적립 내역 */
function StatSheet({ onClose, points, log, dailyGoal, faithDays }) {
  const [logs, setLogs] = useState([]);      // daily_logs
  const [jour, setJour] = useState([]);      // journal (훈련별 합계용)
  const [month, setMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) { setLoading(false); return; }
      const { data: dl } = await supabase.from("daily_logs").select("day, today_pts, goal_hit, done_dims").eq("user_id", uid);
      const { data: jr } = await supabase.from("journal").select("dim").eq("user_id", uid);
      setLogs(dl || []); setJour(jr || []); setLoading(false);
    })();
  }, []);

  const byDay = Object.fromEntries(logs.map((l) => [l.day, l]));
  const first = new Date(month.y, month.m, 1);
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const startDow = first.getDay(); // 0=일
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const ymd = (d) => `${month.y}-${String(month.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const monthLogs = logs.filter((l) => l.day.startsWith(`${month.y}-${String(month.m + 1).padStart(2, "0")}`));
  const monthHit = monthLogs.filter((l) => l.goal_hit).length;
  const monthPts = monthLogs.reduce((a, l) => a + (l.today_pts || 0), 0);

  // 훈련별 합계 (완료 횟수 × 점수)
  const dimCount = {};
  logs.forEach((l) => (l.done_dims || []).forEach((k) => { dimCount[k] = (dimCount[k] || 0) + 1; }));
  const dimStats = DIMS.map((d) => ({ ...d, count: dimCount[d.key] || 0, total: (dimCount[d.key] || 0) * d.pts }))
    .sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(1, ...dimStats.map((d) => d.total));

  const shift = (n) => setMonth((mm) => {
    const d = new Date(mm.y, mm.m + n, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 65, background: T.paper, overflowY: "auto", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, paddingBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${T.line}`, position: "sticky", top: 0, background: T.paper, zIndex: 2 }}>
          <button onClick={onClose}><ChevronLeft size={22} color={T.ink} /></button>
          <span style={{ flex: 1, fontSize: 16.5, fontWeight: 700, color: T.ink }}>나의 기록</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: T.gold }}>총 {points}P</span>
        </div>

        <div style={{ padding: "16px" }}>
          {/* 요약 */}
          <div style={{ display: "flex", gap: 9, marginBottom: 16 }}>
            {[
              { v: faithDays, l: "성실한 날", c: T.gold },
              { v: monthHit, l: "이번 달 달성", c: T.sage },
              { v: monthPts, l: "이번 달 점수", c: T.violet },
            ].map((x) => (
              <div key={x.l} style={{ flex: 1, background: T.card, borderRadius: 13, border: `1px solid ${T.line}`, padding: "13px 8px", textAlign: "center" }}>
                <p style={{ margin: 0, fontFamily: serif, fontSize: 22, fontWeight: 700, color: x.c }}>{x.v}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: T.muted }}>{x.l}</p>
              </div>
            ))}
          </div>

          {/* 달력 */}
          <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.line}`, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button onClick={() => shift(-1)} style={{ padding: 4 }}><ChevronLeft size={18} color={T.muted} /></button>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{month.y}년 {month.m + 1}월</span>
              <button onClick={() => shift(1)} style={{ padding: 4 }}><ChevronRight size={18} color={T.muted} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <span key={d} style={{ fontSize: 11, color: T.muted, textAlign: "center", fontWeight: 600 }}>{d}</span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {cells.map((d, i) => {
                if (!d) return <div key={`e${i}`} />;
                const rec = byDay[ymd(d)];
                const pts = rec?.today_pts || 0;
                const hit = rec?.goal_hit;
                const ratio = Math.min(1, pts / dailyGoal);
                const bg = hit ? T.sage : pts > 0 ? `rgba(217,164,65,${0.2 + ratio * 0.5})` : "#F4F0E6";
                const isToday = ymd(d) === todayKey();
                return (
                  <div key={d} title={`${pts}P`} style={{ aspectRatio: "1", borderRadius: 8, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: isToday ? `2px solid ${T.ink}` : "none" }}>
                    <span style={{ fontSize: 11.5, fontWeight: hit ? 700 : 500, color: hit ? "#fff" : pts > 0 ? T.ink : T.muted }}>{d}</span>
                    {pts > 0 && <span style={{ fontSize: 8.5, color: hit ? "rgba(255,255,255,.85)" : T.muted }}>{pts}</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "center", fontSize: 11, color: T.muted }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: T.sage }} /> 목표 달성</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(217,164,65,.5)" }} /> 일부 완료</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#F4F0E6" }} /> 쉼</span>
            </div>
          </div>

          {/* 훈련별 합계 */}
          <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.line}`, padding: 16, marginBottom: 16 }}>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: T.ink }}>훈련별 합계</p>
            <p style={{ margin: "0 0 13px", fontSize: 12, color: T.muted }}>어떤 훈련에 많이 머물렀는지 볼 수 있어요</p>
            {loading ? <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 12 }}>불러오는 중…</p> : dimStats.map((d) => (
              <div key={d.key} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <d.icon size={14} color={d.c} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: T.ink }}>{d.label}</span>
                  <span style={{ fontSize: 12, color: T.muted }}>{d.count}회</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: d.c, minWidth: 42, textAlign: "right" }}>{d.total}P</span>
                </div>
                <div style={{ height: 5, borderRadius: 999, background: "#F1EDE3" }}>
                  <div style={{ width: `${(d.total / maxTotal) * 100}%`, height: "100%", borderRadius: 999, background: d.c, transition: "width .5s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* 최근 적립 */}
          <p style={{ margin: "0 0 11px", fontSize: 14, fontWeight: 700, color: T.ink }}>최근 적립</p>
          {log.length === 0 ? (
            <Empty icon={Feather} text={"아직 오늘의 첫 걸음 전이에요.\n홈에서 훈련을 시작해 보세요."} />
          ) : (
            <div style={{ display: "grid", gap: 7 }}>
              {log.slice(0, 15).map((e) => (
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
      </div>
    </div>
  );
}

function GoalSheet({ current, onPick, onClose }) {
  return (
    <Sheet onClose={onClose} accent={T.gold} title={<>🎯 하루 목표 정하기</>}>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
        내 상황에 맞는 목표를 골라요. 목표를 넘긴 날이 <b style={{ color: T.ink }}>성실한 하루</b>로 쌓여 믿음의 나무가 자라요.
      </p>
      <div style={{ display: "grid", gap: 9 }}>
        {GOAL_OPTIONS.map((g) => {
          const on = g.pts === current;
          return (
            <button key={g.pts} onClick={() => onPick(g.pts)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "14px 15px", borderRadius: 13, background: on ? T.goldSoft : T.card, border: `2px solid ${on ? T.gold : T.line}` }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{g.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>{g.label} · 하루 {g.pts}P</p>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: T.muted }}>{g.desc}</p>
              </div>
              {on && <span style={{ width: 22, height: 22, borderRadius: 999, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={13} color="#fff" /></span>}
            </button>
          );
        })}
      </div>
      <p style={{ margin: "14px 2px 0", fontSize: 11.5, color: T.muted, lineHeight: 1.5, textAlign: "center" }}>목표를 바꿔도 지금까지 쌓은 성실한 날은 그대로 남아요 ✦</p>
    </Sheet>
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
function Me({ user, profileComplete, authReady, points, signOut, isAdmin, dbContents, dbVerses, loadContents, faithDays }) {
  const [admin, setAdmin] = useState(false);
  if (!authReady) return <div style={{ padding: 60, textAlign: "center", color: T.muted, fontSize: 14 }}>불러오는 중…</div>;
  if (!user) return <SignIn />;
  if (!profileComplete) return <ProfileSetup user={user} />;
  return (
    <>
      <Profile user={user} points={points} onOut={signOut} isAdmin={isAdmin} onAdmin={() => setAdmin(true)} faithDays={faithDays} />
      {admin && <AdminPanel onClose={() => setAdmin(false)} dbContents={dbContents} dbVerses={dbVerses} reload={loadContents} />}
    </>
  );
}


/* 문의 · 제휴 보내기 */
const INQ_KINDS = [
  { k: "church", label: "우리 교회에 도입하고 싶어요" },
  { k: "partner", label: "제휴 · 협업 제안" },
  { k: "bug", label: "오류 신고" },
  { k: "idea", label: "건의 · 아이디어" },
  { k: "etc", label: "기타" },
];

function InquirySheet({ user, onClose }) {
  const [kind, setKind] = useState("church");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const send = async () => {
    if (!body.trim()) { setErr("내용을 적어주세요."); return; }
    if (!email.trim()) { setErr("답장 받으실 이메일을 적어주세요."); return; }
    setBusy(true); setErr("");

    const row = {
      kind,
      name: name.trim() || null,
      email: email.trim(),
      body: body.trim(),
      user_id: user?.id || null,
    };

    // DB에 저장된 문의는 관리자 > 문의함에서 바로 확인해요 (메일 없이 앱 안에서 처리)
    const { error } = await supabase.from("inquiries").insert(row);
    if (error) { setErr("전송 실패: " + error.message); setBusy(false); return; }

    setBusy(false); setDone(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(26,22,45,.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: T.paper, borderRadius: "20px 20px 0 0", padding: "18px 18px 28px", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <span style={{ flex: 1, fontSize: 17, fontWeight: 700, color: T.ink, fontFamily: serif }}>문의 · 제휴</span>
          <button onClick={onClose}><X size={20} color={T.muted} /></button>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "26px 10px" }}>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: T.sageSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Check size={26} color={T.sage} />
            </div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.ink }}>잘 전달됐어요</p>
            <p style={{ margin: "6px 0 18px", fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
              적어주신 이메일로 답장드릴게요.<br />귀한 마음 감사합니다 🙏
            </p>
            <button onClick={onClose} style={{ width: "100%", padding: "13px 0", borderRadius: 11, background: T.ink, color: "#fff", fontSize: 14.5, fontWeight: 700 }}>닫기</button>
          </div>
        ) : (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
              다른 교회 도입, 제휴 제안, 오류 신고 무엇이든 좋아요. 확인하는 대로 답장드릴게요.
            </p>

            <p style={{ margin: "0 0 6px", fontSize: 12.5, fontWeight: 700, color: T.inkSoft }}>어떤 내용인가요?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {INQ_KINDS.map((x) => (
                <button key={x.k} onClick={() => setKind(x.k)}
                  style={{ fontSize: 12, fontWeight: 700, padding: "7px 11px", borderRadius: 999,
                    background: kind === x.k ? T.ink : T.card, color: kind === x.k ? "#fff" : T.muted,
                    border: `1px solid ${kind === x.k ? T.ink : T.line}` }}>{x.label}</button>
              ))}
            </div>

            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="성함 또는 교회 이름 (선택)"
              style={{ width: "100%", boxSizing: "border-box", background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "13px", fontSize: 14.5, color: T.ink, marginBottom: 9, outline: "none" }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="답장 받으실 이메일"
              style={{ width: "100%", boxSizing: "border-box", background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "13px", fontSize: 14.5, color: T.ink, marginBottom: 9, outline: "none" }} />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="내용을 자유롭게 적어주세요."
              style={{ width: "100%", boxSizing: "border-box", background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "13px", fontSize: 14.5, color: T.ink, lineHeight: 1.6, resize: "none", outline: "none", fontFamily: "inherit" }} />

            {err && <p style={{ margin: "9px 0 0", fontSize: 12.5, color: T.rose }}>{err}</p>}

            <button onClick={send} disabled={busy}
              style={{ width: "100%", padding: "14px 0", marginTop: 13, borderRadius: 11, background: busy ? T.muted : T.gold, color: "#fff", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Send size={16} /> {busy ? "보내는 중…" : "보내기"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* 관리자 — 문의함 */
function AdminInquiries() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("inquiries")
      .select("*").order("created_at", { ascending: false });
    if (error) { setErr(error.message); setRows([]); return; }
    setErr(""); setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const toggleDone = async (r) => {
    const v = !r.handled;
    await supabase.from("inquiries").update({ handled: v }).eq("id", r.id);
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, handled: v } : x)));
  };

  if (rows === null) return <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 30 }}>불러오는 중…</p>;
  if (err) return (
    <div style={{ background: `${T.rose}10`, border: `1px solid ${T.rose}44`, borderRadius: 12, padding: 14 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.rose }}>문의함을 불러오지 못했어요</p>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}>Supabase에 <b>inquiries 테이블</b>과 관리자 조회 권한(RLS)이 있는지 확인해 주세요.</p>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: T.muted, wordBreak: "break-all" }}>{err}</p>
    </div>
  );

  const open = rows.filter((r) => !r.handled);
  const fmt = (d) => { const t = new Date(d); return `${t.getMonth() + 1}.${t.getDate()} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`; };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[{ n: rows.length, l: "전체 문의" }, { n: open.length, l: "미처리" }].map((s) => (
          <div key={s.l} style={{ flex: 1, background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, padding: "11px 8px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: s.l === "미처리" && s.n > 0 ? T.rose : T.ink, fontFamily: serif }}>{s.n}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: T.muted }}>{s.l}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 && <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 24 }}>아직 들어온 문의가 없어요.</p>}

      {rows.map((r) => (
        <div key={r.id} style={{ background: T.card, borderRadius: 12, border: `1px solid ${r.handled ? T.line : `${T.gold}66`}`, padding: 13, marginBottom: 9, opacity: r.handled ? 0.6 : 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: T.goldDeep, background: T.goldSoft, borderRadius: 999, padding: "2px 8px" }}>
              {INQ_KINDS.find((x) => x.k === r.kind)?.label || r.kind}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted }}>{fmt(r.created_at)}</span>
          </div>
          <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: T.ink }}>{r.name || "(이름 없음)"}</p>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: T.muted, wordBreak: "break-all" }}>{r.email}</p>
          <p style={{ margin: "0 0 10px", fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{r.body}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={`mailto:${r.email}?subject=${encodeURIComponent("[오늘의 빛] 문의 주셔서 감사합니다")}`}
              style={{ fontSize: 12.5, fontWeight: 700, color: T.violet }}>메일로 답장</a>
            <button onClick={() => toggleDone(r)} style={{ fontSize: 12.5, fontWeight: 700, color: r.handled ? T.muted : T.sage }}>
              {r.handled ? "처리 취소" : "처리 완료"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

/* 관리자 — 회원 관리 */
function AdminMembers() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const { data, error } = await supabase.from("profiles")
      .select("id, nickname, church, email, points, faith_days, is_admin, is_blocked, created_at")
      .order("created_at", { ascending: false });
    if (error) { setErr(error.message); setRows([]); return; }
    setErr(""); setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const patch = async (id, fields) => {
    setBusyId(id);
    const { error } = await supabase.from("profiles").update(fields).eq("id", id);
    if (error) alert("수정 실패: " + error.message);
    else setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...fields } : r)));
    setBusyId(null);
  };

  if (rows === null) return <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 30 }}>회원 목록을 불러오는 중…</p>;

  if (err) return (
    <div style={{ background: `${T.rose}10`, border: `1px solid ${T.rose}44`, borderRadius: 12, padding: 14 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.rose }}>회원 목록을 불러오지 못했어요</p>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}>
        Supabase에서 <b>관리자 조회 권한(RLS 정책)</b>과 <b>profiles 테이블의 email · created_at · is_blocked 칸</b>이
        설정되어 있는지 확인해 주세요.
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: T.muted, wordBreak: "break-all" }}>{err}</p>
    </div>
  );

  const now = Date.now();
  const since = (d) => now - new Date(d || 0).getTime();
  const newToday = rows.filter((r) => r.created_at && new Date(r.created_at).toDateString() === new Date().toDateString()).length;
  const new7 = rows.filter((r) => r.created_at && since(r.created_at) < 7 * 864e5).length;

  const kw = q.trim().toLowerCase();
  const list = kw
    ? rows.filter((r) => [r.nickname, r.church, r.email].some((x) => (x || "").toLowerCase().includes(kw)))
    : rows;

  const fmt = (d) => {
    if (!d) return "가입일 없음";
    const t = new Date(d);
    return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
  };

  return (
    <>
      {/* 요약 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { n: rows.length, l: "전체 회원" },
          { n: newToday, l: "오늘 가입" },
          { n: new7, l: "최근 7일" },
        ].map((s) => (
          <div key={s.l} style={{ flex: 1, background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, padding: "11px 8px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: T.ink, fontFamily: serif }}>{s.n}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: T.muted }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* 검색 */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "9px 12px", marginBottom: 12 }}>
        <Search size={15} color={T.muted} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="닉네임 · 교회 · 이메일로 찾기"
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: T.ink }} />
        {q && <button onClick={() => setQ("")}><X size={14} color={T.muted} /></button>}
      </div>

      {list.length === 0 && <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 24 }}>해당하는 회원이 없어요.</p>}

      {list.map((r) => (
        <div key={r.id} style={{ background: T.card, borderRadius: 12, border: `1px solid ${r.is_blocked ? `${T.rose}55` : T.line}`, padding: 13, marginBottom: 9, opacity: r.is_blocked ? 0.65 : 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{r.nickname || "(닉네임 없음)"}</p>
            {r.is_admin && <span style={{ fontSize: 10, fontWeight: 700, color: T.violet, background: `${T.violet}18`, borderRadius: 999, padding: "2px 7px" }}>관리자</span>}
            {r.is_blocked && <span style={{ fontSize: 10, fontWeight: 700, color: T.rose, background: `${T.rose}18`, borderRadius: 999, padding: "2px 7px" }}>차단됨</span>}
            <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted }}>{fmt(r.created_at)} 가입</span>
          </div>

          <p style={{ margin: "0 0 2px", fontSize: 12, color: T.muted, wordBreak: "break-all" }}>{r.email || "이메일 없음"}</p>
          <p style={{ margin: "0 0 9px", fontSize: 12, color: T.muted }}>
            {r.church || "교회 미입력"} · {r.points || 0}P · 성실한 날 {r.faith_days || 0}일
          </p>

          <div style={{ display: "flex", gap: 7 }}>
            <button disabled={busyId === r.id} onClick={() => patch(r.id, { is_admin: !r.is_admin })}
              style={{ fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 8, color: r.is_admin ? T.muted : T.violet, border: `1px solid ${T.line}`, background: "transparent" }}>
              {r.is_admin ? "관리자 해제" : "관리자 지정"}
            </button>
            <button disabled={busyId === r.id} onClick={() => {
                if (!r.is_blocked && !confirm(`${r.nickname || "이 회원"}님을 차단할까요?`)) return;
                patch(r.id, { is_blocked: !r.is_blocked });
              }}
              style={{ fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 8, color: r.is_blocked ? T.sage : T.rose, border: `1px solid ${T.line}`, background: "transparent" }}>
              {r.is_blocked ? "차단 해제" : "차단"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

/* 관리자 — 콘텐츠 관리 */
function AdminPanel({ onClose, dbContents, dbVerses, reload }) {
  const CATS = [
    { key: "qt", label: "QT 영상" },
    { key: "praise", label: "찬양" },
    { key: "worship", label: "예배·설교" },
    { key: "mission", label: "구제·선교 후원처" },
    { key: "book", label: "추천 도서" },
    { key: "lecture", label: "강연·수련회" },
  ];
  const [tab, setTab] = useState("qt");
  const [editing, setEditing] = useState(null); // 콘텐츠 객체 or 'new'
  const [vEdit, setVEdit] = useState(null);     // 구절 편집
  const [busy, setBusy] = useState(false);
  const isVerse = tab === "verse";
  const isMember = tab === "member";

  const save = async (row) => {
    setBusy(true);
    const payload = { category: tab, title: row.title, subtitle: row.subtitle, url: row.url, kind: row.kind || "site", sort_order: Number(row.sort_order) || 0, active: true };
    if (row.id) await supabase.from("contents").update(payload).eq("id", row.id);
    else await supabase.from("contents").insert(payload);
    setEditing(null); await reload(); setBusy(false);
  };
  const del = async (id) => {
    if (!confirm("정말 삭제할까요?")) return;
    setBusy(true); await supabase.from("contents").delete().eq("id", id); await reload(); setBusy(false);
  };
  const saveVerse = async (v) => {
    setBusy(true);
    const payload = { ref: v.ref, ref_en: v.ref_en, ko: v.ko, web: v.web, asv: v.asv, sort_order: Number(v.sort_order) || 0, active: true };
    if (v.id) await supabase.from("verses").update(payload).eq("id", v.id);
    else await supabase.from("verses").insert(payload);
    setVEdit(null); await reload(); setBusy(false);
  };
  const delVerse = async (id) => {
    if (!confirm("이 구절을 삭제할까요?")) return;
    setBusy(true); await supabase.from("verses").delete().eq("id", id); await reload(); setBusy(false);
  };

  const rows = dbContents.filter((c) => c.category === tab);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, background: T.paper, overflowY: "auto", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, paddingBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${T.line}`, position: "sticky", top: 0, background: T.paper, zIndex: 2 }}>
          <button onClick={onClose}><ChevronLeft size={22} color={T.ink} /></button>
          <span style={{ flex: 1, fontSize: 16.5, fontWeight: 700, color: T.ink }}>관리자</span>
          {busy && <span style={{ fontSize: 12, color: T.muted }}>저장 중…</span>}
        </div>

        <div style={{ display: "flex", gap: 6, padding: "12px 16px", overflowX: "auto" }}>
          {[{ key: "inbox", label: "✉️ 문의함" }, { key: "member", label: "👤 회원 관리" }, ...CATS, { key: "verse", label: "암송 구절" }].map((c) => (
            <button key={c.key} onClick={() => { setTab(c.key); setEditing(null); setVEdit(null); }}
              style={{ whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 700, padding: "7px 12px", borderRadius: 999, flexShrink: 0,
                background: tab === c.key ? T.ink : T.card, color: tab === c.key ? "#fff" : T.muted, border: `1px solid ${tab === c.key ? T.ink : T.line}` }}>{c.label}</button>
          ))}
        </div>

        <div style={{ padding: "0 16px" }}>
          {tab === "inbox" ? <AdminInquiries /> : isMember ? <AdminMembers /> : isVerse ? (
            <>
              <button onClick={() => setVEdit({ ref: "", ref_en: "", ko: "", web: "", asv: "", sort_order: dbVerses.length + 1 })} style={{ width: "100%", padding: "12px 0", borderRadius: 11, background: T.gold, color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Plus size={16} /> 구절 추가</button>
              {dbVerses.length === 0 && <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 20 }}>아직 등록된 구절이 없어요.<br />추가하면 앱의 오늘의 암송에 나와요.</p>}
              {dbVerses.map((v) => (
                <div key={v.id} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.line}`, padding: 13, marginBottom: 9 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.goldDeep }}>{v.ref}</p>
                  <p style={{ margin: "4px 0 8px", fontSize: 13.5, color: T.ink, lineHeight: 1.5, fontFamily: serif }}>{v.ko}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setVEdit(v)} style={{ fontSize: 12.5, color: T.gold, fontWeight: 700 }}>수정</button>
                    <button onClick={() => delVerse(v.id)} style={{ fontSize: 12.5, color: T.rose, fontWeight: 700 }}>삭제</button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <button onClick={() => setEditing({ title: "", subtitle: "", url: "", kind: "site", sort_order: rows.length + 1 })} style={{ width: "100%", padding: "12px 0", borderRadius: 11, background: T.gold, color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Plus size={16} /> 새 항목 추가</button>
              {rows.length === 0 && <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 20 }}>아직 등록된 항목이 없어요.</p>}
              {rows.map((r) => (
                <div key={r.id} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.line}`, padding: 13, marginBottom: 9 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ margin: 0, flex: 1, fontSize: 14, fontWeight: 700, color: T.ink }}>{r.title}</p>
                    {r.kind === "embed" && <span style={{ fontSize: 10, fontWeight: 700, color: T.violet, background: `${T.violet}18`, borderRadius: 999, padding: "2px 7px" }}>앱 내 재생</span>}
                  </div>
                  <p style={{ margin: "3px 0 6px", fontSize: 12.5, color: T.muted }}>{r.subtitle}</p>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: T.muted, wordBreak: "break-all" }}>{r.url}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditing(r)} style={{ fontSize: 12.5, color: T.gold, fontWeight: 700 }}>수정</button>
                    <button onClick={() => del(r.id)} style={{ fontSize: 12.5, color: T.rose, fontWeight: 700 }}>삭제</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {editing && <ContentForm row={editing} cat={tab} onCancel={() => setEditing(null)} onSave={save} />}
        {vEdit && <VerseForm row={vEdit} onCancel={() => setVEdit(null)} onSave={saveVerse} />}
      </div>
    </div>
  );
}

function ContentForm({ row, cat, onCancel, onSave }) {
  const [f, setF] = useState(row);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const isMedia = cat === "qt" || cat === "praise" || cat === "worship";
  return (
    <Sheet onClose={onCancel} accent={T.gold} title={row.id ? "항목 수정" : "새 항목 추가"}>
      <Field icon={Feather} label="이름" placeholder="예 · 큐티인 오늘의 큐티" value={f.title} onChange={(v) => set("title", v)} />
      <Field icon={PenLine} label="설명" placeholder="예 · 재생목록 · 앱 안에서 재생" value={f.subtitle || ""} onChange={(v) => set("subtitle", v)} />
      <Field icon={ExternalLink} label="링크(URL)" placeholder="https://..." value={f.url || ""} onChange={(v) => set("url", v)} />
      {isMedia && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 7px", fontSize: 13.5, fontWeight: 700, color: T.ink }}>열기 방식</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ k: "embed", l: "앱 안에서 재생" }, { k: "site", l: "새 탭에서 열기" }].map((o) => (
              <button key={o.k} onClick={() => set("kind", o.k)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, background: f.kind === o.k ? T.ink : T.card, color: f.kind === o.k ? "#fff" : T.muted, border: `1px solid ${f.kind === o.k ? T.ink : T.line}` }}>{o.l}</button>
            ))}
          </div>
          <p style={{ margin: "7px 2px 0", fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>* 유튜브 재생목록은 <b>youtube.com/embed/videoseries?list=…</b> 형태로 넣고 "앱 안에서 재생"을 고르세요.</p>
        </div>
      )}
      <button onClick={() => onSave(f)} disabled={!f.title} style={{ width: "100%", padding: "13px 0", borderRadius: 11, fontSize: 15, fontWeight: 700, background: f.title ? T.ink : T.line, color: f.title ? "#fff" : T.muted }}>저장</button>
    </Sheet>
  );
}

function VerseForm({ row, onCancel, onSave }) {
  const [f, setF] = useState(row);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  return (
    <Sheet onClose={onCancel} accent={T.gold} title={row.id ? "구절 수정" : "구절 추가"}>
      <Field icon={BookOpen} label="장절 (한글)" placeholder="예 · 요한복음 3:16" value={f.ref} onChange={(v) => set("ref", v)} />
      <Field icon={BookOpen} label="장절 (영어)" placeholder="예 · John 3:16" value={f.ref_en || ""} onChange={(v) => set("ref_en", v)} />
      <TextArea label="개역한글" placeholder="한글 본문" value={f.ko} onChange={(v) => set("ko", v)} />
      <TextArea label="WEB (현대 영어)" placeholder="English (World English Bible)" value={f.web || ""} onChange={(v) => set("web", v)} />
      <TextArea label="ASV (고전 영어)" placeholder="English (American Standard Version)" value={f.asv || ""} onChange={(v) => set("asv", v)} />
      <button onClick={() => onSave(f)} disabled={!f.ref || !f.ko} style={{ width: "100%", padding: "13px 0", borderRadius: 11, fontSize: 15, fontWeight: 700, background: (f.ref && f.ko) ? T.ink : T.line, color: (f.ref && f.ko) ? "#fff" : T.muted }}>저장</button>
    </Sheet>
  );
}

function TextArea({ label, placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <p style={{ margin: "0 0 7px", fontSize: 13.5, fontWeight: 700, color: T.ink }}>{label}</p>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{ width: "100%", border: `1px solid ${T.line}`, outline: "none", borderRadius: 11, padding: "11px 13px", fontSize: 14, color: T.ink, background: T.card, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }} />
    </div>
  );
}

function RoutineSheet({ onClose }) {
  const [rows, setRows] = useState([]);
  const [uid, setUid] = useState(null);
  const [edit, setEdit] = useState(null);
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "default");
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  const load = async (id) => {
    const { data } = await supabase.from("routines").select("*").eq("user_id", id).order("time");
    setRows(data || []);
  };
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u?.user?.id; setUid(id);
      if (id) load(id);
    })();
  }, []);

  const askPerm = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPerm(p);
  };
  const save = async (r) => {
    const payload = { user_id: uid, title: r.title, dim: r.dim || null, time: r.time, days: r.days, active: true };
    if (r.id) await supabase.from("routines").update(payload).eq("id", r.id);
    else await supabase.from("routines").insert(payload);
    setEdit(null); load(uid);
  };
  const del = async (id) => { if (!confirm("이 루틴을 지울까요?")) return; await supabase.from("routines").delete().eq("id", id); load(uid); };
  const toggle = async (r) => { await supabase.from("routines").update({ active: !r.active }).eq("id", r.id); load(uid); };

  return (
    <Sheet onClose={onClose} accent={T.violet} title={<><Clock size={16} color={T.violet} /> 나만의 루틴</>}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: T.muted, lineHeight: 1.6 }}>매일 훈련할 시간을 정하면 그 시간에 알려드려요. 나만의 리듬을 만들어요.</p>

      {perm !== "granted" && (
        <button onClick={askPerm} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, background: T.goldSoft, border: `1px solid ${T.gold}`, borderRadius: 11, padding: "11px 13px", marginBottom: 13, textAlign: "left" }}>
          <Bell size={17} color={T.goldDeep} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: T.ink, lineHeight: 1.5 }}><b>알림을 켜주세요</b><br /><span style={{ fontSize: 11.5, color: T.muted }}>눌러서 알림을 허용하면 루틴 시간에 알려드려요</span></span>
        </button>
      )}

      <button onClick={() => setEdit({ title: "", dim: "", time: "06:00", days: [0,1,2,3,4,5,6] })}
        style={{ width: "100%", padding: "12px 0", borderRadius: 11, background: T.violet, color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Plus size={16} /> 루틴 추가
      </button>

      {rows.length === 0 && <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "16px 0" }}>아직 루틴이 없어요.<br />추가해서 나만의 리듬을 만들어보세요.</p>}
      {rows.map((r) => (
        <div key={r.id} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.line}`, padding: 13, marginBottom: 9, opacity: r.active ? 1 : .5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontFamily: serif, fontSize: 21, fontWeight: 700, color: T.ink }}>{r.time}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}>{r.title}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11.5, color: T.muted }}>
                {r.dim && DIM[r.dim] ? `${DIM[r.dim].label} · ` : ""}
                {(r.days || []).length === 7 ? "매일" : (r.days || []).map((d) => DAYS[d]).join("·")}
              </p>
            </div>
            <button onClick={() => toggle(r)} style={{ width: 40, height: 23, borderRadius: 999, background: r.active ? T.sage : T.line, position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 2, left: r.active ? 20 : 2, width: 19, height: 19, borderRadius: 999, background: "#fff", transition: "left .2s" }} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 9, marginTop: 9 }}>
            <button onClick={() => setEdit(r)} style={{ fontSize: 12.5, color: T.gold, fontWeight: 700 }}>수정</button>
            <button onClick={() => del(r.id)} style={{ fontSize: 12.5, color: T.rose, fontWeight: 700 }}>삭제</button>
          </div>
        </div>
      ))}

      {edit && <RoutineForm row={edit} onCancel={() => setEdit(null)} onSave={save} />}
    </Sheet>
  );
}

function RoutineForm({ row, onCancel, onSave }) {
  const [f, setF] = useState(row);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const toggleDay = (d) => set("days", f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort());
  return (
    <Sheet onClose={onCancel} accent={T.violet} title={row.id ? "루틴 수정" : "루틴 추가"}>
      <Field icon={Feather} label="루틴 이름" placeholder="예 · 새벽 QT" value={f.title} onChange={(v) => set("title", v)} />
      <div style={{ marginBottom: 13 }}>
        <p style={{ margin: "0 0 7px", fontSize: 13.5, fontWeight: 700, color: T.ink }}>시간</p>
        <input type="time" value={f.time} onChange={(e) => set("time", e.target.value)}
          style={{ width: "100%", border: `1px solid ${T.line}`, borderRadius: 11, padding: "12px 13px", fontSize: 16, color: T.ink, background: T.card, outline: "none", fontFamily: "inherit" }} />
      </div>
      <div style={{ marginBottom: 13 }}>
        <p style={{ margin: "0 0 7px", fontSize: 13.5, fontWeight: 700, color: T.ink }}>요일</p>
        <div style={{ display: "flex", gap: 5 }}>
          {DAYS.map((d, i) => {
            const on = f.days.includes(i);
            return (
              <button key={i} onClick={() => toggleDay(i)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, fontSize: 13, fontWeight: 700, background: on ? T.violet : T.card, color: on ? "#fff" : T.muted, border: `1px solid ${on ? T.violet : T.line}` }}>{d}</button>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: "0 0 7px", fontSize: 13.5, fontWeight: 700, color: T.ink }}>연결할 훈련 (선택)</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {DIMS.map((d) => {
            const on = f.dim === d.key;
            return (
              <button key={d.key} onClick={() => set("dim", on ? "" : d.key)} style={{ fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: 999, background: on ? d.c : T.card, color: on ? "#fff" : T.muted, border: `1px solid ${on ? d.c : T.line}` }}>{d.label}</button>
            );
          })}
        </div>
      </div>
      <button onClick={() => onSave(f)} disabled={!f.title || !f.days.length}
        style={{ width: "100%", padding: "13px 0", borderRadius: 11, fontSize: 15, fontWeight: 700, background: (f.title && f.days.length) ? T.ink : T.line, color: (f.title && f.days.length) ? "#fff" : T.muted }}>저장</button>
    </Sheet>
  );
}

function Profile({ user, points, onOut, isAdmin, onAdmin, faithDays = 0 }) {
  const st = stageInfo(faithDays).current;
  const [invite, setInvite] = useState(false);
  const [safety, setSafety] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [routineOpen, setRoutineOpen] = useState(false);
  const [inqOpen, setInqOpen] = useState(false);
  const [newInq, setNewInq] = useState(0);   // 안 읽은 문의 개수 (관리자 배지)
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { count } = await supabase.from("inquiries")
        .select("id", { count: "exact", head: true }).eq("handled", false);
      if (typeof count === "number") setNewInq(count);
    })();
  }, [isAdmin, inqOpen]);
  const kakao = user.method === "kakao";
  return (
    <div>
      <div style={{ background: `linear-gradient(170deg, ${T.ink}, #3A335E)`, padding: "40px 24px 28px", color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <StarField />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ width: 66, height: 66, borderRadius: 999, background: T.gold, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, color: T.ink, fontFamily: serif }}>{user.name[0]}</div>
          <h2 style={{ fontFamily: serif, fontSize: 23, margin: 0 }}>{user.name}님</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 7, background: "rgba(255,255,255,.14)", padding: "4px 13px", borderRadius: 999, fontSize: 13.5 }}><ShieldCheck size={13} color={T.gold} /> {st.emoji} {st.stage} 단계</div>
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
          <InfoRow icon={Church} label="소속 교회" value={user.church} />
          <InfoRow icon={kakao ? MessageCircle : Mail} label="로그인" value={kakao ? "카카오 로그인" : user.email} last />
        </div>
        {isAdmin && (
          <button onClick={onAdmin} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: `linear-gradient(150deg, ${T.ink}, #3A335E)`, border: "none", borderRadius: 14, padding: 15, marginBottom: 16, textAlign: "left" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><PenLine size={20} color={T.gold} /></div>
              {newInq > 0 && (
                <span style={{ position: "absolute", top: -5, right: -5, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: T.rose, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>{newInq}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>관리자 페이지</p>
              <p style={{ margin: "2px 0 0", fontSize: 13.5, color: "rgba(255,255,255,.7)" }}>
                {newInq > 0 ? `새 문의 ${newInq}건 · 회원 · 콘텐츠 관리` : "문의 · 회원 · 콘텐츠 관리"}
              </p>
            </div>
            <ChevronRight size={18} color={T.gold} />
          </button>
        )}
        <button onClick={() => setRoutineOpen(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: 15, marginBottom: 16, textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `${T.violet}16`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Clock size={20} color={T.violet} /></div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.ink }}>나만의 루틴 · 알림</p>
            <p style={{ margin: "2px 0 0", fontSize: 13.5, color: T.muted }}>내 시간에 맞춰 알려드려요</p>
          </div>
          <ChevronRight size={18} color={T.muted} />
        </button>
        <button onClick={() => setPwOpen(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: 15, marginBottom: 16, textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: T.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Lock size={20} color={T.goldDeep} /></div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.ink }}>비밀번호 설정</p>
            <p style={{ margin: "2px 0 0", fontSize: 13.5, color: T.muted }}>이메일 + 비밀번호로 로그인하기</p>
          </div>
          <ChevronRight size={18} color={T.muted} />
        </button>
        <button onClick={() => setSafety(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: 15, marginBottom: 16, textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `${T.rose}16`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ShieldCheck size={20} color={T.rose} /></div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.ink }}>커뮤니티 규칙 · 신고 안내</p>
            <p style={{ margin: "2px 0 0", fontSize: 13.5, color: T.muted }}>건강한 공동체를 함께 지켜요</p>
          </div>
          <ChevronRight size={18} color={T.muted} />
        </button>
        <button onClick={() => setInqOpen(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: 15, marginBottom: 16, textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `${T.sage}16`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Mail size={20} color={T.sage} /></div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.ink }}>문의 · 제휴</p>
            <p style={{ margin: "2px 0 0", fontSize: 13.5, color: T.muted }}>교회 도입 · 건의 · 오류 신고</p>
          </div>
          <ChevronRight size={18} color={T.muted} />
        </button>
        <button onClick={onOut} style={{ width: "100%", padding: "12px 0", borderRadius: 11, fontSize: 14.5, fontWeight: 700, color: T.rose, background: T.card, border: `1px solid ${T.line}` }}>로그아웃</button>
      </div>
      {inqOpen && <InquirySheet user={user} onClose={() => setInqOpen(false)} />}
      {routineOpen && <RoutineSheet onClose={() => setRoutineOpen(false)} />}
      {invite && <InviteSheet onClose={() => setInvite(false)} />}
      {safety && <SafetySheet onClose={() => setSafety(false)} />}
      {pwOpen && (
        <Sheet onClose={() => setPwOpen(false)} accent={T.gold} title={<><Lock size={16} color={T.gold} /> 비밀번호 설정</>}>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: T.muted, lineHeight: 1.6 }}>비밀번호를 정하면 다음부터 <b style={{ color: T.ink }}>이메일 + 비밀번호</b>로 바로 로그인할 수 있어요. 메일 확인이 필요 없어요.</p>
          <NewPassword embedded onDone={() => setPwOpen(false)} />
        </Sheet>
      )}
    </div>
  );
}

function SafetySheet({ onClose }) {
  const RULES = [
    "서로를 존중하고 격려하는 말을 나눠요",
    "비방·혐오·차별의 표현은 삼가요",
    "다른 사람의 개인정보를 함부로 공유하지 않아요",
    "부적절한 게시물·쪽지는 신고할 수 있어요",
  ];
  return (
    <Sheet onClose={onClose} accent={T.rose} title={<><ShieldCheck size={16} color={T.rose} /> 커뮤니티 규칙 · 신고</>}>
      <p style={{ margin: "0 0 14px", fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>여러 교회의 지체들이 함께 쓰는 공간이에요. 아래 규칙을 지키며 서로를 세워요.</p>
      <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.line}`, padding: 16, marginBottom: 14 }}>
        {RULES.map((r) => (
          <div key={r} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: T.gold, flexShrink: 0, marginTop: 7 }} />
            <span style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.5 }}>{r}</span>
          </div>
        ))}
      </div>
      <div style={{ background: `${T.rose}0F`, borderRadius: 12, padding: "13px 14px", border: `1px solid ${T.rose}33` }}>
        <p style={{ margin: 0, fontSize: 13, color: T.ink, lineHeight: 1.6 }}>글·쪽지 옆의 <b style={{ color: T.rose }}>신고</b>를 누르면 운영진에게 접수돼요. 반복·심각한 경우 해당 계정의 이용이 제한(정지)될 수 있어요.</p>
      </div>
      <p style={{ margin: "12px 2px 0", fontSize: 11.5, color: T.muted, textAlign: "center" }}>* 실제 신고 접수·계정 정지는 배포(서버 연동) 후 작동해요.</p>
    </Sheet>
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

function NewPassword({ onDone, embedded }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const save = async () => {
    setErr("");
    if (pw.length < 6) return setErr("비밀번호는 6자 이상으로 정해 주세요.");
    if (pw !== pw2) return setErr("비밀번호가 서로 달라요.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) setErr(error.message);
    else { setOk(true); setPw(""); setPw2(""); setTimeout(() => { setOk(false); onDone && onDone(); }, 1400); }
  };

  return (
    <div>
      {!embedded && <Header title="비밀번호 설정" subtitle="앞으로 이 비밀번호로 로그인해요" />}
      <div style={{ padding: embedded ? 0 : "0 16px" }}>
        {!embedded && (
          <div style={{ background: T.goldSoft, borderRadius: 12, padding: "13px 15px", marginBottom: 16, display: "flex", gap: 9 }}>
            <Lock size={17} color={T.goldDeep} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 13.5, color: T.ink, lineHeight: 1.6 }}>새 비밀번호를 정해 주세요. 다음부터는 <b>이메일 + 비밀번호</b>로 바로 로그인할 수 있어요.</p>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 13px", marginBottom: 9 }}>
          <Lock size={17} color={T.gold} />
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="새 비밀번호 (6자 이상)" autoComplete="new-password"
            style={{ flex: 1, border: "none", outline: "none", padding: "13px 0", fontSize: 15.5, color: T.ink, background: "transparent" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 13px", marginBottom: 9 }}>
          <Lock size={17} color={T.muted} />
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} placeholder="새 비밀번호 확인" autoComplete="new-password"
            style={{ flex: 1, border: "none", outline: "none", padding: "13px 0", fontSize: 15.5, color: T.ink, background: "transparent" }} />
        </div>
        <button onClick={save} disabled={loading}
          style={{ width: "100%", padding: "14px 0", marginTop: 4, borderRadius: 12, fontSize: 15.5, fontWeight: 700, background: ok ? T.sage : loading ? T.line : T.ink, color: loading ? T.muted : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          {ok ? <><Check size={16} /> 저장됐어요</> : loading ? "저장 중…" : "비밀번호 저장"}
        </button>
        {err && <p style={{ margin: "12px 2px 0", fontSize: 13, color: T.rose, lineHeight: 1.5 }}>{err}</p>}
      </div>
    </div>
  );
}

function SignIn() {
  const [mode, setMode] = useState("login");   // login | signup | reset
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const kakao = async () => {
    setErr("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: window.location.origin },
    });
    if (error) setErr(error.message);
  };

  const submit = async () => {
    setErr(""); setMsg("");
    const e = email.trim();
    if (!e) return setErr("이메일을 입력해 주세요.");

    if (mode === "reset") {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(e, { redirectTo: window.location.origin });
      setLoading(false);
      if (error) setErr(error.message);
      else setMsg("비밀번호 재설정 메일을 보냈어요. 메일함을 확인해 주세요.");
      return;
    }

    if (pw.length < 6) return setErr("비밀번호는 6자 이상으로 정해 주세요.");
    if (mode === "signup" && pw !== pw2) return setErr("비밀번호가 서로 달라요.");

    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email: e, password: pw });
      setLoading(false);
      if (error) {
        setErr(error.message.includes("already") ? "이미 가입된 이메일이에요. 로그인해 주세요." : error.message);
      } else {
        setMsg("가입됐어요! 바로 로그인해 주세요.");
        setMode("login"); setPw(""); setPw2("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: e, password: pw });
      setLoading(false);
      if (error) setErr(error.message.includes("Invalid") ? "이메일 또는 비밀번호가 맞지 않아요." : error.message);
    }
  };

  const TABS = [{ k: "login", l: "로그인" }, { k: "signup", l: "회원가입" }];

  return (
    <div>
      <Header title="함께 시작하기" subtitle="여러 교회의 지체들이 함께하는 공간" />
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: `linear-gradient(150deg, #FFFDF7, ${T.goldSoft})`, borderRadius: 14, padding: "16px", border: `1px solid ${T.goldSoft}`, textAlign: "center", marginBottom: 18 }}>
          <p style={{ fontFamily: serif, fontSize: 16, lineHeight: 1.7, color: T.ink, margin: 0 }}>"수고하고 무거운 짐 진 자들아<br />다 내게로 오라. 내가 너희를 쉬게 하리라"</p>
          <p style={{ margin: "9px 0 0", fontSize: 12.5, color: T.goldDeep, fontWeight: 700 }}>마태복음 11:28 · 함께 걸어요</p>
        </div>

        <button onClick={kakao} style={{ width: "100%", padding: "15px 0", borderRadius: 12, fontSize: 15.5, fontWeight: 700, background: "#FEE500", color: "#3A1D1D", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <MessageCircle size={18} fill="#3A1D1D" color="#3A1D1D" /> 카카오로 시작하기
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: T.line }} /><span style={{ fontSize: 12, color: T.muted }}>또는 이메일로</span><div style={{ flex: 1, height: 1, background: T.line }} />
        </div>

        {mode !== "reset" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {TABS.map((t) => (
              <button key={t.k} onClick={() => { setMode(t.k); setErr(""); setMsg(""); }}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, background: mode === t.k ? T.ink : T.card, color: mode === t.k ? "#fff" : T.muted, border: `1px solid ${mode === t.k ? T.ink : T.line}` }}>{t.l}</button>
            ))}
          </div>
        )}

        {mode === "reset" && (
          <button onClick={() => { setMode("login"); setErr(""); setMsg(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13.5, color: T.muted, fontWeight: 600, marginBottom: 12 }}><ChevronLeft size={15} /> 로그인으로</button>
        )}

        {/* 이메일 */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 13px", marginBottom: 9 }}>
          <Mail size={17} color={T.gold} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="username"
            style={{ flex: 1, border: "none", outline: "none", padding: "13px 0", fontSize: 15.5, color: T.ink, background: "transparent" }} />
        </div>

        {/* 비밀번호 */}
        {mode !== "reset" && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 13px", marginBottom: 9 }}>
            <Lock size={17} color={T.gold} />
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={mode === "signup" ? "비밀번호 (6자 이상)" : "비밀번호"} autoComplete={mode === "signup" ? "new-password" : "current-password"}
              style={{ flex: 1, border: "none", outline: "none", padding: "13px 0", fontSize: 15.5, color: T.ink, background: "transparent" }} />
          </div>
        )}

        {/* 비밀번호 확인 (가입 시) */}
        {mode === "signup" && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.card, border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 13px", marginBottom: 9 }}>
            <Lock size={17} color={T.muted} />
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="비밀번호 확인" autoComplete="new-password"
              style={{ flex: 1, border: "none", outline: "none", padding: "13px 0", fontSize: 15.5, color: T.ink, background: "transparent" }} />
          </div>
        )}

        <button onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "14px 0", marginTop: 4, borderRadius: 12, fontSize: 15.5, fontWeight: 700, background: loading ? T.line : T.ink, color: loading ? T.muted : "#fff" }}>
          {loading ? "잠시만요…" : mode === "signup" ? "가입하기" : mode === "reset" ? "재설정 메일 받기" : "로그인"}
        </button>

        {mode === "login" && (
          <button onClick={() => { setMode("reset"); setErr(""); setMsg(""); }} style={{ width: "100%", marginTop: 11, fontSize: 13, color: T.muted, fontWeight: 600 }}>비밀번호를 잊으셨나요?</button>
        )}

        {err && <p style={{ margin: "12px 2px 0", fontSize: 13, color: T.rose, lineHeight: 1.5 }}>{err}</p>}
        {msg && <p style={{ margin: "12px 2px 0", fontSize: 13, color: T.sage, fontWeight: 600, lineHeight: 1.5 }}>{msg}</p>}

        <p style={{ margin: "16px 6px 0", fontSize: 12, color: T.muted, lineHeight: 1.6, textAlign: "center" }}>시작하면 <b style={{ color: T.inkSoft }}>이용약관</b>·<b style={{ color: T.inkSoft }}>커뮤니티 규칙</b>에 동의하는 것으로 여겨요.</p>
      </div>
    </div>
  );
}

function ProfileSetup({ user }) {
  const [nick, setNick] = useState("");
  const [church, setChurch] = useState("");
  const [agree, setAgree] = useState(false);
  const [saving, setSaving] = useState(false);
  const RULES = [
    "서로를 존중하고 격려하는 말을 나눠요",
    "비방·혐오·차별의 표현은 삼가요",
    "다른 사람의 개인정보를 함부로 공유하지 않아요",
    "부적절한 행동은 신고할 수 있고, 심하면 이용이 제한돼요",
  ];
  const save = async () => {
    if (!nick.trim() || !agree || saving) return;
    setSaving(true);
    await supabase.auth.updateUser({ data: { nickname: nick.trim(), church: church.trim() || "미입력" } });
    await supabase.from("profiles").upsert({ id: user.id, nickname: nick.trim(), church: church.trim() || "미입력" });
    setSaving(false);
  };
  const canSave = nick.trim() && agree && !saving;

  return (
    <div>
      <Header title="프로필 설정" subtitle="공동체에서 함께 쓸 정보를 정해요" />
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: T.sageSoft, borderRadius: 11, padding: "11px 13px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <ShieldCheck size={16} color={T.sage} />
          <span style={{ fontSize: 13.5, color: "#3E5A44", fontWeight: 500 }}>{user.email ? `${user.email} 로그인됨` : "카카오 계정으로 로그인됨"}</span>
        </div>
        <Field icon={User} label="닉네임" placeholder="공동체에서 불릴 이름" value={nick} onChange={setNick} />
        <Field icon={Church} label="소속 교회 (선택)" placeholder="예 · 은혜교회 중고등부" value={church} onChange={setChurch} />

        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.line}`, padding: "15px 15px 6px", margin: "4px 0 16px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 700, color: T.ink }}>함께 지킬 커뮤니티 규칙</p>
          {RULES.map((r) => (
            <div key={r} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 9 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: T.gold, flexShrink: 0, marginTop: 7 }} />
              <span style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
          <label onClick={() => setAgree((a) => !a)} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0 6px", borderTop: `1px solid ${T.line}`, cursor: "pointer" }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: agree ? T.sage : "#fff", border: `1px solid ${agree ? T.sage : T.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{agree && <Check size={14} color="#fff" />}</span>
            <span style={{ fontSize: 13.5, color: T.ink, fontWeight: 500 }}>규칙에 동의하고 건강한 공동체에 함께해요</span>
          </label>
        </div>

        <button onClick={save} disabled={!canSave} style={{ width: "100%", padding: "14px 0", borderRadius: 12, fontSize: 15.5, fontWeight: 700, background: canSave ? T.ink : T.line, color: canSave ? "#fff" : T.muted }}>{saving ? "저장 중…" : "시작하기"}</button>
      </div>
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