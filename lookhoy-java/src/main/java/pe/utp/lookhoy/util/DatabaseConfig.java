package pe.utp.lookhoy.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Conexión SQLite y creación del esquema. */
public final class DatabaseConfig {
    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);
    private final String url;

    public DatabaseConfig(String url) { this.url = url; }

    public static DatabaseConfig defaultFile() { return new DatabaseConfig("jdbc:sqlite:lookhoy.db"); }

    public Connection open() throws SQLException { return DriverManager.getConnection(url); }

    public void initSchema() {
        try (Connection c = open(); Statement st = c.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS users("
                + "id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, "
                + "email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, salt TEXT NOT NULL)");
            st.execute("CREATE TABLE IF NOT EXISTS garments("
                + "id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), "
                + "name TEXT NOT NULL, category TEXT NOT NULL, style TEXT NOT NULL, "
                + "warmth INTEGER NOT NULL CHECK (warmth BETWEEN 1 AND 3), favorite INTEGER NOT NULL DEFAULT 0)");
            log.info("Esquema de base de datos listo");
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo iniciar la base de datos", e);
        }
    }
}
