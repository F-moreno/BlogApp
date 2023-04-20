// Modulos
    
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require("body-parser")
    const app = express()
    const adminRoutes = require("./routes/admin")
    const usuariosRoutes = require("./routes/usuario")
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require ("connect-flash")
    const passport = require('passport')
    require("./models/Postagem")
    require("./models/Categoria")
    const Postagem = mongoose.model("postagens")
    const Categoria = mongoose.model("categorias")
    require("./config/auth")(passport)
    const {logado} = require("./helpers/logado")

// Configuração
    // Sessao
        app.use(session({
            secret: "chave",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg") 
            res.locals.error_msg = req.flash("error_msg") 
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
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
    app.get('/',(req,res)=>{
        Postagem.find().populate("categoria").lean().sort({data:"desc"}).then((postagens) => {
            res.render("index",{postagens: postagens})    
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao exibir postagens")
            res.redirect("/404")
        })

    })
    app.get("/postagem/:slug",logado,(req,res)=>{
        Postagem.findOne({slug:req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                res.render("postagem/index",{postagem:postagem})
            }else{
                req.flash("error_msg","Postagem não encontrada.")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg","Erro ao buscar postagem.")
            res.redirect("/")
        })
        
    })

    app.get("/categorias", (req,res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("categoria/index",{categorias:categorias})
        }).catch((err)=>{
            req.flash("error_msg","Erro ao buscar categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req,res)=>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render("categoria/postagens",{postagens:postagens,categoria:categoria})
                }).catch((err)=>{
                    req.flash("error_msg","Erro ao buscar postagens.")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg","Categoria inexistente.")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg","Erro ao buscar categoria")
            res.redirect("/")
        })

    })

    app.get("/404",(req,res)=>{
        res.send("Erro 404.")
    })

    app.use('/admin', adminRoutes)
    app.use('/usuarios', usuariosRoutes)

// Outros
    const PORT = process.env.PORT || 8080
    app.listen(PORT,() => {
        console.log("Servidor rodando em: http://localhost:"+PORT)
    })