import { useState } from "react";
import styles from "./FileUpdated.module.css";

type DiffLine =
  | { type: "hunk"; content: string }
  | { type: "add"; new: number; content: string }
  | { type: "del"; old: number; content: string }
  | { type: "ctx"; old: number; new: number; content: string };

interface Commit {
  hash: string;
  time: string;
  msg: string;
  add: number;
  del: number;
  body: string;
  tag?: string;
  diff: DiffLine[];
}

const COMMITS: Commit[] = [
  {
    hash: "a3f9b12",
    time: "09:14",
    msg: "feat: variant prop에 ghost 타입 추가",
    add: 42,
    del: 3,
    body: "기존 <code>primary</code> / <code>secondary</code> variant에 <code>ghost</code> 타입을 추가했습니다.",
    diff: [
      { type: "hunk", content: "@@ -4,1 +4,1 @@" },
      { type: "del", old: 4, content: "type Variant = 'primary' | 'secondary';" },
      { type: "add", new: 4, content: "type Variant = 'primary' | 'secondary' | 'ghost';" },
      { type: "ctx", old: 5, new: 5, content: "" },
      { type: "hunk", content: "@@ -21,1 +21,14 @@" },
      { type: "del", old: 21, content: "    disabled ? styles.disabled : ''," },
      { type: "add", new: 21, content: "    disabled ? styles.disabled : undefined," },
      { type: "ctx", old: 22, new: 22, content: "  ].filter(Boolean).join(' ');" },
      { type: "ctx", old: 23, new: 23, content: "" },
      { type: "add", new: 24, content: "  if (variant === 'ghost') {" },
      { type: "add", new: 25, content: "    return (" },
      { type: "add", new: 26, content: "      <button className={`${styles.btn} ${styles.btn_ghost}`}" },
      { type: "add", new: 27, content: "        disabled={disabled} onClick={onClick} {...rest}" },
      { type: "add", new: 28, content: "      >" },
      { type: "add", new: 29, content: "        {children}" },
      { type: "add", new: 30, content: "      </button>" },
      { type: "add", new: 31, content: "    );" },
      { type: "add", new: 32, content: "  }" },
    ],
  },
  {
    hash: "c71e4d9",
    time: "13:02",
    msg: "fix: ghost variant 포커스 링 스타일 누락 수정",
    add: 8,
    del: 2,
    body: "ghost variant에서 키보드 포커스 시 링이 보이지 않는 접근성 버그를 수정했습니다.",
    diff: [
      { type: "hunk", content: "@@ -28,4 +28,6 @@" },
      { type: "ctx", old: 28, new: 28, content: "      <button" },
      { type: "ctx", old: 29, new: 29, content: "        className={`${styles.btn} ${styles.btn_ghost}`}" },
      { type: "del", old: 30, content: "        disabled={disabled} onClick={onClick}" },
      { type: "del", old: 31, content: "        {...rest}" },
      { type: "add", new: 30, content: "        disabled={disabled}" },
      { type: "add", new: 31, content: "        onClick={onClick}" },
      { type: "add", new: 32, content: "        aria-disabled={disabled}" },
      { type: "add", new: 33, content: "        data-focus-visible={undefined}" },
      { type: "add", new: 34, content: "        {...rest}" },
      { type: "ctx", old: 32, new: 35, content: "      >" },
    ],
  },
  {
    hash: "f08a23c",
    time: "16:45",
    msg: "refactor: Button 공통 렌더 로직 헬퍼 함수로 추출",
    add: 39,
    del: 9,
    tag: "latest",
    body: "variant별 분기 렌더를 <code>renderButton()</code> 헬퍼로 추출해 중복 코드를 제거했습니다.",
    diff: [
      { type: "hunk", content: "@@ -18,20 +18,12 @@" },
      { type: "del", old: 18, content: "  const cls = [" },
      { type: "del", old: 19, content: "    styles.btn," },
      { type: "del", old: 20, content: "    styles[`btn_${variant}`]," },
      { type: "del", old: 21, content: "    disabled ? styles.disabled : undefined," },
      { type: "del", old: 22, content: "  ].filter(Boolean).join(' ');" },
      { type: "add", new: 18, content: "  const cls = buildClassName(variant, disabled);" },
      { type: "ctx", old: 23, new: 19, content: "" },
      { type: "del", old: 24, content: "  if (variant === 'ghost') {" },
      { type: "del", old: 25, content: "    return (" },
      { type: "del", old: 26, content: "      <button className={`${styles.btn} ${styles.btn_ghost}`}" },
      { type: "del", old: 27, content: "        disabled={disabled} onClick={onClick} {...rest}" },
      { type: "del", old: 28, content: "      >{children}</button>" },
      { type: "del", old: 29, content: "    );" },
      { type: "del", old: 30, content: "  }" },
      { type: "ctx", old: 31, new: 20, content: "" },
      { type: "add", new: 21, content: "  return renderButton({ cls, disabled, onClick, children, rest });" },
    ],
  },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderUnified(lines: DiffLine[]): JSX.Element {
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
          const rowCls =
            l.type === "add"
              ? styles.lineAdd
              : l.type === "del"
              ? styles.lineDel
              : "";
          const lnCls =
            l.type === "add"
              ? `${styles.ln} ${styles.lineAddLn}`
              : l.type === "del"
              ? `${styles.ln} ${styles.lineDelLn}`
              : `${styles.ln} ${styles.lineCtxLn}`;
          const codeCls =
            l.type === "add"
              ? `${styles.codeCell} ${styles.lineAddCode}`
              : l.type === "del"
              ? `${styles.codeCell} ${styles.lineDelCode}`
              : `${styles.codeCell} ${styles.lineCtxCode}`;
          const sym = l.type === "add" ? "+" : l.type === "del" ? "-" : " ";
          const oldLn = "old" in l ? l.old : undefined;
          const newLn = "new" in l ? l.new : undefined;
          return (
            <tr key={i} className={rowCls}>
              <td className={lnCls}>{oldLn ?? ""}</td>
              <td className={lnCls}>{newLn ?? ""}</td>
              <td className={codeCls}>
                {sym} {escapeHtml(l.content)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function renderSplit(lines: DiffLine[]): JSX.Element {
  const L: (DiffLine | null)[] = [];
  const R: (DiffLine | null)[] = [];
  lines.forEach((l) => {
    if (l.type === "hunk") { L.push(l); R.push(null); }
    else if (l.type === "ctx") { L.push(l); R.push(l); }
    else if (l.type === "del") { L.push(l); R.push(null); }
    else if (l.type === "add") { L.push(null); R.push(l); }
  });

  const renderSide = (arr: (DiffLine | null)[], isLeft: boolean) => (
    <div className={isLeft ? styles.splitSideLeft : styles.splitSideRight}>
      <table className={styles.diffTable} style={{ minWidth: "100%" }}>
        <tbody>
          {arr.map((l, i) => {
            if (!l) {
              return (
                <tr key={i} className="">
                  <td className={`${styles.ln} ${styles.lineCtxLn}`}> </td>
                  <td className={`${styles.codeCell} ${styles.lineCtxCode}`}> </td>
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
            const rowCls =
              l.type === "add"
                ? styles.lineAdd
                : l.type === "del"
                ? styles.lineDel
                : "";
            const lnCls =
              l.type === "add"
                ? `${styles.ln} ${styles.lineAddLn}`
                : l.type === "del"
                ? `${styles.ln} ${styles.lineDelLn}`
                : `${styles.ln} ${styles.lineCtxLn}`;
            const codeCls =
              l.type === "add"
                ? `${styles.codeCell} ${styles.lineAddCode}`
                : l.type === "del"
                ? `${styles.codeCell} ${styles.lineDelCode}`
                : `${styles.codeCell} ${styles.lineCtxCode}`;
            const sym = l.type === "add" ? "+" : l.type === "del" ? "-" : " ";
            const ln = isLeft
              ? "old" in l ? l.old ?? "" : ""
              : "new" in l ? l.new ?? "" : "";
            return (
              <tr key={i} className={rowCls}>
                <td className={lnCls}>{ln}</td>
                <td className={codeCls}>
                  {sym} {escapeHtml(l.content)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={styles.splitGrid}>
      {renderSide(L, true)}
      {renderSide(R, false)}
    </div>
  );
}

export default function FileUpdated() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");

  const commit = COMMITS[selectedIdx];
  const totalAdd = COMMITS.reduce((s, c) => s + c.add, 0);
  const totalDel = COMMITS.reduce((s, c) => s + c.del, 0);

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
          <a href="#">대시보드</a>
          <span className={styles.breadcrumbSep}>›</span>
          <a href="#">오늘의 업데이트</a>
          <span className={styles.breadcrumbSep}>›</span>
          <a href="#">design-system</a>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCur}>components/Button.tsx</span>
        </div>

        <div className={styles.pageHeader}>
          <div className={styles.filePathRow}>
            <span className={`${styles.changeBadge} ${styles.badgeModified}`}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="5" cy="5" r="4" />
              </svg>
              modified
            </span>
            <span className={styles.fileFullPath}>components/Button.tsx</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9z" />
              </svg>
              design-system
            </span>
            <span className={styles.metaItem}>
              오늘 커밋{" "}
              <strong className={styles.metaStrong}>{COMMITS.length}</strong>개
            </span>
            <span className={styles.metaItem}>
              총{" "}
              <span className={styles.diffAdd}>+{totalAdd}</span>
              &nbsp;<span className={styles.sepColor}>/</span>&nbsp;
              <span className={styles.diffDel}>−{totalDel}</span>
            </span>
          </div>
        </div>

        <div className={styles.timelineLabel}>
          오늘 커밋 타임라인 — 클릭하면 해당 diff를 확인할 수 있습니다
        </div>
        <div className={styles.timeline}>
          {COMMITS.map((c, i) => (
            <div
              key={c.hash}
              className={`${styles.timelineItem}${i === selectedIdx ? " " + styles.timelineItemActive : ""}`}
              onClick={() => setSelectedIdx(i)}
            >
              <div className={styles.tlLeft}>
                <div className={`${styles.tlIndex}${i === selectedIdx ? " " + styles.tlIndexActive : ""}`}>
                  {i + 1}
                </div>
                <div className={`${styles.tlLine}${i === COMMITS.length - 1 ? " " + styles.tlLineHidden : ""}`} />
              </div>
              <div className={styles.tlBody}>
                <div className={styles.tlMsg}>{c.msg}</div>
                <div className={styles.tlMeta}>
                  <span className={styles.tlHash}>{c.hash}</span>
                  <span className={styles.tlTime}>{c.time}</span>
                  <div className={styles.tlStat}>
                    <span className={styles.diffAdd}>+{c.add}</span>
                    <span className={styles.sepColor}>/</span>
                    <span className={styles.diffDel}>−{c.del}</span>
                  </div>
                  {c.tag && <span className={styles.tlTag}>{c.tag}</span>}
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
            커밋 {selectedIdx + 1}/{COMMITS.length} — {commit.hash} · {commit.time}
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
            <a className={styles.ghLink} href="#">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub에서 보기
            </a>
          </div>
        </div>

        <div className={styles.diffWrap}>
          <div className={styles.diffFileHeader}>
            <span className={styles.diffFileName}>components/Button.tsx</span>
            <div className={styles.diffStat}>
              <span className={styles.diffAdd}>+{commit.add}</span>
              <span className={styles.sepColor}>/</span>
              <span className={styles.diffDel}>−{commit.del}</span>
            </div>
          </div>
          {viewMode === "split" ? renderSplit(commit.diff) : renderUnified(commit.diff)}
        </div>

        <div className={styles.commitSection}>
          <div className={styles.commitHeader}>
            <div className={styles.commitTitle}>{commit.msg}</div>
            <div className={styles.commitMeta}>
              <span className={styles.commitHashLink}>{commit.hash}</span>
              <span className={styles.metaItem}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M8 4.75v3.5l2 2" />
                </svg>{" "}
                Apr 17, 2026 · {commit.time}
              </span>
              <span className={styles.metaItem}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.5 3.5a2 2 0 100 4 2 2 0 000-4zM2 5.5a3.5 3.5 0 115.898 2.549 5.507 5.507 0 013.034 4.084.75.75 0 11-1.482.235 4.001 4.001 0 00-7.9 0 .75.75 0 01-1.482-.236A5.507 5.507 0 013.102 8.05 3.49 3.49 0 012 5.5z" />
                </svg>
                kim-dev
              </span>
            </div>
          </div>
          <div
            className={styles.commitBody}
            dangerouslySetInnerHTML={{ __html: commit.body }}
          />
        </div>
      </main>
    </>
  );
}
