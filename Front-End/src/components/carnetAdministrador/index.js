import React, { useState } from 'react';
import './index.css';

// Importar componentes de typesCarnets
import Forms from '../typesCarnets/Formulario';
import CrearCarnet from '../typesCarnets/Crear_Carnet';
import EliminarCarnet from '../typesCarnets/Eliminar_Carnet';
import EliminarUsuario from '../typesCarnets/Eliminar_Usuario';
import ActulizarUsuario from '../typesCarnets/ActualizaUsuario/listaUsuario';


const MenuColumna = () => {
  const [activeItem, setActiveItem] = useState(null);

  const menuItems = [

     { 
      id: 'Crear-Usuario',
      title: "CREAR-USUARIO", 
      subtitle: "Crear un usuario", 
      component: <Forms/>
    },

    { 
        id: 'Actualizar-Usuario',
        title: "ACTUALIZAR-USUARIO", 
        subtitle: "Actualizar Carnet para un usuario", 
        component: <ActulizarUsuario/>
    },

     { 
      id: 'Eliminar-Usuario',
      title: "ELIMINAR-USUARIO", 
      subtitle: "Eliminar un usuario", 
      component: <EliminarUsuario/>
    },

    { 
      id: 'Crear-Carnet',
      title: "CREAR-CARNET", 
      subtitle: "Crear Carnet para un usuario", 
      component: <CrearCarnet/>
    },

     { 
      id: 'Eliminar-Carnet',
      title: "ELIMINAR-CARNET", 
      subtitle: "Eliminar Carnet para un usuario", 
      component: <EliminarCarnet/>
    },

  ];

  const renderContent = () => {
    if (activeItem === null) {
      return (
        <div className="welcome-message">
          <h2>Bienvenido al Panel de Administración</h2>
          <p>Seleccione una opción del menú para comenzar</p>
        </div>
      );
    }
    
    const selected = menuItems.find(item => item.id === activeItem);
    return selected.component || (
      <div className="content">
        <h2>{selected.title} {selected.subtitle}</h2>
        <p>{selected.content}</p>
      </div>
    );
  };

  return (
    <div className="menu-container">
      <div className="user-info">
        <span className="user-name">Nombre admin</span>
      </div>
      
      <div className="menu-title">HOME</div>
      
      <div className="menu-items">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => setActiveItem(item.id)}
          >
            <span className="item-title">{item.title}</span>
            <span className="item-subtitle">{item.subtitle}</span>
          </div>
        ))}
      </div>
      
      <div className="content-panel">
        {renderContent()}
      </div>
    </div>
  );
};

export default MenuColumna;