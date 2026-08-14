import React, { useState, useRef } from 'react';

export default function VirtualTour() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  return (
    <section className="py-12 md:py-20 bg-ivory relative" id="virtual-tour">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <h2 className="text-xs sm:text-sm font-bold tracking-widest text-gold uppercase mb-2 sm:mb-3">
            Interactive Experience
          </h2>
          <h3 className="text-3xl sm:text-4xl font-neue font-semibold text-charcoal mb-3 sm:mb-4">
            Take a 360° Virtual Tour
          </h3>
          <p className="text-taupe text-base sm:text-lg">
            Explore Etihad Garden from the comfort of your home. Walk through master-planned streets, parklands, and villas in high definition.
          </p>
        </div>

        <div className="relative rounded-2xl md:rounded-[24px] overflow-hidden shadow-2xl group max-w-5xl mx-auto border border-gray-100/80 bg-black aspect-video w-full">
          <video
            ref={videoRef}
            src="images/Video.mp4"
            className="w-full h-full object-cover"
            controls
            playsInline
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            preload="metadata"
          />

          {!isPlaying && (
            <div 
              onClick={handlePlayClick}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 sm:p-6 text-center cursor-pointer transition-all duration-300 hover:bg-black/30 z-10"
            >
              <button
                type="button"
                onClick={handlePlayClick}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gold/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform mb-3 sm:mb-4 group-hover:bg-gold cursor-pointer"
                aria-label="Play Virtual Tour"
              >
                <svg className="w-7 h-7 sm:w-10 sm:h-10 ml-1 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <p className="text-white text-lg sm:text-xl md:text-2xl font-neue font-semibold drop-shadow-md">
                Click to Start Virtual Tour
              </p>
              <p className="text-white/90 text-xs sm:text-sm md:text-base mt-1 drop-shadow">
                Full HD 3D Interactive Walkthrough
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

