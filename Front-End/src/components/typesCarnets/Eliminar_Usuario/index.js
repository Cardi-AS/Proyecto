import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './index.css';

const Eliminar_Usuario = () => {
    const [formData, setFormData] = useState({
        Id: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' o 'error'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar mensajes cuando el usuario escriba
        if (message) {
            setMessage('');
            setMessageType('');
        }
    };

    const navigate = useNavigate();
    
    const handleLogout = () => {
        navigate("/");
    };

    const handleEliminarUsuario = async () => {
        // Validar que se haya ingresado un ID
        if (!formData.Id || formData.Id.trim() === '') {
            setMessage('Por favor, ingrese un ID de usuario válido');
            setMessageType('error');
            return;
        }

        // Confirmar la eliminación
        const confirmDelete = window.confirm(
            `¿Está seguro de que desea eliminar el usuario con ID ${formData.Id}? Esta acción no se puede deshacer.`
        );

        if (!confirmDelete) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`http://localhost:8000/eliminar/${formData.Id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Usuario eliminado correctamente');
                setMessageType('success');
                // Limpiar el formulario después de eliminar
                setFormData({ Id: '' });
            } else {
                setMessage(data.detail || 'Error al eliminar el usuario');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            setMessage('Error de conexión. Verifique que el servidor esté funcionando.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="carnet-container">
            <div className="carnet-card">
                <div className="carnet-header">
                    <h2>Eliminar Usuario</h2>
                </div>
                
                <div className="carnet-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                            </div>
                        </div>
                        
                        <div className="col-md-8">
                            <div className="form-group">
                                <label>ID Usuario:</label>
                                <input 
                                    type="number" 
                                    name="Id" 
                                    value={formData.Id} 
                                    onChange={handleChange} 
                                    className="form-control"
                                    placeholder="Ingrese el ID del usuario a eliminar"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mostrar mensajes de éxito o error */}
                    {message && (
                        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
                            {message}
                        </div>
                    )}
                </div>
                
                <div className="logout-container2">
                    <button 
                        type="button" 
                        className="btn-Exit"
                        onClick={handleEliminarUsuario}
                        disabled={loading}
                    >
                        {loading ? 'Eliminando...' : 'Eliminar Usuario'}
                    </button>
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

export default Eliminar_Usuario;