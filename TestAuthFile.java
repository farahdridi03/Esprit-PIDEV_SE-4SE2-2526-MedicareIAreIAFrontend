import java.io.OutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;

public class TestAuthFile {
    public static void main(String[] args) {
        try {
            URL url = new URL("http://localhost:8081/springsecurity/auth/register");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            
            String json = "{\"fullName\":\"khairi\",\"email\":\"khairi101@gmail.com\",\"password\":\"oussamaboukhris\",\"role\":\"PHARMACIST\",\"phone\":\"28501319\",\"birthDate\":\"2001-06-14\",\"pharmacyName\":\"ddddddd\",\"pharmacyAddress\":\"16 rue sakiet sidi youssef\",\"pharmacyPhone\":\"97618786\",\"pharmacyEmail\":\"oussama.boukhris55@gmail.com\"}";
            
            try (OutputStream os = conn.getOutputStream()) {
                os.write(json.getBytes("UTF-8"));
            }
            
            int status = conn.getResponseCode();
            InputStream is = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
            if (is != null) {
                byte[] bytes = is.readAllBytes();
                Files.write(Paths.get("output.txt"), bytes);
                System.out.println("Written to output.txt");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
