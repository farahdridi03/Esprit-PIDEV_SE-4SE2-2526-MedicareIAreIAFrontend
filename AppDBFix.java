import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class AppDBFix {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/demospringsecurity?serverTimezone=UTC";
        try (Connection con = DriverManager.getConnection(url, "root", "")) {
            Statement stmt = con.createStatement();
            
            String[] queries = {
                "ALTER TABLE users MODIFY COLUMN license_number VARCHAR(255) NULL",
                "ALTER TABLE users MODIFY COLUMN pharmacy_setup_completed BIT NULL",
                "ALTER TABLE users MODIFY COLUMN status VARCHAR(255) NULL",
                "ALTER TABLE users MODIFY COLUMN diploma_document TEXT NULL"
            };
            for(String q : queries) {
                try {
                    stmt.executeUpdate(q);
                    System.out.println("Executed: " + q);
                } catch (Exception e) {
                    System.out.println("Skipped: " + q + " due to " + e.getMessage());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
