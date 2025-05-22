import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://your-project.supabase.co', 'your-anon-key');

/* ZAMIEŃ powyższe URL i anon-key na swoje dane z Supabase */
export async function getTasksData() {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) { console.error(error); return []; }
    return data;
}

export async function addTask(task) {
    const { data, error } = await supabase.from('tasks').insert([task]);
    if (error) { console.error(error); return null; }
    return data[0];
}
export async function updateTask(id, updates) {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) console.error(error);
}

export async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error(error);
}