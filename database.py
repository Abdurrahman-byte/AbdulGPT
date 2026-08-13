import sqlite3

DATABASE = "abdulgpt.db"

def create_database():
    
    with sqlite3.connect(DATABASE) as connection:
        cursor = connection.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL DEFAULT 'default',
            user_message TEXT,
            ai_response TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
        connection.commit()

def save_chat(user_message, ai_response, session_id="default"):
    
    with sqlite3.connect(DATABASE) as connection:
        cursor = connection.cursor()
        cursor.execute("""
        INSERT INTO chat_history (session_id, user_message, ai_response)
        VALUES (?, ?, ?)
        """, (session_id, user_message, ai_response))
        connection.commit()

def get_chat_history(session_id="default"):
    
    with sqlite3.connect(DATABASE) as connection:
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()
        cursor.execute("""
        SELECT 
            id,
            user_message,
            ai_response,
            timestamp
        FROM chat_history
        WHERE session_id = ?
        ORDER BY id ASC
        """, (session_id,))
        return [dict(row) for row in cursor.fetchall()]

def get_all_sessions():
    
    with sqlite3.connect(DATABASE) as connection:
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()
        cursor.execute("""
        SELECT session_id, user_message, MIN(timestamp) as created_at
        FROM chat_history
        GROUP BY session_id
        ORDER BY created_at DESC
        """)
        return [dict(row) for row in cursor.fetchall()]

def clear_session_history(session_id="default"):

    with sqlite3.connect(DATABASE) as connection:
        cursor = connection.cursor()
        if session_id:
            cursor.execute("DELETE FROM chat_history WHERE session_id = ?", (session_id,))
        else:
            cursor.execute("DELETE FROM chat_history")
        connection.commit()

def delete_chat(chat_id, session_id="default"):

    with sqlite3.connect(DATABASE) as connection:
        cursor = connection.cursor()

        cursor.execute("""
        DELETE FROM chat_history
        WHERE id = ? AND session_id = ?
        """) (chat_id, session_id)

        connection.commit()        