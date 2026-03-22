import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudPlanilla } from './crud-planilla';

describe('CrudPlanilla', () => {
  let component: CrudPlanilla;
  let fixture: ComponentFixture<CrudPlanilla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudPlanilla],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudPlanilla);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
