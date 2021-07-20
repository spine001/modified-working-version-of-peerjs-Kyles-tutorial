const socket = io('/');
// To render out video on the screen
const videoGrid = document.getElementById('video-grid'); // This is where we place all our new videos
const peers={}
// To geta Peer Class with a peer id and all the WebRTC information in it
const myPeer = new Peer(undefined, {
    host: '/',
    path: '/myapp',
    port: '3001',
    debug: 2
});

// Now lets get a reference to a video for us and mute it
const myVideo = document.createElement('video');
myVideo.muted = true;

//****************SPINE001'S CODE*****************/
(async () => {
    let stream = null;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        addVideoStream(myVideo, stream)
    } catch (error) {
        console.log('error opening the stream ' + error);
        alert('Please use a secure https connection');
    }
})();

// Here we listen for a peer call and when we receive it we send them our stream
myPeer.on('call', async (mediaConnection) => {
    try {
        let stream = null;
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        console.log('***myPeer.on "call" event user: ' + myPeer.id + ' room: ' + ROOM_ID + ' received by Client')
        mediaConnection.answer(stream)
        const video = document.createElement('video')
        mediaConnection.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    } catch (error) {
        console.log('error opening the stream ' + error);
        alert('Please use a secure https connection');
    }
})
// We need to allow to be connected by other users, for that we need to listen to the "user connected" event and when it occurs send that user our video stream and receive theirs
socket.on('user-connected', async (userId) => {
    console.log('***socket.on "user-connected" event received from user: ' + userId + ' to room: ' + ROOM_ID + ' by Client')
    try {
        let stream = null;
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        connectToNewUser(userId, stream)
    } catch (error) {
        console.log('error opening the stream ' + error);
        alert('Please use a secure https connection');
    }
})

socket.on('user-disconnected', userId => {
    console.log('socket userId: '+userId+' disconnected')
    if (peers[userId]) peers[userId].close()
})
myPeer.on('error', (err) => {
    console.log("**myPeer.on navigator ERROR: " + err)
})
//****************With KYLE'S CODE it doesn't work*********************/
// Now we need to try to connect our own video. It's a promise that returns a stream of our video and audio
// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true
// }).then(stream => {
//     addVideoStream(myVideo, stream)
//     // Here we listen for a peer call and when we receive it we send them our stream
//     myPeer.on('call', mediaConnection => {
//         console.log('***myPeer.on "call" event user: ' + userId + ' room: ' + ROOM_ID + ' received by Client')
//         mediaConnection.answer(stream)
//     })
//     // We need to allow to be connected by other users, for that we need to listen to the "user connected" event and when it occurs send that user our video stream and receive theirs
//     socket.on('user-connected', userId => {
//         console.log('***socket.on "user-connected" event received from user: ' + userId + ' to room: ' + ROOM_ID + ' by Client')
//         connectToNewUser(userId, stream)
//     })
//     myPeer.on('error', (err) => {
//         console.log("**myPeer.on navigator ERROR: " + error)
//     })
// })

myPeer.on('open', id => { // Run this function as soon as we connect with the Peer server in port 3001 and get our user id
    socket.emit('join-room', ROOM_ID, id)
    console.log('**Event "join-room" emited by Client: ' + id + ' room: ' + ROOM_ID)
})

myPeer.on('error', (err) => {
    console.log("**MAIN ERROR: " + error)
})

// Handling a connection request
myPeer.on("connection", (conn) => {
    conn.on("data", (data) => {
        console.log("**Received data", data);
    });
});

// Connecting the new users
function connectToNewUser(userId, stream) {
    // First stablish a data connection with peer
    const conn = myPeer.connect(userId)
    conn.on("open", () => {
        conn.send("Hello World!")
        console.log('**con.on event "open" => sending Hello World! to other user');
    });

    const mediaConnection = myPeer.call(userId, stream)
    console.log('**Calling userId: ' + userId + ' and stream: ' + stream);
    // We create another video element in our page
    const video = document.createElement('video')
    mediaConnection.on('stream', userVideoStream => {
        console.log('**mediaConnection "stream" event received from remote user in connectToNewUser')
        addVideoStream(video, userVideoStream) // and then we pass the video element to the addVideoStream function
    })
    // We also need to listen for when the call stops
    mediaConnection.on('close', () => {
        console.log('call Event "close"')
        video.remove()
    })
    myPeer.on('error', (err) => {
        console.log("**connectToNewUser ERROR: " + error)
    })
    mediaConnection.on('error', () => {
        console.log('mediaConnection error: ' + error)
    })
    peers[userId] = mediaConnection
    console.error
}

// adds the videostream to the video object that we created before "myVideo"
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

