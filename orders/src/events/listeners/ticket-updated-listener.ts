import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent, TicketUpdatedEvent, NotFoundError } from "@senya-micros-tickets/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName; // queue group makes sure that our event goes only to one copy of subscribers (if we have 2+ Orders Services)

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
    const { title, price, version } = data;
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new NotFoundError();
    }

    // now instead of using the plugin, we are saving the version ourselves; this is all we had to do
    ticket.set({ title, price, version });
    await ticket.save();

    msg.ack();
  }
}