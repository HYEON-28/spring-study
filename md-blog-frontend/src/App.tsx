import { Navigate, Routes, Route } from "react-router-dom";
import GitLink from "./pages/GitLink";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Main from "./pages/Main";

function App() {
  const isLoggedIn = false;
  const isGitLinked = false;

  const getRootElement = () => {
    if (!isLoggedIn) return <Landing />;
    if (!isGitLinked) return <Navigate to="/gitlink" replace />;
    return <Navigate to="/main" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={getRootElement()} />
      <Route path="/login" element={<Login />} />
      <Route path="/gitlink" element={<GitLink />} />
      <Route path="/main" element={<Main />} />
    </Routes>
  );
}

export default App;
