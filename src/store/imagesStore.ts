import type { ImageAsset } from '../types/image';

export interface ImagesState {
  images: ImageAsset[];
}

export type ImagesAction =
  | { type: 'images/addOrUpdate'; payload: ImageAsset }
  | { type: 'images/setAll'; payload: ImageAsset[] };

export const initialImagesState: ImagesState = {
  images: [],
};

export function imagesReducer(
  state: ImagesState,
  action: ImagesAction,
): ImagesState {
  switch (action.type) {
    case 'images/addOrUpdate': {
      const existingIndex = state.images.findIndex(
        (img) => img.id === action.payload.id,
      );
      if (existingIndex === -1) {
        return { ...state, images: [...state.images, action.payload] };
      }
      const next = [...state.images];
      next[existingIndex] = action.payload;
      return { ...state, images: next };
    }
    case 'images/setAll':
      return { ...state, images: action.payload };
    default:
      return state;
  }
}


