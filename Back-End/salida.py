from pydantic import BaseModel
from conexion import cursor, mydb
from fastapi import APIRouter, status, HTTPException
from datetime import datetime
import mysql.connector

salidaRouter = APIRouter()

class SalidaSede(BaseModel):
    Fk_Id_Carnet: int
    Fk_Id_Sede: int

@salidaRouter.patch("/salida-sede/{id_carnet}", status_code=status.HTTP_200_OK)
def registrar_salida(id_carnet: int):
    try:
        # Verificar que el carnet existe
        check_carnet_query = "SELECT Id_Carnet FROM carnet WHERE Id_Carnet = %s"
        cursor.execute(check_carnet_query, (id_carnet,))
        carnet_exists = cursor.fetchone()

        if not carnet_exists:
            return {
                "status": "not_found",
                "message": f"El carnet con ID {id_carnet} no existe en la base de datos"
            }

        # Buscar el ingreso activo más reciente
        buscar_ingreso_query = """
        SELECT Id_Ingreso, FechaEntrada, Fk_Id_Sede 
        FROM ingresosedes 
        WHERE Fk_Id_Carnet = %s AND FechaSalida IS NULL 
        ORDER BY FechaEntrada DESC 
        LIMIT 1
        """
        cursor.execute(buscar_ingreso_query, (id_carnet,))
        ingreso_activo = cursor.fetchone()

        if not ingreso_activo:
            return {
                "status": "no_active_ingreso",
                "message": f"No se encontró un ingreso activo para el carnet {id_carnet}. Se debe registrar ingreso."
            }

        id_ingreso, fecha_entrada, id_sede = ingreso_activo
        fecha_salida = datetime.now()

        # Actualizar la salida
        update_query = "UPDATE ingresosedes SET FechaSalida = %s WHERE Id_Ingreso = %s"
        cursor.execute(update_query, (fecha_salida, id_ingreso))
        mydb.commit()

        tiempo_permanencia = fecha_salida - fecha_entrada
        horas, remainder = divmod(tiempo_permanencia.total_seconds(), 3600)
        minutos, segundos = divmod(remainder, 60)

        return {
            "status": "salida_registrada",
            "id_carnet": id_carnet,
            "id_sede": id_sede,
            "fecha_entrada": fecha_entrada.strftime("%Y-%m-%d %H:%M:%S"),
            "fecha_salida": fecha_salida.strftime("%Y-%m-%d %H:%M:%S"),
            "tiempo_permanencia": f"{int(horas)}h {int(minutos)}m {int(segundos)}s"
        }

    except mysql.connector.Error as err:
        mydb.rollback()
        raise HTTPException(status_code=500, detail=f"Error al registrar la salida: {err}")
    except Exception as e:
        mydb.rollback()
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")


@salidaRouter.get("/ingresos-activos/{id_carnet}")
def obtener_ingresos_activos(id_carnet: int):
    """Endpoint auxiliar para verificar si un carnet tiene ingresos activos"""
    try:
        query = """
        SELECT Id_Ingreso, FechaEntrada, Fk_Id_Sede 
        FROM ingresosedes 
        WHERE Fk_Id_Carnet = %s AND FechaSalida IS NULL 
        ORDER BY FechaEntrada DESC
        """
        cursor.execute(query, (id_carnet,))
        ingresos_activos = cursor.fetchall()
        
        if not ingresos_activos:
            return {"ingresos_activos": [], "count": 0}
        
        resultado = []
        for ingreso in ingresos_activos:
            resultado.append({
                "id_ingreso": ingreso[0],
                "fecha_entrada": ingreso[1].strftime("%Y-%m-%d %H:%M:%S"),
                "id_sede": ingreso[2]
            })
        
        return {
            "ingresos_activos": resultado,
            "count": len(resultado)
        }
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar ingresos activos: {err}")


@salidaRouter.get("/historial-ingresos/{id_carnet}")
def obtener_historial_ingresos(id_carnet: int, limit: int = 10):
    """Endpoint para obtener el historial completo de ingresos de un carnet"""
    try:
        query = """
        SELECT Id_Ingreso, FechaEntrada, FechaSalida, Fk_Id_Sede 
        FROM ingresosedes 
        WHERE Fk_Id_Carnet = %s 
        ORDER BY FechaEntrada DESC 
        LIMIT %s
        """
        cursor.execute(query, (id_carnet, limit))
        historial = cursor.fetchall()
        
        resultado = []
        for registro in historial:
            item = {
                "id_ingreso": registro[0],
                "fecha_entrada": registro[1].strftime("%Y-%m-%d %H:%M:%S"),
                "fecha_salida": registro[2].strftime("%Y-%m-%d %H:%M:%S") if registro[2] else None,
                "id_sede": registro[3],
                "estado": "Completado" if registro[2] else "Activo"
            }
            
            # Calcular tiempo de permanencia si hay fecha de salida
            if registro[2]:
                tiempo_permanencia = registro[2] - registro[1]
                horas, remainder = divmod(tiempo_permanencia.total_seconds(), 3600)
                minutos, segundos = divmod(remainder, 60)
                item["tiempo_permanencia"] = f"{int(horas)}h {int(minutos)}m {int(segundos)}s"
            
            resultado.append(item)
        
        return {
            "historial": resultado,
            "total_registros": len(resultado)
        }
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar historial: {err}")
    
    
    
@salidaRouter.delete("/reset-ingresos", status_code=status.HTTP_200_OK)
def resetear_ingresos():
    try:
        # Desactivar claves foráneas y modo seguro
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        cursor.execute("SET SQL_SAFE_UPDATES = 0;")

        # Eliminar todos los registros
        cursor.execute("DELETE FROM ingresosedes WHERE Id_Ingreso > 0;")

        # Reiniciar el contador AUTO_INCREMENT
        cursor.execute("ALTER TABLE ingresosedes AUTO_INCREMENT = 1;")

        # Restaurar configuraciones
        cursor.execute("SET SQL_SAFE_UPDATES = 1;")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        mydb.commit()
        return {"message": "Tabla ingresosedes reiniciada correctamente"}

    except mysql.connector.Error as err:
        mydb.rollback()
        raise HTTPException(status_code=500, detail=f"Error al reiniciar la tabla: {err}")    