/**
 * Fetch 1x1 stats from database
 * @returns number of 1x1 games completed metered, or 0 on error
 */

import { STATS_DB_COL } from '../config/constants'

export const helperStatsDataRead = async (): Promise<number> => {
  try {
    const url = `https://entorb.net/web-stats-json.php?origin=${STATS_DB_COL}&action=read`
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

export const helperStatsDataWrite = async (): Promise<void> => {
  try {
    const url = `https://entorb.net/web-stats-json.php?origin=${STATS_DB_COL}&action=write`
    await fetch(url)
    // Silently ignore errors - stats are not critical for app functionality
  } catch {
    // Silently ignore errors - stats are not critical for app functionality
  }
}
