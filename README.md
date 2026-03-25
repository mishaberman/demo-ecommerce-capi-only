# demo-ecommerce-capi-only

## Overview
This variant demonstrates a broken Conversions API (CAPI) setup where the Meta Pixel and CAPI are sending data to different Pixel IDs, making event deduplication impossible. This is part of a collection of demo e-commerce sites that showcase different levels of Meta Pixel and Conversions API (CAPI) implementation quality. Each variant is deployed on GitHub Pages.

**Live Site:** https://mishaberman.github.io/demo-ecommerce-capi-only/
**Quality Grade:** D-

## Meta Pixel Setup

### Base Pixel Code
- **Pixel ID:** `16841454463500331` (Incorrect - has an extra digit)
- **Location:** Loaded in the `<head>` tag of `index.html`.
- **Noscript Fallback:** Included.

### Advanced Matching
- **User Data:** `em`, `ph`, `fn`, `ln`, `external_id` are passed to `fbq('init', PIXEL_ID, {...})`.
- **Issues:** All advanced matching data is sent to the **wrong Pixel ID**.

## Conversions API (CAPI) Setup

### Method
This variant uses a **Client-Side Direct HTTP** method, where CAPI events are sent directly from the browser to the Graph API. This is **not a recommended practice** due to security risks.

### Implementation Details
- **Endpoint:** Events are sent via `fetch` requests to `https://graph.facebook.com/v13.0/PIXEL_ID/events`.
- **Access Token:** The access token is **exposed** in the client-side JavaScript, posing a major security risk.
- **User Data Sent:** `em`, `ph`, `fn`, `ln`, `external_id`, `fbp`, `fbc`.
- **PII Hashing:** PII is hashed (SHA-256) on the client-side before being sent.
- **Data Processing Options:** `data_processing_options` are included for CCPA/GDPR compliance.

## Events Tracked

| Event Name | Pixel | CAPI | Parameters Sent | event_id |
|---|---|---|---|---|
| ViewContent | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes |
| AddToCart | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes |
| InitiateCheckout | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes |
| Purchase | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes |
| Lead | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes |
| CompleteRegistration | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes |
| Contact | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes |

## Event Deduplication
- **`event_id` Generation:** An `event_id` is generated for each event.
- **Deduplication Status:** **Broken**. The Pixel events are sent to Pixel ID `16841454463500331`, while the CAPI events are sent to the correct Pixel ID `1684145446350033`. Because the events are routed to different destinations, they cannot be matched and deduplicated.

## Custom Data
- No `custom_data` fields are sent with events.

## Known Issues
- **Pixel ID Mismatch:** The fundamental issue is the use of two different Pixel IDs, which completely breaks event deduplication and corrupts the data in both Pixels.
- **Exposed Access Token:** The CAPI access token is hardcoded in the client-side code, which is a critical security vulnerability.

## Security Considerations
- **Access Token:** The Meta CAPI access token is exposed in the client-side JavaScript, allowing anyone to send unauthorized events to the CAPI endpoint.
- **PII Hashing:** While PII is hashed, the hashing is performed on the client-side, which is less secure than server-side hashing.

---
*This variant is part of the [Meta Pixel Quality Variants](https://github.com/mishaberman) collection for testing and educational purposes.*
