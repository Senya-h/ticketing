import { OrderCreatedEvent, OrderStatus } from "@senya-micros-tickets/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Types, set } from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'asdf'
  });
  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: new Types.ObjectId().toString(),
    expiresAt: new Date().toISOString(),
    status: OrderStatus.Created,
    userId: 'asdf',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    version: 0
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { msg, data, ticket, listener };
}

it('sets orderId of the ticket', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(data.id).toEqual(ticketUpdatedData.orderId);
})