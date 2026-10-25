package pe.utp.lookhoy.service;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import pe.utp.lookhoy.model.Garment;

/** Exporta el clóset a Excel (.xlsx) con Apache POI. */
public class ClosetExcelExporter {
    private static final String[] HEADERS = {"N°", "Prenda", "Categoría", "Estilo", "Abrigo", "Favorito"};
    private static final String[] WARMTH = {"", "Fresco", "Templado", "Abrigado"};

    public void export(List<Garment> garments, OutputStream out) throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Clóset");
            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle head = wb.createCellStyle();
            head.setFont(bold);

            Row h = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell c = h.createCell(i);
                c.setCellValue(HEADERS[i]);
                c.setCellStyle(head);
            }
            int r = 1;
            for (Garment g : garments) {
                Row row = sheet.createRow(r);
                row.createCell(0).setCellValue(r);
                row.createCell(1).setCellValue(sanitize(g.name()));
                row.createCell(2).setCellValue(g.category().label());
                row.createCell(3).setCellValue(g.style().label());
                row.createCell(4).setCellValue(WARMTH[g.warmth()]);
                row.createCell(5).setCellValue(g.favorite() ? "Sí" : "No");
                r++;
            }
            for (int i = 0; i < HEADERS.length; i++) sheet.autoSizeColumn(i);
            wb.write(out);
        }
    }

    /** Seguridad: evita inyección de fórmulas en Excel (valores que empiezan con = + - @). */
    static String sanitize(String s) {
        return !s.isEmpty() && "=+-@".indexOf(s.charAt(0)) >= 0 ? "'" + s : s;
    }
}
