const { Server } = require("socket.io");

const io = new Server(process.env.PORT || 8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("room:join", (data) => {
    const { email, room } = data;

    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    io.to(room).emit("user:joined", { email, id: socket.id });

    socket.join(room);
    console.log(`${email} joined the room - ${room}`);

    io.to(socket.id).emit("room:join", { room });
  });

  socket.on("user:call", (data) => {
    const { to, offer } = data;
    const email = socketIdToEmailMap.get(socket.id);

    io.to(to).emit("incoming:call", { email, from: socket.id, offer });
  });

  socket.on("call:accepted", (data) => {
    const { to, ans } = data;

    io.to(to).emit("call:accepted", { ans });
  });

  socket.on("peer:nego:needed", (data) => {
    const { offer, to } = data;

    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", (data) => {
    const { to, ans } = data;

    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("final:send:streams", (data) => {
    const { to } = data;

    io.to(to).emit("final:send:streams");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});
