export const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';

export const WHATSAPP_NUMBER = import.meta.env.WHATSAPP_NUMBER || '573144785524';

export const SITE_URL = import.meta.env.SITE_URL || 'http://localhost:4321';

export const ADMIN_SECTIONS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'habitaciones', label: 'Habitaciones' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'galeria', label: 'Galería' },
  { id: 'contacto', label: 'Contacto' },
  { id: 'reservas', label: 'Reservas' },
];

export const NAV_LINKS = [
  { href: '/', label: 'INICIO' },
  { href: '/nosotros', label: 'NOSOTROS' },
  { href: '/habitaciones', label: 'HABITACIONES' },
  { href: '/servicios', label: 'SERVICIOS' },
  { href: '/galeria', label: 'GALERÍA' },
  { href: '/contactenos', label: 'CONTÁCTENOS' },
];
