# chatbot aplikacja internetowa
## Opis projektu
Chat-bot-with-RAG to pełnostackowa aplikacja webowa umożliwiająca interakcję z eksperckim chatbotem na bazie techniki Retrieval-Augmented Generation (RAG). Backend w Node.js udostępnia API do obsługi konwersacji i uwierzytelniania, natomiast frontend w React zapewnia nowoczesny interfejs użytkownika do prowadzenia rozmów w czasie rzeczywistym. System wykorzystuje integrację z zewnętrznymi modelami językowymi oraz mechanizmy przechowywania i wyszukiwania semantycznego kontekstu wiadomości w bazie danych, co pozwala na generowanie odpowiedzi opartych na treści zebranej w czasie rozmowy.

## Funkcjonalności
- Logowanie i autoryzacja użytkowników
- Tworzenie i zarządzanie konwersacjami
- Wysyłanie, zapisywanie i pobieranie wiadomości
- RAG-owe generowanie odpowiedzi ze wsparciem zewnętrznych modeli
- Panel administracyjny do zarządzania danymi
- Interaktywny frontend umożliwiający prowadzenie sesji czatu
- Osobne moduły backend i frontend dla lepszej architektury
---
## Technologia
###Backend
- Node.js + Express
- Prisma ORM do komunikacji z bazą danych
- JWT do uwierzytelniania
- Struktura API zgodna z REST

###Frontend
- React
- Komponenty funkcyjne
- CSS modularny
---
## Jak uruchomić projekt lokalnie

Poniżej znajdziesz instrukcje krok po kroku.
### Backend
Przejdź do folderu backend:
```bash
cd backend
```

Zainstaluj zależności:
```bash
npm install
```

Utwórz plik .env bazując na .env.example i dodaj swoje zmienne środowiskowe (np. klucz JWT, dane bazy).

Uruchom serwer w trybie developerskim:
```bash
npm run dev
```

Backend powinien uruchomić się na domyślnym porcie (np. http://localhost:3000
). 
---
### Frontend
Otwórz folder frontend:
```bash
cd frontend
```

Zainstaluj zależności:
```bash
npm install
```

Uruchom aplikację React:
```bash
npm start
```

Frontend uruchomi się zazwyczaj pod adresem http://localhost:3000
