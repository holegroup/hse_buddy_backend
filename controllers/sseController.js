const Notification = require('../models/notification.model');
let clients = [];

async function eventsHandler(req, res) {   //message
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add the new client connection to the list
    console.log("New client connected!");
    clients.push(res);
    const { email } = req.query;

    console.log(`New client connected: ${email}`);

    // Store the response with the associated email
    clients.push({ email, res });

    // send any pending notification to the client
    try {
        const missedNotification = await Notification.find({ email, sent: false });
        for(const notif of missedNotification){ 
            res.write(`data: ${JSON.stringify({ message: notif.message })}\n\n`);
            notif.sent = true; 
            await notif.save(); 
            await Notification.findByIdAndDelete(notif._id);
        }

    } catch (e) {
        colnsole.log(e.message);
    }

    // Remove the client when they disconnect
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
}

async function sendEvent({ message, email }, __, res) {   //send
    // const { message, email } = req.body;

    if (!message) {
        return;
    }

    console.log(message, email);

    // Send the message to all connected clients
    // clients.forEach(client => {
    //     client.write(`data: ${JSON.stringify({ message })}\n\n`);
    // });
    const client = clients.find(client => client.email === email);
    if (client) {
        client.res.write(`data: ${JSON.stringify({ message })}\n\n`);
        console.log(`Notification sent to ${email}`);
        // return res.status(200).json({ success: true, message: "Message sent to clients" });
    }
    else {
        try {
            await Notification.create({ email, message, sent: false });
            console.log(`Client is Not Connected, Notification saved for ${email} in DB`);
        } catch (e) {
            console.log(e.message);
        }
    }
}

module.exports = { eventsHandler, sendEvent } 