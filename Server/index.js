const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const server = http.createServer(app);
const { Server } = require('socket.io');

// Setup CORS to allow requests from your Angular frontend (localhost:4200)
app.use(cors({
    origin: 'http://localhost:4200', // Frontend origin
    methods: ['GET', 'POST'],
    credentials: true // Enable credentials if needed
}));

app.use(express.json());

// Initialize Socket.io server and link it to the HTTP server
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:4200', // Allow Angular frontend
        methods: ["GET", "POST"]
    }
});

// In-memory storage for users and messages (simulated database)
let users = {
    pharmacies: [
        {
            id: 'pharmacy1',
            pharmacyEmail: 'zdammak@med4.solutions',
            pharmacyName: 'Dammak\'s',
            pharmacistPhone: '123456789',
            pharmacyAddress: '123 Main St',
        },
        {
            id: 'pharmacy2',
            pharmacyEmail: 'idhouib@med4.solutions',
            pharmacyName: 'Dhouib\'s',
            pharmacistPhone: '987654321',
            pharmacyAddress: '456 Elm St',
        }
    ],
    deliveryMen: [
        {
            id: 'delivery-man1',
            email: 'nmsedi@med4.solutions',
            firstName: 'Najd',
            lastName: '',
            phone: '111222333',
        },
        {
            id: 'delivery-man2',
            email: 'akessemtini@med4.solutions',
            firstName: 'Ayoub',
            lastName: '',
            phone: '444555666',
        }
    ]
};

let messages = [];

// Simulated user login
app.post('/login', (req, res) => {
    const { email, userType } = req.body;
    let user;

    // Check user type and find user by email
    if (userType === 'pharmacy') {
        user = users.pharmacies.find(p => p.pharmacyEmail === email);
    } else if (userType === 'deliveryMan') {
        user = users.deliveryMen.find(d => d.email === email); // Use email to match deliveryMen
    }

    // Handle case if user not found
    if (!user) {
        console.log(`User not found with email: ${email}`);
        return res.status(404).send('User not found');
    }

    console.log(`User logged in: ${userType} - ${email}`);
    return res.json(user); // Return user info if found
});

// Add new users for testing (temporary)
app.post('/add-user', (req, res) => {
    const { user, userType } = req.body;

    // Add user to appropriate list based on userType
    if (userType === 'pharmacy') {
        users.pharmacies.push(user);
        console.log(`New pharmacy added: ${user.pharmacyEmail}`);
    } else if (userType === 'deliveryMan') {
        users.deliveryMen.push(user);
        console.log(`New delivery man added: ${user.id}`);
    } else {
        return res.status(400).send('Invalid userType');
    }

    res.send('User added');
});

// Get all delivery men (for pharmacy to select)
app.get('/delivery-men', (req, res) => {
    console.log('Returning list of delivery men');
    res.json(users.deliveryMen);
});

// Get chat history between two users by their IDs
app.get('/chat-history', (req, res) => {
    const { userId, deliveryManId } = req.query;
    const chatHistory = messages.filter(msg =>
        (msg.senderId === userId && msg.recipientId === deliveryManId) ||
        (msg.senderId === deliveryManId && msg.recipientId === userId)
    );
    res.json(chatHistory);
});

// Get all pharmacies (for delivery men to select)
app.get('/pharmacies', (req, res) => {
    console.log('Returning list of pharmacies');
    res.json(users.pharmacies);
});

// Route pour récupérer le nombre de messages non lus pour chaque utilisateur
app.get('/unread-messages', (req, res) => {
    const { userId, deliveryManId } = req.query;
    const unreadMessages = messages.filter(msg => msg.recipientId === userId && msg.senderId === deliveryManId && msg.unread);
    res.json(unreadMessages.length);
});

// Route pour marquer les messages comme lus
app.post('/mark-messages-read', (req, res) => {
    const { userId, deliveryManId } = req.body;
    messages.forEach(msg => {
        if (msg.senderId === deliveryManId && msg.recipientId === userId) {
            msg.unread = false;
        }
    });
    res.send('Messages marked as read');
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Register the user when they log in
    socket.on('register', (userId) => {
        socket.userId = userId; // Associate userId with the socket connection
        console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    });

    // Handle incoming messages
    socket.on('message', (msg) => {
        // Save the message to in-memory storage
        msg.unread = true; // New messages are initially marked as unread
        messages.push(msg);

        console.log(`Received message from ${msg.senderId} to ${msg.recipientId}: ${msg.message}`);

        // Find the recipient's socket by userId
        const recipientSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === msg.recipientId);

        // Send the message to the recipient if they are connected
        if (recipientSocket) {
            recipientSocket.emit('message', msg);
            console.log(`Message delivered to ${msg.recipientId}`);
        } else {
            console.log(`User ${msg.recipientId} is not connected.`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User with socket ID ${socket.id} disconnected.`);
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
