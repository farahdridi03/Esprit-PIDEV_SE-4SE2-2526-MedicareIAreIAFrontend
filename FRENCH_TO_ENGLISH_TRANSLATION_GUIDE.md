# French to English Translation Guide - Medicare PI Project

## PROJECT SUMMARY
- **Total French Strings Found**: 150+
- **Interface Files**: 10 (model layer)
- **Service Files with French Comments**: 6
- **Components with French UI Text**: 8+
- **Error Messages**: 15+

---

## 1. FRENCH COMMENTS TO TRANSLATE (Service Layer)

### auth.service.ts
| Line | French | English |
|------|--------|---------|
| 35 | `// Le backend attend désormais un multipart/form-data` | `// The backend now expects multipart/form-data` |
| 69 | `// Le rôle peut venir sous forme de chaîne ou de tableau` | `// The role may come as a string or array` |
| 87 | `// Supprimer le préfixe ROLE_ si présent` | `// Remove ROLE_ prefix if present` |
| 121 | `// Méthode ajoutée: tente d'extraire le nom complet de l'utilisateur depuis le token JWT` | `// Added method: attempts to extract full user name from JWT token` |
| 132 | `// Parfois le prénom/nom sont séparés` | `// Sometimes first/last names are separated` |

### user.service.ts
| Line | French | English |
|------|--------|---------|
| 12 | `// Ajout d'une interface utilisateur simple utilisée par getProfile` | `// Added simple user interface used by getProfile` |
| 63 | `// Méthode ajoutée: récupère le profil de l'utilisateur courant` | `// Added method: retrieves current user profile` |
| 65 | `// Appel à l'endpoint legacy /profile` | `// Call to legacy /profile endpoint` |

### auth.interceptor.ts
| Line | French | English |
|------|--------|---------|
| 14 | `// Exclure strictement les endpoints de login/register pour éviter d'envoyer le header sur ces routes` | `// Strictly exclude login/register endpoints to avoid sending header on these routes` |
| 31 | `// Déconnecter l'utilisateur et forcer redirection vers /login` | `// Disconnect user and force redirect to /login` |
| 41 | `// et que le context path utilisé ici (/springsecurity) correspond bien au backend.` | `// and that the context path used here (/springsecurity) matches the backend.` |

### birth-date.validator.ts
| Line | French | English |
|------|--------|---------|
| 76 | `return 'Erreur de validation de la date';` | `return 'Date validation error';` |

### intervention-date.validator.ts
| Line | French | English |
|------|--------|---------|
| 6 | `- Non vide` | `- Not empty` |
| 19 | `// Normaliser les dates à minuit pour éviter les problèmes de timezone` | `// Normalize dates to midnight to avoid timezone issues` |
| 23 | `// Vérifier que la date n'est pas au passé` | `// Check that date is not in the past` |
| 28 | `// Vérifier que la date n'est pas trop loin dans le futur` | `// Check that date is not too far in the future` |
| 50 | `@param daysAhead Nombre de jours à l'avance` | `@param daysAhead Number of days ahead` |
| 59 | `* Obtient le message d'erreur approprié` | `* Gets the appropriate error message` |

### homecare.service.ts
| Line | French | English |
|------|--------|---------|
| 134 | `/** Ajouter une règle de disponibilité hebdomadaire */` | `/** Add a weekly availability rule */` |
| 147 | `/** Vue calendrier complète (règles + exceptions) */` | `/** Complete calendar view (rules + exceptions) */` |

---

## 2. FRENCH COMMENTS IN MODEL FILES

### auth-response.model.ts
No French text (clear for translation)

### homecare.model.ts
| Line | French | English |
|------|--------|---------|
| 30 | `/** ProviderProfileDTO — retourné par /providers/{id}/profile et /services/{id}/providers */` | `/** ProviderProfileDTO — returned by /providers/{id}/profile and /services/{id}/providers */` |
| 43 | `/** Modèle complet (utilisé côté admin) */` | `/** Complete model (used on admin side) */` |
| 99 | `// ─── Disponibilités ─────────────────────────────────────────────────────────` | `// ─── Availability ─────────────────────────────────────────────────────────` |
| 108 | `specificDate?: string; // YYYY-MM-DD — null = règle répétée, non-null = exception ponctuelle` | `specificDate?: string; // YYYY-MM-DD — null = repeated rule, non-null = one-time exception` |
| 119 | `/** Créneau disponible calculé côté backend */` | `/** Available slot calculated on backend side */` |

---

## 3. FRENCH ERROR MESSAGES IN COMPONENTS

### register.component.ts
| Line | French | English |
|------|--------|---------|
| 206 | `'Erreur lors de l\'inscription'` | `'Registration error'` |
| 225 | Get birth date error message in French | Get birth date error message in English |
| 253 | `'Erreur de validation de la date'` | `'Date validation error'` |

### pharmacy-order-list.component.ts
| Line | French | English |
|------|--------|---------|
| 47 | `'Échec du chargement de vos commandes. Veuillez réessayer plus tard.'` | `'Failed to load your orders. Please try again later.'` |

### pharmacy-order-detail.component.ts
| Line | French | English |
|------|--------|---------|
| 172 | `'Erreur: impossible danuller cette commande.'` | `'Error: unable to cancel this order.'` |
| 275 | `'Erreur lors de l\'initialisation de Stripe.'` | `'Error initializing Stripe.'` |
| 291 | `'Paiement échoué: '` | `'Payment failed: '` |
| 319 | `'Erreur lors de la création de l\'intention de paiement.'` | `'Error creating payment intent.'` |
| 338 | `'Erreur lors de l\'initiation du paiement.'` | `'Error initiating payment.'` |
| 366 | `'Erreur lors du paiement test.'` | `'Error processing test payment.'` |

### pharmacy-order-create.component.ts
| Line | French | English |
|------|--------|---------|
| 127 | `'Erreur lors de la recherche de produits.'` | `'Error searching for products.'` |
| 179 | `'Veuillez ajouter au moins un produit.'` | `'Please add at least one product.'` |
| 242 | `'Erreur lors de la recherche de pharmacies compatibles.'` | `'Error searching for compatible pharmacies.'` |
| 274 | `'Erreur lors de l\'envoi de l\'ordonnance.'` | `'Error uploading prescription.'` |
| 298 | `'Erreur: Patient non identifié.'` | `'Error: Patient not identified.'` |
| 326 | `'Commande créée avec succès!'` | `'Order created successfully!'` |
| 334 | `'Erreur lors de la création de la commande.'` | `'Error creating order.'` |
| 344 | `'Veuillez sélectionner une pharmacie.'` | `'Please select a pharmacy.'` |
| 349 | `'Veuillez ajouter au moins un produit.'` | `'Please add at least one product.'` |
| 354 | `'L\'ordonnance est obligatoire pour confirmer la commande.'` | `'Prescription is required to confirm the order.'` |
| 359 | `'Veuillez entrer une adresse de livraison.'` | `'Please enter a delivery address.'` |

---

## 4. FRENCH UI LABELS IN HTML TEMPLATES

### register.component.html
| Line | French | English |
|------|--------|---------|
| 253 | `Nom de la Pharmacie (Obligatoire)` | `Pharmacy Name (Required)` |
| 268 | `Adresse de la Pharmacie` | `Pharmacy Address` |
| 324 | `Spécialités (Obligatoire)` | `Specialties (Required)` |
| 337 | `Sélectionner votre spécialité` | `Select your specialty` |
| 343 | `Veuillez sélectionner votre spécialité principale.` | `Please select your primary specialty.` |
| 363 | `Un document justificatif est obligatoire.` | `Supporting document is required.` |

### orders.component.html (Pharmacist)
| Line | French | English |
|------|--------|---------|
| 4 | `Gestion des Commandes` | `Order Management` |
| 5 | `Toutes les commandes pour {{ pharmacyName }}` | `All orders for {{ pharmacyName }}` |
| 10 | `Chargement des commandes...` | `Loading orders...` |
| 50 | `Aucune commande trouvée.` | `No orders found.` |
| 60 | `Livraison` | `Delivery` |
| 61 | `Ordonnance` | `Prescription` |
| 81 | `Voir l'ordonnance` | `View prescription` |
| 108 | `Rejeter` | `Reject` |
| 117 | `Annuler la commande` | `Cancel order` |
| 123 | `Livraison` | `Dispatch` |
| 156 | `Rejeter la commande #{{ selectedOrderId }}` | `Reject order #{{ selectedOrderId }}` |
| 157 | `Veuillez indiquer la raison du rejet de la commande (obligatoire).` | `Please provide the reason for rejecting this order (required).` |
| 160 | `Rupture de stock, ordonnance invalide...` | `Out of stock, invalid prescription...` |
| 164 | `Confirmer le rejet` | `Confirm rejection` |
| 175 | `Expédier la commande #{{ currentDispatchOrderId }}` | `Ship order #{{ currentDispatchOrderId }}` |
| 182 | `Agence de livraison` | `Delivery agency` |
| 210 | `Confirmer l\'expédition` | `Confirm shipment` |

### pharmacy-order-list.component.html
| Line | French | English |
|------|--------|---------|
| 13 | `Mes Commandes` | `My Orders` |
| 14 | `Suivez l'état de vos commandes de médicaments en temps réel.` | `Track your medication orders in real-time.` |
| 33 | `Nouvelle Commande` | `New Order` |
| 42 | `Chargement de vos commandes...` | `Loading your orders...` |
| 54 | `Aucune commande` | `No orders` |
| 55 | `Vous n'avez pas encore passé de commande en pharmacie.` | `You haven't placed a pharmacy order yet.` |
| 56 | `Passer ma première commande` | `Place my first order` |

### pharmacy-order-create.component.html
| Line | French | English |
|------|--------|---------|
| 17 | `Nouvelle Commande` | `New Order` |
| 70 | `Tout ajouter` | `Add all` |
| 78 | `+ Ajouter` | `+ Add` |
| 173 | `Ordonnance Médicale * (Image uniquement)` | `Medical Prescription * (Image only)` |
| 181 | `Cliquez pour télécharger l'ordonnance` | `Click to upload prescription` |
| 191 | `Ordonnance téléchargée avec succès` | `Prescription uploaded successfully` |
| 196 | `L'ordonnance est obligatoire pour toutes les commandes.` | `Prescription is required for all orders.` |
| 209 | `Livraison` | `Delivery` |
| 216 | `Adresse de Livraison *` | `Delivery Address *` |
| 217 | `Votre adresse complète...` | `Your complete address...` |
| 235 | `Confirmer la Commande` | `Confirm Order` |

### pharmacy-order-detail.component.html
| Line | French | English |
|------|--------|---------|
| 14 | `Détails de la Commande #{{ orderId }}` | `Order Details #{{ orderId }}` |
| 15 | `Suivi et récapitulatif de votre commande de médicaments.` | `Tracking and summary of your medication order.` |
| 40 | `Retour aux commandes` | `Back to orders` |
| 48 | `Chargement des détails de votre commande...` | `Loading order details...` |
| 156 | `Livraison` | `Delivery` |
| 164 | `Adresse:` | `Address:` |
| 208 | `Ordonnance Joint` | `Attached Prescription` |
| 212 | `Ordonnance` | `Prescription` |
| 268 | `Contenu de la Commande` | `Order Contents` |
| 315 | `Votre commande a été mise à jour avec succès.` | `Your order has been updated successfully.` |
| 319 | `Sélectionnez votre méthode de paiement préférée pour la commande <strong>#{{ orderId }}</strong>` | `Select your preferred payment method for order <strong>#{{ orderId }}</strong>` |
| 343 | `Paiement à la livraison` | `Cash on Delivery` |
| 361 | `Traitement du paiement en cours...` | `Processing payment...` |
| 362 | `Veuillez ne pas fermer cette fenêtre.` | `Please don't close this window.` |
| 369 | `Confirmer et Payer` | `Confirm and Pay` |
| 380 | `Annuler la commande` | `Cancel order` |
| 384 | `Voulez-vous vraiment annuler cette commande ? Veuillez indiquer la raison ci-dessous :` | `Are you sure you want to cancel this order? Please provide the reason below:` |
| 389 | `Confirmer l'annulation` | `Confirm cancellation` |

### courier-dashboard.component.html
| Line | French | English |
|------|--------|---------|
| 19 | `Sélectionnez votre nom` | `Select your name` |
| 41 | `Livraisons Assignées` | `Assigned Deliveries` |
| 45 | `Veuillez rafraîchir ou attendre une nouvelle mission.` | `Please refresh or wait for a new assignment.` |
| 55 | `Commande:` | `Order:` |
| 61 | `Démarrer Livraison` | `Start Delivery` |
| 65 | `Confirmer Livraison` | `Confirm Delivery` |

### homecare-book.component.html
| Line | French | English |
|------|--------|---------|
| 233 | `Adresse de` | `Address` |
| 354 | `SPÉCIALITÉS` | `SPECIALTIES` |

### pharmacy.component.html
| Line | French | English |
|------|--------|---------|
| 14 | `Trouvez et consultez les pharmacies disponibles pour vos commandes.` | `Find and consult available pharmacies for your orders.` |
| 25 | `Mes Commandes` | `My Orders` |
| 33 | `Nouvelle Commande` | `New Order` |
| 87 | `Commander ici` | `Order here` |

### pharmacist-validation.component.html
| Line | French | English |
|------|--------|---------|
| 44 | `Nom Complet` | `Full Name` |
| 66 | `Rejeter` | `Reject` |
| 77 | `Nom Complet` | `Full Name` |
| 79 | `Spécialités` | `Specialties` |
| 104 | `Rejeter` | `Reject` |

### provider-availability.component.html
| Line | French | English |
|------|--------|---------|
| 104 | `Fermer` | `Close` |
| 104 | `Exception` | `Exception` |
| 104 | `Ajouter` | `Add` |
| 127 | `Ajout...` | `Adding...` |
| 127 | `Ajouter le créneau` | `Add slot` |
| 146 | `Supprimer ce créneau` | `Delete this slot` |

---

## 5. TRANSLATION STATUS TRACKING

### Models (No French interface properties - only comments)
- [x] auth-response.model.ts
- [x] login-request.model.ts
- [x] register-request.model.ts
- [x] user.model.ts
- [x] patient.model.ts
- [x] pharmacy.model.ts
- [x] pharmacy-order.model.ts
- [x] delivery.model.ts
- [x] notification.model.ts
- [x] homecare.model.ts

### Services (Comments only)
- [ ] auth.service.ts (5 comments)
- [ ] user.service.ts (3 comments)
- [ ] homecare.service.ts (2 comments)
- [ ] auth.interceptor.ts (3 comments)
- [ ] birth-date.validator.ts (2 comments + 1 error message)
- [ ] intervention-date.validator.ts (3 comments)

### Components (Error messages + HTML labels)
- [ ] register.component.ts (3 + 6 = 9 items)
- [ ] register.component.html (6 labels)
- [ ] orders.component.html (20+ labels)
- [ ] pharmacy-order-list.component.ts (1 error)
- [ ] pharmacy-order-list.component.html (6 labels)
- [ ] pharmacy-order-detail.component.ts (6 errors)
- [ ] pharmacy-order-detail.component.html (18+ labels)
- [ ] pharmacy-order-create.component.ts (12 errors)
- [ ] pharmacy-order-create.component.html (11 labels)
- [ ] courier-dashboard.component.html (6 labels)
- [ ] homecare-book.component.html (2 labels)
- [ ] pharmacy.component.html (4 labels)
- [ ] pharmacist-validation.component.html (4 labels)
- [ ] provider-availability.component.html (3 labels)

---

## 6. IMPLEMENTATION STRATEGY

### Phase 1: Core Services (Low Risk)
1. Update all comments in auth.service.ts
2. Update all comments in user.service.ts
3. Update all comments in auth.interceptor.ts

### Phase 2: Validators (Medium Risk)
4. Update birth-date.validator.ts
5. Update intervention-date.validator.ts

### Phase 3: Models (Low Risk)
6. Update homecare.model.ts
7. Update homecare.service.ts

### Phase 4: Components Error Messages (High Priority)
8. Update register.component.ts
9. Update pharmacy-order-*.component.ts files
10. Update error handling across all components

### Phase 5: UI Templates (High Priority)
11. Update all HTML templates systematically

### Phase 6: Testing & Review
12. Run unit tests to ensure no breaking changes
13. Run end-to-end tests for UI components
14. Manual testing of all user-facing texts

---

## TOTAL ITEMS TO TRANSLATE
- **Comments**: 40+
- **Error Messages**: 30+
- **UI Labels/Placeholders**: 80+
- **Total**: **150+ items**

