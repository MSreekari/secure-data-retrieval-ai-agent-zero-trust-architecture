import sqlite3
import os

# Database file path (always in project root)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "secure_ai.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

def initialize_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales_cleaned (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        total_amount REAL,
        region TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS revenue (
        month TEXT PRIMARY KEY,
        revenue REAL
    )
    """)

    # Insert sample data
    cursor.execute("INSERT OR IGNORE INTO sales_cleaned VALUES (1, 101, 5000, 'South')")
    cursor.execute("INSERT OR IGNORE INTO employees VALUES (1, 'Ravi', 'HR', 60000)")
    cursor.execute("INSERT OR IGNORE INTO revenue VALUES ('Jan', 100000)")

    conn.commit()
    conn.close()