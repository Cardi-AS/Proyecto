import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './index.css';

const CrearUsuario = () => {
    const [formData, setFormData] = useState({
        Nombre: '',
        Apellido: '',
        Correo: '',
        Contraseña: '',
        TipoIdentificacion: '',
        NumeroIdentificacion: '',
        Rol: '',
        Edad: '',
        RH: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Convertir edad y número de identificación a números
            const userData = {
                ...formData,
                Edad: parseInt(formData.Edad),
                NumeroIdentificacion: formData.NumeroIdentificacion
            };

            const response = await fetch('http://localhost:8000/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Usuario creado correctamente');
                // Limpiar el formulario
                setFormData({
                    Nombre: '',
                    Apellido: '',
                    Correo: '',
                    Contraseña: '',
                    TipoIdentificacion: '',
                    NumeroIdentificacion: '',
                    Rol: '',
                    Edad: '',
                    RH: ''
                });
            } else {
                setError(data.detail || 'Error al crear el usuario');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="carnet-container">
            <div className="carnet-card">
                <div className="carnet-header">
                    <h2>Crear Usuario</h2>
                </div>
                
                <div className="carnet-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Nombre:</label>
                                    <input 
                                        type="text" 
                                        name="Nombre" 
                                        value={formData.Nombre} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Apellido:</label>
                                    <input 
                                        type="text" 
                                        name="Apellido" 
                                        value={formData.Apellido} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Correo:</label>
                                    <input 
                                        type="email" 
                                        name="Correo" 
                                        value={formData.Correo} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Contraseña:</label>
                                    <input 
                                        type="password" 
                                        name="Contraseña" 
                                        value={formData.Contraseña} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Tipo de Identificación:</label>
                                    <select 
                                        name="TipoIdentificacion" 
                                        value={formData.TipoIdentificacion} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="TI">Tarjeta de Identidad</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                        <option value="PP">Pasaporte</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Número de Identificación:</label>
                                    <input 
                                        type="text" 
                                        name="NumeroIdentificacion" 
                                        value={formData.NumeroIdentificacion} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Rol:</label>
                                    <select 
                                        name="Rol" 
                                        value={formData.Rol} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="aprendiz">aprendiz</option>
                                        <option value="instructor">instructor</option>
                                        <option value="administrativo">administrativo</option>
                                        <option value="administrador">administrador</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Edad:</label>
                                    <input 
                                        type="number" 
                                        name="Edad" 
                                        value={formData.Edad} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        min="16"
                                        max="100"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>RH:</label>
                                    <select 
                                        name="RH" 
                                        value={formData.RH} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Mensajes de éxito o error */}
                        {message && (
                            <div className="alert alert-success">
                                {message}
                            </div>
                        )}
                        
                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <div className="logout-container2">
                            <button 
                                type="submit" 
                                className="btn-Exit"
                                disabled={loading}
                            >
                                {loading ? 'Creando...' : 'Crear Usuario'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="logout-container">
                <button type="button" className="btn-Exit" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
};

export default CrearUsuario;