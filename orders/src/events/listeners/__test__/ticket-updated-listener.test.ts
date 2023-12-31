import { TicketUpdatedEvent } from "@senya-micros-tickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Types, set } from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    id: new Types.ObjectId().toString()
  });

  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'concertaaa',
    price: 100,
    userId: new Types.ObjectId().toString()
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, ticket, msg };
}

it('finds, updates, and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('wont call ack if the event has a skipped version number', async () => {
  const { listener, data, msg, ticket } = await setup();

  data.version = 100;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {

  }

  expect(msg.ack).not.toHaveBeenCalled();
});