import { PaymentCreatedEvent, Publisher, Subjects } from "@senya-micros-tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}