import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

let deepgramClient = null;

function getDeepgramClient() {
  if (!deepgramClient) {
    deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);
  }
  return deepgramClient;
}

export async function createDeepgramLiveSession(onTranscript) {
  const deepgram = getDeepgramClient();

  const connection = deepgram.listen.live({
    model: "nova-3",
    language: "en-US",
    smart_format: true,
    interim_results: true,
    encoding: "linear16",
    sample_rate: 16000,
  });

  let isConnected = false;

  connection.on(LiveTranscriptionEvents.Open, () => {
    isConnected = true;
    console.log("✓ Deepgram connection established");
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    if (data.channel.alternatives.length > 0) {
      const transcript = data.channel.alternatives[0].transcript;
      const isFinal = !data.is_final;

      if (transcript) {
        onTranscript({
          text: transcript,
          isFinal: isFinal,
          confidence: data.channel.alternatives[0].confidence || 0,
        });
      }
    }
  });


  connection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error("Deepgram error:", err);
    isConnected = false;
  });

  connection.on(LiveTranscriptionEvents.Close, () => {
    isConnected = false;
    console.log("Deepgram connection closed");
  });

  return {
    sendAudio: (audioBuffer) => {
      if (isConnected) {
        connection.send(audioBuffer);
      }
    },
    close: () => {
      connection.finish();
    },
    isConnected: () => isConnected,
  };
}
