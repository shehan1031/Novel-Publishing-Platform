import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext }     from "./context/AuthContext";
import { LanguageContext } from "./context/LanguageContext";

import Navbar       from "./components/Navbar";
import Footer       from "./components/Footer";
import SkipLink     from "./components/SkipLink";
import useAnnouncer from "./hooks/useAnnouncer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home            from "./pages/Home";
import Login           from "./pages/Login";
import Signup          from "./pages/Signup";
import Browse          from "./pages/Browse";
import NovelDetail     from "./pages/NovelDetail";
import NovelReader     from "./pages/NovelReader";
import ReaderDashboard from "./pages/ReaderDashboard";
import AuthorDashboard from "./pages/AuthorDashboard";
import AdminDashboard  from "./pages/AdminDashboard";
import NovelEditor     from "./pages/NovelEditor";
import ChapterEditor   from "./pages/ChapterEditor";
import AuthorAnalytics from "./pages/AuthorAnalytics";
import CoinShop        from "./pages/CoinShop";

import "./styles/accessibility.css";

function App() {
  const { user }     = useContext(AuthContext);
  const { language } = useContext(LanguageContext);

  useAnnouncer();

  return (
    <div className={`app lang-${language}`}>

      <SkipLink />

      <Navbar />

      <main id="main-content" tabIndex={-1}>
        <Routes>
          {/* ── public ── */}
          <Route path="/"       element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/novel/:novelId"
            element={<NovelDetail />} />
          <Route path="/novel/:novelId/chapter/:chapterId"
            element={<NovelReader />} />
          <Route path="/login"
            element={!user ? <Login />  : <Navigate to="/" replace />} />
          <Route path="/signup"
            element={!user ? <Signup /> : <Navigate to="/" replace />} />

          {/* ── reader ── */}
          <Route path="/reader/dashboard"
            element={
              <ProtectedRoute roles={["reader"]}>
                <ReaderDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/coins"
            element={
              <ProtectedRoute roles={["reader"]}>
                <CoinShop />
              </ProtectedRoute>
            }
          />
          <Route path="/coins/success"
            element={
              <ProtectedRoute roles={["reader"]}>
                <CoinShop />
              </ProtectedRoute>
            }
          />

          {/* ── author ── */}
          <Route path="/author/dashboard"
            element={
              <ProtectedRoute roles={["author"]}>
                <AuthorDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/author/novel/create"
            element={
              <ProtectedRoute roles={["author"]}>
                <NovelEditor />
              </ProtectedRoute>
            }
          />
          <Route path="/author/novel/:novelId/edit"
            element={
              <ProtectedRoute roles={["author"]}>
                <NovelEditor />
              </ProtectedRoute>
            }
          />
          <Route path="/author/novel/:novelId/chapter/create"
            element={
              <ProtectedRoute roles={["author"]}>
                <ChapterEditor />
              </ProtectedRoute>
            }
          />
          <Route path="/author/chapter/:chapterId"
            element={
              <ProtectedRoute roles={["author"]}>
                <ChapterEditor />
              </ProtectedRoute>
            }
          />
          <Route path="/author/analytics"
            element={
              <ProtectedRoute roles={["author"]}>
                <AuthorAnalytics />
              </ProtectedRoute>
            }
          />

          {/* ── admin ── */}
          <Route path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;