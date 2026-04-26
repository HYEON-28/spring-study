import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import styles from "./Main.module.css";
import {
  getConnectedRepos,
  getTodayUpdates,
  type ConnectedRepo,
  type TodayUpdateRepo,
} from "../api/repoApi";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { toRelativeTime } from "../utils/time";
import { MAIN_I18N } from "../i18n/main";

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

type FileType = "added" | "modified" | "deleted";

type SectionKey = "repo" | "blog" | "update";

function dotClass(type: FileType): string {
  if (type === "added") return styles.dotAdded;
  if (type === "deleted") return styles.dotDeleted;
  return styles.dotModified;
}

function Main() {
  const { token, user } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const t = MAIN_I18N[lang];
  const [repos, setRepos] = useState<ConnectedRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [todayUpdates, setTodayUpdates] = useState<TodayUpdateRepo[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getConnectedRepos(token)
      .then(setRepos)
      .catch(console.error)
      .finally(() => setReposLoading(false));
    getTodayUpdates(token)
      .then(setTodayUpdates)
      .catch(console.error)
      .finally(() => setUpdatesLoading(false));
  }, [token]);

  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    repo: false,
    blog: false,
    update: false,
  });
  const [updateOpen, setUpdateOpen] = useState<Record<number, boolean>>({});

  const toggleSection = (key: SectionKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleUpdateRepo = (i: number) => {
    setUpdateOpen((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const cx = (...classes: (string | false | undefined)[]) =>
    classes.filter(Boolean).join(" ");

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.greeting}>
          <div className={styles.greetingSub}>
            {new Date().toLocaleDateString(t.dateLocale, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className={styles.greetingTitle}>
            {t.greeting_prefix}<span>{user?.githubUsername}</span>{t.greeting_suffix}
          </div>
        </div>

        <div className={styles.statRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>{t.stat_repos}</div>
            <div className={styles.statValue}>
              {reposLoading ? "-" : repos.length}
            </div>
            <div className={styles.statSub} style={{ color: "#3fb950" }}>
              {t.stat_repos_sub}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>{t.stat_blog_repos}</div>
            <div className={styles.statValue}>
              {reposLoading ? "-" : repos.filter((r) => r.blog).length}
            </div>
            <div className={styles.statSub} style={{ color: "#a371f7" }}>
              {t.stat_blog_repos_sub}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>{t.stat_files}</div>
            <div className={styles.statValue}>
              {updatesLoading
                ? "-"
                : todayUpdates.reduce((s, r) => s + r.files.length, 0)}
            </div>
            <div className={styles.statSub} style={{ color: "#d29922" }}>
              {updatesLoading
                ? "-"
                : `+${todayUpdates.reduce((s, r) => s + r.totalAdd, 0)} / −${todayUpdates.reduce((s, r) => s + r.totalDel, 0)} lines`}
            </div>
          </div>
        </div>

        {/* SECTION 1 */}
        <div className={styles.section}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleSection("repo")}
          >
            <div className={styles.sectionHeaderLeft}>
              <div className={cx(styles.sectionIcon, styles.iconRepo)}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="#58a6ff">
                  <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z" />
                </svg>
              </div>
              <span className={styles.sectionTitle}>{t.section_repo}</span>
              <span className={styles.sectionCount}>{repos.length}</span>
            </div>
            <div className={styles.sectionHeaderRight}>
              <button
                className={styles.headerActionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/repoSettings");
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.103-.303c-.066-.019-.176-.011-.299.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.212.224l-.288 1.107c-.17.644-.716 1.195-1.459 1.258a8.233 8.233 0 0 1-1.402 0c-.743-.063-1.289-.614-1.459-1.258l-.288-1.107c-.018-.066-.079-.158-.212-.224a5.898 5.898 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.103.303c.066.019.176.011.299-.071.214-.143.437-.272.668-.386.133-.066.194-.158.212-.224l.288-1.107C5.49.645 6.035.095 6.779.031 7.01.01 7.505 0 8 0Zm-.571 6.603a2 2 0 1 0 1.142 3.847 2 2 0 0 0-1.142-3.847Z" />
                </svg>
                {t.btn_repo_settings}
              </button>
              <svg
                className={cx(styles.chevron, !collapsed.repo && styles.open)}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </div>
          </div>
          <div
            className={cx(
              styles.sectionBody,
              collapsed.repo && styles.collapsed,
            )}
          >
            <div>
              {reposLoading ? (
                <div className={styles.loadingText}>{t.loading}</div>
              ) : repos.length === 0 ? (
                <div className={styles.emptyText}>{t.empty_repos}</div>
              ) : (
                repos.map((r) => {
                  const langColor = LANG_COLORS[r.language ?? ""] ?? "#8b949e";
                  return (
                    <div key={r.githubRepoId} className={styles.repoItem}>
                      <span
                        className={styles.repoDot}
                        style={{ background: langColor }}
                      ></span>
                      <div className={styles.repoInfo}>
                        <div className={styles.repoName}>{r.name}</div>
                        <div className={styles.repoDesc}>
                          {r.description ?? ""}
                        </div>
                      </div>
                      <div className={styles.repoMetaRight}>
                        {r.language && (
                          <span className={cx(styles.tag, styles.tagLang)}>
                            {r.language}
                          </span>
                        )}
                        <span className={cx(styles.tag, styles.tagActive)}>
                          {t.tag_connected}
                        </span>
                        <span className={styles.repoUpdated}>
                          {toRelativeTime(r.pushedAt, lang)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className={styles.section}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleSection("blog")}
          >
            <div className={styles.sectionHeaderLeft}>
              <div className={cx(styles.sectionIcon, styles.iconBlog)}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="#3fb950">
                  <path d="M0 1.75A.75.75 0 01.75 1h4.253c1.227 0 2.317.59 3 1.501A3.744 3.744 0 0111.006 1h4.245a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-4.507a2.25 2.25 0 00-1.591.659l-.622.621a.75.75 0 01-1.06 0l-.622-.621A2.25 2.25 0 005.258 13H.75a.75.75 0 01-.75-.75zm7.251 10.324l.004-5.073-.002-2.253A2.25 2.25 0 005.003 2.5H1.5v9h3.757a3.75 3.75 0 012 .756zM8.755 4.75l-.004 7.322a3.752 3.752 0 012-.572H14.5v-9h-3.495a2.25 2.25 0 00-2.25 2.25z" />
                </svg>
              </div>
              <span className={styles.sectionTitle}>{t.section_blog}</span>
              <span className={styles.sectionCount}>
                {repos.filter((r) => r.blog).length}{t.unit_blog_repos}
              </span>
            </div>
            <div className={styles.sectionHeaderRight}>
              <button
                className={styles.headerActionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/blogSettings");
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.103-.303c-.066-.019-.176-.011-.299.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.212.224l-.288 1.107c-.17.644-.716 1.195-1.459 1.258a8.233 8.233 0 0 1-1.402 0c-.743-.063-1.289-.614-1.459-1.258l-.288-1.107c-.018-.066-.079-.158-.212-.224a5.898 5.898 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.103.303c.066.019.176.011.299-.071.214-.143.437-.272.668-.386.133-.066.194-.158.212-.224l.288-1.107C5.49.645 6.035.095 6.779.031 7.01.01 7.505 0 8 0Zm-.571 6.603a2 2 0 1 0 1.142 3.847 2 2 0 0 0-1.142-3.847Z" />
                </svg>
                {t.btn_blog_settings}
              </button>
              <svg
                className={cx(styles.chevron, !collapsed.blog && styles.open)}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </div>
          </div>
          <div
            className={cx(
              styles.sectionBody,
              collapsed.blog && styles.collapsed,
            )}
          >
            <div>
              {reposLoading ? (
                <div className={styles.loadingText}>{t.loading}</div>
              ) : repos.filter((r) => r.blog).length === 0 ? (
                <div className={styles.emptyText}>{t.empty_blog_repos}</div>
              ) : (
                repos
                  .filter((r) => r.blog)
                  .map((br) => {
                    const langColor =
                      LANG_COLORS[br.language ?? ""] ?? "#8b949e";
                    return (
                      <div key={br.githubRepoId} className={styles.blogRepoRow}>
                        <div className={styles.blogRepoIcon}>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="#a371f7"
                          >
                            <path d="M0 1.75A.75.75 0 01.75 1h4.253c1.227 0 2.317.59 3 1.501A3.744 3.744 0 0111.006 1h4.245a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-4.507a2.25 2.25 0 00-1.591.659l-.622.621a.75.75 0 01-1.06 0l-.622-.621A2.25 2.25 0 005.258 13H.75a.75.75 0 01-.75-.75zm7.251 10.324l.004-5.073-.002-2.253A2.25 2.25 0 005.003 2.5H1.5v9h3.757a3.75 3.75 0 012 .756zM8.755 4.75l-.004 7.322a3.752 3.752 0 012-.572H14.5v-9h-3.495a2.25 2.25 0 00-2.25 2.25z" />
                          </svg>
                        </div>
                        <div className={styles.blogRepoInfo}>
                          <div className={styles.blogRepoName}>{br.name}</div>
                          <div className={styles.blogRepoSub}>
                            {br.description ?? ""}
                          </div>
                        </div>
                        <div className={styles.blogRepoRight}>
                          {br.language && (
                            <span
                              className={cx(styles.tag, styles.tagLang)}
                              style={{
                                borderColor: langColor,
                                color: langColor,
                              }}
                            >
                              {br.language}
                            </span>
                          )}
                          <span className={styles.repoUpdated}>
                            {toRelativeTime(br.pushedAt, lang)}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3 */}
        <div className={styles.section}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleSection("update")}
          >
            <div className={styles.sectionHeaderLeft}>
              <div className={cx(styles.sectionIcon, styles.iconUpdate)}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="#d29922">
                  <path d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.75 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.22.53l2.25 2.25a.75.75 0 101.06-1.06L8.75 7.94V4.75z" />
                </svg>
              </div>
              <span className={styles.sectionTitle}>{t.section_update}</span>
              <span className={styles.sectionCount}>
                {updatesLoading
                  ? "..."
                  : `${t.unit_repo} ${todayUpdates.length} · ${t.unit_file} ${todayUpdates.reduce((s, r) => s + r.files.length, 0)}`}
              </span>
            </div>
            <div className={styles.sectionHeaderRight}>
              <svg
                className={cx(styles.chevron, !collapsed.update && styles.open)}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </div>
          </div>
          <div
            className={cx(
              styles.sectionBody,
              collapsed.update && styles.collapsed,
            )}
          >
            <div>
              {updatesLoading ? (
                <div className={styles.loadingText}>{t.loading}</div>
              ) : todayUpdates.length === 0 ? (
                <div className={styles.emptyText}>{t.empty_updates}</div>
              ) : (
                todayUpdates.map((ur, i) => {
                  const langColor = LANG_COLORS[ur.language ?? ""] ?? "#8b949e";
                  return (
                    <div key={ur.repoName} className={styles.updateRepoGroup}>
                      <div
                        className={styles.updateRepoHeader}
                        onClick={() => toggleUpdateRepo(i)}
                      >
                        <div className={styles.updateRepoIcon}>
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 16 16"
                            fill={langColor}
                          >
                            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z" />
                          </svg>
                        </div>
                        <span className={styles.updateRepoName}>
                          {ur.repoName}
                        </span>
                        <div className={styles.updateRepoStats}>
                          <span className={styles.diffAdd}>+{ur.totalAdd}</span>
                          <span style={{ color: "#484f58" }}>/</span>
                          <span className={styles.diffDel}>−{ur.totalDel}</span>
                        </div>
                        <span className={styles.updateFileCount}>
                          {ur.files.length}{lang === "en" ? " files" : lang === "ja" ? "件のファイル" : lang === "zh" ? "个文件" : "개 파일"}
                        </span>
                        <svg
                          className={cx(
                            styles.chevron,
                            updateOpen[i] && styles.open,
                          )}
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="#8b949e"
                          strokeWidth="1.8"
                        >
                          <path d="M4 6l4 4 4-4" />
                        </svg>
                      </div>
                      <div
                        className={cx(
                          styles.updateFiles,
                          !updateOpen[i] && styles.collapsed,
                        )}
                      >
                        {ur.files.map((f) => (
                          <div
                            key={f.filePath}
                            className={styles.updateFileItem}
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate("/file-updated", {
                                state: {
                                  repoFullName: ur.repoFullName,
                                  repoName: ur.repoName,
                                  filePath: f.filePath,
                                },
                              })
                            }
                          >
                            <span
                              className={cx(
                                styles.fileTypeDot,
                                dotClass(f.changeType as FileType),
                              )}
                            ></span>
                            <span className={styles.fileName}>
                              {f.filePath}
                            </span>
                            <span className={styles.fileMsg}>
                              {f.commitMessage}
                            </span>
                            <div className={styles.fileDiff}>
                              <span className={styles.diffAdd}>
                                +{f.additions}
                              </span>
                              <span style={{ color: "#484f58" }}>/</span>
                              <span className={styles.diffDel}>
                                −{f.deletions}
                              </span>
                            </div>
                            <span className={styles.fileTime}>{f.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Main;
