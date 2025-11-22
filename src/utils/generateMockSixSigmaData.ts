// Generate mock Six Sigma data for Sigma Sigma athlete

import { allSixSigmaQuestionnaires } from "@/data/sixSigmaQuestionnaires";
import { scoreSixSigma, QuestionnaireResponse } from "@/utils/sixSigmaScoring";

export function generateMockSixSigmaSession() {
  // Simulate Full Six Sigma responses for Sigma Sigma
  const fullQuestionnaire = allSixSigmaQuestionnaires[0]; // six_sigma_full
  const moodQuestionnaire = allSixSigmaQuestionnaires[2]; // six_sigma_mood

  // Generate responses - Sigma Sigma has good profile with some realistic variance
  const fullResponses: QuestionnaireResponse[] = fullQuestionnaire.questions.map(q => ({
    questionId: q.id,
    value: Math.random() > 0.7 ? 4 : 5, // Mostly high scores
    competence: q.competence,
    reversed: q.reversed,
    keyIndicator: q.keyIndicator
  }));

  const moodResponses: QuestionnaireResponse[] = moodQuestionnaire.questions.map(q => ({
    questionId: q.id,
    value: Math.floor(Math.random() * 2) + 4, // 4 or 5 - good mood
    competence: q.competence,
    reversed: q.reversed
  }));

  // Calculate scores
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

// Add to existing session in localStorage
export function addSixSigmaToMockSession() {
  const sessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
  const sigmaSession = sessions.find((s: any) => 
    s.athlete_name === 'Sigma Sigma' && s.id.includes('sigma')
  );

  if (sigmaSession) {
    const sixSigmaData = generateMockSixSigmaSession();
    sigmaSession.results.questionnaire = sixSigmaData;
    sigmaSession.taskStatus.kwestionariusz = 'completed';
    localStorage.setItem('athlete_sessions', JSON.stringify(sessions));
    console.log('Six Sigma data dodane do sesji Sigma Sigma:', sixSigmaData);
  }
}
