/**
 * Fetch app stats from database
 * @param basePath - The app identifier (e.g., '1x1', 'wordplay')
 * @returns number of games completed metered, or 0 on error
 */
export const helperStatsDataRead = async (basePath: string): Promise<number> => {
  try {
    const url = `https://entorb.net/web-stats-json.php?origin=${basePath}&action=read`
    const response = await fetch(url)

    if (!response.ok) {
      return 0
    }

    const respData = await response.json()
    if (typeof respData.accesscounts === 'number' && respData.accesscounts >= 0) {
      return respData.accesscounts
    }

    return 0
  } catch {
    // Silently fail - stats are not critical for app functionality
    return 0
  }
}

/**
 * Write app stats to database
 * @param basePath - The app identifier (e.g., '1x1', 'wordplay')
 */
export const helperStatsDataWrite = async (basePath: string): Promise<void> => {
  try {
    const url = `https://entorb.net/web-stats-json.php?origin=${basePath}&action=write`
    await fetch(url)
    // Silently ignore errors - stats are not critical for app functionality
  } catch {
    // Silently ignore errors - stats are not critical for app functionality
  }
}
