package pe.utp.lookhoy.view;

import java.awt.BorderLayout;
import java.awt.GridLayout;
import java.util.function.Consumer;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import pe.utp.lookhoy.controller.AuthController;
import pe.utp.lookhoy.service.AuthException;

/** Pantalla de inicio de sesión y registro. */
public class LoginView extends JPanel {
    private final JTextField name = new JTextField();
    private final JTextField email = new JTextField();
    private final JPasswordField password = new JPasswordField();
    private final JLabel nameLabel = new JLabel("Nombre");
    private boolean registerMode;

    public LoginView(AuthController controller, Runnable onSuccess) {
        setLayout(new BorderLayout(0, 12));
        setBorder(BorderFactory.createEmptyBorder(40, 120, 40, 120));
        JLabel title = new JLabel("LookHoy — Vestirte bien empieza con lo que ya tienes", JLabel.CENTER);
        title.setFont(title.getFont().deriveFont(18f));
        add(title, BorderLayout.NORTH);

        JPanel form = new JPanel(new GridLayout(0, 1, 0, 6));
        form.add(nameLabel); form.add(name);
        form.add(new JLabel("Correo")); form.add(email);
        form.add(new JLabel("Contraseña")); form.add(password);
        JButton submit = new JButton("Iniciar sesión");
        JButton toggle = new JButton("¿No tienes cuenta? Regístrate");
        form.add(submit); form.add(toggle);
        add(form, BorderLayout.CENTER);
        setRegisterMode(false);

        toggle.addActionListener(e -> {
            setRegisterMode(!registerMode);
            submit.setText(registerMode ? "Crear cuenta" : "Iniciar sesión");
            toggle.setText(registerMode ? "Ya tengo cuenta" : "¿No tienes cuenta? Regístrate");
        });
        submit.addActionListener(e -> {
            char[] pw = password.getPassword();
            try {
                String pass = new String(pw);
                if (registerMode) controller.register(name.getText(), email.getText(), pass);
                else controller.login(email.getText(), pass);
                password.setText("");
                onSuccess.run();
            } catch (AuthException ex) {
                JOptionPane.showMessageDialog(this, ex.getMessage(), "LookHoy", JOptionPane.WARNING_MESSAGE);
            } finally {
                java.util.Arrays.fill(pw, '\0');   // seguridad: no dejar la contraseña en memoria
            }
        });
    }

    private void setRegisterMode(boolean on) {
        registerMode = on;
        name.setVisible(on);
        nameLabel.setVisible(on);
        revalidate();
    }
}
