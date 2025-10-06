import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

// Componente que solo provee el contexto del visor
export function PhotoViewerProvider({ children }) {
  return (
    <PhotoProvider
      speed={() => 300}
      easing={(type) => (type === 2 ? 'cubic-bezier(0.36, 0, 0.66, -0.56)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)')}
      maskOpacity={0.9}
      toolbarRender={({ onScale, scale }) => {
        return (
          <>
            <svg className="PhotoView-Slider__toolbarIcon" onClick={() => onScale(scale + 1)}>
              <use xlinkHref="#icon-zoom-in" />
            </svg>
            <svg className="PhotoView-Slider__toolbarIcon" onClick={() => onScale(scale - 1)}>
              <use xlinkHref="#icon-zoom-out" />
            </svg>
          </>
        );
      }}
    >
      {children}
    </PhotoProvider>
  );
}

// Componente individual para cada imagen
export function PhotoViewImage({ src, alt, children, index }) {
  return (
    <PhotoView src={src} key={index}>
      {children}
    </PhotoView>
  );
}

// Hook para abrir el visor programáticamente
export function usePhotoViewer() {
  const openViewer = (images, startIndex = 0) => {
    // Este hook se puede expandir en el futuro si necesitas más control
    return { images, startIndex };
  };

  return { openViewer };
}