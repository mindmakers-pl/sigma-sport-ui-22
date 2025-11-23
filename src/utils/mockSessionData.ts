// Mock data generator for athlete sessions
export const generateMockSessions = (athleteId: string, athleteName: string) => {
  // November 22, 2025 session
  const nov22Date = new Date('2025-11-22T14:30:00');
  
  const sessions = [
    {
      id: `session_nov22_2025`,
      athlete_id: athleteId,
      athlete_name: athleteName,
      date: nov22Date.toISOString(),
      conditions: 'pracownia',
      results: {
        six_sigma: {
          version: "6x6+6",
          questionnaireName: "Six Sigma",
          completionDate: nov22Date.toISOString(),
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
                medianRT: 412,
                iqr: 98,
                errorRate: 0.03
              },
              incongruent: {
                medianRT: 477,
                iqr: 112,
                errorRate: 0.08
              },
              interferenceCost: {
                rawMs: 65,
                percentIncrease: 15.8
              }
            },
            rawTrials: []
          }
        }
      },
      taskStatus: {
        six_sigma: 'completed',
        focus: 'completed'
      }
    },
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
  let updated = false;

  // Patch existing sessions for this athlete to ensure Six Sigma is attached to the Nov 22 session
  const patchedSessions = existingSessions.map((s: any) => {
    if (s.athlete_id === athleteId && s.results && s.results.focus && !s.results.six_sigma) {
      // Attach the same Six Sigma block as in generateMockSessions for the focus session
      const nov22 = s.date ? new Date(s.date) : new Date('2025-11-22T14:30:00');
      const sixSigmaBlock = {
        version: "6x6+6",
        questionnaireName: "Six Sigma",
        completionDate: nov22.toISOString(),
        completionTimeSeconds: 420,
        competencyScores: [
          { competency: 'activation', name: 'Aktywacja', rawScore: 22, maxScore: 30, normalizedScore: 0.73, interpretation: 'Dobry' },
          { competency: 'control', name: 'Kontrola', rawScore: 18, maxScore: 30, normalizedScore: 0.60, interpretation: 'Średni' },
          { competency: 'reset', name: 'Reset', rawScore: 25, maxScore: 30, normalizedScore: 0.83, interpretation: 'Wysoki' },
          { competency: 'focus', name: 'Focus', rawScore: 27, maxScore: 30, normalizedScore: 0.90, interpretation: 'Wysoki' },
          { competency: 'confidence', name: 'Pewność Siebie', rawScore: 20, maxScore: 30, normalizedScore: 0.67, interpretation: 'Dobry' },
          { competency: 'determination', name: 'Determinacja', rawScore: 24, maxScore: 30, normalizedScore: 0.80, interpretation: 'Dobry' }
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
        },
        responses: [
          { questionId: 'act_1', questionText: 'Kiedy wychodzę na trening, czuję w ciele energię i gotowość.', competency: 'activation', domain: 'body', isReverse: false, isKeyIndicator: true, value: 4 },
          { questionId: 'act_2', questionText: 'Przed ważnym startem mam nogi jak z waty i czuję się słaby/a.', competency: 'activation', domain: 'body', isReverse: true, isKeyIndicator: false, value: 2 },
          { questionId: 'con_1', questionText: 'Kiedy sędzia podejmie złą decyzję, potrafię zachować spokój i nie dyskutować.', competency: 'control', domain: 'behavior', isReverse: false, isKeyIndicator: true, value: 3 },
          { questionId: 'con_2', questionText: 'Gdy tracę punkt, czuję złość i trudno mi się opanować.', competency: 'control', domain: 'thoughts', isReverse: true, isKeyIndicator: false, value: 3 },
          { questionId: 'res_1', questionText: 'Po błędzie potrafię szybko się otrząsnąć i wrócić do gry.', competency: 'reset', domain: 'behavior', isReverse: false, isKeyIndicator: true, value: 4 },
          { questionId: 'res_2', questionText: 'Gdy popełnię błąd, długo o nim myślę i to mi przeszkadza.', competency: 'reset', domain: 'thoughts', isReverse: true, isKeyIndicator: false, value: 2 },
          { questionId: 'foc_1', questionText: 'Potrafię skupić się na treningu nawet gdy dookoła jest hałas.', competency: 'focus', domain: 'behavior', isReverse: false, isKeyIndicator: true, value: 5 },
          { questionId: 'foc_2', questionText: 'Łatwo się rozpraszam podczas ważnych momentów w meczu.', competency: 'focus', domain: 'thoughts', isReverse: true, isKeyIndicator: false, value: 1 },
          { questionId: 'conf_1', questionText: 'Wierzę, że dam radę wykonać trudne zadanie na treningu.', competency: 'confidence', domain: 'thoughts', isReverse: false, isKeyIndicator: true, value: 3 },
          { questionId: 'conf_2', questionText: 'Przed ważnym meczem martwię się, że zawiodę.', competency: 'confidence', domain: 'thoughts', isReverse: true, isKeyIndicator: false, value: 3 },
          { questionId: 'det_1', questionText: 'Gdy jest ciężko, nie poddaję się i walczę do końca.', competency: 'determination', domain: 'behavior', isReverse: false, isKeyIndicator: true, value: 4 },
          { questionId: 'det_2', questionText: 'Gdy coś mi nie wychodzi, szybko się zniechęcam.', competency: 'determination', domain: 'thoughts', isReverse: true, isKeyIndicator: false, value: 2 }
        ]
      };

      updated = true;
      return {
        ...s,
        results: {
          ...s.results,
          six_sigma: sixSigmaBlock,
        },
        taskStatus: {
          ...s.taskStatus,
          six_sigma: 'completed',
        },
      };
    }
    return s;
  });

  const athleteSessions = patchedSessions.filter((s: any) => s.athlete_id === athleteId);
  
  // Only add mock data if no sessions exist for this athlete
  if (athleteSessions.length === 0) {
    const mockSessions = generateMockSessions(athleteId, athleteName);
    const allSessions = [...patchedSessions, ...mockSessions];
    localStorage.setItem('athlete_sessions', JSON.stringify(allSessions));
    return mockSessions;
  }

  if (updated) {
    localStorage.setItem('athlete_sessions', JSON.stringify(patchedSessions));
  }
  
  return athleteSessions;
};
