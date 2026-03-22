import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudUsuario } from './crud-usuario';

describe('CrudUsuario', () => {
  let component: CrudUsuario;
  let fixture: ComponentFixture<CrudUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
