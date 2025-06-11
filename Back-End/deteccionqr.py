import cv2
import requests
import time

# Instancia del detector QR
qrCode = cv2.QRCodeDetector()
cap = cv2.VideoCapture(0)

# URL base de tu API
BASE_URL = "http://localhost:8000"  # Cambia si es necesario
ID_SEDE = 1  # Sede asignada

if not cap.isOpened():
    print("No se puede abrir la cámara")
    exit()

ultimo_qr_leido = None
tiempo_ultimo_escaneo = 0

while True:
    ret, frame = cap.read()

    if ret:
        ret_qr, decoded_info, points, _ = qrCode.detectAndDecodeMulti(frame)

        if ret_qr and points is not None:
            for info, point in zip(decoded_info, points):
                if info:
                    color = (0, 255, 0)
                    frame = cv2.polylines(frame, [point.astype(int)], True, color, 4)

                    if info != ultimo_qr_leido or time.time() - tiempo_ultimo_escaneo > 3:
                        print(f"QR Detectado: {info}")
                        ultimo_qr_leido = info
                        tiempo_ultimo_escaneo = time.time()

                        if info.startswith("CARNET-"):
                            try:
                                fk_id_usuario = int(info.replace("CARNET-", ""))

                                # Obtener el Id_Carnet desde el Fk_Id_Usuario
                                carnet_response = requests.get(f"{BASE_URL}/carnet/{fk_id_usuario}")
                                if carnet_response.status_code != 200:
                                    print(f"❌ No se encontró carnet para el usuario {fk_id_usuario}")
                                    continue

                                datos_carnet = carnet_response.json()
                                if not datos_carnet:
                                    print(f"❌ El usuario {fk_id_usuario} no tiene carnet registrado")
                                    continue

                                id_carnet = datos_carnet[0][0]  # Primer campo: Id_Carnet

                                # Intentar registrar salida
                                response = requests.patch(f"{BASE_URL}/salida-sede/{id_carnet}")
                                resultado = response.json()

                                if resultado.get("status") == "salida_registrada":
                                    print("✅ Salida registrada:", resultado)
                                elif resultado.get("status") == "no_active_ingreso":
                                    # Registrar ingreso
                                    payload = {
                                        "Fk_Id_Carnet": id_carnet,
                                        "Fk_Id_Sede": ID_SEDE
                                    }
                                    ingreso_response = requests.post(f"{BASE_URL}/ingreso-sede", json=payload)
                                    if ingreso_response.status_code == 201:
                                        print("✅ Ingreso registrado:", ingreso_response.json())
                                    else:
                                        print("❌ Error al registrar ingreso:", ingreso_response.text)
                                else:
                                    print("❌ Respuesta inesperada:", resultado)

                            except Exception as e:
                                print("❌ Error procesando el QR:", e)
                        else:
                            print("⚠️ QR no válido")
                else:
                    color = (0, 0, 255)
                    frame = cv2.polylines(frame, [point.astype(int)], True, color, 4)

    else:
        print("No se puede recibir el fotograma. Saliendo...")
        break

    cv2.imshow('Detector de códigos QR - CardiAS', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
