import { Skeleton } from '@/components/ui/Skeleton';

export function LoadingScreen() {
  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
