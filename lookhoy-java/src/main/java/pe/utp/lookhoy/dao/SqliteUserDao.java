package pe.utp.lookhoy.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Optional;
import pe.utp.lookhoy.model.User;
import pe.utp.lookhoy.util.DatabaseConfig;

/** DAO JDBC. Seguridad: solo PreparedStatement (previene inyección SQL). */
public class SqliteUserDao implements UserDao {
    private final DatabaseConfig db;

    public SqliteUserDao(DatabaseConfig db) { this.db = db; }

    @Override public User save(User u) {
        String sql = "INSERT INTO users(name,email,password_hash,salt) VALUES(?,?,?,?)";
        try (Connection c = db.open(); PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, u.name());
            ps.setString(2, u.email().toLowerCase());
            ps.setString(3, u.passwordHash());
            ps.setString(4, u.salt());
            ps.executeUpdate();
            try (ResultSet k = ps.getGeneratedKeys()) {
                return k.next() ? u.withId(k.getLong(1)) : u;
            }
        } catch (SQLException e) {
            if (e.getMessage() != null && e.getMessage().contains("UNIQUE"))
                throw new IllegalStateException("El correo ya está registrado", e);
            throw new IllegalStateException("No se pudo guardar el usuario", e);
        }
    }

    @Override public Optional<User> findByEmail(String email) {
        String sql = "SELECT id,name,email,password_hash,salt FROM users WHERE email = ?";
        try (Connection c = db.open(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, email.toLowerCase());
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return Optional.empty();
                return Optional.of(new User(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5)));
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo consultar el usuario", e);
        }
    }
}
