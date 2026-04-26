import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RepoSettings.module.css";
import { getPublicRepos, getConnectedRepos, connectRepos, disconnectRepos, type GithubRepo, type ConnectedRepo } from "../api/repoApi";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { toRelativeTime } from "../utils/time";
import { REPOSETTINGS_I18N } from "../i18n/reposettings";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Ruby: "#701516",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Shell: "#89e051",
  Dart: "#00B4AB",
};

function RepoSettings() {
  const { token } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const t = REPOSETTINGS_I18N[lang];

  const [publicRepos, setPublicRepos] = useState<GithubRepo[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<ConnectedRepo[]>([]);
  const [loading, setLoading] = useState(true);

  const [publicSearch, setPublicSearch] = useState("");
  const [publicLang, setPublicLang] = useState(t.lang_all);
  const [connectedSearch, setConnectedSearch] = useState("");

  const [selectedPublic, setSelectedPublic] = useState<Set<number>>(new Set());
  const [selectedConnected, setSelectedConnected] = useState<Set<number>>(new Set());
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([getPublicRepos(token), getConnectedRepos(token)])
      .then(([pub, conn]) => {
        setPublicRepos(pub);
        setConnectedRepos(conn);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const connectedIds = new Set(connectedRepos.map((r) => r.githubRepoId));

  const filteredPublic = publicRepos
    .filter((r) => !connectedIds.has(r.githubRepoId))
    .filter((r) => r.name.toLowerCase().includes(publicSearch.toLowerCase()))
    .filter((r) => publicLang === t.lang_all || r.language === publicLang);

  const filteredConnected = connectedRepos.filter((r) =>
    r.name.toLowerCase().includes(connectedSearch.toLowerCase())
  );

  const publicLangs = Array.from(new Set(publicRepos.map((r) => r.language).filter(Boolean))) as string[];

  const togglePublic = (id: number) => {
    setSelectedPublic((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllPublic = (checked: boolean) => {
    setSelectedPublic(checked ? new Set(filteredPublic.map((r) => r.githubRepoId)) : new Set());
  };

  const toggleConnected = (id: number) => {
    setSelectedConnected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllConnected = (checked: boolean) => {
    setSelectedConnected(checked ? new Set(filteredConnected.map((r) => r.githubRepoId)) : new Set());
  };

  const handleDisconnect = async () => {
    if (!token || selectedConnected.size === 0) return;
    setDisconnecting(true);
    try {
      await disconnectRepos(token, Array.from(selectedConnected));
      const [pub, conn] = await Promise.all([getPublicRepos(token), getConnectedRepos(token)]);
      setPublicRepos(pub);
      setConnectedRepos(conn);
      setSelectedConnected(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleConnect = async () => {
    if (!token || selectedPublic.size === 0) return;
    const toConnect = publicRepos.filter((r) => selectedPublic.has(r.githubRepoId));
    setConnecting(true);
    try {
      await connectRepos(token, toConnect);
      const [pub, conn] = await Promise.all([getPublicRepos(token), getConnectedRepos(token)]);
      setPublicRepos(pub);
      setConnectedRepos(conn);
      setSelectedPublic(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return <div style={{ color: "#8b949e", padding: 40 }}>{t.loading}</div>;
  }

  return (
    <>
      <nav className={styles.nav}>
        <a className={styles.navLogo} href="#">
          <div className={styles.navLogoMark}>gx</div>
          <span className={styles.navLogoText}>GitXpert</span>
        </a>
        <div className={styles.navAvatar}>KD</div>
      </nav>

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/main"); }}>{t.breadcrumb_dashboard}</a>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{t.breadcrumb_current}</span>
        </div>

        <div className={styles.pageHeader}>
          <div className={styles.pageTitle}>{t.page_title}</div>
          <div className={styles.pageDesc}>{t.page_desc}</div>
        </div>

        {/* SECTION 1 */}
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={`${styles.cardIcon} ${styles.iconAll}`}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="#58a6ff">
                  <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z" />
                </svg>
              </div>
              <span className={styles.cardTitle}>{t.card_all_title}</span>
              <span className={styles.cardCount}>{filteredPublic.length}</span>
            </div>
          </div>
          <div className={styles.cardToolbar}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder={t.search_all}
                value={publicSearch}
                onChange={(e) => setPublicSearch(e.target.value)}
              />
            </div>
            <select
              className={styles.langFilter}
              value={publicLang}
              onChange={(e) => setPublicLang(e.target.value)}
            >
              <option>{t.lang_all}</option>
              {publicLangs.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className={styles.selectAllRow}>
            <div className={styles.selectAllLeft}>
              <input
                type="checkbox"
                className={styles.repoCheck}
                id="sa1"
                checked={filteredPublic.length > 0 && selectedPublic.size === filteredPublic.length}
                onChange={(e) => toggleAllPublic(e.target.checked)}
              />
              <label htmlFor="sa1">{t.select_all}</label>
            </div>
            <span className={styles.selInfo}>
              {t.unit_public} <strong className={styles.selInfoCount}>{filteredPublic.length}</strong>
            </span>
          </div>
          <div className={styles.repoRows}>
            {filteredPublic.length === 0 ? (
              <div style={{ padding: "16px 18px", fontSize: 13, color: "#8b949e" }}>{t.empty_all}</div>
            ) : (
              filteredPublic.map((r) => (
                <div key={r.githubRepoId} className={styles.repoRow} onClick={() => togglePublic(r.githubRepoId)}>
                  <input
                    type="checkbox"
                    className={styles.repoCheck}
                    checked={selectedPublic.has(r.githubRepoId)}
                    onChange={() => togglePublic(r.githubRepoId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={styles.repoDot} style={{ background: LANG_COLORS[r.language ?? ""] ?? "#8b949e" }} />
                  <div className={styles.repoInfo}>
                    <div className={styles.repoName}>{r.name}</div>
                    <div className={styles.repoDesc}>{r.description ?? ""}</div>
                  </div>
                  <div className={styles.repoRight}>
                    {r.language && <span className={`${styles.tag} ${styles.tagLang}`}>{r.language}</span>}
                    <span className={styles.repoDate}>{toRelativeTime(r.updatedAt, lang)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.actionBar}>
            <span className={styles.actionBarInfo}>
              {selectedPublic.size > 0 ? `${selectedPublic.size}${t.unit_selected}` : t.action_placeholder_connect}
            </span>
            <button
              className={styles.btnConnect}
              disabled={selectedPublic.size === 0 || connecting}
              onClick={handleConnect}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 8h14M9 2l6 6-6 6" />
              </svg>
              {connecting ? t.btn_connecting : t.btn_connect}
            </button>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={`${styles.cardIcon} ${styles.iconLinked}`}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="#3fb950">
                  <path d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm3.78 5.78a.75.75 0 00-1.06-1.06L6.75 9.69 5.28 8.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" />
                </svg>
              </div>
              <span className={styles.cardTitle}>{t.card_connected_title}</span>
              <span className={styles.cardCount}>{filteredConnected.length}</span>
            </div>
          </div>
          <div className={styles.cardToolbar}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder={t.search_connected}
                value={connectedSearch}
                onChange={(e) => setConnectedSearch(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.selectAllRow}>
            <div className={styles.selectAllLeft}>
              <input
                type="checkbox"
                className={`${styles.repoCheck} ${styles.repoCheckRed}`}
                id="sa2"
                checked={filteredConnected.length > 0 && selectedConnected.size === filteredConnected.length}
                onChange={(e) => toggleAllConnected(e.target.checked)}
              />
              <label htmlFor="sa2">{t.select_all}</label>
            </div>
            <span className={styles.selInfo}>
              {t.unit_connected} <strong className={styles.selInfoCountGreen}>{filteredConnected.length}</strong>
            </span>
          </div>
          <div className={styles.repoRows}>
            {filteredConnected.length === 0 ? (
              <div style={{ padding: "16px 18px", fontSize: 13, color: "#8b949e" }}>{t.empty_connected}</div>
            ) : (
              filteredConnected.map((r) => (
                <div key={r.githubRepoId} className={styles.repoRow} onClick={() => toggleConnected(r.githubRepoId)}>
                  <input
                    type="checkbox"
                    className={`${styles.repoCheck} ${styles.repoCheckRed}`}
                    checked={selectedConnected.has(r.githubRepoId)}
                    onChange={() => toggleConnected(r.githubRepoId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={styles.repoDot} style={{ background: LANG_COLORS[r.language ?? ""] ?? "#8b949e" }} />
                  <div className={styles.repoInfo}>
                    <div className={`${styles.repoName} ${styles.repoNameLinked}`}>{r.name}</div>
                    <div className={styles.repoDesc}>{r.description ?? ""}</div>
                  </div>
                  <div className={styles.repoRight}>
                    {r.language && <span className={`${styles.tag} ${styles.tagLang}`}>{r.language}</span>}
                    <span className={`${styles.tag} ${styles.tagLinked}`}>{t.tag_connected}</span>
                    <span className={styles.repoDate}>{toRelativeTime(r.pushedAt, lang)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.actionBar}>
            <span className={styles.actionBarInfo}>
              {selectedConnected.size > 0 ? `${selectedConnected.size}${t.unit_selected}` : t.action_placeholder_disconnect}
            </span>
            <button
              className={styles.btnDisconnect}
              disabled={selectedConnected.size === 0 || disconnecting}
              onClick={handleDisconnect}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 8h10M3 4l-2 4 2 4M13 4l2 4-2 4" />
              </svg>
              {disconnecting ? t.btn_disconnecting : t.btn_disconnect}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default RepoSettings;
