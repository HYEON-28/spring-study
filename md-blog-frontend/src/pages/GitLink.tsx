import { useState, useMemo } from "react";
import Nav from "../components/Nav";
import { useLang } from "../context/LangContext";
import { GITLINK_I18N } from "../i18n/gitlink";
import styles from "./GitLink.module.css";

const REPOS = [
  {
    name: "ai-chat-api",
    desc: "실시간 AI 채팅 REST API 서버, WebSocket 지원",
    lang: "TypeScript",
    langColor: "#3178c6",
    stars: 187,
    forks: 23,
    updated: "5일 전",
  },
  {
    name: "blog-engine",
    desc: "마크다운 기반 정적 블로그 생성기",
    lang: "JavaScript",
    langColor: "#f1e05a",
    stars: 19,
    forks: 3,
    updated: "2달 전",
  },
  {
    name: "cli-tools",
    desc: "개발 생산성을 위한 CLI 유틸리티 모음",
    lang: "Go",
    langColor: "#00ADD8",
    stars: 34,
    forks: 6,
    updated: "3주 전",
  },
  {
    name: "css-animations",
    desc: "웹 애니메이션 예제 및 스니펫 모음",
    lang: "JavaScript",
    langColor: "#f1e05a",
    stars: 22,
    forks: 4,
    updated: "1달 전",
  },
  {
    name: "data-pipeline",
    desc: "ETL 파이프라인 — Kafka + Spark 기반 스트리밍 처리",
    lang: "Python",
    langColor: "#3572A5",
    stars: 64,
    forks: 11,
    updated: "3일 전",
  },
  {
    name: "design-system",
    desc: "사내 디자인 시스템 컴포넌트 라이브러리",
    lang: "TypeScript",
    langColor: "#3178c6",
    stars: 203,
    forks: 41,
    updated: "1일 전",
  },
  {
    name: "design-tokens",
    desc: "디자인 토큰 중앙 관리 시스템 및 CLI 생성 도구",
    lang: "TypeScript",
    langColor: "#3178c6",
    stars: 47,
    forks: 8,
    updated: "1주 전",
  },
  {
    name: "dom-helpers",
    desc: "크로스 브라우저 DOM 조작 헬퍼 함수 모음",
    lang: "JavaScript",
    langColor: "#f1e05a",
    stars: 14,
    forks: 2,
    updated: "6주 전",
  },
  {
    name: "dotfiles",
    desc: "개인 개발환경 설정 (zsh, nvim, tmux)",
    lang: "Go",
    langColor: "#00ADD8",
    stars: 11,
    forks: 1,
    updated: "5일 전",
  },
  {
    name: "fastapi-template",
    desc: "FastAPI 프로젝트 보일러플레이트 (JWT, Docker 포함)",
    lang: "Python",
    langColor: "#3572A5",
    stars: 88,
    forks: 19,
    updated: "4일 전",
  },
  {
    name: "go-microservice",
    desc: "gRPC 기반 마이크로서비스 보일러플레이트",
    lang: "Go",
    langColor: "#00ADD8",
    stars: 78,
    forks: 17,
    updated: "4일 전",
  },
  {
    name: "k8s-configs",
    desc: "프로덕션 Kubernetes 배포 설정 모음",
    lang: "Go",
    langColor: "#00ADD8",
    stars: 45,
    forks: 12,
    updated: "1주 전",
  },
  {
    name: "ml-classifier",
    desc: "이미지 분류 모델 학습 및 서빙 파이프라인",
    lang: "Python",
    langColor: "#3572A5",
    stars: 113,
    forks: 29,
    updated: "2주 전",
  },
  {
    name: "next-portfolio",
    desc: "개인 포트폴리오 사이트 — Next.js 14 App Router 기반",
    lang: "TypeScript",
    langColor: "#3178c6",
    stars: 42,
    forks: 8,
    updated: "2일 전",
  },
  {
    name: "react-hooks-kit",
    desc: "자주 쓰는 커스텀 훅 모음 라이브러리",
    lang: "TypeScript",
    langColor: "#3178c6",
    stars: 91,
    forks: 15,
    updated: "1주 전",
  },
  {
    name: "rust-parser",
    desc: "고성능 로그 파서 — Rust로 구현",
    lang: "Rust",
    langColor: "#dea584",
    stars: 56,
    forks: 9,
    updated: "6일 전",
  },
  {
    name: "ts-utils",
    desc: "타입 유틸리티 함수 모음 및 제네릭 헬퍼",
    lang: "TypeScript",
    langColor: "#3178c6",
    stars: 31,
    forks: 5,
    updated: "3주 전",
  },
  {
    name: "wasm-renderer",
    desc: "WebAssembly 기반 경량 2D 렌더러",
    lang: "Rust",
    langColor: "#dea584",
    stars: 72,
    forks: 14,
    updated: "2주 전",
  },
];

function GitLink() {
  const { lang } = useLang();
  const t = GITLINK_I18N[lang];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const filteredRepos = useMemo(
    () =>
      REPOS.filter(
        (r) =>
          (!searchQuery ||
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.desc.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (!langFilter || r.lang === langFilter),
      ),
    [searchQuery, langFilter],
  );

  const toggleRepo = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelected(
      checked ? new Set(filteredRepos.map((r) => r.name)) : new Set(),
    );
  };

  const allChecked =
    filteredRepos.length > 0 &&
    filteredRepos.every((r) => selected.has(r.name));
  const someChecked = filteredRepos.some((r) => selected.has(r.name));
  const selectedNames = [...selected];

  const handleConnect = () => {
    setToastMsg(`${selected.size}${t.toast_success}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.pageBadge}>
            <div className={styles.badgeDot}></div>{t.badge}
          </div>
          <h1 className={styles.pageTitle}>
            {t.title.split(t.title_highlight)[0]}
            <span>{t.title_highlight}</span>
            {t.title.split(t.title_highlight)[1]}
          </h1>
          <p className={styles.pageDesc}>
            {t.desc.split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </div>

        <div className={styles.accountBox}>
          <div className={styles.accountInfo}>
            <div className={styles.ghAvatar}>K</div>
            <div>
              <div className={styles.accountName}>kim-dev</div>
              <div className={styles.accountSub}>github.com/kim-dev</div>
            </div>
          </div>
          <div className={styles.accountStatus}>
            <div className={styles.statusDot}></div>{t.auth_status}
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchWrap}>
              <svg
                className={styles.searchIcon}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder={t.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className={styles.filterSelect}
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
            >
              <option value="">{t.lang_all}</option>
              <option value="TypeScript">TypeScript</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
          </div>
          <span className={styles.countBadge}>
            {t.count_badge} <strong>{filteredRepos.length}</strong>{t.count_unit}
          </span>
        </div>

        <div className={styles.listHeader}>
          <div className={styles.listHeaderLeft}>
            <input
              type="checkbox"
              id="selectAll"
              className={styles.repoCheck}
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = !allChecked && someChecked;
              }}
              onChange={(e) => toggleSelectAll(e.target.checked)}
            />
            <label htmlFor="selectAll">{t.select_all}</label>
          </div>
          <button
            className={`${styles.btnCollapse}${isCollapsed ? " " + styles.collapsed : ""}`}
            onClick={() => setIsCollapsed((v) => !v)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
            <span>{isCollapsed ? t.expand : t.collapse}</span>
          </button>
        </div>

        <div className={styles.repoListOuter}>
          <div className={`${styles.repoListBody}${isCollapsed ? " " + styles.collapsed : ""}`}>
            {filteredRepos.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 14, color: "#8b949e" }}>
                  {t.no_result}
                </div>
              </div>
            ) : (
              filteredRepos.map((r) => (
                <div
                  key={r.name}
                  className={`${styles.repoItem}${selected.has(r.name) ? " " + styles.selected : ""}`}
                  onClick={() => toggleRepo(r.name)}
                >
                  <input
                    type="checkbox"
                    className={styles.repoCheck}
                    checked={selected.has(r.name)}
                    onChange={() => toggleRepo(r.name)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className={styles.repoBody}>
                    <div className={styles.repoTop}>
                      <span className={styles.repoName}>{r.name}</span>
                      <span className={styles.repoVis}>{t.repo_public}</span>
                    </div>
                    <div className={styles.repoDesc}>{r.desc}</div>
                    <div className={styles.repoMeta}>
                      <span className={styles.metaItem}>
                        <span
                          className={styles.langDot}
                          style={{ background: r.langColor }}
                        ></span>
                        {r.lang}
                      </span>
                      <span className={styles.metaItem}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                        </svg>
                        {r.stars}
                      </span>
                      <span className={styles.metaItem}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013 6.25v-.878a2.25 2.25 0 111.5 0z" />
                        </svg>
                        {r.forks}
                      </span>
                      <span className={styles.metaItem} style={{ color: "#484f58" }}>
                        {t.updated} {r.updated}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {isCollapsed && (
            <div className={`${styles.collapsedStrip} ${styles.visible}`}>
              <span className={styles.stripText}>
                {selected.size > 0 ? (
                  <>
                    <strong>{filteredRepos.length}개</strong> 레포지토리
                    &nbsp;·&nbsp;{" "}
                    <strong style={{ color: "#58a6ff" }}>
                      {selected.size}개
                    </strong>{" "}
                    선택됨
                  </>
                ) : (
                  <>
                    <strong>{filteredRepos.length}개</strong> 레포지토리
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </main>

      <div className={styles.bottomBar}>
        <div className={styles.bottomBarInner}>
          <div className={styles.selectedSummary}>
            <div>
              <div className={styles.selectedCount}>{selected.size}</div>
              <div className={styles.selectedLabel}>{t.selected_unit}</div>
            </div>
            <div className={styles.barDivider}></div>
            <div className={styles.selectedNames}>
              {selected.size > 0
                ? selectedNames.slice(0, 3).join(", ") +
                  (selectedNames.length > 3
                    ? ` ${t.selected_more.replace("%d", String(selectedNames.length - 3))}`
                    : "")
                : t.selected_placeholder}
            </div>
          </div>
          <div className={styles.barActions}>
            <button className={styles.btnSkip}>{t.btn_skip}</button>
            <button
              className={styles.btnConnect}
              disabled={selected.size === 0}
              onClick={handleConnect}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M1 8h14M9 2l6 6-6 6" />
              </svg>
              {t.btn_connect}
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <div className={`${styles.toast} ${styles.show}`}>
          <div className={styles.toastIcon}>✓</div>
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
}

export default GitLink;
