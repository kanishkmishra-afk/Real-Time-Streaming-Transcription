# Real-Time Streaming Transcription App

This application demonstrates real-time speech-to-text transcription using a streaming architecture. The user’s microphone audio is captured in small chunks and streamed live to the backend, where it is transcribed and sent back instantly to the frontend.

## What this app does

Captures microphone audio from the browser

Streams audio in real-time using WebSockets

Converts speech to text using a live Speech-to-Text API

Displays partial and continuous transcription while the user is speaking

Provides start and stop controls for microphone input

## Key Features

Low-latency, real-time transcription

Streaming audio (no full audio buffering)

Live text updates as the user speaks

Simple and clean user interface

Handles connection status clearly

## Tech Stack

Frontend: React, Tailwind CSS

Backend: Node.js, WebSockets

Speech-to-Text: Deepgram Live Speech-to-Text API

## Use Case

This app is useful for scenarios like:

Live captions

Voice notes

Meeting transcription

Accessibility features