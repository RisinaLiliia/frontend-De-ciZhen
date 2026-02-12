// src/components/requests/details/RequestDetailGallery.tsx
import Image from 'next/image';

type RequestDetailGalleryProps = {
  images: string[];
  title: string;
};

export function RequestDetailGallery({ images, title }: RequestDetailGalleryProps) {
  return (
    <div className="request-detail__gallery">
      {images.map((src, index) => (
        <div key={`${src}-${index}`} className="request-detail__photo">
          <Image
            src={src}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 180px"
            className="request-detail__photo-img"
          />
        </div>
      ))}
    </div>
  );
}
