async function loadModules() {
    try {
        const response = await fetch('data/modules.json');
        const data = await response.json();

        const container = document.getElementById('modules');

        data.modules.forEach(mod => {
            const card = document.createElement('div');
            card.className = 'module-card';

            card.innerHTML = `
                <div class="module-title">${mod.title}</div>
                <div class="module-content">${mod.content}</div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Fehler beim Laden der Module:", error);
    }
}

loadModules();
