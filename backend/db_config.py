import psycopg2

def get_db_connection():
    conn = psycopg2.connect(
        dbname="taxi_project",
        user="chiwang",
        password="1234",
        host="localhost",
        port="5432"
    )
    return conn
