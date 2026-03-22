import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudPuesto } from './crud-puesto';

describe('CrudPuesto', () => {
  let component: CrudPuesto;
  let fixture: ComponentFixture<CrudPuesto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudPuesto],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudPuesto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
