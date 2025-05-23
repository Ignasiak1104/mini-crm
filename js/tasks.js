import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Upewnij się, że poniższe dane są poprawne dla Twojego projektu Supabase
const supabaseUrl = 'https://acwseeemqkmwxncektfz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3NlZWVtcWttd3huY2VrdGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTY2MDEsImV4cCI6MjA2MzQ5MjYwMX0.y8pPbzsgIkpEl6CHNYpBS2lRdx5DB6A7DupAcyjksvs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funkcje renderujące i pomocnicze dla zadań
export function renderTasks() {
    console.log("renderTasks called - implementacja tej funkcji jest w Twoim oryginalnym kodzie");
    // Logika renderowania zadań
}

export async function getTasksData() {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Błąd pobierania zadań:', error); return []; }
    return data;
}

export async function addTask(task) {
    const { data, error } = await supabase.from('tasks').insert([task]).select();
    if (error) { console.error('Błąd dodawania zadania:', error); return null; }
    return data ? data[0] : null;
}
export async function updateTask(id, updates) {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select();
    if (error) {
        console.error('Błąd aktualizacji zadania:', error);
        return null;
    }
    return data ? data[0] : null;
}

export async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
        console.error('Błąd usuwania zadania:', error);
        return { success: false, error };
    }
    return { success: true };
}

// Dodana funkcja inicjalizacyjna, której oczekuje main.js
export function initTasksModule() {
    console.log("Tasks module initialized.");
    // Logika inicjalizacyjna dla modułu zadań
}
