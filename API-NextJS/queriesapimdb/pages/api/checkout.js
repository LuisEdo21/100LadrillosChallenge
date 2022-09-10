import {connectToDatabase} from "../../util/mongodb";

/*
====== CHECKOUT ENDPOINT ======
Este endpoint perteneciente a la API es responsable de ejecutar las consultas necesarias para concretar la venta de los bricks
que el usuario añadió a su carrito de compras.

Realizará las actualizaciones en la base de datos (Modificación de stocks) y generará un registro de los bricks vendidos 
dentro de la colección purchaseList. 
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