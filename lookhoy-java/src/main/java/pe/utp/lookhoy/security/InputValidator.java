package pe.utp.lookhoy.security;

import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;

/** Validación de entradas del usuario en la frontera de la aplicación. */
public final class InputValidator {
    private static final Pattern EMAIL = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern CITY = Pattern.compile("^[\\p{L} .,'-]{2,60}$");

    private InputValidator() { }

    public static boolean isValidEmail(String email) {
        return StringUtils.isNotBlank(email) && email.strip().length() <= 120 && EMAIL.matcher(email.strip()).matches();
    }

    /** Entre 8 y 72 caracteres, con al menos una letra y un número. */
    public static boolean isStrongPassword(String pw) {
        return pw != null && pw.length() >= 8 && pw.length() <= 72
                && pw.chars().anyMatch(Character::isLetter) && pw.chars().anyMatch(Character::isDigit);
    }

    public static boolean isValidCity(String city) {
        return city != null && CITY.matcher(city.strip()).matches();
    }
}
