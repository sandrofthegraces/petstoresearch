// js/data.js
import { sb } from './config.js';

export async function fetchAllProducts() {
    const { data, error } = await sb.from('products').select('*').order('full_name');
    if (error) {
        console.error(error);
        return [];
    }
    return data || [];
}

export async function fetchNotes() {
    const { data } = await sb.from('notes').select('*').limit(1).single();
    return data;
}

export async function saveNoteToDb(id, content) {
    if (id) {
        await sb.from('notes').update({ content }).eq('id', id);
    } else {
        await sb.from('notes').insert([{ content }]);
    }
}

export async function updateBrandName(oldBrand, newBrand) {
    return await sb.from('products').update({ brand: newBrand }).eq('brand', oldBrand);
}

export async function deleteBrandProducts(brand) {
    return await sb.from('products').delete().eq('brand', brand);
}

export async function deleteProductById(id) {
    return await sb.from('products').delete().eq('id', id);
}

export async function uploadImage(file) {
    if (!file) return null;
    const fileName = Date.now() + '-' + file.name.replace(/\s+/g, '-');
    const { error } = await sb.storage.from('images').upload(fileName, file);
    if (error) throw error;
    return sb.storage.from('images').getPublicUrl(fileName).data.publicUrl;
}

export async function saveProductToDb(id, payload) {
    if (id) {
        await sb.from('products').update(payload).eq('id', id);
    } else {
        await sb.from('products').insert([payload]);
    }
}