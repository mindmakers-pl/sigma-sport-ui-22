import { z } from 'zod';

// ============================================
// SIX SIGMA QUESTIONNAIRE RESULT
// ============================================
export const SixSigmaResultSchema = z.object({
  validation: z.object({
    isValid: z.boolean(),
    straightLining: z.boolean(),
    reverseInconsistency: z.boolean(),
    speeding: z.boolean(),
  }),
  competencyScores: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rawScore: z.number(),
    normalizedScore: z.number(),
    interpretation: z.string(),
  })),
  modifierScores: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rawScore: z.number(),
    normalizedScore: z.number(),
    impact: z.enum(['positive', 'neutral', 'negative']),
  })),
  overallScore: z.number(),
  responses: z.array(z.object({
    questionId: z.string(),
    value: z.number(),
  })).optional(),
});

// ============================================
// SCAN GAME RESULT
// ============================================
export const ScanGameResultSchema = z.object({
  scan_max_number_reached: z.number().min(0),
  scan_duration_s: z.number().min(0),
  scan_correct_clicks: z.number().min(0),
  scan_error_clicks: z.number().min(0),
  scan_skipped_numbers: z.array(z.number()).default([]),
  scan_hrv_baseline: z.number().optional(),
  scan_hrv_training: z.number().optional(),
  scan_game_completed_at: z.string().optional(),
});

// ============================================
// FOCUS GAME RESULT
// ============================================
export const FocusGameResultSchema = z.object({
  focus_trials: z.array(z.object({
    type: z.enum(['CONGRUENT', 'INCONGRUENT']),
    isCorrect: z.boolean(),
    rt: z.number().min(0),
    trialNumber: z.number().min(1),
  })),
  focus_median_congruent_ms: z.number().min(0),
  focus_median_incongruent_ms: z.number().min(0),
  focus_accuracy_pct: z.number().min(0).max(100),
  focus_total_trials: z.number().min(0),
  focus_correct_trials: z.number().min(0),
  focus_hrv_baseline: z.number().optional(),
  focus_hrv_training: z.number().optional(),
  focus_game_completed_at: z.string().optional(),
});

// ============================================
// MEMO GAME RESULT
// ============================================
export const MemoGameResultSchema = z.object({
  memo_accuracy_pct: z.number().min(0).max(100),
  memo_median_rt_ms: z.number().min(0),
  memo_total_trials: z.number().min(0),
  memo_correct_responses: z.number().min(0),
  memo_trials: z.array(z.object({
    trial: z.number().min(1),
    rt: z.number().min(0),
    isCorrect: z.boolean(),
    isError: z.boolean().optional(),
  })).optional(),
  memo_hrv_baseline: z.number().optional(),
  memo_hrv_training: z.number().optional(),
  memo_game_completed_at: z.string().optional(),
});

// ============================================
// HRV BASELINE
// ============================================
export const HRVBaselineSchema = z.object({
  hrv_baseline: z.number().min(0),
  hrv_timestamp: z.string(),
  hrv_measurement_duration_s: z.number().optional(),
});

// ============================================
// HRV TRAINING
// ============================================
export const HRVTrainingSchema = z.object({
  hrv_training: z.number().min(0),
  hrv_timestamp: z.string(),
  hrv_measurement_duration_s: z.number().optional(),
});

// ============================================
// SIGMA FEEDBACK FORM
// ============================================
export const SigmaFeedbackSchema = z.object({
  feedback_fatigue: z.number().min(1).max(10),
  feedback_stress: z.number().min(1).max(10),
  feedback_sleep_quality: z.number().min(1).max(10),
  feedback_sleep_hours: z.number().min(0).max(24),
  feedback_mood: z.number().min(1).max(10),
  feedback_notes: z.string().optional(),
  feedback_timestamp: z.string(),
});

// ============================================
// SIGMA MOVE FORM (for physical training)
// ============================================
export const SigmaMoveSchema = z.object({
  move_exercise_type: z.string(),
  move_duration_minutes: z.number().min(0),
  move_intensity: z.number().min(1).max(10),
  move_heart_rate_avg: z.number().min(0).optional(),
  move_heart_rate_max: z.number().min(0).optional(),
  move_notes: z.string().optional(),
  move_timestamp: z.string(),
});

// ============================================
// UNION TYPE FOR ALL SESSION TASKS
// ============================================
export const SessionTaskSchema = z.discriminatedUnion('task_type', [
  z.object({ 
    task_type: z.literal('six_sigma'), 
    task_data: SixSigmaResultSchema 
  }),
  z.object({ 
    task_type: z.literal('scan'), 
    task_data: ScanGameResultSchema 
  }),
  z.object({ 
    task_type: z.literal('focus'), 
    task_data: FocusGameResultSchema 
  }),
  z.object({ 
    task_type: z.literal('memo'), 
    task_data: MemoGameResultSchema 
  }),
  z.object({ 
    task_type: z.literal('hrv_baseline'), 
    task_data: HRVBaselineSchema 
  }),
  z.object({ 
    task_type: z.literal('hrv_training'), 
    task_data: HRVTrainingSchema 
  }),
  z.object({ 
    task_type: z.literal('sigma_feedback'), 
    task_data: SigmaFeedbackSchema 
  }),
  z.object({ 
    task_type: z.literal('sigma_move'), 
    task_data: SigmaMoveSchema 
  }),
]);

// ============================================
// HELPER FUNCTION: VALIDATE TASK DATA
// ============================================
export function validateTaskData(taskType: string, taskData: unknown): {
  success: boolean;
  data?: any;
  error?: string;
} {
  try {
    const validated = SessionTaskSchema.parse({ task_type: taskType, task_data: taskData });
    return { success: true, data: validated.task_data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Validation failed: ${errorMessages}` };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

// ============================================
// TYPE EXPORTS FOR TYPESCRIPT
// ============================================
export type SixSigmaResult = z.infer<typeof SixSigmaResultSchema>;
export type ScanGameResult = z.infer<typeof ScanGameResultSchema>;
export type FocusGameResult = z.infer<typeof FocusGameResultSchema>;
export type MemoGameResult = z.infer<typeof MemoGameResultSchema>;
export type HRVBaseline = z.infer<typeof HRVBaselineSchema>;
export type HRVTraining = z.infer<typeof HRVTrainingSchema>;
export type SigmaFeedback = z.infer<typeof SigmaFeedbackSchema>;
export type SigmaMove = z.infer<typeof SigmaMoveSchema>;
export type SessionTask = z.infer<typeof SessionTaskSchema>;
