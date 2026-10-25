package pe.utp.lookhoy.dao;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import pe.utp.lookhoy.model.User;

/** Implementación en memoria; se usa en las pruebas unitarias (TDD). */
public class InMemoryUserDao implements UserDao {
    private final Map<String, User> byEmail = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong();

    @Override public User save(User user) {
        String key = user.email().toLowerCase();
        if (byEmail.containsKey(key)) throw new IllegalStateException("El correo ya está registrado");
        User saved = user.withId(seq.incrementAndGet());
        byEmail.put(key, saved);
        return saved;
    }

    @Override public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(byEmail.get(email.toLowerCase()));
    }
}
