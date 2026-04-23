import React, { useEffect, useRef } from 'react';

/**
 * Hook for GPS location tracking
 * Sends vendor location updates to server at regular intervals
 */
export function useLocationTracking(bookingId, isActive = false) {
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const lastLocationRef = useRef(null);

  useEffect(() => {
    if (!isActive || !bookingId) return;

    // Start geolocation watching
    const startTracking = async () => {
      try {
        // Check if geolocation is available
        if (!navigator.geolocation) {
          console.error('Geolocation not supported');
          return;
        }

        // Watch position with high accuracy
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const timestamp = new Date().toISOString();

            lastLocationRef.current = {
              coordinates: [longitude, latitude],
              source: accuracy < 50 ? 'GPS' : 'NETWORK',
              accuracy,
              timestamp,
            };

            console.log(
              `[Location] ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (accuracy: ${accuracy.toFixed(0)}m)`
            );
          },
          (error) => {
            console.error('[Location Error]', error.message);
            // Fallback: try to get position once if watch fails
            if (error.code === 1) {
              console.warn('Location permission denied');
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );

        // Send location to server every 10 seconds
        intervalRef.current = setInterval(async () => {
          if (!lastLocationRef.current) return;

          try {
            await fetch(`/api/v1/bookings/${bookingId}/live-location`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                coordinates: lastLocationRef.current.coordinates,
                source: lastLocationRef.current.source,
              }),
            });
          } catch (error) {
            console.error('[Location Upload Error]', error.message);
            // Silently fail - don't disrupt UX
          }
        }, 10000);
      } catch (error) {
        console.error('[Location Tracking Error]', error.message);
      }
    };

    startTracking();

    // Cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, bookingId]);

  return {
    lastLocation: lastLocationRef.current,
    isTracking: isActive && watchIdRef.current !== null,
  };
}

/**
 * Hook for simple one-time location fetch
 */
export function useGetCurrentLocation() {
  const [location, setLocation] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const getLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      return { latitude, longitude };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, getLocation };
}
