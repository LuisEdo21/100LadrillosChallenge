import {connectToDatabase} from "../../util/mongodb";

/*
====== LANDING PAGE ENDPOINT ======
Este endpoint perteneciente a la API será el encargado de cargar la información inicial que será mostrada dentro del frontend 
para posteriormente ser formateada y de esta manera tener solo los datos necesarios para mostrarlos. 

Se realizarán consultas en la colección de properties y en la de brickList; posteriormente estos datos serán enviados al 
frontend en formato JSON para su uso. 
*/

export default async(req, res) => {
	const {db} = await connectToDatabase();

    //Aquí se declararán las variables en donde se almacenarán los resultados obtenidos de las consultas en MongoDB. 
	var PropertiesList = [];
    var BricksList = [];

	if(req.method === "POST")
	{
        PropertiesList = 
            await db.collection("properties").find({}).toArray();

        BricksList = 
            await db.collection("brickList").find({}).toArray();

        res.json({
            params: "",
            properties_list: JSON.parse(JSON.stringify(PropertiesList)),
            bricks_list: JSON.parse(JSON.stringify(BricksList))
        });
	}
	else
	{
		res.json({
			error: "Other methods different of POST are not allowed."
		})
	}
};