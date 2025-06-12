import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './index.css';

const CrearCarnet = () => {
    const [formData, setFormData] = useState({
        Id: '',
        ficha: '',
        foto: null,
        fotoPreview: null
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

    const handleLogout = () => {
        navigate("/");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar que sea imagen
            if (!file.type.startsWith('image/')) {
                setError('Por favor selecciona un archivo de imagen válido');
                return;
            }

            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen es demasiado grande. Máximo 5MB');
                return;
            }

            setError(''); // Limpiar errores previos
            
            // Guardar el archivo real para envío
            setFormData(prev => ({
                ...prev,
                foto: file
            }));

            // Crear preview para mostrar
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    fotoPreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Validaciones
        if (!formData.Id) {
            setError('El ID de usuario es requerido');
            setLoading(false);
            return;
        }

        if (!formData.ficha) {
            setError('La ficha es requerida');
            setLoading(false);
            return;
        }

        if (!formData.foto) {
            setError('La foto es requerida');
            setLoading(false);
            return;
        }

        try {
            // Crear FormData para enviar archivo
            const formDataToSend = new FormData();
            formDataToSend.append('id_usuario', formData.Id);
            formDataToSend.append('ficha', formData.ficha);
            formDataToSend.append('imagen', formData.foto);

            const response = await fetch('http://localhost:8000/crear-carnet', {
                method: 'POST',
                body: formDataToSend // No agregar Content-Type header, el browser lo hace automáticamente
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Carnet creado exitosamente');
                // Limpiar el formulario
                setFormData({
                    Id: '',
                    ficha: '',
                    foto: null,
                    fotoPreview: null
                });
                // Limpiar el input file
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) {
                    fileInput.value = '';
                }
            } else {
                setError(data.detail || 'Error al crear el carnet');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="carnet-container">
            <div className="carnet-card">
                <div className="carnet-header">
                    <h2>Crear Carnet Institucional</h2>
                </div>
                
                <div className="carnet-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>ID Usuario:</label>
                                    <input 
                                        type="number" 
                                        name="Id" 
                                        value={formData.Id} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        placeholder="Ingrese el ID del usuario"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Ficha:</label>
                                    <input 
                                        type="number" 
                                        name="ficha" 
                                        value={formData.ficha} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        placeholder="Ingrese el número de ficha"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label>Foto:</label>
                                    <div className="photo-container">
                                        {formData.fotoPreview ? (
                                            <img 
                                                src={formData.fotoPreview} 
                                                alt="Vista previa" 
                                                className="photo-preview" 
                                            />
                                        ) : (
                                            <div className="photo-placeholder">
                                                <span>📷</span>
                                                <p>Seleccionar foto</p>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                            className="photo-input"
                                            required
                                        />
                                    </div>
                                    <small className="file-info">
                                        FORMATOS SOPORTADOS: JPG, PNG, GIF. MÁXIMO 5MB.
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="info-section">
                            <h4>Información del Carnet</h4>
                            <div className="info-grid">
                                <div className="info-item">
                                    <strong>NOTA</strong> ASEGURATE QUE EL USUARIO EXISTA EN EL SISTEMA
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
                                {loading ? 'Creando Carnet...' : 'Crear Carnet'}
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

export default CrearCarnet;