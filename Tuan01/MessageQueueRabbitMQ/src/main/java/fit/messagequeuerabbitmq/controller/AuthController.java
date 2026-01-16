package fit.messagequeuerabbitmq.controller;

import fit.messagequeuerabbitmq.service.JwtService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtService jwtService;

    public AuthController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @PostMapping("/token")
    public Map<String, String> token() {
        return Map.of(
                "accessToken", jwtService.generateToken()
        );
    }
}
