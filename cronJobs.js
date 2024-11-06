// cronJobs.js
const cron = require('node-cron');

cron.schedule('0 */3 * * *', () => {
    console.log('Tarea ejecutada cada 3 horas');
    // Logica de funciones?
});

cron.schedule('* * * * *', () => {
    console.log('Tarea ejecutada cada minuto :)');//funciona!!
});

