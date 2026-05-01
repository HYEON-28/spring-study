import type { Lang } from ".";

export const LEARNINGSUM_I18N: Record<Lang, {
  back_btn: string;
  title: string;
  subtitle: string;
  card_repo_title: string;
  loading: string;
  empty_updates: string;
  unit_file_changed: string;
  card_prompt_title: string;
  btn_summarize: string;
  btn_summarizing: string;
  submit_hint: string;
  error: string;
  result_title: string;
  result_badge: string;
  default_prompt: string;
}> = {
  ko: {
    back_btn: "메인으로",
    title: "오늘 학습 요약",
    subtitle: "오늘 작업한 레포지토리를 선택하고 AI로 학습 내용을 요약합니다.",
    card_repo_title: "요약할 레포지토리 선택",
    loading: "불러오는 중...",
    empty_updates: "오늘 업데이트된 레포지토리가 없습니다.",
    unit_file_changed: "개 파일 변경",
    card_prompt_title: "요약 프롬프트 (수정 가능)",
    btn_summarize: "요약하기",
    btn_summarizing: "요약 중...",
    submit_hint: "레포지토리를 하나 이상 선택해주세요.",
    error: "요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    result_title: "AI 요약 결과",
    result_badge: "Claude",
    default_prompt:
      "아래는 오늘 내가 작업한 GitHub 레포지토리의 변경 내역입니다.\n" +
      "이를 바탕으로 오늘 내가 학습하거나 작업한 내용을 한국어로 요약해주세요.\n" +
      "핵심 개념, 구현한 기능, 해결한 문제 등을 중심으로 작성해주세요.",
  },
  en: {
    back_btn: "Back to Main",
    title: "Today's Learning Summary",
    subtitle: "Select the repositories you worked on today and summarize your learning with AI.",
    card_repo_title: "Select Repositories to Summarize",
    loading: "Loading...",
    empty_updates: "No repositories updated today.",
    unit_file_changed: " files changed",
    card_prompt_title: "Summary Prompt (editable)",
    btn_summarize: "Summarize",
    btn_summarizing: "Summarizing...",
    submit_hint: "Please select at least one repository.",
    error: "An error occurred while summarizing. Please try again later.",
    result_title: "AI Summary Result",
    result_badge: "Claude",
    default_prompt:
      "Below are the changes from the GitHub repositories I worked on today.\n" +
      "Based on this, please summarize what I learned or worked on today in English.\n" +
      "Focus on key concepts, implemented features, and problems solved.",
  },
  ja: {
    back_btn: "メインへ",
    title: "今日の学習まとめ",
    subtitle: "今日作業したリポジトリを選択して、AIで学習内容をまとめます。",
    card_repo_title: "まとめるリポジトリを選択",
    loading: "読み込み中...",
    empty_updates: "今日更新されたリポジトリはありません。",
    unit_file_changed: "件のファイル変更",
    card_prompt_title: "まとめプロンプト（編集可能）",
    btn_summarize: "まとめる",
    btn_summarizing: "まとめ中...",
    submit_hint: "リポジトリを1つ以上選択してください。",
    error: "まとめ中にエラーが発生しました。しばらくしてから再試行してください。",
    result_title: "AI まとめ結果",
    result_badge: "Claude",
    default_prompt:
      "以下は今日私が作業したGitHubリポジトリの変更内容です。\n" +
      "これをもとに、今日学習または作業した内容を日本語でまとめてください。\n" +
      "重要な概念、実装した機能、解決した問題を中心に記述してください。",
  },
  zh: {
    back_btn: "返回主页",
    title: "今日学习总结",
    subtitle: "选择今天工作的仓库，用 AI 总结学习内容。",
    card_repo_title: "选择要总结的仓库",
    loading: "加载中...",
    empty_updates: "今日没有更新的仓库。",
    unit_file_changed: " 个文件变更",
    card_prompt_title: "总结提示词（可编辑）",
    btn_summarize: "开始总结",
    btn_summarizing: "总结中...",
    submit_hint: "请至少选择一个仓库。",
    error: "总结时发生错误，请稍后再试。",
    result_title: "AI 总结结果",
    result_badge: "Claude",
    default_prompt:
      "以下是我今天在 GitHub 仓库中的变更记录。\n" +
      "请据此用中文总结我今天学习或完成的内容。\n" +
      "请重点描述核心概念、实现的功能以及解决的问题。",
  },
};
