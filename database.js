

const mongoose = require('mongoose')



const url = 'mongodb://localhost:27017/'



let conectado = false


const conectar = async () => {

    if (!conectado) {

        try {
            await mongoose.connect(url) 
            conectado = true 
            console.log("MongoDB conectado")
            return true 
        } catch (erro) {
            
            if (error.code = 8000) {
                console.log("Erro de autenticação")
            } else {
                console.log(error)
                return false
            }
        }
    }
}


const desconectar = async () => {
    
    if (conectado) {
        
        try {
            await mongoose.disconnect(url)
            conectado = false 
            console.log("MongoDB desconectado")
            return true 
        } catch (erro) {
            console.log(error)
            return false
        }
    }
}


module.exports = { conectar, desconectar }
