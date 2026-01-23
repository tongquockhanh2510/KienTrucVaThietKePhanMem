package fit.messagequeuerabbitmq.controller;

import fit.messagequeuerabbitmq.dto.request.LoginRequest;
import fit.messagequeuerabbitmq.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;


import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtService jwtService;

    public AuthController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @PostMapping("/token")
    public Map<String, String> login(@RequestBody LoginRequest request) {
        if (!"admin".equals(request.getUsername())
                || !"admin".equals(request.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
            );
        }

        String token = jwtService.generateToken(request.getUsername());

        return Map.of("accessToken", token);
    }
}
