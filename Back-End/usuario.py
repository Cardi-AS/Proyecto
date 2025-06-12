from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Request, status, HTTPException , Query
import hashlib 
from conexion import cursor, mydb
from datetime import datetime
import mysql.connector
from typing import Optional
import requests

userRouter = APIRouter()

class CarnetUsuario(BaseModel):
    Id_Usuario: int
    Nombre: str
    Apellido: str
    Rol: str
    Tipo_Identificacion: str
    Numero_Identificacion: int
    RH: str
    ficha: int
    Fecha_Expiracion: datetime
    foto: str
    CodigoQR: str

class UsuarioGet(BaseModel):
    Id_Usuario: int
    Nombre: str
    Apellido: str
    Rol : str
    
class UsuarioCrear(BaseModel):
    Nombre: str
    Apellido: str
    Correo: EmailStr
    Contraseña: str
    TipoIdentificacion: str
    NumeroIdentificacion: str
    Rol: str
    Edad: int
    RH: str

@userRouter.get("/users/{Id_Usuario}", status_code=status.HTTP_200_OK)
def get_user_by_id(Id_Usuario: int):
    select_query = "SELECT * FROM usuario WHERE Id_Usuario = %s"
    cursor.execute(select_query, (Id_Usuario,))
    result = cursor.fetchall()
    if result:
        return result
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
@userRouter.post("/login", status_code=status.HTTP_200_OK)
def validate_information(correo: str = Query(...), contrasena: str = Query(...)):
      # Hashear la contraseña
    hashed_password = hashlib.sha256(contrasena.encode()).hexdigest()
    
    select_query = """
    select u.Id_Usuario, u.Nombre, u.Apellido, u.Rol, u.Tipo_Identificacion, u.Numero_Identificacion, u.RH, c.ficha, c.Fecha_Expiracion, c.foto, c.CodigoQR
    FROM usuario u inner join carnet c on (u.Id_usuario = Fk_Id_Usuario) 
    WHERE u.correo = %s AND u.contraseña = %s
    """
    values = (correo, hashed_password)
    
    try:
        cursor.execute(select_query, values)
        result = cursor.fetchone()
        
        if result:
            
            usuario = CarnetUsuario(
                Id_Usuario=result[0],
                Nombre=result[1],
                Apellido=result[2],
                Rol=result[3],
                Tipo_Identificacion = result[4],
                Numero_Identificacion = result[5],
                RH = result[6],
                ficha = result[7],
                Fecha_Expiracion = result[8],
                foto = result[9],
                CodigoQR = result[10],
            )

            # Obtener la IP
            ip = request.client.host

             # Obtener geolocalización usando un servicio externo
            try:
                response = requests.get(f"https://ipinfo.io/{ip}/json", timeout=3)
                if response.status_code == 200:
                    geo_data = response.json()
                    geolocalizacion = f"{geo_data.get('city', '')}, {geo_data.get('region', '')}, {geo_data.get('country', '')}"
                else:
                    geolocalizacion = "No disponible"
            except Exception:
                geolocalizacion = "No disponible"

            # Insertar en la tabla inicioSesionAplicacion
            insert_query = """
            INSERT INTO inicioSesionAplicacion 
            (fk_Id_usuario, fecha_inicio_sesion, ip_dispositivo, geolocalizacion)
            VALUES (%s, %s, %s, %s)
            """
            insert_values = (
                usuario.Id_Usuario,
                datetime.now(),
                ip,
                geolocalizacion
            )
            cursor.execute(insert_query, insert_values)
            mydb.commit()

            print(usuario)
           
            return usuario
        else:
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error del servidor: {err}")
    
@userRouter.post("/crear", status_code=status.HTTP_201_CREATED)
def crear_usuario(usuario: UsuarioCrear):
     # Hashear la contraseña
    hashed_password = hashlib.sha256(usuario.Contraseña.encode()).hexdigest()

    insert_query = """
    INSERT INTO usuario 
    (Nombre, Apellido, Correo, Contraseña, Tipo_Identificacion, Numero_Identificacion, Rol, Edad, RH)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    # Si el Id_Usuario es auto-incremental, no necesitas pasarlo aquí
    values = (usuario.Nombre, usuario.Apellido, usuario.Correo, hashed_password, usuario.TipoIdentificacion, usuario.NumeroIdentificacion, usuario.Rol, usuario.Edad, usuario.RH)

            
    try:
        cursor.execute(insert_query, values)
        mydb.commit()
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=f"Error al crear el usuario: {err}")

    return {"message": "Usuario creado correctamente"}

@userRouter.delete("/eliminar/{Id_Usuario}", status_code=status.HTTP_200_OK)
def eliminar_usuario(Id_Usuario: int):
    # Primero, verifica si el usuario existe
    select_query = "SELECT * FROM usuario WHERE Id_Usuario = %s"
    cursor.execute(select_query, (Id_Usuario,))
    usuario = cursor.fetchone()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Si existe, procede a eliminarlo
    delete_query = "DELETE FROM usuario WHERE Id_Usuario = %s"
    try:
        cursor.execute(delete_query, (Id_Usuario,))
        mydb.commit()

        # Obtener el nuevo valor para AUTO_INCREMENT
        cursor.execute("SELECT MAX(Id_Usuario) FROM usuario")
        max_id = cursor.fetchone()[0]
        nuevo_auto_increment = 1 if not max_id else max_id + 1

        # Establecer el nuevo valor de AUTO_INCREMENT
        cursor.execute(f"ALTER TABLE usuario AUTO_INCREMENT = {nuevo_auto_increment}")
        mydb.commit()

        return {
            "message": f"Usuario con ID {Id_Usuario} eliminado correctamente. Siguiente ID disponible: {nuevo_auto_increment}"
        }

    except mysql.connector.Error as err:
        mydb.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar el usuario: {err}")




# Reemplaza el endpoint /usuario/{Id_Usuario} existente con esta versión corregida:

@userRouter.get("/usuario/{Id_Usuario}", status_code=status.HTTP_200_OK)
def obtener_usuario_para_editar(Id_Usuario: int):
    # Agregar logging para debug
    print(f"Buscando usuario con ID: {Id_Usuario}")
    
    select_query = """
    SELECT Id_Usuario, Nombre, Apellido, Correo, Tipo_Identificacion, 
           Numero_Identificacion, Rol, Edad, RH 
    FROM usuario WHERE Id_Usuario = %s
    """
    
    try:
        cursor.execute(select_query, (Id_Usuario,))
        result = cursor.fetchone()
        
        print(f"Resultado de la consulta: {result}")
        
        if result:
            usuario_data = {
                "Id_Usuario": result[0],
                "Nombre": result[1],
                "Apellido": result[2],
                "Correo": result[3],
                "TipoIdentificacion": result[4],  # Nota: cambié el nombre aquí
                "NumeroIdentificacion": result[5],  # Nota: cambié el nombre aquí
                "Rol": result[6],
                "Edad": result[7],
                "RH": result[8]
            }
            print(f"Datos del usuario encontrado: {usuario_data}")
            return usuario_data
        else:
            print(f"No se encontró usuario con ID: {Id_Usuario}")
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
    except mysql.connector.Error as err:
        print(f"Error de MySQL: {err}")
        raise HTTPException(status_code=500, detail=f"Error del servidor: {err}")
    except Exception as e:
        print(f"Error general: {e}")
        raise HTTPException(status_code=500, detail=f"Error inesperado: {e}")


# También vamos a crear un endpoint alternativo para listar todos los usuarios disponibles
@userRouter.get("/usuarios/lista", status_code=status.HTTP_200_OK)
def listar_usuarios_disponibles():
    """Endpoint para obtener una lista simple de usuarios con ID y nombres"""
    select_query = """
    SELECT Id_Usuario, Nombre, Apellido, Rol 
    FROM usuario 
    ORDER BY Id_Usuario ASC
    """
    
    try:
        cursor.execute(select_query)
        results = cursor.fetchall()
        
        usuarios = []
        for row in results:
            usuario = {
                "Id_Usuario": row[0],
                "Nombre": row[1],
                "Apellido": row[2],
                "Rol": row[3]
            }
            usuarios.append(usuario)
            
        return {
            "usuarios": usuarios,
            "total": len(usuarios)
        }
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error del servidor: {err}")
    

# Modelo corregido
class UsuarioActualizar(BaseModel):
    Nombre: Optional[str]
    Apellido: Optional[str]
    Correo: Optional[EmailStr]
    Contraseña: Optional[str]  # Agregado para manejar actualización de contraseña
    TipoIdentificacion: Optional[str]
    NumeroIdentificacion: Optional[str]  # ✅ Corregido el typo
    Rol: Optional[str]
    Edad: Optional[int]
    RH: Optional[str]

@userRouter.put("/actualizar/{Id_Usuario}", status_code=status.HTTP_200_OK)
def actualizar_usuario(Id_Usuario: int, datos: UsuarioActualizar):
    
    # Verificar si el usuario existe
    cursor.execute("SELECT * FROM usuario WHERE Id_Usuario = %s", (Id_Usuario,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Preparar campos dinámicamente
    campos = []
    valores = []

    if datos.Nombre is not None and datos.Nombre.strip() != "":
        campos.append("Nombre = %s")
        valores.append(datos.Nombre.strip())
    
    if datos.Apellido is not None and datos.Apellido.strip() != "":
        campos.append("Apellido = %s")
        valores.append(datos.Apellido.strip())
    
    if datos.Correo is not None and datos.Correo.strip() != "":
        campos.append("Correo = %s")
        valores.append(datos.Correo.strip())
    
    if datos.Contraseña is not None and datos.Contraseña.strip() != "":
        # Hashear la nueva contraseña
        hashed_password = hashlib.sha256(datos.Contraseña.encode()).hexdigest()
        campos.append("Contraseña = %s")
        valores.append(hashed_password)
    
    if datos.TipoIdentificacion is not None and datos.TipoIdentificacion.strip() != "":
        campos.append("Tipo_Identificacion = %s")
        valores.append(datos.TipoIdentificacion.strip())
    
    if datos.NumeroIdentificacion is not None and datos.NumeroIdentificacion.strip() != "":
        campos.append("Numero_Identificacion = %s")  # ✅ Corregido
        valores.append(datos.NumeroIdentificacion.strip())
    
    if datos.Rol is not None and datos.Rol.strip() != "":
        campos.append("Rol = %s")
        valores.append(datos.Rol.strip())
    
    if datos.Edad is not None:
        campos.append("Edad = %s")
        valores.append(datos.Edad)
    
    if datos.RH is not None and datos.RH.strip() != "":
        campos.append("RH = %s")
        valores.append(datos.RH.strip())

    if not campos:
        raise HTTPException(status_code=400, detail="No se enviaron datos válidos para actualizar")

    update_query = f"UPDATE usuario SET {', '.join(campos)} WHERE Id_Usuario = %s"
    valores.append(Id_Usuario)

    try:
        cursor.execute(update_query, tuple(valores))
        mydb.commit()
        
        # Obtener los datos actualizados del usuario
        cursor.execute("""
            SELECT Id_Usuario, Nombre, Apellido, Correo, Tipo_Identificacion, 
                   Numero_Identificacion, Rol, Edad, RH 
            FROM usuario WHERE Id_Usuario = %s
        """, (Id_Usuario,))
        usuario_actualizado = cursor.fetchone()
        
        if usuario_actualizado:
            usuario_data = {
                "Id_Usuario": usuario_actualizado[0],
                "Nombre": usuario_actualizado[1],
                "Apellido": usuario_actualizado[2],
                "Correo": usuario_actualizado[3],
                "TipoIdentificacion": usuario_actualizado[4],
                "NumeroIdentificacion": usuario_actualizado[5],
                "Rol": usuario_actualizado[6],
                "Edad": usuario_actualizado[7],
                "RH": usuario_actualizado[8]
            }
            
            return {
                "message": f"Usuario {Id_Usuario} actualizado correctamente",
                "usuario": usuario_data
            }
        else:
            return {"message": f"Usuario {Id_Usuario} actualizado correctamente"}
            
    except mysql.connector.Error as err:
        mydb.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar usuario: {err}")