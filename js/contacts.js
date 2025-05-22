import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://your-project.supabase.co', 'your-anon-key');

/* ZAMIEŃ powyższe URL i anon-key na swoje dane z Supabase */
export async function getContactsData() {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) { console.error(error); return []; }
    return data;
}

export async function addContact(contact) {
    const { data, error } = await supabase.from('contacts').insert([contact]);
    if (error) { console.error(error); return null; }
    return data[0];
}

export async function updateContact(id, updates) {
    const { error } = await supabase.from('contacts').update(updates).eq('id', id);
    if (error) console.error(error);
}

export async function deleteContact(id) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) console.error(error);
}
export async function getContactById(id) {
    const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
    if (error) { console.error(error); return null; }
    return data;
}