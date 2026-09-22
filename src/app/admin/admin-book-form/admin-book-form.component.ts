import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { BooksService } from '../../books/books.service';
import { AdminService } from '../admin.service';
import { AuthService } from '../../account/auth.service';
import { getErrorMessage } from '../../shared/http-error';

@Component({
  selector: 'app-admin-book-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormFieldComponent],
  templateUrl: './admin-book-form.component.html',
  styleUrl: './admin-book-form.component.css'
})
export class AdminBookFormComponent implements OnInit {
  isEdit = false;
  bookId?: number;
  isSubmitting = false;
  errorMessage = '';
  isUploadingFeature = false;
  isUploadingImage = false;
  images: string[] = [];

  form = this.fb.nonNullable.group({
    slug: [''],
    title: ['', Validators.required],
    author: ['', Validators.required],
    price: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    sale_price: this.fb.control<number | null>(null),
    date_published: ['', Validators.required],
    quantity: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    in_stock: this.fb.nonNullable.control(true),
    description: ['', Validators.required],
    feature_image: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private booksService: BooksService,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEdit = true;
      this.bookId = Number(idParam);

      this.booksService.getBook(this.bookId).subscribe({
        next: book => {
          this.form.patchValue({
            slug: book.slug ?? '',
            title: book.title,
            author: book.author,
            price: book.price,
            sale_price: book.sale_price,
            date_published: book.date_published,
            quantity: book.quantity,
            in_stock: book.in_stock,
            description: book.description,
            feature_image: book.feature_image
          });
          this.images = [...book.images];
        },
        error: () => {
          this.errorMessage = 'Could not load this product.';
        }
      });
    }
  }

  onFeatureImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }

    const adminId = this.authService.currentUser()?.id;

    if (!adminId) {
      return;
    }

    this.isUploadingFeature = true;
    this.errorMessage = '';

    this.readFileAsDataUrl(file).then(dataUrl => {
      this.adminService.uploadBookImage(file.name, dataUrl, adminId).subscribe({
        next: result => {
          this.form.patchValue({ feature_image: result.path });
          this.isUploadingFeature = false;
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingFeature = false;
          this.errorMessage = getErrorMessage(err, 'Could not upload the feature image.');
        }
      });
    });
  }

  onGalleryImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }

    const adminId = this.authService.currentUser()?.id;

    if (!adminId) {
      return;
    }

    this.isUploadingImage = true;
    this.errorMessage = '';

    this.readFileAsDataUrl(file).then(dataUrl => {
      this.adminService.uploadBookImage(file.name, dataUrl, adminId).subscribe({
        next: result => {
          this.images = [...this.images, result.path];
          this.isUploadingImage = false;
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingImage = false;
          this.errorMessage = getErrorMessage(err, 'Could not upload the image.');
        }
      });
    });
  }

  removeImage(index: number): void {
    this.images = this.images.filter((_, i) => i !== index);
  }

  displayPath(imagePath: string): string {
    return imagePath.replace('src/', '');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const adminId = this.authService.currentUser()?.id;

    if (!adminId) {
      return;
    }

    const formValue = this.form.getRawValue();

    const payload = {
      slug: formValue.slug || undefined,
      title: formValue.title,
      author: formValue.author,
      price: formValue.price,
      sale_price: formValue.sale_price,
      date_published: formValue.date_published,
      quantity: formValue.quantity,
      in_stock: formValue.in_stock,
      description: formValue.description,
      feature_image: formValue.feature_image,
      images: this.images
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    const request$ = this.isEdit
      ? this.adminService.updateBook(this.bookId!, payload, adminId)
      : this.adminService.createBook(payload, adminId);

    request$.subscribe({
      next: () => {
        this.router.navigateByUrl('/admin/products');
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = getErrorMessage(err, 'Could not save this product.');
      }
    });
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
