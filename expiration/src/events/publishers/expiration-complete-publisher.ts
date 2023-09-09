import { Publisher, ExpirationCompleteEvent, Subjects } from "@senya-micros-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}