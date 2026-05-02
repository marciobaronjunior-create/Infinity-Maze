export interface CheckoutItem {
  name: string;
  description: string;
  amount: number; // in cents
}

export async function createCheckoutSession(items: CheckoutItem[], currency: string = 'usd') {
  const origin = window.location.origin;
  console.log('[StripeService] Creating session...', { items, currency, origin });
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15s

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ items, currency, origin }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data: any;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      const isHtml = text.toLowerCase().includes('<!doctype') || text.toLowerCase().includes('<html');
      console.error('[StripeService] Failed to parse JSON response. Content type:', response.headers.get('content-type'));
      console.error('[StripeService] Response content:', text.substring(0, 500));
      
      if (isHtml) {
        throw new Error('Server returned HTML instead of JSON. This usually means the API route was not found and the server fell back to the app page.');
      }
      throw new Error(`Invalid server response (not JSON): ${text.substring(0, 100)}...`);
    }

    if (!response.ok) {
      console.error('[StripeService] Server error:', data);
      throw new Error(data.error || 'Failed to create checkout session');
    }

    if (data.url) {
        console.log('[StripeService] Session created successfully:', data.url);
        return data.url;
    }
    
    throw new Error('No checkout URL returned from server');
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[StripeService] Request timed out');
      throw new Error('Payment service request timed out after 15s');
    }
    console.error('[StripeService] Error:', error);
    throw error;
  }
}
