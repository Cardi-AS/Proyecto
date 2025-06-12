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
    carpeta_destino = "C:\\Users\\mauri\\OneDrive\\Escritorio\\Proyecto\\Qr"
    ruta_archivo = carpeta_destino + f"/qr_{id_usuario}.png"
    if os.path.exists(ruta_archivo):
        return FileResponse(ruta_archivo, media_type="image/png")
    else:
        return {"error": "QR no encontrado"}

@carnetRouter.get("/ver_foto/{id_usuario}")
def ver_qr(id_usuario: int):
    carpeta_destino = "C:\\Users\\mauri\\OneDrive\\Escritorio\\Proyecto\\FotoUser"
    ruta_archivo = carpeta_destino + f"/foto_{id_usuario}.png"
    if os.path.exists(ruta_archivo):
        return FileResponse(ruta_archivo, media_type="image/png")
    else:
        return {"error": "QR no encontrado"}


def generar_codigo_qr(id_usuario: int) -> str:
     # Contenido único del QR
    carpeta_destino = "C:\\Users\\mauri\\OneDrive\\Escritorio\\Proyecto\\Qr"
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
def get_carnet_by_usuario(Id_Usuario: int):
    select_query = """
    SELECT Id_Carnet, Fk_Id_Usuario, Ficha, Fecha_Expiracion, Foto, CodigoQR
    FROM carnet 
    WHERE Fk_Id_Usuario = %s
    """
    cursor.execute(select_query, (Id_Usuario,))
    result = cursor.fetchall()
    if result:
        return result
    else:
        raise HTTPException(status_code=404, detail="Carnet no encontrado para este usuario")

    
@carnetRouter.post("/crear-carnet", status_code=status.HTTP_201_CREATED)
def crear_carnet(
    id_usuario: int = Form(...), 
    ficha: int = Form(...),  # Ahora ficha es un parámetro requerido
    imagen: UploadFile = File(...)
):
    try:
        # 1. Validar que el usuario existe
        select_user_query = "SELECT Id_Usuario FROM usuario WHERE Id_Usuario = %s"
        cursor.execute(select_user_query, (id_usuario,))
        user_exists = cursor.fetchone()
        
        if not user_exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # 2. Verificar que no existe ya un carnet para este usuario
        select_carnet_query = "SELECT Id_Carnet FROM carnet WHERE Fk_Id_Usuario = %s"
        cursor.execute(select_carnet_query, (id_usuario,))
        carnet_exists = cursor.fetchone()
        
        if carnet_exists:
            raise HTTPException(status_code=400, detail="El usuario ya tiene un carnet asignado")

        # 3. Calcular fecha de expiración (+3 años)
        fecha_expiracion = date.today() + relativedelta(years=3)

        # 4. Generar imagen QR y código QR
        codigo_qr = generar_codigo_qr(id_usuario)
        
        # 5. Validar el archivo de imagen
        if not imagen.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
        
        # 6. Guardar imagen subida
        Foto = f"foto_{id_usuario}.png"
        ruta_guardado = f"C:\\Users\\mauri\\OneDrive\\Escritorio\\Proyecto\\FotoUser/{Foto}"
        
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(ruta_guardado), exist_ok=True)
        
        with open(ruta_guardado, "wb") as f:
            f.write(imagen.file.read())

        # 7. Insertar en base de datos
        insert_query = """
        INSERT INTO carnet (Fk_Id_Usuario, Ficha, Fecha_Expiracion, Foto, CodigoQR)
        VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            id_usuario,
            ficha,  # Ahora usa el valor dinámico
            fecha_expiracion,
            Foto,
            codigo_qr
        )

        cursor.execute(insert_query, values)
        mydb.commit()

        return {
            "message": "Carnet creado exitosamente",
            "data": {
                "id_usuario": id_usuario,
                "ficha": ficha,
                "fecha_expiracion": fecha_expiracion.isoformat(),
                "foto": Foto,
                "codigo_qr": codigo_qr
            }
        }

    except mysql.connector.Error as err:
        mydb.rollback()  # Rollback en caso de error
        raise HTTPException(status_code=500, detail=f"Error del servidor: {err}")
    except Exception as e:
        # Eliminar imagen si fue creada pero falló la inserción
        if 'ruta_guardado' in locals() and os.path.exists(ruta_guardado):
            os.remove(ruta_guardado)
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")
    
@carnetRouter.delete("/eliminar-carnet/{id_usuario}", status_code=status.HTTP_200_OK)
def eliminar_carnet(id_usuario: int):
    try:
        # Verificar si existe el carnet
        select_query = "SELECT Id_Carnet, Foto, CodigoQR FROM carnet WHERE Fk_Id_Usuario = %s"
        cursor.execute(select_query, (id_usuario,))
        carnet = cursor.fetchone()

        if not carnet:
            raise HTTPException(status_code=404, detail="Carnet no encontrado")

        id_carnet, nombre_foto, nombre_qr = carnet

        # Eliminar el registro
        delete_query = "DELETE FROM carnet WHERE Fk_Id_Usuario = %s"
        cursor.execute(delete_query, (id_usuario,))
        mydb.commit()

        # Eliminar archivos
        ruta_foto = f"C:\\Users\\mauri\\OneDrive\\Escritorio\\Proyecto\\FotoUser\\{nombre_foto}"
        ruta_qr = f"C:\\Users\\mauri\\OneDrive\\Escritorio\\Proyecto\\Qr\\{nombre_qr}"

        if os.path.exists(ruta_foto):
            os.remove(ruta_foto)
        if os.path.exists(ruta_qr):
            os.remove(ruta_qr)

        # Reasignar AUTO_INCREMENT al menor ID libre
        cursor.execute("SELECT MAX(Id_Carnet) FROM carnet")
        max_id = cursor.fetchone()[0]
        nuevo_auto_increment = 1 if not max_id else max_id + 1
        cursor.execute(f"ALTER TABLE carnet AUTO_INCREMENT = {nuevo_auto_increment}")
        mydb.commit()

        return {"message": f"Carnet del usuario {id_usuario} eliminado correctamente. Siguiente ID disponible: {nuevo_auto_increment}"}

    except mysql.connector.Error as err:
        mydb.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar el carnet: {err}")
