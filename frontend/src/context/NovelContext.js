import { createContext, useContext, useEffect, useState } from "react";
import {
  getAllNovels,
  getAuthorNovels,
  getNovelById,
  createNovel
} from "../services/novelService";

export const NovelContext = createContext();

export const NovelProvider = ({ children }) => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ THIS FIXES "fetchNovels is not a function"
  const fetchNovels = async () => {
    setLoading(true);
    try {
      const data = await getAllNovels();
      setNovels(data);
    } catch (err) {
      console.error("Failed to fetch novels", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorNovels = async () => {
    setLoading(true);
    try {
      const data = await getAuthorNovels();
      setNovels(data);
    } catch (err) {
      console.error("Failed to fetch author novels", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  return (
    <NovelContext.Provider
      value={{
        novels,
        loading,
        fetchNovels,
        fetchAuthorNovels,
        getNovelById,
        createNovel,
        setNovels
      }}
    >
      {children}
    </NovelContext.Provider>
  );
};

// optional helper hook
export const useNovels = () => useContext(NovelContext);
