const express = require("express")
const bodyParser = require("body-parser")
const { Server } = require("socket.io")

const io = new Server({
    cors: true
})
const app = express()

app.use(bodyParser.json())

const userIdToSocketMapping = new Map()
const socketMappingToUserId = new Map()

io.on("connection", (socket) => {

    console.log("New Connection Socket");

    socket.on("join-room", (data) => {

        userIdToSocketMapping.set(data.userID, socket.id)
        socketMappingToUserId.set(socket.id, data.userID)
        socket.join("room1")
    })

    socket.on("call-user", (data) => {
        console.log("call-user", data);
        const socketId = userIdToSocketMapping.get(data.userID)
        const fromUser = socketMappingToUserId.get(socketId)
        socket.to(socketId).emit("incomming-call", { from: data.from, offer: data.offer })
        console.log("incomming-call", { from: data.from, offer: data.offer });

    })

    socket.on("call-accepted", (data) => {
        console.log("call-accepted", data);
        const { userID, ans } = data
        const socketId = userIdToSocketMapping.get(userID)
        socket.to(socketId).emit("call-accepted", { userID, ans })
        console.log("call-accepted", { userID, ans });

    })

})

app.listen(8000, () => console.log("Server listening on 8000"))
io.listen(8001)