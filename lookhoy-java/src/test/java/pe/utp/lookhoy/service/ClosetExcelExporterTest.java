package pe.utp.lookhoy.service;

import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import pe.utp.lookhoy.model.Category;
import pe.utp.lookhoy.model.Garment;
import pe.utp.lookhoy.model.Style;

class ClosetExcelExporterTest {
    @Test void exportaEncabezadoYFilas() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        new ClosetExcelExporter().export(List.of(new Garment(1, 1, "Polo", Category.ARRIBA, Style.CASUAL, 1, true)), out);
        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(out.toByteArray()))) {
            Sheet s = wb.getSheetAt(0);
            assertEquals("Prenda", s.getRow(0).getCell(1).getStringCellValue());
            assertEquals("Polo", s.getRow(1).getCell(1).getStringCellValue());
            assertEquals("Sí", s.getRow(1).getCell(5).getStringCellValue());
        }
    }

    @Test void neutralizaInyeccionDeFormulas() {
        assertEquals("'=CMD()", ClosetExcelExporter.sanitize("=CMD()"));
        assertEquals("Polo", ClosetExcelExporter.sanitize("Polo"));
    }
}
