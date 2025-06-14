
import { getSecurityClientInfo, detectAnomalies } from './securityClientInfo';
import { SECURITY_CONFIG, SECURITY_EVENTS, SecurityEventType } from './securityConfig';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface SecurityEvent {
  id?: string;
  type: SecurityEventType;
  adminId: string;
  email: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface DeviceProfile {
  adminId: string;
  email: string;
  fingerprint: string;
  firstSeen: string;
  lastSeen: string;
  trustScore: number;
  loginCount: number;
  locations: string[];
}

interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone: string;
}

class AdvancedSecurityMonitor {
  private readonly TRUSTED_DEVICE_THRESHOLD = 5;
  private readonly LOCATION_CHANGE_THRESHOLD = 2;

  async recordSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      await addDoc(collection(db, 'security_events'), securityEvent);
      
      // Auto-escalate critical events
      if (event.severity === 'critical') {
        await this.triggerSecurityAlert(securityEvent);
      }

      console.log(`Security event recorded: ${event.type} (${event.severity})`);
    } catch (error) {
      console.error('Failed to record security event:', error);
    }
  }

  async analyzeLoginAttempt(email: string, success: boolean): Promise<void> {
    try {
      const clientInfo = getSecurityClientInfo();
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      // Check device fingerprint
      await this.analyzeDeviceFingerprint(currentUser.uid, email, clientInfo.fingerprint);

      // Check for geographic anomalies
      await this.analyzeGeographicLocation(currentUser.uid, email, clientInfo.fingerprint.timezone);

      // Check for rapid successive attempts
      await this.analyzeLoginPattern(email, success);

      // Update device profile
      await this.updateDeviceProfile(currentUser.uid, email, clientInfo.fingerprint);

    } catch (error) {
      console.error('Failed to analyze login attempt:', error);
    }
  }

  private async analyzeDeviceFingerprint(adminId: string, email: string, fingerprint: any): Promise<void> {
    try {
      const fingerprintHash = this.hashFingerprint(fingerprint);
      const deviceDoc = await getDoc(doc(db, 'device_profiles', `${adminId}_${fingerprintHash}`));

      if (!deviceDoc.exists()) {
        // New device detected
        await this.recordSecurityEvent({
          type: SECURITY_EVENTS.DEVICE_CHANGE,
          adminId,
          email,
          severity: 'medium',
          details: {
            newDevice: true,
            fingerprint: fingerprintHash,
            deviceInfo: fingerprint
          }
        });
      }
    } catch (error) {
      console.error('Device fingerprint analysis failed:', error);
    }
  }

  private async analyzeGeographicLocation(adminId: string, email: string, timezone: string): Promise<void> {
    try {
      const adminDoc = await getDoc(doc(db, 'admin_profiles', adminId));
      
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const knownTimezones = adminData.knownTimezones || [];

        if (!knownTimezones.includes(timezone) && knownTimezones.length >= this.LOCATION_CHANGE_THRESHOLD) {
          await this.recordSecurityEvent({
            type: SECURITY_EVENTS.LOCATION_ANOMALY,
            adminId,
            email,
            severity: 'high',
            details: {
              newTimezone: timezone,
              knownTimezones,
              suspiciousLocation: true
            }
          });
        }

        // Update known timezones
        const updatedTimezones = [...new Set([...knownTimezones, timezone])];
        await updateDoc(doc(db, 'admin_profiles', adminId), {
          knownTimezones: updatedTimezones.slice(-5) // Keep last 5 locations
        });
      } else {
        // Create new admin profile
        await setDoc(doc(db, 'admin_profiles', adminId), {
          email,
          knownTimezones: [timezone],
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Geographic analysis failed:', error);
    }
  }

  private async analyzeLoginPattern(email: string, success: boolean): Promise<void> {
    try {
      const now = Date.now();
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString();

      const q = query(
        collection(db, 'admin_login_activities'),
        where('email', '==', email),
        where('loginTime', '>=', fiveMinutesAgo),
        orderBy('loginTime', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const recentAttempts = querySnapshot.docs.map(doc => doc.data());

      // Check for rapid successive attempts
      if (recentAttempts.length >= 5) {
        const failedAttempts = recentAttempts.filter(attempt => attempt.status === 'failed');
        
        if (failedAttempts.length >= 3) {
          await this.recordSecurityEvent({
            type: SECURITY_EVENTS.MULTIPLE_FAILURES,
            adminId: '',
            email,
            severity: 'high',
            details: {
              attemptCount: recentAttempts.length,
              failedCount: failedAttempts.length,
              timeWindow: '5 minutes',
              possibleBruteForce: true
            }
          });
        }
      }
    } catch (error) {
      console.error('Login pattern analysis failed:', error);
    }
  }

  private async updateDeviceProfile(adminId: string, email: string, fingerprint: any): Promise<void> {
    try {
      const fingerprintHash = this.hashFingerprint(fingerprint);
      const deviceRef = doc(db, 'device_profiles', `${adminId}_${fingerprintHash}`);
      const deviceDoc = await getDoc(deviceRef);

      const now = new Date().toISOString();

      if (deviceDoc.exists()) {
        const deviceData = deviceDoc.data() as DeviceProfile;
        await updateDoc(deviceRef, {
          lastSeen: now,
          loginCount: deviceData.loginCount + 1,
          trustScore: Math.min(deviceData.trustScore + 0.1, 1.0)
        });
      } else {
        const newDevice: DeviceProfile = {
          adminId,
          email,
          fingerprint: fingerprintHash,
          firstSeen: now,
          lastSeen: now,
          trustScore: 0.1,
          loginCount: 1,
          locations: [fingerprint.timezone]
        };
        await setDoc(deviceRef, newDevice);
      }
    } catch (error) {
      console.error('Device profile update failed:', error);
    }
  }

  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    // In production, this would send alerts to administrators
    console.warn('CRITICAL SECURITY EVENT:', event);
    
    // Log to secure monitoring collection
    try {
      await addDoc(collection(db, 'security_alerts'), {
        ...event,
        alertTriggered: true,
        needsInvestigation: true
      });
    } catch (error) {
      console.error('Failed to trigger security alert:', error);
    }
  }

  private hashFingerprint(fingerprint: any): string {
    const str = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  async getSecurityMetrics(): Promise<any> {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      const q = query(
        collection(db, 'security_events'),
        where('timestamp', '>=', last24Hours)
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return {
        totalEvents: events.length,
        criticalEvents: events.filter(e => e.severity === 'critical').length,
        highSeverityEvents: events.filter(e => e.severity === 'high').length,
        unresolvedEvents: events.filter(e => !e.resolved).length,
        eventsByType: this.groupEventsByType(events),
        last24Hours: events
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return null;
    }
  }

  private groupEventsByType(events: any[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
  }
}

export const advancedSecurityMonitor = new AdvancedSecurityMonitor();
