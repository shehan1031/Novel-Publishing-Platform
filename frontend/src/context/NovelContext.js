import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import API from "../services/api";

export const NovelContext = createContext();

export const NovelProvider = ({ children }) => {
  /* removed unused `user` from destructuring */
  useContext(AuthContext);

  const [novels,  setNovels]  = useState([]);
  const [loading, setLoading] = useState(false);

  /* Public novels — published only, no auth needed */
  const fetchNovels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/novels");
      setNovels(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("fetchNovels failed:", err.message);
      setNovels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* Author's own novels — all statuses, auth required */
  const fetchAuthorNovels = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    setLoading(true);
    try {
      const res = await API.get("/author/novels");
      setNovels(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("fetchAuthorNovels failed:", err.message);
      setNovels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNovel = useCallback(async (formData) => {
    if (!localStorage.getItem("token")) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const res = await API.post("/novels", formData);
      setNovels(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error("createNovel failed:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* On mount: always load public novels only */
  useEffect(() => {
    fetchNovels();
  }, [fetchNovels]);

  return (
    <NovelContext.Provider value={{
      novels,
      loading,
      fetchNovels,
      fetchAuthorNovels,
      createNovel,
      setNovels,
    }}>
      {children}
    </NovelContext.Provider>
  );
};

export const useNovels = () => useContext(NovelContext);
export default useNovels;