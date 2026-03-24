import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getGoal } from '../../services/goalService';

export const fetchUserGoal = createAsyncThunk(
  'user/fetchUserGoal',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getGoal();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch goal');
    }
  }
);

const initialState = {
  profile: null,
  userGoal: null,
  goalLoading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserGoal.pending, (state) => {
        state.goalLoading = true;
      })
      .addCase(fetchUserGoal.fulfilled, (state, action) => {
        state.goalLoading = false;
        state.userGoal = action.payload;
      })
      .addCase(fetchUserGoal.rejected, (state) => {
        state.goalLoading = false;
      });
  },
});

export const { setProfile } = userSlice.actions;
export default userSlice.reducer;
