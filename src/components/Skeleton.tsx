import { cn } from '@/lib/utils';

/**
 * ─── Skeleton Loading Components ─────────────────────────────
 *
 * Pure CSS-based skeleton loading screens and elements.
 * Uses the existing `.shimmer` CSS class with a shimmer animation.
 * No external library required.
 *
 * Usage:
 *   <Skeleton width={200} height={20} />
 *   <SkeletonText lines={3} />
 *   <SkeletonCard />
 *   <SkeletonAvatar />
 *   <SkeletonMap />
 */

// ─── Base Skeleton Props ────────────────────────────────────

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

// ─── Base Skeleton Component ────────────────────────────────

export function Skeleton({ width, height, circle, className }: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: circle ? '50%' : undefined,
  };

  return (
    <div
      className={cn('shimmer', className)}
      style={style}
    />
  );
}

// ─── SkeletonText: Multiple lines of text ───────────────────

export interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  className?: string;
  lastLineWidth?: string; // Width of the last line (e.g., '60%')
}

export function SkeletonText({
  lines = 3,
  lineHeight = 14,
  className,
  lastLineWidth = '60%',
}: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={lineHeight}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          className="rounded-md"
        />
      ))}
    </div>
  );
}

// ─── SkeletonCard: Card-shaped placeholder ──────────────────

export interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export function SkeletonCard({ className, showImage = true, lines = 2 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-bg-surface border border-border rounded-xl p-4 space-y-3',
        className
      )}
    >
      {showImage && (
        <Skeleton height={120} className="rounded-lg w-full" />
      )}
      <Skeleton height={16} width="70%" className="rounded-md" />
      <SkeletonText lines={lines} lineHeight={12} lastLineWidth="40%" />
    </div>
  );
}

// ─── SkeletonAvatar: Circular avatar placeholder ────────────

export interface SkeletonAvatarProps {
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export function SkeletonAvatar({ size = 48, className, showLabel = false }: SkeletonAvatarProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Skeleton width={size} height={size} circle />
      {showLabel && (
        <Skeleton height={10} width={size * 0.7} className="rounded-md" />
      )}
    </div>
  );
}

// ─── SkeletonMap: Full-screen map loading placeholder ───────

export interface SkeletonMapProps {
  className?: string;
}

/**
 * Full-screen map skeleton that mimics a loading map.
 * Shows a grid pattern with a pulsing center marker
 * to indicate GPS/map is loading.
 */
export function SkeletonMap({ className }: SkeletonMapProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 w-full h-full bg-bg-body flex flex-col items-center justify-center',
        className
      )}
    >
      {/* Map grid background pattern */}
      <div className="absolute inset-0 opacity-20">
        {/* Horizontal grid lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-text-tertiary"
            style={{ top: `${(i + 1) * 12}%` }}
          />
        ))}
        {/* Vertical grid lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-text-tertiary"
            style={{ left: `${(i + 1) * 16}%` }}
          />
        ))}
      </div>

      {/* Center pulsing location marker */}
      <div className="relative flex flex-col items-center gap-4 z-10">
        {/* Pulse rings */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
          <div className="relative w-6 h-6 rounded-full bg-primary border-3 border-white shadow-glow" />
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton height={14} width={140} className="rounded-md" />
          <Skeleton height={10} width={100} className="rounded-md opacity-60" />
        </div>
      </div>

      {/* Bottom sheet skeleton peek */}
      <div className="absolute bottom-0 left-0 right-0 bg-bg-surface rounded-t-2xl border-t border-border p-4 pb-8 space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-10 h-1 rounded-full bg-text-tertiary/40" />
        </div>
        <Skeleton height={16} width="50%" className="rounded-md" />
        <div className="space-y-2 pt-1">
          <Skeleton height={56} className="rounded-xl w-full" />
          <Skeleton height={56} className="rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

// ─── SkeletonList: List of skeleton rows ────────────────────

export interface SkeletonListProps {
  count?: number;
  className?: string;
}

export function SkeletonList({ count = 3, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton width={40} height={40} circle />
          <div className="flex-1 space-y-2">
            <Skeleton height={14} width="60%" className="rounded-md" />
            <Skeleton height={10} width="40%" className="rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
