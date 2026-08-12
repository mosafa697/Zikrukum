import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FavouriteCategoriesState = {
  ids: number[];
};

const initialState: FavouriteCategoriesState = {
  ids: [],
};

const favouriteCategoriesSlice = createSlice({
  name: 'favouriteCategories',
  initialState,
  reducers: {
    toggleFavouriteCategory: (state, action: PayloadAction<number>) => {
      const categoryId = action.payload;
      const existingIndex = state.ids.indexOf(categoryId);

      if (existingIndex >= 0) {
        state.ids.splice(existingIndex, 1);
        return;
      }

      state.ids.push(categoryId);
    },
    setFavouriteCategories: (state, action: PayloadAction<number[]>) => {
      state.ids = action.payload;
    },
  },
});

export const { toggleFavouriteCategory, setFavouriteCategories } = favouriteCategoriesSlice.actions;
export default favouriteCategoriesSlice.reducer;
