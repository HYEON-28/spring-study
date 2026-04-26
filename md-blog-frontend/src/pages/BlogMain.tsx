import { useEffect, useState } from "react";
import { getBlogMain, type BlogMain, type BlogRepo } from "../api/blogApi";
import styles from "./BlogMain.module.css";

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

function RepoCard({ repo }: { repo: BlogRepo }) {
  const langColor = LANG_COLORS[repo.language ?? ""] ?? "#8b949e";
  const summary = repo.description;

  return (
    <div className={styles.repoCard}>
      <div className={styles.repoCardHeader}>
        <a
          className={styles.repoName}
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
        >
          {repo.name}
        </a>
        {repo.language && (
          <span
            className={styles.langBadge}
            style={{ borderColor: langColor, color: langColor }}
          >
            {repo.language}
          </span>
        )}
      </div>
      {summary && <p className={styles.repoSummary}>{summary}</p>}
      <a
        className={styles.repoGithubLink}
        href={repo.htmlUrl}
        target="_blank"
        rel="noreferrer"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        GitHub에서 보기
      </a>
    </div>
  );
}

interface Props {
  username: string;
}

export default function BlogMain({ username }: Props) {
  const [blog, setBlog] = useState<BlogMain | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getBlogMain(username)
      .then(setBlog)
      .catch((e: Error) => {
        if (e.message === "User not found") setNotFound(true);
        else setError(true);
      });
  }, [username]);

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p className={styles.errorCode}>500</p>
        <p className={styles.errorMsg}>오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.errorPage}>
        <p className={styles.errorCode}>404</p>
        <p className={styles.errorMsg}>존재하지 않는 블로그입니다.</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={styles.errorPage}>
        <p className={styles.errorMsg}>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>md-blog</span>
        </div>
      </header>

      <section className={styles.profile}>
        {blog.avatarUrl ? (
          <img
            className={styles.avatar}
            src={blog.avatarUrl}
            alt={blog.username}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {blog.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{blog.username}</h1>
          {blog.name && <p className={styles.displayName}>{blog.name}</p>}
        </div>
      </section>

      <section className={styles.reposSection}>
        <h2 className={styles.sectionTitle}>Projects</h2>
        {blog.repos.length === 0 ? (
          <p className={styles.empty}>공개된 프로젝트가 없습니다.</p>
        ) : (
          <div className={styles.reposGrid}>
            {blog.repos.map((repo) => (
              <RepoCard key={repo.githubRepoId} repo={repo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
