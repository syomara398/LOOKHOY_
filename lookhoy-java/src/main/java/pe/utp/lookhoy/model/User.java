package pe.utp.lookhoy.model;

/** Usuario registrado. Nunca guarda la contraseña en claro: solo hash y sal. */
public record User(long id, String name, String email, String passwordHash, String salt) {
    public User withId(long newId) { return new User(newId, name, email, passwordHash, salt); }
}
