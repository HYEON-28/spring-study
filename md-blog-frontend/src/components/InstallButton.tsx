import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import { LANDING_I18N } from "../i18n/landing";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return (navigator as unknown as { standalone?: boolean }).standalone === true;
}

function InstallButton() {
  const { lang } = useLang();
  const t = LANDING_I18N[lang];
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [hidden, setHidden] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return !isMobile() || isStandalone();
  });

  useEffect(() => {
    if (hidden) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [hidden]);

  if (hidden) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") setHidden(true);
      return;
    }
    setShowIosGuide(true);
  };

  return (
    <>
      <button className="btn-hero-outline" onClick={handleClick} type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        <span>{t.install_btn}</span>
      </button>
      {showIosGuide && (
        <div className="install-modal-overlay" onClick={() => setShowIosGuide(false)}>
          <div className="install-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t.install_modal_title}</h3>
            <p className="install-modal-step">{t.install_modal_step1}</p>
            <p className="install-modal-step">{t.install_modal_step2}</p>
            <p className="install-modal-step">{t.install_modal_step3}</p>
            <button
              type="button"
              className="install-modal-close"
              onClick={() => setShowIosGuide(false)}
            >
              {t.install_modal_close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default InstallButton;
