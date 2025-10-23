// Netlify Function para manejar movimientos
exports.handler = async function(event, context) {
    // Esta función se puede usar si quieres añadir backend
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Función de movimientos" })
    };
};