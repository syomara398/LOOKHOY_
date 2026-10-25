package pe.utp.lookhoy.service;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.utp.lookhoy.dao.UserDao;
import pe.utp.lookhoy.model.User;
import pe.utp.lookhoy.security.InputValidator;
import pe.utp.lookhoy.security.PasswordHasher;

/** Registro e inicio de sesión. Responsabilidad única: identidad del usuario. */
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserDao users;

    public AuthService(UserDao users) { this.users = users; }

    public User register(String name, String email, String password) {
        if (StringUtils.isBlank(name) || name.strip().length() > 60) throw new AuthException("Ingresa un nombre válido.");
        if (!InputValidator.isValidEmail(email)) throw new AuthException("El correo no es válido.");
        if (!InputValidator.isStrongPassword(password))
            throw new AuthException("La contraseña debe tener 8 o más caracteres, con letras y números.");
        String salt = PasswordHasher.newSalt();
        User toSave = new User(0, name.strip(), email.strip(), PasswordHasher.hash(password, salt), salt);
        try {
            User saved = users.save(toSave);
            log.info("Usuario registrado id={}", saved.id());   // nunca se registra la contraseña
            return saved;
        } catch (IllegalStateException e) {
            throw new AuthException(e.getMessage());
        }
    }

    public User login(String email, String password) {
        // Mensaje genérico: no revela si el correo existe.
        AuthException invalid = new AuthException("Correo o contraseña incorrectos.");
        if (StringUtils.isBlank(email) || password == null) throw invalid;
        User u = users.findByEmail(email.strip()).orElseThrow(() -> invalid);
        if (!PasswordHasher.matches(password, u.salt(), u.passwordHash())) {
            log.warn("Intento de inicio de sesión fallido id={}", u.id());
            throw invalid;
        }
        log.info("Inicio de sesión id={}", u.id());
        return u;
    }
}
