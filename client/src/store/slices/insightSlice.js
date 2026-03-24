import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getInsight, getWeeklyInsight } from '../../services/insightService';

export const fetchInsight = createAsyncThunk(
  'insight/fetchInsight',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getInsight();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch insight');
    }
  }
);

export const fetchWeeklyInsight = createAsyncThunk(
  'insight/fetchWeeklyInsight',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getWeeklyInsight();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch weekly insight');
    }
  }
);

const initialState = {
  insights: null,
  dailyInsight: null,
  weeklyInsights: [],
  weeklyMeta: null,
  loading: false,
  weeklyLoading: false,
};

const insightSlice = createSlice({
  name: 'insight',
  initialState,
  reducers: {
    setInsights: (state, action) => {
      state.insights = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsight.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInsight.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyInsight = action.payload;
      })
      .addCase(fetchInsight.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchWeeklyInsight.pending, (state) => {
        state.weeklyLoading = true;
      })
      .addCase(fetchWeeklyInsight.fulfilled, (state, action) => {
        state.weeklyLoading = false;
        state.weeklyInsights = action.payload.data || [];
        state.weeklyMeta = action.payload.meta;
      })
      .addCase(fetchWeeklyInsight.rejected, (state) => {
        state.weeklyLoading = false;
      });
  },
});

export const { setInsights } = insightSlice.actions;
export default insightSlice.reducer;
