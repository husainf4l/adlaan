"use client";

import Image from 'next/image';
import { useRef, useState } from 'react';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  return (
    <div id="hero" className="gap-sm pt-20 flex flex-col items-center justify-center bg-gradient-to-br from-oxford-blue to-black py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
      <div className="w-full pt-6 relative z-10">
        <div className="gap-6 flex flex-col items-center [&_h1]:text-4xl md:[&_h1]:text-5xl lg:[&_h1]:text-6xl">
          <div className="gap-4 flex flex-col items-center px-0 text-center md:px-7">
            <p className="text-cyan text-base animate-fade-in"></p>
            <div>
              <h1 className="text-balance bg-gradient-to-r from-purple via-cyan to-purple bg-clip-text text-transparent animate-gradient-x">Professional</h1>
              <h1 className="text-balance bg-gradient-to-r from-purple via-cyan to-purple bg-clip-text text-transparent animate-gradient-x">Class AI</h1>
            </div>
            <p className="text-platinum mx-auto max-w-[582px] text-lg font-normal text-balance md:text-xl leading-relaxed">
              Domain-specific AI for law firms, professional service providers, and the Fortune 500.
            </p>
          </div>
          <a
            className="flex items-center justify-center text-nowrap rounded-full bg-gradient-to-r from-purple to-cyan leading-none text-white duration-300 ease-in-out hover:shadow-lg hover:shadow-purple/50 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 active:scale-95 h-14 px-8 text-sm font-semibold cursor-pointer transition-all"
            href="/contact-sales"
          >
            <p className="leading-none text-nowrap">Request a Demo</p>
          </a>
        </div>
        <div className="mt-16 mx-auto w-full max-w-[1728px] mt-16 md:mt-0">
          <div className="mx-7 grid grid-cols-2 gap-3.5 md:mx-8 md:grid-cols-6 md:gap-4 lg:mx-9 lg:grid-cols-12 lg:gap-4.5 xl:mx-10 xl:gap-5">
            <div className="relative col-span-2 h-fit md:col-span-6 lg:col-start-1 lg:col-end-13">
              <div className="mx-auto">
                <div className="flex flex-col">
                  <div className="post-video relative flex aspect-video w-full flex-col overflow-hidden rounded-2xl shadow-2xl cursor-pointer group">
                    <div className="relative size-full overflow-hidden">
                      <video
                        ref={videoRef}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        poster="/video-poster.webp"
                        muted
                        loop
                        playsInline
                      >
                        <source src="/videos/herovedio.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="z-20 opacity-100 duration-300">
                        <button
                          onClick={handlePlay}
                          aria-label="Play Video"
                          className="z-10 backdrop-blur-sm transition-all duration-500 opacity-100 scale-75 md:scale-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110"
                        >
                          <div className="group flex size-20 items-center overflow-hidden rounded-full bg-white/20 hover:bg-white/30">
                            <div className="flex translate-x-2 items-center gap-1 transition-transform duration-500 ease-in-out md:translate-x-3">
                              <div className="relative h-full w-full scale-75 transition-opacity duration-500 ease-in-out md:scale-100 opacity-100">
                                {isPlaying ? (
                                  <svg width="24" height="25" viewBox="0 0 24 25" fill="white" xmlns="http://www.w3.org/2000/svg" className="fill-white">
                                    <path d="M6 4.67187H10V20.6719H6V4.67187Z" />
                                    <path d="M14 4.67187H18V20.6719H14V4.67187Z" />
                                  </svg>
                                ) : (
                                  <svg width="24" height="25" viewBox="0 0 24 25" fill="white" xmlns="http://www.w3.org/2000/svg" className="fill-white">
                                    <path d="M19 12.6719L7 20.6719L7 4.67187L19 12.6719Z"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}