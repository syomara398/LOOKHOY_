package pe.utp.lookhoy.dao;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import pe.utp.lookhoy.model.Category;
import pe.utp.lookhoy.model.Garment;
import pe.utp.lookhoy.model.Style;
import pe.utp.lookhoy.model.User;
import pe.utp.lookhoy.util.DatabaseConfig;

/** Prueba de integración de los DAO JDBC contra una base SQLite temporal. */
class SqliteDaoIntegrationTest {
    private SqliteUserDao users;
    private SqliteGarmentDao garments;

    @BeforeEach void setUp(@TempDir Path dir) {
        DatabaseConfig db = new DatabaseConfig("jdbc:sqlite:" + dir.resolve("test.db"));
        db.initSchema();
        users = new SqliteUserDao(db);
        garments = new SqliteGarmentDao(db);
    }

    @Test void guardaYBuscaUsuarioPorCorreo() {
        User saved = users.save(new User(0, "Ana", "Ana@UTP.edu.pe", "hash", "salt"));
        assertTrue(saved.id() > 0);
        assertEquals("Ana", users.findByEmail("ana@utp.edu.pe").orElseThrow().name());
    }

    @Test void correoDuplicadoLanzaError() {
        users.save(new User(0, "Ana", "ana@utp.edu.pe", "h", "s"));
        assertThrows(IllegalStateException.class, () -> users.save(new User(0, "Otra", "ana@utp.edu.pe", "h", "s")));
    }

    @Test void inyeccionSqlEnCorreoNoDevuelveUsuarios() {
        users.save(new User(0, "Ana", "ana@utp.edu.pe", "h", "s"));
        assertTrue(users.findByEmail("' OR '1'='1").isEmpty());
    }

    @Test void crudDePrendasAisladoPorUsuario() {
        long u1 = users.save(new User(0, "A", "a@utp.edu.pe", "h", "s")).id();
        long u2 = users.save(new User(0, "B", "b@utp.edu.pe", "h", "s")).id();
        Garment g = garments.save(new Garment(0, u1, "Polo", Category.ARRIBA, Style.CASUAL, 1, false));

        assertEquals(1, garments.findByUser(u1).size());
        assertTrue(garments.findByUser(u2).isEmpty());
        assertTrue(garments.findById(u2, g.id()).isEmpty());

        garments.update(g.withFavorite(true));
        assertTrue(garments.findById(u1, g.id()).orElseThrow().favorite());

        assertFalse(garments.delete(u2, g.id()));
        assertTrue(garments.delete(u1, g.id()));
    }
}
