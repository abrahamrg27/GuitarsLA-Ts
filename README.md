# GuitarLA

## Visión General del Proyecto

GuitarLA es una aplicación frontend para explorar una colección de guitarras y gestionar un carrito de compra directamente desde el navegador. Resuelve el flujo básico de selección de productos: el usuario puede consultar el catálogo, agregar guitarras, ajustar cantidades, eliminar productos y vaciar el carrito. El catálogo se encuentra definido localmente en `src/data/db.ts`, por lo que esta versión no depende de una API ni de un backend.

### Interfaz

![Encabezado visual de GuitarLA](./public/img/header.jpg)

El proyecto incluye este recurso visual para el encabezado y una interfaz de catálogo con tarjetas de producto. El carrito se abre al pasar el cursor sobre el icono del encabezado.

### Despliegue

Actualmente no hay una URL de producción configurada en el repositorio. La aplicación puede ejecutarse localmente siguiendo las instrucciones de [Puesta en marcha](#puesta-en-marcha).

## Ficha Técnica y Tecnologías

### Lenguajes y tipado

- **TypeScript 6.0.2** (`~6.0.2`) para el código de aplicación.
- **JavaScript ES2023** como objetivo de compilación (`target: "es2023"`).
- Tipado estático explícito para el dominio mediante los tipos `Guitar`, `CartItem`, `GuitarProps` y `CartProp`.
- `strict` no está habilitado en la configuración actual; sí se aplican comprobaciones de variables y parámetros no utilizados mediante `noUnusedLocals` y `noUnusedParameters`.
- HTML y CSS para la estructura y presentación visual.

### Librerías, framework y estilos

- **React 19.2.8** y **React DOM 19.2.8**.
- **Bootstrap 5.2.3** incorporado en `src/index.css` para el sistema de grid, utilidades y componentes visuales.
- CSS propio en `src/index.css` y `src/App.css` para la identidad de GuitarLA y el comportamiento del carrito.
- No se utilizan Tailwind CSS, CSS Modules, Styled Components ni una librería externa de componentes.

### Entorno y tooling

- **Vite 8.3.0** como servidor de desarrollo y bundler.
- **@vitejs/plugin-react 6.1.1** para integrar React con Vite.
- **npm** como gestor de paquetes, a partir de `package.json`.
- **ESLint 10.10.0**, `typescript-eslint 8.69.0` y los plugins de React para validación estática.

### Dependencias clave

| Dependencia | Versión | Uso |
| --- | --- | --- |
| `react` | `^19.2.8` | Componentes, estado y hooks |
| `react-dom` | `^19.2.8` | Montaje de React en el DOM |
| `vite` | `^8.3.0` | Desarrollo local y compilación |
| `typescript` | `~6.0.2` | Tipado y verificación del código |
| `@vitejs/plugin-react` | `^6.1.1` | Transformación de archivos JSX/TSX |
| `eslint` | `^10.10.0` | Linting del proyecto |

No hay cliente HTTP, enrutador, gestor de estado externo ni variables de entorno requeridas en la versión actual.

## Arquitectura e Implementación en React

### Flujo de componentes

La aplicación se monta desde `src/main.tsx` y renderiza `App` dentro de `StrictMode`.

```text
main.tsx
└── App.tsx
    ├── Header.tsx
    │   └── Carrito desplegable
    ├── Guitar.tsx (una instancia por producto)
    └── Footer
```

- **`App`** es el componente inteligente o contenedor: consume `useCart`, conserva la composición de la pantalla y distribuye datos y callbacks.
- **`Header`** es un componente presentacional con comportamiento de interacción recibido por props. Renderiza el carrito, sus controles y el total.
- **`Guitar`** es un componente presentacional reutilizable. Recibe una guitarra y la función `addToCart`, y muestra la tarjeta del producto.
- **`db.ts`** funciona como fuente de datos estática y expone las 12 guitarras del catálogo.

### Hooks nativos

| Hook | Ubicación | Uso y justificación |
| --- | --- | --- |
| `useState` | `src/hooks/useCart.ts` | Mantiene el catálogo (`data`) y el carrito (`cart`). La inicialización del carrito lee `localStorage` una sola vez para recuperar la sesión anterior. |
| `useEffect` | `src/hooks/useCart.ts` | Persiste el carrito serializado en `localStorage` cada vez que cambia. Al no existir API ni suscripciones externas, no se requiere otro efecto. |
| `useMemo` | `src/hooks/useCart.ts` | Calcula `isEmpty` y `cartTotal` a partir del carrito y evita recalcular estos valores derivados en renders donde el carrito no cambió. |
| `useRef` | No se utiliza | No hay referencias imperativas al DOM ni elementos que deban enfocarse o medirse desde React. |
| `useCallback` | No se utiliza | Las funciones del hook se pasan a componentes, pero el proyecto no necesita estabilizar sus referencias para una optimización adicional. |
| `useContext` / `useReducer` | No se utilizan | El estado global es pequeño y solo tiene un consumidor principal; `useCart` resulta suficiente y evita introducir un proveedor o un flujo más complejo. |

### Hook personalizado: `useCart`

`useCart` encapsula toda la lógica del dominio del carrito y desacopla a los componentes de la implementación del estado:

- Expone `cart` y `data` para renderizar el carrito y el catálogo.
- Expone `addToCart`, `decreaseQuantity`, `increaseQuantity`, `removeFromCart` y `clearCart` para las acciones del usuario.
- Expone `isEmpty` y `cartTotal` como valores derivados.
- Recupera datos previamente guardados desde `localStorage` y limpia la entrada si el JSON es inválido.
- Aplica las reglas de cantidad mínima (`1`) y máxima (`5`) por guitarra.

El hook se reutiliza en `App.tsx`, que entrega sus valores a `Header` y `Guitar` mediante props. En caso de crecer la aplicación, esta separación permite cambiar la fuente de datos o añadir un contexto sin trasladar lógica a la interfaz.

## Patrones y Buenas Prácticas

### Componentes, props e inmutabilidad

- Se utiliza una separación contenedor/presentación: `App` coordina el estado y `Header`/`Guitar` se enfocan en la vista.
- Las listas se renderizan con una `key` estable basada en `guitar.id`.
- Las props están tipadas con interfaces/types de TypeScript y las funciones reciben tipos explícitos.
- Las actualizaciones del carrito son inmutables: se crean nuevos arrays y objetos mediante spread, `map` y `filter` en lugar de mutar el estado existente.
- Los componentes son pequeños y tienen una responsabilidad concreta.

### Modularización

La lógica está separada de acuerdo con su responsabilidad:

```text
src/
├── components/       # Header y tarjeta Guitar
├── data/             # Catálogo local
├── hooks/            # Lógica reutilizable del carrito
├── App.tsx           # Composición de la pantalla
├── main.tsx          # Punto de entrada
├── types.d.ts        # Tipos compartidos
└── index.css         # Bootstrap y estilos globales
```

### Estado y persistencia

La estrategia actual combina estado local del hook con persistencia en navegador:

1. `useState` mantiene el carrito en memoria durante la sesión.
2. `useEffect` guarda el estado bajo la clave `cart` de `localStorage`.
3. Al iniciar, el inicializador de `useState` recupera y valida el JSON.
4. Si el contenido guardado no es un array válido o no se puede parsear, se elimina y se comienza con un carrito vacío.

No se utilizan `sessionStorage`, cookies, Context API, Redux ni otro gestor externo.

### Estados de la interfaz

- **Empty:** se muestra `El carrito esta vacio` cuando no hay productos.
- **Success:** el catálogo se renderiza y las acciones de agregar, aumentar, disminuir y eliminar actualizan el total.
- **Loading/Error:** no se implementan estados visuales de carga o error de red porque los datos son locales y se cargan de forma síncrona. El error de lectura de `localStorage` se registra en consola y se recupera un carrito vacío para mantener la aplicación operativa.

## Puesta en marcha

### Requisitos

- Node.js compatible con Vite 8.
- npm.
- Un navegador moderno con soporte para `localStorage`.

### Instalación y ejecución

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/abrahamrg27/GuitarsLA-Ts.git
   cd GuitarsLA-Ts
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Configurar variables de entorno:

   No se requieren variables de entorno para esta versión. El catálogo es local y no hay credenciales ni servicios externos que configurar.

4. Iniciar el entorno de desarrollo:

   ```bash
   npm run dev
   ```

5. Abrir la URL que indique Vite, normalmente `http://localhost:5173`.

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run start    # Alias del servidor de desarrollo
npm run build    # Verificación TypeScript y build de producción
npm run lint     # Ejecución de ESLint
npm run preview  # Previsualización local del build
```

Para probar el build de producción:

```bash
npm run build
npm run preview
```
