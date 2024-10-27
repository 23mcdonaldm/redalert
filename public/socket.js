const socket = io('http://localhost:8080');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('emergencyDeclared', (data) => {
    alert('Emergency declared!');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});