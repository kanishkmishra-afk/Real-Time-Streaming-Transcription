import { useEffect, useRef, useState } from "react";

export default function AudioStreamer({ ws }) {
  const audioContextRef=useRef(null)
  const inputRef=useRef(null)
  const streamRef=useRef(null)
  const processorRef=useRef(null)
  const [isStreaming,setIsStreaming]=useState(false)

  const startStreaming=async()=>{
    streamRef.current=await navigator.mediaDevices.getUserMedia({
      audio:true
    })

    audioContextRef.current=new AudioContext({sampleRate:16000})

    inputRef.current=audioContextRef.current.createMediaStreamSource(streamRef.current)

    processorRef.current= audioContextRef.current.createScriptProcessor(4096,1,1)

    processorRef.current.onaudioprocess=(event)=>{
      if(!ws || ws.readyState !== WebSocket.OPEN) return

      const float32Data= event.inputBuffer.getChannelData(0)

      const pcm16=convertFloat32ToPCM16(float32Data)
      
      ws.send(pcm16)
    } 
    inputRef.current.connect(processorRef.current)
    processorRef.current.connect(audioContextRef.current.destination)
    setIsStreaming(true)
  }

  const stopStreaming=()=>{
    processorRef.current?.disconnect()
    inputRef.current?.disconnect()
    audioContextRef.current?.close()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setIsStreaming(false)
}

 return (
  <div className="flex items-center gap-4">
    {/* Start Button */}
    <button
      onClick={startStreaming}
      disabled={isStreaming}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
        ${
          isStreaming
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600 text-black shadow-lg shadow-green-500/30"
        }`}
    >
      🎙️ Start Mic
    </button>

    {/* Stop Button */}
    <button
      onClick={stopStreaming}
      disabled={!isStreaming}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
        ${
          !isStreaming
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600 text-black shadow-lg shadow-red-500/30"
        }`}
    >
      ⛔ Stop Mic
    </button>
  </div>
);

}
/* ===== helper ===== */
function convertFloat32ToPCM16(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;

  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}
