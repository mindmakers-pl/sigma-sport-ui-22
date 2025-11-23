export interface GameProps {
  athleteId?: string;
  mode?: 'measurement' | 'training';
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
}
