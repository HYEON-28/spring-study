import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import styles from "./LearningSum.module.css";
import {
  getConnectedRepos,
  getTodayUpdates,
  summarizeToday,
  type TodayUpdateRepo,
} from "../api/repoApi";
import { useAuth } from "../context/AuthContext";

const DEFAULT_PROMPT =
  "아래는 오늘 내가 작업한 GitHub 레포지토리의 변경 내역입니다.\n" +
  "이를 바탕으로 오늘 내가 학습하거나 작업한 내용을 한국어로 요약해주세요.\n" +
  "핵심 개념, 구현한 기능, 해결한 문제 등을 중심으로 작성해주세요.";

function LearningSum() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [todayUpdates, setTodayUpdates] = useState<TodayUpdateRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getConnectedRepos(token),
      getTodayUpdates(token),
    ])
      .then(([, updates]) => {
        setTodayUpdates(updates);
        setSelected(new Set(updates.map((u) => u.repoFullName)));
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
    try {
      const result = await summarizeToday(token, Array.from(selected), prompt);
      setSummary(result.summary);
    } catch {
      setError("요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSummarizing(false);
    }
  };

  const updatedFullNames = new Set(todayUpdates.map((u) => u.repoFullName));

  return (
    <>
      <Nav />
      <main className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate("/main")}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z" />
            </svg>
            메인으로
          </button>
          <div className={styles.title}>오늘 학습 요약</div>
          <div className={styles.subtitle}>오늘 작업한 레포지토리를 선택하고 AI로 학습 내용을 요약합니다.</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>요약할 레포지토리 선택</div>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              불러오는 중...
            </div>
          ) : todayUpdates.length === 0 ? (
            <div className={styles.errorText}>오늘 업데이트된 레포지토리가 없습니다.</div>
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
                        {u.files.length}개 파일 변경
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>요약 프롬프트 (수정 가능)</div>
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
                요약 중...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 1.75A.75.75 0 01.75 1h4.253c1.227 0 2.317.59 3 1.501A3.744 3.744 0 0111.006 1h4.245a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-4.507a2.25 2.25 0 00-1.591.659l-.622.621a.75.75 0 01-1.06 0l-.622-.621A2.25 2.25 0 005.258 13H.75a.75.75 0 01-.75-.75zm7.251 10.324l.004-5.073-.002-2.253A2.25 2.25 0 005.003 2.5H1.5v9h3.757a3.75 3.75 0 012 .756zM8.755 4.75l-.004 7.322a3.752 3.752 0 012-.572H14.5v-9h-3.495a2.25 2.25 0 00-2.25 2.25z" />
                </svg>
                요약하기
              </>
            )}
          </button>
          {selected.size === 0 && !loading && (
            <span className={styles.submitHint}>레포지토리를 하나 이상 선택해주세요.</span>
          )}
        </div>

        {error && <div className={styles.errorText}>{error}</div>}

        {summary && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <span className={styles.resultTitle}>AI 요약 결과</span>
              <span className={styles.resultBadge}>Claude</span>
            </div>
            <div className={styles.resultBody}>{summary}</div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default LearningSum;
