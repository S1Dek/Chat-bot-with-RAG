# chatbot aplikacja internetowa
## Opis projektu
Chat-bot-with-RAG to pełnostackowa aplikacja webowa umożliwiająca interakcję z eksperckim chatbotem, uczonym na bazie techniki finetuningu wraz z Retrieval-Augmented Generation (RAG). Backend w Node.js udostępnia API do obsługi konwersacji i uwierzytelniania, natomiast frontend w React zapewnia nowoczesny interfejs użytkownika do prowadzenia rozmów w czasie rzeczywistym. System wykorzystuje integrację z zewnętrznymi modelami językowymi oraz mechanizmy przechowywania i wyszukiwania semantycznego kontekstu wiadomości w bazie danych, co pozwala na generowanie odpowiedzi opartych na treści zebranej w czasie rozmowy.

## Funkcjonalności
- Logowanie i autoryzacja użytkowników
- Tworzenie i zarządzanie konwersacjami
- Wysyłanie, zapisywanie i pobieranie wiadomości
- Panel administracyjny do zarządzania danymi
- Interaktywny frontend umożliwiający prowadzenie sesji czatu
- Osobne moduły backend i frontend dla lepszej architektury
---
## Technologia
### Backend
- Node.js + Express
- Prisma ORM do komunikacji z bazą danych
- JWT do uwierzytelniania
- Struktura API zgodna z REST

### Frontend
- React
- Komponenty funkcyjne
- CSS modularny
---
Wymagania środowiskowe

Przed uruchomieniem aplikacji lokalnie należy posiadać:

- Node.js (zalecana wersja LTS)
- npm lub yarn
- PostgreSQL
- Ollama (zainstalowana lokalnie)

System operacyjny: Windows / Linux / macOS

##Konfiguracja bazy danych (PostgreSQL)

- Upewnij się, że serwer PostgreSQL jest uruchomiony.
- Utwórz nową bazę danych (nazwa: chatbot-MRLS-db).

Zaimportuj strukturę i dane z pliku backup.sql, który znajduje się w repozytorium:
```bash
psql -U <nazwa_użytkownika> -d <nazwa_bazy> -f backup.sql
```
Uzupełnij dane dostępowe do bazy w pliku .env w folderze backend.

##Konfiguracja modelu językowego (Ollama)
Aby odpowiedzi modelu językowego działały w pełni poprawnie:
- Zainstaluj Ollama zgodnie z instrukcjami dla swojego systemu operacyjnego.
- Utwórz instancję modelu na podstawie przygotowanego Modelfile.
- Uruchom model lokalnie za pomocą Ollama.
- Upewnij się, że backend aplikacji ma skonfigurowany adres endpointu Ollama (np. http://localhost:11434).

Bez uruchomionej instancji modelu aplikacja nie będzie w stanie generować odpowiedzi AI.
---
## Jak uruchomić projekt lokalnie

Poniżej znajdziesz instrukcje krok po kroku.

Jeśli zostały spełnione wymagania środowiskowe, należy:
### Backend
Przejdź do folderu backend:
```bash
cd backend
```

Zainstaluj zależności:
```bash
npm install
```

Jeśli brakuje pliku .env, utwórz plik o tej nazwie w katalogu backend i dodaj swoje zmienne środowiskowe

Uruchom serwer w trybie developerskim:
```bash
npm run dev
```
Backend powinien uruchomić się na domyślnym porcie (np. http://localhost:8080). 

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
