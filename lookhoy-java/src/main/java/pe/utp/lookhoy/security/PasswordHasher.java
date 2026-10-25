package pe.utp.lookhoy.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Hex;

/**
 * Hash de contraseñas con PBKDF2-HMAC-SHA256 y sal aleatoria (JDK + Commons Codec para hex).
 * Seguridad: nunca se guarda la contraseña en claro; la comparación es en tiempo constante.
 */
public final class PasswordHasher {
    private static final int ITERATIONS = 120_000;
    private static final int KEY_BITS = 256;
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordHasher() { }

    public static String newSalt() {
        byte[] s = new byte[16];
        RANDOM.nextBytes(s);
        return Hex.encodeHexString(s);
    }

    public static String hash(String password, String saltHex) {
        try {
            byte[] salt = Hex.decodeHex(saltHex);
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_BITS);
            byte[] out = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
            spec.clearPassword();
            return Hex.encodeHexString(out);
        } catch (GeneralSecurityException | DecoderException e) {
            throw new IllegalStateException("No se pudo calcular el hash", e);
        }
    }

    public static boolean matches(String password, String saltHex, String expectedHash) {
        byte[] a = hash(password, saltHex).getBytes(StandardCharsets.UTF_8);
        byte[] b = expectedHash.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(a, b);
    }
}
