def lookup(db, name):
    return db.execute("SELECT secret FROM users WHERE name = ?", (name,)).fetchall()
