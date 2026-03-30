import java.time.LocalDateTime;
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDateTime from = LocalDateTime.parse("2026-03-23T00:00:00");
        LocalDateTime to = LocalDateTime.parse("2026-03-23T23:59:59");
        int count = 0;
        
        LocalDateTime current = from;
        while (!current.isAfter(to)) {
            LocalDate date = current.toLocalDate();
            System.out.println("Processing date: " + date + ", dayOfWeek: " + date.getDayOfWeek().name());
            count++;
            current = current.plusDays(1).withHour(0).withMinute(0);
        }
        System.out.println("Ran " + count + " times");
    }
}
