import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLogsToday } from '../../services/logService';

export const fetchLogsToday = createAsyncThunk(
  'log/fetchLogsToday',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getLogsToday();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch logs today');
    }
  }
);

const initialState = {
  logs: [],
  todayData: null,
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogsToday.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLogsToday.fulfilled, (state, action) => {
        state.loading = false;
        state.todayData = action.payload;
        if (action.payload?.logs) {
          state.logs = action.payload.logs;
        }
      })
      .addCase(fetchLogsToday.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setLogs, setLoading } = logSlice.actions;
export default logSlice.reducer;
