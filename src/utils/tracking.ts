declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: any) => void;
  }
}

export const trackPageView = () => {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  } catch (error) {
    // Error handled silently
  }
};

export const trackLead = (userData?: any) => {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', userData);
    }
  } catch (error) {
    // Error handled silently
  }
};

export const trackPurchase = (amount: number) => {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: amount,
        currency: 'BRL'
      });
    }
  } catch (error) {
    // Error handled silently
  }
};
