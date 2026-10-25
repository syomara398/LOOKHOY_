package pe.utp.lookhoy.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class InputValidatorTest {
    @Test void correos() {
        assertTrue(InputValidator.isValidEmail("ana@utp.edu.pe"));
        assertFalse(InputValidator.isValidEmail("ana@"));
        assertFalse(InputValidator.isValidEmail(" "));
        assertFalse(InputValidator.isValidEmail(null));
    }

    @Test void contrasenas() {
        assertTrue(InputValidator.isStrongPassword("abcdef12"));
        assertFalse(InputValidator.isStrongPassword("abcdefgh"));
        assertFalse(InputValidator.isStrongPassword("12345678"));
        assertFalse(InputValidator.isStrongPassword("a1"));
    }

    @Test void ciudades() {
        assertTrue(InputValidator.isValidCity("Ica"));
        assertTrue(InputValidator.isValidCity("Lima, Perú"));
        assertFalse(InputValidator.isValidCity("Ica; DROP TABLE users"));
        assertFalse(InputValidator.isValidCity("<script>"));
    }
}
