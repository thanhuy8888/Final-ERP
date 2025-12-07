import { useState, useEffect, useRef } from 'react';

/**
 * LazyImage component - Lazy loads images using Intersection Observer
 * Falls back to placeholder until image is in viewport
 */
const LazyImage = ({
    src,
    alt,
    className = '',
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"%3E%3Crect fill="%23f0f0f0" width="300" height="300"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20"%3ELoading...%3C/text%3E%3C/svg%3E',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '100px', // Start loading 100px before viewport
                threshold: 0.1
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        // Keep placeholder on error
        setIsLoaded(true);
    };

    return (
        <div
            ref={imgRef}
            className={`lazy-image-container ${className}`}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {!isLoaded && (
                <img
                    src={placeholder}
                    alt={alt}
                    className={className}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(5px)'
                    }}
                    {...props}
                />
            )}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    className={className}
                    onLoad={handleLoad}
                    onError={handleError}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: isLoaded ? 'relative' : 'absolute',
                        top: 0,
                        left: 0,
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                    {...props}
                />
            )}
        </div>
    );
};

export default LazyImage;
