#!/usr/bin/env bash
echo "======================================================================"
echo "          CONTINUUM LIVING SEGMENTATION - EXECUTIVE DEMO"
echo "======================================================================"
echo ""

if ! command -v npm &> /dev/null; then
    echo "[ERROR] Node.js is not detected on your system."
    echo "Please install Node.js from https://nodejs.org"
    echo ""
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[1/2] Installing dependencies (first run only, takes ~30 seconds)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] npm install failed."
        exit 1
    fi
else
    echo "[1/2] Dependencies already installed."
fi

echo "[2/2] Launching demo server..."
echo ""
echo "Opening browser at http://localhost:5173/ ..."
echo "Press Ctrl+C to stop the demo."
echo ""

if command -v open &> /dev/null; then
    open "http://localhost:5173/"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173/"
fi

npm run dev
