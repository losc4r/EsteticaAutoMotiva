
const { model, Schema } = require('mongoose')


const osSchema = new Schema({
    
    dataEntrada: {
        type: Date,
        default: Date.now
    },

    idCliente: {
        type: String
    },

    nome: {
        type: String
    },

    cpf: {
        type: String
    },

    telefone: {
        type: String
    },
    
    marca: {
        type: String
    },
    modelo: {
        type: String
    },
    placa: {
        type: String
    },
    prazo: {
        type: String
    },
    funcionario: {
        type: String
    },
    stats: {
        type: String
    },
    servico: {
        type: String
    },
    observacoes: {
        type: String
    },
    valor: {
        type: String
    }

}, {versionKey: false
}) 

module.exports = model('OS', osSchema)