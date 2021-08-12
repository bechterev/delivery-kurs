const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const http = require("http");
const socketIO = require("socket.io");
const AdRouter = require('./Routes/ad');
const UserRouter = require('./Routes/user');
const ChatRouter = require('./Routes/chat');
const Chat = require('./models/chat');
const { v4: uuidv4 } = require("uuid");
const Message = require("./models/message");


function verify(username, password, done) {
  User.findOne({ login: username }, function (err, user) {
    if (user === null) {
      return done(null, false, { message: `user not found` });
    }
    if (bcrypt.compareSync(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: `login or password failed` });
    }
  });
}

const options = {
  usernameField: "login",
  passwordField: "pass",
  passReqToCallback: false,
};

//  Добавление стратегии для использования
passport.use("local", new LocalStrategy(options, verify));

// Конфигурирование Passport для сохранения пользователя в сессии
passport.serializeUser(function (user, cb) {
  console.log("ser", user.id);
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  console.log(id, "deser");
  User.findById(id).then((data) => {
    if (data === null) return cb(null);
    else return cb(null, id);
  });
});

const app = express();
const server = http.Server(app);
const io = socketIO(server);
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);
const sessionMiddleware = session({
  secret: "user",
  resave: false,
  saveUninitialized: false,
});
app.use(sessionMiddleware);
app.use(cookieParser());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
});
app.use(express.static("public/img"));
app.use("/api/advertisements", AdRouter);
app.use("/api/user", UserRouter);
app.use("/api/chat", ChatRouter);
app.use(cors());

io.on("connection", (socket) => {
  const { id } = socket;
  
  socket.on("getHistory", async (data) => {
    const users = data;
    const chat = await Chat.find(users);
    socket.emit('chatHistory',chat);
  });

  socket.on("sendMessage",(data)=>{
      const {receiver, text} = data;
      const author = socket.request.session.passport.user;
      const chat = await Chat.find([author, receiver]);
      const message = new Message({
          id:uuidv4(),
          author: author,
          sentAt: Date.now(),
          text: text
      })
      if(chat===null || chat===undefined){
            message.save((err)=>{
            if (err) return handleError(err);
            chat = new Chat({
                id: uuidv4(),
                users:[author, receiver],
                createAt: Date.now(),
              })
            chat.save((err)=>{
                if (err) return handleError(err);
            })
          })
      }
      else{
          message.save((err)=>{
              chat.message.push(message.id);
              chat.save()
          })
      }
      socket.emit("newMessage",{receiver:receiver,message:message.text});
  })
  socket.on("disconnect", (socket) => {
    console.log(`Socket disconnection ${id}`);
  });
});


const PORT = process.env.HTTP_PORT || 3000;

const UserDB = process.env.DB_USERNAME || 'root';
const PasswordDB = process.env.DB_PASSWORD || 'qwerty12345';
const NameDB = process.env.DB_NAME || 'library_db';
const HostDB = process.env.DB_HOST || 'mongodb://mongodb:27017/';
async function init() {
  try {
    await mongoose.connect(HostDB,{
      user:UserDB,
      pass:PasswordDB,
      dbName:NameDB,
      useNewUrlParser: true,
      useUnifiedTopology: true,

    })
    server.listen(PORT, () => {
      console.log(`app start from port ${PORT}`)
    });
  }
  catch (err) {
    
    console.log(err);

  }
}
init()