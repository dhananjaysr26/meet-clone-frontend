import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
var _userConnections = [];

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Connection:", socket.id);

    socket.on("userconnect", (data) => {
      console.log("userconnect", data.dsiplayName, data.meetingid);

      var other_users = _userConnections.filter(
        (p) => p.meeting_id == data.meetingid
      );

      _userConnections.push({
        connectionId: socket.id,
        user_id: data.dsiplayName,
        meeting_id: data.meetingid,
      });
      var userCount = _userConnections.length;
      console.log({ userCount, _userConnections, other_users });
      other_users.forEach((v) => {
        console.log({ v });
        socket.to(v.connectionId).emit("informAboutNewConnection", {
          other_user_id: data.dsiplayName,
          connId: socket.id,
          userNumber: userCount,
        });
      });

      socket.emit("userconnected", other_users);
      //return other_users;
    });

    socket.on("exchangeSDP", (data) => {
      socket.to(data.to_connid).emit("exchangeSDP", {
        message: data.message,
        from_connid: socket.id,
      });
    });

    socket.on("reset", (data) => {
      var userObj = _userConnections.find((p) => p.connectionId == socket.id);
      if (userObj) {
        var meetingid = userObj.meeting_id;
        var list = _userConnections.filter((p) => p.meeting_id == meetingid);
        _userConnections = _userConnections.filter(
          (p) => p.meeting_id != meetingid
        );

        list.forEach((v) => {
          socket.to(v.connectionId).emit("reset");
        });

        socket.emit("reset");
      }
    });

    socket.on("sendMessage", (msg) => {
      console.log(msg);
      var userObj = _userConnections.find((p) => p.connectionId == socket.id);
      if (userObj) {
        var meetingid = userObj.meeting_id;
        var from = userObj.user_id;

        var list = _userConnections.filter((p) => p.meeting_id == meetingid);
        console.log(list);

        list.forEach((v) => {
          socket.to(v.connectionId).emit("showChatMessage", {
            from: from,
            message: msg,
            time: getCurrDateTime(),
          });
        });

        socket.emit("showChatMessage", {
          from: from,
          message: msg,
          time: getCurrDateTime(),
        });
      }
    });

    socket.on("fileTransferToOther", function (msg) {
      console.log(msg);
      var userObj = _userConnections.find((p) => p.connectionId == socket.id);
      if (userObj) {
        var meetingid = userObj.meeting_id;
        var from = userObj.user_id;

        var list = _userConnections.filter((p) => p.meeting_id == meetingid);
        console.log(list);

        list.forEach((v) => {
          socket.to(v.connectionId).emit("showFileMessage", {
            from: from,
            username: msg.username,
            meetingid: msg.meetingid,
            FileePath: msg.FileePath,
            fileeName: msg.fileeName,
            time: getCurrDateTime(),
          });
        });
      }
    });
    socket.on("disconnect", function () {
      console.log("Got disconnect!");

      var userObj = _userConnections.find((p) => p.connectionId == socket.id);
      if (userObj) {
        var meetingid = userObj.meeting_id;

        _userConnections = _userConnections.filter(
          (p) => p.connectionId != socket.id
        );
        var list = _userConnections.filter((p) => p.meeting_id == meetingid);

        list.forEach((v) => {
          var userCou = _userConnections.length;
          socket.to(v.connectionId).emit("informAboutConnectionEnd", {
            connId: socket.id,
            userCoun: userCou,
          });
        });
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
