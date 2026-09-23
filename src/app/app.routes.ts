import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BooksComponent } from './books/books.component';
import { BookSingleProductComponent } from './books/book-single-product/book-single-product.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderComponent } from './order/order.component';
import { SearchComponent } from './search/search.component';
import { ContactComponent } from './contact/contact.component';
import { PageDetailComponent } from './pages/page-detail/page-detail.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AccountComponent } from './account/account.component';
import { AccountDashboardComponent } from './account/account-dashboard/account-dashboard.component';
import { AccountOrdersComponent } from './account/account-orders/account-orders.component';
import { AccountDetailsComponent } from './account/account-details/account-details.component';
import { AccountAddressComponent } from './account/account-address/account-address.component';
import { authGuard } from './account/auth.guard';
import { AdminComponent } from './admin/admin.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { AdminOrderFormComponent } from './admin/admin-order-form/admin-order-form.component';
import { AdminProductsComponent } from './admin/admin-products/admin-products.component';
import { AdminBookFormComponent } from './admin/admin-book-form/admin-book-form.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { AdminUserFormComponent } from './admin/admin-user-form/admin-user-form.component';
import { AdminMessagesComponent } from './admin/admin-messages/admin-messages.component';
import { adminGuard } from './admin/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'books', component: BooksComponent },
  { path: 'books/pagination/:page', component: BooksComponent },
  { path: 'books/:idOrSlug', component: BookSingleProductComponent },
  { path: 'search', component: SearchComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'page/:slug', component: PageDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order/:id', component: OrderComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AccountDashboardComponent },
      { path: 'orders', component: AccountOrdersComponent },
      { path: 'details', component: AccountDetailsComponent },
      { path: 'address', component: AccountAddressComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'orders/new', component: AdminOrderFormComponent },
      { path: 'orders/:id/edit', component: AdminOrderFormComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'products/new', component: AdminBookFormComponent },
      { path: 'products/:id/edit', component: AdminBookFormComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'users/new', component: AdminUserFormComponent },
      { path: 'users/:id/edit', component: AdminUserFormComponent },
      { path: 'messages', component: AdminMessagesComponent },
    ],
  },
];
