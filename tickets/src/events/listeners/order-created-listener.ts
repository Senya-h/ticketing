import { Message } from "node-nats-streaming";
import { Subjects, Listener, OrderCreatedEvent, NotFoundError } from "@senya-micros-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName; // queue group makes sure that our event goes only to one copy of subscribers (if we have 2+ Orders Services)

  async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    ticket.set({ orderId: data.id });
    await ticket.save();

    // we want to await to make sure all events go throuh ok before acking
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId
    })

    msg.ack();
  }
}