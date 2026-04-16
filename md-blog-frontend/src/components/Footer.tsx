import { FOOTER_I18N } from "../i18n/footer";
import { useLang } from "../context/LangContext";
import styles from "./Footer.module.css";

function Footer() {
  const { lang } = useLang();
  const t = FOOTER_I18N[lang];
  return (
    <footer className={styles.footer}>
      <p>
        <span>{t.copy}</span>
        {" — "}
        <a href="#" style={{ color: "var(--gh-accent)", textDecoration: "none" }}>
          {t.privacy}
        </a>
        {" · "}
        <a href="#" style={{ color: "var(--gh-accent)", textDecoration: "none" }}>
          {t.terms}
        </a>
      </p>
    </footer>
  );
}

export default Footer;
