// import { getAuth } from "@clerk/nextjs/server"; // Importa getAuth para obtener la información de autenticación del usuario desde Clerk
// import { NextResponse } from "next/server"; // Importa NextResponse para manejar las respuestas en Next.js

// // Función para verificar la autenticación del usuario
// export async function checkAuth(req) {
//   // Obtiene la información de autenticación del usuario desde la solicitud
//   const { userId } = getAuth(req);

//   // Si no hay userId, el usuario no está autenticado
//   if (!userId) {
//     return {
//       // Indica que el usuario no está autenticado
//       isAuthenticated: false,
//       // Devuelve una respuesta JSON con un error de autenticación y un estado 401 (No autorizado)
//       response: NextResponse.json(
//         { error: "No está logueado" },
//         { status: 401 }
//       ),
//     };
//   }

//   // Si el usuario está autenticado, devuelve el estado de autenticación y el userId
//   return { isAuthenticated: true, userId };
// }
