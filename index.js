const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

let users = []

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  console.log('user connected', socket.id)

  socket.on('user entered', (username) => {
    users.push({ id: socket.id, username: username })
    io.emit('user entered', username)
  })

  socket.on('chat message', (msg) => {
    if (msg.message.indexOf(': ') !== -1) {
      const from = msg.message.split(': ')

      const userToSend = users.filter((user) => {
        if (user.username === from[0]) {
          return user
        }
      })

      if (!userToSend[0]) {
        return
      }

      io.to(userToSend[0].id).emit('chat message', {
        username: '(private) ' + msg.username,
        message: from[1],
      })
      return
    }

    io.emit('chat message', msg)
  })
})

io.on('disconnect', (socket) => {
  console.log('user disconnected')
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})
