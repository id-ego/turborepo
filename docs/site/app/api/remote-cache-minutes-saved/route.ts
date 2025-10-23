export const revalidate = 5;

export const pathKey = `https://api.us-east.tinybird.co/v0/pipes/turborepo_time_saved_ticker.json?token=${process.env.TINYBIRD_TIME_SAVED_TOKEN}`;

interface QueryResponse {
  meta: Array<{ name: string; type: string }>;
  data: Array<{
    last_update_time: string;
    remote_cache_minutes_saved: number;
    local_cache_minutes_saved: number;
  }>;
  rows: number;
  statistics: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
}

export interface TurborepoMinutesSaved {
  total: number;
  remoteCacheMinutesSaved: number;
  localCacheMinutesSaved: number;
}

export const getRemoteCacheSavedMinutes =
  async (): Promise<TurborepoMinutesSaved> => {
    // For Korean docs site, always return default values since we don't need analytics
    if (!process.env.TINYBIRD_TIME_SAVED_TOKEN) {
      return {
        total: 100000000,
        remoteCacheMinutesSaved: 50000000,
        localCacheMinutesSaved: 50000000,
      };
    }

    try {
      const raw = await fetch(pathKey).then(
        (res) => res.json() as unknown as QueryResponse
      );

      // Check if data array exists and has at least one element
      if (!raw.data || raw.data.length === 0) {
        return {
          total: 100000000,
          remoteCacheMinutesSaved: 50000000,
          localCacheMinutesSaved: 50000000,
        };
      }

      const data = raw.data[0];

      return {
        total: data.remote_cache_minutes_saved + data.local_cache_minutes_saved,
        remoteCacheMinutesSaved: data.remote_cache_minutes_saved,
        localCacheMinutesSaved: data.local_cache_minutes_saved,
      };
    } catch (error) {
      // Return default values if fetch fails
      console.log(
        "Remote cache API error (not critical for Korean docs):",
        error
      );
      return {
        total: 100000000,
        remoteCacheMinutesSaved: 50000000,
        localCacheMinutesSaved: 50000000,
      };
    }
  };

export const GET = async (): Promise<Response> => {
  return Response.json(await getRemoteCacheSavedMinutes());
};
