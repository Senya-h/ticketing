import { OrderCreatedEvent, Publisher, Subjects } from "@senya-micros-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}