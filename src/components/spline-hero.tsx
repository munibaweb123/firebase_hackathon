'use client';

import Spline from '@splinetool/react-spline';

export default function SplineHero() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Spline
        style={{ width: '100%', height: '100%' }}
        scene="https://prod.spline.design/7cLpXEwwf5fzOVt2/scene.splinecode" 
      />
    </div>
  );
}
