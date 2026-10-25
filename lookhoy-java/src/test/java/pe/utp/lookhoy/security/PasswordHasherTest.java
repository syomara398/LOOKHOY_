package pe.utp.lookhoy.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class PasswordHasherTest {
    @Test void mismaClaveYSalGeneranMismoHash() {
        String salt = PasswordHasher.newSalt();
        assertEquals(PasswordHasher.hash("Clave1234", salt), PasswordHasher.hash("Clave1234", salt));
    }

    @Test void salesDistintasGeneranHashesDistintos() {
        assertNotEquals(PasswordHasher.hash("Clave1234", PasswordHasher.newSalt()),
                PasswordHasher.hash("Clave1234", PasswordHasher.newSalt()));
    }

    @Test void matchesAceptaCorrectaYRechazaIncorrecta() {
        String salt = PasswordHasher.newSalt();
        String h = PasswordHasher.hash("Clave1234", salt);
        assertTrue(PasswordHasher.matches("Clave1234", salt, h));
        assertFalse(PasswordHasher.matches("clave1234", salt, h));
    }

    @Test void elHashNoContieneLaClaveEnClaro() {
        assertFalse(PasswordHasher.hash("Clave1234", PasswordHasher.newSalt()).contains("Clave1234"));
    }
}
