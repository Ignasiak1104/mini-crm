// js/modals.js
import { supabase } from './supabaseClient.js'; // Zmieniony import
import * as DOM from './domElements.js';
import { showAlert } from './utils.js';

// Reszta pliku modals.js pozostaje taka sama jak w Twojej ostatniej działającej wersji
// lub w wersji, którą Ci wcześniej podałem, z poprawionymi typami w funkcji deleteItemFromSupabase

// ... (cała reszta kodu z modals.js, upewnij się, że masz tam poprawną logikę deleteItemFromSupabase itp.)
// Poniżej wklejam resztę kodu z jednej z poprzednich iteracji, upewnij się, że jest kompletna i poprawna:

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
             break;
        case 'customContactField':
            table = 'custom_contact_fields';
            itemNameForAlert = 'Niestandardowe pole kontaktu';
            break;
        case 'customCompanyField':
            table = 'custom_company_fields';
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
        showAlert(`${itemNameForAlert} został(a) usunięty/a.`, 'success');
        return { success: true };
    }
}

async function handleConfirmDelete() {
    if (itemToDeleteInfo.id && itemToDeleteInfo.type) {
        const result = await deleteItemFromSupabase(itemToDeleteInfo.id, itemToDeleteInfo.type);
        if (result.success && typeof confirmDeleteCallback === 'function') {
            confirmDeleteCallback(itemToDeleteInfo.id, itemToDeleteInfo.type);
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
        DOM.cancelQuickAddCompanyButton,
        DOM.closeContactDetailsViewButton, DOM.closeCompanyDetailsViewButton,
        DOM.closeTransactionDetailsViewButton,
        DOM.cancelDeleteButton
    ].filter(button => button != null);


    allCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button === DOM.cancelDeleteButton && DOM.deleteConfirmModal) {
                closeModal(DOM.deleteConfirmModal);
                itemToDeleteInfo = { id: null, type: null, name: '' };
                confirmDeleteCallback = null;
                return;
            }

            let modalToClose = button.closest('.modal');
            if (!modalToClose && button.parentElement && button.parentElement.classList.contains('modal')) {
                modalToClose = button.parentElement;
            }
             if (!modalToClose && button.parentElement && button.parentElement.parentElement && button.parentElement.parentElement.classList.contains('modal')) {
                modalToClose = button.parentElement.parentElement;
            }

            if (modalToClose) {
                closeModal(modalToClose);
                if (modalToClose === DOM.deleteConfirmModal) {
                    itemToDeleteInfo = { id: null, type: null, name: '' };
                    confirmDeleteCallback = null;
                }
            } else {
                // console.warn("Nie znaleziono modala do zamknięcia dla przycisku:", button);
            }
        });
    });

    window.addEventListener('click', (event) => {
        allModals.forEach(modal => {
            if (modal && event.target === modal) {
                closeModal(modal);
                if (modal === DOM.deleteConfirmModal) {
                    itemToDeleteInfo = { id: null, type: null, name: '' };
                    confirmDeleteCallback = null;
                }
            }
        });
    });

    if (DOM.confirmDeleteButton) {
        DOM.confirmDeleteButton.addEventListener('click', handleConfirmDelete);
    } else {
        // Ten błąd pojawiał się w konsoli, więc sprawdzamy czy element istnieje
        // zanim dodamy listenera. Jeśli błąd nadal występuje, upewnij się,
        // że element z id="confirmDeleteButton" jest w index.html
        console.warn("Przycisk 'confirmDeleteButton' nie został znaleziony w DOM podczas initModals.");
    }
    console.log("Modals.js: Obsługa modali zainicjalizowana.");
}
