import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProfilePage from "./ProfilePage";
import ChangePasswordPage from "./ChangePasswordPage";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

console.log("API_URL =", API_URL);
;

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
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark")


  // Ładowanie USERA i CONVERSATIONS
  useEffect(() => {
    if (!authToken) return;
    fetchMe();
    fetchConversations();
  }, [authToken]);

  useEffect(() => {
  const html = document.documentElement;

  if (theme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }

  localStorage.setItem("theme", theme);
}, [theme]);

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
		  const res = await axios.post("/api/messages/guest", {
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
	const navigate = useNavigate();

    function goToProfile() {
        navigate("/profile");
    }

	function toggleTheme() {
	setTheme(prev => prev === "dark" ? "light" : "dark");
	}

	function goToChangePassword() {
        navigate("/change-password");
    }

  // UI — GOŚĆ
  if (isGuest) {
	return (
	<div className="flex h-screen bg-[var(--bg-main)] text-[var(--text)]">
	{/* LEWY PANEL */}
	<div className="w-72 p-4 bg-[var(--bg-panel)] border-r border-[var(--border)]">
		<button
		onClick={createConversation}
		className="w-full bg-green-600 p-2 rounded"
		>
		Nowa rozmowa
		</button>

		<div className="mt-6 border-t border-[var(--border)] pt-4">
		<h3 className="text-lg">Logowanie</h3>

		<input
			type="email"
			placeholder="Email"
			value={loginEmail}
			onChange={(e) => setLoginEmail(e.target.value)}
			className="w-full p-2 mt-2 bg-[var(--bg-input)] border border-[var(--border)] rounded"
		/>

		<input
			type="password"
			placeholder="Hasło"
			value={loginPassword}
			onChange={(e) => setLoginPassword(e.target.value)}
			className="w-full p-2 mt-2 bg-[var(--bg-input)] border border-[var(--border)] rounded"
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
		className="border border-[var(--border)] rounded p-4 mt-4 bg-[var(--bg-panel)] overflow-y-auto"
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
			className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded p-2 mt-4"
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
<div className="flex h-screen bg-[var(--bg)] text-[var(--text)]">
  {/* SIDEBAR */}
  <div className="w-80 p-4 border-r border-[var(--border)] bg-[var(--bg-panel)] overflow-y-auto">

    <button
      onClick={logout}
      className="w-full p-2 rounded mb-3 bg-red-600 text-white hover:opacity-90"
    >
      Wyloguj
    </button>

    <button
      onClick={createConversation}
      className="w-full p-2 rounded bg-green-600 text-white hover:opacity-90"
    >
      Nowa rozmowa
    </button>

    {user?.role === "admin" && (
      <button
        onClick={() => setAdminOpen(prev => !prev)}
        className="w-full p-2 rounded mt-3 bg-purple-600 text-white hover:opacity-90"
      >
        {adminOpen ? "Zamknij panel administratora" : "Panel administratora"}
      </button>
    )}

    {/* HISTORIA */}
    <ul className="mt-4 space-y-2">
      {conversations.map(c => (
        <li
          key={c.id}
          onClick={() => setActiveConv(c)}
          className="flex justify-between items-center p-2 rounded cursor-pointer hover:bg-[var(--bg-hover)]"
        >
          {editingId === c.id ? (
            <div className="flex items-center gap-2 w-full">
              <input
                autoFocus
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") saveTitle(c.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="flex-1 p-1 rounded bg-[var(--bg-input)] border border-[var(--border)]"
              />
              <button onClick={() => saveTitle(c.id)}>✅</button>
              <button onClick={() => setEditingId(null)}>❌</button>
            </div>
          ) : (
            <span>{c.title}</span>
          )}

          <div className="flex gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                setEditingId(c.id);
                setEditingTitle(c.title);
              }}
              className="text-yellow-400"
            >
              ✏️
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                deleteConversation(c.id);
              }}
              className="text-red-400"
            >
              🗑
            </button>
          </div>
        </li>
      ))}
    </ul>

    {/* ADMIN PANEL */}
    {adminOpen && (
      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <h3 className="text-xl mb-3">Panel administratora</h3>

        <input
          placeholder="Email"
          value={newUserEmail}
          onChange={e => setNewUserEmail(e.target.value)}
          className="w-full p-2 mb-2 rounded bg-[var(--bg-input)] border border-[var(--border)]"
        />

        <input
          type="password"
          placeholder="Hasło"
          value={newUserPassword}
          onChange={e => setNewUserPassword(e.target.value)}
          className="w-full p-2 mb-2 rounded bg-[var(--bg-input)] border border-[var(--border)]"
        />

        <input
          placeholder="Nazwa"
          value={newUserName}
          onChange={e => setNewUserName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-[var(--bg-input)] border border-[var(--border)]"
        />

        <select
          value={newUserRole}
          onChange={e => setNewUserRole(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-[var(--bg-input)] border border-[var(--border)]"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={createUser}
          className="w-full p-2 rounded bg-green-600 text-white hover:opacity-90 mb-4"
        >
          Dodaj użytkownika
        </button>

        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {users.map(u => (
            <li key={u.id} className="p-3 rounded bg-[var(--bg-hover)]">
              <p className="font-medium break-all">{u.email}</p>
              <p className="text-sm opacity-70">Rola: {u.role}</p>

              <div className="flex gap-2 mt-2 flex-wrap">
                <button onClick={() => resetPassword(u.id)}>Reset hasła</button>
                <button onClick={() => deleteUser(u.id)}>Usuń</button>
                <button onClick={() => changeRole(u.id)}>Zmień rolę</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>

  {/* PANEL WIADOMOŚCI */}
  <div className="flex-1 p-6 relative">
    <h2 className="text-xl font-semibold">
      {activeConv?.title || "Wybierz rozmowę"}
    </h2>

    <button
      onClick={() => setRightPanelOpen(prev => !prev)}
      className="absolute top-4 right-6 px-3 py-1 rounded bg-[var(--bg-panel)] border border-[var(--border)]"
    >
      ☰
    </button>

    <div
      className="mt-4 p-4 rounded border border-[var(--border)] bg-[var(--bg-panel)] overflow-y-auto"
      style={{ height: "70vh" }}
    >
      {activeConv?.messages?.map(m => (
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
          onChange={e => setMessageInput(e.target.value)}
          className="w-full mt-4 p-2 rounded bg-[var(--bg-input)] border border-[var(--border)]"
        />
        <button
          onClick={sendMessage}
          className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:opacity-90"
        >
          Wyślij
        </button>
      </>
    )}
  </div>

  {/* RIGHT SIDEBAR */}
  <div
    className={`fixed top-0 right-0 h-full w-56 p-4 bg-[var(--bg-panel)] border-l border-[var(--border)] transition-transform duration-300 ${
      rightPanelOpen ? "translate-x-0" : "translate-x-full"
    }`}
  >
    <button
      onClick={() => setRightPanelOpen(false)}
      className="absolute top-3 right-3 text-xl"
    >
      ✕
    </button>

    <h3 className="text-xl mb-4">Twój profil</h3>

    <p>Email: {user?.email}</p>
    <p>Rola: {user?.role}</p>

    <button
      onClick={goToProfile}
      className="w-full mt-4 p-2 rounded bg-blue-600 text-white"
    >
      Edytuj profil
    </button>

    <h3 className="text-xl mt-6 mb-4">Ustawienia</h3>

    <ul className="space-y-2">
      <li className="cursor-pointer" onClick={toggleTheme}>
        Motyw aplikacji: {theme === "dark" ? "🌙" : "☀️"}
      </li>
      <li className="cursor-pointer" onClick={goToChangePassword}>
        Zmień hasło
      </li>
    </ul>
  </div>
</div>

	
  );
}

export default function AppWrapper() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/profile" element={<ProfilePage />} />
	  <Route path="/change-password" element={<ChangePasswordPage />} />
    </Routes>
  );
}

