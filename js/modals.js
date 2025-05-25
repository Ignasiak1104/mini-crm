// js/modals.js
import { supabase } from './supabaseClient.js';
import { showAlert } from './utils.js';

let itemToDeleteInfo = { id: null, type: null, name: '', salesProcessId: null }; // Dodano salesProcessId dla etapów
let confirmDeleteCallback = null;

export function closeModal(modalElement) {
    if (modalElement && modalElement.style) {
        modalElement.style.display = 'none';
    }
}

export function openModal(modalElement) {
    if (modalElement && modalElement.style) {
        modalElement.style.display = 'block';
    }
}

// Zaktualizowano, aby przyjmować dodatkowe info, np. salesProcessId dla etapów transakcji
export function openDeleteConfirmModal(id, type, itemName, callbackOnConfirm, additionalMessage = '', salesProcessId = null) {
    itemToDeleteInfo = { id, type, name: itemName, salesProcessId };
    confirmDeleteCallback = callbackOnConfirm;
    const deleteMessageEl = document.getElementById('deleteMessage');
    const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');

    let msg = `Czy na pewno chcesz usunąć "${itemName || 'ten element'}"?`;
    if (additionalMessage) msg += ` ${additionalMessage}`;

    if (deleteMessageEl) deleteMessageEl.textContent = msg;
    if (deleteConfirmModalEl) openModal(deleteConfirmModalEl);
    else console.error("Modal potwierdzenia usunięcia ('deleteConfirmModal') nie znaleziony w DOM!");
}

async function deleteItemFromSupabase(id, type, salesProcessId) {
    let table = '';
    let itemNameForAlert = '';
    let query = supabase.from(table).delete().eq('id', id);

    switch (type) {
        case 'contact':
            table = 'contacts';
            itemNameForAlert = 'Kontakt';
            break;
        case 'company':
            table = 'companies';
            itemNameForAlert = 'Firma';
            break;
        case 'deal':
        case 'transaction':
            table = 'deals';
            itemNameForAlert = 'Transakcja';
            break;
        case 'task':
            table = 'tasks';
            itemNameForAlert = 'Zadanie';
            break;
        case 'salesProcess':
            table = 'sales_processes';
            itemNameForAlert = 'Proces sprzedaży';
            break;
        case 'transactionStage':
            table = 'transaction_stages';
            itemNameForAlert = 'Etap transakcji';
            // Dodatkowe warunki, jeśli potrzebne, np. usuwanie tylko w ramach konkretnego procesu,
            // chociaż samo ID etapu powinno być unikalne.
            // Jeśli ID etapu nie jest globalnie unikalne, a tylko w ramach procesu, to:
            // query = supabase.from(table).delete().match({ id: id, sales_process_id: salesProcessId });
            break;
        case 'customContactFieldDefinition': // Zmieniono dla spójności z SQL
            table = 'custom_contact_fields_definitions';
            itemNameForAlert = 'Definicja pola niestandardowego kontaktu';
            break;
        case 'customCompanyFieldDefinition': // Zmieniono dla spójności z SQL
            table = 'custom_company_fields_definitions';
            itemNameForAlert = 'Definicja pola niestandardowego firmy';
            break;
        default:
            console.error('Nieobsługiwany typ do usunięcia:', type);
            if(showAlert) showAlert(`Nie można usunąć elementu: nieznany typ "${type}".`, 'danger');
            return { success: false, error: `Nieznany typ: ${type}` };
    }

    // Aktualizacja zapytania po ustaleniu tabeli
    query = supabase.from(table).delete().eq('id', id);
    // Specjalna obsługa dla transactionStage jeśli salesProcessId jest istotny dla unikalności (choć ID powinno wystarczyć)
    if (type === 'transactionStage' && salesProcessId) {
         // Jeśli ID etapu jest unikalne globalnie, to salesProcessId nie jest tu potrzebne.
         // Jeśli ID etapu jest unikalne tylko w ramach procesu, to trzeba by inaczej identyfikować etap,
         // np. przez złożony klucz lub dedykowane pole. Zakładam, że ID jest unikalne.
    }


    const { error } = await query;

    if (error) {
        console.error(`Błąd usuwania (${type} ID: ${id}):`, error);
        if(showAlert) showAlert(`Nie udało się usunąć elementu (${itemNameForAlert}). Błąd: ${error.message}`, 'danger');
        return { success: false, error: error.message };
    } else {
        if(showAlert) showAlert(`${itemNameForAlert} został(a) usunięty/a.`, 'success');
        return { success: true };
    }
}

async function handleConfirmDelete() {
    if (itemToDeleteInfo.id && itemToDeleteInfo.type) {
        const result = await deleteItemFromSupabase(itemToDeleteInfo.id, itemToDeleteInfo.type, itemToDeleteInfo.salesProcessId);
        if (result.success && typeof confirmDeleteCallback === 'function') {
            confirmDeleteCallback(itemToDeleteInfo.id, itemToDeleteInfo.type, itemToDeleteInfo.salesProcessId);
        }
    }
    const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
    if (deleteConfirmModalEl) closeModal(deleteConfirmModalEl);
    itemToDeleteInfo = { id: null, type: null, name: '', salesProcessId: null };
    confirmDeleteCallback = null;
}

export function initModals() {
    console.log("Modals.js: Inicjalizacja obsługi modali...");
    const allModals = document.querySelectorAll('.modal');

    allModals.forEach(modal => {
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                closeModal(modal);
                 if (modal.id === 'deleteConfirmModal') {
                    itemToDeleteInfo = { id: null, type: null, name: '', salesProcessId: null };
                    confirmDeleteCallback = null;
                }
            });
        }
    });

    window.addEventListener('click', (event) => {
        allModals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
                if (modal.id === 'deleteConfirmModal') {
                    itemToDeleteInfo = { id: null, type: null, name: '', salesProcessId: null };
                    confirmDeleteCallback = null;
                }
            }
        });
    });

    const cancelDeleteBtn = document.getElementById('cancelDeleteButton');
    const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
    if (cancelDeleteBtn && deleteConfirmModalEl) {
        cancelDeleteBtn.addEventListener('click', () => {
            closeModal(deleteConfirmModalEl);
            itemToDeleteInfo = { id: null, type: null, name: '', salesProcessId: null };
            confirmDeleteCallback = null;
        });
    }

    const confirmBtn = document.getElementById('confirmDeleteButton');
    if (confirmBtn) {
        confirmBtn.removeEventListener('click', handleConfirmDelete); // Usuń stary listener dla pewności
        confirmBtn.addEventListener('click', handleConfirmDelete);
    } else {
        console.warn("Modals.js: Przycisk 'confirmDeleteButton' nie został znaleziony w DOM.");
    }
    console.log("Modals.js: Obsługa modali zainicjalizowana.");
}
