import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import image1 from '../../image/LogoSENA.png';

const Login = ({ onLogin }) => {
   
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
    
        // Validación de campos vacíos
        if (!correo || !contrasena) {
            setMessage('Por favor, complete todos los campos.');
            return;
        }
    
        try {
            // Llamada al backend FastAPI
            const url = `http://127.0.0.1:8000/login?correo=${encodeURIComponent(correo)}&contrasena=${encodeURIComponent(contrasena)}`;

            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'  // Puedes mantenerlo aunque no envíes body
              }
            });
           
            console.log(response);
    
            const data = await response.json();
    
            if (response.ok) {
                setMessage('Inicio de sesión exitoso');
                console.log(data);
                // Redirección según el rol
                switch (data.Rol) {
                    case 'aprendiz':
                        navigate('/carnetAprendiz',{ state: { user: data } });
                        break;
                    case 'instructor':
                        navigate('/carnetInstructor', { state: { user: data } });
                        break;
                    case 'administrativo':
                        navigate('/carnetAdministrativo', { state: { user: data } });
                        break;
                    case 'administrador':
                        navigate('/carnetAdministrador', { state: { user: data } });
                        break;
                    default:
                        setMessage('Rol no válido');
                }
            } else {
                setMessage(data.detail || 'Correo o contraseña incorrectos');
            }
        } catch (error) {
            setMessage(`Error al iniciar sesión: ${error.message}`);
        }
    };

    return (
        <div className="App">
            <div className="cuadro-inferior1">
                <div className="recuadro"></div>
            </div>
            {/* Contenedor principal para centrar el contenido */}
            <div className="login-container">
                <div className="container2">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="recuadroDer p-4">
                                <h2 className="text-center">LOGIN</h2>
                                <div className="recuadro2 p-3">
                                    {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
                                    
                                    {/* Campo de correo institucional */}
                                    <div className="row">
                                        <div className="col-sm-12 mb-3">
                                            <div className="form-group">
                                                <input 
                                                    className="form-control" 
                                                    placeholder="Correo Institucional" 
                                                    id="email"
                                                    value={correo}
                                                    onChange={(e) => setCorreo(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Campo de contraseña */}
                                    <div className="row">
                                        <div className="col-sm-12 mb-3">
                                            <div className="form-group">
                                                <input 
                                                    type="password" 
                                                    className="form-control" 
                                                    placeholder="Contraseña" 
                                                    id="password"
                                                    value={contrasena}
                                                    onChange={(e) => setContrasena(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Botón de iniciar sesión */}
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-block"
                                            onClick={handleLogin}
                                        >
                                            Iniciar sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Imagen añadida aquí */}
                <div className="logo-container">
                    <img src={image1} alt="Logo" className="login-logo" />
                </div>
            </div>
           
        </div>
    );
};

export default Login;