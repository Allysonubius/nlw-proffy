import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());

app.use(express.json());

//GET: Buscar ou listar uma informação
//POST: Criar alguma nova informação
//PUT: Atualizar uma informação existente
//DELETE: Deletar uma informação existente

//Corpo (Request Body): Dados para criação ou atualização de um registro
//Route Params: Identificar qual recurso eu quero atualizar ou Deletar
//Query Params: Paginação, filtros e ordenação

app.use(routes);

//localhost:3333

app.listen(3333);