import sqlite3
from .sql_database import get_connection

def get_table(table_name):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        return cursor.fetchall()
    except sqlite3.Error as e:
        print("DB Error:", e)
        return []
    finally:
        conn.close()
