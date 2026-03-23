'use client';

import * as React from 'react';

export function useWorkspaceProfileOnboardingAvatar() {
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(
    () => () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    },
    [avatarPreviewUrl],
  );

  const onAvatarSelected = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const openAvatarPicker = React.useCallback(() => {
    avatarInputRef.current?.click();
  }, []);

  const onAvatarClear = React.useCallback(() => {
    setAvatarFile(null);
    setAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  return {
    avatarFile,
    avatarPreviewUrl,
    avatarInputRef,
    onAvatarSelected,
    openAvatarPicker,
    onAvatarClear,
  };
}
