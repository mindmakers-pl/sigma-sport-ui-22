import { allSixSigmaQuestionnaires } from "@/data/sixSigmaQuestionnaires";
import { scoreSixSigma, QuestionnaireResponse } from "@/utils/sixSigmaScoring";

// Generate realistic Six Sigma responses
function generateMockSixSigmaResponses(competenceProfile: Record<string, number>) {
  const fullQuestionnaire = allSixSigmaQuestionnaires[0]; // six_sigma_full
  const moodQuestionnaire = allSixSigmaQuestionnaires[2]; // six_sigma_mood

  // Generate responses based on competence profile
  const fullResponses: QuestionnaireResponse[] = fullQuestionnaire.questions.map(q => {
    const baseScore = competenceProfile[q.competence] || 4;
    const variance = Math.floor(Math.random() * 2) - 1; // -1, 0, or 1
    const value = Math.max(1, Math.min(5, baseScore + variance));
    
    return {
      questionId: q.id,
      value,
      competence: q.competence,
      reversed: q.reversed,
      keyIndicator: q.keyIndicator
    };
  });

  const moodResponses: QuestionnaireResponse[] = moodQuestionnaire.questions.map(q => ({
    questionId: q.id,
    value: Math.floor(Math.random() * 2) + 4, // 4 or 5 - good mood
    competence: q.competence,
    reversed: q.reversed
  }));

  const results = scoreSixSigma(fullResponses, moodResponses, 5);

  return {
    selectedQuestionnaires: ['six_sigma_full', 'six_sigma_mood'],
    responses: {
      six_sigma_full: fullResponses,
      six_sigma_mood: moodResponses
    },
    results
  };
}

// Mock data generator for athlete sessions
export const generateMockSessions = (athleteId: string, athleteName: string) => {
  const sessions = [
    {
      id: `session_${Date.now() - 7 * 24 * 60 * 60 * 1000}`,
      athlete_id: athleteId,
      athlete_name: athleteName,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      conditions: 'pracownia',
      results: {
        questionnaire: generateMockSixSigmaResponses({
          'Aktywacja': 4,
          'Kontrola': 4,
          'Reset': 4,
          'Fokus': 5,
          'Pewność': 4,
          'Determinacja': 5
        }),
        hrv_baseline: {
          hrv: '65'
        },
        scan: {
          avgReactionTime: 450,
          accuracy: 92,
          hrv: '58'
        },
        control: {
          omissionErrors: 2,
          commissionErrors: 1,
          errors: 3,
          hrv: '54'
        },
        focus: {
          interferenceEffect: 85,
          focusScore: 88,
          hrv: '52'
        },
        sigma_move: {
          type: 'Move 1 (Czas)',
          result: '12.5s',
          hrv: '48'
        },
        hrv_training: {
          technique: 'Oddech Rezonansowy',
          duration: '180',
          hrvStart: '45',
          hrvEnd: '68',
          comment: 'Dobra sesja, widoczna poprawa regulacji'
        }
      },
      taskStatus: {
        kwestionariusz: 'completed',
        hrv_baseline: 'completed',
        scan: 'completed',
        control: 'completed',
        focus: 'completed',
        sigma_move: 'completed',
        hrv_training: 'completed'
      }
    },
    {
      id: `session_${Date.now() - 3 * 24 * 60 * 60 * 1000}`,
      athlete_id: athleteId,
      athlete_name: athleteName,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      conditions: 'trening',
      results: {
        questionnaire: generateMockSixSigmaResponses({
          'Aktywacja': 3,
          'Kontrola': 3,
          'Reset': 4,
          'Fokus': 4,
          'Pewność': 3,
          'Determinacja': 4
        }),
        hrv_baseline: {
          hrv: '62'
        },
        scan: {
          avgReactionTime: 520,
          accuracy: 85,
          hrv: '52'
        },
        control: {
          omissionErrors: 4,
          commissionErrors: 3,
          errors: 7,
          hrv: '48'
        },
        focus: {
          interferenceEffect: 120,
          focusScore: 75,
          hrv: '45'
        },
        sigma_move: {
          type: 'Move 2 (Powtórzenia)',
          result: '24 powtórzenia',
          hrv: '42'
        },
        hrv_training: {
          technique: 'Wizualizacja Spokoju',
          duration: '240',
          hrvStart: '38',
          hrvEnd: '58',
          comment: 'Trudniejsze warunki, ale dobra adaptacja'
        }
      },
      taskStatus: {
        kwestionariusz: 'completed',
        hrv_baseline: 'completed',
        scan: 'completed',
        control: 'completed',
        focus: 'completed',
        sigma_move: 'completed',
        hrv_training: 'completed'
      }
    },
    {
      id: `session_${Date.now()}`,
      athlete_id: athleteId,
      athlete_name: athleteName,
      date: new Date().toISOString(),
      conditions: 'pracownia',
      results: {
        questionnaire: generateMockSixSigmaResponses({
          'Aktywacja': 5,
          'Kontrola': 4,
          'Reset': 5,
          'Fokus': 5,
          'Pewność': 5,
          'Determinacja': 5
        }),
        hrv_baseline: {
          hrv: '70'
        },
        scan: {
          avgReactionTime: 410,
          accuracy: 95,
          hrv: '64'
        },
        control: {
          omissionErrors: 1,
          commissionErrors: 0,
          errors: 1,
          hrv: '60'
        },
        focus: {
          interferenceEffect: 65,
          focusScore: 92,
          hrv: '58'
        },
        sigma_move: {
          type: 'Move 3 (% Skuteczność)',
          result: '94%',
          hrv: '55'
        },
        hrv_training: {
          technique: 'Oddech Rezonansowy + Biofeedback',
          duration: '300',
          hrvStart: '52',
          hrvEnd: '75',
          comment: 'Doskonała sesja! Znacząca poprawa we wszystkich obszarach'
        }
      },
      taskStatus: {
        kwestionariusz: 'completed',
        hrv_baseline: 'completed',
        scan: 'completed',
        control: 'completed',
        focus: 'completed',
        sigma_move: 'completed',
        hrv_training: 'completed'
      }
    }
  ];

  return sessions;
};

export const loadMockSessionsToStorage = (athleteId: string, athleteName: string) => {
  const existingSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
  const athleteSessions = existingSessions.filter((s: any) => s.athlete_id === athleteId);
  
  // Only add mock data if no sessions exist for this athlete
  if (athleteSessions.length === 0) {
    const mockSessions = generateMockSessions(athleteId, athleteName);
    const allSessions = [...existingSessions, ...mockSessions];
    localStorage.setItem('athlete_sessions', JSON.stringify(allSessions));
    return mockSessions;
  }
  
  return athleteSessions;
};
