# 🎭 LE REVOLVER - Mémo Troupe

Application d'aide à la mémorisation pour la pièce théâtrale "LE REVOLVER" de J.P. PELAEZ.

## 🚀 Démarrage rapide

### Installation
```bash
npm install
```

### Configuration
1. Copier `.env.local.example` en `.env.local`
2. Ajouter vos clés Supabase

### Développement
```bash
npm run dev
```
Accédez à `http://localhost:3000`

### Build Production
```bash
npm run build
npm start
```

## 📋 Fonctionnalités

- ✅ Liste des 26 saynètes (avec saynète 8 dupliquée)
- 🎵 Jingles audio par saynète
- 📄 Documents PDF du metteur en scène
- 👥 Filtrage par comédien
- 📦 Gestion des accessoires
- 💬 Commentaires pour comédiens et MES
- ⚙️ Interface d'édition admin

## 📦 Stack Technique

- **Frontend**: Next.js 14 + React 18 + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Déploiement**: Vercel
- **Versionning**: GitHub

## 📁 Structure du projet

```
/revolver-app
  /app              → Pages et composants Next.js
  /public
    /audio          → Fichiers jingles
    /pdf            → Documents PDF
  /lib
    /supabase.ts    → Configuration Supabase
  /components       → Composants React
  data.json         → Data locale (saynètes, comédiens)
```

## 🔗 Liens

- **Vercel**: [À déployer]
- **Supabase**: [À configurer]
- **GitHub**: [À créer]

## 📞 Support

Contact: [MES] pour modifications
