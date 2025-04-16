/**
 * Modelo de dados para construção das coleções("tabelas")
 * clientes 
 */

//Importação dos recursos do framework mongoose
const { model, Schema } = require('mongoose')

//Criação da estrutura da coleção Clientes
const osSchema = new Schema({

    servicooS: {
        type: String
    },
    modelooS: {
        type: String
    },
    placaoS: {
        type: String
    },
    prazooS: {
        type: String
    },
    statusoS: {
        type: String
    },
    valoroS: {
        type: String
    }

}, {versionKey: false
}) //Não versionar os dados armazenadas

//Exportar para o main o modelo de dados
//Clientes será o nome da coleção

module.exports = model('OS', osSchema)