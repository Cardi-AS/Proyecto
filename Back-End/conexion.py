import mysql.connector



mydb = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="",
    database="db_cardi"
)


cursor = mydb.cursor()

