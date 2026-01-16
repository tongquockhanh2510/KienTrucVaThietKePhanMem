package fit.service2.service;

import fit.service2.dto.DemoEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class EventConsumer {

    @RabbitListener(queues = "demo.queue")
    public void consume(DemoEvent event) {
        System.out.println("=== RECEIVED EVENT ===");
        System.out.println("Message: " + event.getMessage());
        System.out.println("Created by: " + event.getCreatedBy());
    }
}
