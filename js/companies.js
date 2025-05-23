import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Upewnij się, że poniższe dane są poprawne dla Twojego projektu Supabase
const supabaseUrl = 'https://acwseeemqkmwxncektfz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3NlZWVtcWttd3huY2VrdGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTY2MDEsImV4cCI6MjA2MzQ5MjYwMX0.y8pPbzsgIkpEl6CHNYpBS2lRdx5DB6A7DupAcyjksvs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funkcje renderujące i pomocnicze dla firm
export function renderCompaniesApp() {
    console.log("renderCompaniesApp called - implementacja tej funkcji jest w Twoim oryginalnym kodzie");
    // Logika renderowania firm
}

export async function getCompaniesData() {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) { console.error('Błąd pobierania firm:',error); return []; }
    return data;
}

export async function addCompany(company) {
    const { data, error } = await supabase.from('companies').insert([company]).select();
    if (error) { console.error('Błąd dodawania firmy:', error); return null; }
    return data ? data[0] : null;
}

export async function getCompanyById(id) {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
    if (error) { console.error('Błąd pobierania firmy po ID:', error); return null; }
    return data;
}

// Dodana funkcja inicjalizacyjna, której oczekuje main.js
export function initCompaniesModule() {
    console.log("Companies module initialized.");
    // Logika inicjalizacyjna dla modułu firm
}
