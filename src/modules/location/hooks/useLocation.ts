import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { LocationService } from '../services/LocationService';
import { useLocationStore } from '../store/useLocationStore';

export function useLocation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeLocation = useLocationStore((state) => state.activeLocation);

  // Restore location from URL on mount or URL change
  useEffect(() => {
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');
    
    if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      if (!isNaN(lat) && !isNaN(lon)) {
        // If the store doesn't have it yet, or it's different, restore it
        if (!activeLocation || activeLocation.latitude !== lat || activeLocation.longitude !== lon) {
          LocationService.setLocationFromCoordinates(lat, lon, 'Shared URL');
        }
      }
    } else if (!activeLocation && typeof window !== 'undefined') {
      // If no URL params and no active location, attempt to get browser location
      const hasPrompted = sessionStorage.getItem('zenith_geo_prompted');
      if (!hasPrompted) {
        sessionStorage.setItem('zenith_geo_prompted', 'true');
        LocationService.requestBrowserLocation();
      }
    }
  }, [searchParams]); // purposely omit activeLocation to avoid infinite loops

  // Update URL when active location changes
  useEffect(() => {
    if (activeLocation) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('lat', activeLocation.latitude.toString());
      params.set('lon', activeLocation.longitude.toString());
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [activeLocation, pathname, router]);

  return { activeLocation };
}
