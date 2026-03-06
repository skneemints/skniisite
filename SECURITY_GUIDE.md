# Security Hardening Guide

This document outlines the steps required to secure the SKNII OS application, addressing current static site vulnerabilities and preparing for future dynamic features (user accounts, database, real-time chat).

## Phase 1: Securing the Static Frontend (Current State)

Since the site is currently hosted on GitHub Pages, we cannot set custom HTTP response headers directly. To resolve the scanner warnings and prepare for production traffic, we need to place the site behind a CDN and Web Application Firewall (WAF).

### Step 1: Set up Cloudflare
1. Create a free account at [Cloudflare](https://www.cloudflare.com/).
2. Add your domain (`sknii.xyz`).
3. Cloudflare will provide you with two nameservers (e.g., `ns1.cloudflare.com`, `ns2.cloudflare.com`).
4. Log into your **Porkbun** account, go to your domain settings, and replace the default nameservers with the Cloudflare nameservers.
5. Wait for the DNS propagation (usually a few minutes to a few hours).

### Step 2: Enable Web Application Firewall (WAF)
Cloudflare's free tier includes basic DDoS protection and WAF capabilities.
- Navigate to **Security > WAF** in the Cloudflare dashboard.
- Ensure the managed rules are enabled to protect against common threats.

### Step 3: Configure Security Headers
Once Cloudflare is managing your traffic, you can inject the missing security headers before the response reaches the user.

Navigate to **Rules > Transform Rules > Modify Response Header** in Cloudflare and create a rule to add the following headers to all responses:

1. **Strict-Transport-Security (HSTS):**
   - Header Name: `Strict-Transport-Security`
   - Header Value: `max-age=31536000; includeSubDomains; preload`
   - *Purpose:* Forces browsers to always use HTTPS.

2. **X-Frame-Options / Clickjacking Protection:**
   - Header Name: `X-Frame-Options`
   - Header Value: `DENY` (or `SAMEORIGIN` if you need to iframe it yourself)
   - *Purpose:* Prevents malicious sites from embedding your site in an iframe.

3. **X-Content-Type-Options:**
   - Header Name: `X-Content-Type-Options`
   - Header Value: `nosniff`
   - *Purpose:* Prevents browsers from incorrectly guessing the MIME type of files, mitigating script injection via disguised files.

4. **Content-Security-Policy (CSP):**
   - *Note: We added a basic CSP via a `<meta>` tag in `index.html`, but a server header is more robust.*
   - Header Name: `Content-Security-Policy`
   - Header Value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-src 'none';`

---

## Phase 2: Preparing for Dynamic Features (Future State)

When you introduce user accounts, a database, and chat, the security landscape changes significantly. The application transitions from a "static site" to a "full-stack application."

### 1. Authentication and Authorization (User Accounts)
- **Do not roll your own crypto/auth:** Use established providers like Supabase, Firebase Auth, Auth0, or robust libraries like NextAuth.js (if moving to Next.js) or Lucia.
- **Session Management:** Ensure session cookies are set with `HttpOnly`, `Secure`, and `SameSite=Strict` flags to prevent XSS (Cross-Site Scripting) and CSRF (Cross-Site Request Forgery) attacks.
- **Password Policies:** Enforce strong passwords and implement rate limiting on login routes to prevent brute-force attacks.

### 2. Database Security
- **Never expose database credentials:** Keep connection strings and API keys in environment variables (`.env`) on your backend server. Never expose them to the frontend code.
- **Input Validation & Sanitization:** If building a custom API, rigorously validate and sanitize all user input before interacting with the database to prevent SQL Injection (or NoSQL equivalent).
- **Row Level Security (RLS):** If using tools like Supabase or Postgres, implement RLS so users can only access or modify their own data.

### 3. API & Backend Security
- **CORS (Cross-Origin Resource Sharing):** Configure your backend server to only accept requests from your specific frontend domain (`https://sknii.xyz`).
- **Rate Limiting:** Protect your API endpoints (especially chat and authentication) from abuse by limiting the number of requests a user can make within a certain timeframe.
- **WebSocket Security (For Chat):** Ensure WebSocket connections (WSS) are authenticated. Validate messages sent over the socket just as rigorously as HTTP requests to prevent injection attacks within the chat.

### 4. Hosting the Backend
GitHub Pages only hosts static files. For a backend, you will need a separate hosting solution:
- **Serverless/Edge:** Vercel, Cloudflare Pages/Workers, Netlify (great if you adopt a meta-framework like Next.js or Remix).
- **VPS/Containers:** DigitalOcean, Render, Fly.io, or Heroku for running a traditional Node.js/Python server.
- **BaaS (Backend as a Service):** Supabase or Firebase (handles database, auth, and real-time features out of the box).