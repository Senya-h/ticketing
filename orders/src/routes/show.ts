import { NotAuthorizedError, NotFoundError, requireAuth } from '@senya-micros-tickets/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
const router = express.Router();

router.get(
  '/api/orders/:orderId', // we can also add validation that its a real mongo id
  requireAuth,
  async (req: Request, res: Response) => {

  const order = await Order.findById(req.params.orderId).populate('ticket');
  if (!order) {
    throw new NotFoundError();;
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  res.send(order);
});

export { router as showOrderRouter };