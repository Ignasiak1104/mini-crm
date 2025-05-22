
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
    'https://acwseeemqkmwxncektfz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3NlZWVtcWttd3huY2VrdGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTY2MDEsImV4cCI6MjA2MzQ5MjYwMX0.y8pPbzsgIkpEl6CHNYpBS2lRdx5DB6A7DupAcyjksvs'
);

import * as DOM from './domElements.js';
import { showAlert } from './utils.js';

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
    switch (type) {
        case 'contact':
            table = 'contacts';
            break;
        case 'company':
            table = 'companies';
            break;
        case 'deal':
        case 'transaction':
            table = 'deals';
            break;
        case 'task':
            table = 'tasks';
            break;
        default:
            console.error('Nieobsługiwany typ:', type);
            return;
    }

    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
        console.error('Błąd usuwania:', error);
        showAlert('Nie udało się usunąć elementu.', 'danger');
    } else {
        showAlert('Element został usunięty.', 'info');
    }
}

async function handleConfirmDelete() {
    if (itemToDeleteInfo.id && itemToDeleteInfo.type) {
        await deleteItemFromSupabase(itemToDeleteInfo.id, itemToDeleteInfo.type);
        if (typeof confirmDeleteCallback === 'function') {
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
            if (modalToClose) closeModal(modalToClose);
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
    }
    console.log("Modals.js: Obsługa modali zainicjalizowana.");
}
