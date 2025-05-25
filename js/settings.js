// js/settings.js
import { supabase } from './supabaseClient.js';
import { showAlert } from './utils.js';
import { openDeleteConfirmModal } from './modals.js'; // Dla usuwania procesów, etapów, pól

// --- Zarządzanie Procesami Sprzedaży ---
async function renderSalesProcesses() {
    console.log("renderSalesProcesses - Zaimplementuj logikę wyświetlania listy procesów");
    const listElement = document.getElementById('salesProcessesList');
    const noItemsMessage = document.getElementById('noSalesProcessesMessage');
    if (!listElement || !noItemsMessage) return;

    // TODO: Pobierz procesy z Supabase (tabela sales_processes)
    // const { data: processes, error } = await supabase.from('sales_processes').select('*');
    // if (error) { showAlert('Błąd ładowania procesów.', 'danger'); return; }
    const processes = []; // Placeholder

    listElement.innerHTML = '';
    if (processes.length === 0) {
        noItemsMessage.classList.remove('hidden');
    } else {
        noItemsMessage.classList.add('hidden');
        processes.forEach(process => {
            const li = document.createElement('li');
            // TODO: Wyświetl nazwę procesu i przyciski Edytuj/Usuń
            listElement.appendChild(li);
        });
    }
    // TODO: Podepnij listenery do przycisków Edytuj/Usuń dla procesów
}

async function handleSalesProcessFormSubmit(event) {
    event.preventDefault();
    const formElement = event.target;
    const processName = formElement.salesProcessName.value;
    const processId = formElement.salesProcessId.value; // Dla edycji
    const isEditing = Boolean(processId);

    if (!processName.trim()) {
        if(showAlert) showAlert("Nazwa procesu nie może być pusta.", "danger");
        return;
    }
    console.log(`Zapisuję proces: ${processName}, ID: ${processId || 'Nowy'}, Edycja: ${isEditing}`);
    // TODO: Logika zapisu do Supabase (addSalesProcess / updateSalesProcess)
    // const operation = isEditing ? supabase.from('sales_processes').update({ name: processName, description: ''}).eq('id', processId) : supabase.from('sales_processes').insert([{ name: processName, description: '' }]);
    // const {data, error} = await operation.select();
    // if (error) { showAlert(...) } else { showAlert(...); formElement.reset(); renderSalesProcesses(); refreshTransactionModuleProcessSelects(); /* z main.js, jeśli jest globalna */ }
    if(showAlert) showAlert("Logika zapisu procesu sprzedaży do zaimplementowania.", "info");
}

// --- Zarządzanie Etapami Kanban (Transaction Stages) ---
// TODO: Funkcje renderTransactionStagesList, handleTransactionStageFormSubmit, loadProcessesIntoSelectForStages

// --- Zarządzanie Polami Niestandardowymi (Kontakty i Firmy) ---
// TODO: Funkcje renderCustomContactFields, handleCustomContactFieldFormSubmit
// TODO: Funkcje renderCustomCompanyFields, handleCustomCompanyFieldFormSubmit

// --- Zarządzanie Widocznością Pól ---
// TODO: Funkcje do renderowania przełączników widoczności i zapisywania ustawień (np. w localStorage)


export function initSettingsModule() {
    console.log("Settings module initialized.");

    const salesProcessForm = document.getElementById('salesProcessForm');
    if (salesProcessForm) {
        salesProcessForm.removeEventListener('submit', handleSalesProcessFormSubmit);
        salesProcessForm.addEventListener('submit', handleSalesProcessFormSubmit);
    } else {
        console.warn("settings.js: Formularz 'salesProcessForm' nie znaleziony.");
    }

    // Podpinanie listenerów do pozostałych formularzy w Ustawieniach
    // const transactionStageForm = document.getElementById('transactionStageForm');
    // if (transactionStageForm) { /* ... listener ... */ }

    // const customContactFieldForm = document.getElementById('customContactFieldForm');
    // if (customContactFieldForm) { /* ... listener ... */ }

    // const customCompanyFieldForm = document.getElementById('customCompanyFieldForm');
    // if (customCompanyFieldForm) { /* ... listener ... */ }

    // Inicjalne renderowanie list przy wejściu do ustawień (jeśli potrzeba)
    // renderSalesProcesses();
    // loadProcessesIntoSelectForStages(); // Załaduj procesy do selecta dla etapów
}
