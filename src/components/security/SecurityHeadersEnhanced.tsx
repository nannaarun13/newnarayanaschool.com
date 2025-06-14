
import { useEffect } from 'react';
import { SECURITY_CONFIG } from '@/utils/securityConfig';

const SecurityHeadersEnhanced = () => {
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

    // Generate nonce for inline scripts
    const nonce = btoa(Math.random().toString()).substring(0, 16);
    
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

    // Enhanced Content Security Policy with stricter rules
    if (SECURITY_CONFIG.headers.enableCSP) {
      const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://apis.google.com https://*.firebaseapp.com https://www.gstatic.com`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com",
        "frame-src 'self' https://*.firebaseapp.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "block-all-mixed-content",
        "upgrade-insecure-requests"
      ].join('; ');
      
      addHttpEquivTag('Content-Security-Policy', csp);
    }

    // Enhanced Permissions Policy
    addHttpEquivTag('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(self), autoplay=()'
    );

    // Cross-Origin policies for better isolation
    addHttpEquivTag('Cross-Origin-Embedder-Policy', 'require-corp');
    addHttpEquivTag('Cross-Origin-Opener-Policy', 'same-origin');
    addHttpEquivTag('Cross-Origin-Resource-Policy', 'same-origin');

    // Additional security meta tags
    addMetaTag('robots', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
    addMetaTag('format-detection', 'telephone=no, email=no, address=no');
    addMetaTag('theme-color', '#1e40af');
    
    // Prevent browser from storing sensitive data
    addHttpEquivTag('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    addHttpEquivTag('Pragma', 'no-cache');
    addHttpEquivTag('Expires', '0');

    // Add integrity to external resources
    const addIntegrityToExternalResources = () => {
      const scripts = document.querySelectorAll('script[src^="https://"]');
      scripts.forEach(script => {
        if (!script.hasAttribute('integrity')) {
          script.setAttribute('crossorigin', 'anonymous');
        }
      });
      
      const links = document.querySelectorAll('link[href^="https://"]');
      links.forEach(link => {
        if (!link.hasAttribute('integrity')) {
          link.setAttribute('crossorigin', 'anonymous');
        }
      });
    };

    addIntegrityToExternalResources();

    // Store nonce for potential use by other components
    window.__SECURITY_NONCE__ = nonce;

  }, []);

  return null;
};

export default SecurityHeadersEnhanced;
