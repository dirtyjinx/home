#!/bin/bash
# Script pour lancer un serveur local

echo "🚀 Démarrage du serveur local..."
echo "📂 Dossier: $(pwd)"
echo ""
echo "🌐 Ouvrez votre navigateur sur:"
echo "   http://localhost:8000"
echo ""
echo "⚠️  Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Détecter la version de Python et lancer le serveur approprié
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python n'est pas installé"
    exit 1
fi
