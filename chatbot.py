from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain.chains.retrieval_qa.base import RetrievalQA
from langchain_core.prompts import PromptTemplate

# Ścieżka do lokalnej bazy wektorów
CHROMA_PATH = "chroma_db"

# Tworzymy lokalny model LLM z Ollamy
llm = Ollama(model="llama3")

# Ten sam model embeddingów co w ingest_database.py
embeddings_model = OllamaEmbeddings(model="llama3")

# Łączymy się z bazą Chroma
vector_store = Chroma(
    collection_name="local_collection",
    embedding_function=embeddings_model,
    persist_directory=CHROMA_PATH,
)

# Retriever (wyszukiwanie podobnych fragmentów)
retriever = vector_store.as_retriever(search_kwargs={"k": 5})

# Prompt, który podpowiada modelowi, jak ma odpowiadać
prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "Odpowiedz na pytanie użytkownika na podstawie poniższej wiedzy.\n"
        "Jeśli odpowiedź nie znajduje się w wiedzy, napisz 'Nie wiem'.\n\n"
        "Wiedza:\n{context}\n\n"
        "Pytanie: {question}\n"
    ),
)

# Tworzymy łańcuch RAG (Retrieval-Augmented Generation)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    chain_type_kwargs={"prompt": prompt},
)

print("🤖 Chatbot działa! Możesz zadawać pytania o treść swoich dokumentów.\n")

while True:
    question = input("❓ Pytanie: ")
    if question.lower() in ["exit", "quit", "q"]:
        print("👋 Do zobaczenia!")
        break
    answer = qa_chain.run(question)
    print("💬 Odpowiedź:", answer, "\n")
