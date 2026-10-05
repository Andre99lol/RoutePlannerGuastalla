//prima tappa
const START_LOCATION = "Strada Comunale, Via S. Cristoforo, 2, 42016 Guastalla"; // Cambia con il tuo indirizzo di partenza


// Elenco dei punti di interesse configurabili per il tuo itinerario
const places = [
    { id: 1, name: "Trueda", address: "Stazione, Guastalla", category: "Autonoma" },
    { id: 2, name: "Daolio", address: "Via Bonazzi 1, Guastalla", category: "Autonoma" },
    { id: 3, name: "Gianfranco", address: "Via Catellani, Guastalla", category: "Carrozzina" }
];

// Stato della selezione memorizzato in ordine cronologico di click
let selectedIds = [];

document.addEventListener('DOMContentLoaded', () => {
    renderPlaces();
    
    // Associa eventi ai pulsanti fissi in basso e al reset
    document.getElementById('btn-reset').addEventListener('click', resetSelection);
    document.getElementById('btn-maps').addEventListener('click', generateMapsRoute);
    document.getElementById('btn-whatsapp').addEventListener('click', shareOnWhatsApp);
});

function renderPlaces() {
    const grid = document.getElementById('places-grid');
    grid.innerHTML = '';

    places.forEach(place => {
        const index = selectedIds.indexOf(place.id);
        const isSelected = index !== -1;
        const badgeNumber = isSelected ? index + 1 : '';

        const card = document.createElement('div');
        card.className = `p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
            isSelected 
                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-500/10' 
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
        }`;
        
        // Gestione evento click sulla card
        card.addEventListener('click', () => togglePlace(place.id));

        card.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    isSelected 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105' 
                        : 'bg-slate-100 text-slate-500'
                }">
                    ${isSelected ? badgeNumber : '<i class="fa-solid fa-map-pin"></i>'}
                </div>
                <div>
                    <h4 class="font-semibold text-slate-900 text-sm">${place.name}</h4>
                    <p class="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">${place.address}</p>
                </div>
            </div>
            <span class="text-[11px] font-medium px-2 py-1 rounded-md ${isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                ${place.category}
            </span>
        `;
        grid.appendChild(card);
    });

    updateUIState();
}

function togglePlace(id) {
    const index = selectedIds.indexOf(id);
    if (index > -1) {
        // Rimuove la tappa se già selezionata
        selectedIds.splice(index, 1);
    } else {
        // Aggiunge la tappa in fondo alla sequenza del percorso
        selectedIds.push(id);
    }
    renderPlaces();
}

function resetSelection() {
    selectedIds = [];
    renderPlaces();
}

function updateUIState() {
    const countEl = document.getElementById('selection-count');
    const summaryPanel = document.getElementById('summary-panel');
    const orderedList = document.getElementById('ordered-list');
    const btnMaps = document.getElementById('btn-maps');
    const btnWhatsapp = document.getElementById('btn-whatsapp');

    countEl.textContent = `${selectedIds.length} tappe selezionate`;

    if (selectedIds.length > 0) {
        summaryPanel.classList.remove('hidden');
        orderedList.innerHTML = '';
        
        selectedIds.forEach((id, idx) => {
            const place = places.find(p => p.id === id);
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100';
            li.innerHTML = `
                <div class="flex items-center space-x-2">
                    <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">${idx + 1}</span>
                    <span class="font-medium text-slate-800">${place.name}</span>
                </div>
                <span class="text-xs text-slate-400">${place.address}</span>
            `;
            orderedList.appendChild(li);
        });

        // Abilita pulsante Google Maps
        btnMaps.disabled = false;
        btnMaps.className = 'flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer';

        // Abilita pulsante WhatsApp
        btnWhatsapp.disabled = false;
        btnWhatsapp.className = 'flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer';

    } else {
        summaryPanel.classList.add('hidden');
        
        // Disabilita pulsante Google Maps
        btnMaps.disabled = true;
        btnMaps.className = 'flex-1 bg-slate-200 text-slate-400 font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-not-allowed shadow-none';

        // Disabilita pulsante WhatsApp
        btnWhatsapp.disabled = true;
        btnWhatsapp.className = 'flex-1 bg-slate-200 text-slate-400 font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-not-allowed shadow-none';
    }
}

function getMapsUrl() {
    if (selectedIds.length === 0) return '';
    
    // Recupera tutte le tappe selezionate
    const selectedPlaces = selectedIds.map(id => places.find(p => p.id === id));
    
    // 1. Origine fissa
    const origin = encodeURIComponent(START_LOCATION);
    
    // 2. Destinazione finale (l'ultima tappa selezionata)
    const destination = encodeURIComponent(selectedPlaces[selectedPlaces.length - 1].address);
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

    // 3. Waypoints intermedi (tutte le tappe tranne l'ultima)
    if (selectedPlaces.length > 1) {
        const intermediate = selectedPlaces.slice(0, selectedPlaces.length - 1);
        const waypointsStr = intermediate.map(p => encodeURIComponent(p.address)).join('|');
        url += `&waypoints=${waypointsStr}`;
    }

    return url;
}



function generateMapsRoute() {
    const url = getMapsUrl();
    if (url) {
        window.open(url, '_blank');
    }
}

function shareOnWhatsApp() {
    if (selectedIds.length === 0) return;

    const mapsUrl = getMapsUrl();
    let text = "🗺️ *Ecco il mio itinerario di viaggio:*\n\n";

    selectedIds.forEach((id, idx) => {
        const place = places.find(p => p.id === id);
        text += `${idx + 1}. *${place.name}* (${place.address})\n`;
    });

    text += `\n📍 *Apri il percorso completo su Google Maps:*\n${mapsUrl}`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
}