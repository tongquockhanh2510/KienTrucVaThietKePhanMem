package fit.performancetest.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    public String getUserNoCache(String id) {
        simulateSlowDB();
        return "User_" + id;
    }

    @Cacheable(value = "users", key = "#id")
    public String getUserWithCache(String id) {
        System.out.println(">>> CALL DB for id = " + id);
        simulateSlowDB();
        return "User_" + id;
    }

    private void simulateSlowDB() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
