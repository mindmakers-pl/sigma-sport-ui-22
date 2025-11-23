-- Dodaj kolumnę notes_history do tabeli athletes dla historii notatek
ALTER TABLE public.athletes 
ADD COLUMN IF NOT EXISTS notes_history JSONB DEFAULT '[]'::jsonb;

-- Dodaj kolumnę results do tabeli sessions dla wyników sesji pomiarowych
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '{}'::jsonb;

-- Dodaj komentarze dla dokumentacji
COMMENT ON COLUMN public.athletes.notes_history IS 'Historia notatek zawodnika w formacie JSON: [{ text: string, timestamp: string, author?: string }]';
COMMENT ON COLUMN public.sessions.results IS 'Wyniki wszystkich zadań w sesji pomiarowej w formacie JSON';