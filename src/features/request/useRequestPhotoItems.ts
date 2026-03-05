import * as React from 'react';
import { toast } from 'sonner';

export type RequestPhotoItem = {
  file: File;
  previewUrl: string;
};

type UseRequestPhotoItemsParams = {
  photosErrorMessage: string;
  photosLimitMessage: string;
  maxPhotos?: number;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);

async function isValidImageDimensions(file: File): Promise<boolean> {
  const url = URL.createObjectURL(file);
  const img = new window.Image();
  const loaded = await new Promise<boolean>((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
  const isValid = loaded && img.width >= 300 && img.height >= 300;
  URL.revokeObjectURL(url);
  return isValid;
}

export function useRequestPhotoItems({
  photosErrorMessage,
  photosLimitMessage,
  maxPhotos = 8,
}: UseRequestPhotoItemsParams) {
  const [photoItems, setPhotoItems] = React.useState<RequestPhotoItem[]>([]);

  const validateImage = React.useCallback(
    async (file: File) => {
      if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
        toast.error(photosErrorMessage);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(photosErrorMessage);
        return false;
      }
      const hasValidDimensions = await isValidImageDimensions(file);
      if (!hasValidDimensions) {
        toast.error(photosErrorMessage);
        return false;
      }
      return true;
    },
    [photosErrorMessage],
  );

  const onFilesSelected = React.useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const incoming = Array.from(files);
      const availableSlots = maxPhotos - photoItems.length;
      if (availableSlots <= 0) {
        toast.message(photosLimitMessage);
        return;
      }

      const nextFiles = incoming.slice(0, availableSlots);
      const validated: RequestPhotoItem[] = [];
      for (const file of nextFiles) {
        const ok = await validateImage(file);
        if (!ok) continue;
        validated.push({ file, previewUrl: URL.createObjectURL(file) });
      }
      if (validated.length > 0) {
        setPhotoItems((prev) => [...prev, ...validated]);
      }
    },
    [maxPhotos, photoItems.length, photosLimitMessage, validateImage],
  );

  const removePhotoAt = React.useCallback((index: number) => {
    setPhotoItems((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  }, []);

  React.useEffect(
    () => () => {
      photoItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [photoItems],
  );

  return {
    photoItems,
    setPhotoItems,
    onFilesSelected,
    removePhotoAt,
  };
}

