import { useState, useEffect, useRef } from "react";
import "../styles/Landing.css";
import Nav from "../components/Nav";
import { type Lang, I18N } from "../i18n";

function Landing() {
  const [lang, setLang] = useState<Lang>("ko");
  const featuresRef = useRef<HTMLElement>(null);
  const t = I18N[lang];

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    document.documentElement.lang = newLang;
    document.body.classList.remove("lang-switch-fade");
    void document.body.offsetWidth;
    document.body.classList.add("lang-switch-fade");
  };

  const handleFeaturesScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const cards =
      featuresRef.current?.querySelectorAll<HTMLElement>(".feature-card");
    if (!cards) return;

    const observers: IntersectionObserver[] = [];
    cards.forEach((card) => {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).style.animationPlayState = "running";
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15 },
      );
      card.style.animationPlayState = "paused";
      obs.observe(card);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <>
      <Nav t={t} />
      {/* LANG BAR */}
      <div className="lang-bar">
        <span className="lang-bar-label">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          Language
        </span>
        {(["ko", "en", "ja", "zh"] as Lang[]).map((l) => (
          <button
            key={l}
            className={`lang-btn${lang === l ? " active" : ""}`}
            onClick={() => handleLangChange(l)}
          >
            {l === "ko" && "🇰🇷 한국어"}
            {l === "en" && "🇺🇸 English"}
            {l === "ja" && "🇯🇵 日本語"}
            {l === "zh" && "🇨🇳 中文"}
          </button>
        ))}
      </div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
        <div className="hero-badge">
          <span className="badge-dot"></span>
          <span>{t.hero_badge}</span>
        </div>
        <h1 dangerouslySetInnerHTML={{ __html: t.hero_h1 }} />
        <p
          className="hero-desc"
          dangerouslySetInnerHTML={{ __html: t.hero_desc }}
        />
        <div className="hero-cta">
          <a href="#" className="btn-hero-green">
            <svg width="16" height="16" viewBox="0 0 98 96" fill="white">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
              />
            </svg>
            <span>{t.hero_cta_primary}</span>
          </a>
          <a
            href="#features"
            className="btn-hero-outline"
            onClick={handleFeaturesScroll}
          >
            <span>{t.hero_cta_secondary}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features" ref={featuresRef}>
        <p className="section-label">{t.feat_label}</p>
        <h2 className="section-title">{t.feat_title}</h2>
        <p className="section-sub">{t.feat_sub}</p>
        <div className="features-grid">
          {[
            { icon: "📝", title: t.f1_title, desc: t.f1_desc, delay: "0s" },
            { icon: "✨", title: t.f2_title, desc: t.f2_desc, delay: "0.1s" },
            { icon: "🌐", title: t.f3_title, desc: t.f3_desc, delay: "0.2s" },
            { icon: "🐦", title: t.f4_title, desc: t.f4_desc, delay: "0.3s" },
            { icon: "🔗", title: t.f5_title, desc: t.f5_desc, delay: "0.4s" },
            { icon: "📅", title: t.f6_title, desc: t.f6_desc, delay: "0.5s" },
          ].map(({ icon, title, desc, delay }) => (
            <div
              key={delay}
              className="feature-card"
              style={{ animationDelay: delay }}
            >
              <div className="feature-icon">{icon}</div>
              <div className="feature-title">{title}</div>
              <div className="feature-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO PANEL */}
      <section className="demo-section">
        <div className="demo-inner">
          <div className="demo-text">
            <h2 dangerouslySetInnerHTML={{ __html: t.demo_h2 }} />
            <p>{t.demo_p}</p>
            <div className="tag-list">
              <span className="tag">한국어</span>
              <span className="tag">日本語</span>
              <span className="tag">English</span>
              <span className="tag">中文</span>
            </div>
            <a
              href="#"
              className="btn-hero-green"
              style={{ fontSize: "14px", padding: "9px 20px" }}
            >
              <span>{t.demo_cta}</span>
            </a>
          </div>
          <div className="demo-card">
            <div className="demo-card-header">
              <span className="dot dot-r"></span>
              <span className="dot dot-y"></span>
              <span className="dot dot-g"></span>
              <span className="demo-card-title">{t.demo_card_title}</span>
            </div>
            <div className="demo-card-body">
              <div className="diff-line diff-remove">
                - def fetch_data(url):
              </div>
              <div className="diff-line diff-remove">
                - response = requests.get(url)
              </div>
              <div className="diff-line diff-add">
                + async def fetch_data(url: str) -&gt; dict:
              </div>
              <div className="diff-line diff-add">
                + async with aiohttp.ClientSession() as s:
              </div>
              <div className="diff-line diff-add">
                + response = await s.get(url)
              </div>
              <div className="diff-line diff-context">
                {" "}
                return response.json()
              </div>
              <div className="summary-box">
                <div className="summary-label">{t.ai_label}</div>
                <div
                  className="summary-text"
                  dangerouslySetInnerHTML={{ __html: t.ai_summary }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TWITTER SHARE */}
      <section className="share-section">
        <div className="share-card">
          <div className="share-icon">🐦</div>
          <h3>{t.share_title}</h3>
          <p dangerouslySetInnerHTML={{ __html: t.share_desc }} />
          <button className="btn-twitter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>{t.share_btn}</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
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
    </>
  );
}

export default Landing;
