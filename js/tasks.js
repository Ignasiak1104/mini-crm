// js/tasks.js
import { supabase } from './supabaseClient.js';
import { showAlert } from './utils.js';

export async function renderTasks() { /* ... Twoja logika ... */ }
export async function getTasksData() { /* ... implementacja z poprzedniej odpowiedzi ... */ }
export async function addTask(task) { /* ... implementacja z poprzedniej odpowiedzi ... */ }
export async function updateTask(id, updates) { /* ... implementacja ... */ }

async function handleTaskFormSubmit(event) {
    event.preventDefault(); // KLUCZOWE
    const formElement = event.target;
    // ... Twoja logika zbierania danych i zapisu ...
    // Mapuj na nazwy kolumn: description, due_date, is_completed
}

function attachActionListenersToTasksList() { /* ... Implementacja podobna do contacts.js ... */ }

export function initTasksModule() {
    console.log("Tasks module initialized.");
    const form = document.getElementById('taskForm');
    if (form) {
        form.removeEventListener('submit', handleTaskFormSubmit);
        form.addEventListener('submit', handleTaskFormSubmit);
    } else { console.warn("tasks.js: Formularz 'taskForm' nie znaleziony."); }
}
