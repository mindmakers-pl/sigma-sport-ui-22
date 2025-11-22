// Initialize Sigma Sigma athlete with Six Sigma session data

import { loadMockSessionsToStorage } from "@/utils/mockSessionData";

export function initializeSigmaSigmaData() {
  // Check if Sigma Sigma exists
  const athletes = JSON.parse(localStorage.getItem('athletes') || '[]');
  let sigmaSigma = athletes.find((a: any) => a.name === 'Sigma Sigma');
  
  if (!sigmaSigma) {
    // Create Sigma Sigma athlete
    sigmaSigma = {
      id: 999,
      name: 'Sigma Sigma',
      firstName: 'Sigma',
      lastName: 'Sigma',
      club: 'Sigma Academy',
      coach: 'Test Coach',
      discipline: 'Multi-sport',
      birthYear: 2008,
      birthDate: '2008-01-01',
      gender: 'male',
      email: 'sigma@test.pl',
      phone: '+48 999 999 999',
      parentName: 'Parent Sigma',
      parentPhone: '+48 888 888 888',
      parentEmail: 'parent@test.pl',
      notes: '',
      notesHistory: [],
      createdAt: new Date().toISOString()
    };
    athletes.push(sigmaSigma);
    localStorage.setItem('athletes', JSON.stringify(athletes));
    console.log('Sigma Sigma athlete created');
  }
  
  // Load mock sessions (which now include Six Sigma data)
  loadMockSessionsToStorage('999', 'Sigma Sigma');
  
  console.log('Sigma Sigma initialized with Six Sigma data');
}
