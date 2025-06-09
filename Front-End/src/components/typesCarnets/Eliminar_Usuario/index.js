import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './index.css';

const Eliminar_Usuario = () => {
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
            </div>
        </div>
        </div>
            
            <div className="logout-container2">
        <button type="button" className="btn-Exit">
            Eliminar Usuario
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