import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@senya-micros-tickets/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName; // queue group makes sure that our event goes only to one copy of subscribers (if we have 2+ Orders Services)

  async onMessage(data: TicketCreatedEvent['data'], msg: Message): Promise<void> {
    const { title, price, id } = data;
    const ticket = Ticket.build({
      title, price, id
    });

    await ticket.save();

    msg.ack();
  }
}