import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://your-project.supabase.co', 'your-anon-key');

/* ZAMIEŃ powyższe URL i anon-key na swoje dane z Supabase */
export async function getCompaniesData() {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) { console.error(error); return []; }
    return data;
}

export async function addCompany(company) {
    const { data, error } = await supabase.from('companies').insert([company]);
    if (error) { console.error(error); return null; }
    return data[0];
}
export async function getCompanyById(id) {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
    if (error) { console.error(error); return null; }
    return data;
}