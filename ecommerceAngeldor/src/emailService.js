import nodemailer from 'nodemailer';

// Configurar transporter 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'cuentapruebabackend@gmail.com',
        pass: 'hola.hello.hallo.'
    },
});

// Función para enviar correo electrónico
async function sendMail(to, subject, text, html) {
    try {
        // Configurar el correo electrónico
        const mailOptions = {
            from: 'cuentapruebabackend@gmail.com',// Dirección de correo del remitente
            to, // Dirección de correo del destinatario
            subject, // Asunto del correo
            text, // Texto del correo (opcional)
            html, // Contenido HTML del correo (opcional)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo electrónico enviado: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
        throw error;
    }
};

export { sendMail };