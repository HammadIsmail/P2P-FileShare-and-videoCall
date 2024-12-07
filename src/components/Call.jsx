import Peer from "peerjs";

import { useRef, useState, useEffect } from "react";
import { SuccessNotification, WarningNotification } from "../utils/Notifications";
import { CopySimple, Microphone, MicrophoneSlash, PhoneSlash, VideoCamera, VideoCameraSlash } from "phosphor-react";

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
  const [connected, setConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false); // Track remote peer's connection status
  const [remoteStream, setRemoteStream] = useState(null);
  const [dest_ID, setDest_ID] = useState(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => {
        console.error("Error while playing local video: ", err);
      });
    }
  }, [localStream]);

  const startConnection = () => {
    var newPeer = new Peer();
    newPeer.on("open", function (id) {
      console.log("My peer ID is: " + id);
      SetpeerID(id);
    });

    // Listen for incoming connections (data and call)
    newPeer.on("connection", function (connection) {
      setConn(connection); // Save the connection for later use
      setConnected(true);
      SuccessNotification("Peer Connected");
      setRemoteConnected(true); // Remote peer is now connected
      connection.on("data", function (data) {
        if (data === "call-cancel") {
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
        }
      });
    });

    // Listen for incoming calls
    newPeer.on("call", function (call) {
      const getUserMedia =
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
          ? navigator.mediaDevices.getUserMedia
          : navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

      if (!getUserMedia) {
        console.error("getUserMedia is not supported in this browser.");
        return;
      }

      getUserMedia({ video: true, audio: true })
        .then(function (stream) {
          console.log("Local stream acquired");
          setLocalStream(stream);

          // Answer the call with the local stream
          call.answer(stream);

          call.on("stream", function (remoteStream) {
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
          console.log("Failed to get local stream: ", err);
        });
    });

    setpeer(newPeer);
  };

  const handleConenction = () => {
    if (!peer) {
      console.log("Peer connection has not been initialized.");
      return;
    }

    setDest_ID(ID_Ref.current.value);

    if (!dest_ID) {
      console.log("Destination ID is required.");
      return;
    }

    const connection = peer.connect(dest_ID);
    connection.on("open", function () {
      console.log("Data connection established");
      SuccessNotification("Peer Connected");
      setConnected(true);
      setRemoteConnected(true); // Remote peer is now connected
      setConn(connection); // Save connection for sending messages
    });

    connection.on("data", function (data) {
      if (data === "call-cancel") {
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

    if (!dest_ID) {
      console.log("Destination ID is required to make a call.");
      return;
    }

    const getUserMedia =
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        ? navigator.mediaDevices.getUserMedia
        : navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia;

    if (!getUserMedia) {
      console.error("getUserMedia is not supported in this browser.");
      return;
    }

    getUserMedia({ video: true, audio: true })
      .then(function (stream) {
        console.log("Local stream acquired");
        setLocalStream(stream);

        var call = peer.call(dest_ID, stream);

        call.on("stream", function (remoteStream) {
          console.log("Remote stream received");
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          }
        });

        call.on("error", function (err) {
          console.log("Error during the call: ", err);
        });

        setCurrentCall(call);
      })
      .catch(function (err) {
        console.log("Failed to get local stream: ", err);
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
      localStream.getTracks().forEach((track) => track.stop()); // Stop all tracks (video & audio)
      setLocalStream(null); // Clear the local stream
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null; // Clear the local video element
    }
  };

  const cancelRemoteStream = () => {
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop()); // Stop all tracks of remote stream
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
        conn.send("call-cancel");
      }

      // Stop all tracks (both video and audio) in the local stream and turn off camera
      cancelLocalStream();
      cancelRemoteStream();

      // Close the data connection
      if (conn) {
        conn.close();

        SetPage(0); // Close the page for the local peer as well
        window.location.reload();
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(peerID);
    SuccessNotification("Copied Successfully!");
  };

  const handleDisconnect = () => {
    if (conn) {
      SuccessNotification("Disconnected successfully.");
      conn.close(); // Close the connection
      setConn(null); // Reset the connection state
      setpeer(null); // Reset the connected peer ID state
     
      SetPage(0);
    } else {
      WarningNotification("No active connection to disconnect.");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen w-screen">
        {!peerID ? (
          <button className="btn-primary" onClick={startConnection}>
            Start Connection
          </button>
        ) : null}
        {peerID && !connected ? (
          <div className="flex gap-2">
            <h2 className="text-lg  font-semibold">Your ID: {peerID}</h2>
            <CopySimple
              className="cursor-pointer"
              onClick={handleCopy}
              size={32}
            />
          </div>
        ) : null}
        {peerID && !connected ? (
          <div className="flex gap-2 mt-2 w-1/2">
            <input
              className="w-full p-2 outline-green-500 border-2 border-green-500 rounded-lg"
              ref={ID_Ref}
              type="text"
              placeholder="Enter Peer ID"
            />
            <button className="btn-primary" onClick={handleConenction}>
              Connect
            </button>
          </div>
        ) : null}

        {/* Only show the "Call" button when both local and remote are connected */}
        {connected && remoteConnected && !currentCall ? (
          <div className="flex gap-2">
            <button className="btn-primary" onClick={handleCall}>
              Call
            </button>
            <button className="btn-primary" onClick={handleDisconnect}>
              Stop Connection
            </button>
          </div>
        ) : null}

          {currentCall && (
          <div className="absolute bottom-0   w-full cursor-pointer  z-50">
            <button className="btn-primary m-3 p-3 rounded-xl" onClick={toggleMute}>{isMuted ? <Microphone size={32} /> : <MicrophoneSlash size={32} />  }</button>
            <button className="btn-primary m-3 p-3 rounded-xl"  onClick={toggleVideo}>
              {isVideoOff ? <VideoCameraSlash size={32} /> : <VideoCamera size={32} />}
            </button>
            <button className="btn-primary m-3 p-3 rounded-xl"  onClick={cancelCall}><PhoneSlash size={32} /></button>
          </div>
        )}
      </div>

      {currentCall && (
        <div>
          <div className="absolute z-20 left-3 top-3 ">
             {/* local video */}
            <video
            className=" w-1/3 h-1/3 rounded-xl cursor-pointer border-2 border-green-300"
              ref={localVideoRef}
              autoPlay
              muted
              
              playsInline
            />
          </div>

          <div className="absolute  inset-0 z-10 ">
           {/* remote video */}
           
            <video
              ref={remoteVideoRef}
              autoPlay
              style={{
                width: "100vw",    // Full width of the viewport
                height: "100vh",   // Full height of the viewport
                objectFit: "cover", // To maintain aspect ratio and avoid distortion
              }}
              playsInline
            />
          </div>
        </div>
      )}
     

    </>
  );
}

export default Call;
