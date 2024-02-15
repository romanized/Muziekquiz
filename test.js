let socket = new WebSocket('ws://localhost:8080');

function checkWebSocketConnection() {
    if (socket.readyState === WebSocket.OPEN) {
        console.log("WebSocket is open");
    } else {

        console.log("WebSocket is not open, attempting to reconnect...");
        // Close the previous socket connection before creating a new one
        socket.close();
        // Reinitialize the WebSocket connection
        socket = new WebSocket('ws://localhost:8080');
        setTimeout(checkWebSocketConnection, 500);
    }
}


// Generate a random code
function generateRandomCode() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Open the username selection dialog
document.getElementById('joinLobbyButton').addEventListener('click', () => {
    openUsernameSel();
});

function openUsernameSel() {
    Swal.fire({
        title: 'Kies een naam',
        html: '<input maxlength="10" type="text" id="swal-input1" class="swal2-input" placeholder="Jouw naam">',
        showCancelButton: true,
        confirmButtonText: 'OK',
        focusConfirm: false,
        didOpen: () => {
            document.getElementById('swal-input1').focus(); // Focus op het invoerveld
        },
        preConfirm: () => {
            const inputElement = document.getElementById('swal-input1');
            const username = inputElement.value.trim(); // Trim to remove any whitespace
            if (!username) {
                Swal.showValidationMessage(`Naam mag niet leeg zijn`);
            } else if (username.length > 10) { // Enforce the character limit
                Swal.showValidationMessage(`Naam mag niet langer zijn dan 10 karakters`);
            } else {
                return username; // Retourneer de waarde voor gebruik in then((result))
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            startLobby(result.value); // Gebruik de ingevoerde waarde na bevestiging
        }
    });
}

function startLobby(username) {
    const lobbyCode = generateRandomCode();
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('lobbyCode', lobbyCode);
    socket.send(JSON.stringify({ action: 'joinLobby', username, lobbyCode: null }));
    window.location.href = 'PHP/lobby.html';
}

// Reconnect WebSocket if disconnected
function setupWebSocketReconnection() {
    socket.onclose = function () {
        console.log("WebSocket is closed. Attempting to reconnect...");
        socket = new WebSocket('ws://localhost:8080');
        setupWebSocketHandlers();
    };
}


function setupWebSocketHandlers() {
    socket.send(JSON.stringify({ action: 'requestActiveLobbies' }));
};


setTimeout(() => {
    setupWebSocketHandlers();
}, 2500);



socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.action === 'activelobbies') {
        const lobbyMessagesDiv = document.getElementById('lobbyMessages');
        lobbyMessagesDiv.innerHTML = '';
        Object.keys(data.lobbies).forEach(key => {
            const lobby = data.lobbies[key];
            const playerCount = lobby.length;
            lobbyMessagesDiv.innerHTML += `<p>Actieve lobby: ${key} - Spelers: ${playerCount}</p> <button onclick="joinlobby('${key}');">Join lobby</button>`;
        });
    } else if (data.action === 'lobbygemaakt') {
        setupWebSocketHandlers();
    } else {
        console.log("Unhandled message action:", data.action);
    }
};

function openUsernameSeljoin(lobbycode) {
    Swal.fire({
        title: 'Kies een naam',
        html: '<input maxlength="10" type="text" id="swal-input1" class="swal2-input" placeholder="Jouw naam">',
        showCancelButton: true,
        confirmButtonText: 'OK',
        focusConfirm: false,
        didOpen: () => {
            document.getElementById('swal-input1').focus(); // Focus op het invoerveld
        },
        preConfirm: () => {
            const inputElement = document.getElementById('swal-input1');
            if (!inputElement.value) {
                Swal.showValidationMessage(`Naam mag niet leeg zijn`);
            } else {
                return inputElement.value; // Retourneer de waarde voor gebruik in then((result))
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            getintolobby(result.value, lobbycode); // Gebruik de ingevoerde waarde na bevestiging
        }
    });
}


function joinlobby(lobbycode) {
    openUsernameSeljoin(lobbycode);
}


function getintolobby(username, lobbycode) {
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('lobbyCode', lobbycode);
    socket.send(JSON.stringify({ action: 'joinLobby', username, lobbyCode: null }));
    window.location.href = 'PHP/lobby.html';
}

