// js/transactions.js
import { supabase } from './supabaseClient.js';
import { showAlert } from './utils.js';
import { closeModal, openModal, openDeleteConfirmModal } from './modals.js';

const TRANSACTIONS_TABLE = 'deals';

export async function renderTransactionsApp() { /* ... Twoja logika ... */ }
export function refreshTransactionModuleProcessSelects() { /* ... Twoja logika ... */ }
export async function getDealsData() { /* ... implementacja z poprzedniej odpowiedzi ... */ }
export async function addDeal(deal) { /* ... implementacja z poprzedniej odpowiedzi ... */ }
export async function updateDeal(id, updates) { /* ... implementacja ... */ }
export async function getDealById(id) { /* ... implementacja ... */ }

async function handleTransactionFormSubmit(event) {
    event.preventDefault(); // KLUCZOWE
    const formElement = event.target;
    // ... Twoja logika zbierania danych i zapisu ...
    // Mapuj na nazwy kolumn: name, value, sales_process_id, transaction_stage_id, status, contact_id, company_id, closing_date, description
}

function attachActionListenersToTransactionsTable() { /* ... Implementacja podobna do contacts.js ... */ }

export function initTransactionsModule() {
    console.log("Transactions module initialized.");
    const form = document.getElementById('transactionForm');
    if (form) {
        form.removeEventListener('submit', handleTransactionFormSubmit);
        form.addEventListener('submit', handleTransactionFormSubmit);
    } else { console.warn("transactions.js: Formularz 'transactionForm' nie znaleziony."); }

    const openButton = document.getElementById('openTransactionFormModalButton');
    // ... reszta logiki podpinania przycisku otwierania modala ...
}
