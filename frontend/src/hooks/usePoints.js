import { useContext } from "react";
import { PointsContext } from "../context/PointsContext";

const usePoints = () => {
  return useContext(PointsContext);
};

export default usePoints;
