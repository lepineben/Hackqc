#!/bin/bash

# ÉnergIA Demo Preparation Script
# This script helps prepare the ÉnergIA application for demonstration

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}    ÉnergIA Demo Preparation Script     ${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: Not in the energia-demo directory${NC}"
  echo "Please run this script from the energia-demo directory"
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed${NC}"
  echo "Please install Node.js before continuing"
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}"

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}Creating .env.local file...${NC}"
  cp .env.example .env.local
  echo -e "${GREEN}Created .env.local file${NC}"
  echo -e "${YELLOW}Please edit .env.local to set your OpenAI API key${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install --legacy-peer-deps
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Dependencies installed successfully${NC}"
else
  echo -e "${RED}Error installing dependencies${NC}"
  exit 1
fi

# Build the application
echo -e "\n${YELLOW}Building application...${NC}"
npm run build
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Application built successfully${NC}"
else
  echo -e "${RED}Error building application${NC}"
  exit 1
fi

# Create backup directories
echo -e "\n${YELLOW}Creating backup directories...${NC}"
mkdir -p backups
mkdir -p backups/recordings
echo -e "${GREEN}Backup directories created${NC}"

# Test the application
echo -e "\n${YELLOW}Testing application...${NC}"
echo -e "Starting server in the background..."
npm start &
SERVER_PID=$!

# Wait for server to start
echo -e "Waiting for server to start..."
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
  echo -e "${GREEN}Server started successfully with PID $SERVER_PID${NC}"
else
  echo -e "${RED}Error starting server${NC}"
  exit 1
fi

# Create backup of the project
echo -e "\n${YELLOW}Creating project backup...${NC}"
BACKUP_NAME="energia-demo-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar --exclude="node_modules" --exclude=".next" --exclude="backups" -czf "backups/$BACKUP_NAME" .
echo -e "${GREEN}Project backup created: backups/$BACKUP_NAME${NC}"

# Instructions for recording
echo -e "\n${YELLOW}Demo Preparation Instructions:${NC}"
echo -e "1. Open http://localhost:3000 in your browser"
echo -e "2. Enable demo mode with Ctrl+Shift+D"
echo -e "3. Test all scenarios to ensure they load properly"
echo -e "4. Use screen recording software to create backup video"
echo -e "5. Save recording in backups/recordings/ directory"
echo -e "6. When finished, press Enter to stop the server"

# Wait for user to press Enter
read -p "Press Enter to stop the server and complete preparation..."

# Stop the server
kill $SERVER_PID
echo -e "${GREEN}Server stopped${NC}"

# Final instructions
echo -e "\n${YELLOW}Preparation Completed${NC}"
echo -e "To run the demo on presentation day:"
echo -e "1. Build the application: ${GREEN}npm run build${NC}"
echo -e "2. Start the server: ${GREEN}npm start${NC}"
echo -e "3. Access at: ${GREEN}http://localhost:3000${NC}"
echo -e "4. Enable demo mode with: ${GREEN}Ctrl+Shift+D${NC}"
echo -e "5. If needed, backup files are in: ${GREEN}backups/${NC}"

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}Demo preparation complete!${NC}"
echo -e "${YELLOW}========================================${NC}"