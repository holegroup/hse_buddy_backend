let clients = []; 

function eventsHandler(req, res){   //message
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add the new client connection to the list
    console.log("New client connected!"); 
    clients.push(res);
    const {email} = req.query; 

    console.log(`New client connected: ${email}`); 

    // Store the response with the associated email
    clients.push({ email, res });

    
    // Remove the client when they disconnect
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
}

function sendEvent(req, res){   //send
    const { message, email } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    console.log(message, email); 

    // Send the message to all connected clients
    // clients.forEach(client => {
    //     client.write(`data: ${JSON.stringify({ message })}\n\n`);
    // });
    const client = clients.find(client => client.email === email ); 
    if(client){ 
        client.res.write(`data: ${JSON.stringify({ message })}\n\n`)
        return res.status(200).json({ success: true, message: "Message sent to clients" });
    }
    else{ 
       return res.status(404).json({message: "Client not found"});
        // return; 
    }
}

module.exports = {eventsHandler, sendEvent} 