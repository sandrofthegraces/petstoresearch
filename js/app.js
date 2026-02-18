// js/app.js
import * as Data from './data.js';
import * as UI from './ui.js';

let products = [];
let state = { view: 'home', animal: null, category: null, brand: null, line: null };
let activeFilters = { type: 'all', consistency: '', brand: '', line: '', text: '' };

// --- INIZIALIZZAZIONE ---
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

async function initApp() {
    // 1. Mostra Caricamento all'avvio
    document.getElementById('app-container').innerHTML = UI.renderLoading();
    
    // 2. Carica i dati
    products = await Data.fetchAllProducts();
    
    // 3. Mostra la schermata corretta
    render();
}

// --- RENDERING ---
function render() {
    const container = document.getElementById('app-container');
    const titleEl = document.getElementById('page-title');
    const backBtn = document.getElementById('btn-back');
    const searchBtn = document.getElementById('btn-search-trigger');

    // Reset Container (ma non se stiamo caricando dati asincroni specifici)
    if(state.view !== 'order') container.innerHTML = '';
    
    backBtn.style.display = state.view === 'home' ? 'none' : 'flex';
    
    // Stato Bottone Cerca
    if (state.view === 'search_results') {
        searchBtn.classList.add('active');
        searchBtn.innerHTML = `🔍 Risultati`;
    } else {
        searchBtn.classList.remove('active');
        searchBtn.innerHTML = `🔍 Cerca`;
    }

    // Routing
    if (state.view === 'home') {
        titleEl.innerText = "Negozio";
        container.innerHTML = UI.renderHome();
    } 
    else if (state.view === 'order') {
        titleEl.innerText = "Da Ordinare";
        loadOrderPage(container); // Funzione dedicata che gestisce il suo loading
    }
    else if (state.view === 'shop_level1') {
        titleEl.innerText = "Reparto";
        container.innerHTML = UI.renderLevel1();
    }
    else if (state.view === 'shop_level2') {
        titleEl.innerText = state.animal === 'dog' ? "Cane" : "Gatto";
        container.innerHTML = UI.renderLevel2();
    }
    else if (state.view === 'shop_level3') {
        titleEl.innerText = state.category;
        const filtered = products.filter(p => p.type === state.animal && p.consistency === state.category);
        const brands = [...new Set(filtered.map(p => p.brand))].sort();
        container.innerHTML = UI.renderBrandGrid(brands);
        lucide.createIcons();
    }
    else if (state.view === 'shop_level4') {
        titleEl.innerText = state.brand;
        container.innerHTML = UI.renderLevel4();
    }
    else if (state.view === 'shop_list') {
        titleEl.innerText = state.line;
        const filtered = products.filter(p => 
            p.type === state.animal && 
            p.consistency === state.category &&
            p.brand === state.brand &&
            p.line === state.line
        );
        container.innerHTML = UI.renderProductList(filtered);
    }
    else if (state.view === 'search_results') {
        titleEl.innerText = "Risultati";
        const filtered = applySearchFilters();
        container.innerHTML = UI.renderProductList(filtered);
    }
}

async function loadOrderPage(container) {
    // Mostra loading specifico per la pagina ordini
    container.innerHTML = UI.renderLoading();
    
    const data = await Data.fetchNotes();
    
    // Una volta caricato, mostra il contenuto
    container.innerHTML = UI.renderOrderPage(data ? data.content : "", data ? data.id : null);
}

// --- FILTRI RICERCA ---
function applySearchFilters() {
    return products.filter(p => {
        if (activeFilters.type !== 'all' && p.type !== activeFilters.type) return false;
        if (activeFilters.consistency && p.consistency !== activeFilters.consistency) return false;
        if (activeFilters.brand && !(p.brand || "").toLowerCase().includes(activeFilters.brand.toLowerCase())) return false;
        if (activeFilters.line && p.line !== activeFilters.line) return false;
        if (activeFilters.text) {
            const searchStr = (p.full_name + " " + (p.brand || "")).toLowerCase();
            if (!searchStr.includes(activeFilters.text.toLowerCase())) return false;
        }
        return true;
    });
}

// --- ESPOSIZIONE GLOBALE ---

window.navTo = (viewName) => { state.view = viewName; render(); };

window.goBack = () => {
    if (state.view === 'order' || state.view === 'shop_level1' || state.view === 'search_results') state.view = 'home';
    else if (state.view === 'shop_level2') state.view = 'shop_level1';
    else if (state.view === 'shop_level3') state.view = 'shop_level2';
    else if (state.view === 'shop_level4') state.view = 'shop_level3';
    else if (state.view === 'shop_list') state.view = 'shop_level4';
    render();
};

window.setFilter = (key, value) => {
    state[key] = value;
    if (key === 'animal') state.view = 'shop_level2';
    if (key === 'category') state.view = 'shop_level3';
    if (key === 'brand') state.view = 'shop_level4';
    if (key === 'line') state.view = 'shop_list';
    render();
};

window.saveNote = async (id) => {
    const content = document.getElementById('order-notes').value;
    const btn = document.querySelector('.btn-save-note');
    btn.innerText = "Salvataggio...";
    await Data.saveNoteToDb(id, content);
    btn.innerText = "✅ Salvato!";
    setTimeout(() => btn.innerText = "Salva Note", 2000);
};

window.toggleCard = (headerElement) => {
    const card = headerElement.parentElement;
    card.classList.toggle('expanded');
};

// --- GESTIONE MARCHE ---
window.editBrand = async (oldBrand, event) => {
    event.stopPropagation();
    const newBrandInput = prompt("Rinomina marca:", oldBrand);
    if (!newBrandInput || newBrandInput.trim() === "") return;
    const newBrand = newBrandInput.trim();
    if (newBrand === oldBrand) return;

    const brandExists = products.some(p => p.brand.toLowerCase() === newBrand.toLowerCase());
    if (brandExists) {
        if(!confirm(`⚠️ La marca "${newBrand}" esiste già.\nVuoi unire i prodotti di "${oldBrand}" dentro "${newBrand}"?`)) return;
    }

    // Mostra loading durante l'aggiornamento
    document.getElementById('app-container').innerHTML = UI.renderLoading();
    
    await Data.updateBrandName(oldBrand, newBrand);
    await initApp(); // Ricarica tutto
};

window.deleteBrand = async (brand, event) => {
    event.stopPropagation();
    if (confirm(`Eliminare TUTTI i prodotti marca "${brand}"?`)) {
        // Mostra loading
        document.getElementById('app-container').innerHTML = UI.renderLoading();
        
        await Data.deleteBrandProducts(brand);
        await initApp();
    }
};

// --- GESTIONE PRODOTTI ---
window.deleteProduct = async (id) => {
    if (confirm("Eliminare prodotto?")) {
        // Mostra loading per evitare doppi click
        document.getElementById('app-container').innerHTML = UI.renderLoading();
        
        await Data.deleteProductById(id);
        await initApp();
    }
};

window.openProductModal = () => {
    document.getElementById('modal-title').innerText = "Nuovo Prodotto";
    document.getElementById('edit-id').value = '';
    
    document.getElementById('inp-type').value = state.animal || 'dog';
    document.getElementById('inp-consistency').value = state.category || 'Secco';
    document.getElementById('inp-brand').value = state.brand || '';
    document.getElementById('inp-line').value = state.line || ''; 
    
    ['inp-full-name', 'inp-weight', 'inp-qty', 'inp-desc'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('inp-qty').value = 0;
    resetFilesLabels();
    document.getElementById('modal-product').classList.add('open');
};

window.closeProductModal = () => document.getElementById('modal-product').classList.remove('open');

window.editProduct = (id) => {
    const p = products.find(x => x.id == id);
    if (!p) return;
    document.getElementById('modal-title').innerText = "Modifica Prodotto";
    document.getElementById('edit-id').value = id;
    document.getElementById('inp-type').value = p.type;
    document.getElementById('inp-consistency').value = p.consistency;
    document.getElementById('inp-brand').value = p.brand;
    document.getElementById('inp-line').value = p.line || '';
    document.getElementById('inp-full-name').value = p.full_name;
    document.getElementById('inp-weight').value = p.weight;
    document.getElementById('inp-qty').value = p.quantity;
    document.getElementById('inp-desc').value = p.description;
    
    resetFilesLabels();
    if(p.img_url) { document.getElementById('url-img').value = p.img_url; document.getElementById('lbl-img').innerText = "✅ Foto Ok"; document.getElementById('wrap-img').classList.add('has-file'); }
    if(p.ration_url) { document.getElementById('url-ration').value = p.ration_url; document.getElementById('lbl-ration').innerText = "✅ Tabella Ok"; document.getElementById('wrap-ration').classList.add('has-file'); }
    
    document.getElementById('modal-product').classList.add('open');
};

window.saveProduct = async () => {
    const btn = document.querySelector('.btn-shop');
    const originalText = btn.innerText;
    btn.disabled = true; btn.innerText = "Salvataggio...";
    
    try {
        const id = document.getElementById('edit-id').value;
        const fileImg = document.getElementById('file-img').files[0];
        const fileRation = document.getElementById('file-ration').files[0];
        
        let imgUrl = document.getElementById('url-img').value;
        let rationUrl = document.getElementById('url-ration').value;

        if (fileImg) imgUrl = await Data.uploadImage(fileImg);
        if (fileRation) rationUrl = await Data.uploadImage(fileRation);

        const payload = {
            type: document.getElementById('inp-type').value,
            consistency: document.getElementById('inp-consistency').value,
            brand: document.getElementById('inp-brand').value,
            line: document.getElementById('inp-line').value,
            full_name: document.getElementById('inp-full-name').value,
            weight: document.getElementById('inp-weight').value,
            quantity: parseInt(document.getElementById('inp-qty').value) || 0,
            description: document.getElementById('inp-desc').value,
            img_url: imgUrl,
            ration_url: rationUrl
        };

        if (!payload.brand || !payload.full_name) throw new Error("Marca e Nome sono obbligatori");

        // Chiudi modale e mostra loading nella schermata principale
        window.closeProductModal();
        document.getElementById('app-container').innerHTML = UI.renderLoading();

        await Data.saveProductToDb(id, payload);
        await initApp(); // Ricarica
    } catch (e) {
        alert("Errore: " + e.message);
        btn.disabled = false; btn.innerText = originalText;
    }
};

// ... (Il resto delle funzioni di ricerca e utility rimangono identiche) ...
// Per completezza, includo le funzioni sotto, così puoi copiare tutto il file

const modalSearch = document.getElementById('modal-search');
window.openSearchModal = () => {
    document.getElementById('s-brand').value = activeFilters.brand;
    document.getElementById('s-text').value = activeFilters.text;
    document.getElementById('s-type').value = activeFilters.type;
    document.getElementById('s-consistency').value = activeFilters.consistency;
    document.getElementById('s-line').value = activeFilters.line;
    modalSearch.classList.add('open');
};
window.closeSearchModal = () => modalSearch.classList.remove('open');

window.applySearch = () => {
    activeFilters.brand = document.getElementById('s-brand').value.trim();
    activeFilters.text = document.getElementById('s-text').value.trim();
    activeFilters.type = document.getElementById('s-type').value;
    activeFilters.consistency = document.getElementById('s-consistency').value;
    activeFilters.line = document.getElementById('s-line').value;
    state.view = 'search_results';
    
    // Mostra loading prima dei risultati (anche se locale, è una buona prassi visiva)
    document.getElementById('app-container').innerHTML = UI.renderLoading();
    setTimeout(() => render(), 300); // Piccolo delay finto per far vedere l'animazione di cambio contesto
    
    window.closeSearchModal();
};

window.resetSearch = () => {
    activeFilters = { type: 'all', consistency: '', brand: '', line: '', text: '' };
    state.view = 'home';
    render();
    window.closeSearchModal();
};

window.updateLabel = (type) => {
    const input = document.getElementById('file-' + type);
    if (input.files && input.files[0]) {
        document.getElementById('lbl-' + type).innerText = "✅ " + input.files[0].name.substring(0, 10) + "...";
        document.getElementById('wrap-' + type).classList.add('has-file');
    }
};

function resetFilesLabels() {
    document.getElementById('lbl-img').innerText = "📸 Foto";
    document.getElementById('wrap-img').classList.remove('has-file');
    document.getElementById('lbl-ration').innerText = "📊 Tabella";
    document.getElementById('wrap-ration').classList.remove('has-file');
    document.getElementById('url-img').value = "";
    document.getElementById('url-ration').value = "";
    document.getElementById('file-img').value = "";
    document.getElementById('file-ration').value = "";
}