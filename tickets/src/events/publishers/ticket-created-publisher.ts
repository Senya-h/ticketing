import { Publisher, Subjects, TicketCreatedEvent } from "@senya-micros-tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}