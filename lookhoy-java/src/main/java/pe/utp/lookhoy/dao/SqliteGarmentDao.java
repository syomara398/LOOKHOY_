package pe.utp.lookhoy.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import pe.utp.lookhoy.model.Category;
import pe.utp.lookhoy.model.Garment;
import pe.utp.lookhoy.model.Style;
import pe.utp.lookhoy.util.DatabaseConfig;

/** DAO JDBC de prendas. Seguridad: PreparedStatement y filtro por user_id en toda consulta. */
public class SqliteGarmentDao implements GarmentDao {
    private static final String COLS = "id,user_id,name,category,style,warmth,favorite";
    private final DatabaseConfig db;

    public SqliteGarmentDao(DatabaseConfig db) { this.db = db; }

    @Override public Garment save(Garment g) {
        String sql = "INSERT INTO garments(user_id,name,category,style,warmth,favorite) VALUES(?,?,?,?,?,?)";
        try (Connection c = db.open(); PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, g.userId());
            ps.setString(2, g.name());
            ps.setString(3, g.category().name());
            ps.setString(4, g.style().name());
            ps.setInt(5, g.warmth());
            ps.setInt(6, g.favorite() ? 1 : 0);
            ps.executeUpdate();
            try (ResultSet k = ps.getGeneratedKeys()) {
                return k.next() ? g.withId(k.getLong(1)) : g;
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo guardar la prenda", e);
        }
    }

    @Override public List<Garment> findByUser(long userId) {
        String sql = "SELECT " + COLS + " FROM garments WHERE user_id = ? ORDER BY id";
        List<Garment> out = new ArrayList<>();
        try (Connection c = db.open(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) out.add(map(rs));
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo listar el clóset", e);
        }
        return out;
    }

    @Override public Optional<Garment> findById(long userId, long garmentId) {
        String sql = "SELECT " + COLS + " FROM garments WHERE id = ? AND user_id = ?";
        try (Connection c = db.open(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, garmentId);
            ps.setLong(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo consultar la prenda", e);
        }
    }

    @Override public boolean delete(long userId, long garmentId) {
        try (Connection c = db.open(); PreparedStatement ps = c.prepareStatement("DELETE FROM garments WHERE id = ? AND user_id = ?")) {
            ps.setLong(1, garmentId);
            ps.setLong(2, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo eliminar la prenda", e);
        }
    }

    @Override public void update(Garment g) {
        String sql = "UPDATE garments SET name=?,category=?,style=?,warmth=?,favorite=? WHERE id=? AND user_id=?";
        try (Connection c = db.open(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, g.name());
            ps.setString(2, g.category().name());
            ps.setString(3, g.style().name());
            ps.setInt(4, g.warmth());
            ps.setInt(5, g.favorite() ? 1 : 0);
            ps.setLong(6, g.id());
            ps.setLong(7, g.userId());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo actualizar la prenda", e);
        }
    }

    private static Garment map(ResultSet rs) throws SQLException {
        return new Garment(rs.getLong("id"), rs.getLong("user_id"), rs.getString("name"),
                Category.valueOf(rs.getString("category")), Style.valueOf(rs.getString("style")),
                rs.getInt("warmth"), rs.getInt("favorite") == 1);
    }
}
