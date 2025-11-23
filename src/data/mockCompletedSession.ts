// Comprehensive mock session for Sigma Sigma with Six Sigma, Sigma Scan, and Sigma Focus completed
// This demonstrates the full report structure for all three tests

const generateMockTrials = () => {
  const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
  const WORDS = ["CZERWONY", "NIEBIESKI", "ZIELONY", "ŻÓŁTY"];
  const trials = [];
  
  for (let i = 0; i < 80; i++) {
    const isCongruent = i % 2 === 0;
    const colorIndex = Math.floor(Math.random() * 4);
    const color = COLORS[colorIndex];
    const word = isCongruent 
      ? WORDS[colorIndex] 
      : WORDS[(colorIndex + 1 + Math.floor(Math.random() * 3)) % 4];
    
    const baseRT = isCongruent ? 500 : 650;
    const variability = Math.random() * 100;
    const fatigueFactor = i > 60 ? (i - 60) * 2 : 0;
    const reactionTime = Math.round(baseRT + variability + fatigueFactor);
    const isCorrect = Math.random() > 0.08;
    
    trials.push({
      trialId: i + 1,
      type: isCongruent ? 'CONGRUENT' : 'INCONGRUENT',
      stimulusWord: word,
      stimulusColor: color,
      userAction: isCorrect ? color : COLORS[(colorIndex + 1) % 4],
      isCorrect: isCorrect,
      reactionTime: reactionTime,
      timestamp: Date.now() + i * 3000
    });
  }
  
  return trials;
};

const generateMockScanClicks = () => {
  const clicks = [];
  const correctSequence = Array.from({ length: 35 }, (_, i) => i); // 0-34
  const errorClicks = [7, 15, 23]; // Some intentional errors
  
  for (let i = 0; i < 35; i++) {
    clicks.push({
      number: i,
      timestamp: Date.now() + i * 1500,
      isCorrect: true,
      sequencePosition: i
    });
  }
  
  // Add some error clicks
  errorClicks.forEach((num, idx) => {
    clicks.push({
      number: num + 50,
      timestamp: Date.now() + num * 1500 + 500,
      isCorrect: false,
      sequencePosition: -1
    });
  });
  
  return clicks;
};

export const mockCompletedSession = {
  id: `session_completed_${Date.now()}`,
  athlete_id: "999",
  athlete_name: "Sigma Sigma",
  date: new Date().toISOString(),
  conditions: 'gabinet',
  results: {
    // Six Sigma questionnaire results
    six_sigma: {
      version: "6x6+6",
      questionnaireName: "Six Sigma",
      completionDate: new Date().toISOString(),
      completionTimeSeconds: 420,
      competencyScores: [
        { 
          competency: 'activation', 
          name: 'Aktywacja',
          rawScore: 22, 
          maxScore: 30, 
          normalizedScore: 0.73,
          interpretation: 'Dobry'
        },
        { 
          competency: 'control', 
          name: 'Kontrola',
          rawScore: 18, 
          maxScore: 30, 
          normalizedScore: 0.60,
          interpretation: 'Średni'
        },
        { 
          competency: 'reset', 
          name: 'Reset',
          rawScore: 25, 
          maxScore: 30, 
          normalizedScore: 0.83,
          interpretation: 'Wysoki'
        },
        { 
          competency: 'focus', 
          name: 'Focus',
          rawScore: 27, 
          maxScore: 30, 
          normalizedScore: 0.90,
          interpretation: 'Wysoki'
        },
        { 
          competency: 'confidence', 
          name: 'Pewność Siebie',
          rawScore: 20, 
          maxScore: 30, 
          normalizedScore: 0.67,
          interpretation: 'Dobry'
        },
        { 
          competency: 'determination', 
          name: 'Determinacja',
          rawScore: 24, 
          maxScore: 30, 
          normalizedScore: 0.80,
          interpretation: 'Dobry'
        }
      ],
      modifierScores: [
        { modifier: 'sleep', name: 'Sen', rawScore: 4, maxScore: 5, normalizedScore: 0.80, impact: 'positive' },
        { modifier: 'stress', name: 'Stres', rawScore: 3, maxScore: 5, normalizedScore: 0.60, impact: 'neutral' },
        { modifier: 'health', name: 'Zdrowie', rawScore: 5, maxScore: 5, normalizedScore: 1.0, impact: 'positive' },
        { modifier: 'social', name: 'Wsparcie Społeczne', rawScore: 4, maxScore: 5, normalizedScore: 0.80, impact: 'positive' },
        { modifier: 'nutrition', name: 'Odżywianie', rawScore: 3, maxScore: 5, normalizedScore: 0.60, impact: 'neutral' },
        { modifier: 'flow', name: 'Radość z Gry', rawScore: 5, maxScore: 5, normalizedScore: 1.0, impact: 'positive' }
      ],
      overallScore: 0.76,
      validation: {
        isStraightLining: false,
        hasReverseInconsistency: false,
        isValid: true,
        warnings: []
      }
    },
    
    // Sigma Scan results
    scan: {
      scan_max_number_reached: 34,
      scan_duration_s: 60,
      scan_correct_clicks: 35,
      scan_error_clicks: 3,
      scan_skipped_numbers: [12, 28],
      scan_rmssd_ms: 58,
      scan_avg_hr_bpm: 92,
      rawClicks: generateMockScanClicks()
    },
    
    // Sigma Focus results
    focus: {
      interferenceEffect: 65,
      focusScore: 92,
      hrv: '58',
      totalTrials: 80,
      correctCount: 76,
      coachReport: {
        sessionInfo: {
          totalTrials: 80,
          validTrials: 76,
          filteredOut: 4
        },
        playerMetrics: {
          medianRT: 445,
          accuracy: 95,
          bestStreak: 18
        },
        coachMetrics: {
          congruent: {
            medianRT: 420,
            errorRate: 0.05,
            ies: 442,
            validTrials: 38
          },
          incongruent: {
            medianRT: 580,
            errorRate: 0.08,
            ies: 631,
            validTrials: 38
          },
          variability: {
            congruentIQR: 85,
            incongruentIQR: 125
          },
          interferenceCost: {
            rawMs: 160,
            iesDiff: 189
          }
        },
        rawTrials: generateMockTrials()
      },
      rMSSD: "58",
      HR: "92"
    }
  },
  taskStatus: {
    six_sigma: 'completed',
    hrv_baseline: 'pending',
    scan: 'completed',
    control: 'pending',
    focus: 'completed',
    sigma_move: 'pending',
    hrv_training: 'pending'
  },
  inProgress: false
};

export function addMockCompletedSessionToStorage() {
  const sessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
  
  // Check if this specific session already exists
  const existingSession = sessions.find((s: any) => 
    s.athlete_id === "999" && 
    s.results.six_sigma && 
    s.results.scan && 
    s.results.focus
  );
  
  if (!existingSession) {
    sessions.push(mockCompletedSession);
    localStorage.setItem('athlete_sessions', JSON.stringify(sessions));
    console.log('✅ Mock completed session (Six Sigma + Sigma Scan + Sigma Focus) added to storage');
  } else {
    console.log('ℹ️ Mock completed session already exists');
  }
}
