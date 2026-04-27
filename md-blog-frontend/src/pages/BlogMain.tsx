import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlogMain, type BlogMain, type BlogRepo } from "../api/blogApi";
import BlogNav from "../components/BlogNav";
import MdFileTree from "../components/MdFileTree";
import { useLang } from "../context/LangContext";
import { useGoogleTranslate } from "../hooks/useGoogleTranslate";
import styles from "./BlogMain.module.css";

const MARKDOWN_COMPONENTS = {
  // 코드/코드블록은 자동 번역에서 제외
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre translate="no" className="notranslate" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code translate="no" className="notranslate" {...props} />
  ),
};

function ReadmePostView({ repo }: { repo: BlogRepo }) {
  return (
    <article className={styles.post}>
      <header className={styles.postHeader}>
        <h2 className={styles.postTitle}>
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.postTitleLink}
            translate="no"
          >
            {repo.name}
          </a>
        </h2>
      </header>
      <div className={styles.postBody}>
        {repo.readme ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
            {repo.readme}
          </ReactMarkdown>
        ) : (
          <p className={styles.noReadme}>README.md가 없습니다.</p>
        )}
      </div>
    </article>
  );
}

interface Props {
  username: string;
}

export default function BlogMain({ username }: Props) {
  const [blog, setBlog] = useState<BlogMain | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const { lang } = useLang();
  const { translateTo } = useGoogleTranslate();

  useEffect(() => {
    getBlogMain(username)
      .then(setBlog)
      .catch((e: Error) => {
        if (e.message === "User not found") setNotFound(true);
        else setError(true);
      });
  }, [username]);

  // README 로드 후 / 저장된 언어 변경 시 번역 적용
  useEffect(() => {
    if (!blog) return;
    translateTo(lang);
  }, [blog, lang, translateTo]);

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
      <BlogNav onLangChange={translateTo} />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <MdFileTree />
        </aside>

        <main className={styles.content}>
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
              <h1 className={styles.username} translate="no">
                {blog.username}
              </h1>
              {blog.name && (
                <p className={styles.displayName} translate="no">
                  {blog.name}
                </p>
              )}
            </div>
          </section>

          <section className={styles.postsSection}>
            {blog.repos.length === 0 ? (
              <p className={styles.empty}>공개된 프로젝트가 없습니다.</p>
            ) : (
              <div className={styles.postsList}>
                {blog.repos.map((repo) => (
                  <ReadmePostView key={repo.githubRepoId} repo={repo} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
