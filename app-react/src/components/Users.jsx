import React, { useEffect, useState } from 'react';
import echo from '../echo'; // ajuste o caminho conforme seu projeto

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const channel = echo.channel('users.channel');

    channel.listen('.UsersUpdated', (e) => {
      if (e.success) {
        console.log('Usuários recebidos via evento:', e.users);
        setUsers(e.users);
      } else {
        console.error('Erro ao atualizar usuários');
      }
    });

    return () => {
      echo.leaveChannel('users.channel');
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Lista de Usuários</h2>
      {users.length > 0 ? (
        <table className="w-full text-left border-collapse">
          <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Atualizado em</th>
          </tr>
          </thead>
          <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="p-2 border">{user.id}</td>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.updated_at}</td>
            </tr>
          ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum usuário disponível.</p>
      )}
    </div>
  );
};

export default Users;
