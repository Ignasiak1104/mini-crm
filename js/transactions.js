import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://your-project.supabase.co', 'your-anon-key');

/* ZAMIEŃ powyższe URL i anon-key na swoje dane z Supabase */
export async function getDealsData() {
    const { data, error } = await supabase.from('deals').select('*');
    if (error) { console.error(error); return []; }
    return data;
}

export async function addDeal(deal) {
    const { data, error } = await supabase.from('deals').insert([deal]);
    if (error) { console.error(error); return null; }
    return data[0];
}
export async function getDealById(id) {
    const { data, error } = await supabase.from('deals').select('*').eq('id', id).single();
    if (error) { console.error(error); return null; }
    return data;
}

export async function updateDeal(id, updates) {
    const { error } = await supabase.from('deals').update(updates).eq('id', id);
    if (error) console.error(error);
}