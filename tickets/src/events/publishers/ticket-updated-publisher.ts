import { Publisher, Subjects, TicketUpdatedEvent } from "@senya-micros-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}