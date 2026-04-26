import type { Lang } from ".";

export const FILEUPDATED_I18N: Record<Lang, {
  dateLocale: string;
  breadcrumb_dashboard: string;
  breadcrumb_updates: string;
  loading: string;
  no_commits: string;
  meta_commits: string;
  meta_total: string;
  timeline_label: string;
  gh_link: string;
  no_diff: string;
}> = {
  ko: {
    dateLocale: "ko-KR",
    breadcrumb_dashboard: "대시보드",
    breadcrumb_updates: "오늘의 업데이트",
    loading: "불러오는 중...",
    no_commits: "오늘 이 파일의 변경 커밋이 없습니다.",
    meta_commits: "오늘 커밋",
    meta_total: "총",
    timeline_label: "오늘 커밋 타임라인 — 클릭하면 해당 diff를 확인할 수 있습니다",
    gh_link: "GitHub에서 보기",
    no_diff: "diff 정보가 없습니다. (바이너리 파일이거나 변경량이 너무 큰 경우)",
  },
  en: {
    dateLocale: "en-US",
    breadcrumb_dashboard: "Dashboard",
    breadcrumb_updates: "Today's Updates",
    loading: "Loading...",
    no_commits: "No commits found for this file today.",
    meta_commits: "commits today",
    meta_total: "Total",
    timeline_label: "Today's commit timeline — click to view the diff",
    gh_link: "View on GitHub",
    no_diff: "No diff available. (Binary file or change is too large)",
  },
  ja: {
    dateLocale: "ja-JP",
    breadcrumb_dashboard: "ダッシュボード",
    breadcrumb_updates: "本日の更新",
    loading: "読み込み中...",
    no_commits: "本日このファイルの変更コミットはありません。",
    meta_commits: "本日のコミット",
    meta_total: "合計",
    timeline_label: "本日のコミットタイムライン — クリックして diff を確認できます",
    gh_link: "GitHub で表示",
    no_diff: "diff 情報がありません。（バイナリファイルまたは変更量が多すぎる場合）",
  },
  zh: {
    dateLocale: "zh-CN",
    breadcrumb_dashboard: "仪表盘",
    breadcrumb_updates: "今日更新",
    loading: "加载中...",
    no_commits: "今日该文件没有变更提交。",
    meta_commits: "今日提交",
    meta_total: "共计",
    timeline_label: "今日提交时间线 — 点击查看对应 diff",
    gh_link: "在 GitHub 上查看",
    no_diff: "没有 diff 信息。（二进制文件或变更量过大）",
  },
};
