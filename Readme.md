taken from https://www.youtube.com/watch?v=DvlyzDZDEq4&t=162s
but for some reason, can't get the call event triggered by
const mediaConnection = peer.call(userId, stream)
to trigger the "call" event in the userId of the peer
will try another tutorial to see if I find the problem

Issue solved in this example, it was a timing problem
due to the sequence of calls. See https://github.com/spine001/working_peer_js_WebRTC_Nodejs_example
for more details on the fix. It is another working example
of peerjs WebRTC with working_peer_js_WebRTC_Nodejs_example
This example uses 1.3.2 version of the client and you ought 
to start the peerjs server from a termina using
peerjs --port 3001 --key peerjs --path /myapp
The client in script.js will need for this peer server
to be running at port 3001 with path /myapp
