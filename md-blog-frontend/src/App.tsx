import { Navigate, Routes, Route, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthCallback from "./pages/AuthCallback";
import RepoLink from "./pages/RepoLink";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Main from "./pages/Main";
import RepoSettings from "./pages/RepoSettings";
import BlogSettings from "./pages/BlogSettings";
import FileUpdated from "./pages/FileUpdated";
import BlogMain from "./pages/BlogMain";
import LearningSum from "./pages/LearningSum";

function BlogMainRoute() {
  const { username } = useParams<{ username: string }>();
  if (!username) return null;
  return <BlogMain username={username} />;
}

function getBlogUsername(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  const tld = parts[parts.length - 1];

  // dev: hyeon28.localhost
  if (tld === "localhost" && parts.length >= 2) {
    return parts[0];
  }

  // prod: hyeon28.md-blog.org
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0];
  }

  return null;
}

function App() {
  const { isLoggedIn, isLoading } = useAuth();

  const blogUsername = getBlogUsername();
  if (blogUsername) {
    return <BlogMain username={blogUsername} />;
  }

  // /blog/:username 경로도 auth 로딩 없이 즉시 렌더링
  const blogPathMatch = window.location.pathname.match(/^\/blog\/([^/]+)/);
  if (blogPathMatch) {
    return <BlogMain username={blogPathMatch[1]} />;
  }

  if (isLoading) {
    return null;
  }

  const getRootElement = () => {
    if (!isLoggedIn) return <Landing />;
    return <Navigate to="/main" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={getRootElement()} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/repolink" element={<RepoLink />} />
      <Route path="/main" element={<Main />} />
      <Route path="/repoSettings" element={<RepoSettings />} />
      <Route path="/blogSettings" element={<BlogSettings />} />
      <Route path="/file-updated" element={<FileUpdated />} />
      <Route path="/learning-summary" element={<LearningSum />} />
      <Route path="/blog/:username" element={<BlogMainRoute />} />
    </Routes>
  );
}

export default App;
