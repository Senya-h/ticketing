import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get(
  '/api/tickets',
  async (req: Request, res: Response) => {
    // if orderId exists, that means the ticket is reserved
    const tickets = await Ticket.find({ orderId: null });
    res.send(tickets);
});

export { router as indexTicketRouter };