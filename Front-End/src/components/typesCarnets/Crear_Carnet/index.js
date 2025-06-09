import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './index.css';

const CrearCarnet = () => {
    const [formData, setFormData] = useState({
        Id: '',
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

   const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
            ...prev,
            foto: reader.result
            }));
        };
        reader.readAsDataURL(file);
        }
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
                    <label>Id Usuario:</label>
                    <input 
                    type="text" 
                    name="id" 
                    value={formData.Id} 
                    onChange={handleChange} 
                    className="form-control"
                    />
                </div>
                

                 <label>Foto:</label>
                <div className="photo-container">
                  
                    {formData.foto ? (
                    <img src={formData.foto} alt="Foto" className="photo-preview" />
                    ) : (
                    <div className="photo-placeholder">Foto</div>
                    )}
                    <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="photo-input"
                    />
                </div>
            
                </div>
            </div>
            </div>
            
            <div className="logout-container2">
        <button type="button" className="btn-Exit">
          Crear Carnet
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

export default CrearCarnet;