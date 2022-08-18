import express from 'express'
import routes from './router/index.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { Server } from 'socket.io'
import { chatDAO } from './DAO/chatDAO.js';
import { normalizedMessages } from './utils/normalize.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as LocalStrategy } from "passport-local";
import { User } from './models/userModel.js';
// import { registerStrategy, loginStrategy } from './utils/strategies.js';
import mongoose from 'mongoose';
import { hashPassword, isValidPassword } from './utils/bcryptPasswords.js'

const app = express()

//conexion a mongoAtlas
await mongoose.connect('mongodb+srv://lucas:lucas1234@cluster0.oxbotfj.mongodb.net/?retryWrites=true&w=majority').then(console.log("Conectado a la base Mongo"))

const expressServer = app.listen(8080, () => console.log('Server escuchando en el puerto 8080'))

const io = new Server(expressServer)

const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname,'./views')));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'ejs')

//Configuracion session
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };
app.use(cookieParser());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://lucas:lucas1234@cluster0.oxbotfj.mongodb.net/?retryWrites=true&w=majority",
      mongoOptions,
    }),
    secret: "coderhouse",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 120000,
    },
  })
)


//middleware de aplicacion passport
app.use(passport.initialize());
app.use(passport.session());

//------------------------------------------------
// Estrategia de registro
const registerStrategy = new LocalStrategy(
  { passReqToCallback: true },
  async (req, email, password, done) => {
      try {
          console.log("---------------------CONSOLE LOG DESDE ESTRATEGIA")
          const existingUser = await User.findOne({ email })

          if(existingUser){
              return done(null, null)
          }

          const newUser = {
              email: email,
              password: hashPassword(password),
              firstName: req.body.firstName,
              lastName: req.body.lastName
          }
          console.log("++++++++++++++++++NEWUSER",newUser)
          const createdUser = await User.create(newUser)
          done(null, createdUser)

      } catch (error) {
          console.log("Error registrando usuario", error)
          done("Error en registro", null)
      }
  }
)

// Estrategia de logeo
const loginStrategy = new LocalStrategy(
  async (email, password, done) => {
      try {
          const user = await User.findOne({ email })
          console.log("------------------------USER", user)
          if(!user || !isValidPassword(password, user.password)){
              return done(null, null)
          }

      } catch (error) {
          console.log("Error login", err);
          done("Error login", null);
      }
  }
)
//------------------------------------------------

passport.use("register", registerStrategy);
passport.use("login", loginStrategy);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, done);
});

//Aca vienen las interacciones de io: servidor<-->cliente
io.on('connection', async socket =>  {
    console.log(`Se conecto el cliente con id: ${socket.id}`)
    // socket.emit('server:products', await contenedor.getAll())

    //recibo los mensajes de la base altasMongo y los guardo en una variable, normalizo y envio al socket
    const messagesFromMongo = await chatDAO.getAll()
    const normalizedChat = normalizedMessages(messagesFromMongo)

    //Envio mensajes normalizados al front
    socket.emit('server:mensajes', normalizedChat)

    //Evento de carga de nuevo producto
    // socket.on('client:newProduct', async (newProductInfo) => {
    //     await contenedor.postProduct(newProductInfo)
    //     io.emit('server:products', await contenedor.getAll())
    // })
    
    //Evento de nuevo mensaje
    socket.on('client:message', async (messageInfo) => {
        await chatDAO.postMessage(messageInfo)

        //recibo los mensajes de la base altasMongo y los guardo en una variable, normalizo y envio al socket
        const messagesFromMongo = await chatDAO.getAll()
        const normalizedChat = normalizedMessages(messagesFromMongo)
        io.emit('server:mensajes', normalizedChat)
    })
})

app.use('/api', routes)
