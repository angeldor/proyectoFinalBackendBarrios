import errorDictionary from "./errorDictionary.js";

const errorHandler = (err, req, res, next) => {
    const errorKey = err.message;
    const errorDetails = errorDictionary[errorKey];

    if(errorDetails){
        res.status(errorDetails.status).json({error: errorDetails.message});
    } else{
        console.error('Error desconocido: ', err);
        res.status(500).json({error: 'Error interno del servidor' });
    };
};

export default errorHandler;