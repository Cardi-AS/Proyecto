from pydantic import BaseModel
from conexion import cursor
from fastapi import APIRouter, status, HTTPException, UploadFile, File, Form
from datetime import date
from dateutil.relativedelta import relativedelta
from conexion import cursor, mydb
import qrcode
import uuid
from fastapi.responses import FileResponse
import os
import mysql.connector

carnetRouter = APIRouter()

class Carnet(BaseModel):
    FkIdUsuario: int
    Ficha : int
    FechaExpiracion: date
    Foto: str
    CodigoQR: str
    


@carnetRouter.get("/ver_qr/{id_usuario}")
def ver_qr(id_usuario: int):
    carpeta_destino = "C:\\Users\\juan2\\Documents\\Proyecto\\Qr"
    ruta_archivo = carpeta_destino + f"/qr_{id_usuario}.png"
    if os.path.exists(ruta_archivo):
        return FileResponse(ruta_archivo, media_type="image/png")
    else:
        return {"error": "QR no encontrado"}

@carnetRouter.get("/ver_foto/{id_usuario}")
def ver_qr(id_usuario: int):
    carpeta_destino = "C:\\Users\\juan2\\Documents\\Proyecto\\FotoUser"
    ruta_archivo = carpeta_destino + f"/foto_{id_usuario}.png"
    if os.path.exists(ruta_archivo):
        return FileResponse(ruta_archivo, media_type="image/png")
    else:
        return {"error": "QR no encontrado"}


def generar_codigo_qr(id_usuario: int) -> str:
     # Contenido único del QR
    carpeta_destino = "C:\\Users\\juan2\\Documents\\Proyecto\\Qr"
    contenido_qr = f"CARNET-{id_usuario}"

    # Asegurar que la carpeta exista
    os.makedirs(carpeta_destino, exist_ok=True)

    # Nombre del archivo
    nombre_archivo = f"qr_{id_usuario}.png"
    ruta_completa = os.path.join(carpeta_destino, nombre_archivo)

    # Crear y guardar la imagen
    qr = qrcode.make(contenido_qr)
    qr.save(ruta_completa)

    return nombre_archivo  # Este string puedes guardarlo en el campo CodigoQR


@carnetRouter.get("/carnet/{Id_Usuario}", status_code=status.HTTP_200_OK)
def get_user_by_id(Id_Usuario: int):
    select_query = "SELECT * FROM Carnet WHERE Id_Usuario = %s"
    cursor.execute(select_query, (Id_Usuario,))
    result = cursor.fetchall()
    if result:
        return result
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
@carnetRouter.post("/crear-carnet", status_code=status.HTTP_201_CREATED)
def crear_carnet( id_usuario: int = Form(...), imagen: UploadFile = File(...)):
    try:
        # 1. Calcular fecha de expiración (+3 años)
        fecha_expiracion = date.today() + relativedelta(years=3)

        # 2. Generar imagen QR y código QR
        codigo_qr = generar_codigo_qr(id_usuario)
        
         # 3. Guardar imagen subida
        Foto = f"foto_{id_usuario}.png"
        ruta_guardado = f"C:\\Users\\juan2\\Documents\\Proyecto\\FotoUser/{Foto}"
        
        with open(ruta_guardado, "wb") as f:
            f.write(imagen.file.read())
        
        #4. ficha
        Ficha= 2826502

        #Insertar en base de datos
        insert_query = """
        INSERT INTO carnet (Fk_Id_Usuario, Ficha, Fecha_Expiracion, Foto, CodigoQR)
        VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            id_usuario,
            Ficha,
            fecha_expiracion,
            Foto,
            codigo_qr
        )

        cursor.execute(insert_query, values)
        mydb.commit()

        return {"message": "Carnet creado exitosamente"}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error del servidor: {err}")