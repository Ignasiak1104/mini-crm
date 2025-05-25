// js/companies.js
import { supabase } from './supabaseClient.js';
import { showAlert } from './utils.js'; // Upewnij się, że utils.js istnieje
import { closeModal, openModal, openDeleteConfirmModal } from './modals.js';

// --- Implementacja renderCompaniesApp ---
export async function renderCompaniesApp() {
    console.log("renderCompaniesApp: Rozpoczynam renderowanie firm.");
    try {
        const companies = await getCompaniesData();
        const tableBody = document.getElementById('companiesTableBody');
        const noCompaniesMessage = document.getElementById('noCompaniesMessage');
        const companiesTableHead = document.getElementById('companiesTableHead'); // Zakładając, że masz <thead id="companiesTableHead">

        if (!tableBody || !noCompaniesMessage || !companiesTableHead) {
            console.error("renderCompaniesApp: Brak kluczowych elementów tabeli firm.");
            if (showAlert) showAlert("Błąd renderowania listy firm.", "danger");
            return;
        }

        // Nagłówki tabeli - możesz je dostosować lub generować dynamicznie
        companiesTableHead.innerHTML = `
            <tr>
                <th class="px-6 py-3 tl text-xs font-medium text-gray-500 uppercase tracking-wider">Nazwa Firmy</th>
                <th class="px-6 py-3 tl text-xs font-medium text-gray-500 uppercase tracking-wider">Branża</th>
                <th class="px-6 py-3 tl text-xs font-medium text-gray-500 uppercase tracking-wider">Liczba Kontaktów</th>
                <th class="px-6 py-3 tl text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
            </tr>
        `;
        tableBody.innerHTML = '';

        if (companies.length === 0) {
            noCompaniesMessage.classList.remove('hidden');
        } else {
            noCompaniesMessage.classList.add('hidden');
            companies.forEach(company => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = company.name || '-';
                row.insertCell().textContent = company.industry || '-';
                row.insertCell().textContent = company.contacts_count !== undefined ? company.contacts_count : '-'; // Liczba kontaktów
                // TODO: Wyświetlanie innych pól, w tym niestandardowych

                const actionsCell = row.insertCell();
                actionsCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium';
                actionsCell.innerHTML = `
                    <button class="action-btn view-btn" data-company-id="${company.id}">Zobacz</button>
                    <button class="action-btn edit-btn" data-company-id="${company.id}">Edytuj</button>
                    <button class="action-btn delete-btn" data-company-id="${company.id}" data-company-name="${company.name || ''}">Usuń</button>
                `;
            });
        }
        console.log("renderCompaniesApp: Zakończono renderowanie firm.");
        attachActionListenersToCompaniesTable();
    } catch (error) {
        console.error("Błąd w renderCompaniesApp:", error);
        if (showAlert) showAlert("Nie udało się załadować firm.", "danger");
    }
}

// --- Funkcje danych ---
export async function getCompaniesData() {
    // Przykład zliczania kontaktów powiązanych z firmą.
    // Wymaga, aby tabela 'contacts' miała kolumnę 'company_id' będącą kluczem obcym do 'companies.id'.
    // Supabase automatycznie tworzy relację zwrotną, jeśli poprawnie zdefiniowałeś klucz obcy.
    const { data, error } = await supabase
        .from('companies')
        .select('*, contacts_count:contacts(count)'); // contacts to nazwa tabeli kontaktów

    if (error) {
        console.error('Błąd pobierania firm ze zliczeniem kontaktów:', error);
        // Spróbuj pobrać bez zliczania, jeśli wystąpił błąd (np. relacja nie istnieje lub nazwa jest inna)
        const { data: basicData, error: basicError } = await supabase.from('companies').select('*');
        if (basicError) {
            console.error('Błąd pobierania podstawowych danych firm:', basicError);
            return [];
        }
        return basicData.map(c => ({ ...c, contacts_count: 0 })) || []; // Zwróć z domyślnym licznikiem
    }
    // Przetwórz dane, aby contacts_count było liczbą
    return data.map(c => ({ ...c, contacts_count: (c.contacts_count && c.contacts_count[0]) ? c.contacts_count[0].count : 0 })) || [];
}


export async function addCompany(companyData) {
    // TODO: Usuń/zmapuj pola, które nie są bezpośrednio w tabeli 'companies', jeśli są przekazywane
    // np. const { poleNiestandardowe, ...restOfCompanyData } = companyData;
    const { data, error } = await supabase.from('companies').insert([companyData]).select();
    if (error) { console.error('Błąd dodawania firmy:', error); return null; }
    return data ? data[0] : null;
}

export async function updateCompany(id, companyData) {
    // TODO: Usuń/zmapuj pola...
    const { data, error } = await supabase.from('companies').update(companyData).eq('id', id).select();
    if (error) { console.error('Błąd aktualizacji firmy:', error); return null; }
    return data ? data[0] : null;
}

export async function getCompanyById(id) {
    const { data, error } = await supabase.from('companies').select('*, contacts(*)') // Pobierz powiązane kontakty
        .eq('id', id)
        .single();
    if (error) { console.error('Błąd pobierania firmy po ID:', error); return null; }
    return data;
}

// --- Obsługa formularza ---
async function handleCompanyFormSubmit(event) {
    event.preventDefault();
    const formElement = event.target;
    const companyId = formElement.companyId.value; // Zakładając <input type="hidden" id="companyId" name="companyId">
    const isEditing = Boolean(companyId);

    const companyData = {
        name: formElement.companyName.value,       // Zakładając <input id="companyName" name="companyName">
        industry: formElement.companyIndustry.value, // Zakładając <input id="companyIndustry" name="companyIndustry">
        notes: formElement.companyNotes.value,       // Zakładając <textarea id="companyNotes" name="companyNotes">
    };
    // TODO: Logika zbierania wartości z PÓL NIESTANDARDOWYCH z customCompanyFieldsContainerInForm

    console.log("Wysyłanie danych firmy:", companyData, "Edycja:", isEditing);

    try {
        let result;
        if (isEditing) {
            result = await updateCompany(companyId, companyData);
            if (result && showAlert) showAlert('Firma zaktualizowana!', 'success');
        } else {
            result = await addCompany(companyData);
            if (result && showAlert) showAlert('Firma dodana!', 'success');
        }

        if (result) {
            const companyFormModal = document.getElementById('companyFormModal');
            if(companyFormModal) closeModal(companyFormModal);
            formElement.reset();
            if(formElement.companyId) formElement.companyId.value = '';
            await renderCompaniesApp();
            const mainModule = await import('./main.js');
            if (mainModule.updateDashboardData) mainModule.updateDashboardData();
        } else {
            if (showAlert) showAlert('Wystąpił błąd podczas zapisywania firmy.', 'danger');
        }
    } catch (error) {
        console.error('Błąd zapisu firmy:', error);
        if (showAlert) showAlert(`Błąd zapisu firmy: ${error.message || 'Nieznany błąd'}`, 'danger');
    }
}

// --- Obsługa przycisków akcji w tabeli ---
function attachActionListenersToCompaniesTable() {
    const tableBody = document.getElementById('companiesTableBody');
    if (!tableBody) {
        console.warn("companies.js: Nie znaleziono companiesTableBody do podpięcia listenerów.");
        return;
    }
    const newTableBody = tableBody.cloneNode(true); // Sposób na usunięcie starych listenerów
    tableBody.parentNode.replaceChild(newTableBody, tableBody);

    newTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button.action-btn');
        if (!target) return;

        const companyId = target.dataset.companyId;
        const companyName = target.dataset.companyName;

        if (!companyId) return;

        if (target.classList.contains('edit-btn')) {
            console.log(`Edycja firmy ID: ${companyId}`);
            const company = await getCompanyById(companyId);
            if (company) {
                const form = document.getElementById('companyForm');
                const modalTitle = document.getElementById('companyFormModalTitle');
                const modal = document.getElementById('companyFormModal');
                if (form && modalTitle && modal) {
                    modalTitle.textContent = 'Edytuj Firmę';
                    form.companyId.value = company.id;
                    form.companyName.value = company.name || '';
                    form.companyIndustry.value = company.industry || '';
                    form.companyNotes.value = company.notes || '';
                    // TODO: Wypełnij pola niestandardowe w formularzu
                    openModal(modal);
                }
            }
        } else if (target.classList.contains('delete-btn')) {
            console.log(`Usuwanie firmy ID: ${companyId}`);
            openDeleteConfirmModal(companyId, 'company', companyName, async (id, type) => {
                if (type === 'company') {
                    await renderCompaniesApp();
                    const mainModule = await import('./main.js');
                    if (mainModule.updateDashboardData) mainModule.updateDashboardData();
                }
            });
        } else if (target.classList.contains('view-btn')) {
            console.log(`Zobacz firmę ID: ${companyId}`);
            const companyDetailsModal = document.getElementById('companyDetailsModal');
            const companyDetailsContent = document.getElementById('companyDetailsContent');
            const companyContactsList = document.getElementById('companyContactsList');
            const noCompanyContactsMessage = document.getElementById('noCompanyContactsMessage');

            if (companyDetailsModal && companyDetailsContent && companyContactsList && noCompanyContactsMessage) {
                 const company = await getCompanyById(companyId); // getCompanyById powinno też pobierać kontakty
                 if (company) {
                    companyDetailsContent.innerHTML = `
                        <p><strong>Nazwa Firmy:</strong> ${company.name || '-'}</p>
                        <p><strong>Branża:</strong> ${company.industry || '-'}</p>
                        <p><strong>Notatki:</strong> ${company.notes || '-'}</p>
                        `;
                    companyContactsList.innerHTML = '';
                    if (company.contacts && company.contacts.length > 0) {
                        noCompanyContactsMessage.classList.add('hidden');
                        company.contacts.forEach(contact => {
                            const li = document.createElement('li');
                            li.textContent = `${contact.firstName || ''} ${contact.lastName || ''} (${contact.email || 'brak email'})`;
                            companyContactsList.appendChild(li);
                        });
                    } else {
                        noCompanyContactsMessage.classList.remove('hidden');
                    }
                    openModal(companyDetailsModal);
                 }
            }
        }
    });
}

// --- Inicjalizacja modułu ---
export function initCompaniesModule() {
    console.log("Companies module initialized.");
    const form = document.getElementById('companyForm');
    if (form) {
        form.removeEventListener('submit', handleCompanyFormSubmit);
        form.addEventListener('submit', handleCompanyFormSubmit);
    } else {
        console.warn("companies.js: Element companyForm nie został znaleziony w DOM.");
    }

    const openButton = document.getElementById('openCompanyFormModalButton');
    const modal = document.getElementById('companyFormModal');
    const modalTitle = document.getElementById('companyFormModalTitle'); // Upewnij się, że istnieje
    const companyIdInput = document.getElementById('companyId'); // Upewnij się, że istnieje

    if (openButton && modal && modalTitle && form && companyIdInput) {
        openButton.removeEventListener('click', openCompanyFormForNew);
        openButton.addEventListener('click', openCompanyFormForNew);
    } else {
        if(!openButton) console.warn("companies.js: Przycisk 'openCompanyFormModalButton' nie znaleziony.");
    }

    function openCompanyFormForNew() {
        const form = document.getElementById('companyForm');
        const modalTitle = document.getElementById('companyFormModalTitle');
        const companyIdInput = document.getElementById('companyId');
        const modal = document.getElementById('companyFormModal');
        if(form && modalTitle && companyIdInput && modal){
            modalTitle.textContent = 'Dodaj Nową Firmę';
            form.reset();
            companyIdInput.value = '';
            // TODO: Wyczyść/przygotuj kontener na pola niestandardowe
            openModal(modal);
        }
    }
}
