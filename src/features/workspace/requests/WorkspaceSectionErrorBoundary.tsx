'use client';

import * as React from 'react';

type WorkspaceSectionErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
  logLabel?: string;
};

type WorkspaceSectionErrorBoundaryState = {
  hasError: boolean;
};

export class WorkspaceSectionErrorBoundary extends React.Component<
  WorkspaceSectionErrorBoundaryProps,
  WorkspaceSectionErrorBoundaryState
> {
  state: WorkspaceSectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (this.props.logLabel) {
      console.error(`${this.props.logLabel}:`, error);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
