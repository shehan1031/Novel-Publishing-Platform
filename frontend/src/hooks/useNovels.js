import { useContext } from "react";
import { NovelContext } from "../context/NovelContext";

const useNovels = () => {
  return useContext(NovelContext);
};

export default useNovels; // default export, use default import
