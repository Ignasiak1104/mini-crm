import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Upewnij się, że poniższe dane są poprawne dla Twojego projektu Supabase
const supabaseUrl = 'https://acwseeemqkmwxncektfz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3NlZWVtcWttd3huY2VrdGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTY2MDEsImV4cCI6MjA2MzQ5MjYwMX0.y8pPbzsgIkpEl6CHNYpBS2lRdx5DB6A7DupAcyjksvs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getContactsData() {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) { console.error('Błąd pobierania kontaktów:', error); return []; }
    return data;
}

export async function addContact(contact) {
    const { data, error } = await supabase.from('contacts').insert([contact]).select(); // Dodano .select()
    if (error) { console.error('Błąd dodawania kontaktu:', error); return null; }
    return data ? data[0] : null;
}

export async function updateContact(id, updates) {
    const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select(); // Dodano .select()
    if (error) {
        console.error('Błąd aktualizacji kontaktu:', error);
        return null;
    }
    return data ? data[0] : null;
}

export async function deleteContact(id) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) {
        console.error('Błąd usuwania kontaktu:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function getContactById(id) {
    const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
    if (error) { console.error('Błąd pobierania kontaktu po ID:', error); return null; }
    return data;
}
