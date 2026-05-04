import java.io.OutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class TestAuth {
    public static void main(String[] args) {
        try {
            URL url = new URL("http://localhost:8081/springsecurity/auth/register");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            
            String json = "{\"fullName\":\"khairi\",\"email\":\"khairi100@gmail.com\",\"password\":\"oussamaboukhris\",\"role\":\"PHARMACIST\",\"phone\":\"28501319\",\"birthDate\":\"2001-06-14\",\"pharmacyName\":\"ddddddd\",\"pharmacyAddress\":\"16 rue sakiet sidi youssef\",\"pharmacyPhone\":\"97618786\",\"pharmacyEmail\":\"oussama.boukhris55@gmail.com\"}";
            
            try (OutputStream os = conn.getOutputStream()) {
                os.write(json.getBytes("UTF-8"));
            }
            
            int status = conn.getResponseCode();
            InputStream is = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
            if (is != null) {
                byte[] bytes = is.readAllBytes();
                System.out.println("RESPONSE_BODY: " + new String(bytes, "UTF-8"));
            } else {
                System.out.println("RESPONSE_BODY: null");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
