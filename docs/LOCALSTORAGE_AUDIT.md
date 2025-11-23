# localStorage Audit & Migration Report

**Generated:** 2025-11-23  
**Status:** Critical migration required

---

## Executive Summary

Found **8 components** using localStorage. **6 require immediate Supabase migration**, 1 is temporary UI state (approved), and 1 needs clarification.

---

## Critical Migration Required

### 1. ❌ AdminPanel.tsx
**localStorage keys:** `trainers`, `athletes`, `clubs`

**Current behavior:**
- Stores trainer accounts (id, email, name, phone, role, createdAt)
- Reads athletes and clubs counts for stats
- Initializes with default trainer: iwan.nylypiuk@mindmakers.pl

**Migration required:**
- Create `trainers` table in Supabase with schema matching localStorage structure
- Migrate to `useTrainers()` hook
- Seed database with Iwan's account during migration
- Update stats to read from Supabase hooks

**Priority:** HIGH (admin functionality broken with localStorage)

---

### 2. ❌ AthletePanel.tsx
**localStorage keys:** `sessions_${athleteId}`

**Current behavior:**
- Loads mock athlete data
- Reads sessions from athlete-specific localStorage key
- Displays session statistics

**Migration required:**
- Remove mock athlete data
- Use `useSessions()` hook with athleteId
- Update session statistics to read from Supabase

**Priority:** HIGH (athlete panel not functional)

---

### 3. ❌ AthleteProfile.tsx (Partial)
**localStorage key:** `current_training`

**Current behavior:**
- Temporarily stores training metadata when user starts training
- Retrieved when training completes to save to Supabase
- Removed after successful save

**Migration required:**
- **Option A:** Create in-memory state or React Context for training workflow
- **Option B:** Use URL state or session storage (non-persistent)
- **Option C:** Create `draft_trainings` table with `is_draft: boolean` flag

**Priority:** MEDIUM (workaround functional, but architectural debt)

---

### 4. ❌ ClubManagement.tsx
**localStorage key:** `clubs`

**Current behavior:**
- Reads club data for editing
- Updates club data (name, city, disciplines, coaches, programs, etc.)
- Saves updated clubs back to localStorage

**Migration required:**
- Component already has `useClubs()` hook imported but not used
- Replace all localStorage.getItem/setItem with `useClubs()` operations
- Update club data structure to match Supabase schema

**Priority:** HIGH (club management non-functional)

---

### 5. ❌ ProgressReport.tsx
**localStorage key:** `athlete_trainings`

**Current behavior:**
- Reads all trainings from localStorage
- Filters by athleteId and gameType
- Generates progress charts and statistics

**Migration required:**
- Use `useTrainings(athleteId)` hook
- Filter by gameType in component logic
- Update data transformation for chart generation

**Priority:** HIGH (progress reports broken)

---

### 6. ❌ SixSigmaReport.tsx
**localStorage keys:** `athlete_sessions`, `athletes`

**Current behavior:**
- Loads session data and performs in-component migration
- Reads athlete data for report metadata
- Saves migrated sessions back to localStorage

**Migration required:**
- Use `useSessions()` and `useAthletes()` hooks
- Remove in-component migration logic (no longer needed with Supabase)
- Update data reading to use Supabase hooks

**Priority:** HIGH (Six Sigma reports broken)

---

## Approved Temporary Usage

### 7. ✅ User Role Management (Multiple Components)
**localStorage key:** `userRole`  
**Components:** SideNav.tsx, TopBar.tsx, AdminPanel.tsx, AthletePanel.tsx, Dashboard.tsx

**Status:** APPROVED per memory `user-management/temporary-role-system-localstorage`

> User roles (admin, coach, viewer) are stored in localStorage as temporary UI state during co-developer phase. This is a conscious interim decision.

**No action required** until authentication is implemented.

---

## Needs Clarification

### 8. ⚠️ Settings.tsx
**localStorage keys:** `userProfile`, `userNotifications`

**Current behavior:**
- Stores user profile (name, email, role, club, notifications)
- Stores notification preferences (email, push, sms toggles)

**Recommendation:**
- **Keep in localStorage** if these are pure UI preferences
- **Migrate to Supabase** if these are user-specific settings that need to persist across devices

**Priority:** LOW (clarify use case with user)

---

## Migration Implementation Plan

### Phase 1: Create Missing Hooks & Tables (2-3 hours)

1. **Create `trainers` table** in Supabase
   ```sql
   CREATE TABLE trainers (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     phone TEXT,
     role TEXT DEFAULT 'trainer',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Create `useTrainers()` hook** following pattern from `useAthletes.ts`

3. **Seed Iwan's account** during migration:
   ```sql
   INSERT INTO trainers (email, name, role) 
   VALUES ('iwan.nylypiuk@mindmakers.pl', 'Iwan Nylypiuk', 'admin');
   ```

---

### Phase 2: Migrate Components (4-5 hours)

**Order of migration:**
1. AdminPanel.tsx (use useTrainers, useAthletes, useClubs)
2. ClubManagement.tsx (use useClubs properly)
3. AthletePanel.tsx (use useSessions, remove mock data)
4. SixSigmaReport.tsx (use useSessions, useAthletes)
5. ProgressReport.tsx (use useTrainings)
6. AthleteProfile.tsx (refactor current_training to Context or session storage)

---

### Phase 3: Verification & Cleanup (1-2 hours)

1. Search for any remaining localStorage usage
2. Test all migrated components
3. Remove localStorage migration code from SixSigmaReport
4. Update documentation

---

## Total Estimated Effort

**7-10 hours** for complete localStorage elimination

---

## Modular Architecture Violations

Found during audit (separate from localStorage issues):

### Monolithic Components
- **AthleteProfile.tsx** (1,902 lines) - Combines measurement wizard, training management, profile editing, reports, notes
- **SixSigmaReport.tsx** (844 lines) - Inline report generation, chart configuration, export logic, validation migration
- **ProgressReport.tsx** (384 lines) - Data transformation, chart generation, export logic all inline

### Separation of Concerns Issues

**SessionWizardNew.tsx:**
- ✅ UI rendering (React components)
- ✅ Data fetching (useSessions, useSessionTasks hooks)
- ❌ Business logic mixed with UI (handleStepComplete has Supabase calls)

**ClubManagement.tsx:**
- ❌ Form handling inline in component
- ❌ Data persistence logic inline
- ❌ No separation between UI and business logic

**SixSigmaReport.tsx:**
- ❌ Report generation inline
- ❌ Chart configuration inline
- ❌ Export logic inline
- ❌ Validation migration logic inline

---

## Recommendations

### Immediate Actions
1. Migrate all localStorage to Supabase (Phase 1 & 2 above)
2. Extract business logic from SessionWizardNew
3. Create shared report generation utilities

### Future Improvements
1. Break down AthleteProfile into smaller components
2. Create dedicated report generators for each game type
3. Centralize chart configurations
4. Create form handling abstractions

---

**Next Steps:** User approval to proceed with Phase 1 & 2 migration
