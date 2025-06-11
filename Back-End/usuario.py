from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, status, HTTPException , Query
import hashlib 
from conexion import cursor, mydb
from datetime import datetime
import mysql.connector

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
        return {"message": f"Usuario con ID {Id_Usuario} eliminado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar el usuario: {err}")
