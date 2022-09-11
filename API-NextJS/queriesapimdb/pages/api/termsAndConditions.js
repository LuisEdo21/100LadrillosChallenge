import {connectToDatabase} from "../../util/mongodb";

/*
====== TERMS AND CONDITIONS ENDPOINT ======
Este endpoint perteneciente a la API sólo será accesible si el usuario final decide rechazar los términos y condiciones previo
a realizar su compra. Esto se logra presionando al botón "Rechazar" que aparecerá justo debajo de los términos y condiciones.

En caso de que el usuario acepte los TyC, entonces no es necesario pasar por este endpoint, por lo que se procederá directamente 
a la pantalla de Checkout con su respectivo endpoint.

De rechazar los TyC, se deberá de hacer lo siguiente: 
    1- Actualizar los campos OnSaleProcess de cada uno de los bricks que estén en el carrito (Se modificará el valor de OnSaleProcess
       restándole el valor Quantity que está en la colección shoppingCart). 
    2- Una vez hecho el paso anterior, se deberá vaciar la colección shoppingCart. 
*/

export default async(req, res) => {
	const {db} = await connectToDatabase();

    //Aquí se declararán las variables en donde se almacenarán los resultados obtenidos de las consultas en MongoDB. 
	var GetQuantitiesQuery = [];
    var UpdateQuery = [];
    var DropCollectionQuery = [];

	if(req.method === "POST")
	{
        /*
            Este query obtiene de la colección shoppingCart una lista de las cantidades de bricks que están dentro del carrito. 
            Los resultados obtenidos de este query serán empleados para actualizar el campo OnSaleProcess de la colección 
            brickList. (OnSaleProcess = OnSaleProcess - Quantity)
        */
        GetQuantitiesQuery =
            await db.collection("shoppingCart").aggregate([
                {$project: {_id: 1, Quantity: 1}}
            ], {allowDiskUse: true}).toArray();

        //Se realiza la actualización del campo OnSaleProcess de la colección brickList: 
        for(var i=0; i<GetQuantitiesQuery.length; i++)
        {
            UpdateQuery = 
                await db.collection("brickList").update(
                    {_id: parseInt(GetQuantitiesQuery[i]._id)},
                    {
                        $inc: {OnSaleProcess: -(GetQuantitiesQuery[i].Quantity)},
                        $set: {}
                    }
                );
        }

        //Vaciar la colección shoppingCart, ya que el cliente no puede comprar ningún brick debido a que rechazó los TyC. 
        DropCollectionQuery = 
            await db.collection("shoppingCart").remove({});

        res.json({
            success: "Carrito de compras vacío.",
        });
	}
	else
	{
		res.json({
			error: "Other methods different of POST are not allowed."
		})
	}
};