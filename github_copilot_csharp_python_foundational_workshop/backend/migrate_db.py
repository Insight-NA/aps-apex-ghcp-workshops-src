"""
Migration script to add new columns to existing trips table
"""
import sqlite3
import os

def migrate_database():
    db_path = os.path.join(os.path.dirname(__file__), 'trips.db')
    
    if not os.path.exists(db_path):
        print("No database found. Will be created with new schema.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if columns already exist
    cursor.execute("PRAGMA table_info(trips)")
    columns = [col[1] for col in cursor.fetchall()]
    
    migrations = []
    
    if 'is_public' not in columns:
        migrations.append("ALTER TABLE trips ADD COLUMN is_public BOOLEAN DEFAULT 0")
    
    if 'is_featured' not in columns:
        migrations.append("ALTER TABLE trips ADD COLUMN is_featured BOOLEAN DEFAULT 0")
    
    if 'created_at' not in columns:
        migrations.append("ALTER TABLE trips ADD COLUMN created_at DATETIME")
    
    if 'description' not in columns:
        migrations.append("ALTER TABLE trips ADD COLUMN description TEXT")
    
    if 'image_url' not in columns:
        migrations.append("ALTER TABLE trips ADD COLUMN image_url TEXT")
    
    if 'distance_miles' not in columns:
        migrations.append("ALTER TABLE trips ADD COLUMN distance_miles INTEGER")
    
    if migrations:
        print(f"Running {len(migrations)} migrations...")
        for migration in migrations:
            print(f"  - {migration}")
            cursor.execute(migration)
        conn.commit()
        print("Migrations completed successfully!")
    else:
        print("Database is up to date. No migrations needed.")
    
    conn.close()

if __name__ == "__main__":
    migrate_database()
