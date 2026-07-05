// Dependency-free constant shared between the server-side login hook and the client
// login form, so the client bundle never pulls in the server 2FA modules (crypto,
// otplib, qrcode, payload).

// Message the beforeLogin hook throws when a valid session requires a 2FA code; the
// client login form keys off it to reveal the code field.
export const TWO_FACTOR_REQUIRED = '2FA_REQUIRED'
