/* ── Supabase Client ─────────────────────────────────────────────────────
   Carregado antes de qualquer outro script do projeto.
   Expõe `stDb` como global para todos os módulos.
   Depende de: supabase-js via CDN (UMD).
──────────────────────────────────────────────────────────────────────── */

/* global supabase */
const SUPABASE_URL      = 'https://mbxvigdckqosjnwuwdej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ieHZpZ2Rja3Fvc2pud3V3ZGVqIiwicm9sZSI6' +
  'ImFub24iLCJpYXQiOjE3NzMxNjU3MDAsImV4cCI6MjA4ODc0MTcwMH0.' +
  'DWw3SXrXJmmPaSOt7-4_YKRK9SSMp2ryYbjuJdbvpdU';

const stDb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
