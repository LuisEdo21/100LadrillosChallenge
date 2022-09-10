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
	var Results = [];                 //Query para consultar si hay piezas disponibles. 
    var UpdateQuery = [];             //Query para actualizar el campo OnSaleProcess de la colección brickList.
    var SearchQuery = [];             //Query para buscar los datos generales del brick que se va a añadir al carrito. 
    var BricksOnSaleProcess = [];     //Query para añadir el registro a la colección shoppingCart. 
    var RemoveQuery = [];             //Query necesario para remover un elemento del carrito. 

    //Obtención de las variables provenientes del frontend por medio del método POST:
	const { FUNCTION, ID, BRICK_NAME } = req.query;
    //const { NIVEL, CIRC, ENTIDAD, DTO_FED, DTO_LOC, ID_MUNICIPIO, SECCION } = req.body;

    /*
        ====== FUNCIONES QUE SE PUEDEN RECIBIR ======
        La opción será recibida por medio de la variable FUNCTION, la cual actuará como una bandera. 
        Las acciones que se pueden ejecutar en este endpoint son las siguientes: 
            1- Añadir un brick al carrito. 
            2- Remover un brick del carrito.
        El valor con el que se reciba la variable FUNCTION corresponderá a la acción a realizar, de acuerdo a como se 
        indica en la lista de acciones de la parte superior.  
    */

	if(req.method === "POST")
	{
        console.log(req.query);
        //Añadir un elemento al carrito de compras
        if(FUNCTION == 1)
        {
            //Validar que el brick no esté en proceso de venta por parte de otro usuario (Campo onSaleProcess de brickList): 
            Results = 
                await db.collection("brickList").aggregate([
                    {$match: {_id: parseInt(ID), BrickName: String(BRICK_NAME)}}, 
                    {$project: {_id: 1, BrickName: 1, available: {$subtract: ["$AvailableBricks", "$SoldBricks"]}}}
                ], {allowDiskUse: true}).toArray();

            if(Results[0].available > 0)
            {
                //Hay bricks disponibles para añadir al carrito!!!
                //Por medio de UpdateQuery se va a hacer el incremento en 1 del campo OnSaleProcess para el brick que se desea añadir.
                UpdateQuery = 
                    await db.collection("brickList").update(
                        {_id: parseInt(ID)},
                        {
                            $inc: {OnSaleProcess: 1},
                            $set: {}
                        }
                    ).toArray();

                //Se valida si el brick que se desea añadir no se encuentra ya en el carrito. 
                SearchQuery = 
                    await db.collection("shoppingCart").find({_id: parseInt(ID)}).toArray();

                if(SearchQuery[0] == "")
                {
                    //No está en el carrito
                    //Se hace una consulta de los datos del brick que se desea añadir para formar el registro que posteriormente será
                    //añadido a la colección shoppingCart. 
                    SearchQuery =
                        await db.collection("brickList").find({_id: parseInt(ID)}).toArray();
                    //Del resultado obtenido en esta consulta se ontendrán los datos generales del brick que se va a añadir al carrito.
                    //Añadir a la colección shoppingCart el brick que se desea adquirir: 
                        //Si no se encuentra agregado un brick del mismo tipo, añadir un registro de este brick a la colección: 
                    BricksOnSaleProcess = 
                        await db.collection("shoppingCart").insert({
                            "_id": parseInt(ID), 
                            "BrickName": String(BRICK_NAME),
                            "Property": SearchQuery[0].Property,
                            "Price": SearchQuery[0].Price,
                            "Quantity": 1
                        }).toArray();
                }
                else
                {
                    //Ya está en el carrito!!!
                        //De lo contrario, actualizar cantidad solamente (Incrementando en 1): 
                    BricksOnSaleProcess = 
                        await db.collection("shoppingCart").update(
                            {_id: parseInt(ID)},
                            {
                                $inc: {Quantity: 1},
                                $set: {}
                            }
                        ).toArray();
                }
                res.json({
                    success: "Brick añadido al carrito satisfactoriamente!!!"
                });
            }
            else 
            {
                //Ya no hay bricks disponibles para añadir al carrito
                res.json({
                    error: "Lo sentimos, el brick que seleccionaste está agotado. Favor de seleccionar otro."
                });
            }
        }
        //Remover un elemento del carrito
        else if(FUNCTION == 2)
        {
            //Modificar el campo onSaleProcess de la colección brickList: 
                //Si se encuentra agregado un brick del mismo tipo actualizar la cantidad solamente. 
            Results = 
                await db.collection("brickList").update(
                    {_id: parseInt(ID)},
                    {
                        $inc: {OnSaleProcess: -1},
                        $set: {}
                    }
                ).toArray();

            //Eliminar el registro de la colección shoppingCart: 
                //Si sólo hay un brick de este tipo, eliminar el registro: 
                //De lo contrario, reduce la cantidad por comprar en 1:
            RemoveQuery = 
                await db.collection("shoppingCart").find({_id: parseInt(ID)}).toArray();

            if(RemoveQuery[0].Quantity > 1)
            {
                //Hay más de un brick del mismo tipo en el carrito. Reducir la cantidad en 1. 
                UpdateQuery = 
                    await db.collection("shoppingCart").update(
                        {_id: parseInt(ID)},
                        {
                            $inc: {Quantity: -1},
                            $set: {}
                        }
                    ).toArray();
                }
            else 
            {
                //Solo hay un brick del mismo tipo en el carrito. Eliminar el registro completo. 
                UpdateQuery = 
                    await db.collection("shoppingCart").remove({_id: parseInt(ID)}).toArray();
            }
            
            res.json({
                success: "Brick retirado del carrito correctamente!!!"
            });
        }
        else 
        {
            res.json({
				error: "Función no admitida."
			})
        }
	}
	else
	{
		res.json({
			error: "Other methods different of POST are not allowed."
		})
	}
};