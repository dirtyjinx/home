# Dirty Jinx - Landing Page

Landing page statique pour le groupe de musique Dirty Jinx.

## Structure du projet

```
dirtyJinx/
├── index.html          # Page principale
├── style.css           # Styles personnalisés
├── script.js           # Logique JavaScript
├── config.json         # Configuration du site (à personnaliser)
├── assets/
│   ├── images/        # Images du site
│   └── videos/        # Vidéos du site
└── README.md          # Ce fichier
```

## Fonctionnalités

- **Hero section** avec effet parallax
- **Galerie** avec effet masonry et modale de visualisation
- **Section musiciens** avec photos et biographies
- **Section contact** avec email, téléphone et réseaux sociaux
- **100% statique** - hébergeable sur GitHub Pages
- **Responsive** - s'adapte à tous les écrans
- **Configuration centralisée** dans `config.json`

## Personnalisation

### Pour un nouveau groupe

Éditez simplement le fichier `config.json` :

```json
{
  "band": {
    "name": "Nom du groupe",
    "tagline": "Style musical"
  },
  "hero": {
    "backgroundImage": "assets/images/hero.jpg"
  },
  "members": [
    {
      "name": "Prénom",
      "instrument": "Instrument",
      "photo": "assets/images/membre.jpg",
      "bio": "Biographie..."
    }
  ],
  "contact": {
    "email": "contact@email.com",
    "phone": "0123456789",
    "social": {
      "facebook": "https://facebook.com/...",
      "instagram": "https://instagram.com/..."
    }
  }
}
```

### Ajouter des photos/vidéos à la galerie

1. Copiez vos fichiers dans `assets/images/` ou `assets/videos/`
2. La galerie se met à jour automatiquement au chargement de la page
3. Pour exclure certaines images de la galerie, ajoutez-les dans `config.json` :

```json
"gallery": {
  "imagesFolder": "assets/images",
  "videosFolder": "assets/videos",
  "excludeImages": ["hero.jpg", "membre1.jpg", "membre2.jpg"]
}
```

## Déploiement sur GitHub Pages

1. Créez un repository GitHub
2. Poussez ce code sur la branche `main`
3. Allez dans Settings > Pages
4. Sélectionnez la branche `main` comme source
5. Votre site sera accessible à `https://username.github.io/repository-name/`

## Technologies utilisées

- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5
- Bootstrap Icons
- Masonry.js

## Support

Pour toute question ou problème, contactez l'équipe de développement.
