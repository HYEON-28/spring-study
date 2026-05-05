import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NAV_I18N } from "../i18n/nav";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import styles from "./Nav.module.css";

type Lang = "ko" | "en" | "ja" | "zh";

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "ko", label: "🇰🇷 한국어" },
  { value: "en", label: "🇺🇸 English" },
  { value: "ja", label: "🇯🇵 日本語" },
  { value: "zh", label: "🇨🇳 中文" },
];

function Nav() {
  const { lang, setLang } = useLang();
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const t = NAV_I18N[lang];
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANG_OPTIONS.find((o) => o.value === lang) ?? LANG_OPTIONS[0];

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.navLogo}>
        <img src="/favicon.svg" alt="" aria-hidden="true" className={styles.navLogoIcon} />
        <span className="wordmark">
          Md-<span className={styles.navLogoAccent}>Blog</span>
        </span>
      </Link>
      <div className={styles.navActions}>
        {isLoggedIn && user?.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.githubUsername}
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
        )}
        <div className={styles.langDropdown} ref={dropdownRef}>
          <button
            type="button"
            className={styles.langTrigger}
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <svg viewBox="0 0 24 24" className={styles.langIcon}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            <span>{current.label}</span>
            <svg
              viewBox="0 0 24 24"
              className={`${styles.chevron}${open ? " " + styles.chevronOpen : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {open && (
            <ul className={styles.langMenu} role="listbox">
              {LANG_OPTIONS.map((o) => (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={lang === o.value}
                  className={`${styles.langItem}${lang === o.value ? " " + styles.langItemActive : ""}`}
                  onClick={() => {
                    setLang(o.value);
                    setOpen(false);
                  }}
                >
                  {o.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        {isLoggedIn ? (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            {t.logout}
          </button>
        ) : (
          <>
            <Link to="/login" className={`${styles.btn} ${styles.btnGhost}`}>
              {t.login}
            </Link>
            <Link
              to="/login?mode=signup"
              className={`${styles.btn} ${styles.btnGreen}`}
            >
              {t.signup}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Nav;
