package fit.performancetest.controller;




import fit.performancetest.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestController {

    private final UserService userService;

    public TestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/nocache")
    public String noCache(@RequestParam String id) {
        long start = System.currentTimeMillis();

        String result = userService.getUserNoCache(id);

        long time = System.currentTimeMillis() - start;
        return result + " | Time: " + time + " ms";
    }
    
    @GetMapping("/cache")
    public String withCache(@RequestParam String id) {
        long start = System.currentTimeMillis();

        String result = userService.getUserWithCache(id);

        long time = System.currentTimeMillis() - start;
        return result + " | Time: " + time + " ms";
    }
}
