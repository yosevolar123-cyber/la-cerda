import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const RE_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(\s[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/;
const RE_GMAIL = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const RE_CELULAR_BO = /^[67][0-9]{7}$/;

export function nombreValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = (control.value ?? '').trim();
    if (!valor) return null;
    if (valor.length < 2) return { nombreCorto: true };
    if (valor !== control.value) return { nombreEspacios: true };
    if (!RE_NOMBRE.test(valor)) return { nombreInvalido: true };
    return null;
  };
}

export function emailGmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = (control.value ?? '').trim();
    if (!valor) return null;
    return RE_GMAIL.test(valor) ? null : { emailNoGmail: true };
  };
}

/** Acepta con o sin prefijo +591; el valor normalizado (8 dígitos) se calcula con normalizarCelular(). */
export function celularBoliviaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = normalizarCelular(control.value ?? '');
    if (!valor) return null;
    return RE_CELULAR_BO.test(valor) ? null : { celularInvalido: true };
  };
}

export function normalizarCelular(valor: string): string {
  return valor
    .trim()
    .replace(/^\+?591/, '')
    .replace(/\s+/g, '');
}

export function passwordSeguraValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value ?? '';
    if (!valor) return null;
    const errores: ValidationErrors = {};
    if (valor.length < 8) errores['passwordCorta'] = true;
    if (!/[a-z]/.test(valor)) errores['passwordSinMinuscula'] = true;
    if (!/[A-Z]/.test(valor)) errores['passwordSinMayuscula'] = true;
    if (!/[0-9]/.test(valor)) errores['passwordSinNumero'] = true;
    return Object.keys(errores).length ? errores : null;
  };
}

/** Mensajes en español listos para mostrar bajo cada campo. */
export const MENSAJES_ERROR: Record<string, string> = {
  required: 'Este campo es obligatorio.',
  nombreCorto: 'Debe tener al menos 2 caracteres.',
  nombreEspacios: 'No debe tener espacios dobles ni al inicio/fin.',
  nombreInvalido: 'Solo letras y espacios (sin números ni símbolos).',
  emailNoGmail: 'El correo debe terminar en @gmail.com.',
  email: 'Ingresa un correo válido.',
  celularInvalido: 'Debe tener 8 dígitos y empezar con 6 o 7.',
  passwordCorta: 'Debe tener al menos 8 caracteres.',
  passwordSinMinuscula: 'Debe incluir al menos una minúscula.',
  passwordSinMayuscula: 'Debe incluir al menos una mayúscula.',
  passwordSinNumero: 'Debe incluir al menos un número.',
  passwordsNoCoinciden: 'Las contraseñas no coinciden.',
  min: 'El valor no puede ser menor al mínimo permitido.',
};

export function primerMensajeError(errores: ValidationErrors | null): string | null {
  if (!errores) return null;
  const clave = Object.keys(errores)[0];
  return MENSAJES_ERROR[clave] ?? 'Valor inválido.';
}
