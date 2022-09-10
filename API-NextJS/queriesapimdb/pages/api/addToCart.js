import {connectToDatabase} from "../../util/mongodb";

/*
====== ADD TO CART ENDPOINT ======
Este endpoint perteneciente a la API es el responsable de validar si un brick aún se encuentra disponible en el momento en 
el que el usuario desea añadirlo a su carrito de compras. 

Lo que debe validarse aquí es si algún otro usuario añadió antes a su carrito el brick que desea comprar, con el fin de 
determinar si aun se encuentra disponible para su compra. Si lo está, entonces lo añade al carrito, de lo contrario, 
notifica que el brick ya no está disponible y no permite añadirlo al carrito. 
*/

export default async(req, res) => {
	const {db} = await connectToDatabase();

    //Aquí se declararán las variables en donde se almacenarán los resultados obtenidos de las consultas en MongoDB. 
	var Results = [];

    //Obtención de las variables provenientes del frontend por medio del método POST:
	//const { NIVEL, CIRC, ENTIDAD, DTO_FED, DTO_LOC, ID_MUNICIPIO, SECCION } = req.body;

	if(req.method === "POST")
	{
        ResultsBrickList = 
            await db.collection("brickList").find({}).toArray();

        res.json({
            params: "",
        });
	}
	else
	{
		res.json({
			error: "Other methods different of POST are not allowed."
		})
	}
};