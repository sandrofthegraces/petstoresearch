// js/ui.js

export function renderHome() {
    return `
        <button class="menu-btn" onclick="navTo('shop_level1')">
            <span>🏪 Negozio</span> <span class="menu-arrow">›</span>
        </button>
        <button class="menu-btn" onclick="navTo('order')">
            <span>📝 Da Ordinare</span> <span class="menu-arrow">›</span>
        </button>
    `;
}

export function renderLevel1() {
    return `
        <button class="menu-btn" onclick="setFilter('animal', 'dog')"><span>🐶 Cane</span> <span class="menu-arrow">›</span></button>
        <button class="menu-btn" onclick="setFilter('animal', 'cat')"><span>🐱 Gatto</span> <span class="menu-arrow">›</span></button>
        <button class="menu-btn" onclick="alert('Questa sezione è in aggiornamento')"><span>🦜 Esotici</span> <span class="menu-arrow">›</span></button>
    `;
}

export function renderLevel2() {
    return `
        <button class="menu-btn" onclick="setFilter('category', 'Secco')"><span>🍪 Secco</span> <span class="menu-arrow">›</span></button>
        <button class="menu-btn" onclick="setFilter('category', 'Umido')"><span>💧 Umido</span> <span class="menu-arrow">›</span></button>
    `;
}

export function renderLevel4() {
    return `
        <button class="menu-btn" onclick="setFilter('line', 'Medicati')"><span>💊 Medicati</span> <span class="menu-arrow">›</span></button>
        <button class="menu-btn" onclick="setFilter('line', 'Mantenimento')"><span>🥩 Mantenimento</span> <span class="menu-arrow">›</span></button>
    `;
}

export function renderOrderPage(noteContent, noteId) {
    return `
        <textarea id="order-notes" class="notes-area" maxlength="5000" placeholder="Scrivi qui la lista della spesa...">${noteContent || ''}</textarea>
        <button class="btn-save-note" onclick="saveNote(${noteId})">Salva Note</button>
    `;
}

export function renderBrandGrid(brands) {
    if (brands.length === 0) return `<div class="empty-state">Nessuna marca trovata.<br>Premi + per aggiungerne una.</div>`;
    
    let html = '<div class="brand-grid">';
    brands.forEach(brand => {
        html += `
            <div class="brand-card" onclick="setFilter('brand', '${brand}')">
                <div class="brand-name">${brand}</div>
                <div class="brand-tools">
                    <button class="brand-tool-btn" onclick="editBrand('${brand}', event)" title="Modifica"><i data-lucide="edit-2" size="18"></i></button>
                    <button class="brand-tool-btn danger" onclick="deleteBrand('${brand}', event)" title="Elimina"><i data-lucide="trash-2" size="18"></i></button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

export function renderProductList(filteredList) {
    if (filteredList.length === 0) return `<div class="empty-state">Nessun prodotto trovato.</div>`;

    let html = '';
    filteredList.forEach(p => {
        const stockClass = p.quantity > 0 ? 'stock-ok' : 'stock-ko';
        const dotClass = p.quantity > 0 ? 'dot-ok' : 'dot-ko';
        const stockText = p.quantity > 0 ? `Disponibile (${p.quantity} pz)` : `Non disponibile`;

        const typeTag = p.type === 'cat' ? '<span class="tag tag-cat">🐱 Gatto</span>' : '<span class="tag tag-dog">🐶 Cane</span>';
        const consTag = p.consistency === 'Secco' ? '<span class="tag tag-dry">🍪 Secco</span>' : (p.consistency === 'Umido' ? '<span class="tag tag-wet">💧 Umido</span>' : '');
        const brandTag = p.brand ? `<span class="tag tag-brand">${p.brand}</span>` : '';
        const lineTag = p.line ? `<span class="tag tag-line">${p.line}</span>` : '';
        
        const img = p.img_url || `https://placehold.co/600x400/e3f2fd/444?text=${encodeURIComponent(p.full_name.substring(0,10))}&font=roboto`;
        const rationHtml = p.ration_url ? `<div class="img-container"><span class="img-label">📊 Tabella Razioni</span><img src="${p.ration_url}" class="prod-img"></div>` : '';

        html += `
            <div class="card">
                <div class="card-header" onclick="toggleCard(this)">
                    <div class="tags-row">${typeTag} ${consTag} ${brandTag} ${lineTag}</div>
                    <div class="prod-name">${p.full_name}</div>
                    <div class="prod-weight">⚖️ ${p.weight || 'N/A'}</div>
                    <div class="stock-row ${stockClass}">
                        <span class="stock-dot ${dotClass}"></span> ${stockText}
                    </div>
                </div>
                <div class="details">
                    <div class="content">
                        <div class="img-container"><span class="img-label">🖼️ Prodotto</span><img src="${img}" class="prod-img"></div>
                        <div class="desc">${p.description || "Nessuna descrizione."}</div>
                        ${rationHtml}
                        <div class="actions">
                            <button class="btn btn-edit" onclick="editProduct(${p.id})">✏️ Modifica</button>
                            <button class="btn btn-del" onclick="deleteProduct(${p.id})">🗑️ Elimina</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    return html;
}