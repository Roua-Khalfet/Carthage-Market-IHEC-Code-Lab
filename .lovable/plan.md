

## Fix: Market Data Table Not Displaying Data

### Problem Identified
The market data table shows empty because of a race condition between the initial data query and the auto-scrape logic:

1. The `useMarketData` query runs and returns `[]` (empty or stale cache)
2. The auto-scrape fires, but the edge function returns `cached: true` (data is fresh)
3. When `cached: true`, the code does NOT call `invalidateQueries`, so the UI stays empty
4. The user sees "Aucune donnee" even though the database has 71 rows

### Solution

**File: `src/hooks/useMarketData.ts`**

Invalidate the query cache after **every** successful scrape call, not just when new data is inserted. This ensures the UI always re-fetches from the database regardless of whether the scrape was cached or not.

```text
Current logic:
  if (data?.cached) {
    toast(...) // no invalidateQueries!
  } else {
    toast(...)
    queryClient.invalidateQueries(...)  // only here
  }

Fixed logic:
  if (data?.cached) {
    toast(...)
  } else {
    toast(...)
  }
  // ALWAYS invalidate to ensure UI has latest data
  queryClient.invalidateQueries({ queryKey: ["stock-market-data"] })
```

This is a one-line move -- move the `invalidateQueries` call outside the if/else block so it always runs after a successful scrape invocation.

### Technical Details

- **Root cause**: The `invalidateQueries` call is only inside the `else` branch (non-cached), so when the edge function says "data is fresh", the frontend never re-reads the database
- **Impact**: Single line change in `src/hooks/useMarketData.ts`
- **No edge function changes needed**: The scraper and database are working correctly (71 rows present)

