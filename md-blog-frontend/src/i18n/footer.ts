import type { Lang } from ".";

export const FOOTER_I18N: Record<Lang, Record<string, string>> = {
  ko: {
    copy: "© 2025 Md-Blog. GitHub 레포를 블로그처럼.",
    privacy: "개인정보처리방침",
    terms: "이용약관",
  },
  en: {
    copy: "© 2025 Md-Blog. Your GitHub repo, like a blog.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
  ja: {
    copy: "© 2025 Md-Blog. GitHubリポジトリをブログのように。",
    privacy: "プライバシーポリシー",
    terms: "利用規約",
  },
  zh: {
    copy: "© 2025 Md-Blog. 像博客一样管理 GitHub 仓库。",
    privacy: "隐私政策",
    terms: "服务条款",
  },
};
