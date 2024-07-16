const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("banco_de_dados.sqlite");

// Middleware para parsear dados de formulário
app.use(bodyParser.urlencoded({ extended: false }));

// Servir arquivos estáticos da pasta 'src'
app.use(express.static(path.join(__dirname, "src")));

// Criação da tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS contatos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL
    )
  `);
});

// Rota para lidar com o formulário de contato
app.post("/submit", (req, res) => {
  const { name, email, message } = req.body;
  db.run(
    "INSERT INTO contatos (name, email, message) VALUES (?, ?, ?)",
    [name, email, message],
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/contato.html"); // Redireciona para a página de contato após o envio
    }
  );
});

// Rota para visualizar contatos
app.get("/contatos", (req, res) => {
  db.all("SELECT * FROM contatos", (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contatos</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <h1>Lista de Contatos</h1>
        <table border="1">
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Mensagem</th>
          </tr>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>${row.id}</td>
                  <td>${row.name}</td>
                  <td>${row.email}</td>
                  <td>${row.message}</td>
                </tr>
              `
            )
            .join("")}
        </table>
        <br>
        <a href="/contato.html">Voltar para o formulário de contato</a>
      </body>
      </html>
    `);
  });
});

// Rota para servir contato.html diretamente
app.get("/contato.html", (req, res) => {
  res.sendFile(path.join(__dirname, "contato.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
