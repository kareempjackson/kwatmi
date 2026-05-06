import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/rides',
})
export class RidesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RidesGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || 
                    client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Track socket connections per user
      if (!this.userSockets.has(client.userId)) {
        this.userSockets.set(client.userId, new Set());
      }
      this.userSockets.get(client.userId).add(client.id);

      // Join user-specific room
      client.join(`user:${client.userId}`);

      this.logger.log(`Client ${client.id} connected as user ${client.userId}`);
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const sockets = this.userSockets.get(client.userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
    }
    this.logger.log(`Client ${client.id} disconnected`);
  }

  /**
   * Driver subscribes to ride requests in their area
   */
  @SubscribeMessage('subscribe:rides')
  handleSubscribeRides(@ConnectedSocket() client: AuthenticatedSocket) {
    client.join('drivers:available');
    this.logger.log(`Driver ${client.userId} subscribed to ride requests`);
    return { event: 'subscribed', data: { channel: 'rides' } };
  }

  /**
   * Driver unsubscribes from ride requests
   */
  @SubscribeMessage('unsubscribe:rides')
  handleUnsubscribeRides(@ConnectedSocket() client: AuthenticatedSocket) {
    client.leave('drivers:available');
    this.logger.log(`Driver ${client.userId} unsubscribed from ride requests`);
    return { event: 'unsubscribed', data: { channel: 'rides' } };
  }

  /**
   * Driver updates their location
   */
  @SubscribeMessage('driver:location')
  handleDriverLocation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { lat: number; lng: number },
  ) {
    this.logger.debug(`Driver ${client.userId} location: ${data.lat}, ${data.lng}`);
    // Location updates could be handled by a separate service
    return { event: 'location:updated', data };
  }

  /**
   * Notify a specific driver about a new ride request
   */
  notifyDriver(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('ride:request', data);
    this.logger.log(`Notified driver ${userId} about ride ${data.data?.rideId}`);
  }

  /**
   * Notify a passenger about ride updates
   */
  notifyPassenger(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('ride:update', data);
    this.logger.log(`Notified passenger ${userId}: ${data.type}`);
  }

  /**
   * Broadcast to all connected users in a room
   */
  broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
}
