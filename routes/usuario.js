const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/registro", (rea,res)=>{
    res.render("usuarios/registro")
})

router.post("/registro", (req,res)=>{
    const data = req.body
    var erros = []

    if(!data.nome || typeof data.nome == undefined || data.nome == null){
        erros.push({texto: "Nome inválido."})
    }
    if(!data.email || typeof data.email == undefined || data.email == null){
        erros.push({texto: "Email inválido."})
    }
    if(!data.senha || typeof data.senha == undefined || data.senha == null){
        erros.push({texto: "Senha inválida."})
    }
    if(data.senha.length < 4){
        erros.push({texto: "Senha muito curta."})
    }
    if(data.senha != data.senha2){
        erros.push({texto: "Senhas diferentes."})
    }
    if(erros.length > 0){
        res.render("usuarios/registro",{erros:erros})
    }else{
        Usuario.findOne({email: data.email}).then((usuario)=>{
            if(usuario){
                req.flash("error_msg", "E-mail já cadastrado")
                res.render("usuarios/registro")
            }else{
                const novoUsuario = new Usuario({
                    nome: data.nome,
                    email: data.email,
                    senha: data.senha
                })

                bcrypt.genSalt(10,(erro,salt)=>{
                    bcrypt.hash(novoUsuario.senha,salt,(erro,hash)=>{
                        if(erro){
                            req.flash("error_msg","Erro ao registrar usuário")
                            res.redirect("/")
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(()=>{
                            req.flash("success_msg", "Usuário registrado.")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao registrar usuário.")
                            res.redirect("usuarios/registro")
                            
                        })
                    })
                })
            }
        })
    }
})


router.get("/login",(req,res)=>{
    res.render("usuarios/login")
})

router.post("/login",(req,res,next)=>{

    passport.authenticate("local",{
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req,res,next)

})


router.get("/logout",(req, res, next)=>{
    req.logout(()=>{ 
        req.flash('success_msg', "Deslogado com sucesso!")
        res.redirect("/")
    })
   
})


module.exports = router