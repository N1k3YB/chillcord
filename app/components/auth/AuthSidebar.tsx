'use client';

import React from 'react';
import WaveAnimation from './WaveAnimation';

const AuthSidebar = () => {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-[#404EED] relative overflow-hidden">
      <div className="absolute z-10 inset-0 flex flex-col items-center justify-center">
        <div className="max-w-lg px-8 text-center text-white">
          <h1 className="text-6xl font-extrabold mb-8 text-white drop-shadow-md">
            ChillCord
          </h1>
          
          <div className="text-xl space-y-6 leading-relaxed">
            <p className="font-medium">
              Простое место для голосового, видео и текстового общения.
            </p>
            <p>
              Находитесь ли вы в школьной группе, игровом клубе или всемирном сообществе — можно просто пообщаться с друзьями и провести время вместе.
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-2 rounded-full bg-white opacity-30"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <WaveAnimation />
    </div>
  );
};

export default AuthSidebar; 