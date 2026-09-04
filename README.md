# Grab It

> **Local Shopping • Mobile Optimized • Fast Delivery • Within 5 KM**

Grab It is a mobile-optimized local shopping and quick-delivery web application designed to connect customers with a nearby shop. Customers can browse available products, add items to their cart, place orders, and have their purchases delivered directly to their doorstep.

The platform is designed specifically for local delivery within a **5 km radius** of the shop, allowing the business to efficiently serve nearby customers while providing a convenient digital shopping experience.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Objectives](#-objectives)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Service Providers](#-service-providers)
- [System Architecture](#-system-architecture)
- [How Grab It Works](#-how-grab-it-works)
- [Customer Workflow](#-customer-workflow)
- [Shop and Product Management](#-shop-and-product-management)
- [Shopping Cart](#-shopping-cart)
- [Order Management](#-order-management)
- [5 KM Delivery System](#-5-km-delivery-system)
- [Image and Object Storage](#-image-and-object-storage)
- [Frontend Development](#-frontend-development)
- [Backend Development](#-backend-development)
- [Database](#-database)
- [API Communication](#-api-communication)
- [Mobile Optimization](#-mobile-optimization)
- [Security](#-security)
- [Validation and Error Handling](#-validation-and-error-handling)
- [Development Process](#-development-process)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Future Enhancements](#-future-enhancements)
- [Conclusion](#-conclusion)
- [Team Members](#-team-members)

---

## 🛍️ Project Overview

Grab It is a digital shopping platform developed for a local shop. 

The application allows customers to access the shop's products through a web-based interface instead of having to physically visit the store. Customers can explore products, select the items they need, add them to their cart, and complete an order for local delivery.

The application is primarily optimized for mobile devices, making it convenient for customers to shop using smartphones.

The delivery system is designed around a **5 km service radius**. Only customers located within the supported delivery area can place orders for delivery.

### Core Concept

```text
                  GRAB IT
                     |
        ┌────────────┴────────────┐
        │                         │
     Customer                   Shop
        │                         │
        ▼                         ▼
 Browse Products            Manage Products
        │                         │
        ▼                         ▼
    Add to Cart              Manage Orders
        │
        ▼
     Checkout
        │
        ▼
  Location Validation
        │
        ▼
    <= 5 KM ?
     /       \
   YES        NO
    |          |
    ▼          ▼
  Order     Delivery
 Placed    Unavailable
    |
    ▼
 Shop Processes
    |
    ▼
 Delivery
```

---

## 🎯 Objectives

The main objectives of Grab It are:

- Provide a convenient online shopping platform for a local shop.
- Optimize the shopping experience for mobile users.
- Digitize the shop's product catalog.
- Allow customers to search and browse products.
- Provide an easy-to-use shopping cart.
- Enable customers to place orders online.
- Restrict delivery to a 5 km radius.
- Provide efficient order management.
- Store product images using cloud-based object storage.
- Provide a scalable architecture for future development.

---

## ✨ Key Features

### 👤 Customer Features
- **Mobile-Optimized User Interface:** Streamlined touch navigation and fluid layouts.
- **Product Browsing & Discovery:** Browse products with category filtering.
- **Search Functionality:** Real-time search by product name and keywords.
- **Detailed Product Views:** High-resolution images, descriptions, pricing, and live availability.
- **Shopping Cart Management:** Add items, update quantities, and remove products with instant subtotal calculations.
- **Seamless Checkout:** Delivery address selection with real-time 5 km geolocation validation.
- **Order Tracking & History:** View past orders and monitor real-time fulfillment status.

### 🏪 Shop Features
- **Product Catalog Management:** Add, edit, and delete products.
- **Category & Inventory Control:** Organize categories and toggle product stock status.
- **Media Management:** Upload and update cloud-hosted product images.
- **Order Management:** View incoming orders and update delivery/fulfillment states in real-time.

### ⚙️ Platform Features
- Modern **REST API** architecture.
- Cloud-hosted relational database.
- Cloud-based media and object storage.
- Mobile-first responsive design.
- Geolocation-based delivery radius validation.
- Secure token-based authentication and role authorization.
- Cloud-native deployment.

---

## 🛠️ Technology Stack

Grab It uses a modern web application architecture consisting of a React frontend, FastAPI backend, PostgreSQL database, and cloud-based image storage.

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React | Component-based interactive UI library |
| **Backend** | FastAPI | High-performance Python async web framework |
| **Database** | PostgreSQL | Robust relational SQL database engine |
| **Object Storage** | Cloudinary | Cloud-based media management & CDN |
| **Frontend Hosting** | Vercel | Global edge hosting platform |
| **Backend Hosting** | Vercel | Serverless API runtime hosting |
| **Database Provider** | Supabase | Managed PostgreSQL cloud platform |
| **Object Cloud Provider**| Cloudinary | Cloud image optimization & storage |

---

### Technology Overview

#### Frontend — React
The frontend is developed using React and is responsible for:
- User interface rendering.
- Product display and grid views.
- Seamless client-side navigation.
- Interactive shopping cart.
- Checkout workflows and address input.
- User interactions and micro-animations.
- REST API communication with the backend.
- Responsive layouts and mobile-first optimization.

The application is structured using modular, reusable React components to make the frontend easier to maintain and extend.

#### Backend — FastAPI
The backend is developed using FastAPI to provide a high-performance REST API and handle core business logic:
- User authentication and authorization.
- Product catalog operations (CRUD).
- Shopping cart validation and state tracking.
- Order processing and lifecycle updates.
- Secure database communication via ORM.
- Request payload validation (Pydantic).
- 5 km delivery-radius mathematical validation.
- Product image upload coordination with Cloudinary.

#### Database — PostgreSQL
PostgreSQL serves as the primary relational database (hosted via Supabase), storing structured entities:
- Users (Customers & Shop Admins)
- Products & Metadata
- Categories
- Shopping Carts & Cart Items
- Orders & Order Line Items
- Delivery Addresses
- Order Status Logs

#### Object Cloud — Cloudinary
Cloudinary handles all product image and media storage:
- Product images are stored separately from relational data.
- Instead of storing heavy binary blobs in PostgreSQL, images reside on Cloudinary's CDN, while only secure URLs and public IDs are stored in the database.
- Keeps the database lightweight and ensures rapid worldwide image delivery.

---

## ☁️ Service Providers

| Service | Provider | Purpose |
| :--- | :--- | :--- |
| **Frontend Hosting** | Vercel | Global CDN deployment of React client |
| **Backend Hosting** | Vercel | Serverless deployment of FastAPI API routes |
| **Database** | Supabase | Managed PostgreSQL instance with high availability |
| **Image / Object Storage** | Cloudinary | Cloud storage, transformations, and asset delivery |

---

## 🏗️ System Architecture

```text
                         ┌───────────────────┐
                         │     Customer      │
                         │  Mobile / Browser │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │      Vercel       │
                         │  React Frontend   │
                         └─────────┬─────────┘
                                   │
                              REST API
                                   │
                                   ▼
                         ┌───────────────────┐
                         │      Vercel       │
                         │   FastAPI Backend │
                         └──────┬──────┬─────┘
                                │      │
                     ┌──────────┘      └──────────┐
                     ▼                            ▼
             ┌─────────────────┐          ┌─────────────────┐
             │    Supabase     │          │   Cloudinary    │
             │   PostgreSQL    │          │ Product Images  │
             └─────────────────┘          └─────────────────┘
```

### Architecture Flow
1. The customer accesses Grab It through a mobile or desktop browser.
2. The React frontend is served through Vercel.
3. React communicates with the FastAPI backend through REST APIs.
4. The FastAPI backend processes requests and business logic.
5. PostgreSQL, hosted through Supabase, stores structured application data.
6. Cloudinary stores and serves product images.
7. The backend returns the required information to the React frontend.
8. React updates the interface based on the API response.

---

## 🔄 How Grab It Works

```text
Customer Opens Grab It
        ↓
Browse / Search Products
        ↓
Select Products
        ↓
Add to Cart
        ↓
Review Cart
        ↓
Checkout
        ↓
Enter Delivery Address
        ↓
Validate Location
        ↓
Check 5 KM Radius
        ↓
Confirm Order
        ↓
Order Stored in Database
        ↓
Shop Receives Order
        ↓
Shop Prepares Products
        ↓
Order Sent for Delivery
        ↓
Customer Receives Order
        ↓
Order Marked as Delivered
```

---

## 🚶 Customer Workflow

1. **Accessing the Application:** Customers open Grab It in a web browser on their smartphones or desktop devices.
2. **Browsing Products:** View categorized catalog with names, images, descriptions, pricing, and live availability.
3. **Searching:** Use the search bar to find specific products instantly.
4. **Adding Products to Cart:** Select items and quantities. The cart calculates subtotals and total amounts dynamically.
5. **Checkout:** Review the order and submit delivery address/location.
6. **Order Placement:** System validates that the delivery location is within the 5 km service boundary before finalizing the order in the database.

---

## 📦 Shop and Product Management

The shop maintains the product catalog and processes customer orders.

### Product Data Structure
```text
Product
├── ID
├── Name
├── Description
├── Price
├── Category
├── Stock / Availability
├── Image URL
├── Created At
└── Updated At
```

### Core Operations
- Adding, updating, and removing products.
- Price, category, and inventory management.
- Uploading and updating product images via Cloudinary integration.

---

## 🛒 Shopping Cart

The shopping cart acts as a dynamic staging area for customer selections:
- Add and remove items.
- Increment or decrement item quantities.
- Real-time calculation of item subtotals and total checkout value.
- Pre-order validation to confirm item availability before proceeding.

---

## 📋 Order Management

Once an order is confirmed, it is recorded in PostgreSQL.

### Order Data Structure
```text
Order
├── Order ID
├── Customer ID
├── Delivery Address
├── Order Items
│   ├── Product ID
│   ├── Quantity
│   └── Price
├── Total Amount
├── Order Status
└── Order Date
```

### Order Status Lifecycle
```text
Order Placed  ➔  Order Confirmed  ➔  Preparing  ➔  Ready for Delivery  ➔  Out for Delivery  ➔  Delivered
```

---

## 📍 5 KM Delivery System

The local delivery system is the core differentiator of Grab It, keeping operations focused within a **5 km radius** of the shop.

```text
Maximum Delivery Radius = 5 KM
```

- **Within Radius ($\le 5\text{ KM}$):** The delivery address is validated and the customer is permitted to complete checkout.
- **Outside Radius ($> 5\text{ KM}$):** The system displays a friendly notice indicating that the address is outside the supported delivery area.

---

## 🖼️ Image and Object Storage

Product images are decoupled from database records using Cloudinary:

```text
Shop / Admin
     ↓
Upload Product Image
     ↓
Cloudinary (Optimized & Stored)
     ↓
Secure Image URL Generated
     ↓
URL Saved with Product Record
     ↓
PostgreSQL (Supabase)
     ↓
React Frontend
     ↓
Display Image to Customer
```

---

## 💻 Frontend Development

Built with **React** using modular, reusable components:
- **Navigation:** Top bar, search bar, category drawers, and mobile bottom tab bar.
- **Product Views:** Product cards, product grid, detail modals, and category badges.
- **Cart & Checkout:** Slide-over cart drawer, quantity steppers, address picker, and summary card.
- **Order Tracking:** Real-time visual timeline and order history list.
- **Authentication:** Login, registration, and profile views.

---

## ⚡ Backend Development

Built with **FastAPI** to provide clean RESTful endpoints:

```text
React Frontend  ➔  FastAPI API  ➔  Authentication & Validation  ➔  Business Logic  ➔  Supabase (PostgreSQL)  ➔  Response
```

### Key Responsibilities:
- Token-based authentication and route protection.
- Input validation and schema serialization with Pydantic.
- Geolocation distance calculation for 5 km delivery boundaries.
- Database query execution via ORM.
- Cloudinary media upload handling.

---

## 🗄️ Database

PostgreSQL (managed via Supabase) stores relational data:

```text
             User
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
   Address          Order
                     │
                     ▼
                Order Items
                     │
                     ▼
                  Product
                     │
                     ▼
                 Category
```

---

## 🔌 API Communication

### Authentication Endpoints
- `POST /api/register` — Register a new customer
- `POST /api/login` — Authenticate user and issue token
- `POST /api/logout` — Revoke active session

### Product Endpoints
- `GET /api/products` — Retrieve all active products
- `GET /api/products/{id}` — Retrieve specific product details
- `POST /api/products` — Create a new product (Admin)
- `PUT /api/products/{id}` — Update product details (Admin)
- `DELETE /api/products/{id}` — Delete a product (Admin)

### Cart Endpoints
- `GET /api/cart` — Fetch user's active cart
- `POST /api/cart` — Add item to cart
- `PUT /api/cart/{id}` — Update item quantity
- `DELETE /api/cart/{id}` — Remove item from cart

### Order Endpoints
- `POST /api/orders` — Place a new order (with 5 km radius check)
- `GET /api/orders` — List user's past orders
- `GET /api/orders/{id}` — Get single order tracking details
- `PUT /api/orders/{id}/status` — Update order status (Admin)

---

## 📱 Mobile Optimization

Grab It is built with a **mobile-first** approach:
- **Touch-friendly targets:** Large buttons and accessible tap areas.
- **Adaptive layout:** Responsive grids that resize smoothly across phone, tablet, and desktop screens.
- **Simplified checkout:** Minimal form steps optimized for mobile keyboards.
- **Lightweight assets:** Compressed images and fast load times.

```text
Open Grab It  ➔  Browse Products  ➔  Select Product  ➔  Add to Cart  ➔  Checkout  ➔  Confirm Location  ➔  Place Order  ➔  Track Order
```

---

## 🔒 Security

- **Authentication & Authorization:** Secure password hashing (bcrypt) and JWT/token validation.
- **Request Validation:** Strict type checking and sanitization to prevent injection attacks.
- **Environment Isolation:** All API keys, database credentials, and secret tokens are stored securely in environment variables.
- **Protected Endpoints:** Admin-only routes for inventory, pricing, and order status updates.

---

## ✅ Validation and Error Handling

```text
Checkout
   ↓
Is User Authenticated?
   ↓
Is Cart Valid & Not Empty?
   ↓
Are Products In Stock?
   ↓
Is Quantity Valid?
   ↓
Is Delivery Address Provided?
   ↓
Is Location Within 5 KM?
   ↓
Create Order in Database
```

If any check fails, the API returns a structured error response, and the frontend informs the user with an actionable message.

---

## 🚀 Development Process

1. **Requirement Analysis:** Defined the core scope for local 5 km shopping, mobile ordering, and catalog management.
2. **UI/UX Design:** Designed mobile-first wireframes focusing on quick ordering flows.
3. **Frontend Development:** Implemented React UI components and state management.
4. **Backend Development:** Built FastAPI routes, Pydantic schemas, and delivery validation logic.
5. **Database Setup:** Modeled PostgreSQL schemas on Supabase.
6. **Cloud Image Integration:** Connected Cloudinary API for image uploads and CDN delivery.
7. **API Integration:** Linked React client state with FastAPI endpoints.
8. **Feature Integration:** Assembled authentication, cart, location checks, and order fulfillment.
9. **Testing:** Conducted unit, integration, mobile responsiveness, and location validation tests.
10. **Deployment:** Deployed frontend and backend onto Vercel with cloud databases on Supabase and assets on Cloudinary.

---

## 🌐 Deployment

```text
                    ┌──────────────────┐
                    │    Customer      │
                    │ Mobile / Desktop │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      Vercel      │
                    │  React Frontend  │
                    └────────┬─────────┘
                             │
                             │ REST API
                             ▼
                    ┌──────────────────┐
                    │      Vercel      │
                    │ FastAPI Backend  │
                    └───────┬───┬──────┘
                            │   │
                 ┌──────────┘   └──────────┐
                 ▼                         ▼
        ┌─────────────────┐       ┌─────────────────┐
        │    Supabase     │       │   Cloudinary    │
        │   PostgreSQL    │       │ Product Images  │
        └─────────────────┘       └─────────────────┘
```

---

## 🧪 Testing

- **Functional Testing:** Verified registration, login, product browsing, cart updates, address geocoding, 5 km validation, and checkout.
- **Mobile Testing:** Tested on multiple screen viewports (iOS & Android) for responsive touch interaction and typography scaling.
- **API Testing:** Automated testing of FastAPI endpoints with valid/invalid payloads, error boundary handling, and database transactions.

---

## 🔮 Future Enhancements

- 💳 **Payment Gateway Integration:** Support for Credit/Debit Cards, UPI, and Digital Wallets.
- 💵 **Cash on Delivery (COD):** Flexible payment upon physical delivery.
- 🗺️ **Live Driver Tracking:** Real-time map tracking of delivery personnel.
- 🔔 **Push & SMS Notifications:** Instant status updates on order preparation and dispatch.
- ⭐ **Customer Reviews & Ratings:** Feedback system on products and service quality.
- 🏷️ **Coupons & Promotions:** Discount codes and seasonal sales campaigns.
- 📊 **Analytics Dashboard:** Revenue, inventory turnover, and popular product insights for shop owners.
- 🏬 **Multi-Branch Support:** Enable multi-store setups with dynamic branch selection.

---

## 🏁 Conclusion

Grab It is a mobile-optimized local shopping and delivery platform developed to digitally connect customers with a nearby shop.

The application brings together a **React** frontend, **FastAPI** backend, **PostgreSQL** database (via Supabase), and **Cloudinary** media storage into a unified, lightweight, and high-performance shopping ecosystem.

By restricting fulfillment to a **5 km delivery radius**, Grab It ensures fast, predictable, and manageable local delivery operations while providing a modern digital shopping experience.

---

## 👥 Team Members

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Jason Kenneth N** | **Team Lead** | Team coordination, project planning, technical direction, and overall system development and also worked on Complete End to End Working of the "Admin Portal" of the "Grab It" Application. |
| **Akash S B** | **Team Member** | Worked on Complete End to End Working of the "Customer Portal" of the "Grab It" Application. |
| **Priyanka Kushwah** | **Team Member** | Worked on Complete End to End Working of the "Seller Portal" of the "Grab It" Application. |
| **I Thabeethal Asnath** | **Team Member** | Worked on Complete End to End Working of the "Delivery Agent Portal" of the "Grab It" Application. |

---

<div align="center">
  <sub><b>Grab It</b> • Local Shopping • Mobile Optimized • Fast Delivery • Within 5 KM</sub>
</div>
