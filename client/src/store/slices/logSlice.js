import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [],
  loading: false,
};

const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    setLogs: (state, action) => {
      state.logs = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setLogs, setLoading } = logSlice.actions;
export default logSlice.reducer;
