import React, { useState } from "react";
import axios from "axios";

export default function ChangePasswordPage() {
  const token = localStorage.getItem("token");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function savePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Wypełnij wszystkie pola");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Nowe hasła nie są identyczne");
      return;
    }

    try {
      setLoading(true);

      await axios.patch(
        "/api/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      alert("Hasło zostało zmienione");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      console.error("Błąd zmiany hasła:", e);
      alert(
        e.response?.data?.error ||
          "Nie udało się zmienić hasła (sprawdź aktualne hasło)"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      {/* KARTA */}
      <div className="w-full max-w-xl bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 m-4">
        <h2 className="text-2xl font-bold mb-6">Zmiana hasła</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Aktualne hasło
            </label>
            <input
              type="password"
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Nowe hasło
            </label>
            <input
              type="password"
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Powtórz nowe hasło
            </label>
            <input
              type="password"
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            disabled={loading}
            onClick={savePassword}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            {loading ? "Zapisywanie..." : "Zmień hasło"}
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
