import type { Lang } from ".";

export const LOGIN_I18N: Record<Lang, Record<string, string>> = {
  ko: {
    badge: "Sign in to Md-Blog",
    title_html:
      'GitHub 계정으로<br><span class="highlight">한 번에 시작</span>하세요',
    desc_html: "GitHub OAuth로 로그인하고<br>레포를 블로그처럼 관리해 보세요.",
    cta_login: "GitHub으로 로그인",
    cta_signup: "GitHub으로 회원가입",
    note_prefix: "로그인 시 ",
    note_terms: "이용약관",
    note_and: " 및 ",
    note_privacy: "개인정보처리방침",
    note_suffix: "에 동의하게 됩니다.",
  },
  en: {
    badge: "Sign in to Md-Blog",
    title_html:
      'Get started with your<br><span class="highlight">GitHub account</span>',
    desc_html:
      "Sign in with GitHub OAuth<br>and manage your repo like a blog.",
    cta_login: "Continue with GitHub",
    cta_signup: "Sign up with GitHub",
    note_prefix: "By signing in you agree to our ",
    note_terms: "Terms of Service",
    note_and: " and ",
    note_privacy: "Privacy Policy",
    note_suffix: ".",
  },
  ja: {
    badge: "Sign in to Md-Blog",
    title_html:
      'GitHubアカウントで<br><span class="highlight">すぐに始め</span>よう',
    desc_html:
      "GitHub OAuthでログインして<br>リポジトリをブログのように管理しましょう。",
    cta_login: "GitHubでログイン",
    cta_signup: "GitHubで新規登録",
    note_prefix: "ログインすると ",
    note_terms: "利用規約",
    note_and: " と ",
    note_privacy: "プライバシーポリシー",
    note_suffix: " に同意したものとみなされます。",
  },
  zh: {
    badge: "Sign in to Md-Blog",
    title_html:
      '使用 GitHub 账号<br><span class="highlight">一键开始</span>',
    desc_html: "通过 GitHub OAuth 登录，<br>像博客一样管理你的仓库。",
    cta_login: "使用 GitHub 登录",
    cta_signup: "使用 GitHub 注册",
    note_prefix: "登录即表示同意 ",
    note_terms: "服务条款",
    note_and: " 和 ",
    note_privacy: "隐私政策",
    note_suffix: "。",
  },
};
