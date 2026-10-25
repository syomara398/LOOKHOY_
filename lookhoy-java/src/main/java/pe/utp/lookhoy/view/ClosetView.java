package pe.utp.lookhoy.view;

import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;
import pe.utp.lookhoy.controller.ClosetController;
import pe.utp.lookhoy.model.Category;
import pe.utp.lookhoy.model.Garment;
import pe.utp.lookhoy.model.Style;

/** Pantalla "Mi clóset": alta, favoritos, eliminación y exportación a Excel. */
public class ClosetView extends JPanel {
    private static final String[] WARMTH = {"Fresco", "Templado", "Abrigado"};
    private final ClosetController controller;
    private final DefaultTableModel model = new DefaultTableModel(
            new Object[]{"ID", "Prenda", "Categoría", "Estilo", "Abrigo", "Favorito"}, 0) {
        @Override public boolean isCellEditable(int r, int c) { return false; }
    };
    private final JTable table = new JTable(model);

    public ClosetView(ClosetController controller) {
        this.controller = controller;
        setLayout(new BorderLayout(8, 8));
        add(new JScrollPane(table), BorderLayout.CENTER);

        JTextField name = new JTextField(14);
        JComboBox<Category> cat = new JComboBox<>(Category.values());
        JComboBox<Style> style = new JComboBox<>(Style.values());
        JComboBox<String> warmth = new JComboBox<>(WARMTH);
        JButton add = new JButton("Agregar");
        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        top.add(name); top.add(cat); top.add(style); top.add(warmth); top.add(add);
        add(top, BorderLayout.NORTH);

        JButton fav = new JButton("Favorito");
        JButton del = new JButton("Eliminar");
        JButton xls = new JButton("Exportar a Excel");
        JPanel bottom = new JPanel(new FlowLayout(FlowLayout.LEFT));
        bottom.add(fav); bottom.add(del); bottom.add(xls);
        add(bottom, BorderLayout.SOUTH);

        add.addActionListener(e -> {
            try {
                controller.add(name.getText(), (Category) cat.getSelectedItem(),
                        (Style) style.getSelectedItem(), warmth.getSelectedIndex() + 1);
                name.setText("");
                refresh();
            } catch (IllegalArgumentException | NullPointerException ex) {
                JOptionPane.showMessageDialog(this, ex.getMessage(), "Prenda no válida", JOptionPane.WARNING_MESSAGE);
            }
        });
        fav.addActionListener(e -> selectedId(id -> { controller.toggleFavorite(id); refresh(); }));
        del.addActionListener(e -> selectedId(id -> {
            if (JOptionPane.showConfirmDialog(this, "¿Eliminar la prenda?", "LookHoy", JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION) {
                controller.remove(id);
                refresh();
            }
        }));
        xls.addActionListener(e -> export());
    }

    public void refresh() {
        model.setRowCount(0);
        for (Garment g : controller.list())
            model.addRow(new Object[]{g.id(), g.name(), g.category(), g.style(), WARMTH[g.warmth() - 1], g.favorite() ? "★" : ""});
    }

    private void selectedId(java.util.function.LongConsumer action) {
        int row = table.getSelectedRow();
        if (row < 0) {
            JOptionPane.showMessageDialog(this, "Selecciona una prenda primero.");
            return;
        }
        action.accept((Long) model.getValueAt(row, 0));
    }

    private void export() {
        JFileChooser fc = new JFileChooser();
        fc.setSelectedFile(new File("closet-lookhoy.xlsx"));
        if (fc.showSaveDialog(this) != JFileChooser.APPROVE_OPTION) return;
        try (FileOutputStream out = new FileOutputStream(fc.getSelectedFile())) {
            controller.exportExcel(out);
            JOptionPane.showMessageDialog(this, "Clóset exportado correctamente.");
        } catch (IOException ex) {
            JOptionPane.showMessageDialog(this, "No se pudo guardar el archivo.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
