# 🔐 Guide d'Accès - BACK-OFFICE

## 📍 Routes du Back-Office

### Base : `/admin`

| Route | Composant | Description |
|-------|-----------|-------------|
| `/admin/dashboard` | DashboardComponent | Tableau de bord administrateur |
| `/admin/users` | UserManagementComponent | Gestion des utilisateurs |
| `/admin/pharmacists/validation` | PharmacistValidationComponent | Validation des pharmaciens |
| `/admin/providers` | AdminProvidersComponent | Gestion des prestataires |
| `/admin/requests` | AdminRequestsComponent | Gestion des requêtes |
| `/admin/events` | AdminEventsListComponent | Liste des événements |
| `/admin/events/create` | AdminEventFormComponent | Créer un événement |
| `/admin/events/edit/:id` | AdminEventFormComponent | Modifier un événement |
| `/admin/events/:id/registrations` | AdminEventRegistrationsComponent | Voir les inscriptions |

---

## 🚀 Comment accéder

### **Option 1 : Via la page de test** ✅ RECOMMANDÉE
```
http://localhost:4200/front/test

Puis cliquez sur l'une des interfaces du back-office
```

### **Option 2 : URL directe**

#### 🏠 Dashboard
```
http://localhost:4200/admin/dashboard
```

#### 👥 Gestion des utilisateurs
```
http://localhost:4200/admin/users
```

#### ✅ Validation des pharmaciens
```
http://localhost:4200/admin/pharmacists/validation
```

#### 🤝 Gestion des prestataires
```
http://localhost:4200/admin/providers
```

#### 📬 Requêtes
```
http://localhost:4200/admin/requests
```

#### 📅 Événements
```
http://localhost:4200/admin/events
http://localhost:4200/admin/events/create
http://localhost:4200/admin/events/edit/1
```

---

## ✨ Interfaces Disponibles

### **Section 1 : Utilisateurs**
- ✅ Dashboard (`/admin/dashboard`) - Vue d'ensemble
- ✅ User Management (`/admin/users`) - Tous les utilisateurs

### **Section 2 : Validation**
- ✅ Pharmacist Validation (`/admin/pharmacists/validation`)
- ✅ Providers (`/admin/providers`)

### **Section 3 : Demandes**
- ✅ Requests (`/admin/requests`)

### **Section 4 : Événements**
- ✅ Events List (`/admin/events`)
- ✅ Create Event (`/admin/events/create`)
- ✅ Edit Event (`/admin/events/edit/:id`)
- ✅ Event Registrations (`/admin/events/:id/registrations`)

---

## 🎯 Structure du Back-Office

```
/admin
├── / (redirectTo dashboard)
├── dashboard        ← DashboardComponent
├── users            ← UserManagementComponent
├── pharmacists/validation ← PharmacistValidationComponent
├── providers        ← AdminProvidersComponent
├── requests         ← AdminRequestsComponent
└── events
    ├── (liste)      ← AdminEventsListComponent
    ├── create       ← AdminEventFormComponent (création)
    ├── edit/:id     ← AdminEventFormComponent (édition)
    └── :id/registrations ← AdminEventRegistrationsComponent
```

---

## 📋 Layout

Le back-office utilise le composant parent : **BackOfficeComponent**

Tous les enfants sont affichés à l'intérieur de ce composant.

---

## ⚠️ Mode Test

- ✅ **Pas d'authentification requise**
- ✅ **Accès libre à TOUS les menus**
- ✅ **Pas de restrictions de rôle**

---

## 🔄 Retour au Front-Office

Depuis n'importe quelle page du back-office, vous pouvez :
- Cliquer sur le logo pour aller à `/front`
- Utiliser le menu de navigation
- Accéder à `/front/test` pour explorer d'autres interfaces

---

**Créé le :** 2026-03-30  
**Statut :** ✅ PRÊT À TESTER

