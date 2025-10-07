import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class PermissionsGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    // Called when a client connects
    handleConnection(client: Socket) {
        // TODO: Extract userId from JWT (e.g., from client.handshake.query.token)
        // For now, assume userId is sent as a query param for demo purposes
        const userId = client.handshake.query.userId as string;
        if (userId) {
            client.join(userId);
        }
    }

    // Notify specific users that their permissions have changed
    notifyPermissionsChanged(userIds: string[]) {
        userIds.forEach(userId => {
            this.server.to(userId).emit('permissions-updated');
        });
        // start front
        // socket.on('permissions_updated', () => {
        //     fetch('/api/me').then(res => res.json()).then(user => setUser(user));
        // });
        //  end front
    }
} 