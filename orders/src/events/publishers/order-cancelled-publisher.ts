import { OrderCancelledEvent, Publisher, Subjects } from "@senya-micros-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}