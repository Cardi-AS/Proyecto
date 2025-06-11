from fastapi import FastAPI
import hashlib
from usuario import userRouter
from carnet import carnetRouter
from ingreso import ingressRouter
from salida import salidaRouter

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(userRouter)
app.include_router(carnetRouter)
app.include_router(ingressRouter)
app.include_router(salidaRouter)