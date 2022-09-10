import {connectToDatabase} from "../../util/mongodb";

/*
====== CHECKOUT ENDPOINT ======
Este endpoint perteneciente a la API es responsable de ejecutar las consultas necesarias para concretar la venta de los bricks
que el usuario añadió a su carrito de compras.

Realizará las actualizaciones en la base de datos (Modificación de stocks) y generará un registro de los bricks vendidos 
dentro de la colección purchaseList. 

Específicamente lo quie se realizará en este endpoint es lo siguiente: 
    1- Preparará un resumen del carrito de compras. Básicamente consiste en traer todo lo que contiene la colección de shoppingCart
       y desplegarlo en el frontend. 
    2- Calcular el total a pagar. Contemplar hacer el cálculo de impuestos también. Desplegar: 
        -Subtotal (84% del total)
        -IVA (16% del total)
        -TOTAL: Suma de todos los elementos que están en el carrito. 
    3- Cuando se finalice la compra, se deberá de actualizar en la colección brickList los campos: 
        -AvailableBricks (AvailableBricks = AvailableBricks - Quantity; donde Quantity se obtiene de la colección shoppingCart).
        -OnSaleProcess (OnSaleProcess = OnSaleProcess - Quantity; donde Quantity se obtiene de la colección shoppingCart).
    4- Generar y guardar un reporte de venta dentro de la colección purchaseList con los siguientes campos: 
        -Date. 
        -Hour. 
        -BricksSold (Object: {ID, BrickName, Quantity, UnitPrice, Total})
        -Subtotal
        -IVA
        -Total
    5- Finalmente, se vaciará la colección ShoppingCart. 
*/

export default async(req, res) => {
	const {db} = await connectToDatabase();

    //Aquí se declararán las variables en donde se almacenarán los resultados obtenidos de las consultas en MongoDB. 
	var Results = [];                   //Query para consultar los resultados de la colección shoppingCart y desplegarlos en el frontend. 
    var Subtotal = 0;                   //Monto total a pagar antes de impuestos. 
    var IVA = 0;                        //Impuestos calculados
    var TOTAL = 0;                      //Monto total a pagar con impuestos incluidos
    var updateBricksQuery = [];         //Query para hacer la consulta de actualización de AvailableBricks y OnSaleProcess en brickList. 
    var insertPurchaseListQuery = [];   //Query para formar el reporte de venta que irá a purchaseList. 

    //Obtención de las variables provenientes del frontend por medio del método POST:
	const { FUNCTION } = req.query;

    /*
        ====== FUNCIONES QUE SE PUEDEN RECIBIR ======
        La opción será recibida por medio de la variable FUNCTION, la cual actuará como una bandera. 
        Las acciones que se pueden ejecutar en este endpoint son las siguientes: 
            1- Generar el reporte de venta para ser desplegado en el frontend. Además de retornar el reporte de venta, también 
               calculará el subtotal, el IVA y el total de la compra y lo retornará.  
            2- Finaliza la compra. Esta función actualizará la colección brickList y generará el reporte de ventas para poste-
               riormente ser almacenado en la colección purchaseList. 
        El valor con el que se reciba la variable FUNCTION corresponderá a la acción a realizar, de acuerdo a como se 
        indica en la lista de acciones de la parte superior.  
    */

	if(req.method === "POST")
	{
        //Generar reporte visual de venta: 
        Results = 
            await db.collection("shoppingCart").find({});

        //Calcular subtotal, IVA y total: 
        for(var i=0; i<Results.length; i++)
        {
            TOTAL += (Results[i].Price * Results[i].Quantity);
        }

        Subtotal = TOTAL * 0.84;
        IVA = TOTAL = 0.16;

        //Función 1 (Revisar descripción en los comentarios de la parte superior): 
        if(FUNCTION == 1)
        {
            res.json({
                resultados: JSON.parse(JSON.stringify(Results)),
                subtotal: JSON.parse(JSON.stringify(Subtotal)),
                iva: JSON.parse(JSON.stringify(IVA)), 
                total: JSON.parse(JSON.stringify(TOTAL)),
                success: "Información desplegada con éxito",
            });
        }
        //Función 2 (Revisar descripción en los comentarios de la parte superior): 
        else if(FUNCTION == 2)
        {
            var Date = new Date();
            var DateStr = Date.toString();
            var Hour = Date.getHours();
            
            var BricksSold = [];
            var ObjectAux = {};
            //Actualizar la colección brickList
            for(var i=0; i<Results.length; i++)
            {
                ObjectAux = {};
                updateBricksQuery = 
                    await db.collection("brickList").update(
                        {_id: parseInt(Results[i]._id)},
                        {
                            $inc: {OnSaleProcess: -(Results[i].Quantity), AvailableBricks: -(Results[i].Quantity)},
                            $set: {}
                        }
                    ).toArray();

                ObjectAux = {ID: Results[i]._id, BrickName: Results[i].BrickName, Quantity: Results[i].Quantity, UnitPrice: Results[i].Price, Total: (Results[i].Quantity * Results[i].Price)}
                BricksSold.pusg(ObjectAux);
            }
            //Generar reporte de venta finalizada y guardarlo en la colección purchaseList
            insertPurchaseListQuery = 
                await db.collection("purchaseList").insert({
                    "Date": String(DateStr), 
                    "Hour": String(Hour),
                    "BricksSold": BricksSold,
                    "Subtotal": Subtotal,
                    "IVA": IVA,
                    "Total": TOTAL
                }).toArray();

            res.json({
                success: "Compra finalizada con éxito",
            });
        }
        else
        {
            res.json({
				error: "Función no admitida."
			});
        }
	}
	else
	{
		res.json({
			error: "Other methods different of POST are not allowed."
		})
	}
};