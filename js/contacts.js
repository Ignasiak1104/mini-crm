import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Upewnij się, że poniższe dane są poprawne dla Twojego projektu Supabase
const supabaseUrl = 'https://acwseeemqkmwxncektfz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3NlZWVtcWttd3huY2VrdGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTY2MDEsImV4cCI6MjA2MzQ5MjYwMX0.y8pPbzsgIkpEl6CHNYpBS2lRdx5DB6A7DupAcyjksvs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funkcje renderujące i pomocnicze dla kontaktów (zostawiam puste lub z komentarzem, bo nie mam ich pełnej implementacji z Twojego kodu)
export function renderContactsApp() {
    console.log("renderContactsApp called - implementacja tej funkcji jest w Twoim oryginalnym kodzie");
    // Tutaj powinna być logika renderowania tabeli kontaktów, formularzy itp.
    // np. wywołanie getContactsData().then(contacts => { /* ... renderuj tabelę ... */ });
}

export async function getContactsData() {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) { console.error('Błąd pobierania kontaktów:', error); return []; }
    return data;
}

export async function addContact(contact) {
    const { data, error } = await supabase.from('contacts').insert([contact]).select();
    if (error) { console.error('Błąd dodawania kontaktu:', error); return null; }
    return data ? data[0] : null;
}

export async function updateContact(id, updates) {
    const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select();
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

// Dodana funkcja inicjalizacyjna, której oczekuje main.js
export function initContactsModule() {
    console.log("Contacts module initialized.");
    // Tutaj możesz umieścić logikę, która powinna się wykonać raz przy starcie modułu kontaktów,
    // np. podpięcie event listenerów do przycisków specyficznych dla kontaktów,
    // które nie są zarządzane globalnie.
    // Jeśli renderContactsApp() ma być wywoływane tylko przy przejściu do sekcji, to zostaw to puste.
}
