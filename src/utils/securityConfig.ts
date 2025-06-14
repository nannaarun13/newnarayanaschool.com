
interface SecurityConfig {
  rateLimit: {
    maxAttempts: number;
    windowMs: number;
    escalationThreshold: number;
    escalationWindowMs: number;
  };
  session: {
    timeoutMinutes: number;
    warningMinutes: number;
    maxConcurrentSessions: number;
  };
  monitoring: {
    enableGeoTracking: boolean;
    enableDeviceFingerprinting: boolean;
    anomalyDetectionThreshold: number;
  };
  headers: {
    enableHSTS: boolean;
    enableCSP: boolean;
    enableReferrerPolicy: boolean;
  };
}

export const SECURITY_CONFIG: SecurityConfig = {
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    escalationThreshold: 10,
    escalationWindowMs: 60 * 60 * 1000, // 1 hour
  },
  session: {
    timeoutMinutes: 30,
    warningMinutes: 5,
    maxConcurrentSessions: 3,
  },
  monitoring: {
    enableGeoTracking: true,
    enableDeviceFingerprinting: true,
    anomalyDetectionThreshold: 0.7,
  },
  headers: {
    enableHSTS: true,
    enableCSP: true,
    enableReferrerPolicy: true,
  }
};

export const SECURITY_EVENTS = {
  SUSPICIOUS_LOGIN: 'suspicious_login',
  MULTIPLE_FAILURES: 'multiple_failures',
  DEVICE_CHANGE: 'device_change',
  LOCATION_ANOMALY: 'location_anomaly',
  SESSION_HIJACK_ATTEMPT: 'session_hijack_attempt',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
} as const;

export type SecurityEventType = typeof SECURITY_EVENTS[keyof typeof SECURITY_EVENTS];
