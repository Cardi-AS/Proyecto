import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './index.css';

const Eliminar_Carnet = () => {
    const [formData, setFormData] = useState({
        Id: '',
    });
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [carnetInfo, setCarnetInfo] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar mensaje cuando el usuario empiece a escribir
        if (mensaje) setMensaje('');
    };

    const navigate = useNavigate();
    
    const handleLogout = () => {
        navigate("/");
    };

    // Función para verificar si existe el carnet antes de eliminar
    const verificarCarnet = async () => {
        if (!formData.Id) {
            setMensaje('Por favor ingresa un ID de usuario');
            return;
        }

        setLoading(true);
        setMensaje('');

        try {
            const response = await fetch(`http://localhost:8000/carnet/${formData.Id}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No se encontró un carnet para este usuario');
                }
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al verificar el carnet');
            }

            const data = await response.json();
            setCarnetInfo(data[0]); // Asumiendo que retorna un array
            setShowConfirmation(true);

        } catch (error) {
            setMensaje(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const confirmarEliminacion = async () => {
        setLoading(true);
        setMensaje('');

        try {
            const response = await fetch(`http://localhost:8000/eliminar-carnet/${formData.Id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al eliminar el carnet');
            }

            const data = await response.json();
            setMensaje(` ${data.message || 'Carnet eliminado con éxito'}`);
            setFormData({ Id: '' });
            setShowConfirmation(false);
            setCarnetInfo(null);

        } catch (error) {
            setMensaje(` Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cancelarEliminacion = () => {
        setShowConfirmation(false);
        setCarnetInfo(null);
    };

    return (
        <div className="carnet-container">
            <div className="carnet-card">
                <div className="carnet-header">
                    <h2>Eliminar Carnet Institucional</h2>
                </div>
                
                <div className="carnet-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                            </div>
                        </div>
                        
                        <div className="col-md-8">
                            <div className="form-group">
                                <label>Id Usuario:</label>
                                <input 
                                    type="number" 
                                    name="Id" 
                                    value={formData.Id} 
                                    onChange={handleChange} 
                                    className="form-control"
                                    placeholder="Ingresa el ID del usuario"
                                    disabled={loading || showConfirmation}
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mostrar información del carnet si se encontró */}
                    {carnetInfo && showConfirmation && (
                        <div className="carnet-info-warning">
                            <h4 className="warning-title">
                               Confirmar Eliminación
                            </h4>
                            <p className="warning-text">
                                ¿Estás seguro de que deseas eliminar este carnet?
                            </p>
                        </div>
                    )}

                    {/* Mostrar mensajes */}
                    {mensaje && (
                        <div className={`mensaje ${mensaje.includes('✅') ? 'mensaje-exito' : 'mensaje-error'}`}>
                            {mensaje}
                        </div>
                    )}
                </div>
                
                {/* Botones de acción */}
                {!showConfirmation ? (
                    <div className="logout-container2">
                        <button 
                            type="button" 
                            className={`btn-Exit ${loading || !formData.Id ? 'btn-disabled' : ''}`}
                            onClick={verificarCarnet}
                            disabled={loading || !formData.Id}
                        >
                            {loading ? 'Verificando...' : 'Buscar y Eliminar Carnet'}
                        </button>
                    </div>
                ) : (
                    <div className="confirmation-buttons">
                        <button 
                            type="button" 
                            className={`btn-Cancel ${loading ? 'btn-disabled' : ''}`}
                            onClick={cancelarEliminacion}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button" 
                            className={`btn-Delete ${loading ? 'btn-disabled' : ''}`}
                            onClick={confirmarEliminacion}
                            disabled={loading}
                        >
                            {loading ? 'Eliminando...' : 'Confirmar Eliminación'}
                        </button>
                    </div>
                )}
            </div>

            <div className="logout-container">
                <button type="button" className="btn-Exit" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
};

export default Eliminar_Carnet;