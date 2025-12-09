// src/pages/RegisterPage.jsx  (o donde quieras)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Registro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    // Validaciones básicas
    if (!email.trim() || !password.trim()) {
      setError('Completa ambos campos');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Ingresa un email válido');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      // Axios recibe (URL, data, config)
      // No necesitas JSON.stringify, axios lo hace solo
      const response = await axios.post('http://localhost:3000/auth/register', {
        email,
        password
      }, {
        withCredentials: true // Esto reemplaza a 'credentials: include' de fetch
      });
      console.log(response.data);
      // Si axios llega aquí, es porque el status es 200-299
      setExito('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
      setEmail('');
      setPassword('');
    
    } catch (err) {
      // Axios captura errores 4xx y 5xx aquí
      if (err.response) {
        // El servidor respondió con un error (ej: 400, 409)
        setError(err.response.data.mensaje || 'Error al crear la cuenta');
      } else {
        // Error de red o el servidor no respondió
        setError('Error de conexión. Inténtalo más tarde.');
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Crear cuenta</h1>
            <p className="text-gray-500 mt-2">Regístrate para jugar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {exito && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {exito}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="tujugador@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Crear cuenta
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Ya tienes cuenta? 
            <Link 
              to="/login" 
              className="text-blue-600 hover:underline font-medium"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;