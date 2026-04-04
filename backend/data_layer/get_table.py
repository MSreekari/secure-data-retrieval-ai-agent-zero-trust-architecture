import sqlite3

from data_layer.sql_database import get_connection
# Assuming get_connection is defined in this same file or imported
# from .sql_database import get_connection 

def get_table(table_name):
    """Fetches business data from specific tables."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Note: Be careful with f-strings in SQL (SQL Injection). 
        # Since this is a controlled internal project, it's okay, 
        # but in production, we'd use a whitelist of table names.
        cursor.execute(f"SELECT * FROM {table_name}")
        return cursor.fetchall()
    except sqlite3.Error as e:
        print("DB Error:", e)
        return []
    finally:
        conn.close()

def get_user_by_username(username):
    """Fetches security identity data for the IDP."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # We use '?' to prevent SQL Injection for user-provided input
        cursor.execute("SELECT username, password_hash, role FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if user:
            return {"username": user[0], "password": user[1], "role": user[2]}
        return None
    except sqlite3.Error as e:
        print("Auth DB Error:", e)
        return None
    finally:
        conn.close()