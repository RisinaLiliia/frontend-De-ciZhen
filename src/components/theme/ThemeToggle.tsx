// src/components/theme/ThemeToggle.tsx
"use client";

export function ThemeToggle() {
  const toggle = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-2 rounded-md border border-border"
    >
      Theme
    </button>
  );
}
