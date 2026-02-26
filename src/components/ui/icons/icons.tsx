// src/components/ui/icons/icons.tsx
export function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M16.2 16.2 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 8h16" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function IconChevronDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 13.2v-2.4l2.2-.8.4-1.2-1.2-1.9 1.7-1.7 1.9 1.2 1.2-.4.8-2.2h2.4l.8 2.2 1.2.4 1.9-1.2 1.7 1.7-1.2 1.9.4 1.2 2.2.8v2.4l-2.2.8-.4 1.2 1.2 1.9-1.7 1.7-1.9-1.2-1.2.4-.8 2.2h-2.4l-.8-2.2-1.2-.4-1.9 1.2-1.7-1.7 1.2-1.9-.4-1.2-2.2-.8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconFilter() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="15" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 3 10 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m21 3-7 18-4-7-7-4 18-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUser({ className }: { className?: string } = {}) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 20a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLogin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconUserPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M4 20a8 8 0 0 1 12-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 14v6M15 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17 4.9 19.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconHeart({ className }: { className?: string } = {}) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20.8 6.6a4.5 4.5 0 0 0-6.4 0L12 9l-2.4-2.4a4.5 4.5 0 0 0-6.4 6.4L12 21l8.8-8.8a4.5 4.5 0 0 0 0-6.4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBrandGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.6 12.23c0-.74-.07-1.45-.2-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.34 2.98-7.42Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.63-2.35l-3.24-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.6-4.12H3.05v2.58A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.4 13.99a6 6 0 0 1 0-3.98V7.43H3.05a10 10 0 0 0 0 9.14l3.35-2.58Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.89c1.47 0 2.8.5 3.84 1.48l2.87-2.87A9.98 9.98 0 0 0 12 2a10 10 0 0 0-8.95 5.43L6.4 10c.8-2.36 3-4.11 5.6-4.11Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function IconBrandApple() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.7 3.1c-.8.1-1.8.6-2.4 1.3-.6.7-1.1 1.7-.9 2.7.9.1 1.8-.4 2.4-1.1.6-.7 1.1-1.7.9-2.9Z" />
      <path d="M18.7 12.7c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-1.9-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.3.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.2 3.2-2.4 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.4Z" />
    </svg>
  );
}

export function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h4l10.5-10.5a1.8 1.8 0 0 0 0-2.6l-1.4-1.4a1.8 1.8 0 0 0-2.6 0L4 16v4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m12.5 7.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M7 7h10l-1 13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2L7 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 4h6l1 3H8l1-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
