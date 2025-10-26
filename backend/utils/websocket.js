const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketManager {
    constructor() {
        this.clients = new Map(); // userId -> Set of WebSocket connections
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/ws'
        });

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
    }

    handleConnection(ws, req) {
        // Extract token from query params or headers
        const token = new URL(req.url, 'http://localhost').searchParams.get('token');
        
        if (!token) {
            ws.close(1008, 'Authentication required');
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            // Store the connection
            if (!this.clients.has(userId)) {
                this.clients.set(userId, new Set());
            }
            this.clients.get(userId).add(ws);

            ws.userId = userId;

            ws.on('close', () => {
                this.handleDisconnection(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.handleDisconnection(ws);
            });

            // Send connection confirmation
            ws.send(JSON.stringify({
                type: 'connected',
                userId: userId
            }));

        } catch (error) {
            console.error('WebSocket authentication error:', error);
            ws.close(1008, 'Invalid token');
        }
    }

    handleDisconnection(ws) {
        if (ws.userId) {
            const userConnections = this.clients.get(ws.userId);
            if (userConnections) {
                userConnections.delete(ws);
                if (userConnections.size === 0) {
                    this.clients.delete(ws.userId);
                }
            }
        }
    }

    // Send message to specific user
    sendToUser(userId, message) {
        const userConnections = this.clients.get(userId);
        if (userConnections) {
            userConnections.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(message));
                }
            });
        }
    }

    // Send message to multiple users
    sendToUsers(userIds, message) {
        userIds.forEach(userId => {
            this.sendToUser(userId, message);
        });
    }

    // Broadcast new comment to project members
    broadcastNewComment(comment, projectMembers) {
        const memberIds = projectMembers.map(member => member.user_id);
        
        this.sendToUsers(memberIds, {
            type: 'new_comment',
            comment: comment
        });
    }

    // Broadcast comment update
    broadcastCommentUpdate(comment, projectMembers) {
        const memberIds = projectMembers.map(member => member.user_id);
        
        this.sendToUsers(memberIds, {
            type: 'comment_updated',
            comment: comment
        });
    }

    // Broadcast comment deletion
    broadcastCommentDelete(commentId, taskId, projectMembers) {
        const memberIds = projectMembers.map(member => member.user_id);
        
        this.sendToUsers(memberIds, {
            type: 'comment_deleted',
            commentId: commentId,
            taskId: taskId
        });
    }

    // Send notification to user
    sendNotification(userId, notification) {
        this.sendToUser(userId, {
            type: 'notification',
            notification: notification
        });
    }
}

module.exports = new WebSocketManager();