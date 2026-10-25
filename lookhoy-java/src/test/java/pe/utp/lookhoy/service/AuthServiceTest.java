package pe.utp.lookhoy.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pe.utp.lookhoy.dao.InMemoryUserDao;
import pe.utp.lookhoy.model.User;

class AuthServiceTest {
    private AuthService auth;

    @BeforeEach void setUp() { auth = new AuthService(new InMemoryUserDao()); }

    @Test void registraYGuardaHashNoLaClave() {
        User u = auth.register("Ana", "ana@utp.edu.pe", "Clave1234");
        assertTrue(u.id() > 0);
        assertNotEquals("Clave1234", u.passwordHash());
    }

    @Test void rechazaClaveDebil() {
        assertThrows(AuthException.class, () -> auth.register("Ana", "ana@utp.edu.pe", "123"));
    }

    @Test void rechazaCorreoDuplicado() {
        auth.register("Ana", "ana@utp.edu.pe", "Clave1234");
        assertThrows(AuthException.class, () -> auth.register("Otra", "ANA@utp.edu.pe", "Clave1234"));
    }

    @Test void loginCorrecto() {
        auth.register("Ana", "ana@utp.edu.pe", "Clave1234");
        assertEquals("Ana", auth.login("ana@utp.edu.pe", "Clave1234").name());
    }

    @Test void loginFallidoNoRevelaSiElCorreoExiste() {
        auth.register("Ana", "ana@utp.edu.pe", "Clave1234");
        AuthException a = assertThrows(AuthException.class, () -> auth.login("ana@utp.edu.pe", "Mala12345"));
        AuthException b = assertThrows(AuthException.class, () -> auth.login("nadie@utp.edu.pe", "Clave1234"));
        assertEquals(a.getMessage(), b.getMessage());
    }
}
