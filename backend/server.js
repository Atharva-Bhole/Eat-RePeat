const app = require('./app');
const connectDatabase = require('./config/database')
const dotenv = require('dotenv');

// Handling Uncaught Exceptions
// process.on("uncaughtException", err=>{
//     console.log(`Error: ${err.message}`);
//     console.log(`Shutting down server due to uncaught exception`);
//     process.exit(1);
// })

// Config
dotenv.config({path: "backend/config/config.env"});

// Connecting to DB
connectDatabase();


// Running the server
const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
    
});


// Unhandled Promise Rejection
process.on("unhandledRejection", err=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting Down the server due to unhandled Promise Rejection `);

    server.close(()=>{
        process.exit(1);
    });
});