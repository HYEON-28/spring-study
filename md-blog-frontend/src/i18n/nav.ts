import type { Lang } from ".";

export const NAV_I18N: Record<Lang, Record<string, string>> = {
  ko: {
    login: "로그인",
    signup: "회원가입",
    logout: "로그아웃",
  },
  en: {
    login: "Sign in",
    signup: "Sign up",
    logout: "Sign out",
  },
  ja: {
    login: "ログイン",
    signup: "新規登録",
    logout: "ログアウト",
  },
  zh: {
    login: "登录",
    signup: "注册",
    logout: "退出",
  },
};
