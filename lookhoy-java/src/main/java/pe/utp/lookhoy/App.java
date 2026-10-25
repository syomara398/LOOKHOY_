package pe.utp.lookhoy;

import javax.swing.SwingUtilities;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.utp.lookhoy.controller.AuthController;
import pe.utp.lookhoy.controller.ClosetController;
import pe.utp.lookhoy.controller.OutfitController;
import pe.utp.lookhoy.controller.SessionContext;
import pe.utp.lookhoy.dao.GarmentDao;
import pe.utp.lookhoy.dao.SqliteGarmentDao;
import pe.utp.lookhoy.dao.SqliteUserDao;
import pe.utp.lookhoy.dao.UserDao;
import pe.utp.lookhoy.service.AuthService;
import pe.utp.lookhoy.service.ClosetExcelExporter;
import pe.utp.lookhoy.service.ClosetService;
import pe.utp.lookhoy.service.OccasionStyleResolver;
import pe.utp.lookhoy.service.OpenMeteoWeatherProvider;
import pe.utp.lookhoy.service.OutfitRecommender;
import pe.utp.lookhoy.util.DatabaseConfig;
import pe.utp.lookhoy.view.MainFrame;

/** Raíz de composición: aquí (y solo aquí) se eligen las implementaciones concretas. */
public final class App {
    private static final Logger log = LoggerFactory.getLogger(App.class);

    private App() { }

    public static void main(String[] args) {
        DatabaseConfig db = DatabaseConfig.defaultFile();
        db.initSchema();

        UserDao userDao = new SqliteUserDao(db);
        GarmentDao garmentDao = new SqliteGarmentDao(db);
        SessionContext session = new SessionContext();

        AuthService authService = new AuthService(userDao);
        ClosetService closetService = new ClosetService(garmentDao);
        OutfitRecommender recommender = new OutfitRecommender(new OccasionStyleResolver());

        AuthController auth = new AuthController(authService, session);
        ClosetController closet = new ClosetController(closetService, new ClosetExcelExporter(), session);
        OutfitController outfit = new OutfitController(closetService, recommender, new OpenMeteoWeatherProvider(), session);

        log.info("Iniciando LookHoy");
        SwingUtilities.invokeLater(() -> new MainFrame(auth, closet, outfit).setVisible(true));
    }
}
