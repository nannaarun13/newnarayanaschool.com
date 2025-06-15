
interface ClientFingerprint {
  userAgent: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  hardwareConcurrency: number;
}

interface SecurityClientInfo {
  fingerprint: ClientFingerprint;
  ipAddress: string;
  timestamp: string;
  sessionId: string;
}

const sanitizeClientData = (data: string, maxLength: number = 200): string => {
  if (!data || typeof data !== 'string') return 'unknown';
  return data
    .replace(/[<>'"&`]/g, '')
    .trim()
    .substring(0, maxLength);
};

export const generateClientFingerprint = (): ClientFingerprint => {
  try {
    return {
      userAgent: sanitizeClientData(navigator.userAgent, 500),
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language || 'unknown',
      platform: sanitizeClientData(navigator.platform),
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 0
    };
  } catch (error) {
    console.error('Error generating client fingerprint:', error);
    return {
      userAgent: 'unknown',
      screen: 'unknown',
      timezone: 'unknown',
      language: 'unknown',
      platform: 'unknown',
      cookieEnabled: false,
      doNotTrack: 'unknown',
      hardwareConcurrency: 0
    };
  }
};

export const getSecurityClientInfo = (): SecurityClientInfo => {
  return {
    fingerprint: generateClientFingerprint(),
    ipAddress: 'client-detected', // Server-side detection recommended
    timestamp: new Date().toISOString(),
    sessionId: generateSessionId()
  };
};

const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${randomPart}`;
};

export const detectAnomalies = (
  currentInfo: SecurityClientInfo, 
  historicalInfo?: SecurityClientInfo[]
): string[] => {
  const anomalies: string[] = [];
  
  if (!historicalInfo || historicalInfo.length === 0) {
    return anomalies;
  }
  
  const lastKnownInfo = historicalInfo[historicalInfo.length - 1];
  
  // Check for significant changes in fingerprint
  if (currentInfo.fingerprint.userAgent !== lastKnownInfo.fingerprint.userAgent) {
    anomalies.push('User agent changed');
  }
  
  if (currentInfo.fingerprint.screen !== lastKnownInfo.fingerprint.screen) {
    anomalies.push('Screen configuration changed');
  }
  
  if (currentInfo.fingerprint.timezone !== lastKnownInfo.fingerprint.timezone) {
    anomalies.push('Timezone changed');
  }
  
  if (currentInfo.fingerprint.platform !== lastKnownInfo.fingerprint.platform) {
    anomalies.push('Platform changed');
  }
  
  return anomalies;
};
