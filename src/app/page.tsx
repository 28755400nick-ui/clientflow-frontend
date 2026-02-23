// La raíz del proyecto redirige a /clients.
// El middleware interceptará esa ruta y, si no hay sesión, mandará a /login.
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/clients');
}
