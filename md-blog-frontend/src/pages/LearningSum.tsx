import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import styles from "./LearningSum.module.css";
import {
  getConnectedRepos,
  getTodayUpdates,
  summarizeToday,
  getSummaryPrompt,
  type TodayUpdateRepo,
} from "../api/repoApi";
import { getTwitterAuthUrl, postTweet } from "../api/twitterApi";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { LEARNINGSUM_I18N } from "../i18n/learningsum";

function LearningSum() {
  const { token, user, refreshUser } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = LEARNINGSUM_I18N[lang];

  const [todayUpdates, setTodayUpdates] = useState<TodayUpdateRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [prompt, setPrompt] = useState(t.default_prompt);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [posting, setPosting] = useState(false);
  const [tweetStatus, setTweetStatus] = useState<"success" | "error" | "linked" | "reconnect" | null>(null);

  const prevDefaultPromptRef = useRef(t.default_prompt);

  // Twitter OAuth 콜백 처리
  useEffect(() => {
    const linked = searchParams.get("twitterLinked");
    const twitterError = searchParams.get("twitterError");
    if (linked === "true") {
      refreshUser().then(() => setTweetStatus("linked"));
      setSearchParams({}, { replace: true });
    } else if (twitterError === "true") {
      setTweetStatus("error");
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    const newDefault = LEARNINGSUM_I18N[lang].default_prompt;
    setPrompt((prev) => {
      if (prev === prevDefaultPromptRef.current) return newDefault;
      return prev;
    });
    prevDefaultPromptRef.current = newDefault;
  }, [lang]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getConnectedRepos(token),
      getTodayUpdates(token),
      getSummaryPrompt(token),
    ])
      .then(([, updates, promptResult]) => {
        setTodayUpdates(updates);
        setSelected(new Set(updates.map((u) => u.repoFullName)));
        if (promptResult.customPrompt) {
          setPrompt(promptResult.customPrompt);
          prevDefaultPromptRef.current = promptResult.customPrompt;
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const toggleRepo = (fullName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) {
        next.delete(fullName);
      } else {
        next.add(fullName);
      }
      return next;
    });
  };

  const handleSummarize = async () => {
    if (!token || selected.size === 0) return;
    setSummarizing(true);
    setSummary(null);
    setError(null);
    setTweetStatus(null);
    try {
      const result = await summarizeToday(token, Array.from(selected), prompt);
      setSummary(result.summary);
    } catch {
      setError(t.error);
    } finally {
      setSummarizing(false);
    }
  };

  const handlePostToX = async () => {
    if (!token || !summary) return;

    if (!user?.twitterConnected) {
      const authUrl = await getTwitterAuthUrl(token).catch(() => null);
      if (authUrl) window.location.href = authUrl;
      return;
    }

    setPosting(true);
    setTweetStatus(null);
    try {
      await postTweet(token, summary);
      setTweetStatus("success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "TWITTER_RECONNECT_REQUIRED") {
        await refreshUser();
        setTweetStatus("reconnect");
      } else {
        setTweetStatus("error");
      }
    } finally {
      setPosting(false);
    }
  };

  const updatedFullNames = new Set(todayUpdates.map((u) => u.repoFullName));
  const charCount = summary?.length ?? 0;
  const overLimit = charCount > 280;

  return (
    <>
      <Nav />
      <main className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate("/main")}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z" />
            </svg>
            {t.back_btn}
          </button>
          <div className={styles.title}>{t.title}</div>
          <div className={styles.subtitle}>{t.subtitle}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>{t.card_repo_title}</div>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              {t.loading}
            </div>
          ) : todayUpdates.length === 0 ? (
            <div className={styles.errorText}>{t.empty_updates}</div>
          ) : (
            <div className={styles.repoList}>
              {todayUpdates.map((u) => {
                const isSelected = selected.has(u.repoFullName);
                return (
                  <div
                    key={u.repoFullName}
                    className={`${styles.repoItem} ${isSelected ? styles.repoItemSelected : ""}`}
                    onClick={() => toggleRepo(u.repoFullName)}
                  >
                    <div className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ""}`}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="#ffffff">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                      )}
                    </div>
                    <span className={styles.repoName}>{u.repoFullName}</span>
                    {updatedFullNames.has(u.repoFullName) && (
                      <span className={styles.repoUpdatedBadge}>
                        {u.files.length}{t.unit_file_changed}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>{t.card_prompt_title}</div>
          <textarea
            className={styles.promptTextarea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
          />
        </div>

        <div className={styles.submitRow}>
          <button
            className={styles.submitBtn}
            onClick={handleSummarize}
            disabled={summarizing || selected.size === 0 || loading}
          >
            {summarizing ? (
              <>
                <div className={styles.spinner} />
                {t.btn_summarizing}
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 1.75A.75.75 0 01.75 1h4.253c1.227 0 2.317.59 3 1.501A3.744 3.744 0 0111.006 1h4.245a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-4.507a2.25 2.25 0 00-1.591.659l-.622.621a.75.75 0 01-1.06 0l-.622-.621A2.25 2.25 0 005.258 13H.75a.75.75 0 01-.75-.75zm7.251 10.324l.004-5.073-.002-2.253A2.25 2.25 0 005.003 2.5H1.5v9h3.757a3.75 3.75 0 012 .756zM8.755 4.75l-.004 7.322a3.752 3.752 0 012-.572H14.5v-9h-3.495a2.25 2.25 0 00-2.25 2.25z" />
                </svg>
                {t.btn_summarize}
              </>
            )}
          </button>
          {selected.size === 0 && !loading && (
            <span className={styles.submitHint}>{t.submit_hint}</span>
          )}
        </div>

        {error && <div className={styles.errorText}>{error}</div>}

        {summary !== null && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <span className={styles.resultTitle}>{t.result_title}</span>
              <span className={styles.resultBadge}>{t.result_badge}</span>
              <span className={`${styles.charCount} ${overLimit ? styles.charCountOver : ""}`}>
                {t.char_count(charCount)}
              </span>
            </div>
            <textarea
              className={styles.resultTextarea}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={6}
            />
            <div className={styles.resultFooter}>
              {tweetStatus === "success" && (
                <span className={styles.tweetSuccess}>{t.twitter_success}</span>
              )}
              {tweetStatus === "linked" && (
                <span className={styles.tweetSuccess}>{t.twitter_linked}</span>
              )}
              {tweetStatus === "error" && (
                <span className={styles.tweetError}>{t.twitter_error}</span>
              )}
              {tweetStatus === "reconnect" && (
                <span className={styles.tweetError}>{t.twitter_reconnect}</span>
              )}
              <button
                className={styles.xBtn}
                onClick={handlePostToX}
                disabled={posting || !summary}
              >
                {posting ? (
                  <>
                    <div className={styles.spinnerDark} />
                    {t.btn_posting_x}
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className={styles.xIcon} aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    {user?.twitterConnected ? t.btn_post_x : t.btn_connect_x}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default LearningSum;
