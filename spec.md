# Specification

## Summary
**Goal:** Fix duplicate `agent`/`agentOptions` conflict in actor creation that causes 400 errors and profile loading loops.

**Planned changes:**
- Fix actor creation logic so that `agent` and `agentOptions` are never passed simultaneously to `createActor` — use only `agent` when authenticated, only `agentOptions` (or a pre-constructed agent) when anonymous
- Implement the fix via a wrapper or in the calling code rather than modifying `useActor.ts` directly
- Audit `useGetCallerUserProfile.ts` and `App.tsx` to ensure the profile query is gated behind a strict actor readiness check, preventing premature or unauthenticated canister calls

**User-visible outcome:** The app no longer shows 400 errors or gets stuck in a profile loading loop; actor creation and profile fetching work correctly for both authenticated and anonymous users.
