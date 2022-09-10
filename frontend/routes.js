// ====== TODAS LAS RUTAS DISPONIBLES EN EL SISTEMA ===
const axios = require('axios');
const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');

var data_JSON = {};

app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.use(cors({
	credentials: true,
	origin: 'http://127.0.0.1:3001/api'
}));

//====== LISTADO DE RUTAS ======
//Ruta de prueba para verificar que esté funcionando bien el enrutamiento
router.get('/', (req, res) => {
    res.send('Hello World!')
});

router.get('/app', (req, res) => {
    axios.post('http://127.0.0.1:3001/api/landingPage', data_JSON).then(function(response) {
        const {params, properties_list, bricks_list} = response.data;
        res.render('app/index.ejs', {params:params, properties_list:properties_list, bricks_list:bricks_list});
    }).catch(function(error) {
        console.log(error);
        res.end();
    });
    //res.render('app/index.ejs');
});

module.exports = router;