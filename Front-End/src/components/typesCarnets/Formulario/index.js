import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './index.css';

const Formulario = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        contraseña: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        rol: '',
        edad: '',
        rh: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const navigate = useNavigate();
    const handleLogout = () => {
    navigate("/");
  };

    return (
        <div className="carnet-container">
        <div className="carnet-card">
            <div className="carnet-header">
            <h2>Carnet Institucional</h2>
            </div>
            
            <div className="carnet-body">
            <div className="row">

                <div className="col-md-6">
                <div className="form-group">
                </div>
                </div>
                
                <div className="col-md-8">
                <div className="form-group">
                    <label>Nombres:</label>
                    <input 
                    type="text" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>
                
                <div className="form-group">
                    <label>Apellidos:</label>
                    <input 
                    type="text" 
                    name="apellido" 
                    value={formData.apellido} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>

                
                    <div className="form-group">
                    <label>Correo:</label>
                    <input 
                    type="text" 
                    name="nombre" 
                    value={formData.correo} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>
                

            
                    <div className="form-group">
                    <label>Contraseña:</label>
                    <input 
                    type="text" 
                    name="nombre" 
                    value={formData.contraseña} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>
                
                
                    <div className="form-group">
                    <label>TipoIdentificacion:</label>
                    <input 
                    type="text" 
                    name="nombre" 
                    value={formData.tipoIdentificacion} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>

                
                    <div className="form-group">
                    <label>NumeroIdenficacion:</label>
                    <input 
                    type="text" 
                    name="nombre" 
                    value={formData.numeroIdentificacion} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>
            
            
                    <div className="form-group">
                    <label>Rol:</label>
                    <input 
                    type="text" 
                    name="nombre" 
                    value={formData.rol} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>

                
                    <div className="form-group">
                    <label>Edad:</label>
                    <input 
                    type="text" 
                    name="nombre" 
                    value={formData.edad} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>

                
                    <div className="form-group">
                    <label>Rh:</label>
                    <input 
                    type="text" 
                    name="nombre" 
                    value={formData.rh} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>
                
            
                </div>
            </div>
            </div>
            
            <div className="logout-container2">
        <button type="button" className="btn-Exit">
          Guardar Cambios
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

export default Formulario;