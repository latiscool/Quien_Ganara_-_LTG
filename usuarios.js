const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs'); //persistencia datos

//
const nuevoUsuario = async () => {
  try {
    //obtenemos del await (el modelo datos es un objeto con un arrelgo de objetos)
    const { data } = await axios.get('https://randomuser.me/api');
    //Mediante el metodo <then(), podemos ver el contenido del objeto y sus propiedades
    // .then((data) => {
    //   console.log(data);
    // });
    //**Mapeando la primera y unica posicion del arreglo de objeto [0] 
    const usuario = data.results[0];
    const nomUsr = usuario.name;
    //Creando Nuestra estructura de datos (objeto)
    const user = {
      id: uuidv4().slice(30), //recorto los primeros 30 caracteres
      correo: usuario.email,
      nombre: ` ${nomUsr.title} ${nomUsr.first} ${nomUsr.last}`,
      foto: usuario.picture.large,
      pais: usuario.location.country,
    };
    return user;
  } catch (e) {
    throw e;
  }
};

//Mediante el push llenammos el arreglo que esta en .json , con los datos obtenidos (de la consulta de la API) de nuevoUsuario()
const guardarUsuario = (usuario) => {
  const usuariosJSON = JSON.parse(fs.readFileSync('usuarios.json', 'utf-8'));
  //accediendo a la propiedad usuario y llenamos con push
  usuariosJSON.usuarios.push(usuario);
  //sobre escribiendo .json el cual adquiere los nuevo usuarios
  fs.writeFileSync('usuarios.json', JSON.stringify(usuariosJSON));
};
//Archvi externo del Sever
//Se exporta el objetengo que este dentro
module.exports = { nuevoUsuario, guardarUsuario };
