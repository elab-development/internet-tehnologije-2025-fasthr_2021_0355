# Fast HR — opis aplikacije i tehnologije.

Fast HR je full-stack veb aplikacija za upravljanje osnovnim HR procesima: **departmani**, **pozicije**, **zaposleni**, **obračun plata (payroll)** i **performance review**. Sistem je organizovan po ulogama (role-based UI i API dozvole) i omogućava da se HR posao radi jasno, pregledno i lako za audit.

![Fast HR Logo](./fast-hr-ui/public/favicon.ico)

> Struktura repozitorijuma:
> - `fast-hr-back` (Laravel REST API + Sanctum)
> - `fast-hr-ui` (React SPA)

---

## Ciljna grupa i uloge korisnika.

Aplikacija podržava sledeće tipove korisnika:

- **Posetilac (guest)**: nije ulogovan; ima pristup javnim rutama (npr. lista pozicija).
- **Zaposleni (employee)**: vidi svoje payroll zapise i performance review-e, uređuje svoj profil.
- **HR Worker (hr_worker)**: radi operativne HR zadatke (CRUD nad payroll records i performance reviews, pregled statistika i metrika).
- **Administrator (admin)**: administracija sistema (u zavisnosti od finalne implementacije ekrana i dozvola).

---

## Ključne funkcionalnosti.

### Posetilac (guest).
- Registracija i prijava u sistem.
- Javni pregled pozicija (npr. izbor pozicije prilikom registracije zaposlenog).

### Zaposleni (employee).
- Pregled **svojih payroll** zapisa (filtriranje po godini/statusu) + detalji.
- Pregled **svojih performance reviews** (opciono filter `hasSalaryImpact`) + detalji.
- Uređivanje profila (ime + slika).

### HR Worker (hr_worker).
- CRUD nad **payroll records** (kreiranje, izmena, brisanje).
- CRUD nad **performance reviews** (kreiranje, izmena, brisanje).
- Povezivanje review-a sa payroll record-om.
- Pregled statistika (npr. totals, status breakdown, trendovi po mesecima).
- Pregled “overview” metrika (dashboard).

### Administrator (admin).
- Pregled metrika sistema (overview).
- Administracija korisnika/departmana/pozicija (u zavisnosti od finalne implementacije).

---

# Tehnologije koje se koriste.

## Frontend — React.

**React** SPA aplikacija sa role-based navigacijom i zaštićenim rutama (ProtectedRoute + RoleRoute). Frontend koristi reusable komponente (npr. DataTable, StatsRow, DetailsModal) i konzistentan UI stil (App.css).

Komunikacija sa API-jem ide preko tokena u headeru:

`Authorization: Bearer {token}`

---

## Backend — Laravel 12 (REST API).

**Laravel 12** čini backend sloj aplikacije i obezbeđuje:
- Validaciju i konzistentne JSON odgovore.
- Autorizaciju po ulozi i vlasništvu resursa.
- Eloquent modele i relacije.
- REST API rute za React frontend.

### Autentifikacija.
- Token-based autentifikacija preko **Laravel Sanctum**.
- Token se šalje u headeru: `Authorization: Bearer {token}`.

---

## Baza podataka — MySQL.

**MySQL** skladišti podatke o:
- `departments`, `positions`, `users`,
- `payroll_records`, `performance_reviews`.

Migracije definišu šemu, a seed-eri generišu test podatke (admin/hr_worker/employee + primeri payroll/reviews).

---

# Tehnologije (sažetak).

- **Frontend**
  - React
  - JavaScript
  - react-router-dom
  - axios
  - React Bootstrap

- **Backend**
  - PHP 8.2+
  - Laravel 12
  - Laravel Sanctum
  - API Resources

- **Baza**
  - MySQL

- **Alati**
  - Git / GitHub
  - Swagger UI + OpenAPI (API dokumentacija)
  - Docker (opciono)

---

## Git i GitHub (verzionisanje).

> Ovde unesi link do svog repozitorijuma:
- Repo: `TODO`

Kloniranje (primer):

```bash
git clone <YOUR_REPO_URL>
```

---

## Struktura projekta.

Repozitorijum sadrži:
- `fast-hr-back` — Laravel API (Sanctum, migrations/seeders, REST rute).
- `fast-hr-ui` — React frontend (role dashboards, CRUD ekrani, metrike, reusable komponente).

---

## Pokretanje projekta (lokalno bez Docker-a).

> Pretpostavke: instalirani Node 18+, PHP 8.2+, Composer, MySQL.

### 1) Backend (Laravel).

```bash
cd fast-hr-back
composer install
cp .env.example .env
php artisan key:generate
```

U `.env` podesi DB kredencijale (lokalni MySQL), npr.:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fast_hr_db
DB_USERNAME=root
DB_PASSWORD=
```

Zatim migracije + seed:

```bash
php artisan migrate:fresh --seed
php artisan serve
```

Backend API:
- `http://127.0.0.1:8000/api`

> Napomena: Seed-eri prave test korisnike (admin/hr_worker/employee). Pogledaj `UserSeeder.php` za tačne kredencijale.

---

### 2) Frontend (React).

```bash
cd fast-hr-ui
npm install
npm start
```

Frontend:
- `http://localhost:3000`

> Ako koristiš upload slike preko ImgBB, podesi `.env` u React projektu:

```env
REACT_APP_IMGBB_API_KEY=YOUR_KEY_HERE
```

---

## Pokretanje projekta uz Docker (opciono).

> Pretpostavke: instaliran Docker Desktop + imaš `docker-compose.yaml` u root-u repozitorijuma.

U Laravel `.env` (backend) kada radi preko Dockera:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=fast_hr_db
DB_USERNAME=root
DB_PASSWORD=
```

U root folderu (gde je `docker-compose.yaml`):

```bash
docker compose down -v
docker compose up --build
```

Aplikacija:
- Frontend: `http://localhost:3000`
- Backend API: `http://127.0.0.1:8000/api`

---

## Swagger UI (API dokumentacija).

Ako u projektu postoji Swagger UI i OpenAPI fajl, tipična putanja je:

- Swagger UI: `http://127.0.0.1:8000/docs/index.html`
- OpenAPI fajl: `/docs/openapi.yaml`

> (Zavisi od toga da li serviraš iz `public/docs/` ili preko ruta — prilagodi po svojoj organizaciji.)

---

## Korisni endpoint-i (pregled).

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`

- **Public**
  - `GET /api/positions`
  - `GET /api/positions/{id}`

- **Protected (auth:sanctum)**
  - CRUD: `departments`, `users`, `payroll-records`, `performance-reviews`
  - Stats: `/api/stats/*`
  - Metrics: `/api/metrics/overview`

---
