import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPanel({ token }) {
    const [users, setUsers] = useState([]);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("user");

    async function loadUsers() {
        const res = await axios.get("/api/admin/users", {
            headers: { Authorization: "Bearer " + token },
        });
        setUsers(res.data);
    }

    async function createUser() {
        await axios.post(
            "/api/admin/users", {
                email: newEmail,
                password: newPassword,
                role: newRole,
            }, { headers: { Authorization: "Bearer " + token } }
        );

        loadUsers();
        setNewEmail("");
        setNewPassword("");
    }

    async function deleteUser(id) {
        if (!window.confirm("Usunąć użytkownika?")) return;

        await axios.delete("/api/admin/users/" + id, {
            headers: { Authorization: "Bearer " + token },
        });

        loadUsers();
    }

    async function resetPassword(id) {
        await axios.patch(
            "/api/admin/users/" + id + "/reset", {}, { headers: { Authorization: "Bearer " + token } }
        );

    }

    async function updateRole(id, role) {
        await axios.patch(
            "/api/admin/users/" + id, { role }, { headers: { Authorization: "Bearer " + token } }
        );

        loadUsers();
    }

    useEffect(() => {
        loadUsers();
    }, []);

    return ( <
        div className = "p-6 text-white" >
        <
        h2 className = "text-xl font-bold mb-4" > Panel Administratora < /h2>{" "} <
        div className = "mb-4" >
        <
        input placeholder = "Email"
        className = "p-2 bg-gray-800 border border-gray-600 mr-2"
        value = { newEmail }
        onChange = {
            (e) => setNewEmail(e.target.value) }
        />{" "} <
        input placeholder = "Hasło"
        className = "p-2 bg-gray-800 border border-gray-600 mr-2"
        value = { newPassword }
        onChange = {
            (e) => setNewPassword(e.target.value) }
        />{" "} <
        select className = "p-2 bg-gray-800 border border-gray-600 mr-2"
        value = { newRole }
        onChange = {
            (e) => setNewRole(e.target.value) } >
        <
        option value = "user" > user < /option>{" "} <
        option value = "admin" > admin < /option>{" "} <
        /select>{" "} <
        button className = "bg-blue-600 px-4 py-2 rounded"
        onClick = { createUser } >
        Dodaj użytkownika { " " } <
        /button>{" "} <
        /div>{" "} 
		<table className="w-full text-left text-gray-300 table-auto">
		  <thead>
			<tr>
			  <th className="whitespace-nowrap">Email</th>
			  <th className="whitespace-nowrap">Rola</th>
			  <th className="whitespace-nowrap">Akcje</th>
			</tr>
		  </thead>

		  <tbody>
			<div className="space-y-4">
			  {users.map((u) => (
				<div
				  key={u.id}
				  className="p-4 bg-gray-800 border border-gray-700 rounded-lg"
				>
				  <div className="text-lg font-semibold text-white mb-1">
					{u.email}
				  </div>

				  <div className="text-sm text-gray-400 mb-3">
					Rola: <span className="font-medium">{u.role}</span>
				  </div>

				  <div className="flex flex-wrap gap-3">
					<button
					  className="text-yellow-400"
					  onClick={() => resetPassword(u.id)}
					>
					  Reset hasła
					</button>

					<button
					  className="text-green-400"
					  onClick={() => updateRole(u.id, "admin")}
					>
					  Nadaj admin
					</button>

					<button
					  className="text-blue-400"
					  onClick={() => updateRole(u.id, "user")}
					>
					  Nadaj user
					</button>

					<button
					  className="text-red-400"
					  onClick={() => deleteUser(u.id)}
					>
					  Usuń
					</button>
				  </div>
				</div>
			  ))}
			</div>
		  </tbody>
		</table>
		{" "} <
        /div>
    );
}