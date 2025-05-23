import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Upewnij się, że poniższe dane są poprawne dla Twojego projektu Supabase
const supabaseUrl = 'https://acwseeemqkmwxncektfz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3NlZWVtcWttd3huY2VrdGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTY2MDEsImV4cCI6MjA2MzQ5MjYwMX0.y8pPbzsgIkpEl6CHNYpBS2lRdx5DB6A7DupAcyjksvs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TRANSACTIONS_TABLE = 'deals'; // Upewnij się, że nazwa tabeli jest poprawna

// Funkcje renderujące i pomocnicze dla transakcji
export function renderTransactionsApp() {
    console.log("renderTransactionsApp called - implementacja tej funkcji jest w Twoim oryginalnym kodzie");
    // Logika renderowania transakcji (lista/kanban)
}

export function refreshTransactionModuleProcessSelects() {
    console.log("refreshTransactionModuleProcessSelects called - implementacja tej funkcji jest w Twoim oryginalnym kodzie");
    // Logika odświeżania selectów z procesami
}


export async function getDealsData() {
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).select('*');
    if (error) { console.error('Błąd pobierania transakcji:', error); return []; }
    return data;
}

export async function addDeal(deal) {
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).insert([deal]).select();
    if (error) { console.error('Błąd dodawania transakcji:', error); return null; }
    return data ? data[0] : null;
}
export async function getDealById(id) {
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).select('*').eq('id', id).single();
    if (error) { console.error('Błąd pobierania transakcji po ID:', error); return null; }
    return data;
}

export async function updateDeal(id, updates) {
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).update(updates).eq('id', id).select();
    if (error) {
        console.error('Błąd aktualizacji transakcji:', error);
        return null;
    }
    return data ? data[0] : null;
}

export async function deleteDeal(id) {
    const { error } = await supabase.from(TRANSACTIONS_TABLE).delete().eq('id', id);
    if (error) {
        console.error('Błąd usuwania transakcji:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function getSalesProcessesForSelect() {
    const { data, error } = await supabase.from('sales_processes').select('id, name');
    if (error) {
        console.error("Błąd pobierania procesów sprzedaży:", error);
        return [];
    }
    return data;
}

export async function getTransactionStagesForSelect(processId) {
    if (!processId) return [];
    const { data, error } = await supabase
        .from('transaction_stages')
        .select('id, name')
        .eq('sales_process_id', processId)
        .order('order_index', { ascending: true });
    if (error) {
        console.error("Błąd pobierania etapów transakcji:", error);
        return [];
    }
    return data;
}

// Dodana funkcja inicjalizacyjna, której oczekuje main.js
export function initTransactionsModule() {
    console.log("Transactions module initialized.");
    // Logika inicjalizacyjna dla modułu transakcji
}
