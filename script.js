/* GESTION DES "POP-UP" ET DU FORMULAIRE */

// 1. Récupération des éléments HTML du premier modal (le formulaire)
const modal = document.getElementById("formulaireModal");           // Le fond noir derrière le formulaire
const formulaire = document.getElementById("formulaireAction");      // La balise <form> elle-même
const closeBtn = document.querySelector(".close");                  // La petite croix (X) pour fermer
const validateButtons = document.querySelectorAll(".CTAbutton, .sideBar2Button"); // Tous les boutons qui ouvrent le modal

// 2. Éléments pour la zone de dépôt de fichiers (Drag & Drop)
const dropZone = document.getElementById("dropZone");               // La zone verte pointillée
const fileInput = document.getElementById("preuve");                // L'input invisible qui contient le fichier

// 3. Récupération des éléments du second modal (le "Merci")
const successModal = document.getElementById("successModal");       // Le popup de remerciement
const closeSuccess = document.getElementById("closeSuccess");       // La croix du popup de succès
const btnSuccessClose = document.getElementById("btnSuccessClose"); // Le bouton "Super !"

/**
 * FONCTIONNALITÉ : OUVERTURE DU MODAL
 * On parcourt tous les boutons "Valider mon action" et on leur dit d'ouvrir le modal au clic.
 */
validateButtons.forEach((button) => {
  button.addEventListener("click", function (e) {
    // On vérifie que c'est bien le bouton principal ou un bouton de la barre latérale qui contient "Valider"
    const isValidateButton =
      this.classList.contains("CTAbutton") ||
      (this.classList.contains("sideBar2Button") && this.textContent.includes("Valider"));

    if (isValidateButton) {
      modal.style.display = "block"; // Affiche le modal (passe de 'none' à 'block')
    }
  });
});

/**
 * FONCTIONNALITÉ : FERMETURE DES MODALS
 */
// Ferme le premier modal quand on clique sur la petite croix (X)
closeBtn.onclick = () => (modal.style.display = "none");

// Ferme le second modal (succès) quand on clique sur sa croix ou sur le bouton "Super !"
[closeSuccess, btnSuccessClose].forEach(btn => {
  btn.onclick = () => successModal.style.display = "none";
});

// Ferme les modals si on clique n'importe où en dehors de la fenêtre blanche
window.onclick = (event) => {
  if (event.target === modal) modal.style.display = "none";
  if (event.target === successModal) successModal.style.display = "none";
};


/* DRAP AND DROP */

// Si l'utilisateur clique sur la zone, cela simule un clic sur l'input de fichier caché
dropZone.addEventListener("click", () => fileInput.click());

// Quand on survole la zone avec un fichier (dragover)
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault(); // Obligatoire pour autoriser le dépôt
  dropZone.classList.add("drag-over"); // Ajoute la classe CSS pour changer de couleur
});

// Quand on quitte la zone ou qu'on termine le déplacement (dragleave / dragend)
["dragleave", "dragend"].forEach((type) => {
  dropZone.addEventListener(type, () => {
    dropZone.classList.remove("drag-over"); // Retire le style de survol
  });
});

// Quand on lâche le fichier dans la zone (drop)
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");

  // On récupère les fichiers déposés
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files; // On les donne à l'input caché
    updateDropZoneDisplay(e.dataTransfer.files[0].name); // On affiche le nom du fichier
  }
});

// Quand l'utilisateur choisit un fichier normalement via l'explorateur (change)
fileInput.addEventListener("change", () => {
  if (fileInput.files.length) {
    updateDropZoneDisplay(fileInput.files[0].name);
  }
});

/**
 * Met à jour l'affichage de la zone verte une fois que le fichier est reçu.
 */
function updateDropZoneDisplay(fileName) {
  let fileNameDisplay = dropZone.querySelector(".file-name");
  
  // Si le petit texte du nom de fichier n'existe pas encore, on le crée
  if (!fileNameDisplay) {
    fileNameDisplay = document.createElement("p");
    fileNameDisplay.className = "file-name";
    dropZone.appendChild(fileNameDisplay);
  }
  
  // On écrit le nom du fichier dedans
  fileNameDisplay.textContent = `Fichier : ${fileName}`;
  
  // On cache l'icône de flèche et on change le texte principal
  dropZone.querySelector(".drop-icon").style.display = "none";
  dropZone.querySelector(".drop-text").innerHTML = "Fichier prêt !";
}


/* ENVOYER LE FORMULAIRE ET LA PAGE DE SUCCES */

formulaire.addEventListener("submit", function (e) {
  e.preventDefault(); // Empêche la page de se recharger

  // Ici, on pourrait envoyer 'data' vers un serveur
  const data = {
    nom: document.getElementById("nomUtilisateur").value,
    username: document.getElementById("username").value,
    action: document.getElementById("nomAction").value,
    fichier: fileInput.files[0] ? fileInput.files[0].name : "Aucun fichier"
  };

  /**
   * RÉINITIALISATION DU FORMULAIRE
   * On remet tout à zéro pour la prochaine fois
   */
  formulaire.reset();
  const fileNameDisplay = dropZone.querySelector(".file-name");
  if (fileNameDisplay) fileNameDisplay.remove(); // Supprime le nom du fichier affiché
  dropZone.querySelector(".drop-icon").style.display = "block"; // Réaffiche la flèche
  dropZone.querySelector(".drop-text").innerHTML = "Glisse ou importe ton<br/>screenshot ici";
  
  // Enfin : on ferme le formulaire et on ouvre le modal "Merci"
  modal.style.display = "none";
  successModal.style.display = "block";
});


/* CARROUSEL DE LA COMMUNAUTÉ */

const carouselTrack = document.getElementById("carouselTrack"); // Le conteneur qui bouge
const prevBtn = document.getElementById("carouselPrev");         // Bouton flèche gauche
const nextBtn = document.getElementById("carouselNext");         // Bouton flèche droite

let carouselPosition = 0; // Position de départ

/**
 * Calcule la largeur d'une carte + l'espace (gap) pour savoir de combien bouger
 */
function getCardWidth() {
  const card = carouselTrack.querySelector(".actCommunauté");
  if (!card) return 0;
  const style = getComputedStyle(carouselTrack);
  const gap = parseInt(style.gap) || 10;
  return card.offsetWidth + gap;
}

/**
 * Calcule jusqu'où on peut aller à droite sans laisser de vide
 */
function getMaxScroll() {
  const wrapperWidth = carouselTrack.parentElement.offsetWidth;
  const trackWidth = carouselTrack.scrollWidth;
  return Math.max(0, trackWidth - wrapperWidth);
}

/**
 * Met à jour physiquement la position du carrousel et l'état des boutons
 */
function updateCarousel() {
  const maxScroll = getMaxScroll();
  
  // Sécurité : on ne sort pas des limites (0 à maxScroll)
  if (carouselPosition < 0) carouselPosition = 0;
  if (carouselPosition > maxScroll) carouselPosition = maxScroll;

  // On applique le mouvement via CSS (Translation)
  carouselTrack.style.transform = `translateX(-${carouselPosition}px)`;

  // On grise les boutons si on est au début ou à la fin
  prevBtn.disabled = carouselPosition <= 0;
  nextBtn.disabled = carouselPosition >= maxScroll;
}

// Événement clic flèche gauche
prevBtn.addEventListener("click", function () {
  carouselPosition -= getCardWidth(); // Recule d'une carte
  updateCarousel();
});

// Événement clic flèche droite
nextBtn.addEventListener("click", function () {
  carouselPosition += getCardWidth(); // Avance d'une carte
  updateCarousel();
});

// On initialise le carrousel au chargement
updateCarousel();

// On recalcule si la fenêtre change de taille (ex: passage mobile/desktop)
window.addEventListener("resize", () => updateCarousel());
