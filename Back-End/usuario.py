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

class UsuarioActualizar(BaseModel):
    Nombre: str
    Apellido: str
    Correo: EmailStr
    TipoIdentificacion: str
    NumeroIdentificacion: str
    Rol: str
    Edad: int
    RH: str
    Contraseña: Optional[str] = None  # Contraseña opcional para actualización

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

@userRouter.put("/actualizar/{Id_Usuario}", status_code=status.HTTP_200_OK)
def actualizar_usuario(Id_Usuario: int, usuario: UsuarioActualizar):
    """Endpoint para actualizar un usuario existente"""
    
    # Primero verificar si el usuario existe
    select_query = "SELECT * FROM usuario WHERE Id_Usuario = %s"
    cursor.execute(select_query, (Id_Usuario,))
    usuario_existente = cursor.fetchone()
    
    if not usuario_existente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Preparar la consulta de actualización
    if usuario.Contraseña:
        # Si se proporciona contraseña, actualizarla también
        hashed_password = hashlib.sha256(usuario.Contraseña.encode()).hexdigest()
        update_query = """
        UPDATE usuario SET 
        Nombre = %s, Apellido = %s, Correo = %s, Contraseña = %s,
        Tipo_Identificacion = %s, Numero_Identificacion = %s,
        Rol = %s, Edad = %s, RH = %s
        WHERE Id_Usuario = %s
        """
        values = (
            usuario.Nombre, usuario.Apellido, usuario.Correo, hashed_password,
            usuario.TipoIdentificacion, usuario.NumeroIdentificacion,
            usuario.Rol, usuario.Edad, usuario.RH, Id_Usuario
        )
    else:
        # Si no se proporciona contraseña, no actualizarla
        update_query = """
        UPDATE usuario SET 
        Nombre = %s, Apellido = %s, Correo = %s,
        Tipo_Identificacion = %s, Numero_Identificacion = %s,
        Rol = %s, Edad = %s, RH = %s
        WHERE Id_Usuario = %s
        """
        values = (
            usuario.Nombre, usuario.Apellido, usuario.Correo,
            usuario.TipoIdentificacion, usuario.NumeroIdentificacion,
            usuario.Rol, usuario.Edad, usuario.RH, Id_Usuario
        )
    
    try:
        cursor.execute(update_query, values)
        mydb.commit()
        
        # Verificar que se actualizó correctamente
        if cursor.rowcount == 0:
            raise HTTPException(status_code=400, detail="No se pudo actualizar el usuario")
            
        return {
            "message": f"Usuario con ID {Id_Usuario} actualizado correctamente",
            "Id_Usuario": Id_Usuario
        }
        
    except mysql.connector.Error as err:
        mydb.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar el usuario: {err}")

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
                "TipoIdentificacion": result[4],
                "NumeroIdentificacion": result[5],
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

