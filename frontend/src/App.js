import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ===== PUBLIC PAGES =====
import Home       from "./pages/Home";
import Login      from "./pages/Login";
import Signup     from "./pages/Signup";
import Browse     from "./pages/Browse";
import NovelDetail from "./pages/NovelDetail";
import NovelReader from "./pages/NovelReader";

// ===== DASHBOARDS =====
import ReaderDashboard from "./pages/ReaderDashboard";
import AuthorDashboard from "./pages/AuthorDashboard";
import AdminDashboard  from "./pages/AdminDashboard";

// ===== AUTHOR PAGES =====
import NovelEditor     from "./pages/NovelEditor";
import ChapterEditor   from "./pages/ChapterEditor";
import AuthorAnalytics from "./pages/AuthorAnalytics";

// ===== COIN SHOP ===== ✅ ADD THIS
import CoinShop from "./pages/CoinShop";

// ===== AUTH / CONTEXT =====
import ProtectedRoute      from "./components/ProtectedRoute";
import { AuthContext }     from "./context/AuthContext";
import { LanguageContext } from "./context/LanguageContext";

function App() {
  const { user }     = useContext(AuthContext);
  const { language } = useContext(LanguageContext);

  return (
    <div className={`app lang-${language}`}>
      <Navbar />

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/"        element={<Home />} />
        <Route path="/browse"  element={<Browse />} />
        <Route path="/novel/:novelId"                          element={<NovelDetail />} />
        <Route path="/novel/:novelId/chapter/:chapterId"       element={<NovelReader />} />

        <Route path="/login"  element={!user ? <Login />  : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />

        {/* ================= READER ================= */}
        <Route
          path="/reader/dashboard"
          element={
            <ProtectedRoute roles={["reader"]}>
              <ReaderDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ COIN SHOP — readers buy coins here */}
        <Route
          path="/coins"
          element={
            <ProtectedRoute roles={["reader"]}>
              <CoinShop />
            </ProtectedRoute>
          }
        />

        {/* ✅ COIN SUCCESS — PayHere redirects here after payment */}
        <Route
          path="/coins/success"
          element={
            <ProtectedRoute roles={["reader"]}>
              <CoinShop />
            </ProtectedRoute>
          }
        />

        {/* ================= AUTHOR ================= */}
        <Route
          path="/author/dashboard"
          element={
            <ProtectedRoute roles={["author"]}>
              <AuthorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/novel/create"
          element={
            <ProtectedRoute roles={["author"]}>
              <NovelEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/novel/:novelId/edit"
          element={
            <ProtectedRoute roles={["author"]}>
              <NovelEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/novel/:novelId/chapter/create"
          element={
            <ProtectedRoute roles={["author"]}>
              <ChapterEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/chapter/:chapterId"
          element={
            <ProtectedRoute roles={["author"]}>
              <ChapterEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/analytics"
          element={
            <ProtectedRoute roles={["author"]}>
              <AuthorAnalytics />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= CATCH-ALL ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
