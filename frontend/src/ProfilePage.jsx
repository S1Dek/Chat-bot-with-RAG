// frontend/src/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProfilePage() {
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await axios.get("/api/auth/me", {
        headers: { Authorization: "Bearer " + token },
      });

      setName(res.data.name || "");
      setEmail(res.data.email || "");
    } catch (e) {
      console.error("Błąd ładowania profilu:", e);
      alert("Nie udało się pobrać danych profilu");
    }
  }

  async function saveChanges() {
    try {
      await axios.patch(
        "/api/auth/update",
        { name, email },
        { headers: { Authorization: "Bearer " + token } }
      );
      alert("Zapisano zmiany");
    } catch (e) {
      console.error("Błąd zapisu profilu:", e);
      alert("Nie udało się zapisać zmian");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      {/* KONTENER KARTY */}
      <div className="w-full max-w-xl bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 m-4">
        <h2 className="text-2xl font-bold mb-6">Edycja profilu</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-300">Imię</label>
            <input
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Email</label>
            <input
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium"
            onClick={saveChanges}
          >
            Zapisz zmiany
          </button>

          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            Powrót do czatu
          </a>
        </div>
      </div>
    </div>
  );
}
