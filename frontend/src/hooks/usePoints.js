// src/hooks/usePoints.js
import { useContext } from "react";
import { PointsContext } from "../context/PointsContext";

const usePoints = () => useContext(PointsContext);

export default usePoints;
