// js/companies.js
import { supabase } from './supabaseClient.js';
import * as DOM from './domElements.js';
import { showAlert } from './utils.js';
import { closeModal, openModal } from './modals.js';

// Implementacja renderCompaniesApp - MUSISZ JĄ DOSTOSOWAĆ DO SWOICH POTRZEB
export async function renderCompaniesApp() {
    console.log("renderCompaniesApp called - implementuj logikę wyświetlania firm");
    // Logika renderowania firm
}

export async function getCompaniesData() {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) { console.error('Błąd pobierania firm:',error); return []; }
    return data;
}

export async function addCompany(company) {
    const { data, error } = await supabase.from('companies').insert([company]).select();
    if (error) { console.error('Błąd dodawania firmy:', error); return null; }
    return data ? data[0] : null;
}

export async function getCompanyById(id) {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
    if (error) { console.error('Błąd pobierania firmy po ID:', error); return null; }
    return data;
}
// Możesz potrzebować funkcji updateCompany i deleteCompany podobnie jak w contacts.js


async function handleCompanyFormSubmit(event) {
    event.preventDefault();
    console.log("handleCompanyFormSubmit triggered");
    // Logika dodawania/edycji firmy
    // Przykład:
    const companyId = DOM.companyForm.companyId.value;
    const isEditing = Boolean(companyId);
    const companyData = {
        name: DOM.companyForm.companyName.value,
        industry: DOM.companyForm.companyIndustry.value,
        notes: DOM.companyForm.companyNotes.value,
    };

    try {
        let result;
        // if (isEditing) { result = await updateCompany(companyId, companyData); }
        // else { result = await addCompany(companyData); }
        result = await addCompany(companyData); // Uproszczone na razie do dodawania

        if (result) {
            showAlert(isEditing ? 'Firma zaktualizowana!' : 'Firma dodana!', 'success');
            closeModal(DOM.companyFormModal);
            DOM.companyForm.reset();
            document.getElementById('companyId').value = '';
            await renderCompaniesApp();
        } else {
            showAlert('Błąd zapisu firmy.', 'danger');
        }
    } catch (error) {
        console.error('Błąd zapisu firmy:', error);
        showAlert(`Błąd: ${error.message}`, 'danger');
    }
}

export function initCompaniesModule() {
    console.log("Companies module initialized.");
    if (DOM.companyForm) {
        DOM.companyForm.removeEventListener('submit', handleCompanyFormSubmit);
        DOM.companyForm.addEventListener('submit', handleCompanyFormSubmit);
        console.log("Event listener dla companyForm podpięty.");
    } else {
        console.warn("Element companyForm nie został znaleziony w DOM podczas initCompaniesModule.");
    }

    if (DOM.openCompanyFormModalButton) {
        DOM.openCompanyFormModalButton.addEventListener('click', () => {
            document.getElementById('companyFormModalTitle').textContent = 'Dodaj Nową Firmę';
            DOM.companyForm.reset();
            document.getElementById('companyId').value = '';
            openModal(DOM.companyFormModal);
        });
    }
}
