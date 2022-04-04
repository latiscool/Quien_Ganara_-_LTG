const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PWD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Ha ocurrido una falla: ' + error);
  } else {
    console.log(' El servidor esta listo para recibir nuestros mensajes');
  }
});

const send = async (ganador, correos, premio) => {
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: [process.env.EMAIL_USER].concat(correos),
    subject: `¡${ganador.nombre} ha ganado`,
    html: ` <h3>Anuncio: El ganador de ¿Quien ganara? fue ${ganador.nombre} y ha ganado ${premio}.</br> Gracias a todos por participar </h3>`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
};

//send({ nombre: 'Ganador de Prueba' }, [], 'Premio de prueba');

module.exports = { send };
