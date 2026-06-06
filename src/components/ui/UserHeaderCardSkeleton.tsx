type UserHeaderCardSkeletonProps = {
  className?: string;
};

export function UserHeaderCardSkeleton({ className }: UserHeaderCardSkeletonProps) {
  return (
    <div className={`profile-card ${className ?? ''}`.trim()}>
      <div className="profile-avatar-wrap">
        <div className="skeleton is-wide h-12 w-12 rounded-full" />
      </div>
      <div className="profile-main">
        <div className="skeleton is-wide h-4 w-24" />
        <div className="skeleton is-wide h-3 w-20" />
        <div className="skeleton is-wide h-3 w-16" />
      </div>
    </div>
  );
}
