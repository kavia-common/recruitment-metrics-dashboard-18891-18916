#!/bin/bash
cd /home/kavia/workspace/code-generation/recruitment-metrics-dashboard-18891-18916/frontend_dashboard
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

