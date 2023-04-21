const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Categoria")
require("../models/Postagem")
require("../models/Usuario")
const Categoria = mongoose.model("categorias") 
const Postagem = mongoose.model("postagens")
const Usuario = mongoose.model("usuarios")
const {eAdmin} = require("../helpers/eAdmin")


router.get('/', eAdmin,(req,res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin,(req,res) => {
    res.send("Post ADM")
})

router.get('/categorias', eAdmin,(req,res) => {
    Categoria.find().sort({date:'desc'}).lean().then((categorias)=>{
        res.render("admin/categorias",{categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao listar categorias")
        res.redirect("/admin")
    })
})

router.get('/usuarios', eAdmin,(req,res) => {
    Usuario.find().lean().then((usuarios)=>{
        res.render("admin/usuarios",{usuarios: usuarios})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao listar usuarios")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', eAdmin,(req,res) => {
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', eAdmin,(req,res) => {
    const data = req.body
    var erros = []
    
    if(!data.nome || typeof data.nome == undefined || data.nome == null){
        erros.push({texto:"Nome inválido."})
    }else if(data.nome.length < 3){
        erros.push({texto: "Nome deve conter pelomenos 3 caracteres."})
    }
    if(!data.slug || typeof data.slug == undefined || data.slug  == null){
        erros.push({texto:"Slug inválido."})
    }
    
    if(erros.length > 0){
        res.render("admin/addcategorias",{erros: erros})
    }else{
        const novaCategoria = {
            nome: data.nome,
            slug: data.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg","Nova Categoria criada.")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            erros.push({texto: err})
            req.flash("error_msg","Erro ao criar nova categoria, tente novamente.")
            res.redirect("/admin/addCategorias",{erros: erros})
        })
    }

    
})

router.get("/categorias/edit/:id", eAdmin,(req,res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias",{categoria: categoria})
    }).catch((err) =>{
        req.flash("error_msg","Categoria não encontrada.")
        res.redirect("/admin/categorias")
    })
})

router.get("/usuarios/edit/:id", eAdmin,(req,res) => {
        Usuario.findOne({_id:req.params.id}).lean().then((usuario)=>{
        res.render("admin/editusuario",{usuario: usuario})
    }).catch((err) =>{
        req.flash("error_msg","Categoria não encontrada.")
        res.redirect("/admin/usuarios")
    })
})

router.post("/categorias/edit/", eAdmin,(req,res) =>{
    const data = req.body
    var erros = []
    
    if(!data.nome || typeof data.nome == undefined || data.nome == null){
        erros.push({texto:"Nome inválido."})
    }else if(data.nome.length < 3){
        erros.push({texto: "Nome deve conter pelomenos 3 caracteres."})
    }
    if(!data.slug || typeof data.slug == undefined || data.slug  == null){
        erros.push({texto:"Slug inválido."})
    }
    
    if(erros.length > 0){
        res.render("admin/addcategorias",{erros: erros})
    }else{
        
        Categoria.findOneAndUpdate({_id:data.id},{
            nome : data.nome,
            slug : data.slug
        }).then((categoria)=>{
                req.flash("success_msg", "Categoria editada.")
                res.redirect("/admin/categorias")
        }).catch((err)=>{
                req.flash("error_msg", "Erro interno ao editar categoria.")
                res.redirect("/admin/categorias")
        })       
    }
})

router.post("/categorias/deletar/:id",eAdmin,(req,res)=>{
    Postagem.findOne({categoria:req.params.id}).then((postagem)=>{
        if(postagem){
            req.flash("error_msg","Existem postagens dependentes desta cateoria.")
            req.flash("error_msg","Não foi possivel deletar categoria.")
        }else{
            Categoria.findOneAndRemove({_id: req.params.id}).then(()=>{
                req.flash("success_msg","Categoria deletada")
            }).catch((err)=>{
                req.flash("error_msg","Erro ao deletar categoria.")
            })
        }
        res.redirect("/admin/categorias")
    })
})

router.post("/usuarios/edit/", eAdmin,(req,res) =>{
    const data = req.body
    var erros = []
    
    if(!data.nome || typeof data.nome == undefined || data.nome == null){
        erros.push({texto:"Nome inválido."})
    }else if(data.nome.length < 3){
        erros.push({texto: "Nome deve conter pelomenos 3 caracteres."})
    }
    if(!data.email || typeof data.email == undefined || data.email  == null){
        erros.push({texto:"email inválido."})
    }
    
    if(erros.length > 0){
        res.render("admin/usuarios",{erros: erros})
    }else{
        
        Usuario.findOneAndUpdate({_id:data.id},{
            nome : data.nome,
            email : data.email,
            eAdmin: data.eAdmin?1:0
        }).then((usuario)=>{
                req.flash("success_msg", "Usuario editada.")
                res.redirect("/admin/usuarios")
        }).catch((err)=>{
                req.flash("error_msg", "Erro interno ao editar usuario.")
                res.redirect("/admin/usuarios")
        })       
    }
})

router.get("/usuarios/deletar/:id",eAdmin,(req,res)=>{
    Usuario.findOne({usuario:req.params.id}).then((usuario)=>{
        if(usuario){
            req.flash("error_msg","Não foi possivel deletar usuário.")
        }else{
            Usuario.findOneAndRemove({_id: req.params.id}).then(()=>{
                req.flash("success_msg","Usuário deletado")
            }).catch((err)=>{
                req.flash("error_msg","Erro ao deletar usuario.")
            })
        }
        res.redirect("/admin/usuarios")
    })
})

router.get("/postagens", eAdmin,(req,res)=>{
    Postagem.find().populate("categoria").lean().sort({data:"desc"}).then((postagens)=>{
        res.render("admin/postagens",{postagens:postagens})
    }).catch((err)=>{
        req.flash("error_msg","Erro ao listar postagens "+err)
        res.redirect("/admin")
    })
    
})

router.get("/postagens/add",eAdmin,(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem",{categorias : categorias})
    }).catch((err)=>{
        req.flash("error_msg","Erro ao carregar categorias")
    })
    
})

router.post("/postagens/nova",eAdmin,(req,res)=>{
    var erros = []
    var data = req.body
    if(data.categoria == "0"){
        erros.push({text:"Categoria inválida"})
    }

    if(erros.length>0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: data.titulo,
            descricao: data.descricao,
            conteudo: data.conteudo,
            categoria: data.categoria,
            slug: data.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg","Erro ao adicionar postagem")
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id",eAdmin,(req,res)=>{

    Postagem.findOne({_id:req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens",{categorias:categorias, postagem:postagem})
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao listar categorias.")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg","Erro ao carregar formulario de edição")
        res.redirect("/admin/postagens")
    })


})

router.post('/postagens/edit',eAdmin,(req,res)=>{
    const data = req.body
    Postagem.findOneAndUpdate({_id: data.id},{
        titulo : data.titulo,
        ug : data.slug,
        descricao : data.descricao,
        conteudo : data.conteudo,
        categoria : data.categoria
    }).then(()=>{
        req.flash("success_msg", "Categoria editada.")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao editar postagem."+err) 
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id",eAdmin,(req,res)=>{
    Postagem.findByIdAndRemove({_id:req.params.id}).then(()=>{
        req.flash("success_msg","Postagem deletada.")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg","Erro ao deletar postagem.")
        res.redirect("/admin/postagens")
    })
})

module.exports = router