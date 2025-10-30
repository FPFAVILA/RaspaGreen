import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 200, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (value && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      }).catch(() => {
        // Error handled silently
      });
    }
  }, [value, size]);

  if (!value) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-sm">QR Code aparecerá aqui</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas 
        ref={canvasRef}
        className="border-2 border-gray-200 rounded-xl shadow-lg bg-white"
      />
    </div>
  );
};