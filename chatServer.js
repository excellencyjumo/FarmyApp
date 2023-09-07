import { Server, Socket } from 'socket.io';
import http from 'http';
import * as ObjectId from 'mongodb';
import jwt from 'jsonwebtoken';
import Room from './src/models/rooms.js';
import User from './src/models/buyer/userModel.js';
import Logistics from './src/models/logistics/logisticsModel.js';
import Store from './src/models/stores/sellerModel.js';
import Farm from './src/models/farms/farmerModel.js';
import Chat from './src/models/chats.js';

var ObjectID = ObjectId.ObjectId;
const chatServer = function (app) {
  const server = http.createServer(app);

  const port = +process.env.SOCKET_PORT;
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const clientDB = {
    user: async (id) => {
      return await User.findById(id);
    },
    logistics: async (id) => {
      return await Logistics.findById(id);
    },
    store: async (id) => {
      return await Store.findById(id);
    },
    farm: async (id) => {
      return await Farm.findById(id);
    },
  };

  io.use(function (socket, next) {
    if (!socket.handshake.query || !socket.handshake.query.token) {
      socket.emit('not-logged-in');
      return next();
    }

    const { token } = socket.handshake.query;

    jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
      if (err) {
        socket.emit('auth-error');
        return next();
      }

      const clientDB = {
        user: async (id) => {
          return await User.findOneAndUpdate(
            { _id: id },
            { currentSocketId: socket.id },
            { returnDocument: 'after' }
          );
        },
        logistics: async (id) => {
          return await Logistics.findOneAndUpdate(
            { _id: id },
            { currentSocketId: socket.id },
            { returnDocument: 'after' }
          );
        },
        store: async (id) => {
          return await Store.findOneAndUpdate(
            { _id: id },
            { currentSocketId: socket.id },
            { returnDocument: 'after' }
          );
        },
        farm: async (id) => {
          return await Farm.findOneAndUpdate(
            { _id: id },
            { currentSocketId: socket.id },
            { returnDocument: 'after' }
          );
        },
      };

      let decodedKey = Object.keys(decoded)[0];
      decodedKey = decodedKey.slice(0, -2);
      const decodedValue = decoded[`${decodedKey}Id`];

      const client = await clientDB[decodedKey](decodedValue);

      const rooms = await Room.find({
        $or: [
          { user1: client._id?.toString() },
          { user2: client._id?.toString() },
        ],
      }).sort({ lastTimeUpdated: 1 });

      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        rooms[i].user1 = await clientDB[room.user1Type](room.user1);
        rooms[i].user2 = await clientDB[room.user2Type](room.user2);
      }

      socket.emit(`${decodedKey}-connected`, {
        client,
        rooms,
      });
      return next();
    });
  });

  io.on('connection', function (socket) {
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
    });
    socket.on('get-chats', async (roomId) => {
      const chats = await Chat.find({ room: roomId }).sort({ createAt: 1 });

      if (chats[0]) {
        chats[0].to = await clientDB[chats[0].toType](chats[0].to);
        chats[0].from = await clientDB[chats[0].fromType](chats[0].from);
      }

      socket.emit('retrieve-chats', chats);
    });

    socket.on('send-message', async (chat) => {
      let room;
      let roomId;
      if (!chat.roomId?.trim()) {
        const newRoom = new Room({
          user1: chat.from.toString(),
          user2: chat.to.toString(),
          user1Type: chat.fromType,
          user2Type: chat.toType,
          lastTimeUpdated: new Date(),
        });
        room = await newRoom.save();
        roomId = room._id;
      } else {
        roomId = chat.roomId;

        await Room.updateOne(
          {
            _id: new ObjectID(chat.roomId),
          },
          { lastTimeUpdated: new Date() }
        );
        room = await Room.findById(roomId);
      }

      room.user1 = await clientDB[room.user1Type](room.user1);
      room.user2 = await clientDB[room.user2Type](room.user2);

      // add the two sockets to the room

      const senderSocket = (await io.fetchSockets()).find(
        (socket) => socket.id === chat.socketId
      );

      senderSocket.join(roomId);

      const receiver =
        room.user1.currentSocketId === chat.socketId ? room.user2 : room.user1;

      const receiverSocket = (await io.fetchSockets()).find(
        (socket) => socket.id === receiver.currentSocketId
      );

      if (receiverSocket) receiverSocket.join(roomId);

      const chatToBeSaved = new Chat({
        from: chat.from,
        to: chat.to,
        fromType: chat.fromType,
        toType: chat.toType,
        text: chat.text,
        room: roomId,
      });
      const newChat = await chatToBeSaved.save();

      newChat.from = await clientDB[newChat.fromType](newChat.from);
      newChat.to = await clientDB[newChat.toType](newChat.to);

      socket.broadcast.emit('retrieve-message', newChat);
    });

    socket.on('get-client', async (object) => {
      const clientDB = {
        user: async (username) => {
          return await User.findOne({
            username: { $regex: new RegExp(username, 'i') },
          });
        },
        logistics: async (username) => {
          return await Logistics.findOne({
            username: { $regex: new RegExp(username, 'i') },
          });
        },
        store: async (username) => {
          return await Store.findOne({
            username: { $regex: new RegExp(username, 'i') },
          });
        },
        farm: async (username) => {
          return await Farm.findOne({
            username: { $regex: new RegExp(username, 'i') },
          });
        },
      };

      const { clientUserName, clientType, socketId, fromClientId } = object;

      const client = await clientDB[clientType](clientUserName);

      if (!client) {
        io.to(socketId).emit('no-client-error', `${clientType}`);
        return;
      }

      let room = await Room.findOne({
        $and: [
          { $or: [{ user1: client._id }, { user2: fromClientId }] },
          { $or: [{ user2: client._id }, { user1: fromClientId }] },
        ],
      });

      io.to(socketId).emit('client-retrieved', room?._id, client);
    });

    socket.on('create-room', async ({ user1, user2, socketId, text }) => {
      let room = new Room({
        user1: user1._id,
        user2: user2._id,
        user1Type: user1.type,
        user2Type: user2.type,
      });

      room = await room.save();

      room.user1 = { ...user1 };
      room.user2 = { ...user2 };

      io.to(socketId).emit('render-newly-created-room', room, text);
    });
  });

  server.listen(port, () => {
    console.log(`Socket running on ${port}`);
  });
};

export default chatServer;
