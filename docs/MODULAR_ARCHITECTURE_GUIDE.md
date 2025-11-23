# Modular Architecture Guide

**Purpose:** Establish separation of concerns patterns for all new components and refactoring work.

---

## Core Principles

### 1. Single Responsibility
Each file/module should have ONE clear purpose:
- **Data Layer:** Hooks for Supabase operations
- **Business Logic:** Calculations, transformations, validations
- **UI Layer:** React components for rendering
- **Utilities:** Shared helpers, formatters, constants

---

## Mandatory Separation Patterns

### Pattern 1: Data Fetching (Hooks)

**Location:** `src/hooks/`

**Structure:**
```typescript
// src/hooks/useResource.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useResource = (id?: string) => {
  const [data, setData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    // Supabase query logic only
  };

  const addResource = async (data: ResourceData) => {
    // Supabase insert logic only
  };

  return { data, loading, error, addResource, refetch: fetchData };
};
```

**Rules:**
- Hooks ONLY handle Supabase operations
- No business logic (calculations, transformations)
- No UI logic (toasts, navigation)
- Return raw data + CRUD operations

---

### Pattern 2: Business Logic (Game Logic Hooks)

**Location:** `src/hooks/`

**Structure:**
```typescript
// src/hooks/useFocusGame.ts
export const useFocusGame = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [trials, setTrials] = useState<Trial[]>([]);
  
  const startGame = () => {
    // Game initialization logic
  };
  
  const handleClick = (isCorrect: boolean) => {
    // Game state transitions
    // Score calculations
  };
  
  const calculateResults = () => {
    // Aggregate calculations
    // Return structured results
  };
  
  return { gameState, trials, startGame, handleClick, calculateResults };
};
```

**Rules:**
- Contains game-specific logic
- No Supabase calls (use data hooks instead)
- No UI rendering
- Pure functions for calculations

---

### Pattern 3: Report Generation (Utilities)

**Location:** `src/utils/reports/`

**Structure:**
```typescript
// src/utils/reports/focusGameReport.ts
export interface FocusGameResults {
  trials: Trial[];
  medianRT: number;
  accuracy: number;
  // ... all metrics
}

export const calculateFocusMetrics = (trials: Trial[]): FocusGameResults => {
  // Pure calculation logic
  // No side effects
};

export const formatAthleteReport = (results: FocusGameResults) => {
  return {
    summary: "...",
    metrics: [...],
    interpretation: "..."
  };
};

export const formatCoachReport = (results: FocusGameResults) => {
  return {
    rawData: [...],
    aggregates: {...},
    charts: {...}
  };
};
```

**Rules:**
- Pure functions only
- No React dependencies
- No Supabase calls
- Testable in isolation

---

### Pattern 4: Chart Configuration (Utilities)

**Location:** `src/utils/charts/`

**Structure:**
```typescript
// src/utils/charts/focusChartConfig.ts
import { ChartConfig } from '@/types/charts';

export const getFocusReactionTimeChartConfig = (data: any[]): ChartConfig => {
  return {
    data,
    xAxis: { dataKey: 'trial', label: 'Próba' },
    yAxis: { label: 'Czas reakcji (ms)' },
    lines: [
      { dataKey: 'congruentRT', stroke: 'hsl(var(--chart-2))' },
      { dataKey: 'incongruentRT', stroke: 'hsl(var(--chart-3))' }
    ]
  };
};
```

**Rules:**
- Chart configurations separate from components
- Reusable across athlete/coach reports
- No data transformation (do that in report utils)

---

### Pattern 5: Form Handling (Components + Hooks)

**Location:** `src/components/forms/`, `src/hooks/useForm*.ts`

**Structure:**
```typescript
// src/hooks/useClubForm.ts
export const useClubForm = (clubId?: string) => {
  const { clubs, updateClub } = useClubs();
  const [formData, setFormData] = useState<ClubFormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  
  const validate = () => {
    // Validation logic
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    await updateClub(clubId, formData);
  };
  
  return { formData, setFormData, errors, handleSubmit };
};

// Component only renders UI
const ClubForm = () => {
  const { formData, setFormData, errors, handleSubmit } = useClubForm();
  return <form>...</form>;
};
```

**Rules:**
- Form state management in hooks
- Validation logic separate from rendering
- Component only handles UI rendering

---

### Pattern 6: UI Components (Pure Presentation)

**Location:** `src/components/`, `src/pages/`

**Structure:**
```typescript
// src/pages/FocusGame.tsx
const FocusGame = ({ athleteId, mode }: Props) => {
  // Import hooks
  const { gameState, trials, startGame, handleClick } = useFocusGame();
  const { addTraining } = useTrainings(athleteId);
  const { isLibrary, isMeasurement } = determineGameContext(athleteId, mode);
  
  // Event handlers that delegate to hooks
  const handleGameStart = () => startGame();
  
  const handleGameComplete = async () => {
    const results = calculateResults();
    if (isMeasurement) {
      await addTraining({ results });
    }
  };
  
  // Pure rendering
  return (
    <div>
      {gameState === 'idle' && <Button onClick={handleGameStart}>Start</Button>}
      {gameState === 'playing' && <GameGrid trials={trials} onClick={handleClick} />}
      {gameState === 'complete' && <FocusGameReport results={results} />}
    </div>
  );
};
```

**Rules:**
- Components ONLY render UI
- Delegate all logic to hooks/utilities
- Event handlers are thin wrappers
- No inline business logic

---

## Refactoring Checklist

When refactoring existing components:

### Step 1: Extract Data Layer
- [ ] Move all Supabase calls to hooks
- [ ] Replace localStorage with Supabase hooks
- [ ] Ensure hooks return { data, loading, error, operations }

### Step 2: Extract Business Logic
- [ ] Identify game logic, calculations, validations
- [ ] Move to dedicated hook (useGameLogic) or utility
- [ ] Ensure pure functions with no side effects

### Step 3: Extract Report Generation
- [ ] Create report utility functions
- [ ] Separate athlete vs coach report logic
- [ ] Move chart configurations to utilities

### Step 4: Extract Form Handling
- [ ] Create form state management hook
- [ ] Move validation logic to hook
- [ ] Component only renders form UI

### Step 5: Simplify Component
- [ ] Component imports hooks
- [ ] Component delegates to hooks/utilities
- [ ] Component focuses on rendering

---

## File Organization

```
src/
├── hooks/
│   ├── useAthletes.ts          # Data fetching
│   ├── useFocusGame.ts         # Game logic
│   └── useClubForm.ts          # Form logic
├── utils/
│   ├── reports/
│   │   ├── focusGameReport.ts  # Report generation
│   │   └── scanGameReport.ts
│   ├── charts/
│   │   ├── focusCharts.ts      # Chart configs
│   │   └── scanCharts.ts
│   └── gameContext.ts          # Shared utilities
├── components/
│   ├── game-shared/
│   │   ├── HRVInputFields.tsx  # Shared UI
│   │   └── GameResultsButtons.tsx
│   ├── reports/
│   │   ├── FocusGameReport.tsx # Report UI
│   │   └── ScanGameReport.tsx
│   └── forms/
│       └── ClubForm.tsx        # Form UI
└── pages/
    ├── FocusGame.tsx           # Game page (thin)
    └── ScanGame.tsx
```

---

## Anti-Patterns to Avoid

### ❌ Inline Business Logic
```typescript
// BAD
const handleClick = () => {
  const newScore = score + (isCorrect ? 10 : -5);
  setScore(newScore);
  if (newScore > 100) {
    setGameState('won');
  }
};
```

### ✅ Delegated Business Logic
```typescript
// GOOD
const { handleClick } = useFocusGame();
```

---

### ❌ Supabase Calls in Components
```typescript
// BAD
const handleSave = async () => {
  const { data, error } = await supabase.from('sessions').insert({...});
};
```

### ✅ Hook-Based Data Operations
```typescript
// GOOD
const { addSession } = useSessions();
const handleSave = async () => {
  await addSession({...});
};
```

---

### ❌ Chart Config in Components
```typescript
// BAD
<LineChart data={trials}>
  <XAxis dataKey="index" />
  <YAxis />
  <Line dataKey="rt" stroke="#8884d8" />
</LineChart>
```

### ✅ Extracted Chart Config
```typescript
// GOOD
const chartConfig = getFocusRTChartConfig(trials);
<ResponsiveChart config={chartConfig} />
```

---

## Enforcement

All new components MUST follow this guide.  
All refactoring MUST implement these patterns.

**Review Required:** Any PR with:
- Supabase calls in components
- Business logic in render functions
- Chart configs inline
- Form logic in UI components

---

**Last Updated:** 2025-11-23
