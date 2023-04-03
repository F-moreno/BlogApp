const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Categoria")
const Categoria = mongoose.model("categorias") 


router.get('/', (req,res) => {
    res.render("admin/index")
})

router.get('/posts', (req,res) => {
    res.send("Post ADM")
})

router.get('/categorias', (req,res) => {
    Categoria.find().sort({date:'desc'}).lean().then((categorias)=>{
        res.render("admin/categorias",{categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao listar categorias")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', (req,res) => {
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', (req,res) => {
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

router.get("/categorias/edit/:id", (req,res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias",{categoria: categoria})
    }).catch((err) =>{
        req.flash("error_msg","Categoria não encontrada.")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit/:id", (req,res) =>{
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

        Categoria.findOneAndUpdate({_id:req.params.id},{
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

router.post("/categorias/deletar/:id",(req,res)=>{
    Categoria.findOneAndRemove({_id: req.params.id}).then(()=>{
        req.flash("success_msg","Categoria deletada")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg","Erro ao deletar categoria.")
        res.redirect("/admin/categorias")
    })
})

module.exports = router