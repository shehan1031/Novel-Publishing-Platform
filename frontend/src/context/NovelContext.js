import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import {
  getAllNovels,
  getAuthorNovels,
  createNovel as createNovelService,
} from "../services/novelService";

export const NovelContext = createContext();

export const NovelProvider = ({ children }) => {
  const { token } = useContext(AuthContext); // ✅ get token from AuthContext
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all public novels
  const fetchNovels = async () => {
    setLoading(true);
    try {
      const data = await getAllNovels();
      setNovels(data);
    } catch (err) {
      console.error("Failed to fetch public novels:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch novels for the logged-in author
  const fetchAuthorNovels = async () => {
    if (!token) {
      console.warn("No token found. Skipping author novels fetch.");
      return;
    }
    setLoading(true);
    try {
      const data = await getAuthorNovels(token);
      setNovels(data);
    } catch (err) {
      console.error("Failed to fetch author novels:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new novel for the logged-in author
  const createNovel = async (formData) => {
    if (!token) {
      console.error("No token found. Cannot create novel.");
      throw new Error("Not authenticated");
    }
    setLoading(true);
    try {
      const created = await createNovelService(formData, token);
      // Prepend newly created novel to the list
      setNovels((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error("Failed to create novel:", err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch public novels on mount
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
        createNovel,
        setNovels,
      }}
    >
      {children}
    </NovelContext.Provider>
  );
};

// Optional helper hook
export const useNovels = () => useContext(NovelContext);
