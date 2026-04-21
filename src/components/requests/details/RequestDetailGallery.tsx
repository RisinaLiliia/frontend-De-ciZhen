// src/components/requests/details/RequestDetailGallery.tsx
import Image from 'next/image';
import { normalizeAppImageSrc, shouldBypassNextImageOptimization } from '@/lib/requests/images';

type RequestDetailGalleryProps = {
  images: string[];
  title: string;
  surface?: 'default' | 'dialog';
};

export function RequestDetailGallery({ images, title, surface = 'default' }: RequestDetailGalleryProps) {
  const safeAlt = title?.trim() || 'Request image';

  if (surface === 'dialog') {
    const primaryImage = images[0];
    if (!primaryImage) return null;

    const safeSrc = normalizeAppImageSrc(primaryImage);

    return (
      <div className="request-card__media request-card__media--inline request-detail__gallery request-detail__gallery--dialog">
        <Image
          src={safeSrc}
          alt={safeAlt}
          fill
          sizes="(max-width: 768px) 100vw, 220px"
          unoptimized={shouldBypassNextImageOptimization(safeSrc)}
          className="request-card__image"
        />
      </div>
    );
  }

  return (
    <div className="request-detail__gallery">
      {images.map((src, index) => {
        const safeSrc = normalizeAppImageSrc(src);

        return (
          <div key={`${src}-${index}`} className="request-detail__photo">
            <Image
              src={safeSrc}
              alt={safeAlt}
              fill
              sizes="(max-width: 768px) 50vw, 180px"
              unoptimized={shouldBypassNextImageOptimization(safeSrc)}
              className="request-detail__photo-img"
            />
          </div>
        );
      })}
    </div>
  );
}
