import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthCallback from "./pages/AuthCallback";
import GitLink from "./pages/GitLink";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Main from "./pages/Main";

function App() {
  const { isLoggedIn, isLoading } = useAuth();
  const isGitLinked = false;

  if (isLoading) {
    return null;
  }

  const getRootElement = () => {
    if (!isLoggedIn) return <Landing />;
    if (!isGitLinked) return <Navigate to="/gitlink" replace />;
    return <Navigate to="/main" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={getRootElement()} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/gitlink" element={<GitLink />} />
      <Route path="/main" element={<Main />} />
    </Routes>
  );
}

export default App;
