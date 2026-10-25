package pe.utp.lookhoy.controller;

import java.util.Optional;
import pe.utp.lookhoy.model.User;

/** Sesión en memoria del usuario autenticado. */
public class SessionContext {
    private User current;

    public void start(User user) { this.current = user; }
    public void end() { this.current = null; }
    public Optional<User> user() { return Optional.ofNullable(current); }
    public long requireUserId() {
        return user().orElseThrow(() -> new IllegalStateException("No hay sesión activa")).id();
    }
}
