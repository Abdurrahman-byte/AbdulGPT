import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash

DATABASE = "abdulgpt.db"


def get_db():
  connection = sqlite3.connect(DATABASE)
  connection.row_factory = sqlite3.Row
  return connection


def create_database():
  with get_db() as connection:
    cursor = connection.cursor()

    cursor.execute("PRAGMA foreign_keys = ON;")

    cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

    
    cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_id TEXT NOT NULL, 
                user_message TEXT,
                ai_response TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
    connection.commit()


def create_user(username, password, email=None):
  password_hash = generate_password_hash(password)
  try:
    with get_db() as connection:
      cursor = connection.cursor()
      cursor.execute(
          "INSERT INTO users (username, password_hash, email) VALUES (?, ?,"
          " ?)",
          (username, password_hash, email),
      )
      connection.commit()
      return cursor.lastrowid
  except sqlite3.IntegrityError:
    return None


def verify_user(username, password):
  with get_db() as connection:
    cursor = connection.cursor()
    cursor.execute(
        "SELECT id, username, password_hash FROM users WHERE username = ?",
        (username,),
    )
    user = cursor.fetchone()
    if user and check_password_hash(user["password_hash"], password):
      return dict(user)
    return None


def save_chat(user_id, session_id, user_message, ai_response):
  with get_db() as connection:
    cursor = connection.cursor()
    cursor.execute(
        """
        INSERT INTO chat_history (user_id, session_id, user_message, ai_response)
        VALUES (?, ?, ?, ?)
        """,
        (user_id, session_id, user_message, ai_response),
    )
    connection.commit()


def get_chat_history(user_id, session_id):
  with get_db() as connection:
    cursor = connection.cursor()
    cursor.execute(
        """
        SELECT 
            id,
            user_message,
            ai_response,
            timestamp
        FROM chat_history
        WHERE user_id = ? AND session_id = ?
        ORDER BY id ASC
        """,
        (user_id, session_id),
    )
    return [dict(row) for row in cursor.fetchall()]


def get_user_sessions(user_id):
  with get_db() as connection:
    cursor = connection.cursor()
    cursor.execute(
        """
        SELECT session_id, user_message AS title, MIN(timestamp) AS created_at
        FROM chat_history
        WHERE user_id = ?
        GROUP BY session_id
        ORDER BY created_at DESC
        """,
        (user_id,),
    )
    return [dict(row) for row in cursor.fetchall()]


def delete_entire_session(user_id, session_id):
  with get_db() as connection:
    cursor = connection.cursor()
    cursor.execute(
        """
        DELETE FROM chat_history
        WHERE user_id = ? AND session_id = ?
        """,
        (user_id, session_id),
    )
    connection.commit()


def delete_single_message(user_id, message_id):
  with get_db() as connection:
    cursor = connection.cursor()
    cursor.execute(
        """
        DELETE FROM chat_history
        WHERE user_id = ? AND id = ?
        """,
        (user_id, message_id),
    )
    connection.commit()