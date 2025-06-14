
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { isDataSynced, forceSyncData } from '@/utils/schoolDataUtils';
import { Button } from '@/components/ui/button';

const SyncStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSynced, setIsSynced] = useState(true);
  const [isForcesyncing, setIsForcesyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check sync status periodically
    const syncInterval = setInterval(() => {
      setIsSynced(isDataSynced());
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  const handleForceSync = async () => {
    setIsForcesyncing(true);
    const success = await forceSyncData();
    setIsForcesyncing(false);
    if (success) {
      setIsSynced(true);
    }
  };

  if (!isOnline) {
    return (
      <Badge variant="destructive" className="flex items-center gap-2">
        <WifiOff className="h-3 w-3" />
        Offline - Changes saved locally
      </Badge>
    );
  }

  if (!isSynced) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-2">
          <CloudOff className="h-3 w-3" />
          Syncing pending
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleForceSync}
          disabled={isForcesyncing}
          className="h-6 px-2 text-xs"
        >
          {isForcesyncing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            'Sync Now'
          )}
        </Button>
      </div>
    );
  }

  return (
    <Badge variant="default" className="flex items-center gap-2 bg-green-600">
      <Cloud className="h-3 w-3" />
      All changes saved
    </Badge>
  );
};

export default SyncStatusIndicator;
