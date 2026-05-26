# 📋 Chemins de toutes les Interfaces du Projet MedicarePi

## 📁 Modèles (Models)

### 1. **User Model**
📍 `src/app/models/user.model.ts`
- `UserResponseDTO` - Réponse utilisateur du backend
- `UserRequestDTO` - Requête de création/modification d'utilisateur

### 2. **Authentication Models**
📍 `src/app/models/auth-response.model.ts`
- `AuthResponse` - Réponse d'authentification avec token JWT

📍 `src/app/models/login-request.model.ts`
- `LoginRequest` - Données de connexion

### 3. **Register & Medical History**
📍 `src/app/models/register-request.model.ts`
- `RegisterRequest` - Données d'inscription
- `MedicalHistory` - Historique médical du patient

### 4. **HomeCare Services**
📍 `src/app/models/homecare.model.ts`
- `HomeCareService` - Service de soins à domicile
- `ServiceSummary` - Résumé d'un service
- `ReviewDTO` - Avis/Note d'un service
- `ProviderProfileDTO` - Profil du prestataire
- `ServiceProvider` - Modèle complet du prestataire

### 5. **Pharmacy Models**
📍 `src/app/models/pharmacy.model.ts`
- `Pharmacy` - Informations de pharmacie
- `PharmacyRequest` - Requête pharmacie
- `ProductResponseDTO` - Réponse produit
- `PharmacyResponseDTO` - Réponse pharmacie complète
- `PharmacyStockResponseDTO` - Stock de pharmacie
- `DeliveryResponseDTO` - Réponse livraison
- `DeliveryAgency` - Agence de livraison
- `DeliveryAgent` - Agent de livraison

### 6. **Pharmacy Order**
📍 `src/app/models/pharmacy-order.model.ts`
- `PharmacyOrderItemDTO` - Article de commande
- `PharmacyOrderRequestDTO` - Requête de commande
- `PharmacyOrderResponseDTO` - Réponse commande complète
- `OrderItemDTO` - Détail article
- `OrderTrackingDTO` - Suivi commande

### 7. **Notification**
📍 `src/app/models/notification.model.ts`
- `NotificationResponseDTO` - Réponse notification
- `NotificationType` - Énumération des types de notification

### 8. **Delivery**
📍 `src/app/models/delivery.model.ts`
- Contient les modèles de livraison

### 9. **Payment**
📍 `src/app/models/payment.model.ts`
- `PaymentRequestDTO` - Requête de paiement
- `PaymentResponseDTO` - Réponse paiement

### 10. **Patient**
📍 `src/app/models/patient.model.ts`
- Modèles patient

### 11. **Product**
📍 `src/app/models/product.model.ts`
- `ProductRequest` - Requête produit
- `Product` - Modèle produit complet

### 12. **Stock**
📍 `src/app/models/stock.model.ts`
- `ReceiveBatchRequest` - Requête réception lot
- `StockMovementRequest` - Requête mouvement stock
- `Batch` - Lot de produits
- `PharmacyStock` - Stock pharmacie
- `StockMovement` - Mouvement de stock
- `StockAlert` - Alerte stock

### 13. **Event**
📍 `src/app/models/event.model.ts`
- Modèles d'événements

---

## 🔧 Services (Services)

### 1. **User Service**
📍 `src/app/services/user.service.ts`
- `UpdateProfileRequest` - Interface de mise à jour profil
- `UserProfile` - Interface profil utilisateur

### 2. **Toast Service**
📍 `src/app/services/toast.service.ts`
- `Toast` - Interface notification toast

---

## 📋 Résumé par Domaine Métier

### 🏥 Authentification & Utilisateurs
- `src/app/models/user.model.ts` → UserResponseDTO, UserRequestDTO
- `src/app/models/auth-response.model.ts` → AuthResponse
- `src/app/models/login-request.model.ts` → LoginRequest
- `src/app/models/register-request.model.ts` → RegisterRequest, MedicalHistory

### 💊 Pharmacie
- `src/app/models/pharmacy.model.ts` → Pharmacy, PharmacyRequest, ProductResponseDTO, PharmacyResponseDTO, PharmacyStockResponseDTO, DeliveryResponseDTO, DeliveryAgency, DeliveryAgent
- `src/app/models/pharmacy-order.model.ts` → PharmacyOrderItemDTO, PharmacyOrderRequestDTO, PharmacyOrderResponseDTO, OrderItemDTO, OrderTrackingDTO
- `src/app/models/product.model.ts` → ProductRequest, Product
- `src/app/models/stock.model.ts` → ReceiveBatchRequest, StockMovementRequest, Batch, PharmacyStock, StockMovement, StockAlert

### 🏡 Soins à Domicile
- `src/app/models/homecare.model.ts` → HomeCareService, ServiceSummary, ReviewDTO, ProviderProfileDTO, ServiceProvider

### 📦 Commandes & Livraison
- `src/app/models/delivery.model.ts` → Modèles livraison
- `src/app/models/pharmacy-order.model.ts` → Tous les modèles commande

### 💳 Paiement
- `src/app/models/payment.model.ts` → PaymentRequestDTO, PaymentResponseDTO

### 🔔 Notifications
- `src/app/models/notification.model.ts` → NotificationResponseDTO, NotificationType

### 👤 Patient
- `src/app/models/patient.model.ts` → Modèles patient

### 📅 Événements
- `src/app/models/event.model.ts` → Modèles événement

---

## 🎯 Import Paths pour Register Component

```typescript
import { HomeCareService } from '../../../../models/homecare.model';
import { MedicalHistory, RegisterRequest } from '../../../../models/register-request.model';
import { NotificationResponseDTO } from '../../../../models/notification.model';
import { PaymentResponseDTO } from '../../../../models/payment.model';
import { UserResponseDTO, UserRequestDTO } from '../../../../models/user.model';
```

---

**Dernière mise à jour:** 2026-03-30
**Total d'interfaces:** 40+

