// src/components/requests/details/RequestDetailGallery.tsx
import Image from 'next/image';
import { normalizeAppImageSrc, shouldBypassNextImageOptimization } from '@/lib/requests/images';

type RequestDetailGalleryProps = {
  images: string[];
  title: string;
};

export function RequestDetailGallery({ images, title }: RequestDetailGalleryProps) {
  return (
    <div className="request-detail__gallery">
      {images.map((src, index) => {
        const safeSrc = normalizeAppImageSrc(src);

        return (
          <div key={`${src}-${index}`} className="request-detail__photo">
            <Image
              src={safeSrc}
              alt={title}
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
