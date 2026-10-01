import { Component, inject, input, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import {
  celularBoliviaValidator,
  emailGmailValidator,
  nombreValidator,
  normalizarCelular,
  passwordSeguraValidator,
} from '../../../core/auth/validators';
import { destinoSeguro, vieneDelCheckout } from '../../../core/auth/redirect';
import { Button } from '../../../shared/ui/button/button';
import { FieldError } from '../../../shared/ui/field-error/field-error';

function passwordsCoincidenValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmar = control.get('confirmarPassword')?.value;
  if (!password || !confirmar) return null;
  return password === confirmar ? null : { passwordsNoCoinciden: true };
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Button, FieldError],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  /** `?redirect=` heredado del login (ej. venía de "Ir a pagar"). */
  redirect = input<string>();
  protected readonly vieneDelCheckout = vieneDelCheckout;

  enviando = signal(false);
  errorGeneral = signal<string | null>(null);
  registrado = signal(false);

  form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, nombreValidator()]],
      email: ['', [Validators.required, Validators.email, emailGmailValidator()]],
      telefono: ['', [Validators.required, celularBoliviaValidator()]],
      password: ['', [Validators.required, passwordSeguraValidator()]],
      confirmarPassword: ['', [Validators.required]],
    },
    { validators: passwordsCoincidenValidator },
  );

  get nombre() {
    return this.form.controls.nombre;
  }
  get email() {
    return this.form.controls.email;
  }
  get telefono() {
    return this.form.controls.telefono;
  }
  get password() {
    return this.form.controls.password;
  }
  get confirmarPassword() {
    return this.form.controls.confirmarPassword;
  }

  async enviar() {
    this.errorGeneral.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const valores = this.form.getRawValue();
    const { data, error } = await this.auth.registrar({
      email: valores.email,
      password: valores.password,
      nombre: valores.nombre,
      telefono: normalizarCelular(valores.telefono),
    });
    this.enviando.set(false);

    if (error) {
      this.errorGeneral.set(
        error.message.includes('already registered')
          ? 'Ese correo ya está registrado.'
          : 'No se pudo completar el registro. Intenta nuevamente.',
      );
      return;
    }
    this.registrado.set(true);
    const destino = destinoSeguro(this.redirect());
    // Si Supabase ya devolvió sesión (sin confirmación por correo) seguimos
    // directo a donde iba; si no, al login conservando el destino.
    setTimeout(() => {
      if (data.session && destino) this.router.navigateByUrl(destino);
      else
        this.router.navigate(['/auth/login'], {
          queryParams: destino ? { redirect: destino } : {},
        });
    }, 2500);
  }
}
