import { Message } from "node-nats-streaming";
import { Subjects, Listener, ExpirationCompleteEvent, NotFoundError, OrderStatus, PaymentCreatedEvent } from "@senya-micros-tickets/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName; // queue group makes sure that our event goes only to one copy of subscribers (if we have 2+ Orders Services)

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Complete });

    await order.save();
    
    msg.ack();
  }
}