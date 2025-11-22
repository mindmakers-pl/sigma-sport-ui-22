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
        kwestionariusz: {
          confidence: 8,
          emotionalControl: 7,
          motivation: 9
        },
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
        kwestionariusz: {
          confidence: 7,
          emotionalControl: 6,
          motivation: 8
        },
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
        kwestionariusz: {
          confidence: 9,
          emotionalControl: 8,
          motivation: 9
        },
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
