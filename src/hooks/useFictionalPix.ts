import { useState } from 'react';

interface PixData {
  qrcode: string;
  amount: number;
  transactionId: string;
  qrCodeBase64?: string;
}

interface UseFictionalPixReturn {
  loading: boolean;
  error: string | null;
  pixData: PixData | null;
  createPix: (amount: number) => Promise<PixData>;
  checkPixStatus: (transactionId: string) => Promise<{ status: string; value: number }>;
  reset: () => void;
}

export const useFictionalPix = (): UseFictionalPixReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);

  const createPix = async (amount: number): Promise<PixData> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar PIX');
      }

      const apiData = await response.json();

      const data: PixData = {
        qrcode: apiData.qr_code,
        amount: apiData.value / 100,
        transactionId: apiData.id,
        qrCodeBase64: apiData.qr_code_base64
      };

      setPixData(data);
      setLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar código PIX';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const checkPixStatus = async (transactionId: string): Promise<{ status: string; value: number }> => {
    try {
      const response = await fetch(`/api/check-pix?id=${transactionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao consultar status do PIX');
      }

      const data = await response.json();
      return {
        status: data.status,
        value: data.value / 100
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao consultar PIX';
      throw new Error(errorMessage);
    }
  };

  const reset = () => {
    setPixData(null);
    setError(null);
    setLoading(false);
  };

  return {
    loading,
    error,
    pixData,
    createPix,
    checkPixStatus,
    reset
  };
};
