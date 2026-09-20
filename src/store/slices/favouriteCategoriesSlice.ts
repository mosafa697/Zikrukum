import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FavouriteCategoriesState = {
  ids: number[];
};

// Fresh-install defaults: morning (3), evening (4) and friday (21) adhkar
// pinned to the top. Users who toggle favourites persist their own list.
export const DEFAULT_FAVOURITE_CATEGORIES = [3, 4, 21];

const initialState: FavouriteCategoriesState = {
  ids: DEFAULT_FAVOURITE_CATEGORIES,
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
