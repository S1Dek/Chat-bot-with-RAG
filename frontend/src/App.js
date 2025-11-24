import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const initialToken = localStorage.getItem("token");
  const safeToken =
    initialToken &&
    initialToken !== "undefined" &&
    initialToken !== "null" &&
    initialToken !== ""
      ? initialToken
      : null;

  const [token, setToken] = useState(safeToken);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // POLA LOGINU
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Pokazuje ekran logowania, jeśli nie mamy tokena
  const showLogin = !token;

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  // -----------------------------
  // LOGOWANIE WŁAŚCIWE (email + hasło)
  // -----------------------------
  async function loginNormal() {
    try {
      const res = await axios.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (e) {
      console.error("Login normal error:", e);
      alert("Nieprawidłowy login lub hasło");
    }
  }

  // -----------------------------
  // LOGOWANIE DEMO
  // -----------------------------
  async function loginDemo() {
    try {
      const res = await axios.post("/api/auth/login", {
        email: "demo@mail.com",
        password: "",
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (e) {
      console.error("Login demo error:", e);
      alert("Błąd logowania demo");
    }
  }

  async function saveTitle(id) {
    await axios.patch(
      "/api/conversations/" + id,
      { title: editingTitle },
      { headers: { Authorization: "Bearer " + token } }
    );

    setEditingId(null);
    fetchConversations();
  }
  // -----------------------------
  // DELETE conversation
  // -----------------------------
  async function deleteConversation(id) {
    if (!window.confirm("Czy na pewno chcesz usunąć tę rozmowę?")) return;

    try {
      await axios.delete(
        "/api/conversations/" + id,
        { headers: { Authorization: "Bearer " + token } }
      );

      // Jeśli usunięto aktywną rozmowę — usuń ją z widoku
      if (activeConv?.id === id) {
        setActiveConv(null);
      }

      fetchConversations();
    } catch (e) {
      console.error("Delete conversation error:", e);
      alert("Błąd podczas usuwania rozmowy");
    }
  }

  // -----------------------------
  // FETCH conversations
  // -----------------------------
  async function fetchConversations() {
    try {
      const res = await axios.get("/api/conversations", {
        headers: { Authorization: "Bearer " + token },
      });
      setConversations(res.data);
    } catch (e) {
      console.error("Fetch error:", e);

      // Token zły? — reset i wróć do logowania
      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  }

  // -----------------------------
  // CREATE conversation
  // -----------------------------
  async function createConversation() {
    try {
      const res = await axios.post(
        "/api/conversations",
        { title: "Nowa rozmowa" },
        { headers: { Authorization: "Bearer " + token } }
      );

      setActiveConv(res.data);
      fetchConversations();
    } catch (e) {
      console.error(e);
    }
  }

  // -----------------------------
  // SEND message
  // -----------------------------
	async function sendMessage() {
	  if (!activeConv) return;

	  try {
		const userMessage = {
		  id: Date.now(),
		  sender: "user",
		  content: messageInput,
		};

		// Dodaj wiadomość usera natychmiast
		setActiveConv((prev) => ({
		  ...prev,
		  messages: [...prev.messages, userMessage],
		}));

		const res = await axios.post(
		  "/api/messages/send",
		  {
			conversationId: activeConv.id,
			content: messageInput,
		  },
		  { headers: { Authorization: "Bearer " + token } }
		);

		// Dodaj odpowiedź modelu natychmiast
		const assistantMessage = {
		  id: res.data.id,
		  sender: "assistant",
		  content: res.data.content,
		};

		setActiveConv((prev) => ({
		  ...prev,
		  messages: [...prev.messages, assistantMessage],
		}));

		setMessageInput("");

		// zaktualizuj listę rozmów (tytuły)
		fetchConversations();
	  } catch (e) {
		console.error("Send error:", e);
	  }
	}
  // -----------------------------
  // LOGOUT
  // -----------------------------
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setConversations([]);
    setActiveConv(null);
  }

  // -----------------------------
  // UI — EKRAN LOGOWANIA
  // -----------------------------
  if (showLogin) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 300,
          margin: "100px auto",
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 10,
        }}
      >
        <h2>Logowanie</h2>

        <label>Email:</label>
        <input
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          style={{ padding: 8, marginBottom: 10 }}
        />

        <label>Hasło:</label>
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          style={{ padding: 8, marginBottom: 20 }}
        />

        <button onClick={loginNormal} style={{ padding: 10, marginBottom: 20 }}>
          Zaloguj się
        </button>

        <button
          onClick={loginDemo}
          style={{ padding: 10, background: "#4caf50", color: "white" }}
        >
          Zaloguj jako Demo
        </button>
      </div>
    );
  }

  // -----------------------------
  // UI — GŁÓWNY WIDOK CZATU
  // -----------------------------
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* PANEL BOCZNY */}
      <div className="w-64 border-r border-gray-700 p-4 bg-gray-800">
        <button onClick={logout} style={{ width: "100%", marginBottom: 20 }}>
          Wyloguj
        </button>

        <button
          onClick={createConversation}
          style={{ width: "100%", background: "#4caf50", color: "white" }}
        >
          Nowa rozmowa
        </button>

      <ul className="mt-4 space-y-2">
      {conversations.map((c) => (
        <li
          key={c.id}
          className="flex justify-between items-center px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
          onClick={() => setActiveConv(c)}
        >
          <div className="flex-1">
            {user?.role !== "demo" && editingId === c.id ? (
              <div className="flex">
                <input
                  className="bg-gray-900 border border-gray-700 p-1 text-sm flex-1"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                />
                <button
                  className="ml-2 text-green-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveTitle(c.id);
                  }}
                >
                  ✔️
                </button>
              </div>
            ) : (
              <span>{c.title}</span>
            )}
          </div>

          {/* IKONY EDYCJI I USUWANIA — tylko dla ROLE=user */}
          {user?.role !== "demo" && (
            <div className="flex space-x-3">
              <button
                className="text-yellow-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(c.id);
                  setEditingTitle(c.title);
                }}
              >
                ✏️
              </button>

              <button
                className="text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(c.id);
                }}
              >
                🗑️
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
      </div>

      {/* PANEL MESSAGES */}
      <div className="flex-1 p-6">
        <h2>{activeConv?.title || "Wybierz rozmowę"}</h2>

        <div
          style={{
            border: "1px solid #ccc",
            height: "70vh",
            overflowY: "auto",
            padding: 10,
          }}
        >
          {activeConv?.messages?.map((m) => (
            <div key={m.id} style={{ marginBottom: 10 }}>
              <strong>{m.sender === "user" ? "Ty" : "Asystent"}:</strong>
              <p>{m.content}</p>
            </div>
          ))}
        </div>

        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          rows="3"
          className="w-full bg-gray-800 border border-gray-700 rounded p-2 mt-4 text-gray-100"
        />

        <button
          onClick={sendMessage}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Wyślij
        </button>
      </div>
    </div>
  );
}

export default App;
