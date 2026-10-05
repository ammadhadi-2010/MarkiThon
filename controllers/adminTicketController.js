const { listTickets, findTicket, createReport, updateTicket, bulkTickets } = require('../utils/adminTickets');

exports.tickets = (req, res) => {
    res.status(200).json({ tickets: listTickets() });
};

exports.ticketOne = (req, res) => {
    const row = findTicket(req.params.id);
    if (!row) return res.status(404).json({ message: 'Ticket not found.' });
    res.status(200).json({ ticket: row });
};

exports.createTicket = (req, res) => {
    const row = createReport(req.body || {});
    if (!row) return res.status(400).json({ message: 'Enter the name, subject, and message.' });
    res.status(201).json({ message: 'Ticket added.', ticket: row });
};

exports.updateTicket = (req, res) => {
    const row = updateTicket(req.params.id, req.body || {});
    if (row && row.missing) return res.status(404).json({ message: 'Ticket not found.' });
    if (!row) return res.status(400).json({ message: 'Choose a valid status.' });
    res.status(200).json({ message: 'Ticket updated.', ticket: row });
};

exports.bulkTickets = (req, res) => {
    const rows = bulkTickets(req.body || {});
    if (!rows) return res.status(400).json({ message: 'Choose tickets and an action.' });
    res.status(200).json({ message: 'Tickets updated.', tickets: rows });
};
