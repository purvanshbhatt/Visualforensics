import React from 'react';

interface ExampleImage {
  src: string;
  alt: string;
}

interface ExampleImagesProps {
  images: ExampleImage[];
  onSelect: (url: string) => void;
  disabled: boolean;
}

const ExampleImages: React.FC<ExampleImagesProps> = ({ images, onSelect, disabled }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-300">Or try an example:</h3>
      <div className="grid grid-cols-3 gap-2">
        {images.map((image) => (
          <button
            key={image.src}
            onClick={() => onSelect(image.src)}
            disabled={disabled}
            className="rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed group"
            aria-label={`Select example image: ${image.alt}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExampleImages;
