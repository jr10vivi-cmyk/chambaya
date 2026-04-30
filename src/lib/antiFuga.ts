// Detecta números de teléfono y datos de contacto en mensajes de chat.
const PATRON_KEYWORDS =
  /(\+?51[\s\-.()]?\d{3}[\s\-.]?\d{3}[\s\-.]?\d{3}|\b\d{3}[\s\-.]?\d{3}[\s\-.]?\d{3}\b|\b\d{9,10}\b|wa\.me|whatsapp|wsp|wasap|wap|facebook|fb\.me|instagram|insta|telegram|tiktok|signal|@[a-z0-9._]+|mi\s*(número|numero|celular|tel[eé]fono|telf|tlf|cel|tele)\b|(te\s+llamo|ll[aá]mame|cont[aá]ctame|escr[ií]beme|agreg[aá]me)\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|correo|gmail|hotmail|outlook|yahoo)/i;

export function contieneContacto(texto: string): boolean {
  if (PATRON_KEYWORDS.test(texto)) return true;

  // Normalizar: eliminar separadores (espacios, guiones, puntos, comas, *, /, |)
  // que aparezcan entre dígitos para detectar obfuscación como "93 4 7 3 7 6 6 3".
  // Solo colapsa cuando TODO lo que hay entre dos dígitos son no-letras,
  // así "3 hijos y 7" no se colapsa (tiene letras en medio).
  const normalizado = texto.replace(/(\d)[^a-zA-Z\d]+(?=\d)/g, '$1');
  if (normalizado !== texto && /\b\d{9,11}\b/.test(normalizado)) return true;

  return false;
}
