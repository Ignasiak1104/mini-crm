// js/transactions.js
import { supabase } from './supabaseClient.js';
import * as DOM from './domElements.js';
import { showAlert } from './utils.js';
import { closeModal, openModal } from './modals.js';

const TRANSACTIONS_TABLE = 'deals';

// Implementacja renderTransactionsApp - MUSISZ JĄ DOSTOSOWAĆ DO SWOICH POTRZEB
export async function renderTransactionsApp() {
    console.log("renderTransactionsApp called - implementuj logikę wyświetlania transakcji");
    // Logika renderowania transakcji (lista/kanban)
}

// Implementacja refreshTransactionModuleProcessSelects - MUSISZ JĄ DOSTOSOWAĆ DO SWOICH POTRZEB
export function refreshTransactionModuleProcessSelects() {
    console.log("refreshTransactionModuleProcessSelects called - implementuj logikę odświeżania selectów z procesami");
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
    if (error) { console.error('Błąd aktualizacji transakcji:', error); return null; }
    return data ? data[0] : null;
}

export async function deleteDeal(id) {
    const { error } = await supabase.from(TRANSACTIONS_TABLE).delete().eq('id', id);
    if (error) { console.error('Błąd usuwania transakcji:', error); return { success: false, error }; }
    return { success: true };
}

export async function getSalesProcessesForSelect() {
    const { data, error } = await supabase.from('sales_processes').select('id, name');
    if (error) { console.error("Błąd pobierania procesów sprzedaży:", error); return []; }
    return data;
}

export async function getTransactionStagesForSelect(processId) {
    if (!processId) return [];
    const { data, error } = await supabase
        .from('transaction_stages')
        .select('id, name')
        .eq('sales_process_id', processId)
        .order('order_index', { ascending: true });
    if (error) { console.error("Błąd pobierania etapów transakcji:", error); return []; }
    return data;
}

async function handleTransactionFormSubmit(event) {
    event.preventDefault();
    console.log("handleTransactionFormSubmit triggered");
    // Logika dodawania/edycji transakcji
    // Przykład:
    const transactionId = DOM.transactionForm.transactionId.value;
    const isEditing = Boolean(transactionId);
    const transactionData = {
        name: DOM.transactionForm.transactionName.value,
        value: parseFloat(DOM.transactionForm.transactionValue.value),
        sales_process_id: DOM.transactionForm.transactionProcessSelect.value,
        transaction_stage_id: DOM.transactionForm.transactionStageId.value,
        status: DOM.transactionForm.transactionStatus.value, // 'oczekujaca', 'zakonczona', 'anulowana'
        contact_id: DOM.transactionForm.transactionContactId.value || null,
        company_id: DOM.transactionForm.transactionCompanyId.value || null,
        closing_date: DOM.transactionForm.transactionClosingDate.value || null,
        description: DOM.transactionForm.transactionDescription.value,
    };

    try {
        let result;
        if (isEditing) {
            result = await updateDeal(transactionId, transactionData);
        } else {
            result = await addDeal(transactionData);
        }

        if (result) {
            showAlert(isEditing ? 'Transakcja zaktualizowana!' : 'Transakcja dodana!', 'success');
            closeModal(DOM.transactionFormModal);
            DOM.transactionForm.reset();
            document.getElementById('transactionId').value = '';
            await renderTransactionsApp();
        } else {
            showAlert('Błąd zapisu transakcji.', 'danger');
        }
    } catch (error) {
        console.error('Błąd zapisu transakcji:', error);
        showAlert(`Błąd: ${error.message}`, 'danger');
    }
}


export function initTransactionsModule() {
    console.log("Transactions module initialized.");
    if (DOM.transactionForm) {
        DOM.transactionForm.removeEventListener('submit', handleTransactionFormSubmit);
        DOM.transactionForm.addEventListener('submit', handleTransactionFormSubmit);
        console.log("Event listener dla transactionForm podpięty.");
    } else {
        console.warn("Element transactionForm nie został znaleziony w DOM podczas initTransactionsModule.");
    }

    if (DOM.openTransactionFormModalButton) {
        DOM.openTransactionFormModalButton.addEventListener('click', () => {
            document.getElementById('transactionFormModalTitle').textContent = 'Dodaj Nową Transakcję';
            DOM.transactionForm.reset();
            document.getElementById('transactionId').value = '';
            openModal(DOM.transactionFormModal);
            // Tutaj możesz załadować np. procesy sprzedaży do selecta
        });
    }
}
