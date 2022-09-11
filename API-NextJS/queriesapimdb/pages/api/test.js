import {connectToDatabase} from "../../util/mongodb";

/*
====== TEST ENDPOINT ======
Este endpoint perteneciente a la API se creó solo con el propósito de probar la conexión a la base de datos una vez que se 
creó la conexión a MongoDB por medio de NextJS.

Solo retorna lo que se tiene dentro de cada colección.
*/

export default async(req, res) => {
	const {db} = await connectToDatabase();

    //Aquí se declararán las variables en donde se almacenarán los resultados obtenidos de las consultas en MongoDB. 
	var ResultsBrickList = [];
    var ResultsProperties = [];
    var ResultsPurchaseList = [];

	if(req.method === "POST")
	{
        ResultsBrickList = 
            await db.collection("brickList").find({}).toArray();

        ResultsProperties = 
            await db.collection("properties").find({}).toArray();

        ResultsPurchaseList = 
            await db.collection("purchaseList").find({}).toArray();

        res.json({
            params: "",
            results_brick_list: JSON.parse(JSON.stringify(ResultsBrickList)),
            results_properties: JSON.parse(JSON.stringify(ResultsProperties)),
            results_purchase_list: JSON.parse(JSON.stringify(ResultsPurchaseList))
        });
	}
	else
	{
		res.json({
			error: "Other methods different of POST are not allowed."
		})
	}
};