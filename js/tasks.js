// js/tasks.js
import { supabase } from './supabaseClient.js';
import * as DOM from './domElements.js';
import { showAlert } from './utils.js';
// import { closeModal, openModal } from './modals.js'; // Modale nie są tu bezpośrednio używane dla formularza zadań

// Implementacja renderTasks - MUSISZ JĄ DOSTOSOWAĆ DO SWOICH POTRZEB
export async function renderTasks() {
    console.log("renderTasks called - implementuj logikę wyświetlania zadań");
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
    if (error) { console.error('Błąd aktualizacji zadania:', error); return null; }
    return data ? data[0] : null;
}

export async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { console.error('Błąd usuwania zadania:', error); return { success: false, error }; }
    return { success: true };
}

async function handleTaskFormSubmit(event) {
    event.preventDefault();
    console.log("handleTaskFormSubmit triggered");

    const taskInput = document.getElementById('taskInput');
    const taskDueDateInput = document.getElementById('taskDueDateInput');

    const description = taskInput.value.trim();
    const due_date = taskDueDateInput.value || null;

    if (!description) {
        showAlert('Treść zadania nie może być pusta!', 'danger');
        return;
    }

    try {
        const result = await addTask({
            description,
            due_date,
            is_completed: false // Domyślnie nowe zadanie nie jest ukończone
        });

        if (result) {
            showAlert('Zadanie dodane!', 'success');
            taskInput.value = ''; // Wyczyść pole
            taskDueDateInput.value = ''; // Wyczyść datę
            await renderTasks(); // Odśwież listę
        } else {
            showAlert('Błąd dodawania zadania.', 'danger');
        }
    } catch (error) {
        console.error('Błąd zapisu zadania:', error);
        showAlert(`Błąd: ${error.message}`, 'danger');
    }
}

export function initTasksModule() {
    console.log("Tasks module initialized.");
    if (DOM.taskForm) {
        DOM.taskForm.removeEventListener('submit', handleTaskFormSubmit);
        DOM.taskForm.addEventListener('submit', handleTaskFormSubmit);
        console.log("Event listener dla taskForm podpięty.");
    } else {
        console.warn("Element taskForm nie został znaleziony w DOM podczas initTasksModule.");
    }
}
