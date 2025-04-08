/**
 * Modelo de dados para construção das coleções ("Tabelas")
 * Clientes
 */

// importação dos recurso do framework mongoose
const { model, Schema } = require('mongoose')

// criação da estrutura da coleção clientes
const osSchema = new Schema({
    servicoOs: {
        type: String
    },

    prazoOs: {
        type: String
    },

    statusOs: {
        type: String
    },

    valorOs: {
        type: String,
    },

}, { versionkey: false }) // não versionar os dados armazenados

// exportar para o main o modelo de dados
// OBS: Clientes será o nome da coleçãoF

module.exports = model('Os', osSchema)