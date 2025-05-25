// js/contacts.js
import { supabase } from './supabaseClient.js';
import { showAlert } from './utils.js';
import { closeModal, openModal, openDeleteConfirmModal } from './modals.js';

// --- Implementacja renderContactsApp ---
export async function renderContactsApp() {
    console.log("renderContactsApp: Rozpoczynam renderowanie kontaktów.");
    try {
        const contacts = await getContactsData();
        const tableBody = document.getElementById('contactsTableBody');
        const noContactsMessage = document.getElementById('noContactsMessage');
        // const contactsTableHead = document.getElementById('contactsTableHead'); // Jeśli potrzebujesz dynamicznych nagłówków

        if (!tableBody || !noContactsMessage) {
            console.error("renderContactsApp: Brak tabeli kontaktów lub komunikatu o braku kontaktów.");
            if (showAlert) showAlert("Błąd renderowania listy kontaktów. Sprawdź konsolę.", "danger");
            return;
        }
        tableBody.innerHTML = '';

        if (contacts.length === 0) {
            noContactsMessage.classList.remove('hidden');
        } else {
            noContactsMessage.classList.add('hidden');
            contacts.forEach(contact => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = `${contact.firstName || ''} ${contact.lastName || ''}`;
                row.insertCell().textContent = contact.email || '-';
                row.insertCell().textContent = contact.phone || '-';
                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button class="action-btn view-btn" data-contact-id="${contact.id}">Zobacz</button>
                    <button class="action-btn edit-btn" data-contact-id="${contact.id}">Edytuj</button>
                    <button class="action-btn delete-btn" data-contact-id="${contact.id}" data-contact-name="${contact.firstName || ''} ${contact.lastName || ''}">Usuń</button>
                `;
            });
        }
        console.log("renderContactsApp: Zakończono renderowanie kontaktów.");
        attachActionListenersToContactsTable();
    } catch (error) {
        console.error("Błąd w renderContactsApp:", error);
        if (showAlert) showAlert("Nie udało się załadować kontaktów.", "danger");
    }
}

// --- Funkcje danych ---
export async function getContactsData() { /* ... bez zmian z ostatniej wersji ... */ }
export async function addContact(contact) { /* ... bez zmian ... */ }
export async function updateContact(id, updates) { /* ... bez zmian ... */ }
export async function getContactById(id) { /* ... bez zmian ... */ }
// Implementacje z poprzedniej odpowiedzi są OK

// --- Obsługa formularza ---
async function handleContactFormSubmit(event) {
    event.preventDefault();
    const contactFormElement = event.target;
    const contactId = contactFormElement.contactId.value;
    const isEditing = Boolean(contactId);

    const contactData = { // Upewnij się, że nazwy pól (np. firstName) pasują do atrybutów 'name' w HTML
        firstName: contactFormElement.firstName.value,
        lastName: contactFormElement.lastName.value,
        email: contactFormElement.email.value,
        phone: contactFormElement.phone.value,
        notes: contactFormElement.notes.value,
    };
    if (contactFormElement.contactCompany && contactFormElement.contactCompany.value) {
        contactData.company_id = contactFormElement.contactCompany.value; // Zgodnie z Twoim SQL: company_id
    }

    console.log("Wysyłanie danych kontaktu:", contactData);

    try {
        let result;
        if (isEditing) {
            result = await updateContact(contactId, contactData);
            if (result && showAlert) showAlert('Kontakt zaktualizowany!', 'success');
        } else {
            result = await addContact(contactData);
            if (result && showAlert) showAlert('Kontakt dodany!', 'success');
        }

        if (result) {
            const contactFormModal = document.getElementById('contactFormModal');
            if(contactFormModal) closeModal(contactFormModal);
            contactFormElement.reset();
            if(contactFormElement.contactId) contactFormElement.contactId.value = '';
            await renderContactsApp();
            const mainModule = await import('./main.js');
            if (mainModule.updateDashboardData) mainModule.updateDashboardData();
        } else {
            if (showAlert) showAlert('Wystąpił błąd podczas zapisywania kontaktu.', 'danger');
        }
    } catch (error) {
        console.error('Błąd zapisu kontaktu:', error);
        if (showAlert) showAlert(`Błąd zapisu kontaktu: ${error.message || 'Nieznany błąd'}`, 'danger');
    }
}

// --- Obsługa przycisków akcji w tabeli ---
function attachActionListenersToContactsTable() { /* ... bez zmian z ostatniej wersji ... */ }
// Implementacja z poprzedniej odpowiedzi jest OK

// --- Inicjalizacja modułu ---
export function initContactsModule() {
    console.log("Contacts module initialized.");
    const form = document.getElementById('contactForm'); // Pobierz formularz bezpośrednio
    if (form) {
        form.removeEventListener('submit', handleContactFormSubmit);
        form.addEventListener('submit', handleContactFormSubmit);
        console.log("Event listener dla contactForm podpięty.");
    } else {
        console.warn("contacts.js: Element contactForm nie został znaleziony w DOM.");
    }

    const openButton = document.getElementById('openContactFormModalButton');
    const modal = document.getElementById('contactFormModal');
    const modalTitle = document.getElementById('contactFormModalTitle'); // Upewnij się, że to ID istnieje
    const contactIdInput = document.getElementById('contactId');

    if (openButton && modal && modalTitle && form && contactIdInput) {
        openButton.addEventListener('click', () => {
            modalTitle.textContent = 'Dodaj Nowy Kontakt';
            form.reset();
            contactIdInput.value = '';
            openModal(modal);
        });
    } else {
        if (!openButton) console.warn("contacts.js: Przycisk 'openContactFormModalButton' nie znaleziony.");
        // ... inne logi dla brakujących elementów
    }
}
