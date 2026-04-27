import { useEffect, useRef } from "react";
import type { Lang } from "../i18n";

const SCRIPT_ID = "google-translate-script";
const ELEMENT_ID = "google_translate_element";
const CALLBACK = "googleTranslateElementInit";
const SOURCE_LANG = "ko";

// 우리 Lang 코드 → Google Translate 코드.
// `ko` 는 "원본 복원" — 빈 문자열로 표시.
const TO_GOOGLE: Record<Lang, string> = {
  ko: "",
  en: "en",
  ja: "ja",
  zh: "zh-CN",
};

declare global {
  interface Window {
    [CALLBACK]?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          opts: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
            layout?: number;
          },
          elementId: string,
        ) => unknown;
      };
    };
  }
}

function findCombo(): HTMLSelectElement | null {
  return document.querySelector<HTMLSelectElement>("select.goog-te-combo");
}

function isCurrentlyTranslated(): boolean {
  // Google Translate가 번역 중이면 <html>에 translated-ltr/translated-rtl 클래스를 붙임
  const html = document.documentElement;
  return (
    html.classList.contains("translated-ltr") ||
    html.classList.contains("translated-rtl")
  );
}

function getCookieDomains(): string[] {
  const host = window.location.hostname;
  // localhost / IP는 도메인 미지정으로만 저장
  if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return [""];
  return ["", host, "." + host];
}

function setGoogTransCookie(target: string) {
  const value = `/${SOURCE_LANG}/${target}`;
  for (const domain of getCookieDomains()) {
    document.cookie =
      `googtrans=${value};path=/` + (domain ? `;domain=${domain}` : "");
  }
}

function clearGoogTransCookie() {
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  for (const domain of getCookieDomains()) {
    document.cookie =
      `googtrans=;path=/;${expire}` + (domain ? `;domain=${domain}` : "");
  }
}

function applyTranslation(lang: Lang) {
  const target = TO_GOOGLE[lang];

  if (lang === "ko") {
    // 원본 복원: 쿠키 지운 뒤, 현재 번역 중이었다면 리로드해서 정확한 원본을 보여줌
    clearGoogTransCookie();
    if (isCurrentlyTranslated()) {
      window.location.reload();
    }
    return;
  }

  // 다른 언어로 전환: 쿠키 저장(영속성) + 위젯 즉시 트리거
  setGoogTransCookie(target);

  let attempts = 0;
  const tryApply = () => {
    const combo = findCombo();
    if (!combo) {
      attempts += 1;
      if (attempts > 40) return; // 4초 후 포기
      setTimeout(tryApply, 100);
      return;
    }
    if (combo.value === target) return; // 이미 같은 언어면 no-op
    combo.value = target;
    combo.dispatchEvent(new Event("change"));
  };
  tryApply();
}

/**
 * Google Website Translator 위젯을 페이지에 동적 로드하고, 외부에서 호출 가능한
 * `translateTo(lang)` 함수를 반환한다.
 *
 * - 스크립트/콜백/엘리먼트 모두 idempotent (한 번만 로드).
 * - 다른 언어 → 쿠키 저장 + 위젯 즉시 트리거.
 * - 한국어 복원 → 쿠키 삭제 + (번역 중이었으면) 리로드.
 */
export function useGoogleTranslate(): {
  translateTo: (lang: Lang) => void;
} {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!document.getElementById(ELEMENT_ID)) {
      const div = document.createElement("div");
      div.id = ELEMENT_ID;
      document.body.appendChild(div);
    }

    if (!window[CALLBACK]) {
      window[CALLBACK] = () => {
        if (!window.google?.translate) return;
        new window.google.translate.TranslateElement(
          {
            pageLanguage: SOURCE_LANG,
            includedLanguages: "en,ja,zh-CN",
            autoDisplay: false,
          },
          ELEMENT_ID,
        );
      };
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `//translate.google.com/translate_a/element.js?cb=${CALLBACK}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return { translateTo: applyTranslation };
}
