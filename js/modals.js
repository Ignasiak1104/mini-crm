import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import * as DOM from './domElements.js';
import { showAlert } from './utils.js'; // Zakładam, że masz plik utils.js z tą funkcją

// Poniższe dane logowania są już wpisane, upewnij się, że są aktualne.
const supabase = createClient(
    'https://acwseeemqkmwxncektfz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3NlZWVtcWttd3huY2VrdGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTY2MDEsImV4cCI6MjA2MzQ5MjYwMX0.y8pPbzsgIkpEl6CHNYpBS2lRdx5DB6A7DupAcyjksvs'
);


let itemToDeleteInfo = { id: null, type: null, name: '' };
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

export function openDeleteConfirmModal(id, type, itemName, callbackOnConfirm, additionalMessage = '') {
    itemToDeleteInfo = { id, type, name: itemName };
    confirmDeleteCallback = callbackOnConfirm;
    let msg = `Czy na pewno chcesz usunąć "${itemName || 'ten element'}"?`;
    if (additionalMessage) msg += ` ${additionalMessage}`;
    if (DOM.deleteMessage) DOM.deleteMessage.textContent = msg;
    if (DOM.deleteConfirmModal) openModal(DOM.deleteConfirmModal);
    else console.error("Modal potwierdzenia usunięcia nie znaleziony w DOM!");
}

async function deleteItemFromSupabase(id, type) {
    let table = '';
    let itemNameForAlert = '';
    switch (type) {
        case 'contact':
            table = 'contacts';
            itemNameForAlert = 'Kontakt';
            break;
        case 'company':
            table = 'companies';
            itemNameForAlert = 'Firma';
            break;
        case 'deal': // Używane w starym kodzie, może być 'transaction'
        case 'transaction':
            table = 'deals'; // Upewnij się, że tabela transakcji nazywa się 'deals'
            itemNameForAlert = 'Transakcja';
            break;
        case 'task':
            table = 'tasks';
            itemNameForAlert = 'Zadanie';
            break;
        case 'salesProcess':
             table = 'sales_processes'; // Upewnij się co do nazwy tabeli
             itemNameForAlert = 'Proces sprzedaży';
             break;
        case 'transactionStage':
             table = 'transaction_stages'; // Upewnij się co do nazwy tabeli
             itemNameForAlert = 'Etap transakcji';
             break;
        case 'customContactField':
            table = 'custom_contact_fields'; // Upewnij się co do nazwy tabeli
            itemNameForAlert = 'Niestandardowe pole kontaktu';
            break;
        case 'customCompanyField':
            table = 'custom_company_fields'; // Upewnij się co do nazwy tabeli
            itemNameForAlert = 'Niestandardowe pole firmy';
            break;
        default:
            console.error('Nieobsługiwany typ do usunięcia:', type);
            showAlert(`Nie można usunąć elementu: nieznany typ "${type}".`, 'danger');
            return { success: false, error: `Nieznany typ: ${type}` };
    }

    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
        console.error(`Błąd usuwania (${type}):`, error);
        showAlert(`Nie udało się usunąć elementu (${itemNameForAlert}). Błąd: ${error.message}`, 'danger');
        return { success: false, error: error.message };
    } else {
        showAlert(`${itemNameForAlert} został(a) usunięty/a.`, 'success'); // Zmieniono na success dla lepszego UX
        return { success: true };
    }
}

async function handleConfirmDelete() {
    if (itemToDeleteInfo.id && itemToDeleteInfo.type) {
        const result = await deleteItemFromSupabase(itemToDeleteInfo.id, itemToDeleteInfo.type);
        if (result.success && typeof confirmDeleteCallback === 'function') {
            confirmDeleteCallback(itemToDeleteInfo.id, itemToDeleteInfo.type); // Wywołaj callback tylko po pomyślnym usunięciu
        }
    }
    if (DOM.deleteConfirmModal) closeModal(DOM.deleteConfirmModal);
    itemToDeleteInfo = { id: null, type: null, name: '' };
    confirmDeleteCallback = null;
}

export function initModals() {
    console.log("Modals.js: Inicjalizacja obsługi modali...");
    const allModals = [
        DOM.contactFormModal, DOM.companyFormModal, DOM.quickAddCompanyModal,
        DOM.transactionFormModal, DOM.deleteConfirmModal, DOM.contactDetailsModal,
        DOM.companyDetailsModal, DOM.transactionDetailsModal
    ].filter(modal => modal != null);

    const allCloseButtons = [
        DOM.closeContactFormModalButton, DOM.closeCompanyFormModalButton,
        DOM.closeQuickAddCompanyModalButton, DOM.closeTransactionFormModalButton,
        DOM.closeDeleteConfirmModalButton, DOM.closeContactDetailsModalButton,
        DOM.closeCompanyDetailsModalButton, DOM.closeTransactionDetailsModalButton,
        DOM.cancelQuickAddCompanyButton, // Ten przycisk również zamyka modal
        // Przyciski "Zamknij" w modalach szczegółów
        DOM.closeContactDetailsViewButton, DOM.closeCompanyDetailsViewButton, DOM.closeTransactionDetailsViewButton,
        // Przycisk "Anuluj" w modalu potwierdzenia usunięcia
        DOM.cancelDeleteButton
    ].filter(button => button != null);


    allCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Specjalna obsługa dla przycisku anulowania w deleteConfirmModal
            if (button === DOM.cancelDeleteButton && DOM.deleteConfirmModal) {
                closeModal(DOM.deleteConfirmModal);
                itemToDeleteInfo = { id: null, type: null, name: '' }; // Resetuj info
                confirmDeleteCallback = null; // Resetuj callback
                return; // Zakończ, aby nie próbować zamykać go ponownie przez parentElement
            }

            // Znajdź nadrzędny modal i zamknij go
            let modalToClose = button.closest('.modal');
            // Czasami przycisk może być bezpośrednio w kontenerze, który jest modalem
            // np. gdy modalContent nie jest bezpośrednim dzieckiem modala
            if (!modalToClose && button.parentElement && button.parentElement.classList.contains('modal')) {
                modalToClose = button.parentElement;
            }
            // Dodatkowe sprawdzenie dla przycisków wewnątrz modal-content
             if (!modalToClose && button.parentElement && button.parentElement.parentElement && button.parentElement.parentElement.classList.contains('modal')) {
                modalToClose = button.parentElement.parentElement;
            }


            if (modalToClose) {
                closeModal(modalToClose);
                // Jeśli zamykany modal to modal potwierdzenia usunięcia (np. przez 'x' lub kliknięcie tła)
                if (modalToClose === DOM.deleteConfirmModal) {
                    itemToDeleteInfo = { id: null, type: null, name: '' };
                    confirmDeleteCallback = null;
                }
            } else {
                console.warn("Nie znaleziono modala do zamknięcia dla przycisku:", button);
            }
        });
    });

    window.addEventListener('click', (event) => {
        allModals.forEach(modal => {
            if (modal && event.target === modal) { // Zamykaj tylko jeśli kliknięto bezpośrednio na tło modala
                closeModal(modal);
                if (modal === DOM.deleteConfirmModal) { // Jeśli zamykamy modal potwierdzenia, resetuj
                    itemToDeleteInfo = { id: null, type: null, name: '' };
                    confirmDeleteCallback = null;
                }
            }
        });
    });

    if (DOM.confirmDeleteButton) {
        DOM.confirmDeleteButton.addEventListener('click', handleConfirmDelete);
    } else {
        console.error("Przycisk 'confirmDeleteButton' nie został znaleziony w DOM.");
    }
    console.log("Modals.js: Obsługa modali zainicjalizowana.");
}

// Upewnij się, że masz plik utils.js z funkcją showAlert, np.:
/*
// Plik: js/utils.js
export function showAlert(message, type = 'info', duration = 3000) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        console.error("Alert container not found!");
        return;
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`; // Użyj klas Tailwind lub własnych
    alertDiv.textContent = message;

    // Proste style dla alertu (dostosuj do Tailwind)
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.padding = '15px';
    alertDiv.style.borderRadius = '5px';
    alertDiv.style.color = 'white';
    alertDiv.style.zIndex = '10000';
    if (type === 'danger') {
        alertDiv.style.backgroundColor = 'red';
    } else if (type === 'success') {
        alertDiv.style.backgroundColor = 'green';
    } else {
        alertDiv.style.backgroundColor = 'blue';
    }


    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, duration);
}
*/
