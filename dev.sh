#!/bin/bash

# Kill existing processes on ports
for port in 3000 4000; do
  pid=$(lsof -ti:$port 2>/dev/null)
  [ -n "$pid" ] && kill -9 $pid 2>/dev/null
done

# Start dev server
pnpm dev
