import { configureStore } from "@reduxjs/toolkit";
import shapeReducer from "../features/shapesSlice";

export default configureStore({
  reducer: {
    shapes: shapeReducer,
  },
});
