import type { Lang } from ".";

export const MAIN_I18N: Record<Lang, {
  dateLocale: string;
  greeting_prefix: string;
  greeting_suffix: string;
  stat_repos: string;
  stat_repos_sub: string;
  stat_blog_repos: string;
  stat_blog_repos_sub: string;
  stat_files: string;
  section_repo: string;
  btn_repo_settings: string;
  section_blog: string;
  unit_blog_repos: string;
  btn_blog_settings: string;
  section_update: string;
  unit_repo: string;
  unit_file: string;
  loading: string;
  empty_repos: string;
  empty_blog_repos: string;
  empty_updates: string;
  tag_connected: string;
}> = {
  ko: {
    dateLocale: "ko-KR",
    greeting_prefix: "안녕하세요, ",
    greeting_suffix: " 님",
    stat_repos: "연동된 레포지토리",
    stat_repos_sub: "연동된 레포",
    stat_blog_repos: "블로그 연동 레포",
    stat_blog_repos_sub: "블로그 레포",
    stat_files: "오늘 수정된 파일",
    section_repo: "레포지토리 관리",
    btn_repo_settings: "레포 설정",
    section_blog: "블로그 관리",
    unit_blog_repos: "개 레포",
    btn_blog_settings: "블로그 설정",
    section_update: "오늘의 업데이트",
    unit_repo: "레포",
    unit_file: "파일",
    loading: "불러오는 중...",
    empty_repos: "연동된 레포지토리가 없습니다.",
    empty_blog_repos: "블로그로 연동된 레포지토리가 없습니다.",
    empty_updates: "오늘 업데이트된 레포지토리가 없습니다.",
    tag_connected: "연동됨",
  },
  en: {
    dateLocale: "en-US",
    greeting_prefix: "Hello, ",
    greeting_suffix: "",
    stat_repos: "Connected Repos",
    stat_repos_sub: "Connected",
    stat_blog_repos: "Blog Repos",
    stat_blog_repos_sub: "Blog",
    stat_files: "Files Updated Today",
    section_repo: "Repository Management",
    btn_repo_settings: "Repo Settings",
    section_blog: "Blog Management",
    unit_blog_repos: " repos",
    btn_blog_settings: "Blog Settings",
    section_update: "Today's Updates",
    unit_repo: "repos",
    unit_file: "files",
    loading: "Loading...",
    empty_repos: "No connected repositories.",
    empty_blog_repos: "No blog repositories connected.",
    empty_updates: "No repositories updated today.",
    tag_connected: "Connected",
  },
  ja: {
    dateLocale: "ja-JP",
    greeting_prefix: "こんにちは、",
    greeting_suffix: " さん",
    stat_repos: "連携リポジトリ",
    stat_repos_sub: "連携中",
    stat_blog_repos: "ブログリポジトリ",
    stat_blog_repos_sub: "ブログ",
    stat_files: "本日更新ファイル",
    section_repo: "リポジトリ管理",
    btn_repo_settings: "リポジトリ設定",
    section_blog: "ブログ管理",
    unit_blog_repos: "件のリポジトリ",
    btn_blog_settings: "ブログ設定",
    section_update: "本日の更新",
    unit_repo: "リポジトリ",
    unit_file: "ファイル",
    loading: "読み込み中...",
    empty_repos: "連携されたリポジトリがありません。",
    empty_blog_repos: "ブログ連携のリポジトリがありません。",
    empty_updates: "本日更新されたリポジトリはありません。",
    tag_connected: "連携済み",
  },
  zh: {
    dateLocale: "zh-CN",
    greeting_prefix: "你好，",
    greeting_suffix: "",
    stat_repos: "已连接仓库",
    stat_repos_sub: "已连接",
    stat_blog_repos: "博客仓库",
    stat_blog_repos_sub: "博客",
    stat_files: "今日更新文件",
    section_repo: "仓库管理",
    btn_repo_settings: "仓库设置",
    section_blog: "博客管理",
    unit_blog_repos: "个仓库",
    btn_blog_settings: "博客设置",
    section_update: "今日更新",
    unit_repo: "仓库",
    unit_file: "文件",
    loading: "加载中...",
    empty_repos: "没有已连接的仓库。",
    empty_blog_repos: "没有已连接的博客仓库。",
    empty_updates: "今日没有更新的仓库。",
    tag_connected: "已连接",
  },
};
