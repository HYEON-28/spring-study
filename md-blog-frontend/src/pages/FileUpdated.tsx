import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { getFileDetail, type FileDetail, type FileDetailCommit } from "../api/repoApi";
import { FILEUPDATED_I18N } from "../i18n/fileupdated";
import styles from "./FileUpdated.module.css";

type DiffLineType = "hunk" | "add" | "del" | "ctx";

interface DiffLine {
  type: DiffLineType;
  content: string;
  old?: number;
  new?: number;
}

interface LocationState {
  repoFullName: string;
  repoName: string;
  filePath: string;
}

function parsePatch(patch: string | null | undefined): DiffLine[] {
  if (!patch) return [];
  const result: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const raw of patch.split("\n")) {
    if (raw.startsWith("@@")) {
      const m = raw.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (m) {
        oldLine = parseInt(m[1], 10);
        newLine = parseInt(m[2], 10);
      }
      result.push({ type: "hunk", content: raw });
    } else if (raw.startsWith("+")) {
      result.push({ type: "add", new: newLine++, content: raw.slice(1) });
    } else if (raw.startsWith("-")) {
      result.push({ type: "del", old: oldLine++, content: raw.slice(1) });
    } else if (raw.startsWith(" ")) {
      result.push({ type: "ctx", old: oldLine++, new: newLine++, content: raw.slice(1) });
    }
  }
  return result;
}

function DiffUnified({ lines }: { lines: DiffLine[] }) {
  return (
    <table className={styles.diffTable}>
      <tbody>
        {lines.map((l, i) => {
          if (l.type === "hunk") {
            return (
              <tr key={i} className={styles.hunkHeaderRow}>
                <td colSpan={3}>{l.content}</td>
              </tr>
            );
          }
          const rowCls = l.type === "add" ? styles.lineAdd : l.type === "del" ? styles.lineDel : "";
          const lnCls = l.type === "add" ? styles.lineAddLn : l.type === "del" ? styles.lineDelLn : styles.lineCtxLn;
          const codeCls = l.type === "add" ? styles.lineAddCode : l.type === "del" ? styles.lineDelCode : styles.lineCtxCode;
          const symColor = l.type === "add" ? "#3fb950" : l.type === "del" ? "#f85149" : "inherit";
          const sym = l.type === "add" ? "+" : l.type === "del" ? "-" : " ";
          return (
            <tr key={i} className={rowCls}>
              <td className={`${styles.ln} ${lnCls}`}>{l.old ?? ""}</td>
              <td className={`${styles.ln} ${lnCls}`}>{l.new ?? ""}</td>
              <td className={`${styles.codeCell} ${codeCls}`}>
                <span style={{ color: symColor }}>{sym}</span> {l.content}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DiffSplitSide({ lines, isLeft }: { lines: (DiffLine | null)[]; isLeft: boolean }) {
  return (
    <div className={isLeft ? styles.splitSideLeft : styles.splitSideRight}>
      <table className={styles.diffTable} style={{ minWidth: "100%" }}>
        <tbody>
          {lines.map((l, i) => {
            if (!l) {
              return (
                <tr key={i}>
                  <td className={styles.ln}> </td>
                  <td className={styles.codeCell}> </td>
                </tr>
              );
            }
            if (l.type === "hunk") {
              return (
                <tr key={i} className={styles.hunkHeaderRow}>
                  <td colSpan={2}>{l.content}</td>
                </tr>
              );
            }
            const rowCls = l.type === "add" ? styles.lineAdd : l.type === "del" ? styles.lineDel : "";
            const lnCls = l.type === "add" ? styles.lineAddLn : l.type === "del" ? styles.lineDelLn : styles.lineCtxLn;
            const codeCls = l.type === "add" ? styles.lineAddCode : l.type === "del" ? styles.lineDelCode : styles.lineCtxCode;
            const symColor = l.type === "add" ? "#3fb950" : l.type === "del" ? "#f85149" : "inherit";
            const sym = l.type === "add" ? "+" : l.type === "del" ? "-" : " ";
            const ln = isLeft ? (l.old ?? "") : (l.new ?? "");
            return (
              <tr key={i} className={rowCls}>
                <td className={`${styles.ln} ${lnCls}`}>{ln}</td>
                <td className={`${styles.codeCell} ${codeCls}`}>
                  <span style={{ color: symColor }}>{sym}</span> {l.content}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DiffSplit({ lines }: { lines: DiffLine[] }) {
  const L: (DiffLine | null)[] = [];
  const R: (DiffLine | null)[] = [];
  lines.forEach((l) => {
    if (l.type === "hunk")     { L.push(l); R.push(null); }
    else if (l.type === "ctx") { L.push(l); R.push(l); }
    else if (l.type === "del") { L.push(l); R.push(null); }
    else if (l.type === "add") { L.push(null); R.push(l); }
  });
  return (
    <div className={styles.splitGrid}>
      <DiffSplitSide lines={L} isLeft={true} />
      <DiffSplitSide lines={R} isLeft={false} />
    </div>
  );
}

function FileUpdated() {
  const { token } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const t = FILEUPDATED_I18N[lang];

  const [data, setData] = useState<FileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");

  useEffect(() => {
    if (!state?.repoFullName || !state?.filePath) {
      navigate("/main", { replace: true });
      return;
    }
    if (!token) return;
    getFileDetail(token, state.repoFullName, state.filePath)
      .then((d) => {
        setData(d);
        setSelectedIdx(0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, state?.repoFullName, state?.filePath]);

  if (!state) return null;

  const { repoFullName, repoName, filePath } = state;
  const today = new Date().toLocaleDateString(t.dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <>
        <nav className={styles.nav}>
          <a className={styles.navLogo} href="/main">
            <div className={styles.navLogoMark}>gx</div>
            <span className={styles.navLogoText}>GitXpert</span>
          </a>
        </nav>
        <main className={styles.main}>
          <div className={styles.timelineLabel}>{t.loading}</div>
        </main>
      </>
    );
  }

  if (!data || data.commits.length === 0) {
    return (
      <>
        <nav className={styles.nav}>
          <a className={styles.navLogo} href="/main">
            <div className={styles.navLogoMark}>gx</div>
            <span className={styles.navLogoText}>GitXpert</span>
          </a>
        </nav>
        <main className={styles.main}>
          <div className={styles.breadcrumb}>
            <a href="/main">{t.breadcrumb_dashboard}</a>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCur}>{filePath}</span>
          </div>
          <div className={styles.timelineLabel}>{t.no_commits}</div>
        </main>
      </>
    );
  }

  const commit: FileDetailCommit = data.commits[selectedIdx];
  const diffLines = parsePatch(commit.patch);
  const shortSha = (sha: string) => sha.substring(0, 7);
  const ghCommitUrl = `https://github.com/${repoFullName}/commit/${commit.sha}`;

  return (
    <>
      <nav className={styles.nav}>
        <a className={styles.navLogo} href="/main">
          <div className={styles.navLogoMark}>gx</div>
          <span className={styles.navLogoText}>GitXpert</span>
        </a>
      </nav>

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <a href="/main">{t.breadcrumb_dashboard}</a>
          <span className={styles.breadcrumbSep}>›</span>
          <a href="/main">{t.breadcrumb_updates}</a>
          <span className={styles.breadcrumbSep}>›</span>
          <a href="/main">{repoName}</a>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCur}>{filePath}</span>
        </div>

        <div className={styles.pageHeader}>
          <div className={styles.filePathRow}>
            <span className={`${styles.changeBadge} ${styles.badgeModified}`}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="5" cy="5" r="4" />
              </svg>
              modified
            </span>
            <span className={styles.fileFullPath}>{filePath}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9z" />
              </svg>
              {repoName}
            </span>
            <span className={styles.metaItem}>
              {t.meta_commits} <strong className={styles.metaStrong}>{data.commits.length}</strong>
            </span>
            <span className={styles.metaItem}>
              {t.meta_total} <span className={styles.diffAdd}>+{data.totalAdd}</span>&nbsp;
              <span className={styles.sepColor}>/</span>&nbsp;
              <span className={styles.diffDel}>−{data.totalDel}</span>
            </span>
          </div>
        </div>

        <div className={styles.timelineLabel}>{t.timeline_label}</div>
        <div className={styles.timeline}>
          {data.commits.map((c, i) => (
            <div
              key={c.sha}
              className={`${styles.timelineItem}${i === selectedIdx ? " " + styles.timelineItemActive : ""}`}
              onClick={() => setSelectedIdx(i)}
            >
              <div className={styles.tlLeft}>
                <div className={`${styles.tlIndex}${i === selectedIdx ? " " + styles.tlIndexActive : ""}`}>
                  {i + 1}
                </div>
                {i < data.commits.length - 1 && <div className={styles.tlLine} />}
              </div>
              <div className={styles.tlBody}>
                <div className={styles.tlMsg}>{c.message}</div>
                <div className={styles.tlMeta}>
                  <span className={styles.tlHash}>{shortSha(c.sha)}</span>
                  <span className={styles.tlTime}>{c.time}</span>
                  <div className={styles.tlStat}>
                    <span className={styles.diffAdd}>+{c.additions}</span>
                    <span className={styles.sepColor}>/</span>
                    <span className={styles.diffDel}>−{c.deletions}</span>
                  </div>
                  {c.latest && <span className={styles.tlTag}>latest</span>}
                </div>
              </div>
              <div className={styles.tlRight}>
                <svg className={styles.tlChevron} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.diffSectionHeader}>
          <div className={styles.diffSectionTitle}>
            {selectedIdx + 1}/{data.commits.length} — {shortSha(commit.sha)} · {commit.time}
          </div>
          <div className={styles.diffSectionMeta}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn}${viewMode === "split" ? " " + styles.viewBtnActive : ""}`}
                onClick={() => setViewMode("split")}
              >
                Split
              </button>
              <button
                className={`${styles.viewBtn}${viewMode === "unified" ? " " + styles.viewBtnActive : ""}`}
                onClick={() => setViewMode("unified")}
              >
                Unified
              </button>
            </div>
            <a className={styles.ghLink} href={ghCommitUrl} target="_blank" rel="noreferrer">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              {t.gh_link}
            </a>
          </div>
        </div>

        <div className={styles.diffWrap}>
          <div className={styles.diffFileHeader}>
            <span className={styles.diffFileName}>{filePath}</span>
            <div className={styles.diffStat}>
              <span className={styles.diffAdd}>+{commit.additions}</span>
              <span className={styles.sepColor}>/</span>
              <span className={styles.diffDel}>−{commit.deletions}</span>
            </div>
          </div>
          {diffLines.length === 0 ? (
            <div style={{ padding: "16px", color: "#8b949e", fontSize: "12px", fontFamily: "JetBrains Mono, monospace" }}>
              {t.no_diff}
            </div>
          ) : viewMode === "split" ? (
            <DiffSplit lines={diffLines} />
          ) : (
            <DiffUnified lines={diffLines} />
          )}
        </div>

        <div className={styles.commitSection}>
          <div className={styles.commitHeader}>
            <div className={styles.commitTitle}>{commit.message}</div>
            <div className={styles.commitMeta}>
              <span className={styles.commitHashLink}>{shortSha(commit.sha)}</span>
              <span className={styles.metaItem}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M8 4.75v3.5l2 2" />
                </svg>
                {today} · {commit.time}
              </span>
            </div>
          </div>
          <div className={styles.commitBody}>
            {repoFullName}
          </div>
        </div>
      </main>
    </>
  );
}

export default FileUpdated;
