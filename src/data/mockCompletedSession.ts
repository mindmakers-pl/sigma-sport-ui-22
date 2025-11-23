// Comprehensive mock session for Sigma Sigma - realistyczny profil 13-letniego pływaka
// Zawiera: Six Sigma, HRV Baseline, Sigma Scan, Sigma Focus, Sigma Memo, Sigma Feedback

const generateMockTrials = () => {
  const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
  const WORDS = ["CZERWONY", "NIEBIESKI", "ZIELONY", "ŻÓŁTY"];
  const trials = [];
  
  // Realistic 13-year-old swimmer - moderate control, occasional concentration lapses
  for (let i = 0; i < 80; i++) {
    const isCongruent = i % 2 === 0;
    const colorIndex = Math.floor(Math.random() * 4);
    const color = COLORS[colorIndex];
    const word = isCongruent 
      ? WORDS[colorIndex] 
      : WORDS[(colorIndex + 1 + Math.floor(Math.random() * 3)) % 4];
    
    // Swimmer profile: decent baseline RT but higher variability, fatigue after 60 trials
    const baseRT = isCongruent ? 520 : 680;
    const variability = Math.random() * 130; // Higher variability for youth
    const fatigueFactor = i > 60 ? (i - 60) * 3 : 0; // Concentration drops late
    const reactionTime = Math.round(baseRT + variability + fatigueFactor);
    
    // 91% accuracy - some concentration lapses
    const isCorrect = Math.random() > 0.09;
    
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
  const maxReached = 29; // Decent but not exceptional for 13-year-old
  const errorClicks = [8, 14, 22]; // A few mistakes
  
  for (let i = 0; i < maxReached; i++) {
    // Slightly inconsistent timing - faster at start, slower with fatigue
    const baseTiming = 1600;
    const fatigueFactor = i > 15 ? (i - 15) * 40 : 0;
    const timing = baseTiming + Math.random() * 300 + fatigueFactor;
    
    clicks.push({
      number: i,
      timestamp: Date.now() + Math.round(timing * i),
      isCorrect: true,
      sequencePosition: i
    });
  }
  
  // Add error clicks
  errorClicks.forEach((num, idx) => {
    clicks.push({
      number: num + 40,
      timestamp: Date.now() + num * 1600 + 600,
      isCorrect: false,
      sequencePosition: -1
    });
  });
  
  return clicks;
};

const generateMockMemoTrials = () => {
  const trials = [];
  const totalTrials = 22;
  const sequence: number[] = [];
  
  // Generate position sequence
  sequence.push(3, 6); // First two - no targets possible
  
  // Generate rest with targets and lures
  const targetIndices = [2, 4, 6, 8, 10, 12, 14, 16]; // Which trials will be targets
  const lureIndices = [3, 7, 11, 15]; // 1-back lures
  
  for (let i = 2; i < totalTrials; i++) {
    if (targetIndices.includes(i)) {
      sequence.push(sequence[i - 2]); // Target: match 2-back
    } else if (lureIndices.includes(i)) {
      sequence.push(sequence[i - 1]); // Lure: match 1-back
    } else {
      // Random non-matching position
      let pos;
      do {
        pos = Math.floor(Math.random() * 9);
      } while ((i >= 2 && pos === sequence[i - 2]) || (i >= 1 && pos === sequence[i - 1]));
      sequence.push(pos);
    }
  }
  
  // Generate trial results - 83% accuracy (realistic for 13-year-old, some lure confusion)
  for (let i = 2; i < totalTrials; i++) {
    const position = sequence[i];
    const isTarget = sequence[i - 2] === position;
    const isLure = i >= 1 && sequence[i - 1] === position;
    const shouldRespond = isTarget;
    
    // Realistic error pattern: misses some targets, occasionally responds to lures
    let userResponded;
    if (isTarget) {
      userResponded = Math.random() > 0.12; // 88% hit rate
    } else if (isLure) {
      userResponded = Math.random() < 0.20; // 20% false alarm on lures
    } else {
      userResponded = Math.random() < 0.05; // 5% random false alarms
    }
    
    const reactionTime = userResponded ? Math.round(450 + Math.random() * 220) : null;
    
    trials.push({
      trial_index: i,
      position: position,
      is_target: isTarget,
      is_lure: isLure,
      user_responded: userResponded,
      reaction_time_ms: reactionTime,
      correct: userResponded === shouldRespond,
      timestamp: Date.now() + i * 2500
    });
  }
  
  return trials;
};

const calculateMemoMetrics = (trials: any[]) => {
  const hits = trials.filter(t => t.is_target && t.user_responded).length;
  const misses = trials.filter(t => t.is_target && !t.user_responded).length;
  const falseAlarms = trials.filter(t => !t.is_target && t.user_responded).length;
  const correctRejections = trials.filter(t => !t.is_target && !t.user_responded).length;
  
  const accuracy = ((hits + correctRejections) / trials.length) * 100;
  
  const hitRTs = trials
    .filter(t => t.is_target && t.user_responded && t.reaction_time_ms !== null)
    .map(t => t.reaction_time_ms);
  
  const sortedRTs = hitRTs.sort((a, b) => a - b);
  const medianRT = sortedRTs.length > 0 
    ? sortedRTs[Math.floor(sortedRTs.length / 2)] 
    : 0;
  
  // Calculate d-prime
  const hitRate = Math.max(0.01, Math.min(0.99, hits / (hits + misses || 1)));
  const faRate = Math.max(0.01, Math.min(0.99, falseAlarms / (falseAlarms + correctRejections || 1)));
  
  // Inverse normal approximation
  const zHit = hitRate > 0.5 ? 1.15 : 0.85;
  const zFA = faRate > 0.5 ? 0.45 : -0.10;
  const dPrime = zHit - zFA;
  
  return {
    hits,
    misses,
    falseAlarms,
    correctRejections,
    accuracy: Math.round(accuracy),
    medianRT: Math.round(medianRT),
    dPrime: parseFloat(dPrime.toFixed(2)),
    responseBias: -0.08
  };
};

export const mockCompletedSession = {
  id: `session_completed_swimmer_${Date.now()}`,
  athlete_id: "999",
  athlete_name: "Sigma Sigma",
  date: new Date().toISOString(),
  conditions: 'gabinet',
  results: {
    // Six Sigma questionnaire results - profil 13-letniego pływaka
    six_sigma: {
      version: "6x6+6",
      questionnaireName: "Six Sigma",
      completionDate: new Date().toISOString(),
      completionTimeSeconds: 380,
      competencyScores: [
        { 
          competency: 'activation', 
          name: 'Aktywacja',
          rawScore: 20, 
          maxScore: 30, 
          normalizedScore: 0.67,
          interpretation: 'Dobry'
        },
        { 
          competency: 'control', 
          name: 'Kontrola',
          rawScore: 16, 
          maxScore: 30, 
          normalizedScore: 0.53,
          interpretation: 'Średni'
        },
        { 
          competency: 'reset', 
          name: 'Reset',
          rawScore: 19, 
          maxScore: 30, 
          normalizedScore: 0.63,
          interpretation: 'Średni'
        },
        { 
          competency: 'focus', 
          name: 'Focus',
          rawScore: 21, 
          maxScore: 30, 
          normalizedScore: 0.70,
          interpretation: 'Dobry'
        },
        { 
          competency: 'confidence', 
          name: 'Pewność Siebie',
          rawScore: 23, 
          maxScore: 30, 
          normalizedScore: 0.77,
          interpretation: 'Dobry'
        },
        { 
          competency: 'determination', 
          name: 'Determinacja',
          rawScore: 25, 
          maxScore: 30, 
          normalizedScore: 0.83,
          interpretation: 'Wysoki'
        }
      ],
      modifierScores: [
        { modifier: 'sleep', name: 'Sen', rawScore: 3, maxScore: 5, normalizedScore: 0.60, impact: 'neutral' },
        { modifier: 'stress', name: 'Stres', rawScore: 4, maxScore: 5, normalizedScore: 0.80, impact: 'positive' },
        { modifier: 'health', name: 'Zdrowie', rawScore: 4, maxScore: 5, normalizedScore: 0.80, impact: 'positive' },
        { modifier: 'social', name: 'Wsparcie Społeczne', rawScore: 5, maxScore: 5, normalizedScore: 1.0, impact: 'positive' },
        { modifier: 'nutrition', name: 'Odżywianie', rawScore: 3, maxScore: 5, normalizedScore: 0.60, impact: 'neutral' },
        { modifier: 'flow', name: 'Radość z Gry', rawScore: 5, maxScore: 5, normalizedScore: 1.0, impact: 'positive' }
      ],
      overallScore: 0.69,
      validation: {
        isStraightLining: false,
        hasReverseInconsistency: false,
        isValid: true,
        warnings: []
      }
    },
    
    // HRV Baseline
    hrv_baseline: {
      rmssd_baseline: 62,
      hr_baseline: 68,
      measurement_duration_s: 180,
      notes: "Spoczynkowy pomiar w pozycji siedzącej"
    },
    
    // Sigma Scan results
    scan: {
      scan_max_number_reached: 29,
      scan_duration_s: 60,
      scan_correct_clicks: 30,
      scan_error_clicks: 3,
      scan_skipped_numbers: [15, 21],
      scan_rmssd_ms: 54,
      scan_avg_hr_bpm: 95,
      rawClicks: generateMockScanClicks()
    },
    
    // Sigma Focus results
    focus: {
      interferenceEffect: 72,
      focusScore: 89,
      hrv: '52',
      totalTrials: 80,
      correctCount: 73,
      coachReport: {
        sessionInfo: {
          totalTrials: 80,
          validTrials: 73,
          filteredOut: 7
        },
        playerMetrics: {
          medianRT: 485,
          accuracy: 91,
          bestStreak: 14
        },
        coachMetrics: {
          congruent: {
            medianRT: 450,
            errorRate: 0.07,
            ies: 463,
            validTrials: 37
          },
          incongruent: {
            medianRT: 610,
            errorRate: 0.11,
            ies: 685,
            validTrials: 36
          },
          variability: {
            congruentIQR: 95,
            incongruentIQR: 142
          },
          interferenceCost: {
            rawMs: 160,
            iesDiff: 222
          }
        },
        rawTrials: generateMockTrials()
      },
      rMSSD: "52",
      HR: "95"
    },
    
    // Sigma Memo results
    memo: (() => {
      const mockTrials = generateMockMemoTrials();
      const metrics = calculateMemoMetrics(mockTrials);
      return {
        memo_accuracy_pct: metrics.accuracy,
        memo_median_rt_ms: metrics.medianRT,
        memo_hits: metrics.hits,
        memo_misses: metrics.misses,
        memo_false_alarms: metrics.falseAlarms,
        memo_correct_rejections: metrics.correctRejections,
        memo_d_prime: metrics.dPrime,
        memo_response_bias: metrics.responseBias,
        memo_rmssd_ms: 58,
        memo_hr_bpm: 91,
        memo_trials: mockTrials
      };
    })(),
    
    // Sigma Feedback
    feedback: {
      question1: "Mój dzisiejszy wynik w wyzwaniach zależał głównie od...",
      answer1: "Tego, że wczoraj spałem tylko 6 godzin bo oglądałem mecz. W testach na końcu czułem, że mi się myśli gubią. Trening dziś rano był ostry więc też byłem zmęczony.",
      question2: "Gdybym mógł powtórzyć dzisiejszy test, to co zrobił(a)bym inaczej?",
      answer2: "Poszedłbym spać wcześniej i może zrobiłbym jakieś ćwiczenia oddechowe przed testami żeby się bardziej skupić. Trener zawsze mówi żeby się dobrze wyspać przed zawodami.",
      completedAt: new Date().toISOString()
    }
  },
  taskStatus: {
    six_sigma: 'completed',
    hrv_baseline: 'completed',
    scan: 'completed',
    focus: 'completed',
    memo: 'completed',
    feedback: 'completed'
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
    s.results.focus &&
    s.results.memo &&
    s.results.feedback
  );
  
  if (!existingSession) {
    sessions.push(mockCompletedSession);
    localStorage.setItem('athlete_sessions', JSON.stringify(sessions));
    console.log('✅ Mock completed session (Six Sigma + HRV Baseline + Sigma Scan + Sigma Focus + Sigma Memo + Sigma Feedback) added to storage');
  } else {
    console.log('ℹ️ Mock completed session already exists');
  }
}
