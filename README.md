# CAPI Only [![Grade C](https://img.shields.io/badge/Grade-C-orange)]

This variant demonstrates a Conversions API (CAPI) only implementation with **no Meta Pixel whatsoever**. While it includes comprehensive advanced matching parameters and proper client-side hashing, the complete absence of the browser pixel highlights significant tracking gaps. It shows why Meta's best practice is to use both the Meta Pixel and the Conversions API together for redundancy and maximum signal. Key issues include the lack of browser-side cookie tracking, no automatic `PageView` events, and the impossibility of effective event deduplication. Furthermore, the CAPI access token is dangerously exposed in the client-side JavaScript code.

### Quick Facts

| Attribute | Value |
|---|---|
| **Pixel ID** | `1684145446350033` |
| **CAPI Method** | Direct HTTP (Client-side) |
| **Grade** | C |
| **Live Site** | [https://mishaberman.github.io/demo-ecommerce-capi-only/](https://mishaberman.github.io/demo-ecommerce-capi-only/) |
| **GitHub Repo** | [https://github.com/mishaberman/demo-ecommerce-capi-only](https://github.com/mishaberman/demo-ecommerce-capi-only) |

### What's Implemented

- ✅ **Conversions API (CAPI)**: All events are sent directly to the Graph API via client-side HTTP requests.
- ✅ **Full Advanced Matching**: `em`, `ph`, `fn`, and `ln` parameters are collected from user input and sent with every event.
- ✅ **Client-Side Hashing**: All personally identifiable information (PII) is correctly hashed using SHA-256 in the browser before being sent to Meta.
- ✅ **`fbp` and `fbc` Parameters**: Click and browser ID parameters are generated and included in CAPI payloads.
- ✅ **`event_id` Generation**: A unique `event_id` is generated for each event, although it serves no purpose without a corresponding Pixel event.
- ✅ **Data Processing Options (DPO)**: The `data_processing_options` parameter is included for CCPA compliance.

### What's Missing or Broken

- ❌ **No Meta Pixel**: The complete absence of the Pixel base code means no support for browser cookie identification, automatic event tracking (`PageView`), or rich audience building capabilities.
- ❌ **Exposed Access Token**: The CAPI Access Token is hardcoded in the public JavaScript, representing a major security vulnerability.
- ❌ **No Server-Side Logic**: All tracking is done in the browser, missing the opportunity for server-side enrichment (e.g., adding LTV or lead scores).
- ❌ **Meaningless Deduplication**: `event_id` is sent, but since there are no Pixel events, deduplication never occurs. This demonstrates a misunderstanding of how deduplication works.
- ❌ **No Automatic Events**: Critical events like `PageView` are not tracked because they are typically handled automatically by the Pixel base code.

### Event Coverage

This table shows which events are fired by the Pixel, CAPI, or both.

| Event | Meta Pixel | Conversions API (CAPI) | Both |
|---|:---:|:---:|:---:|
| `PageView` | ❌ | ❌ | ❌ |
| `ViewContent` | ❌ | ✅ | ❌ |
| `Search` | ❌ | ✅ | ❌ |
| `AddToCart` | ❌ | ✅ | ❌ |
| `InitiateCheckout` | ❌ | ✅ | ❌ |
| `Lead` | ❌ | ✅ | ❌ |
| `CompleteRegistration` | ❌ | ✅ | ❌ |
| `Purchase` | ❌ | ✅ | ❌ |

### Parameter Completeness

This table shows which user and product parameters are sent with each event.

| Event | `content_type` | `content_ids` | `value` | `currency` | `content_name` | `num_items` | `em` | `ph` | `fn` | `ln` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ViewContent` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `Search` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `AddToCart` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `InitiateCheckout` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `Lead` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `CompleteRegistration` | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `Purchase` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Architecture

The tracking logic for this variant resides entirely in the client-side JavaScript file `assets/js/main.js`. There is no Meta Pixel base code snippet installed on the site. Instead, when a trackable action occurs (e.g., a button click), a JavaScript function constructs a CAPI payload as a JSON object. This object includes event details, user information (hashed PII), and custom data. The function then makes a direct `POST` request to the Conversions API endpoint (`https://graph.facebook.com/v18.0/YOUR_PIXEL_ID/events`) from the user's browser. The CAPI Access Token is unfortunately hardcoded directly within this public-facing JavaScript file.

### How to Use This Variant

To test this variant, you can perform the following actions on the [live site](https://mishaberman.github.io/demo-ecommerce-capi-only/):

1.  **ViewContent**: Visit any product page.
2.  **Search**: Use the search bar in the header.
3.  **AddToCart**: Click the "Add to Cart" button on a product page.
4.  **InitiateCheckout**: Click the "Checkout" button in the cart drawer.
5.  **Lead**: Submit the newsletter subscription form in the footer.
6.  **CompleteRegistration**: Create an account on the login/register page.
7.  **Purchase**: Click the "Complete Purchase" button on the checkout page.

You can observe the outgoing CAPI requests in your browser's developer tools (Network tab). Look for `POST` requests to `graph.facebook.com`. You can inspect the payload to see the hashed user data and event parameters being sent.
