import type { Lang } from ".";

export const REPOSETTINGS_I18N: Record<Lang, {
  breadcrumb_dashboard: string;
  breadcrumb_current: string;
  page_title: string;
  page_desc: string;
  card_all_title: string;
  card_connected_title: string;
  search_all: string;
  search_connected: string;
  lang_all: string;
  select_all: string;
  unit_public: string;
  unit_connected: string;
  unit_selected: string;
  empty_all: string;
  empty_connected: string;
  action_placeholder_connect: string;
  action_placeholder_disconnect: string;
  btn_connect: string;
  btn_connecting: string;
  btn_disconnect: string;
  btn_disconnecting: string;
  tag_connected: string;
  loading: string;
}> = {
  ko: {
    breadcrumb_dashboard: "대시보드",
    breadcrumb_current: "레포지토리 설정",
    page_title: "레포지토리 설정",
    page_desc: "GitHub 공개 레포지토리를 연동하거나 연동을 해제합니다. 연동된 레포는 대시보드에서 관리할 수 있습니다.",
    card_all_title: "전체 레포지토리",
    card_connected_title: "연동된 레포지토리",
    search_all: "레포지토리 검색...",
    search_connected: "연동된 레포 검색...",
    lang_all: "전체 언어",
    select_all: "전체 선택",
    unit_public: "공개 레포",
    unit_connected: "연동 레포",
    unit_selected: "개 선택됨",
    empty_all: "레포지토리가 없습니다.",
    empty_connected: "연동된 레포지토리가 없습니다.",
    action_placeholder_connect: "미연동 레포 중에서 선택하세요",
    action_placeholder_disconnect: "해제할 레포지토리를 선택하세요",
    btn_connect: "연동하기",
    btn_connecting: "연동 중...",
    btn_disconnect: "연동 해제",
    btn_disconnecting: "해제 중...",
    tag_connected: "연동됨",
    loading: "불러오는 중...",
  },
  en: {
    breadcrumb_dashboard: "Dashboard",
    breadcrumb_current: "Repository Settings",
    page_title: "Repository Settings",
    page_desc: "Connect or disconnect your public GitHub repositories. Connected repos can be managed on the dashboard.",
    card_all_title: "All Repositories",
    card_connected_title: "Connected Repositories",
    search_all: "Search repositories...",
    search_connected: "Search connected repos...",
    lang_all: "All languages",
    select_all: "Select all",
    unit_public: "public repos",
    unit_connected: "connected repos",
    unit_selected: " selected",
    empty_all: "No repositories found.",
    empty_connected: "No connected repositories.",
    action_placeholder_connect: "Select repos to connect",
    action_placeholder_disconnect: "Select repos to disconnect",
    btn_connect: "Connect",
    btn_connecting: "Connecting...",
    btn_disconnect: "Disconnect",
    btn_disconnecting: "Disconnecting...",
    tag_connected: "Connected",
    loading: "Loading...",
  },
  ja: {
    breadcrumb_dashboard: "ダッシュボード",
    breadcrumb_current: "リポジトリ設定",
    page_title: "リポジトリ設定",
    page_desc: "GitHub の公開リポジトリを連携または解除します。連携済みのリポジトリはダッシュボードで管理できます。",
    card_all_title: "全リポジトリ",
    card_connected_title: "連携済みリポジトリ",
    search_all: "リポジトリを検索...",
    search_connected: "連携済みリポジトリを検索...",
    lang_all: "すべての言語",
    select_all: "すべて選択",
    unit_public: "公開リポジトリ",
    unit_connected: "連携リポジトリ",
    unit_selected: "件選択中",
    empty_all: "リポジトリがありません。",
    empty_connected: "連携済みリポジトリがありません。",
    action_placeholder_connect: "連携するリポジトリを選択してください",
    action_placeholder_disconnect: "解除するリポジトリを選択してください",
    btn_connect: "連携する",
    btn_connecting: "連携中...",
    btn_disconnect: "連携解除",
    btn_disconnecting: "解除中...",
    tag_connected: "連携済み",
    loading: "読み込み中...",
  },
  zh: {
    breadcrumb_dashboard: "仪表盘",
    breadcrumb_current: "仓库设置",
    page_title: "仓库设置",
    page_desc: "连接或断开您的 GitHub 公开仓库。已连接的仓库可在仪表盘中管理。",
    card_all_title: "全部仓库",
    card_connected_title: "已连接仓库",
    search_all: "搜索仓库...",
    search_connected: "搜索已连接仓库...",
    lang_all: "所有语言",
    select_all: "全选",
    unit_public: "公开仓库",
    unit_connected: "已连接仓库",
    unit_selected: "个已选",
    empty_all: "没有仓库。",
    empty_connected: "没有已连接的仓库。",
    action_placeholder_connect: "请选择要连接的仓库",
    action_placeholder_disconnect: "请选择要断开的仓库",
    btn_connect: "连接",
    btn_connecting: "连接中...",
    btn_disconnect: "断开连接",
    btn_disconnecting: "断开中...",
    tag_connected: "已连接",
    loading: "加载中...",
  },
};
