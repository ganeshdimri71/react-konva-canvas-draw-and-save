import { createSlice } from "@reduxjs/toolkit";

export const shapesSlice = createSlice({
  name: "shapes",
  initialState: {
    // cursorPoint: { x: 0, y: 0 },
    nodes: [],
    // history: [],
    // lines: [],
    // tempLineHistory: [],
    // tempLine: [],
  },
  reducers: {
    // updateCursorPoint: (state, action) => {
    //   state.cursorPoint = action.payload;
    // },
    updateNodes: (state, action) => {
      state.nodes = action.payload;
    },
    // updateHistory: (state, action) => {
    //   state.history = action.payload;
    // },
    // updateLines: (state, action) => {
    //   state.lines = action.payload;
    // },
    // updateTempLineHistory: (state, action) => {
    //   state.tempLineHistory = action.payload;
    // },
    // updateTempLine: (state, action) => {
    //   state.tempLine = action.payload;
    // },
  },
});

export const {
  // updateCursorPoint,
  updateNodes,
  // updateHistory,
  // updateLines,
  // updateTempLineHistory,
  // updateTempLine,
} = shapesSlice.actions;

// export const getCursorPoint = (state) => state.shapes.cursorPoint;
export const getNodes = (state) => state.shapes.nodes;
// export const getHistory = (state) => state.shapes.history;
// export const getLines = (state) => state.shapes.lines;
// export const getTempLineHistory = (state) => state.shapes.tempLineHistory;
// export const getTempLine = (state) => state.shapes.tempLine;

export default shapesSlice.reducer;
