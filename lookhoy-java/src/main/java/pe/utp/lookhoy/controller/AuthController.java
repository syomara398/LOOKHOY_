package pe.utp.lookhoy.controller;

import pe.utp.lookhoy.model.User;
import pe.utp.lookhoy.service.AuthService;

/** Intermediario entre las vistas de acceso y AuthService. */
public class AuthController {
    private final AuthService auth;
    private final SessionContext session;

    public AuthController(AuthService auth, SessionContext session) {
        this.auth = auth;
        this.session = session;
    }

    public User login(String email, String password) {
        User u = auth.login(email, password);
        session.start(u);
        return u;
    }

    public User register(String name, String email, String password) {
        User u = auth.register(name, email, password);
        session.start(u);
        return u;
    }

    public void logout() { session.end(); }
}
