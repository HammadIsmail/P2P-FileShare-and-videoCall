import Peer from "peerjs";
import '../App.css';
import { useRef, useState } from "react";

function Call({ SetPage }) {
  const [peerID, SetpeerID] = useState(null);
  const ID_Ref = useRef(null);
  const [peer, setpeer] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [conn, setConn] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const startConnection = () => {
    var newPeer = new Peer();
    newPeer.on('open', function (id) {
      console.log('My peer ID is: ' + id);
      SetpeerID(id);
    });

    // Listen for incoming connections (data and call)
    newPeer.on('connection', function (connection) {
      setConn(connection); // Save the connection for later use
      connection.on('data', function (data) {
        if (data === 'call-cancel') {
          console.log("Received call-cancel message");
          cancelLocalStream(); // Stop the local stream when "call-cancel" is received
          cancelRemoteStream(); // Stop the remote stream when "call-cancel" is received
          if (currentCall) {
            currentCall.close(); // Close the current call
            setCurrentCall(null); // Clear the current call state
          }
          cancelCall();
          // Close the data connection
          connection.close();
          // SetPage(0); // Close the page for the remote peer as well
        }
      });
    });

    // Listen for incoming calls
    newPeer.on('call', function (call) {
      // Check for getUserMedia in different ways
      const getUserMedia =
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
          ? navigator.mediaDevices.getUserMedia
          : (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

      if (!getUserMedia) {
        console.error("getUserMedia is not supported in this browser.");
        return;
      }

      getUserMedia({ video: true, audio: true })
        .then(function (stream) {
          console.log("Local stream acquired");
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play();
          }

          // Answer the call with the local stream
          call.answer(stream);

          call.on('stream', function (remoteStream) {
            console.log("Remote stream received");
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.play();
            }
          });

          setCurrentCall(call);
        })
        .catch(function (err) {
          console.log('Failed to get local stream: ', err);
        });
    });

    setpeer(newPeer);
  };

  const handleConenction = () => {
    if (!peer) {
      console.log("Peer connection has not been initialized.");
      return;
    }

    const dest_ID = ID_Ref.current.value;

    if (!dest_ID) {
      console.log("Destination ID is required.");
      return;
    }

    const connection = peer.connect(dest_ID);
    connection.on('open', function () {
      console.log("Data connection established");
      setConn(connection); // Save connection for sending messages
    });

    connection.on('data', function (data) {
      if (data === 'call-cancel') {
        console.log("Received call-cancel message");
        cancelLocalStream(); // Stop the local stream when "call-cancel" is received
        cancelRemoteStream(); // Stop the remote stream when "call-cancel" is received
        if (currentCall) {
          currentCall.close(); // Close the current call
          setCurrentCall(null); // Clear the current call state
        }
        cancelCall();
        // Close the data connection
        connection.close();
        // SetPage(0); // Close the page for the remote peer as well
      }
    });
  };

  const handleCall = () => {
    if (!peer) {
      console.log("Peer is not initialized");
      return;
    }

    const dest_ID = ID_Ref.current.value;

    if (!dest_ID) {
      console.log("Destination ID is required to make a call.");
      return;
    }

    // Check for getUserMedia in different ways
    const getUserMedia =
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        ? navigator.mediaDevices.getUserMedia
        : (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

    if (!getUserMedia) {
      console.error("getUserMedia is not supported in this browser.");
      return;
    }

    getUserMedia({ video: true, audio: true })
      .then(function (stream) {
        console.log("Local stream acquired");
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }

        var call = peer.call(dest_ID, stream);

        call.on('stream', function (remoteStream) {
          console.log("Remote stream received");
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          }
        });

        call.on('error', function (err) {
          console.log('Error during the call: ', err);
        });

        setCurrentCall(call);
      })
      .catch(function (err) {
        console.log('Failed to get local stream: ', err);
      });
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const cancelLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop()); // Stop all tracks (video & audio)
      setLocalStream(null); // Clear the local stream
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null; // Clear the local video element
    }
  };

  const cancelRemoteStream = () => {
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop()); // Stop all tracks of remote stream
      setRemoteStream(null); // Clear the remote stream
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null; // Clear the remote video element
    }
  };

  const cancelCall = () => {
    if (currentCall) {
      currentCall.close(); // Close the current call
      setCurrentCall(null);
      console.log("Call canceled");

      // Send "call-cancel" message to the other peer
      if (conn) {
        conn.send('call-cancel');
      }

      // Stop all tracks (both video and audio) in the local stream and turn off camera
      cancelLocalStream();
      cancelRemoteStream();

      // Close the data connection
      if (conn) {
        conn.close();
        SetPage(0); // Close the page for the local peer as well
      }
    }
  };

  return (
    <>
      <div>
        {!peerID ? <button onClick={startConnection}>Start</button> : null}
        {peerID ? <h2>Your ID: {peerID}</h2> : null}

        <input ref={ID_Ref} type="text" placeholder="Enter Peer ID" />
        <button onClick={handleConenction}>Connect</button>
        <button onClick={handleCall}>Call</button>

        {currentCall && (
          <>
            <button onClick={toggleMute}>
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button onClick={toggleVideo}>
              {isVideoOff ? "Turn On Video" : "Turn Off Video"}
            </button>
            <button onClick={cancelCall}>Cancel Call</button>
          </>
        )}
      </div>

      <div>
        <h3>Local Stream</h3>
        <video ref={localVideoRef} playsInline autoPlay muted style={{ width: '300px' }}></video>
      </div>

      <div>
        <h3>Remote Stream</h3>
        <video ref={remoteVideoRef} playsInline autoPlay style={{ width: '300px' }}></video>
      </div>
    </>
  );
}

export default Call;
