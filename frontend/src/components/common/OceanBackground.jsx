import React, { useState, useEffect } from 'react';
import Waves from '../reactbits/Waves/Waves';

export default function OceanBackground() {
  const [hasWebGL2, setHasWebGL2] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) {
        setHasWebGL2(false);
      }
    } catch {
      setHasWebGL2(false);
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#013CD3]">
      {hasWebGL2 ? (
        <Waves
          lineColor="rgba(254, 253, 254, 0.14)"
          backgroundColor="#013CD3"
          accentColor="#C7FC02"
          waveSpeedX={0.005}
          waveSpeedY={0.003}
          waveAmpX={14}
          waveAmpY={8}
          friction={0.95}
          tension={0.006}
          maxCursorMove={40}
          className="opacity-25"
        />
      ) : (
        <div className="absolute inset-0 bg-[#013CD3]" />
      )}
    </div>
  );
}
