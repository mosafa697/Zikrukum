import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type VolumeNavState = {
  enabled: boolean;
};

const initialState: VolumeNavState = {
  enabled: true,
};

const volumeNavSlice = createSlice({
  name: 'volumeNav',
  initialState,
  reducers: {
    toggleVolumeNav(state) {
      state.enabled = !state.enabled;
    },
    setVolumeNav(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },
  },
});

export const { toggleVolumeNav, setVolumeNav } = volumeNavSlice.actions;
export default volumeNavSlice.reducer;
