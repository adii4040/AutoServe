import { Agenda } from '@hokify/agenda';

import { logger } from '../Utils/logger.js';

let agendaInstance = null;

export const getAgenda = () => {
    if (!agendaInstance) {
        agendaInstance = new Agenda({
            db: {
                address: process.env.MONGODB_URI,
                collection: 'agendaJobs',
            },
            processEvery: '10 seconds',
        });
    }
    return agendaInstance;
};

export const startAgenda = async () => {
    const agenda = getAgenda();
    await agenda.start();
    await agenda.every("1 minute", "retry-payment-webhook");
    await agenda.every("30 minutes", "mark-stale-payments-failed");
    logger.info('Agenda job scheduler started');
    return agenda;
};
