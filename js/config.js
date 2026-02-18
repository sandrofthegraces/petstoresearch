// js/config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://uclxbadqwqrfpowmepzg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbHhiYWRxd3FyZnBvd21lcHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDkwNjgsImV4cCI6MjA4Njg4NTA2OH0.VI1I6JB2n9QwueYGDiKebRVIvDVl6kYd0agEw7pdw8I';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);