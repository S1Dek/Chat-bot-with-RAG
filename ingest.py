from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_chroma import Chroma
from uuid import uuid4
import os

# Ścieżki
DATA_PATH = "data"
CHROMA_PATH = "chroma_db"

# Sprawdzenie folderu z danymi
if not os.path.exists(DATA_PATH):
    os.makedirs(DATA_PATH)
    print(f"📁 Utworzono folder '{DATA_PATH}'. Umieść tam swoje pliki PDF.")

# Model embeddingów Ollamy (lokalny)
embeddings_model = OllamaEmbeddings(model="llama3")

# Utworzenie bazy Chroma
vector_store = Chroma(
    collection_name="local_collection",
    embedding_function=embeddings_model,
    persist_directory=CHROMA_PATH,
)

# Wczytanie PDF-ów
print("📚 Wczytywanie dokumentów PDF...")
loader = PyPDFDirectoryLoader(DATA_PATH)
raw_documents = loader.load()

# Dzielenie tekstu na fragmenty
print("✂️  Dzielę dokumenty na fragmenty...")
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,
    length_function=len,
)

chunks = text_splitter.split_documents(raw_documents)

# Tworzenie unikalnych ID
uuids = [str(uuid4()) for _ in range(len(chunks))]

# Dodanie do bazy
print("💾 Dodaję dokumenty do bazy wektorów...")
vector_store.add_documents(documents=chunks, ids=uuids)
print("✅ Zakończono tworzenie bazy Chroma!")
