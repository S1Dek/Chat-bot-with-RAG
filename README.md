# ChatBot Web Application

Aplikacja umożliwia prowadzenie rozmów z **modelem językowym** poprzez nowoczesny interfejs czatu.

Aplikacja webowa typu **chatbot** z obsługą:
- użytkowników zalogowanych
- trybu gościa (bez zapisywania historii)
- panelu administratora
- edycji profilu użytkownika
- zmiany hasła
- przełączania motywu (ciemny / jasny)

Projekt składa się z **frontendu (React)** oraz **backendu (Node.js + Express + Prisma)**.

---

### Tryby działania

#### Gość
- dostęp do pełnego interfejsu czatu
- możliwość zadawania pytań i otrzymywania odpowiedzi
- historia rozmów **nie jest zapisywana**

#### Użytkownik zalogowany
- zapisywana historia rozmów
- możliwość edycji profilu
- możliwość zmiany hasła
- dostęp do panelu bocznego

#### Administrator
- pełny dostęp do panelu administratora
- zarządzanie użytkownikami
- resetowanie haseł
- zmiana ról użytkowników
- usuwanie użytkowników

---

### Technologie

#### Frontend
- React 19
- Axios
- React Router v6
- TailwindCSS
- CSS Variables (obsługa motywów)

#### Backend
- Node.js
- Express
- Prisma ORM
- JWT (JSON Web Token)
- bcrypt

### Baza danych
- PostgreSQL (konfigurowalne w Prisma)

---

## Instrukcja uruchomienia

### Klonowanie repozytorium
```bash
git clone https://github.com/S1Dek/Chat-bot-with-RAG
cd chatbot-front-projc
```

#### Backend
```bash
cd backend
npm install
```

Migracje bazy danych
```bash
npx prisma migrate dev
```

Uruchomienie backendu
```bash
npm run dev
```
Backend uruchomi się pod adresem:
http://localhost:8080

#### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend będzie dostępny pod adresem:
http://localhost:3000

---
## Autoryzacja
Autoryzacja realizowana jest przy użyciu JWT.

token przechowywany w `localStorage`

przesyłany w nagłówku: `Authorization: Bearer <TOKEN>`

Endpointy autoryzacji
POST /api/auth/login
GET /api/auth/me
PATCH /api/auth/update
PATCH /api/auth/change-password

## Funkcjonalności czatu
Endpointy

POST /api/messages/send
GET /api/conversations
POST /api/conversations
PATCH /api/conversations/:id
DELETE /api/conversations/:id

---
## Panel administratora

Panel dostępny wyłącznie dla użytkowników z rolą admin.

Funkcje
- dodawanie użytkowników
- usuwanie użytkowników
- resetowanie haseł
- zmiana ról użytkowników

## Profil użytkownika
- Edycja profilu
- zmiana imienia
- zmiana adresu email
- Zmiana hasła
- wymaga podania aktualnego hasła
- zabezpieczona przez JWT

## Motywy aplikacji

Aplikacja obsługuje:
-🌙 tryb ciemny/☀️ tryb jasny aplikacji

Implementacja
- CSS Variables w index.css
- przełączanie klasy na elemencie <body>
- document.body.classList.toggle("dark")
---
## Użytkownicy testowi
Email testowego administratora:
admin@mail.com

Hasło:
```bash
	zaq1@WSX
```

Email testowowego użytkownika:
user@mail.com

Hasło:
```bash
	zaq1@WSX
```
---
## Najczęstsze problemy

❌ Brak react-router-dom
```bash
npm install react-router-dom
```
❌ Token undefined
- sprawdź zawartość localStorage
- upewnij się, że nagłówek Authorization jest poprawnie wysyłany
