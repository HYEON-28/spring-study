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
    <nav>
      <Link to="/" className={styles.navLogo}>
        <svg viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
          />
        </svg>
        <span className="wordmark">
          Git<span className={styles.navLogoAccent}>Blog</span>
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
