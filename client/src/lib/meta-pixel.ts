/**
 * Meta Pixel & Conversions API — "CAPI-Only" Variant
 * 
 * CONCEPT: Strong CAPI implementation but BROKEN pixel.
 * - Pixel uses WRONG pixel ID (extra digit appended)
 * - Advanced matching passes UNHASHED raw PII (privacy violation)
 * - CAPI uses CORRECT pixel ID with proper hashing
 * - event_id generated for all events (but dedup broken due to pixel ID mismatch)
 */

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

// BUG: Wrong pixel ID — has an extra digit appended!
const PIXEL_ID_WRONG = '16841454463500331';
// Correct pixel ID used only in CAPI
const PIXEL_ID_CORRECT = '1684145446350033';
const ACCESS_TOKEN = 'EAAEDq1LHx1gBRPAEq5cUOKS5JrrvMif65SN8ysCUrX5t0SUZB3ETInM6Pt71VHea0bowwEehinD0oZAeSmIPWivziiVu0FuEIcsmgvT3fiqZADKQDiFgKdsugONbJXELgvLuQxHT0krELKt3DPhm0EyUa44iXu8uaZBZBddgVmEnFdNMBmsWmYJdOT17DTitYKwZDZD';

/** Read test_event_code from URL param (e.g. ?test_event_code=TEST12345) */
function getTestEventCode(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('test_event_code');
  } catch { return null; }
}

function generateEventId(): string {
  return 'eid_' + crypto.randomUUID();
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

let capiUserData: Record<string, string> = {};

/**
 * Set user data — CAPI hashes properly, but pixel gets RAW PII (privacy violation!)
 */
export function setUserData(data: { em?: string; ph?: string; fn?: string; ln?: string; external_id?: string }) {
  if (typeof window !== 'undefined' && window.fbq) {
    // PRIVACY VIOLATION: Passing raw unhashed PII to pixel advanced matching
    window.fbq('init', PIXEL_ID_WRONG, {
      em: data.em || '',
      ph: data.ph || '',
      fn: data.fn || '',
      ln: data.ln || '',
      external_id: data.external_id || '',
    });
  }
  if (data.em) capiUserData.em = data.em;
  if (data.ph) capiUserData.ph = data.ph;
  if (data.fn) capiUserData.fn = data.fn;
  if (data.ln) capiUserData.ln = data.ln;
  if (data.external_id) capiUserData.external_id = data.external_id;
}

// ============================================================
// PIXEL EVENTS — Goes to WRONG pixel ID
// ============================================================

function trackPixelEvent(eventName: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    const options = eventId ? { eventID: eventId } : undefined;
    if (options) {
      window.fbq('track', eventName, params, options);
    } else {
      window.fbq('track', eventName, params);
    }
    console.log(`[Meta Pixel] Tracked: ${eventName} (WRONG PIXEL ID: ${PIXEL_ID_WRONG})`, params);
  }
}

export function trackViewContent(productId: string, productName: string, value: number, currency: string) {
  const eventId = generateEventId();
  trackPixelEvent('ViewContent', {
    content_ids: [productId], content_type: 'product', content_name: productName,
    content_category: 'Products', value, currency,
  }, eventId);
  sendCAPIEvent('ViewContent', {
    content_ids: [productId], content_type: 'product', content_name: productName,
    content_category: 'Products', value, currency,
  }, eventId);
}

export function trackAddToCart(productId: string, productName: string, value: number, currency: string, quantity: number) {
  const eventId = generateEventId();
  trackPixelEvent('AddToCart', {
    content_ids: [productId], content_type: 'product', content_name: productName,
    value, currency, num_items: quantity,
  }, eventId);
  sendCAPIEvent('AddToCart', {
    content_ids: [productId], content_type: 'product', content_name: productName,
    value, currency, num_items: quantity,
  }, eventId);
}

export function trackInitiateCheckout(value: number, currency: string, numItems: number, contentIds?: string[]) {
  const eventId = generateEventId();
  trackPixelEvent('InitiateCheckout', {
    content_ids: contentIds || [], content_type: 'product', value, currency, num_items: numItems,
  }, eventId);
  sendCAPIEvent('InitiateCheckout', {
    content_ids: contentIds || [], content_type: 'product', value, currency, num_items: numItems,
  }, eventId);
}

export function trackPurchase(value: number, currency: string, contentIds?: string[]) {
  const eventId = generateEventId();
  trackPixelEvent('Purchase', {
    content_ids: contentIds || [], content_type: 'product', value, currency,
    num_items: contentIds?.length || 0,
  }, eventId);
  sendCAPIEvent('Purchase', {
    content_ids: contentIds || [], content_type: 'product', value, currency,
    num_items: contentIds?.length || 0,
  }, eventId);
}

export function trackLead(formType?: string) {
  const eventId = generateEventId();
  trackPixelEvent('Lead', { content_name: formType || 'lead_form', value: 10.00, currency: 'USD' }, eventId);
  sendCAPIEvent('Lead', { content_name: formType || 'lead_form', value: 10.00, currency: 'USD' }, eventId);
}

export function trackCompleteRegistration(method?: string) {
  const eventId = generateEventId();
  trackPixelEvent('CompleteRegistration', {
    content_name: 'website_registration', value: 5.00, currency: 'USD', status: method || 'complete',
  }, eventId);
  sendCAPIEvent('CompleteRegistration', {
    content_name: 'website_registration', value: 5.00, currency: 'USD', status: method || 'complete',
  }, eventId);
}

export function trackContact() {
  const eventId = generateEventId();
  trackPixelEvent('Contact', { content_name: 'contact_form' }, eventId);
  sendCAPIEvent('Contact', { content_name: 'contact_form' }, eventId);
}

export function trackSearch(query: string, contentIds?: string[]) {
  const eventId = generateEventId();
  trackPixelEvent('Search', { search_string: query, content_ids: contentIds || [], content_type: 'product' }, eventId);
  sendCAPIEvent('Search', { search_string: query, content_ids: contentIds || [], content_type: 'product' }, eventId);
}

// ============================================================
// CAPI — Uses CORRECT pixel ID with proper hashing
// ============================================================

async function sendCAPIEvent(eventName: string, eventData: Record<string, unknown>, eventId?: string) {
  const hashedUserData: Record<string, string> = {
    client_user_agent: navigator.userAgent,
    fbc: getCookie('_fbc'),
    fbp: getCookie('_fbp'),
  };
  if (capiUserData.em) hashedUserData.em = await hashSHA256(capiUserData.em);
  if (capiUserData.ph) hashedUserData.ph = await hashSHA256(capiUserData.ph);
  if (capiUserData.fn) hashedUserData.fn = await hashSHA256(capiUserData.fn);
  if (capiUserData.ln) hashedUserData.ln = await hashSHA256(capiUserData.ln);
  if (capiUserData.external_id) hashedUserData.external_id = await hashSHA256(capiUserData.external_id);

  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: window.location.href,
      user_data: hashedUserData,
      custom_data: eventData,
      data_processing_options: [],
      data_processing_options_country: 0,
      data_processing_options_state: 0,
    }],
    access_token: ACCESS_TOKEN,
  };

  // Include test_event_code if present in URL params
  const testEventCode = getTestEventCode();
  if (testEventCode) {
    (payload as Record<string, unknown>).test_event_code = testEventCode;
  }

  const endpoint = `https://graph.facebook.com/v18.0/${PIXEL_ID_CORRECT}/events`;
  console.log(`[CAPI] Sending ${eventName} (event_id: ${eventId})${testEventCode ? ` [TEST: ${testEventCode}]` : ''} — payload:`, JSON.parse(JSON.stringify(payload)));
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log(`[CAPI] ${eventName} (event_id: ${eventId}) — response:`, result);
  } catch (err) {
    console.error(`[CAPI] Failed to send ${eventName}:`, err);
  }
}
