// Controllers imports
import { getCodeBlockData } from './controllers/codeblockController';

// Types
import { CodeBlockInterface } from './types';

// import { corsOptions } from './config/corsOptions';
import { Server } from 'socket.io';
import { Server as httpServer } from 'node:http';

export const socket = (server: httpServer) => {
  const io = new Server(server);

  // Maps
  let socketIdToRoleRoom: Map<string, { role: string; roomId: string }> =
    new Map(); // Key = socket.id, Value = {role (mentor or student), roomId}

  let roomIdToSocketIds: Map<string, string[]> = new Map(); // Key = roomId (codeBlockId), Value = all socket.id in that room.

  let roomIdToCodeBlock: Map<string, CodeBlockInterface> = new Map();

  // Helper Functions.
  function checkSolution(solution: string | null, code: string): boolean {
    if (!solution) {
      console.log('no solution');
      return false;
    }
    try {
      console.log(solution);
      console.log('-------------');
      // evaluate and see if match.
      const codeEval = eval(code);
      console.log('codeEval', codeEval);
      const solutionEval = eval(solution);
      console.log('solEval', solutionEval);
      const isSolved =
        JSON.stringify(solutionEval) === JSON.stringify(codeEval);
      console.log(isSolved);
      return isSolved;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  // maintaining the codeblocks in the map.
  async function getCodeBlock(roomId: string) {
    let savedCodeBlock = roomIdToCodeBlock.get(roomId);
    if (savedCodeBlock) {
      const { name, templateCode, solution } = savedCodeBlock;
      if (name && templateCode && solution) {
        return savedCodeBlock;
      }
    }

    // Code block is not saved, fetch the code block and save in map.
    const codeBlock = await getCodeBlockData(roomId);
    if (!codeBlock) {
      return;
    }
    const { name, templateCode } = codeBlock;
    if (!name || !templateCode) {
      return;
    }

    // Save code block.
    roomIdToCodeBlock.set(roomId, codeBlock);
    return codeBlock;
  }

  io.on('connection', (socket) => {
    socket.on('joinRoom', async (roomId: string) => {
      socket.join(roomId);

      const codeBlock = await getCodeBlock(roomId);
      socket.emit('initCodeBlock', codeBlock);

      let socketIdsInRoom: string[] | undefined = roomIdToSocketIds.get(roomId);
      if (!socketIdsInRoom) {
        console.log(roomIdToSocketIds);
        // Room is empty. Join room as a  mentor.
        socketIdToRoleRoom.set(socket.id, { role: 'mentor', roomId: roomId });
        socket.emit('role', 'Mentor');
        roomIdToSocketIds.set(roomId, [socket.id]);
        console.log(`Mentor ${socket.id} in ${roomId} connected.`);
      } else {
        // Room is not empty. Join room as a student.

        // room must not have duplicates.
        let existSocket = socketIdToRoleRoom.get(socket.id);
        if (!existSocket) {
          socketIdToRoleRoom.set(socket.id, {
            role: 'student',
            roomId: roomId,
          });
          socket.emit('role', 'Student');
          roomIdToSocketIds.get(roomId)?.push(socket.id);
          io.to(roomId).emit(
            'studentCount',
            roomIdToSocketIds.get(roomId)?.length
          );
          console.log(`Student ${socket.id} in ${roomId} connected. `);
        }
      }
    });

    socket.on('codeChange', async (codeChange) => {
      if (codeChange) {
        const { roomId, code } = codeChange;
        socket.to(roomId).emit('codeChange', code);

        const { solution } = (await getCodeBlock(roomId)) || {
          solution: null,
        };

        const isSolved = checkSolution(solution, code);

        if (isSolved) {
          console.log('Code got solved!');
        }
        // socket.in to include this socket also.
        socket.in(roomId).emit('codeSolved', isSolved);
      }
    });

    socket.on('disconnect', () => {
      // Get the socket role and room
      const roleRoom = socketIdToRoleRoom.get(socket.id);
      if (!roleRoom) {
        console.log(`Cannot find disconnected ${socket.id}`);
        return;
      }
      const { role, roomId } = roleRoom;

      if (role == 'mentor') {
        // clear the room
        roomIdToSocketIds.delete(roomId);
        // need to notify all sockets in room to go back to home page.
        console.log(`Mentor ${socket.id} in ${roomId} disconnected.`);
        socket.to(roomId).emit('mentorDisconnected');
      } else {
        // role is student
        // check if this is a single student exit, or because mentor leaves.
        let socketIdsInRoom = roomIdToSocketIds.get(roomId);

        if (socketIdsInRoom) {
          // room is not clear (mentor is still here). disconnect student
          roomIdToSocketIds.set(
            roomId,
            socketIdsInRoom.filter((id) => id !== socket.id)
          );
        }
        console.log(`Student ${socket.id} in ${roomId} disconnected.`);
        socket
          .to(roomId)
          .emit('studentCount', (socketIdsInRoom?.length || 1) - 1);
      }
      socket.leave(roomId);
    });
  });
};
