# StockFlow — full working system

This package contains the React/Vite frontend and Spring Boot/MySQL backend.

## 1. Prepare MySQL

MySQL must be running on port `3306`. The default database is `simd_db` and Hibernate creates/updates its tables automatically.

The backend defaults to MySQL user `root` and password `manager`. To use different values in PowerShell:

```powershell
$env:DB_USERNAME='root'
$env:DB_PASSWORD='your-mysql-password'
$env:DB_URL='jdbc:mysql://localhost:3306/simd_db?createDatabaseIfNotExist=true'
```

## 2. Run the backend

Open PowerShell in the `backend` folder:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
.\mvnw.cmd spring-boot:run
```

The API listens on port `8080`. On this computer its Wi-Fi address is currently `192.168.1.102`, so other devices on the same network reach it at `http://192.168.1.102:8080/api`. On first start it creates these local accounts if they do not exist:

- Admin: `admin` / `admin123`
- Manager: `manager` / `manager123`
- Staff: `staff` / `staff123`

Change these passwords before production use.

## 3. Run the frontend

Open another PowerShell window in `Frontend/frontend-settings-complete`:

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://127.0.0.1:5502`.

## 4. API connection

The frontend automatically connects to port `8080` on the same hostname used to open the site. This prevents requests from being sent to an old hardcoded computer address. For a custom deployment, copy `.env.example` to `.env.local`, set `VITE_API_BASE_URL`, and restart Vite.

The screen APIs are:

- `GET /api/products`
- `GET /api/inventory` (products plus recent stock transactions)
- `GET /api/reports` (products, safe sales records, and summary values)
- `GET /api/users`
- `GET /api/settings` and `PUT /api/settings` (ADMIN only; stored in MySQL)

## Access rules

- ADMIN: all pages; can edit roles and delete other users.
- MANAGER: Dashboard, Products, Sales, Inventory, Reports, AI Insights, and read-only Users.
- STAFF: Dashboard and Sales only.

New registrations receive the STAFF role. A signed-in Admin can promote a user on the Users page. An Admin cannot edit or delete their own account.

## Optional AI assistant

Set `OPENAI_API_KEY` before starting the backend. The key is used only by Spring Boot and is never exposed in React.

```powershell
$env:OPENAI_API_KEY='your-key'
```

## Production settings

Set a strong `JWT_SECRET`, use a dedicated MySQL account, and set `VITE_API_BASE_URL` to the deployed API address for production.
