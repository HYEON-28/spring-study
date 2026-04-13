import "./App.css";
import GitLink from "./pages/GitLink";
import Landing from "./pages/Landing";
import Main from "./pages/Main";

function App() {
  const isLoggedIn = true;
  const isGitLinked = false;

  if (!isLoggedIn) {
    return <Landing />;
  }

  if (!isGitLinked) {
    return <GitLink />;
  }

  return <Main />;
}

export default App;
