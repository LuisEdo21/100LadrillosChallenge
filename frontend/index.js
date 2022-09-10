const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser= require('body-parser');

const port = 3000

//Declaración de rutas
const routes = require('./routes');

//Configuración inicial
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
	credentials: true,
	origin: 'http://127.0.0.1:3001/api'
}));
app.set('appName', '100 Ladrillos Challenge');
app.set('views', __dirname + '/views');
app.set(__dirname + '/css');
app.set(__dirname + '/js');

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//Uso de rutas
app.use(routes);

app.listen(port, function(){
    console.log(`App en ejecución en el puerto ${port}`);
    console.log("Cargando 100 Ladrillos Challenge...");
    console.log("Nombre de la app: ", app.get('appName'));
});