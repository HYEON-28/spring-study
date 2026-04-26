import type { Lang } from "../i18n";

const LABELS: Record<Lang, {
  justNow: string;
  minutesAgo: (n: number) => string;
  hoursAgo: (n: number) => string;
  yesterday: string;
  daysAgo: (n: number) => string;
  weeksAgo: (n: number) => string;
  monthsAgo: (n: number) => string;
  yearsAgo: (n: number) => string;
}> = {
  ko: {
    justNow: "방금 전",
    minutesAgo: (n) => `${n}분 전`,
    hoursAgo: (n) => `${n}시간 전`,
    yesterday: "어제",
    daysAgo: (n) => `${n}일 전`,
    weeksAgo: (n) => `${n}주 전`,
    monthsAgo: (n) => `${n}개월 전`,
    yearsAgo: (n) => `${n}년 전`,
  },
  en: {
    justNow: "just now",
    minutesAgo: (n) => `${n}m ago`,
    hoursAgo: (n) => `${n}h ago`,
    yesterday: "yesterday",
    daysAgo: (n) => `${n}d ago`,
    weeksAgo: (n) => `${n}w ago`,
    monthsAgo: (n) => `${n}mo ago`,
    yearsAgo: (n) => `${n}y ago`,
  },
  ja: {
    justNow: "たった今",
    minutesAgo: (n) => `${n}分前`,
    hoursAgo: (n) => `${n}時間前`,
    yesterday: "昨日",
    daysAgo: (n) => `${n}日前`,
    weeksAgo: (n) => `${n}週間前`,
    monthsAgo: (n) => `${n}ヶ月前`,
    yearsAgo: (n) => `${n}年前`,
  },
  zh: {
    justNow: "刚刚",
    minutesAgo: (n) => `${n}分钟前`,
    hoursAgo: (n) => `${n}小时前`,
    yesterday: "昨天",
    daysAgo: (n) => `${n}天前`,
    weeksAgo: (n) => `${n}周前`,
    monthsAgo: (n) => `${n}个月前`,
    yearsAgo: (n) => `${n}年前`,
  },
};

export function toRelativeTime(iso: string, lang: Lang = "ko"): string {
  if (!iso) return "";
  const pushed = new Date(iso);
  const now = new Date();
  const minutes = Math.floor((now.getTime() - pushed.getTime()) / 60000);
  const L = LABELS[lang];
  if (minutes < 1) return L.justNow;
  if (minutes < 60) return L.minutesAgo(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return L.hoursAgo(hours);
  const days = Math.floor(hours / 24);
  if (days === 1) return L.yesterday;
  if (days < 7) return L.daysAgo(days);
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return L.weeksAgo(weeks);
  const months = Math.floor(days / 30);
  if (months < 12) return L.monthsAgo(months);
  return L.yearsAgo(Math.floor(days / 365));
}
