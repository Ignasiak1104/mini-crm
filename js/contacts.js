// js/contacts.js
import { supabase } from './supabaseClient.js';
import * as DOM from './domElements.js'; // Potrzebne do closeModal
import { showAlert } from './utils.js'; // Załóżmy, że masz utils.js
import { closeModal, openModal } from './modals.js'; // Załóżmy, że masz modals.js

// Implementacja renderContactsApp - MUSISZ JĄ DOSTOSOWAĆ DO SWOICH POTRZEB
export async function renderContactsApp() {
    console.log("renderContactsApp called - implementuj logikę wyświetlania kontaktów");
    // Przykład:
    // const contacts = await getContactsData();
    // const tableBody = document.getElementById('contactsTableBody');
    // if (!tableBody) return;
    // tableBody.innerHTML = ''; // Wyczyść tabelę
    // if (contacts.length === 0) {
    //     document.getElementById('noContactsMessage')?.classList.remove('hidden');
    // } else {
    //     document.getElementById('noContactsMessage')?.classList.add('hidden');
    //     contacts.forEach(contact => {
    //         const row = tableBody.insertRow();
    //         // Dodaj komórki i przyciski akcji
    //     });
    // }
}

export async function getContactsData() {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) { console.error('Błąd pobierania kontaktów:', error); return []; }
    return data;
}

export async function addContact(contact) {
    const { data, error } = await supabase.from('contacts').insert([contact]).select();
    if (error) { console.error('Błąd dodawania kontaktu:', error); return null; }
    return data ? data[0] : null;
}

export async function updateContact(id, updates) {
    const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select();
    if (error) { console.error('Błąd aktualizacji kontaktu:', error); return null; }
    return data ? data[0] : null;
}

export async function deleteContact(id) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) { console.error('Błąd usuwania kontaktu:', error); return { success: false, error }; }
    return { success: true };
}

export async function getContactById(id) {
    const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
    if (error) { console.error('Błąd pobierania kontaktu po ID:', error); return null; }
    return data;
}

async function handleContactFormSubmit(event) {
    event.preventDefault(); // Zapobiega domyślnemu przeładowaniu strony
    console.log("handleContactFormSubmit triggered");

    const contactId = DOM.contactForm.contactId.value; // Zakładając, że masz <input type="hidden" id="contactId"> w formularzu
    const isEditing = Boolean(contactId);

    // Zbierz dane z formularza - dostosuj do swoich pól
    const contactData = {
        firstName: DOM.contactForm.firstName.value,
        lastName: DOM.contactForm.lastName.value,
        email: DOM.contactForm.email.value,
        phone: DOM.contactForm.phone.value,
        company_id: DOM.contactForm.contactCompany.value || null, // Upewnij się, że pole w bazie to np. company_id
        notes: DOM.contactForm.notes.value,
        // ... inne pola, w tym niestandardowe
    };

    try {
        let result;
        if (isEditing) {
            result = await updateContact(contactId, contactData);
            if (result) showAlert('Kontakt zaktualizowany pomyślnie!', 'success');
        } else {
            result = await addContact(contactData);
            if (result) showAlert('Kontakt dodany pomyślnie!', 'success');
        }

        if (result) {
            closeModal(DOM.contactFormModal);
            DOM.contactForm.reset(); // Wyczyść formularz
            document.getElementById('contactId').value = ''; // Wyczyść ukryte ID
            await renderContactsApp(); // Odśwież listę kontaktów
            // Ewentualnie odśwież dashboard, jeśli dodanie kontaktu ma na niego wpływ
            // import { updateDashboardData } from './main.js'; // Można zaimportować, jeśli nie powoduje to cyklicznej zależności
            // updateDashboardData();
        } else {
            showAlert('Wystąpił błąd podczas zapisywania kontaktu.', 'danger');
        }
    } catch (error) {
        console.error('Błąd zapisu kontaktu:', error);
        showAlert(`Błąd: ${error.message}`, 'danger');
    }
}

export function initContactsModule() {
    console.log("Contacts module initialized.");
    if (DOM.contactForm) {
        DOM.contactForm.removeEventListener('submit', handleContactFormSubmit); // Usuń stary listener, aby uniknąć duplikatów
        DOM.contactForm.addEventListener('submit', handleContactFormSubmit);
        console.log("Event listener dla contactForm podpięty.");
    } else {
        console.warn("Element contactForm nie został znaleziony w DOM podczas initContactsModule.");
    }

    // Podpięcie otwierania modala do przycisku "Dodaj nowy kontakt"
    if (DOM.openContactFormModalButton) {
        DOM.openContactFormModalButton.addEventListener('click', () => {
            document.getElementById('contactFormModalTitle').textContent = 'Dodaj Nowy Kontakt';
            DOM.contactForm.reset();
            document.getElementById('contactId').value = '';
            // Tutaj ewentualnie logika czyszczenia/przygotowania pól niestandardowych w formularzu
            openModal(DOM.contactFormModal);
        });
    }
}
