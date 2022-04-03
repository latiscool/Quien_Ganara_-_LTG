const http = require('http');
const fs = require('fs');
const url = require('url');
const { nuevoUsuario, guardarUsuario } = require('./usuarios');
const { send } = require('./mailer');
const PORT = 3000;
const host = 'localhost';

const requestListener = (req, res) => {
  if (req.url == '/' && req.method == 'GET') {
    res.setHeader('content-type', 'text/html');
    res.end(fs.readFileSync('index.html', 'utf-8'));
  }
  //RUTA USUARIOS - POST (Creamos el nommbre del usuario/participante en el archivo usuarios.js)
  //Metodo POST, esta ruta ejecuta una funcion que emita instruccion
  //Para hacer  una consulta asincrona a traves de axios en la api random.user
  //Por lo cual, pasamos a programacion modular (usuario.js)
  if (req.url.startsWith('/usuario') && req.method == 'POST') {
    nuevoUsuario()
      .then(async (usuario) => {
        //En Caso de exito la funcion async, usamos la funcions guardarUsuario
        // y le pasamos el argumento el usuario nuevo (el objeto completo con las propiedades, que traee el then())
        guardarUsuario(usuario);
      res.end(JSON.stringify(usuario));
      })
      .catch((e) => {
        res.statusCode = 500;
       res.end();
        console.log('Error en el registro de un usuario random ', e);
      });
  }
  //RUTA PARTICIPANTE - GET (Para visualizar el nombre del participante en html)
  if (req.url.startsWith('/usuarios') && req.method == 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(fs.readFileSync('usuarios.json', 'utf-8'));
  }

  //RUTA PREMIO
  if (req.url.startsWith('/premio') && req.method == 'GET') {
    res.setHeader('content-type', 'application/json');
    res.end(fs.readFileSync('premio.json', 'utf-8'));
  }

  //RUTA CAMBIAR PREMIO (PUT)
  if (req.url.startsWith('/premio') && req.method == 'PUT') {
    // Esta recibiendo un payload, conjunto de datos (nombre e img url)
    let body = '';
    req.on('data', (chunk) => {
      body = chunk.toString();
    });

    req.on('end', () => {
      //Se Parsea porque llega un String y se convierte un Objeto JS (para extraer nombre e img url)
      const nuevoPremio = JSON.parse(body);
      //writeFile metodo ASINCRONO
      // archivojson   ,            contenido        ,  CB
      fs.writeFile('premio.json', JSON.stringify(nuevoPremio), (err) => {
        err ? console.log('oh no!...!!') : console.log('OK');
        res.end('Premio editado con exito');
      });
    });
  }

  //RUTA GANADOR (GET)
  // **** //Logica de Correo se inserta en la logica del Ganador
  if (req.url.startsWith('/ganador') && req.method == 'GET') {
    //Logica de Correo se inserta en la logica del Ganador
    const premio = JSON.parse(fs.readFileSync('premio.json', 'utf-8')).nombre;
    //Guardar en varable usuarios el contenido del archivo.json
    const usuarios = JSON.parse(
      fs.readFileSync('usuarios.json', 'utf-8')
    ).usuarios;
    //Obtener correo de los participantes
    const correos = usuarios.map((u) => u.correo);
    const total = usuarios.length;
    const ganador = usuarios[Math.floor(Math.random() * (total - 0) + 0)];
    //Ejecutar Correo y pasar los argumento a la funcion
    //Siendo funcion Asincrona devolvera una promesa, por lo cual usamos then()
    send(ganador, correos, premio)
      .then(() => {
        //Caso de exito de promesa, se entrega a la app el ganado json.stringify
        res.end(JSON.stringify(ganador));
      })
      .catch((e) => {
        res.statusCode = 500;
        res.end();
        console.log(' Error en el envio de correos de electronicos', e);
      });

    res.end(JSON.stringify(ganador));
  }
};

const server = http.createServer(requestListener);

server.listen(PORT, host, () => {
  console.log('Servidor se esta ejecutando');
});
