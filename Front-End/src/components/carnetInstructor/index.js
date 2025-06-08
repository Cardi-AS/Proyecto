import "./index.css";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import image1 from "../../image/LogoSENA.png";

const CarnetAprendiz = () => {
  const location = useLocation();
  const usuarioInfo = location.state?.user;
  const [imageData, setImageData] = useState(null);
  const [imageDataQR, setImageDataQR] = useState(null);
  const navigate = useNavigate();

  const fechaObj = new Date(usuarioInfo.Fecha_Expiracion);
  const fechaFormateada = fechaObj.toISOString().split("T")[0];

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/ver_foto/${usuarioInfo.Id_Usuario}`)
      .then((response) => response.blob())
      .then((blob) => setImageData(URL.createObjectURL(blob)))
      .catch((error) => console.error("Error al obtener la imagen", error));

    fetch(`http://127.0.0.1:8000/ver_qr/${usuarioInfo.Id_Usuario}`)
      .then((response) => response.blob())
      .then((blob) => setImageDataQR(URL.createObjectURL(blob)))
      .catch((error) => console.error("Error al obtener la imagen QR", error));
  }, [usuarioInfo.Id_Usuario]);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="carnet-container">
      <div className="carnet-content">
        <div className="carnet-left">

          <div className="top-images-container">

            <div className="image1">
            <img src={image1} alt="Logo SENA" className="image1" />
            </div>

            <div className="photo-container">
            {imageData ? (
              <img src={imageData} alt="Imagen del usuario" className="user-photo-inline"/>
            ) : (
              <p>Cargando imagen...</p>
            )}

            </div>
          </div>

          <div className="info-group">
            <p className="role-label">INSTRUCTOR</p>
            <div className="linea-separador"></div>
            <p className="name">
              {usuarioInfo.Nombre} {usuarioInfo.Apellido}
            </p>
            <p className="document">C.C. {usuarioInfo.Numero_Identificacion}</p>
            <p className="rh">RH: {usuarioInfo.RH}</p>
             <div className="linea-separador2"></div>
            <p className="regional">Regional Distrito Capital</p>
            <p className="centro">
              Centro de Gestión de Mercados logística y <br />
              Tecnologías de la Información
            </p>
          </div>
        </div>

        <div className="carnet-right">
          <p className="paragraph">
           Este carnet es personal e intransferible; identifica al portador como aprendiz del Servicio Nacional de Aprendizaje SENA. El SENA es una entidad que imparte formación técnica profesional y tecnológica que forma parte de la Educación Superior. Se solicita a las autoridades públicas, civiles y militares prestarle al portador toda la colaboración para la realización de sus actividades de aprendizaje. Por disposición de las leyes 418 de 1997, 548 de 1991, 642 de 2001 y 1106 de 2006, los menores de 18 años y estudiantes de Educación Superior no serán incorporados al servicio militar.
          </p>
            

            <div className="qr-section">
            {imageDataQR ? (
              <img src={imageDataQR} alt="QR usuario" className="qr-code" />
            ) : (
              <p>Cargando QR...</p>
            )}
          </div>
          
          <div className="info-row">
            <span className="info-label">Ficha:</span>
            <span className="info-value">{usuarioInfo.ficha}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Programa:</span>
            <span className="info-value">
              ANÁLISIS Y DESARROLLO DE SOFTWARE
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Vence:</span>
            <span className="info-value">{fechaFormateada}</span>
          </div>
          
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

export default CarnetAprendiz;