package pe.utp.lookhoy.service;

/** Error de autenticación o registro con mensaje apto para mostrar al usuario. */
public class AuthException extends RuntimeException {
    public AuthException(String message) { super(message); }
}
