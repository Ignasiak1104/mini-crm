// js/modals.js
import { supabase } from './supabaseClient.js';
// import * as DOM from './domElements.js'; // Lepiej pobierać elementy bezpośrednio lub przekazywać
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
    const deleteMessageEl = document.getElementById('deleteMessage');
    const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');

    let msg = `Czy na pewno chcesz usunąć "${itemName || 'ten element'}"?`;
    if (additionalMessage) msg += ` ${additionalMessage}`;

    if (deleteMessageEl) deleteMessageEl.textContent = msg;
    if (deleteConfirmModalEl) openModal(deleteConfirmModalEl);
    else console.error("Modal potwierdzenia usunięcia ('deleteConfirmModal') nie znaleziony w DOM!");
}

async function deleteItemFromSupabase(id, type) {
    // ... Twoja implementacja z poprzedniej odpowiedzi (ze switch/case dla tabel) ...
    // Upewnij się, że zwraca { success: true/false, error: ... }
    let table = '';
    switch (type) {
        case 'contact': table = 'contacts'; break;
        case 'company': table = 'companies'; break;
        case 'deal': case 'transaction': table = 'deals'; break;
        case 'task': table = 'tasks'; break;
        // ... inne typy
        default: console.error(`Nieznany typ do usunięcia: ${type}`); return { success: false, error: `Nieznany typ: ${type}` };
    }
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
        console.error(`Błąd usuwania (${type}):`, error);
        if(showAlert) showAlert(`Nie udało się usunąć. Błąd: ${error.message}`, 'danger');
        return { success: false, error: error.message };
    }
    if(showAlert) showAlert('Element usunięty.', 'success');
    return { success: true };
}

async function handleConfirmDelete() {
    if (itemToDeleteInfo.id && itemToDeleteInfo.type) {
        const result = await deleteItemFromSupabase(itemToDeleteInfo.id, itemToDeleteInfo.type);
        if (result.success && typeof confirmDeleteCallback === 'function') {
            confirmDeleteCallback(itemToDeleteInfo.id, itemToDeleteInfo.type);
        }
    }
    const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
    if (deleteConfirmModalEl) closeModal(deleteConfirmModalEl);
    itemToDeleteInfo = { id: null, type: null, name: '' };
    confirmDeleteCallback = null;
}

export function initModals() {
    console.log("Modals.js: Inicjalizacja obsługi modali...");
    const allModals = document.querySelectorAll('.modal'); // Pobierz wszystkie elementy z klasą .modal

    // Przyciski zamykania (X) wewnątrz modali
    allModals.forEach(modal => {
        const closeButton = modal.querySelector('.close-button'); // Szukaj .close-button wewnątrz każdego modala
        if (closeButton) {
            closeButton.addEventListener('click', () => closeModal(modal));
        }
    });

    // Zamykanie modala po kliknięciu na tło
    window.addEventListener('click', (event) => {
        allModals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
                if (modal.id === 'deleteConfirmModal') { // Specjalna obsługa dla modala usuwania
                    itemToDeleteInfo = { id: null, type: null, name: '' };
                    confirmDeleteCallback = null;
                }
            }
        });
    });

    // Przycisk "Anuluj" w modalu potwierdzenia usunięcia
    const cancelDeleteBtn = document.getElementById('cancelDeleteButton');
    const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
    if (cancelDeleteBtn && deleteConfirmModalEl) {
        cancelDeleteBtn.addEventListener('click', () => {
            closeModal(deleteConfirmModalEl);
            itemToDeleteInfo = { id: null, type: null, name: '' };
            confirmDeleteCallback = null;
        });
    }

    // Przycisk "Usuń" (potwierdzenie) w modalu potwierdzenia usunięcia
    const confirmBtn = document.getElementById('confirmDeleteButton');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleConfirmDelete);
    } else {
        // Ten log był w Twojej konsoli, więc zostawiam go jako ostrzeżenie
        console.warn("Przycisk 'confirmDeleteButton' nie został znaleziony w DOM podczas initModals.");
    }
    console.log("Modals.js: Obsługa modali zainicjalizowana.");
}
