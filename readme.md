<h1>Chatbot z RAG i LangChain</h1>

### Opis aplikacji

Aplikacja została napisana w języku Python i jej głównym celem jest analiza instrukcji producentów urządzeń elektronicznych zapisanych w plikach PDF. System wczytuje dokumenty, przetwarza ich treść i wykorzystuje podejście RAG (Retrieval-Augmented Generation) do generowania odpowiedzi na zapytania użytkownika.

Uzyskane odpowiedzi są wykorzystywane jako dane treningowe do dalszego uczenia modelu językowego. Dzięki zastosowaniu RAG model nie bazuje wyłącznie na wiedzy wstępnej, ale dynamicznie pobiera istotne fragmenty dokumentacji, co pozwala na precyzyjne i kontekstowe odpowiedzi zgodne z instrukcjami producenta.

Projekt wykorzystuje bibliotekę LangChain do zarządzania przepływem danych, wektorami oraz integracją z modelem językowym OpenAI.

<h2>Wymagania wstępne</h2>
<ul>
  <li>Python 3.11+</li>
</ul>

<h2>Instalacja</h2>
<h3>1. Sklonuj repozytorium:</h3>

<h3>2. Utwórz środowisko wirtualne</h3>

```
python -m venv venv
```

<h3>3. Aktywuj środowisko wirtualne</h3>

```
venv\Scripts\Activate
```

<h3>4. Zainstaluj wymagane biblioteki</h3>

```
pip install -r requirements.txt
```

5. Dodaj klucz API OpenAI
Zmień nazwę pliku .env.example na .env
Wklej swój klucz API OpenAI do pliku .env

<h2>Uruchamianie skryptów</h2>

- Otwórz terminal w Visual Studio Code
- Wykonaj następujące polecenia:

```
python ingest_database.py
python chatbot.py
```

ingest_database.py – odpowiada za wczytanie i przetworzenie danych z plików PDF oraz zapis ich w bazie wektorowej
chatbot.py – uruchamia chatbota, który odpowiada na zapytania na podstawie dokumentacji i mechanizmu RAG
