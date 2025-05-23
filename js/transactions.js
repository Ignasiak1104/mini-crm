import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Upewnij się, że poniższe dane są poprawne dla Twojego projektu Supabase
const supabaseUrl = 'https://acwseeemqkmwxncektfz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3NlZWVtcWttd3huY2VrdGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTY2MDEsImV4cCI6MjA2MzQ5MjYwMX0.y8pPbzsgIkpEl6CHNYpBS2lRdx5DB6A7DupAcyjksvs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Zakładam, że tabela transakcji nazywa się 'deals'. Jeśli inaczej, zmień poniżej.
const TRANSACTIONS_TABLE = 'deals';

export async function getDealsData() { // Nazwa funkcji może pozostać, ale odnosi się do transakcji
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).select('*');
    if (error) { console.error('Błąd pobierania transakcji:', error); return []; }
    return data;
}

export async function addDeal(deal) { // Nazwa funkcji może pozostać
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).insert([deal]).select(); // Dodano .select()
    if (error) { console.error('Błąd dodawania transakcji:', error); return null; }
    return data ? data[0] : null;
}
export async function getDealById(id) { // Nazwa funkcji może pozostać
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).select('*').eq('id', id).single();
    if (error) { console.error('Błąd pobierania transakcji po ID:', error); return null; }
    return data;
}

export async function updateDeal(id, updates) { // Nazwa funkcji może pozostać
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).update(updates).eq('id', id).select(); // Dodano .select()
    if (error) {
        console.error('Błąd aktualizacji transakcji:', error);
        return null;
    }
    return data ? data[0] : null;
}

// Dodano funkcję usuwania transakcji, jeśli potrzebna
export async function deleteDeal(id) {
    const { error } = await supabase.from(TRANSACTIONS_TABLE).delete().eq('id', id);
    if (error) {
        console.error('Błąd usuwania transakcji:', error);
        return { success: false, error };
    }
    return { success: true };
}

// Funkcje pomocnicze do pobierania danych dla formularza transakcji
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
        .order('order_index', { ascending: true }); // Zakładając, że masz kolumnę 'order_index'
    if (error) {
        console.error("Błąd pobierania etapów transakcji:", error);
        return [];
    }
    return data;
}
