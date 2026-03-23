'use client';

import * as React from 'react';

import { RequestsFilterControlsContent } from '@/components/requests/RequestsFilterControlsContent';

type RequestsFilterControlsBodyProps = React.ComponentProps<typeof RequestsFilterControlsContent> & {
  id?: string;
  className?: string;
};

export function RequestsFilterControlsBody({
  id,
  className,
  ...contentProps
}: RequestsFilterControlsBodyProps) {
  return (
    <div id={id} className={className}>
      <RequestsFilterControlsContent {...contentProps} />
    </div>
  );
}
