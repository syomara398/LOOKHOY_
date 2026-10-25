package pe.utp.lookhoy.view;

import java.awt.BorderLayout;
import java.awt.CardLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.JTabbedPane;
import pe.utp.lookhoy.controller.AuthController;
import pe.utp.lookhoy.controller.ClosetController;
import pe.utp.lookhoy.controller.OutfitController;

/** Ventana principal: alterna entre acceso y aplicación. */
public class MainFrame extends JFrame {
    private static final String LOGIN = "login", APP = "app";
    private final CardLayout cards = new CardLayout();
    private final JPanel root = new JPanel(cards);

    public MainFrame(AuthController auth, ClosetController closet, OutfitController outfit) {
        super("LookHoy");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(900, 560);
        setLocationRelativeTo(null);

        ClosetView closetView = new ClosetView(closet);
        JTabbedPane tabs = new JTabbedPane();
        tabs.addTab("Mi clóset", closetView);
        tabs.addTab("Outfit de hoy", new OutfitView(outfit));

        JButton logout = new JButton("Cerrar sesión");
        JPanel app = new JPanel(new BorderLayout());
        app.add(tabs, BorderLayout.CENTER);
        app.add(logout, BorderLayout.SOUTH);

        root.add(new LoginView(auth, () -> { closetView.refresh(); cards.show(root, APP); }), LOGIN);
        root.add(app, APP);
        logout.addActionListener(e -> { auth.logout(); cards.show(root, LOGIN); });
        add(root);
        cards.show(root, LOGIN);
    }
}
