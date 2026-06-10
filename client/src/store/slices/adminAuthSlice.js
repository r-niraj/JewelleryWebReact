import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const checkAdminAuth = createAsyncThunk('adminAuth/check', async () => {
  const res = await fetch('/api/admin/me', { credentials: 'include' });
  const data = await res.json();
  if (data.authenticated) return data.admin;
  return null;
});

export const loginAdmin = createAsyncThunk('adminAuth/login', async ({ email, password }, { rejectWithValue }) => {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!data.success) return rejectWithValue(data.error || 'Login failed');
  const me = await fetch('/api/admin/me', { credentials: 'include' }).then((r) => r.json());
  if (me.authenticated) return me.admin;
  return rejectWithValue('Failed to verify login');
});

export const logoutAdmin = createAsyncThunk('adminAuth/logout', async () => {
  await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
  return null;
});

const initialState = {
  admin: null,
  loading: true,
  error: null,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAdminAuth.pending, (state) => { state.loading = true; })
      .addCase(checkAdminAuth.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.loading = false;
      })
      .addCase(checkAdminAuth.rejected, (state) => {
        state.admin = null;
        state.loading = false;
      })
      .addCase(loginAdmin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.loading = false;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.loading = false;
      });
  },
});

export const selectAdmin = (state) => state.adminAuth.admin;
export const selectAdminLoading = (state) => state.adminAuth.loading;
export const selectAdminError = (state) => state.adminAuth.error;

export default adminAuthSlice.reducer;
