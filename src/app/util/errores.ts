// Saca un mensaje legible de un error HTTP del backend
export function mensajeError(err: any): string {
  if (err?.status === 0) {
    return 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.';
  }
  return err?.error?.mensaje || 'Ocurrió un error inesperado. Intente de nuevo.';
}
