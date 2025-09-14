#!/bin/bash
# Simple deployment server for demonstration
cd "$(dirname "$0")"
echo 'Starting ISCHOOLGO demo server...'
echo 'Building application...'
npm run build
echo 'Starting server on port 8080...'
echo 'Demo credentials:'
echo 'Username: admin, director, marketer, headtrainer, agent, or teacher'
echo 'Password: password123'
echo 'Press Ctrl+C to stop the server'
cd dist && python3 -m http.server 8080
