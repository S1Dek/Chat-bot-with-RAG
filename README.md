# Testowanie aplikacji – ChatBot

## Informacje ogólne

Projekt dotyczy testowania aplikacji webowej typu **chatbot**, przeznaczonej do udzielania odpowiedzi na pytania związane z diagnostyką oraz naprawą komputerów.  
Aplikacja umożliwia rejestrację użytkownika, logowanie, prowadzenie rozmów oraz wysyłanie zapytań do systemu generującego odpowiedzi przy użyciu modelu językowego.

---

## Architektura aplikacji

- **Frontend:** React  
- **Backend:** Node.js + Express  
- **Autoryzacja:** JWT (JSON Web Token)  
- **Środowisko:** lokalne  
- **Komunikacja:** REST API + integracja z modelem językowym  

---

## Cele testowania

Celem testów było:
- sprawdzenie poprawności logowania i autoryzacji użytkowników,
- weryfikacja komunikacji frontend–backend,
- wykrycie błędów integracyjnych pomiędzy modułami,
- ocena stabilności aplikacji z perspektywy użytkownika końcowego.

---

## Zastosowane techniki testowania

W projekcie wykorzystano następujące techniki:

### Testy manualne
- **Testy akceptacyjne** – weryfikacja funkcjonalności z punktu widzenia użytkownika
- **Testy zgodności** – sprawdzenie poprawności działania zgodnie z wymaganiami

### Testy automatyczne
- **Testy jednostkowe** – Jest (logika autoryzacji)
- **Testy integracyjne API** – Jest + Supertest
- **Testy End-to-End (E2E)** – Cypress

---

## Zakres testów

### Testy akceptacyjne
- logowanie użytkownika,
- tworzenie nowej rozmowy,
- wysyłanie wiadomości do chatbota,
- wyświetlanie odpowiedzi systemu,
- wylogowanie użytkownika.

### Testy zgodności
- logowanie poprawnymi danymi,
- odrzucanie błędnych danych logowania,
- dostęp do zasobów tylko po autoryzacji.

### Testy integracyjne
- endpoint logowania `POST /api/auth/login`,
- obsługa błędnych danych logowania.

> Endpointy zależne od zewnętrznego modelu językowego nie zostały objęte testami integracyjnymi ze względu na brak deterministycznych wyników.

---

## Środowisko testowe

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- Testy uruchamiane lokalnie przy użyciu `npm`

---

## Potencjalne zagrożenia

- niestabilność zewnętrznego modelu językowego,
- błędy konfiguracji JWT,
- brak uruchomionego backendu podczas testów,
- ograniczone odwzorowanie scenariuszy użytkownika w testach API.

---

## Harmonogram testów

- przygotowanie testów: **3 dni**
- testy manualne: **1 tydzień**
- testy automatyczne i analiza: **1–2 dni**

---

## Wymagane narzędzia

- Node.js + npm
- Visual Studio Code
- Cypress
- Jest
- Supertest
- Google Chrome

---

## Raport z testów

Przeprowadzone testy manualne i automatyczne potwierdziły poprawne działanie aplikacji.  
Testy E2E wykazały prawidłową integrację frontendu z backendem, a testy API potwierdziły poprawność mechanizmu autoryzacji JWT.

Nie wykryto krytycznych błędów uniemożliwiających korzystanie z aplikacji.

---

## Wnioski i rekomendacje

- aplikacja spełnia wymagania funkcjonalne,
- mechanizm JWT działa poprawnie,
- testy E2E okazały się najskuteczniejsze,
- zalecane jest mockowanie modelu językowego w przyszłych testach,
- warto rozszerzyć testy jednostkowe backendu,
- rekomendowane jest dodanie logowania błędów w backendzie.

---

## Linki

- **Kod testów automatycznych:**  
  https://github.com/S1Dek/Chat-bot-with-RAG/tree/test

- **Kod aplikacji:**  
  https://github.com/S1Dek/Chat-bot-with-RAG/tree/webclient
