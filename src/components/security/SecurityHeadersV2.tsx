
import { useEffect } from 'react';
import { SECURITY_CONFIG } from '@/utils/securityConfig';

const SecurityHeadersV2 = () => {
  useEffect(() => {
    const addMetaTag = (name: string, content: string) => {
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (existing) {
        existing.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    const addHttpEquivTag = (httpEquiv: string, content: string) => {
      const existing = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
      if (existing) {
        existing.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', httpEquiv);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Enhanced security headers
    if (SECURITY_CONFIG.headers.enableHSTS) {
      addHttpEquivTag('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    addHttpEquivTag('X-Content-Type-Options', 'nosniff');
    addHttpEquivTag('X-Frame-Options', 'DENY');
    addHttpEquivTag('X-XSS-Protection', '1; mode=block');
    
    if (SECURITY_CONFIG.headers.enableReferrerPolicy) {
      addHttpEquivTag('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // Stricter Content Security Policy (removed unsafe-eval)
    if (SECURITY_CONFIG.headers.enableCSP) {
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "block-all-mixed-content",
        "upgrade-insecure-requests"
      ].join('; ');
      
      addHttpEquivTag('Content-Security-Policy', csp);
    }

    // Enhanced Permissions Policy (more restrictive)
    addHttpEquivTag('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(), autoplay=()'
    );

    // Cross-Origin policies for enhanced security
    addHttpEquivTag('Cross-Origin-Embedder-Policy', 'require-corp');
    addHttpEquivTag('Cross-Origin-Opener-Policy', 'same-origin');
    addHttpEquivTag('Cross-Origin-Resource-Policy', 'same-origin');

    // Additional security meta tags
    addMetaTag('robots', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
    addMetaTag('format-detection', 'telephone=no, date=no, email=no, address=no');
    addMetaTag('theme-color', '#1e40af');
    
    // Prevent DNS prefetching for privacy
    addHttpEquivTag('x-dns-prefetch-control', 'off');

  }, []);

  return null;
};

export default SecurityHeadersV2;
