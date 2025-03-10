const mongoose = require('mongoose'); 

const notificationSchema = new mongoose.Schema({ 
    email: {
        type: String
    }, 
    message: { 
        type: String, 
    }, 
    sent: { 
        type: Boolean, 
        default: false
    },
    createdAt: { 
        type: Date, 
        default: Date.now
    }

}); 

module.exports = mongoose.model('Notification', notificationSchema);