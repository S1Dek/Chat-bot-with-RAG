import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  // Inicjacja tokenu
  const storedToken = localStorage.getItem("token");
  const safeToken =
    storedToken &&
    storedToken !== "undefined" &&
    storedToken !== "null" &&
    storedToken !== ""
      ? storedToken
      : null;

  const [authToken, setAuthToken] = useState(safeToken);
  const [user, setUser] = useState(null);
  const isGuest = !authToken;
  // CZAT
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  // Edycja tytułu
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Admin panel
  const [adminOpen, setAdminOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [rightPanelOpen, setRightPanelOpen] = useState(false);



  // Ładowanie USERA i CONVERSATIONS
  useEffect(() => {
    if (!authToken) return;
    fetchMe();
    fetchConversations();
  }, [authToken]);

	async function fetchMe() {
		try {
		  const res = await axios.get("/api/auth/me", {
			headers: { Authorization: "Bearer " + authToken },
		  });

		  setUser(res.data);

		  if (res.data.role === "admin") fetchUsers();
		} catch (e) {
		  console.error("Cannot load user:", e);
		}
	}

  // Logowanie
	async function login() {
		try {
		  const res = await axios.post("/api/auth/login", {
			email: loginEmail,
			password: loginPassword,
		  });

		  localStorage.setItem("token", res.data.token);
		  setAuthToken(res.data.token);
		  setUser(res.data.user);
		} catch {
		  alert("Nieprawidłowy login lub hasło");
		}
	}

	  function logout() {
		localStorage.removeItem("token");
		setAdminOpen(false);
		setAuthToken(null);
		setUser(null);
		setConversations([]);
		setActiveConv(null);
	  }

	async function fetchConversations() {
		if (isGuest) return;

		try {
		  const res = await axios.get("/api/conversations", {
			headers: { Authorization: "Bearer " + authToken },
		  });
		  setConversations(res.data);
		} catch (e) {
		  console.error("Fetch conversations error:", e);
		}
	}

  // Tworzenie conversation
	async function createConversation() {
		if (isGuest) {
		  const guestConv = {
			id: "guest-" + Date.now(),
			title: "Nowa rozmowa",
			messages: [],
			guest: true,
		  };

		  setActiveConv(guestConv);
		  return;
		}

		try {
		  const res = await axios.post(
			"/api/conversations",
			{ title: "Nowa rozmowa" },
			{ headers: { Authorization: "Bearer " + authToken } }
		  );

		  setActiveConv(res.data);
		  fetchConversations();
		} catch (e) {
		  console.error("Create conv error:", e);
		}
	}


	// Wysyłanie MESSAGE
	async function sendMessage() {
	  if (!messageInput.trim()) return;

	  const userMessage = {
		id: Date.now(),
		sender: "user",
		content: messageInput,
	  };

	  // Jeśli nie ma activeConv w trybie gościa tworzy sztuczną rozmowę
	  if (!activeConv) {
		setActiveConv({
		  id: "guest-" + Date.now(),
		  title: "Nowa rozmowa",
		  messages: [userMessage],
		});
	  } else {
		setActiveConv(prev => ({
		  ...prev,
		  messages: [...(prev.messages || []), userMessage],
		}));
	  }

	  const convId = activeConv?.id;
	  const textToSend = messageInput;
	  setMessageInput("");

	  try {
		// TRYB GOŚCIA
		if (!authToken) {
		  const res = await axios.post("/api/messages/send", {
			content: textToSend,
			guest: true,
		  });

		  const assistantMessage = {
			id: Date.now() + 1,
			sender: "assistant",
			content: res.data.content,
		  };

		  setActiveConv(prev => ({
			...prev,
			messages: [...(prev.messages || []), assistantMessage],
		  }));

		  return;
		}

		// TRYB ZALOGOWANEGO UŻYTKOWNIKA
		const res = await axios.post(
		  "/api/messages/send",
		  { conversationId: convId, content: textToSend },
		  { headers: { Authorization: "Bearer " + authToken } }
		);

		const assistantMessage = {
		  id: res.data.id,
		  sender: "assistant",
		  content: res.data.content,
		};

		setActiveConv(prev => ({
		  ...prev,
		  messages: [...(prev.messages || []), assistantMessage],
		}));

		fetchConversations(); // odśwież listę rozmów
	  } catch (e) {
		console.error("Send error:", e);
	  }
	}

  // Zapisanie Tytułu
	async function saveTitle(id) {
	  if (isGuest) return;
	  if (!editingTitle || !editingTitle.trim()) {
		alert("Tytuł nie może być pusty");
		return;
	  }

	  try {
		await axios.patch(
		  "/api/conversations/" + id,
		  { title: editingTitle },
		  { headers: { Authorization: "Bearer " + authToken } }
		);

		setEditingId(null);
		fetchConversations();
	  } catch (err) {
		console.error("Save title error:", err);
		alert("Błąd zapisu tytułu");
	  }
	}


  // usunięcie CONVERSATION
	async function deleteConversation(id) {
		if (isGuest) return;

		if (!window.confirm("Usunąć rozmowę?")) return;

		await axios.delete("/api/conversations/" + id, {
		  headers: { Authorization: "Bearer " + authToken },
		});

		if (activeConv?.id === id) setActiveConv(null);
		fetchConversations();
	}

  // ADMIN PANEL
	async function fetchUsers() {
		try {
		  const res = await axios.get("/api/admin/users", {
			headers: { Authorization: "Bearer " + authToken },
		  });
		  setUsers(res.data);
		} catch (e) {
		  console.error("Fetch users error:", e);
		}
	}

	async function createUser() {
		await axios.post(
		  "/api/admin/users",
		  {
			email: newUserEmail,
			password: newUserPassword,
			name: newUserName,
			role: newUserRole,
		  },
		  { headers: { Authorization: "Bearer " + authToken } }
		);

		setNewUserEmail("");
		setNewUserPassword("");
		setNewUserName("");
		fetchUsers();
	}

	async function deleteUser(id) {
		await axios.delete(`/api/admin/users/${id}`, {
		  headers: { Authorization: "Bearer " + authToken },
		});
		fetchUsers();
	}

	async function resetPassword(id) {
		const pass = prompt("Nowe hasło:");
		if (!pass) return;

		await axios.patch(
		  `/api/admin/users/${id}`,
		  { password: pass },
		  { headers: { Authorization: "Bearer " + authToken } }
		);

		alert("Hasło ustawione");
	}

	async function changeRole(id) {
		const role = prompt("Rola (admin/user):");
		if (!role) return;

		await axios.patch(
		  `/api/admin/users/${id}`,
		  { role },
		  { headers: { Authorization: "Bearer " + authToken } }
		);

		fetchUsers();
	}

  // UI — GOŚĆ
  if (isGuest) {
    return (
      <div className="flex h-screen bg-gray-900 text-gray-100">
        {/* LEWY PANEL */}
        <div className="w-72 p-4 bg-gray-800 border-r border-gray-700">
          <button
            onClick={createConversation}
            className="w-full bg-green-600 p-2 rounded"
          >
            Nowa rozmowa
          </button>

          <div className="mt-6 border-t border-gray-600 pt-4">
            <h3 className="text-lg">Logowanie</h3>

            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full p-2 mt-2 bg-gray-900 border border-gray-700 rounded"
            />

            <input
              type="password"
              placeholder="Hasło"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full p-2 mt-2 bg-gray-900 border border-gray-700 rounded"
            />

            <button
              onClick={login}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 p-2 rounded"
            >
              Zaloguj się
            </button>
          </div>
        </div>

        {/* GŁÓWNY PANEL CZATU */}
        <div className="flex-1 p-6">
          <h2 className="text-xl">Tryb gościa – rozmowy nie są zapisywane</h2>

          <div
            className="border border-gray-700 rounded p-4 mt-4 bg-gray-800 overflow-y-auto"
            style={{ height: "70vh" }}
          >
            {activeConv?.messages?.map((m) => (
              <div key={m.id} className="mb-4">
                <strong className={m.sender === "user" ? "text-blue-400" : "text-green-400"}>
                  {m.sender === "user" ? "Ty" : "Asystent"}:
                </strong>
                <p>{m.content}</p>
              </div>
            ))}
          </div>

          {activeConv && (
            <>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 mt-4"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />

              <button
                onClick={sendMessage}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Wyślij
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // UI — LOGOWANY USER
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* SIDEBAR */}
      <div className="w-80 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
        <button onClick={logout} className="w-full bg-red-600 p-2 rounded mb-3">
          Wyloguj
        </button>

        <button
          onClick={createConversation}
          className="w-full bg-green-600 p-2 rounded"
        >
          Nowa rozmowa
        </button>

        {user?.role === "admin" && (
          <button
            onClick={() => setAdminOpen((prev) => !prev)}
            className="w-full bg-purple-600 p-2 rounded mt-3"
          >
            {adminOpen ? "Zamknij panel administratora" : "Panel administratora"}
          </button>
        )}

        {/* HISTORIA */}
        <ul className="mt-4 space-y-2">
          {conversations.map((c) => (
            <li
              key={c.id}
              className="flex justify-between items-center p-2 rounded hover:bg-gray-700 cursor-pointer"
              onClick={() => setActiveConv(c)}
            >
              {editingId === c.id ? (
				  <div className="flex items-center space-x-2">
					<input
					  autoFocus
					  value={editingTitle}
					  onChange={(e) => setEditingTitle(e.target.value)}
					  onKeyDown={(e) => {
						if (e.key === "Enter") {
						  saveTitle(c.id);
						} else if (e.key === "Escape") {
						  setEditingId(null);
						}
					  }}
					  className="bg-gray-900 p-1 rounded border border-gray-700"
					/>

					<button
					  onClick={(e) => {
						e.stopPropagation();
						saveTitle(c.id);
					  }}
					  className="text-green-400"
					  title="Zapisz"
					>
					  ✅
					</button>

					<button
					  onClick={(e) => {
						e.stopPropagation();
						setEditingId(null);
					  }}
					  className="text-gray-400"
					  title="Anuluj"
					>
					  ❌
					</button>
				  </div>
				) : (
				  <span>{c.title}</span>
				)}

              <div className="flex space-x-2">
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
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* ADMIN PANEL */}
        {adminOpen && (
          <div className="mt-6 border-t border-gray-600 pt-4">
            <h3 className="text-xl mb-3">Panel administratora</h3>

            <input
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full p-2 mb-2 bg-gray-900 border border-gray-700 rounded"
            />

            <input
              placeholder="Hasło"
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="w-full p-2 mb-2 bg-gray-900 border border-gray-700 rounded"
            />

            <input
              placeholder="Nazwa"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full p-2 mb-3 bg-gray-900 border border-gray-700 rounded"
            />

            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="w-full p-2 mb-3 bg-gray-900 border border-gray-700 rounded"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={createUser}
              className="w-full bg-green-600 p-2 rounded mb-4"
            >
              Dodaj użytkownika
            </button>

            <h4 className="text-lg mb-2">Użytkownicy</h4>

            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((u) => (
				<li
				  key={u.id}
				  className="bg-gray-700 p-3 rounded"
				>
				  <div className="mb-2">
					<p className="text-white font-medium break-all">{u.email}</p>
					<p className="text-sm text-gray-300">Rola: {u.role}</p>
				  </div>

				  <div className="flex flex-wrap gap-2">
					<button
					  onClick={() => resetPassword(u.id)}
					  className="px-1 py-1 border border-yellow-500 text-white rounded text-sm hover:bg-yellow-500 hover:text-black transition"
					>
					  Reset hasła
					</button>

					<button
					  onClick={() => deleteUser(u.id)}
					  className="px-1 py-1 border border-red-500 text-white rounded text-sm hover:bg-red-500 hover:text-black transition"
					>
					  Usuń
					</button>

					<button
					  onClick={() => changeRole(u.id)}
					  className="px-1 py-1 border border-blue-500 text-white rounded text-sm hover:bg-blue-500 hover:text-black transition"
					>
					  Zmień rolę
					</button>
				  </div>
				</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* PANEL WIADOMOŚCI */}
      <div className="flex-1 p-6">
        <h2 className="text-xl font-semibold">
          {activeConv?.title || "Wybierz rozmowę"}
        </h2>
		<button
		  onClick={() => setRightPanelOpen(prev => !prev)}
		  className="absolute top-4 right-6 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
		>
		  ☰
		</button>

        <div
          className="border border-gray-700 rounded p-4 mt-4 bg-gray-800 overflow-y-auto"
          style={{ height: "70vh" }}
        >
          {activeConv?.messages?.map((m) => (
            <div key={m.id} className="mb-4">
              <strong className={m.sender === "user" ? "text-blue-400" : "text-green-400"}>
                {m.sender === "user" ? "Ty" : "Asystent"}:
              </strong>
              <p>{m.content}</p>
            </div>
          ))}
        </div>

        {activeConv && (
          <>
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 mt-4"
            />

            <button
              onClick={sendMessage}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Wyślij
            </button>
          </>
        )}
      </div>
	  
	  	{/* RIGHT SIDEBAR — PROFIL + USTAWIENIA */}
		<div
		  className={`
			fixed top-0 right-0 h-full bg-gray-800 border-l border-gray-700
			transition-transform duration-300
			w-56 p-4 overflow-y-auto
			${rightPanelOpen ? "translate-x-0" : "translate-x-full"}
		  `}
		>
		<button
		  onClick={() => setRightPanelOpen(false)}
		  className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl"
		>
		  ✕
		</button>
		  <h3 className="text-xl mb-4">Twój profil</h3>

		  <div className="space-y-2">
			<p><span className="text-gray-400">Email:</span> {user?.email}</p>
			<p><span className="text-gray-400">Rola:</span> {user?.role}</p>
		  </div>

		  <button
			className="w-full mt-4 bg-blue-600 p-2 rounded hover:bg-blue-700"
		  >
			Edytuj profil
		  </button>

		  <h3 className="text-xl mt-6 mb-4">Ustawienia</h3>

		  <ul className="space-y-2">
			<li className="hover:text-blue-400 cursor-pointer">Motyw aplikacji</li>
			<li className="hover:text-blue-400 cursor-pointer">Zmień hasło</li>
			<li className="hover:text-blue-400 cursor-pointer">Powiadomienia</li>
		  </ul>
		</div>
    </div>
	
  );
}

export default App;
