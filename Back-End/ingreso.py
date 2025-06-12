from pydantic import BaseModel
from conexion import cursor, mydb
from fastapi import APIRouter, status, HTTPException
from datetime import datetime
import mysql.connector

ingressRouter = APIRouter()

class Ingreso(BaseModel):
    Id_ingreso: int
    FechaEntrada: str
    FechaSalida: str
    

class IngresoSede(BaseModel):
    Fk_Id_Carnet: int
    Fk_Id_Sede: int


@ingressRouter.post("/ingreso-sede", status_code=status.HTTP_201_CREATED)
def registrar_ingreso(data: IngresoSede):
    try:
        # Verificar que el carnet existe
        check_carnet_query = "SELECT Id_Carnet FROM carnet WHERE Id_Carnet = %s"
        cursor.execute(check_carnet_query, (data.Fk_Id_Carnet,))
        carnet_exists = cursor.fetchone()
        
        if not carnet_exists:
            raise HTTPException(
                status_code=400, 
                detail=f"El carnet con ID {data.Fk_Id_Carnet} no existe en la base de datos"
            )
        
        # Verificar que la sede existe
        check_sede_query = "SELECT Id_Sede FROM sede WHERE Id_Sede = %s"
        cursor.execute(check_sede_query, (data.Fk_Id_Sede,))
        sede_exists = cursor.fetchone()
        
        if not sede_exists:
            raise HTTPException(
                status_code=400, 
                detail=f"La sede con ID {data.Fk_Id_Sede} no existe en la base de datos"
            )

        fecha_entrada = datetime.now()

        # Asegúrate de usar el nombre correcto de la tabla
        insert_query = """
        INSERT INTO ingresosedes (FechaEntrada, Fk_Id_Carnet, Fk_Id_Sede)
        VALUES (%s, %s, %s)
        """
        values = (fecha_entrada, data.Fk_Id_Carnet, data.Fk_Id_Sede)

        cursor.execute(insert_query, values)
        mydb.commit()

        return {"message": "Ingreso registrado exitosamente"}

    except mysql.connector.Error as err:
        mydb.rollback()  # Rollback en caso de error
        raise HTTPException(status_code=500, detail=f"Error al registrar el ingreso: {err}")
    except Exception as e:
        mydb.rollback()
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")


# Función auxiliar para buscar carnet por código QR
@ingressRouter.get("/carnet-by-qr/{qr_code}")
def get_carnet_by_qr(qr_code: str):
    try:
        # Buscar el carnet por código QR
        query = "SELECT Id_Carnet FROM carnet WHERE CodigoQR = %s OR NumeroCarnet = %s"
        cursor.execute(query, (qr_code, qr_code))
        result = cursor.fetchone()
        
        if result:
            return {"Id_Carnet": result[0]}
        else:
            raise HTTPException(
                status_code=404, 
                detail=f"No se encontró carnet con código QR: {qr_code}"
            )
            
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar carnet: {err}")
    
    
    
