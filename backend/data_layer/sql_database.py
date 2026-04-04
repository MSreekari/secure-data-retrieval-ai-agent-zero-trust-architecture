import sqlite3
import os

# Database file path (always in project root)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "secure_ai.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

def initialize_db():
    conn = get_connection()
    cursor = conn.cursor()

    # --- BUSINESS DATA TABLES ---
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

    # --- SECURITY/IDENTITY TABLE ---
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL  -- e.g., 'Analyst', 'HR', 'Admin'
    )
    """)

    # --- SEED DATA ---
    # Insert Sample Business Data
    cursor.execute("INSERT OR IGNORE INTO sales_cleaned VALUES (1, 101, 5000, 'South')")
    cursor.execute("INSERT OR IGNORE INTO employees VALUES (1, 'Ravi', 'HR', 60000)")
    cursor.execute("INSERT OR IGNORE INTO revenue VALUES ('Jan', 100000)")

    # Insert Sample User Data
    users = [
        ('abcd', 'pass123', 'Analyst'),
        ('hr_manager', 'hrpass', 'HR'),
        ('admin_user', 'admin123', 'Admin')
    ]
    
    for user in users:
        cursor.execute("INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)", user)

    conn.commit()
    conn.close()

# --- DATA RETRIEVAL FUNCTIONS ---

def get_user_by_username(username):
    """
    Fetches a human user's security profile from the database.
    Used by the Identity Provider to verify the 'Human Key'.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # FIXED: Corrected 'userrame' to 'username'
        cursor.execute("SELECT username, password_hash, role FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if user:
            return {
                "username": user[0], 
                "password": user[1], 
                "role": user[2]
            }
        return None
    except Exception as e:
        print(f"Database Error in get_user_by_username: {e}")
        return None
    finally:
        conn.close()

def get_table(table_name):
    """
    Fetches business data requested by the AI Agents.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        return cursor.fetchall()
    except sqlite3.Error as e:
        print(f"DB Error fetching {table_name}:", e)
        return []
    finally:
        conn.close()

# Initialize the DB if this script is run directly
if __name__ == "__main__":
    initialize_db()
    print("Database Initialized Securely.")