
import { useState, useEffect } from 'react';
import { CheckCircle, CloudOff, Loader2, AlertCircle } from 'lucide-react';

const SyncStatusIndicator = () => {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Check for pending updates
    const checkPendingUpdates = () => {
      const pending = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
      setPendingCount(pending.length);
      
      if (pending.length > 0) {
        setSyncStatus('offline');
      } else if (navigator.onLine) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    };

    // Check initially
    checkPendingUpdates();

    // Listen for storage changes (updates from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pendingUpdates') {
        checkPendingUpdates();
      }
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setSyncStatus('syncing');
      setTimeout(() => {
        checkPendingUpdates();
      }, 1000);
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check
    const interval = setInterval(checkPendingUpdates, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getStatusInfo = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          icon: CheckCircle,
          text: 'All changes saved',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'syncing':
        return {
          icon: Loader2,
          text: 'Saving changes...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          animate: true
        };
      case 'offline':
        return {
          icon: CloudOff,
          text: pendingCount > 0 ? `${pendingCount} changes pending` : 'Offline',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Sync error',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
    }
  };

  const { icon: Icon, text, color, bgColor, animate } = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}>
      <Icon className={`h-3 w-3 ${animate ? 'animate-spin' : ''}`} />
      <span>{text}</span>
    </div>
  );
};

export default SyncStatusIndicator;
