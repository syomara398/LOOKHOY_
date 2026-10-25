package pe.utp.lookhoy.controller;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import pe.utp.lookhoy.model.Category;
import pe.utp.lookhoy.model.Garment;
import pe.utp.lookhoy.model.Style;
import pe.utp.lookhoy.service.ClosetExcelExporter;
import pe.utp.lookhoy.service.ClosetService;

/** Controlador del clóset: la vista nunca habla con el DAO. */
public class ClosetController {
    private final ClosetService service;
    private final ClosetExcelExporter exporter;
    private final SessionContext session;

    public ClosetController(ClosetService service, ClosetExcelExporter exporter, SessionContext session) {
        this.service = service;
        this.exporter = exporter;
        this.session = session;
    }

    public List<Garment> list() { return service.list(session.requireUserId()); }

    public Garment add(String name, Category category, Style style, int warmth) {
        return service.add(session.requireUserId(), name, category, style, warmth);
    }

    public void toggleFavorite(long garmentId) { service.toggleFavorite(session.requireUserId(), garmentId); }
    public boolean remove(long garmentId) { return service.remove(session.requireUserId(), garmentId); }

    public void exportExcel(OutputStream out) throws IOException { exporter.export(list(), out); }
}
