import { useEffect } from 'react'
import { useRef } from 'react'
import { useState } from 'react'
import AudioStreamer from './AudioStreamer'


function WebSocketDemo() {
  const wsRef=useRef()
  const [status,setStatus]=useState("disconnected")
  const [message,setMessage]=useState([])

  useEffect(()=>{
    const ws=new WebSocket("ws://localhost:8080")
    wsRef.current=ws

    ws.onopen=()=>{
      setStatus("connected")
      console.log("web socket connected");
    }

    ws.onmessage=(event)=>{
      const data=JSON.parse(event.data)
      console.log(data);
      
      setMessage((prev)=>[...prev,data.text])
    }

    ws.onerror=(error)=>{
      console.error("ws error",error);
      
    }

    ws.onclose=()=>{
      setStatus("disconnected")
      console.log("web socket disconnected");
      
    }

    return ()=>{
      ws.close()
    };
  },[]);

  const sendText=()=>{
    wsRef?.current?.send("hello from react")
  }

  const sendBinary=()=>{
    const buffer= new Uint8Array([10,20,30,40,50,60])
    wsRef?.current?.send(buffer);
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center px-4">
    <div className="w-full max-w-3xl bg-gray-900/80 backdrop-blur rounded-2xl shadow-2xl p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">
          🎙️ Real-Time Speech Transcription
        </h1>

        <span
          className={`px-4 py-1 rounded-full text-sm font-medium ${
            status === "Connected"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {status}
        </span>
      </div>

  
      <div className="bg-gray-800/70 rounded-xl p-4">
        <AudioStreamer ws={wsRef.current} />
      </div>


      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-300">
          Live Transcription
        </h3>

        <div className="min-h-[120px] bg-black/60 border border-gray-700 rounded-xl p-4 text-gray-200 leading-relaxed">
          {message ? (
            <p className="whitespace-pre-wrap">{message}</p>
          ) : (
            <p className="text-gray-500 italic">
              Start speaking to see transcription…
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

}

export default WebSocketDemo
