
import { collection, addDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SecurityEvent {
  id?: string;
  type: 'login_attempt' | 'admin_registration' | 'permission_denied' | 'rate_limit_exceeded' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details: string;
  timestamp: string;
  resolved: boolean;
}

// Enhanced input sanitization for security logs
const sanitizeLogInput = (input: any, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return 'unknown';
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, maxLength);
};

// Log security events with enhanced validation
export const logSecurityEvent = async (event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> => {
  try {
    // Validate event type and severity
    const validTypes = ['login_attempt', 'admin_registration', 'permission_denied', 'rate_limit_exceeded', 'suspicious_activity'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    
    if (!validTypes.includes(event.type)) {
      console.error('Invalid security event type:', event.type);
      return;
    }
    
    if (!validSeverities.includes(event.severity)) {
      console.error('Invalid security event severity:', event.severity);
      return;
    }

    const securityEvent: SecurityEvent = {
      type: event.type,
      severity: event.severity,
      email: event.email ? sanitizeLogInput(event.email, 100) : undefined,
      ipAddress: event.ipAddress ? sanitizeLogInput(event.ipAddress, 50) : undefined,
      userAgent: event.userAgent ? sanitizeLogInput(event.userAgent, 500) : undefined,
      details: sanitizeLogInput(event.details, 1000),
      timestamp: new Date().toISOString(),
      resolved: false
    };

    await addDoc(collection(db, 'security_events'), securityEvent);
    console.log('Security event logged:', event.type, event.severity);
  } catch (error) {
    console.error('Error logging security event:', error);
    // Don't throw error to prevent interrupting normal flow
  }
};

// Get recent security events with filtering
export const getSecurityEvents = async (
  limitCount: number = 50,
  severity?: string,
  type?: string
): Promise<SecurityEvent[]> => {
  try {
    // Validate inputs
    const sanitizedLimit = Math.min(Math.max(1, Number(limitCount) || 50), 100);
    
    let q = query(
      collection(db, 'security_events'),
      orderBy('timestamp', 'desc'),
      limit(sanitizedLimit)
    );
    
    // Add filters if provided
    if (severity && ['low', 'medium', 'high', 'critical'].includes(severity)) {
      q = query(q, where('severity', '==', severity));
    }
    
    if (type && ['login_attempt', 'admin_registration', 'permission_denied', 'rate_limit_exceeded', 'suspicious_activity'].includes(type)) {
      q = query(q, where('type', '==', type));
    }
    
    const querySnapshot = await getDocs(q);
    const events: SecurityEvent[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Validate data integrity
      if (data.type && data.severity && data.details && data.timestamp) {
        events.push({
          id: doc.id,
          type: data.type,
          severity: data.severity,
          email: data.email,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          details: data.details,
          timestamp: data.timestamp,
          resolved: data.resolved || false
        } as SecurityEvent);
      }
    });
    
    return events;
  } catch (error) {
    console.error('Error getting security events:', error);
    return [];
  }
};

// Enhanced threat detection patterns
export const detectSuspiciousActivity = (
  email: string,
  ipAddress?: string,
  userAgent?: string
): { isSuspicious: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  
  // Check for suspicious email patterns
  if (email) {
    const suspiciousEmailPatterns = [
      /admin/i,
      /test/i,
      /temp/i,
      /throwaway/i,
      /10minutemail/i,
      /guerrillamail/i
    ];
    
    if (suspiciousEmailPatterns.some(pattern => pattern.test(email))) {
      reasons.push('Suspicious email pattern detected');
    }
  }
  
  // Check for suspicious user agents
  if (userAgent) {
    const suspiciousUAPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i
    ];
    
    if (suspiciousUAPatterns.some(pattern => pattern.test(userAgent))) {
      reasons.push('Suspicious user agent detected');
    }
  }
  
  // Check for empty or malformed user agents
  if (!userAgent || userAgent.length < 10) {
    reasons.push('Missing or suspicious user agent');
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons
  };
};

// Security metrics calculation
export const getSecurityMetrics = async (): Promise<{
  totalEvents: number;
  criticalEvents: number;
  recentEvents: number;
  topThreats: Array<{ type: string; count: number }>;
}> => {
  try {
    const events = await getSecurityEvents(1000); // Get more events for metrics
    
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentEvents = events.filter(event => 
      new Date(event.timestamp).getTime() > last24Hours
    ).length;
    
    const criticalEvents = events.filter(event => 
      event.severity === 'critical'
    ).length;
    
    // Count threats by type
    const threatCounts = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topThreats = Object.entries(threatCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalEvents: events.length,
      criticalEvents,
      recentEvents,
      topThreats
    };
  } catch (error) {
    console.error('Error calculating security metrics:', error);
    return {
      totalEvents: 0,
      criticalEvents: 0,
      recentEvents: 0,
      topThreats: []
    };
  }
};
