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
        const contactsTableHead = document.getElementById('contactsTableHead');

        if (!tableBody || !noContactsMessage || !contactsTableHead) {
            console.error("renderContactsApp: Brak kluczowych elementów tabeli kontaktów.");
            if (showAlert) showAlert("Błąd renderowania listy kontaktów.", "danger");
            return;
        }

        // Statyczne nagłówki na razie, logika dynamicznych pól później
        contactsTableHead.innerHTML = `
            <tr>
                <th class="px-6 py-3 tl text-xs font-medium text-gray-500 uppercase tracking-wider">Imię</th>
                <th class="px-6 py-3 tl text-xs font-medium text-gray-500 uppercase tracking-wider">Nazwisko</th>
                <th class="px-6 py-3 tl text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 tl text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                <th class="px-6 py-3 tl text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
            </tr>
        `;
        tableBody.innerHTML = '';

        if (contacts.length === 0) {
            noContactsMessage.classList.remove('hidden');
        } else {
            noContactsMessage.classList.add('hidden');
            contacts.forEach(contact => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = contact.firstName || '-';
                row.insertCell().textContent = contact.lastName || '-';
                row.insertCell().textContent = contact.email || '-';
                row.insertCell().textContent = contact.phone || '-';
                // TODO: Wyświetlanie nazwy firmy (contact.companies.name jeśli używasz JOIN)
                const actionsCell = row.insertCell();
                actionsCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium';
                actionsCell.innerHTML = `
                    <button class="action-btn view-btn" data-contact-id="<span class="math-inline">\{contact\.id\}"\>Zobacz</button\>
<button class\="action\-btn edit\-btn" data\-contact\-id\="</span>{contact.id}">Edytuj</button>
                    <button class="action-btn delete-btn" data-contact-id="<span class="math-inline">\{contact\.id\}" data\-contact\-name\="</span>{contact.firstName || ''} ${contact.lastName || ''}">Usuń</button>
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
export async function getContactsData() {
    // Przykład z pobraniem nazwy firmy, jeśli tabela contacts ma kolumnę company_id
    // i chcesz wyświetlić nazwę firmy. Musisz mieć odpowiednią relację w Supabase.
    const { data, error } = await supabase.from('contacts').select(`
        *, 
        companies ( name ) 
    `);
    // Jeśli nie masz relacji 'companies' lub kolumny company_id, użyj prostszego:
    // const { data, error } = await supabase.from('contacts').select('*');
    if (error) { console.error('Błąd pobierania kontaktów:', error); return []; }
    return data || [];
}

export async function addContact(contactData) { // Nazwa zmieniona dla jasności
    // Usuwamy pola, które nie są bezpośrednio w tabeli 'contacts' jeśli są przekazywane
    const { companyName, ...restOfContactData } = contactData;
    const { data, error } = await supabase.from('contacts').insert([restOfContactData]).select();
    if (error) { console.error('Błąd dodawania kontaktu:', error); return null; }
    return data ? data[0] : null;
}

export async function updateContact(id, contactData) { // Nazwa zmieniona
    const { companyName, ...restOfContactData } = contactData;
    const { data, error } = await supabase.from('contacts').update(restOfContactData).eq('id', id).select();
    if (error) { console.error('Błąd aktualizacji kontaktu:', error); return null; }
    return data ? data[0] : null;
}

export async function getContactById(id) {
    const { data, error } = await supabase.from('contacts').select(`*, companies ( id, name )`).eq('id', id).single();
    // const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
    if (error) { console.error('Błąd pobierania kontaktu po ID:', error); return null; }
    return data;
}

// --- Obsługa formularza ---
async function handleContactFormSubmit(event) {
    event.preventDefault();
    const formElement = event.target;
    const contactId = formElement.contactId.value;
    const isEditing = Boolean(contactId);

    const contactData = {
        firstName: formElement.firstName.value, // W HTML name="firstName"
        lastName: formElement.lastName.value,  // W HTML name="lastName"
        email: formElement.email.value,
        phone: formElement.phone.value,
        notes: formElement.notes.value,
    };
    if (formElement.contactCompany && formElement.contactCompany.value) {
        contactData.company_id = formElement.contactCompany.value; // Zgodnie z SQL, kolumna to company_id
    }
    // TODO: Logika zbierania wartości z PÓL NIESTANDARDOWYCH
    // np. contactData.custom_pole1 = formElement.custom_pole1.value;

    console.log("Wysyłanie danych kontaktu:", contactData, "Edycja:", isEditing);

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
            formElement.reset();
            if(formElement.contactId) formElement.contactId.value = '';
            await renderContactsApp();
            const mainModule = await import('./main.js'); // Dynamiczny import
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
function attachActionListenersToContactsTable() {
    const tableBody = document.getElementById('contactsTableBody');
    if (!tableBody) {
        console.warn("contacts.js: Nie znaleziono contactsTableBody do podpięcia listenerów.");
        return;
    }

    // Usuń stare listenery, aby uniknąć wielokrotnego podpinania
    const newTableBody = tableBody.cloneNode(true);
    tableBody.parentNode.replaceChild(newTableBody, tableBody);


    newTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button.action-btn'); // Upewnij się, że kliknięto na przycisk
        if (!target) return;

        const contactId = target.dataset.contactId;
        const contactName = target.dataset.contactName; // Dla modala usuwania

        if (!contactId) return;

        if (target.classList.contains('edit-btn')) {
            console.log(`Edycja kontaktu ID: ${contactId}`);
            const contact = await getContactById(contactId);
            if (contact) {
                const form = document.getElementById('contactForm');
                const modalTitle = document.getElementById('contactFormModalTitle');
                const modal = document.getElementById('contactFormModal');

                if (form && modalTitle && modal) {
                    modalTitle.textContent = 'Edytuj Kontakt';
                    form.contactId.value = contact.id; // Ukryte pole z ID
                    form.firstName.value = contact.firstName || '';
                    form.lastName.value = contact.lastName || '';
                    form.email.value = contact.email || '';
                    form.phone.value = contact.phone || '';
                    form.notes.value = contact.notes || '';
                    if (form.contactCompany) form.contactCompany.value = contact.company_id || '';
                    // TODO: Wypełnij pola niestandardowe w formularzu
                    // TODO: Załaduj listę firm do selecta (jeśli jeszcze niezaładowana)
                    openModal(modal);
                }
            }
        } else if (target.classList.contains('delete-btn')) {
            console.log(`Usuwanie kontaktu ID: ${contactId}`);
            openDeleteConfirmModal(contactId, 'contact', contactName, async (id, type) => {
                if (type === 'contact') {
                    // Logika usuwania jest w modals.js -> deleteItemFromSupabase
                    await renderContactsApp();
                    const mainModule = await import('./main.js');
                    if (mainModule.updateDashboardData) mainModule.updateDashboardData();
                }
            });
        } else if (target.classList.contains('view-btn')) {
            console.log(`Zobacz kontakt ID: ${contactId}`);
            const contactDetailsModal = document.getElementById('contactDetailsModal');
            const contactDetailsContent = document.getElementById('contactDetailsContent');
            if (contactDetailsModal && contactDetailsContent) {
                 const contact = await getContactById(contactId);
                 if (contact) {
                    // TODO: Rozbuduj wyświetlanie szczegółów, np. nazwa firmy
                    let companyName = (contact.companies && contact.companies.name) ? contact.companies.name : 'Brak';
                    contactDetailsContent.innerHTML = `
                        <p><strong>Imię:</strong> ${contact.firstName || '-'}</p>
                        <p><strong>Nazwisko:</strong> ${contact.lastName || '-'}</p>
                        <p><strong>Email:</strong> ${contact.email || '-'}</p>
                        <p><strong>Telefon:</strong> ${contact.phone || '-'}</p>
                        <p><strong>Firma:</strong> ${companyName}</p>
                        <p><strong>Notatki:</strong> ${contact.notes || '-'}</p>
                        `;
                    openModal(contactDetailsModal);
                 }
            }
        }
    });
}

// --- Inicjalizacja modułu ---
export function initContactsModule() {
    console.log("Contacts module initialized.");
    const form = document.getElementById('contactForm');
    if (form) {
        form.removeEventListener('submit', handleContactFormSubmit);
        form.addEventListener('submit', handleContactFormSubmit);
        console.log("Event listener dla contactForm podpięty.");
    } else {
        console.warn("contacts.js: Element contactForm nie został znaleziony w DOM.");
    }

    const openButton = document.getElementById('openContactFormModalButton');
    const modal = document.getElementById('contactFormModal');
    const modalTitle = document.getElementById('contactFormModalTitle');
    const contactIdInput = document.getElementById('contactId'); // Zakładam, że pole <input type="hidden" id="contactId" name="contactId"> istnieje w contactForm

    if (openButton && modal && modalTitle && form && contactIdInput) {
        openButton.removeEventListener('click', openContactFormForNew); // Usuń stary listener
        openButton.addEventListener('click', openContactFormForNew);
    } else {
        if (!openButton) console.warn("contacts.js: Przycisk 'openContactFormModalButton' nie znaleziony.");
    }

    // Funkcja pomocnicza do otwierania modala dla nowego kontaktu
    async function openContactFormForNew() {
        const form = document.getElementById('contactForm'); // Pobierz ponownie, na wszelki wypadek
        const modalTitle = document.getElementById('contactFormModalTitle');
        const contactIdInput = document.getElementById('contactId');
        const modal = document.getElementById('contactFormModal');

        if (form && modalTitle && contactIdInput && modal) {
            modalTitle.textContent = 'Dodaj Nowy Kontakt';
            form.reset();
            contactIdInput.value = '';
            
            // TODO: Załaduj firmy do selecta
            // await loadCompaniesIntoSelect(form.contactCompany);

            // TODO: Wyczyść/przygotuj kontener na pola niestandardowe
            // const customFieldsContainer = form.querySelector('#customFieldsContainerInForm');
            // if (customFieldsContainer) custom
