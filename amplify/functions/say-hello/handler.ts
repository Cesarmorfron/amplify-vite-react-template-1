import type { Schema } from "../../data/resource"

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
   // arguments typed from `.arguments()`
   const { idUser } = event.arguments
   console.log('name')
   console.log(idUser)
   // return typed from `.returns()`
   return `Hello, ${idUser}!`
}