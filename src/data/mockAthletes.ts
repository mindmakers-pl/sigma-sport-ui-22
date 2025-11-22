// Mock athlete data for Sigma Sigma
export const sigmaSigmaAthlete = {
  id: 999,
  name: "Sigma Sigma",
  club: "TestLab Academy",
  coach: "Dr. Analytics",
  discipline: "Test Discipline",
  email: "sigma.sigma@testlab.com",
  phone: "+48 999 000 000",
  birthDate: "2005-05-15",
  birthYear: 2005,
  notes: "",
  notesHistory: [],
  parentName: "Parent Test",
  parentPhone: "+48 999 000 001",
  parentEmail: "parent@testlab.com",
  createdAt: "2024-03-20"
};

// Generate realistic mock trial data for SigmaFocus
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
    
    // Realistic RT: congruent ~500-550ms, incongruent ~650-750ms, with some variability
    const baseRT = isCongruent ? 500 : 650;
    const variability = Math.random() * 100;
    const fatigueFactor = i > 60 ? (i - 60) * 2 : 0; // slight slowdown at end
    const reactionTime = Math.round(baseRT + variability + fatigueFactor);
    
    // Occasional errors (~8%)
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

// Mock session for Sigma Sigma with only SigmaFocus completed
export const sigmaSigmaSession = {
  id: `session_sigma_${Date.now()}`,
  athlete_id: "999",
  athlete_name: "Sigma Sigma",
  date: new Date().toISOString(),
  conditions: 'pracownia',
  results: {
    focus: {
      trials: generateMockTrials(),
      medianCongruent: 520,
      medianIncongruent: 680,
      concentrationCost: 160,
      accuracy: 92.5,
      correctCount: 74,
      totalTrials: 80,
      validTrials: 78,
      coachReport: {
        sessionInfo: {
          totalTrials: 80,
          validTrials: 78,
          filteredOut: 2,
          timestamp: new Date().toISOString()
        },
        playerMetrics: {
          accuracy: 92.5,
          medianRT: 595,
          bestStreak: 28
        },
        coachMetrics: {
          congruent: {
            medianRT: 520,
            errorRate: 0.075,
            ies: 562,
            validTrials: 40
          },
          incongruent: {
            medianRT: 680,
            errorRate: 0.100,
            ies: 756,
            validTrials: 38
          },
          variability: {
            congruentIQR: 85,
            incongruentIQR: 125
          },
          interferenceCost: {
            rawMs: 160,
            iesDiff: 194
          }
        },
        rawTrials: generateMockTrials()
      },
      rMSSD: "52",
      HR: "78"
    }
  },
  taskStatus: {
    kwestionariusz: 'pending',
    hrv_baseline: 'pending',
    scan: 'pending',
    control: 'pending',
    focus: 'completed',
    sigma_move: 'pending',
    hrv_training: 'pending'
  },
  inProgress: false
};

export function addSigmaSigmaToStorage() {
  // Add athlete to localStorage
  const existingAthletes = JSON.parse(localStorage.getItem('athletes') || '[]');
  const sigmaExists = existingAthletes.find((a: any) => a.id === 999);
  
  if (!sigmaExists) {
    existingAthletes.push(sigmaSigmaAthlete);
    localStorage.setItem('athletes', JSON.stringify(existingAthletes));
  }
  
  // Add session to localStorage
  const existingSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
  const sessionExists = existingSessions.find((s: any) => s.athlete_id === "999");
  
  if (!sessionExists) {
    existingSessions.push(sigmaSigmaSession);
    localStorage.setItem('athlete_sessions', JSON.stringify(existingSessions));
  }
}
