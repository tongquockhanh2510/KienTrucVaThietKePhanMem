package fit.messagequeuerabbitmq.controller;

import fit.messagequeuerabbitmq.EventProducer;
import fit.messagequeuerabbitmq.dto.DemoEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DemoController {

    private final EventProducer producer;

    @PostMapping("/secure/publish")
    public String publish(@AuthenticationPrincipal Jwt jwt) {
        DemoEvent event = new DemoEvent(
                "Hello RabbitMQ",
                jwt.getSubject()
        );

        producer.sendEvent(event);
        return "Event sent!";
    }
}