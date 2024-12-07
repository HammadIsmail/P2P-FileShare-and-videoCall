import Peer from "peerjs";
import '../App.css';
import { useRef, useState, useEffect } from "react";
import { CopySimple, DownloadSimple } from "phosphor-react";
import { SuccessNotification, WarningNotification } from '../utils/Notifications'
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from "prop-types";
function SendFile({SetPage}) {
  const [peerID, setPeerID] = useState(null);
  const [connectedPeerID, setConnectedPeerID] = useState(null);
  const ID_Ref = useRef(null);
  const fileInputRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [conn, setConn] = useState(null);
  const [receivedFile, setReceivedFile] = useState(null);
  const [receivedFileName, setReceivedFileName] = useState("");
  useEffect(() => {
    if (peer) {
      // Handling incoming connections
      peer.on('connection', function (connection) {
        console.log("Incoming connection from " + connection.peer);
        setConn(connection);
        
        connection.on('data', function (data) {
          if (data.file) {
            const blob = new Blob([data.file], { type: data.fileType });
            const url = URL.createObjectURL(blob);
            setReceivedFile(url);
            setReceivedFileName(data.fileName);
          } else {
            console.log("Received data: ", data);
          }
        });
  
        connection.on('open', function () {
          console.log("Connection with " + connection.peer + " opened.");
          setConnectedPeerID(connection.peer);
        });

        connection.on('close', function () {
          SuccessNotification("Peer disconnected");
          setConnectedPeerID(null);
          setReceivedFile(null);
        
          setReceivedFile(null)
          setConn(null); // Clear connection
          SetPage(0);
        });
  
        connection.on('error', function (err) {
          console.log("Connection error: ", err);
        });
      });
    }
  }, [peer]);
  
  // Initialize Peer
  const startConnection = () => {
    const newPeer = new Peer();
    newPeer.on('open', function (id) {
      console.log('My peer ID is: ' + id);
      setPeerID(id);
    });

    // Handle incoming connection
    newPeer.on('connection', function (connection) {
      console.log('Connection received from ' + connection.peer);
      setConn(connection);
      
      // Handle file reception
      connection.on('data', function (data) {
        if (data.file) {
          const blob = new Blob([data.file], { type: data.fileType });
          const url = URL.createObjectURL(blob);
          setReceivedFile(url);
          setReceivedFileName(data.fileName);
        } else {
          console.log("Received data: ", data);
        }
      });

      connection.on('open', function () {
        console.log("Connection with " + connection.peer + " opened.");
        setConnectedPeerID(connection.peer);
      });

      connection.on('error', function (err) {
        console.log("Connection error: ", err);
      });
    });

    setPeer(newPeer);
  };

  // Establish Connection to Peer
  const handleConnection = () => {
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
      console.log("Data connection established with " + dest_ID);
      connection.send(peerID); // Send peer ID to the other peer
      setConnectedPeerID(dest_ID);
      ID_Ref.current.value = ""; // Clear input after successful connection
      setConn(connection);
    });

    connection.on('data', function (data) {
      if (data.file) {
        const blob = new Blob([data.file], { type: data.fileType });
        const url = URL.createObjectURL(blob);
        setReceivedFile(url);
        setReceivedFileName(data.fileName);
      } else {
        console.log("Received data: ", data);
      }
    });

    connection.on('close', function () {
      console.log("Connection closed with " + dest_ID);
      SuccessNotification("Peer disconnected");
      setConnectedPeerID(null);
      setReceivedFile(null);
    
      setReceivedFile(null)
      setConn(null); // Clear connection
      SetPage(0);
    });

    connection.on('error', function (err) {
      console.log("Connection error: ", err);
    });


  };

  // Send File
  const sendFile = () => {
    if (!conn) {
      console.log("No connection to send file");
      return;
    }

    const file = fileInputRef.current.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const arrayBuffer = event.target.result;
        conn.send({
          file: arrayBuffer,
          fileName: file.name,
          fileType: file.type
        });

        SuccessNotification(`File sent: ${file.name}`);
        fileInputRef.current.value = null;
      };
      reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    } else {
      WarningNotification("No file selected");
    }
  };

  const handleDisconnect = () => {
    if (conn) {
      SuccessNotification("Disconnected successfully.");
      conn.close(); // Close the connection
      setConn(null); // Reset the connection state
      setConnectedPeerID(null); // Reset the connected peer ID state
      setReceivedFile(null)
      SetPage(0);
    } else {
      WarningNotification("No active connection to disconnect.");
    }
  };

  // Handle Copy Peer ID
  const handleCopy = () => {
    navigator.clipboard.writeText(peerID);
    SuccessNotification("Copied Successfully!");
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen w-screen">
        {!peerID ? (
          <button className="btn-primary" onClick={startConnection}>Start Connection</button>
        ) : (

          <div className="flex w-full flex-col justify-center items-center gap-3">
            {!connectedPeerID?
            <div className="flex gap-2">
              <h2 className="text-lg  font-semibold">Your ID: {peerID}</h2>
              <CopySimple className="cursor-pointer" onClick={handleCopy} size={32} />
            </div>:null}
              {/* Show Connection Block */}

              {connectedPeerID?<div className="flex flex-col border-2 gap-3 border-green-500 p-1 rounded-md " >
                <h2 className="font-bold text-xl">Connection</h2>
                <hr className="border-1 border-gray-300" />
                <div className="flex gap-2">  
                <h1 className="  border-2 text-lg font-semibold rounded-md p-1  text-wrap">{connectedPeerID}</h1>
            <button className="btn-primary" onClick={handleDisconnect}>Stop </button></div>

            </div>:<div className="flex w-1/2 gap-3">
              <input
                className="w-full p-2 outline-green-500 border-2 border-green-500 rounded-lg"
                ref={ID_Ref}
                type="text"
                placeholder="Enter Peer ID"
              />
              <button className="btn-primary" onClick={handleConnection}>Connect</button>
            </div>}
            
          {connectedPeerID ?  <div>
              <input type="file" ref={fileInputRef} />
              <button className="btn-primary" onClick={sendFile}>Send File</button>
            </div> : null } 
          
            
            {receivedFile && (
              <div>
                <h3 className="text-lg font-semibold">Received File:</h3>
                <a className="font-bold" href={receivedFile} download={receivedFileName}>
                  <div  className="flex btn-primary text-lg m-2 gap-2"><span>Download</span> <DownloadSimple size={32} /> </div>
                  {receivedFileName}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
}
SendFile.protoTypes={
  SetPage:PropTypes.func.isRequired,
}
export default SendFile;

