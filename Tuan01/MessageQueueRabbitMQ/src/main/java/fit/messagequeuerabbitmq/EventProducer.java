package fit.messagequeuerabbitmq;

import fit.messagequeuerabbitmq.dto.DemoEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendEvent(DemoEvent event) {
        rabbitTemplate.convertAndSend(
                "demo.exchange",
                "demo.routing",
                event
        );
    }
}
