export function determineGameContext(
  athleteId?: string,
  mode?: 'measurement' | 'training'
) {
  const isLibrary = !athleteId;
  const isMeasurement = !!athleteId && mode === 'measurement';
  const isTraining = !!athleteId && mode === 'training';

  return { isLibrary, isMeasurement, isTraining };
}

export function getPostGameNavigation(
  athleteId?: string,
  mode?: 'measurement' | 'training'
): string {
  if (!athleteId) return '/biblioteka?tab=wyzwania';
  if (mode === 'training') return `/zawodnicy/${athleteId}?tab=trening`;
  return `/zawodnicy/${athleteId}?tab=dodaj-pomiar`;
}

export function getGameBackPath(
  athleteId: string | undefined,
  mode?: 'measurement' | 'training',
  isLibrary?: boolean
): string {
  if (isLibrary) return '/biblioteka?tab=wyzwania';
  if (mode === 'training' && athleteId) return `/zawodnicy/${athleteId}?tab=trening`;
  if (mode === 'measurement' && athleteId) return `/zawodnicy/${athleteId}?tab=dodaj-pomiar`;
  return '/biblioteka?tab=wyzwania'; // fallback
}
