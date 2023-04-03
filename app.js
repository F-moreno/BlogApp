// Modulos
    
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require("body-parser")
    const app = express()
    const adminRoutes = require("./routes/admin")
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require ("connect-flash")

// Configuração
    // Sessao
        app.use(session({
            secret: "chave",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg") 
            res.locals.error_msg = req.flash("error_msg") 
            next()
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout:'main'}))
        app.set('view engine', 'handlebars')
        app.set('views', './views')
       
    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://127.0.0.1/blogapp").then(()=>{
            console.log("Banco de dados Conectado!")
        }).catch((err)=>{
            console.log("Erro ao Conectar Banco de Dados: "+err)
        })
    // Public
        app.use(express.static(path.join(__dirname,"public")))

// Rotas
        app.use('/admin', adminRoutes)

// Outros
    const PORT = 8080
    app.listen(PORT,() => {
        console.log("Servidor rodando em: http://localhost:"+PORT)
    })