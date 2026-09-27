import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { primerMensajeError } from '../../../core/auth/validators';

@Component({
  selector: 'app-field-error',
  template: `
    @if (control() && control()!.invalid && (control()!.touched || control()!.dirty)) {
      <span class="field__error">{{ mensaje() }}</span>
    }
  `,
})
export class FieldError {
  control = input<AbstractControl | null>(null);

  mensaje() {
    return primerMensajeError(this.control()?.errors ?? null);
  }
}
