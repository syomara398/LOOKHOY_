package pe.utp.lookhoy.dao;

import java.util.List;
import java.util.Optional;
import pe.utp.lookhoy.model.Garment;

/** Contrato de acceso a datos de prendas. Todas las consultas se filtran por usuario. */
public interface GarmentDao {
    Garment save(Garment garment);
    List<Garment> findByUser(long userId);
    Optional<Garment> findById(long userId, long garmentId);
    boolean delete(long userId, long garmentId);
    void update(Garment garment);
}
