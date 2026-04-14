import styles from "./Footer.module.css";

interface FooterProps {
  t: Record<string, string>;
}

function Footer({ t }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <p>
        <span>{t.footer_copy}</span>
        {" — "}
        <a
          href="#"
          style={{ color: "var(--gh-accent)", textDecoration: "none" }}
        >
          {t.footer_privacy}
        </a>
        {" · "}
        <a
          href="#"
          style={{ color: "var(--gh-accent)", textDecoration: "none" }}
        >
          {t.footer_terms}
        </a>
      </p>
    </footer>
  );
}

export default Footer;
