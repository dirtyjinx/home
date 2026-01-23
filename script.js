// Configuration et données
let config = null;
let galleryMedia = [];
let currentMediaIndex = 0;
let masonryInstance = null;

// Chargement de la configuration
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        initializePage();
    } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
    }
}

// Initialisation de la page
function initializePage() {
    // Injecter les données du groupe
    document.getElementById('bandName').textContent = config.band.name;
    document.getElementById('bandTagline').textContent = config.band.tagline;
    document.getElementById('contactBandName').textContent = config.band.name;
    document.getElementById('footerBandName').textContent = config.band.name;

    // Hero background
    const heroSection = document.getElementById('hero');
    heroSection.style.backgroundImage = `url('${config.hero.backgroundImage}')`;

    // Contact
    document.getElementById('contactEmail').textContent = config.contact.email;
    document.getElementById('contactEmail').href = `mailto:${config.contact.email}`;
    document.getElementById('contactPhone').textContent = config.contact.phone;
    document.getElementById('facebookLink').href = config.contact.social.facebook;
    document.getElementById('instagramLink').href = config.contact.social.instagram;

    // Charger les musiciens
    loadMusicians();

    // Charger la galerie
    loadGallery();
}

// Charger les musiciens
function loadMusicians() {
    const musiciansGrid = document.getElementById('musicians-grid');

    config.members.forEach(member => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="musician-card">
                <img src="${member.photo}" alt="${member.name}" class="musician-photo">
                <h3 class="musician-name">${member.name}</h3>
                <p class="musician-instrument">${member.instrument}</p>
                <p class="musician-bio">${member.bio}</p>
            </div>
        `;
        musiciansGrid.appendChild(col);
    });
}

// Charger la galerie
async function loadGallery() {
    // Créer la liste des médias
    galleryMedia = [];

    // Ajouter les images depuis la configuration
    if (config.gallery.images) {
        config.gallery.images.forEach(img => {
            if (!config.gallery.excludeImages.includes(img)) {
                galleryMedia.push({
                    type: 'image',
                    src: `${config.gallery.imagesFolder}/${img}`,
                    alt: img.replace(/\.[^/.]+$/, '')
                });
            }
        });
    }

    // Ajouter les vidéos depuis la configuration
    if (config.gallery.videos) {
        config.gallery.videos.forEach(vid => {
            galleryMedia.push({
                type: 'video',
                src: `${config.gallery.videosFolder}/${vid}`,
                alt: vid.replace(/\.[^/.]+$/, '')
            });
        });
    }

    // Mélanger les médias pour un effet plus dynamique
    galleryMedia = shuffleArray(galleryMedia);

    // Créer les éléments de la galerie
    const galleryGrid = document.getElementById('gallery-grid');

    galleryMedia.forEach((media, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.onclick = () => openModal(index);

        if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = media.alt;
            img.loading = 'lazy';
            item.appendChild(img);
        } else if (media.type === 'video') {
            const video = document.createElement('video');
            video.src = media.src;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.onloadeddata = () => {
                video.play().catch(() => console.log('Autoplay prevented'));
            };
            item.appendChild(video);
        }

        galleryGrid.appendChild(item);
    });

    // Initialiser Masonry après le chargement des images
    imagesLoaded(galleryGrid, function() {
        masonryInstance = new Masonry(galleryGrid, {
            itemSelector: '.gallery-item',
            percentPosition: false,
            gutter: 15,
            fitWidth: true
        });

        // Rafraîchir Masonry après chaque chargement de vidéo
        const videos = galleryGrid.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('loadedmetadata', () => {
                masonryInstance.layout();
            });
        });
    });
}

// Fonction debounce pour limiter les appels lors du redimensionnement
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Recalculer Masonry lors du redimensionnement
function refreshMasonry() {
    if (masonryInstance) {
        masonryInstance.layout();
    }
}

// Écouter les événements de redimensionnement et d'orientation
window.addEventListener('resize', debounce(refreshMasonry, 250));
window.addEventListener('orientationchange', () => {
    // Attendre que l'orientation change vraiment
    setTimeout(refreshMasonry, 300);
});

// Mélanger un tableau
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Ouvrir la modale
function openModal(index) {
    currentMediaIndex = index;
    showMedia();
    const modal = new bootstrap.Modal(document.getElementById('mediaModal'));
    modal.show();
}

// Afficher le média dans la modale
function showMedia() {
    const container = document.getElementById('modalMediaContainer');
    container.innerHTML = '';

    const media = galleryMedia[currentMediaIndex];

    if (media.type === 'image') {
        const img = document.createElement('img');
        img.src = media.src;
        img.alt = media.alt;
        img.className = 'img-fluid';
        container.appendChild(img);
    } else if (media.type === 'video') {
        const video = document.createElement('video');
        video.src = media.src;
        video.controls = true;
        video.autoplay = true;
        video.className = 'w-100';
        container.appendChild(video);
    }
}

// Arrêter les vidéos à la fermeture de la modale
const mediaModal = document.getElementById('mediaModal');
mediaModal.addEventListener('hidden.bs.modal', function () {
    const container = document.getElementById('modalMediaContainer');
    const video = container.querySelector('video');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
});

// Fermer la modale en cliquant sur le fond noir (en dehors du média)
mediaModal.addEventListener('click', function(e) {
    // Vérifier si le clic est sur le modal lui-même (pas sur le contenu)
    if (e.target === mediaModal || e.target.classList.contains('modal-dialog') ||
        e.target.classList.contains('modal-content') || e.target.classList.contains('modal-body') ||
        e.target.id === 'modalMediaContainer') {
        const modal = bootstrap.Modal.getInstance(mediaModal);
        if (modal) {
            modal.hide();
        }
    }
});

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', loadConfig);
