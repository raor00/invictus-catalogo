# Invictus Catalog

Catálogo mayorista con panel admin, inventario en tiempo real y pedidos por WhatsApp.

## Stack

- Next.js 16
- React 19
- Firebase Auth
- Cloud Firestore
- Firebase Admin SDK para registrar pedidos y descontar inventario desde el servidor

## Configuración

1. Crea un proyecto en Firebase.
2. Activa `Authentication > Sign-in method > Email/Password`.
3. Activa `Firestore Database`.
4. Crea un usuario admin en `Authentication`.
5. En `Project settings`, copia la configuración web.
6. En `Project settings > Service accounts`, genera una llave privada nueva.
7. Copia `.env.example` a `.env.local` y llena las variables.

## Variables de entorno

Variables públicas para el cliente:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Variables privadas para el servidor:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

`FIREBASE_PRIVATE_KEY` debe guardarse con `\n` escapados si la pegas en una sola línea.

## Reglas de Firestore

Usa el archivo [firestore.rules](/Users/mac/Documents/GitHub/Invictus-Catalog/firestore.rules).

Resumen:

- `products`: lectura pública, escritura solo para usuarios autenticados.
- `orders`: creación solo desde el servidor; lectura y edición solo para usuarios autenticados.

## Arranque

```bash
npm install
npm run dev
```

## Cómo queda operando

- El catálogo público lee productos desde Firestore.
- El admin inicia sesión con Firebase Auth.
- El admin crea, edita y elimina productos directo en Firestore.
- El primer admin autenticado que entre con la base vacía siembra el catálogo inicial.
- Cada pedido de WhatsApp entra por `/api/orders`.
- El servidor registra el pedido en `orders` y descuenta stock de `products` en una transacción.
- Al bajar stock, se actualizan también disponibles y valor de inventario.

## Colecciones

### `products`

Documentos por producto con estos campos:

- `id`
- `name`
- `sku`
- `storage`
- `condition`
- `price`
- `stock`
- `image`
- `category`
- `status`
- `isAvailable`

### `orders`

Documentos de pedido con:

- `id`
- `customer`
- `items`
- `total`
- `totalQuantity`
- `channel`
- `status`
- `createdAt`

## Fallback local

Si no configuras Firebase, la app sigue funcionando con `localStorage` como respaldo para desarrollo.
