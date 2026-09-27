import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { emailGmailValidator } from '../../../core/auth/validators';
import { ROLE_HOME_ROUTE } from '../../../core/models/roles';
import { Button } from '../../../shared/ui/button/button';
import { FieldError } from '../../../shared/ui/field-error/field-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Button, FieldError],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  enviando = signal(false);
  errorGeneral = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, emailGmailValidator()]],
    password: ['', [Validators.required]],
  });

  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }

  async enviar() {
    this.errorGeneral.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const { email, password } = this.form.getRawValue();
    const { error, rol } = await this.auth.iniciarSesion(email, password);
    this.enviando.set(false);

    if (error) {
      this.errorGeneral.set('Correo o contraseña incorrectos.');
      return;
    }
    this.router.navigateByUrl(rol ? ROLE_HOME_ROUTE[rol] : '/catalogo');
  }
}
