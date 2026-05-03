import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BlogSettings.module.css";
import { getConnectedRepos, addBlogRepos, removeBlogRepos, updateBlogRepoOrder, type ConnectedRepo } from "../api/repoApi";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { toRelativeTime } from "../utils/time";
import { BLOGSETTINGS_I18N } from "../i18n/blogsettings";

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

function BlogSettings() {
  const { token } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const t = BLOGSETTINGS_I18N[lang];

  const [connectedRepos, setConnectedRepos] = useState<ConnectedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderedBlogRepos, setOrderedBlogRepos] = useState<ConnectedRepo[]>([]);

  const [allSearch, setAllSearch] = useState("");
  const [allLang, setAllLang] = useState(t.lang_all);
  const [blogSearch, setBlogSearch] = useState("");

  const [selectedAll, setSelectedAll] = useState<Set<number>>(new Set());
  const [selectedBlog, setSelectedBlog] = useState<Set<number>>(new Set());

  const fetchRepos = () => {
    if (!token) return;
    setLoading(true);
    getConnectedRepos(token)
      .then((repos) => {
        setConnectedRepos(repos);
        setOrderedBlogRepos(
          repos.filter((r) => r.blog).sort((a, b) => a.displayOrder - b.displayOrder)
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRepos();
  }, [token]);

  const allLangs = Array.from(
    new Set(connectedRepos.map((r) => r.language).filter(Boolean))
  ) as string[];

  const filteredAll = connectedRepos
    .filter((r) => r.name.toLowerCase().includes(allSearch.toLowerCase()))
    .filter((r) => allLang === t.lang_all || r.language === allLang);

  const blogRepos = connectedRepos
    .filter((r) => r.blog)
    .filter((r) => r.name.toLowerCase().includes(blogSearch.toLowerCase()));

  const toggleAll = (id: number) => {
    setSelectedAll((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllSelect = (checked: boolean) => {
    setSelectedAll(checked ? new Set(filteredAll.map((r) => r.githubRepoId)) : new Set());
  };

  const toggleBlog = (id: number) => {
    setSelectedBlog((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleBlogSelect = (checked: boolean) => {
    setSelectedBlog(checked ? new Set(orderedBlogRepos.map((r) => r.githubRepoId)) : new Set());
  };

  const handleAddBlog = async () => {
    if (!token || selectedAll.size === 0) return;
    setAdding(true);
    try {
      await addBlogRepos(token, Array.from(selectedAll));
      setSelectedAll(new Set());
      fetchRepos();
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const moveUp = (id: number) => {
    setOrderedBlogRepos((prev) => {
      const idx = prev.findIndex((r) => r.githubRepoId === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (id: number) => {
    setOrderedBlogRepos((prev) => {
      const idx = prev.findIndex((r) => r.githubRepoId === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const handleSaveOrder = async () => {
    if (!token) return;
    setSavingOrder(true);
    try {
      await updateBlogRepoOrder(token, orderedBlogRepos.map((r) => r.githubRepoId));
      alert("순서가 저장되었습니다");
    } catch (e) {
      console.error(e);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleRemoveBlog = async () => {
    if (!token || selectedBlog.size === 0) return;
    setRemoving(true);
    try {
      await removeBlogRepos(token, Array.from(selectedBlog));
      setSelectedBlog(new Set());
      fetchRepos();
    } catch (e) {
      console.error(e);
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return <div style={{ color: "#8b949e", padding: 40 }}>{t.loading}</div>;
  }

  return (
    <>
      <nav className={styles.nav}>
        <a className={styles.navLogo} href="#">
          <svg viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
            />
          </svg>
          <span className={styles.navLogoText}>Md-<span className={styles.navLogoAccent}>Blog</span></span>
        </a>
        <div className={styles.navAvatar}>KD</div>
      </nav>

      <main className={styles.main}>
        <button className={styles.backBtn} onClick={() => navigate("/main")}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z" />
          </svg>
          {t.btn_back}
        </button>
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
              <span className={styles.cardCount}>{filteredAll.length}</span>
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
                value={allSearch}
                onChange={(e) => setAllSearch(e.target.value)}
              />
            </div>
            <select
              className={styles.langFilter}
              value={allLang}
              onChange={(e) => setAllLang(e.target.value)}
            >
              <option>{t.lang_all}</option>
              {allLangs.map((l) => (
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
                checked={filteredAll.length > 0 && selectedAll.size === filteredAll.length}
                onChange={(e) => toggleAllSelect(e.target.checked)}
              />
              <label htmlFor="sa1">{t.select_all}</label>
            </div>
            <span className={styles.selInfo}>
              {t.unit_connected} <strong className={styles.selInfoCountBlue}>{filteredAll.length}</strong>
            </span>
          </div>
          <div className={styles.repoRows}>
            {filteredAll.length === 0 ? (
              <div style={{ padding: "16px 18px", fontSize: 13, color: "#8b949e" }}>{t.empty_all}</div>
            ) : (
              filteredAll.map((r) => (
                <div key={r.githubRepoId} className={styles.repoRow} onClick={() => toggleAll(r.githubRepoId)}>
                  <input
                    type="checkbox"
                    className={styles.repoCheck}
                    checked={selectedAll.has(r.githubRepoId)}
                    onChange={() => toggleAll(r.githubRepoId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={styles.repoDot} style={{ background: LANG_COLORS[r.language ?? ""] ?? "#8b949e" }} />
                  <div className={styles.repoInfo}>
                    <div className={styles.repoName}>{r.name}</div>
                    <div className={styles.repoDesc}>{r.description ?? ""}</div>
                  </div>
                  <div className={styles.repoRight}>
                    {r.language && <span className={`${styles.tag} ${styles.tagLang}`}>{r.language}</span>}
                    <span className={`${styles.tag} ${styles.tagLinked}`}>{t.tag_connected}</span>
                    {r.blog && <span className={`${styles.tag} ${styles.tagBlog}`}>{t.tag_blog}</span>}
                    <span className={styles.repoDate}>{toRelativeTime(r.pushedAt, lang)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.actionBar}>
            <span className={styles.actionBarInfo}>
              {selectedAll.size > 0 ? `${selectedAll.size}${t.unit_selected}` : t.action_placeholder_add}
            </span>
            <button
              className={styles.btnAddBlog}
              disabled={selectedAll.size === 0 || adding}
              onClick={handleAddBlog}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 2v12M2 8h12" />
              </svg>
              {adding ? t.btn_adding : t.btn_add}
            </button>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={`${styles.cardIcon} ${styles.iconBlog}`}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="#a371f7">
                  <path d="M0 1.75A.75.75 0 01.75 1h4.253c1.227 0 2.317.59 3 1.501A3.744 3.744 0 0111.006 1h4.245a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-4.507a2.25 2.25 0 00-1.591.659l-.622.621a.75.75 0 01-1.06 0l-.622-.621A2.25 2.25 0 005.258 13H.75a.75.75 0 01-.75-.75zm7.251 10.324l.004-5.073-.002-2.253A2.25 2.25 0 005.003 2.5H1.5v9h3.757a3.75 3.75 0 012 .756zM8.755 4.75l-.004 7.322a3.752 3.752 0 012-.572H14.5v-9h-3.495a2.25 2.25 0 00-2.25 2.25z" />
                </svg>
              </div>
              <span className={styles.cardTitle}>{t.card_blog_title}</span>
              <span className={styles.cardCount}>{blogRepos.length}</span>
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
                placeholder={t.search_blog}
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.selectAllRow}>
            <div className={styles.selectAllLeft}>
              <input
                type="checkbox"
                className={styles.repoCheck}
                id="sa2"
                checked={orderedBlogRepos.length > 0 && selectedBlog.size === orderedBlogRepos.length}
                onChange={(e) => toggleBlogSelect(e.target.checked)}
              />
              <label htmlFor="sa2">{t.select_all}</label>
            </div>
            <span className={styles.selInfo}>
              {t.unit_blog} <strong className={styles.selInfoCountPurple}>{orderedBlogRepos.length}</strong>
            </span>
          </div>
          <div className={styles.repoRows}>
            {orderedBlogRepos.length === 0 ? (
              <div style={{ padding: "16px 18px", fontSize: 13, color: "#8b949e" }}>{t.empty_blog}</div>
            ) : (
              orderedBlogRepos
                .filter((r) => r.name.toLowerCase().includes(blogSearch.toLowerCase()))
                .map((r, idx, arr) => (
                <div key={r.githubRepoId} className={styles.repoRow} onClick={() => toggleBlog(r.githubRepoId)}>
                  <input
                    type="checkbox"
                    className={styles.repoCheck}
                    checked={selectedBlog.has(r.githubRepoId)}
                    onChange={() => toggleBlog(r.githubRepoId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={styles.repoDot} style={{ background: LANG_COLORS[r.language ?? ""] ?? "#8b949e" }} />
                  <div className={styles.repoInfo}>
                    <div className={`${styles.repoName} ${styles.repoNameBlog}`}>{r.name}</div>
                    <div className={styles.repoDesc}>{r.description ?? ""}</div>
                  </div>
                  <div className={styles.repoRight}>
                    {r.language && <span className={`${styles.tag} ${styles.tagLang}`}>{r.language}</span>}
                    <span className={`${styles.tag} ${styles.tagBlog}`}>{t.tag_blog}</span>
                    <span className={styles.repoDate}>{toRelativeTime(r.pushedAt, lang)}</span>
                  </div>
                  <div className={styles.orderButtons} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={styles.orderBtn}
                      disabled={idx === 0}
                      onClick={() => moveUp(r.githubRepoId)}
                      title="위로"
                    >▲</button>
                    <button
                      type="button"
                      className={styles.orderBtn}
                      disabled={idx === arr.length - 1}
                      onClick={() => moveDown(r.githubRepoId)}
                      title="아래로"
                    >▼</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.actionBar}>
            <span className={styles.actionBarInfo}>
              {selectedBlog.size > 0 ? `${selectedBlog.size}${t.unit_selected}` : t.action_placeholder_remove}
            </span>
            <button
              className={styles.btnSaveOrder}
              disabled={savingOrder}
              onClick={handleSaveOrder}
            >
              {savingOrder ? "저장 중..." : "순서 저장"}
            </button>
            <button
              className={styles.btnRemoveBlog}
              disabled={selectedBlog.size === 0 || removing}
              onClick={handleRemoveBlog}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 8h12" />
              </svg>
              {removing ? t.btn_removing : t.btn_remove}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default BlogSettings;
