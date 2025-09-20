import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Generalprogresswidget } from './generalprogresswidget';

describe('Generalprogresswidget', () => {
  let component: Generalprogresswidget;
  let fixture: ComponentFixture<Generalprogresswidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Generalprogresswidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Generalprogresswidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
