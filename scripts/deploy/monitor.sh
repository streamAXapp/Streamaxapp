#!/bin/bash

# Monitor streaming containers
# Usage: ./monitor.sh

set -e

echo "StreamAX Container Monitor"
echo "========================="

while true; do
    clear
    echo "StreamAX Container Status - $(date)"
    echo "=================================="
    
    # Show all StreamAX containers
    echo "All StreamAX Containers:"
    docker ps -a --filter "name=streamax-*" --format "table {{.Names}}\t{{.Status}}\t{{.RunningFor}}\t{{.Size}}" || echo "No containers found"
    
    echo ""
    echo "Running Containers Details:"
    echo "---------------------------"
    
    # Get running container names
    RUNNING_CONTAINERS=$(docker ps --filter "name=streamax-*" --format "{{.Names}}" 2>/dev/null || echo "")
    
    if [ -z "$RUNNING_CONTAINERS" ]; then
        echo "No running StreamAX containers"
    else
        for container in $RUNNING_CONTAINERS; do
            echo "Container: $container"
            echo "  CPU/Memory: $(docker stats --no-stream --format "{{.CPUPerc}} / {{.MemUsage}}" "$container" 2>/dev/null || echo "N/A")"
            echo "  Logs (last 3 lines):"
            docker logs --tail 3 "$container" 2>/dev/null | sed 's/^/    /' || echo "    No logs available"
            echo ""
        done
    fi
    
    echo "Press Ctrl+C to exit, refreshing in 10 seconds..."
    sleep 10
done