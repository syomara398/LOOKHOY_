package pe.utp.lookhoy.view;

import java.awt.BorderLayout;
import java.awt.FlowLayout;
import javax.swing.DefaultListModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingWorker;
import pe.utp.lookhoy.controller.OutfitController;
import pe.utp.lookhoy.model.Garment;
import pe.utp.lookhoy.model.Suggestion;
import pe.utp.lookhoy.model.WeatherInfo;
import pe.utp.lookhoy.service.WeatherException;

/** Pantalla "Mi outfit de hoy": clima por ciudad, ocasión y sugerencia. */
public class OutfitView extends JPanel {
    private final OutfitController controller;
    private final JTextField city = new JTextField("Ica", 12);
    private final JComboBox<String> occasion = new JComboBox<>(new String[]{"Feria", "Instituto", "Cita"});
    private final JLabel weatherLabel = new JLabel("Sin datos del clima");
    private final DefaultListModel<String> pieces = new DefaultListModel<>();
    private final JTextArea notes = new JTextArea(4, 40);
    private WeatherInfo weather;
    private int variant;

    public OutfitView(OutfitController controller) {
        this.controller = controller;
        setLayout(new BorderLayout(8, 8));
        occasion.setEditable(true);

        JButton load = new JButton("Ver clima");
        JButton suggest = new JButton("Sugerir outfit");
        JButton another = new JButton("Otra sugerencia");
        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        top.add(new JLabel("Ciudad:")); top.add(city); top.add(load);
        top.add(new JLabel("Ocasión:")); top.add(occasion); top.add(suggest); top.add(another);

        JPanel north = new JPanel(new BorderLayout());
        north.add(top, BorderLayout.NORTH);
        north.add(weatherLabel, BorderLayout.SOUTH);
        add(north, BorderLayout.NORTH);
        add(new JScrollPane(new JList<>(pieces)), BorderLayout.CENTER);
        notes.setEditable(false);
        notes.setLineWrap(true);
        notes.setWrapStyleWord(true);
        add(new JScrollPane(notes), BorderLayout.SOUTH);

        load.addActionListener(e -> loadWeather());
        suggest.addActionListener(e -> { variant = 0; render(); });
        another.addActionListener(e -> { variant++; render(); });
    }

    /** La consulta de red va en segundo plano para no congelar la interfaz. */
    private void loadWeather() {
        weatherLabel.setText("Consultando clima…");
        new SwingWorker<WeatherInfo, Void>() {
            @Override protected WeatherInfo doInBackground() throws WeatherException {
                return controller.weatherFor(city.getText());
            }
            @Override protected void done() {
                try {
                    weather = get();
                    weatherLabel.setText(weather.city() + ", " + weather.country() + " — " + weather.tempC()
                            + " °C (sensación " + weather.feelsC() + " °C), " + weather.description()
                            + ", lluvia " + weather.rainProb() + "%");
                } catch (java.util.concurrent.ExecutionException ex) {
                    weather = null;
                    weatherLabel.setText("Sin datos del clima");
                    JOptionPane.showMessageDialog(OutfitView.this, ex.getCause().getMessage(), "Clima", JOptionPane.WARNING_MESSAGE);
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                }
            }
        }.execute();
    }

    private void render() {
        Object sel = occasion.getSelectedItem();
        String occ = sel == null || sel.toString().isBlank() ? "Feria" : sel.toString().strip();
        Suggestion s = controller.suggest(occ, weather, variant);
        pieces.clear();
        for (Garment g : s.pieces()) pieces.addElement(g.category() + ": " + g.name());
        if (s.pieces().isEmpty()) pieces.addElement("Agrega prendas a tu clóset para recibir sugerencias.");
        notes.setText(s.title() + " (" + s.combos() + " combinaciones)\n" + String.join("\n", s.notes()));
    }
}
