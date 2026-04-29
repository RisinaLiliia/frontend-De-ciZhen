import { Card, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

type HomePanelPlaceholderProps = {
  className?: string;
  minHeight?: number;
  bodyRows?: number;
};

export function HomePanelPlaceholder({
  className,
  minHeight = 280,
  bodyRows = 4,
}: HomePanelPlaceholderProps) {
  return (
    <Card className={className} style={{ minHeight }}>
      <CardHeader className="home-panel-header">
        <div className="home-panel-heading">
          <div className="home-panel-title">
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
      </CardHeader>
      <div className="mt-3 grid gap-3">
        {Array.from({ length: bodyRows }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    </Card>
  );
}
