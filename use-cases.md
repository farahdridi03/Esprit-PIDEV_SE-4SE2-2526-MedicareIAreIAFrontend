# 4.1.2 Use Case Text Descriptions per Module

## Donations & Aid Module

| Use Case | Make a Donation |
| :--- | :--- |
| **Actor** | Patient (Donor) |
| **Description** | The patient logs into the platform, navigates to the Donations & Aid section, and clicks + New Donation. The patient fills in the donor name, selects the donation type (Money or Material), and sets the status. For a monetary donation, the patient enters the amount in TND. For a material donation, the patient specifies the category, quantity, a description, and optionally uploads a photo of the item. The patient then confirms and submits the form. The system records the donation and marks it as Available in the donation inventory. |
| **Preconditions** | The patient is registered and logged in. The Donations & Aid module is accessible. |
| **Postconditions** | The donation is saved in the system and displayed in the Donations Inventory (Admin Portal) and on the patient's Donations page with status CONFIRMED. The donation is now available for assignment. |
| **Table 4.1** | **Use Case Description – Make a Donation** |

| Use Case | Request Aid or Resources |
| :--- | :--- |
| **Actor** | Patient (Recipient) |
| **Description** | The patient logs into the platform, navigates to the Donations & Aid section, and clicks Request Aid. A modal form appears prompting the patient to describe precisely what they need (e.g., wheelchair, financial aid) in up to 500 characters. The patient may optionally attach a supporting document (PDF or image). The patient submits the form. The system records the request and notifies the administrator in real time. |
| **Preconditions** | The patient is registered and logged in. |
| **Postconditions** | The aid request is saved with status PENDING. The administrator receives a real-time notification. |
| **Table 4.2** | **Use Case Description – Request Aid or Resources** |

| Use Case | Assign Donation to Aid Request |
| :--- | :--- |
| **Actor** | Administrator |
| **Description** | The administrator logs into the Admin Portal and reviews all pending requests. Upon receiving a notification of a new request, the administrator can view the attached document and click Assign Donation. A modal appears listing all available donations; the administrator selects the most appropriate resource and confirms. The system links the donation to the request and updates both statuses. |
| **Preconditions** | Administrator is logged in. At least one aid request with PENDING status exists. At least one available donation exists. |
| **Postconditions** | The selected donation status changes to ASSIGNED. The patient's aid request status is updated to ASSIGNED. |
| **Table 4.3** | **Use Case Description – Assign Donation to Aid Request** |

## Emergency Management Module

| Use Case | Receive and Process Glycemic Device Alert |
| :--- | :--- |
| **Actor** | Clinic (Primary) — Smart Glycemic Device (System) — Patient (Secondary) |
| **Description** | A smart glycemic device monitors blood sugar levels. When an anomaly is detected, the device automatically triggers an emergency alert. The system records the alert with patient ID, severity, GPS coordinates, and timestamp, then sends a notification to the Clinic Portal. Clinic staff receives a popup with the patient's name and location. Staff checks if the patient canceled the alert. If active, staff reviews emergency contacts and can click "Send Ambulance" to coordinate intervention. |
| **Preconditions** | Patient is registered and has a paired device. Clinic is logged in. Emergency contacts recorded. |
| **Postconditions** | The alert is logged with full history. If an ambulance is dispatched, its status is updated and the intervention recorded. |
| **Table 4.4** | **Use Case Description – Receive and Process Glycemic Device Alert** |

| Use Case | Manage Ambulance Fleet |
| :--- | :--- |
| **Actor** | Clinic |
| **Description** | Clinic staff logs into the portal and navigates to the Ambulance section. The fleet overview shows all registered ambulances as cards with license plate and status (AVAILABLE, ON MISSION). Staff can click "+ Add Ambulance", enter details, and set initial status. When an emergency alert is active, staff can dispatch an available ambulance directly from the notification. |
| **Preconditions** | Clinic staff is logged in. For dispatch, an active alert must exist and an ambulance must be AVAILABLE. |
| **Postconditions** | New ambulances are registered. When dispatched, status updates to ON MISSION. |
| **Table 4.5** | **Use Case Description – Manage Ambulance Fleet** |

## Authentication & User Profile Module

| Use Case | User Registration |
| :--- | :--- |
| **Actor** | Visitor (Patient, Pharmacist, or Home Care Provider) |
| **Description** | The visitor selects a role (Patient, Pharmacist, or Provider) and fills in personal information (Full Name, Email, Phone, Birth Date, password). For Patients: fields for medical history and emergency contacts appear. For Professionals: fields for pharmacy details or specialty selection appear, and they must upload a certification document. After accepting terms, the user submits. The system creates the account and redirects to login. |
| **Preconditions** | Visitor is not logged in. System is accessible. |
| **Postconditions** | A new user account is created. Patients are immediately ACTIVE. Professionals are set to PENDING for admin approval. |
| **Table 4.6** | **Use Case Description – User Registration** |

| Use Case | User Login |
| :--- | :--- |
| **Actor** | Registered User |
| **Description** | The user enters email and password on the login page. The system validates credentials. If correct, the system generates a JWT token and redirects the user to their specific dashboard based on their role (Patient Portal, Admin Dashboard, etc.). |
| **Preconditions** | User has an account. Professional accounts must be approved by Admin. |
| **Postconditions** | User is authenticated. A session is established. |
| **Table 4.7** | **Use Case Description – User Login** |

## HomeCare Services Module

| Use Case | Book a HomeCare Service |
| :--- | :--- |
| **Actor** | Patient |
| **Description** | The patient browses the catalog of home care services. They can filter by specialty. After selecting a provider, they view available time slots. The patient selects a slot, describes their needs, and confirms. The system records the request and notifies the provider. |
| **Preconditions** | Patient is logged in. Providers have configured their availability. |
| **Postconditions** | A service request is created with status PENDING. The slot is temporarily reserved. |
| **Table 4.8** | **Use Case Description – Book a HomeCare Service** |

| Use Case | Manage Provider Availability |
| :--- | :--- |
| **Actor** | Home Care Provider |
| **Description** | The provider logs in and accesses the Availability Management section. They can set weekly working hours and add unavailability periods (leave, emergencies). The provider can also see all upcoming bookings on a calendar and mark interventions as completed. |
| **Preconditions** | Provider is logged in. Account is approved. |
| **Postconditions** | Availability calendar is updated in real-time. Slots are opened or closed for patient booking. |
| **Table 4.9** | **Use Case Description – Manage Provider Availability** |

## Pharmacy & Medication Module

| Use Case | Order Medication |
| :--- | :--- |
| **Actor** | Patient |
| **Description** | The patient searches for a medication via the pharmacy engine. They select a nearby pharmacy with stock. They add items to the cart and proceed to checkout, choosing between "Pickup" or "Home Delivery". They can upload a photo of the prescription. Once confirmed, the order is sent to the selected pharmacy. |
| **Preconditions** | Patient is logged in. Pharmacy has updated inventory. |
| **Postconditions** | A Pharmacy Order is created with status PENDING. Stock is reserved. |
| **Table 4.10** | **Use Case Description – Order Medication** |

| Use Case | Manage Pharmacy Stock |
| :--- | :--- |
| **Actor** | Pharmacist |
| **Description** | The pharmacist accesses the inventory management section. They can add products, update quantities, and set low-stock alert thresholds. They receive notifications when critical stock levels are low or items are nearing expiration. |
| **Preconditions** | Pharmacist is logged in. |
| **Postconditions** | Pharmacy stock database is updated, ensuring accurate info for customer searches. |
| **Table 4.11** | **Use Case Description – Manage Pharmacy Stock** |

## Medical Events & Community Module

| Use Case | Create and Manage Medical Events |
| :--- | :--- |
| **Actor** | Administrator / Clinic |
| **Description** | The admin/clinic staff clicks "+ New Event" and fills in Title, Description, Date, Location, Type (Webinar, Blood Drive, etc.) and uploads an image. Once published, the event appears on the public portal. Admin can monitor attendee counts and registration lists. |
| **Preconditions** | User has administrative privileges. |
| **Postconditions** | Event is published. Notifications sent to interested users. |
| **Table 4.12** | **Use Case Description – Create and Manage Medical Events** |

| Use Case | Register for a Medical Event |
| :--- | :--- |
| **Actor** | Patient / Visitor |
| **Description** | The user views the list of upcoming medical events. After selecting an event, they view full details and click "Register". The system records the attendance and sends a confirmation email or notification. |
| **Preconditions** | Event is open for registration. |
| **Postconditions** | User is added to the participant list. Available capacity decreases. |
| **Table 4.13** | **Use Case Description – Register for a Medical Event** |

## Delivery & Logistics Module

| Use Case | Deliver Medication Order |
| :--- | :--- |
| **Actor** | Delivery Agent |
| **Description** | The agent views assigned missions on their dashboard. They pick up the package from the partner pharmacy and mark the status as "Out for Delivery". Upon arrival at the patient's address, they hand over the package and confirm delivery in the system. |
| **Preconditions** | Agent is logged in. An order has been assigned to their agency. |
| **Postconditions** | Order status changes to DELIVERED. Patient receives notification. |
| **Table 4.14** | **Use Case Description – Deliver Medication Order** |
