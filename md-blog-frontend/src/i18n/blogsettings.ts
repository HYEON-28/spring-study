import type { Lang } from ".";

export const BLOGSETTINGS_I18N: Record<Lang, {
  breadcrumb_dashboard: string;
  breadcrumb_current: string;
  page_title: string;
  page_desc: string;
  card_all_title: string;
  card_blog_title: string;
  search_all: string;
  search_blog: string;
  lang_all: string;
  select_all: string;
  unit_connected: string;
  unit_blog: string;
  unit_selected: string;
  empty_all: string;
  empty_blog: string;
  action_placeholder_add: string;
  action_placeholder_remove: string;
  btn_add: string;
  btn_adding: string;
  btn_remove: string;
  btn_removing: string;
  tag_connected: string;
  tag_blog: string;
  loading: string;
}> = {
  ko: {
    breadcrumb_dashboard: "대시보드",
    breadcrumb_current: "블로그 설정",
    page_title: "블로그 설정",
    page_desc: "연동된 레포지토리 중 블로그로 전환할 레포를 선택합니다. 선택된 레포의 md 파일이 블로그 카테고리로 구성됩니다.",
    card_all_title: "연동된 레포지토리",
    card_blog_title: "블로그 레포지토리",
    search_all: "레포지토리 검색...",
    search_blog: "블로그 레포 검색...",
    lang_all: "전체 언어",
    select_all: "전체 선택",
    unit_connected: "연동 레포",
    unit_blog: "블로그 레포",
    unit_selected: "개 선택됨",
    empty_all: "레포지토리가 없습니다.",
    empty_blog: "블로그로 등록된 레포지토리가 없습니다.",
    action_placeholder_add: "블로그로 전환할 레포를 선택하세요",
    action_placeholder_remove: "블로그에서 제외할 레포를 선택하세요",
    btn_add: "블로그 추가",
    btn_adding: "추가 중...",
    btn_remove: "블로그 제거",
    btn_removing: "제거 중...",
    tag_connected: "연동됨",
    tag_blog: "블로그",
    loading: "불러오는 중...",
  },
  en: {
    breadcrumb_dashboard: "Dashboard",
    breadcrumb_current: "Blog Settings",
    page_title: "Blog Settings",
    page_desc: "Select repositories to use as blogs. Markdown files from selected repos will be organized as blog categories.",
    card_all_title: "Connected Repositories",
    card_blog_title: "Blog Repositories",
    search_all: "Search repositories...",
    search_blog: "Search blog repos...",
    lang_all: "All languages",
    select_all: "Select all",
    unit_connected: "connected repos",
    unit_blog: "blog repos",
    unit_selected: " selected",
    empty_all: "No repositories found.",
    empty_blog: "No blog repositories registered.",
    action_placeholder_add: "Select repos to add as blog",
    action_placeholder_remove: "Select repos to remove from blog",
    btn_add: "Add to Blog",
    btn_adding: "Adding...",
    btn_remove: "Remove from Blog",
    btn_removing: "Removing...",
    tag_connected: "Connected",
    tag_blog: "Blog",
    loading: "Loading...",
  },
  ja: {
    breadcrumb_dashboard: "ダッシュボード",
    breadcrumb_current: "ブログ設定",
    page_title: "ブログ設定",
    page_desc: "連携済みリポジトリの中からブログとして使用するリポジトリを選択します。選択したリポジトリの md ファイルがブログカテゴリとして構成されます。",
    card_all_title: "連携済みリポジトリ",
    card_blog_title: "ブログリポジトリ",
    search_all: "リポジトリを検索...",
    search_blog: "ブログリポジトリを検索...",
    lang_all: "すべての言語",
    select_all: "すべて選択",
    unit_connected: "連携リポジトリ",
    unit_blog: "ブログリポジトリ",
    unit_selected: "件選択中",
    empty_all: "リポジトリがありません。",
    empty_blog: "ブログ登録済みのリポジトリがありません。",
    action_placeholder_add: "ブログにするリポジトリを選択してください",
    action_placeholder_remove: "ブログから除外するリポジトリを選択してください",
    btn_add: "ブログに追加",
    btn_adding: "追加中...",
    btn_remove: "ブログから削除",
    btn_removing: "削除中...",
    tag_connected: "連携済み",
    tag_blog: "ブログ",
    loading: "読み込み中...",
  },
  zh: {
    breadcrumb_dashboard: "仪表盘",
    breadcrumb_current: "博客设置",
    page_title: "博客设置",
    page_desc: "从已连接的仓库中选择要作为博客使用的仓库。所选仓库的 md 文件将组织为博客分类。",
    card_all_title: "已连接仓库",
    card_blog_title: "博客仓库",
    search_all: "搜索仓库...",
    search_blog: "搜索博客仓库...",
    lang_all: "所有语言",
    select_all: "全选",
    unit_connected: "已连接仓库",
    unit_blog: "博客仓库",
    unit_selected: "个已选",
    empty_all: "没有仓库。",
    empty_blog: "没有已注册的博客仓库。",
    action_placeholder_add: "请选择要添加为博客的仓库",
    action_placeholder_remove: "请选择要从博客中移除的仓库",
    btn_add: "添加到博客",
    btn_adding: "添加中...",
    btn_remove: "从博客移除",
    btn_removing: "移除中...",
    tag_connected: "已连接",
    tag_blog: "博客",
    loading: "加载中...",
  },
};
