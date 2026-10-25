package pe.utp.lookhoy.dao;

import java.util.Optional;
import pe.utp.lookhoy.model.User;

/** Contrato de acceso a datos de usuarios (DIP: los servicios dependen de esta interfaz). */
public interface UserDao {
    User save(User user);
    Optional<User> findByEmail(String email);
}
