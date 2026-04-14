import { getAgenda } from './agenda.js';
import { advanceDispatchBatch } from '../Services/booking.service.js';
import { logger } from '../Utils/logger.js';
import { Booking } from '../Models/Booking.model.js';

export const registerDispatchJob = () => {
    const agenda = getAgenda();

    agenda.define('advance-dispatch-batch', async (job) => {
        const { bookingId } = job.attrs.data;

        const booking = await Booking.findById(bookingId);
        if (!booking || booking.bookingState !== 'DISPATCHING') {
            logger.info('Dispatch job skipped - booking no longer dispatching', { bookingId });
            return;
        }

        await advanceDispatchBatch(bookingId);
        logger.info('Dispatch batch advanced via Agenda job', { bookingId });
    });
};
