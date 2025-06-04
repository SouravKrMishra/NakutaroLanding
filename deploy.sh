#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install project dependencies
npm install

# Build the project
npm run build

# Start the application with PM2
pm2 start dist/index.js --name "nakutaro-landing"

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup 