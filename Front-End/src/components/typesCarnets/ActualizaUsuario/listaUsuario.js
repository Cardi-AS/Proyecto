import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './index.css';

const ActualizarUsuario = () => {
    const [userId, setUserId] = useState('');
    const [userFound, setUserFound] = useState(false);
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
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
    const [loadingUser, setLoadingUser] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Función para cargar la lista de usuarios disponibles
    const cargarUsuariosDisponibles = async () => {
        try {
            const response = await fetch('http://localhost:8000/usuarios/lista');
            if (response.ok) {
                const data = await response.json();
                setUsuariosDisponibles(data.usuarios || []);
                setMostrarUsuarios(true);
            }
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
        }
    };

    // Función para buscar usuario por ID
    const buscarUsuario = async () => {
        if (!userId.trim()) {
            setError('Por favor ingresa un ID de usuario');
            return;
        }

        setLoadingUser(true);
        setError('');
        setMessage('');
        setUserFound(false);

        try {
            console.log(`Buscando usuario con ID: ${userId}`);
            const response = await fetch(`http://localhost:8000/usuario/${userId}`);
            
            console.log(`Respuesta del servidor:`, response.status, response.statusText);
            
            if (response.ok) {
                const userData = await response.json();
                console.log('Datos del usuario recibidos:', userData);
                
                setFormData({
                    Nombre: userData.Nombre || '',
                    Apellido: userData.Apellido || '',
                    Correo: userData.Correo || '',
                    Contraseña: '', // No cargar la contraseña por seguridad
                    TipoIdentificacion: userData.TipoIdentificacion || '',
                    NumeroIdentificacion: userData.NumeroIdentificacion || '',
                    Rol: userData.Rol || '',
                    Edad: userData.Edad ? userData.Edad.toString() : '',
                    RH: userData.RH || ''
                });
                setUserFound(true);
                setMessage(`Usuario encontrado: ${userData.Nombre} ${userData.Apellido}`);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error del servidor:', errorData);
                setError(errorData.detail || `Error ${response.status}: Usuario no encontrado`);
                setUserFound(false);
            }
        } catch (err) {
            setError('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
            console.error('Error completo:', err);
            setUserFound(false);
        } finally {
            setLoadingUser(false);
        }
    };

    // Función para manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Preparar datos para enviar (solo campos que no estén vacíos)
            const dataToSend = {};
            
            // Corregir los nombres de los campos para que coincidan con el backend
            if (formData.Nombre.trim()) dataToSend.Nombre = formData.Nombre.trim();
            if (formData.Apellido.trim()) dataToSend.Apellido = formData.Apellido.trim();
            if (formData.Correo.trim()) dataToSend.Correo = formData.Correo.trim();
            if (formData.Contraseña.trim()) dataToSend.Contraseña = formData.Contraseña.trim();
            if (formData.TipoIdentificacion) dataToSend.TipoIdentificacion = formData.TipoIdentificacion;
            if (formData.NumeroIdentificacion.trim()) dataToSend.NumeroIdentificacion = formData.NumeroIdentificacion.trim();
            if (formData.Rol) dataToSend.Rol = formData.Rol;
            if (formData.Edad) dataToSend.Edad = parseInt(formData.Edad);
            if (formData.RH) dataToSend.RH = formData.RH;

            console.log('Datos a enviar:', dataToSend); // Para debug

            // Verificar que hay al menos un campo para actualizar
            if (Object.keys(dataToSend).length === 0) {
                setError('Debe modificar al menos un campo para actualizar');
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:8000/actualizar/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data); // Para debug

            if (response.ok) {
                setMessage(data.message || 'Usuario actualizado correctamente');
                
                // Actualizar los datos del formulario con la respuesta del servidor
                if (data.usuario) {
                    setFormData(prev => ({
                        ...prev,
                        Nombre: data.usuario.Nombre || prev.Nombre,
                        Apellido: data.usuario.Apellido || prev.Apellido,
                        Correo: data.usuario.Correo || prev.Correo,
                        TipoIdentificacion: data.usuario.TipoIdentificacion || prev.TipoIdentificacion,
                        NumeroIdentificacion: data.usuario.NumeroIdentificacion || prev.NumeroIdentificacion,
                        Rol: data.usuario.Rol || prev.Rol,
                        Edad: data.usuario.Edad ? data.usuario.Edad.toString() : prev.Edad,
                        RH: data.usuario.RH || prev.RH,
                        Contraseña: '' // Limpiar campo de contraseña
                    }));
                }
                
            } else {
                setError(data.detail || 'Error al actualizar el usuario');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        navigate("/");
    };

    // Función para resetear el formulario
    const handleReset = () => {
        setUserId('');
        setUserFound(false);
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
        setMessage('');
        setError('');
        setMostrarUsuarios(false);
    };

    return (
        <div className="carnet-container">
            <div className="carnet-card">
                <div className="carnet-header">
                    <h2>Actualizar Usuario</h2>
                </div>
                
                <div className="carnet-body">
                    {/* Sección para buscar usuario */}
                    <div className="search-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                        <h3>Buscar Usuario</h3>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>ID del Usuario:</label>
                                    <input 
                                        type="number" 
                                        value={userId} 
                                        onChange={(e) => setUserId(e.target.value)} 
                                        className="form-control"
                                        placeholder="Ingresa el ID del usuario"
                                        disabled={loadingUser}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>&nbsp;</label>
                                    <div>
                                        <button 
                                            type="button" 
                                            className="btn-Exit"
                                            onClick={buscarUsuario}
                                            disabled={loadingUser || !userId.trim()}
                                            style={{ marginRight: '10px' }}
                                        >
                                            {loadingUser ? 'Buscando...' : 'Buscar'}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn-Exit"
                                            onClick={cargarUsuariosDisponibles}
                                            style={{ backgroundColor: '#007bff', marginRight: '10px' }}
                                        >
                                            Ver Usuarios
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn-Exit"
                                            onClick={handleReset}
                                            style={{ backgroundColor: '#6c757d' }}
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lista de usuarios disponibles */}
                        {mostrarUsuarios && usuariosDisponibles.length > 0 && (
                            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', maxHeight: '200px', overflowY: 'auto' }}>
                                <h4>Usuarios Disponibles:</h4>
                                <div className="row">
                                    {usuariosDisponibles.map(usuario => (
                                        <div key={usuario.Id_Usuario} className="col-md-4" style={{ marginBottom: '10px' }}>
                                            <div 
                                                style={{ 
                                                    padding: '8px', 
                                                    border: '1px solid #dee2e6', 
                                                    borderRadius: '3px', 
                                                    cursor: 'pointer',
                                                    backgroundColor: userId === usuario.Id_Usuario.toString() ? '#e3f2fd' : 'white'
                                                }}
                                                onClick={() => {
                                                    setUserId(usuario.Id_Usuario.toString());
                                                    setMostrarUsuarios(false);
                                                }}
                                            >
                                                <strong>ID: {usuario.Id_Usuario}</strong><br/>
                                                {usuario.Nombre} {usuario.Apellido}<br/>
                                                <small>{usuario.Rol}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setMostrarUsuarios(false)}
                                    style={{ marginTop: '10px', padding: '5px 10px', border: 'none', backgroundColor: '#6c757d', color: 'white', borderRadius: '3px' }}
                                >
                                    Ocultar Lista
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Formulario de actualización (solo se muestra si se encontró el usuario) */}
                    {userFound && (
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
                                            placeholder="Dejar vacío para no cambiar"
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
                                            placeholder="Dejar vacío para no cambiar"
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
                                            placeholder="Dejar vacío para no cambiar"
                                        />
                                    </div>
                                </div>
                                
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Nueva Contraseña:</label>
                                        <input 
                                            type="password" 
                                            name="Contraseña" 
                                            value={formData.Contraseña} 
                                            onChange={handleChange} 
                                            className="form-control"
                                            placeholder="Dejar vacío para no cambiar"
                                        />
                                        <small className="form-text text-muted">
                                            Solo completa si deseas cambiar la contraseña
                                        </small>
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
                                        >
                                            <option value="">No cambiar</option>
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
                                            placeholder="Dejar vacío para no cambiar"
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
                                        >
                                            <option value="">No cambiar</option>
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
                                            placeholder="Dejar vacío para no cambiar"
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
                                        >
                                            <option value="">No cambiar</option>
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

                            <div className="logout-container2">
                                <button 
                                    type="submit" 
                                    className="btn-Exit"
                                    disabled={loading}
                                    style={{ marginRight: '10px' }}
                                >
                                    {loading ? 'Actualizando...' : 'Actualizar Usuario'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Mensajes de éxito o error */}
                    {message && (
                        <div className="alert alert-success" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px', color: '#155724' }}>
                            {message}
                        </div>
                    )}
                    
                    {error && (
                        <div className="alert alert-error" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px', color: '#721c24' }}>
                            {error}
                        </div>
                    )}
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

export default ActualizarUsuario;