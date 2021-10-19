import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { switchMap, tap } from 'rxjs/operators';

import { PaisesService } from '../../services/paises.service';
import { PaisSmall, CoatOfArms } from '../../interfaces/paises.interface';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [],
})
export class SelectorPageComponent implements OnInit {
  miFormulario: FormGroup = this.fb.group({
    region: ['', Validators.required],
    pais: ['', Validators.required],
    frontera: ['', Validators.required],
  });

  // Llenar selectores
  regiones: string[] = [];
  paises: PaisSmall[] = [];
  // fronteras: string[] = [];
  fronteras: PaisSmall[] = [];

  // UI
  cargando: boolean = false;

  constructor(private fb: FormBuilder, private paisesService: PaisesService) {}

  ngOnInit(): void {
    this.regiones = this.paisesService.regiones;

    // Cuando cambie el Continente (modo 1)
    // this.miFormulario.get('region')?.valueChanges.subscribe((region) => {
    //   console.log(region);

    //   this.paisesService.getPaisesPorRegion(region).subscribe((paises) => {
    //     console.log(paises);
    //     this.paises = paises;
    //   });
    // });

    // Cuando cambie el Continente (modo 2)
    this.miFormulario
      .get('region')
      ?.valueChanges.pipe(
        // tap recibe el resultado del observable valueChanges (una región). No uso ese resultado porque no lo necesito. tap lo uso para resetear el valor en el formulario de "pais"
        tap((region) => {
          this.miFormulario.get('pais')?.reset('');
          this.cargando = true;
        }),
        // switchMap recibe el resultado del observable valueChanges (una region) y devuelve un nuevo observable (los países)
        switchMap((region) => this.paisesService.getPaisesPorRegion(region))
      )
      .subscribe((paises) => {
        this.paises = paises;
        this.cargando = false;
      });

    // Cuando cambie el País
    this.miFormulario
      .get('pais')
      ?.valueChanges.pipe(
        tap(() => {
          this.miFormulario.get('frontera')?.reset('');
          this.cargando = true;
        }),
        switchMap((codigo) => this.paisesService.getPaisPorCodigo(codigo)),
        switchMap((pais) =>
          this.paisesService.getPaisesPorCodigos(pais?.borders!)
        )
      )
      .subscribe((paises) => {
        console.log(paises);
        // //TODO: Se consigue el país, pero no la propiedad borders
        // this.fronteras = pais?.borders || [];
        this.fronteras = paises;
        this.cargando = false;
      });
  }

  guardar() {
    console.log(this.miFormulario.value);
  }
}
