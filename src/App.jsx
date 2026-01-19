import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import components with Capital letters
import Login from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import ChatList from "./pages/chatList";
import ChatRoom from "./pages/chatRoom";

import RegisterRole from "./pages/registerRole";
import SignupCustomer from "./pages/signupCustomer";
import SignupVendor from "./pages/signupVendor";
import ConfirmLocation from "./pages/vendorConfirmLocation";
import ProfileVendor from "./pages/profileVendor";
import VendorDashboard from "./pages/vendorDashboard";
import VendorAddMenu from "./pages/vendorAddMenu";
import VendorViewMenu from "./pages/vendorViewMenu";
import VendorUpdateMenu from "./pages/vendorUpdateMenu";
import VendorOngoingOrder from "./pages/vendorOngoingOrder";
import VendorTrackOrder from "./pages/vendorTrackOrder";
import VendorTrackOrderxx from "./pages/vendorTrackOrderxx";
import VendorViewOngoingOrder from "./pages/vendorViewOngoingOrder";
import VendorUpdateOngoingOrder from "./pages/vendorUpdateOngoingOrder";
import VendorPastOrder from "./pages/vendorPastOrder";
import VendorViewPastOrder from "./pages/vendorViewPastOrder";
import VendorEditProfile from "./pages/vendorEditProfile";
import LandingPage from "./pages/landingPage";

import CustomerMenuCategory from "./pages/customerMenuCategory";
import CustomerMenuCategoryList from "./pages/customerMenuCategoryList";
import CustomerViewMenuDetails from "./pages/customerViewMenuDetails";
import CustomerViewVendorPage from "./pages/customerViewVendorPage";
import CustomerCart from "./pages/customerCart";
import CustomerCheckout from "./pages/customerCheckout";
import CustomerPayment from "./pages/customerPayment";
import CustomerOrderSuccess from "./pages/customerOrderSuccess";
import CustomerProfile from "./pages/customerProfile";
import CustomerEditProfile from "./pages/customerEditProfile";
import CustomerOngoingOrder from "./pages/customerOngoingOrder";
import CustomerViewOngoingOrder from "./pages/customerViewOngoingOrder";
import CustomerPastOrder from "./pages/customerPastOrder";
import CustomerViewPastOrder from "./pages/customerViewPastOrder";
import CustomerNearbyVendor from "./pages/customerNearbyVendor";
import CustomerTrackOrder from "./pages/customerTrackOrder";
import CustomerTrackOrderxx from "./pages/customerTrackOrderxx";
import CustomerChatVendor from "./pages/customerChatVendor";
import CustomerTopSales from "./pages/customerTopSales";

import AdminDashboard from "./pages/adminDashboard";
import AdminGenerateCustomerReport from "./pages/adminGenerateCustomerReport";
import AdminListCustomer from "./pages/adminListCustomer";
import AdminViewCustomer from "./pages/adminViewCustomer";
import AdminViewCustomerReport from "./pages/adminViewCustomerReport";
import AdminListVendor from "./pages/adminListVendor";
import AdminViewVendor from "./pages/adminViewVendor";
import AdminGenerateVendorReport from "./pages/adminGenerateVendorReport";
import AdminRegistrationRequest from "./pages/adminRegistrationRequest";
import AdminNotification from "./pages/adminNotification";
import AdminProfile from "./pages/adminProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/vendor/chats" element={<ChatList />} />
        <Route path="/chat/vendor/:chatId" element={<ChatRoom />} />


        <Route path="/register-role" element={<RegisterRole />} />
        <Route path="/register-customer" element={<SignupCustomer />} />
        <Route path="/register-vendor" element={<SignupVendor />} />
        <Route path="/profile" element={<ProfileVendor />} />
        <Route path="/vendor/edit-profile" element={<VendorEditProfile />} />
        <Route path="/vendor/confirm-location" element={<ConfirmLocation />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor/add" element={<VendorAddMenu />} />
        <Route path="/vendor/view/:id" element={<VendorViewMenu />} />
        <Route path="/vendor/update/:id" element={<VendorUpdateMenu />} />
        <Route path="/vendor/ongoing-orders" element={<VendorOngoingOrder />} />
        <Route path="/vendor/track-order/:orderId" element={<VendorTrackOrder />} />
        <Route path="/vendor/view-ongoing/:orderId" element={<VendorViewOngoingOrder />} />
        <Route path="/vendor/update-ongoing/:orderId" element={<VendorUpdateOngoingOrder />} />
        <Route path="/vendor/past-orders" element={<VendorPastOrder />} />
        <Route path="/vendor/view-past/:orderId" element={<VendorViewPastOrder />} />
        <Route path="/vendor/track-orderxx" element={<VendorTrackOrderxx />} />
        <Route path="/chat/vendor/:vendorId" element={<CustomerChatVendor />} />

        {/* Customer routes */}
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/edit-profile" element={<CustomerEditProfile />} />
        <Route path="/customer" element={<CustomerMenuCategory />} />
        <Route path="/customer/categories" element={<CustomerMenuCategory />} />
        <Route path="/customer/category/:type" element={<CustomerMenuCategoryList />} />
        <Route path="/customer/menu/:id" element={<CustomerViewMenuDetails />} />
        <Route path="/customer/cart" element={<CustomerCart />} />
        <Route path="/customer/checkout" element={<CustomerCheckout />} />
        <Route path="/customer/payment" element={<CustomerPayment />} />
        {/*<Route path="/customer/order-success" element={<CustomerOrderSuccess />} />*/}
        <Route path="/customer/vendor/:vendorId" element={<CustomerViewVendorPage />} />
        <Route path="/customer/cart" element={<CustomerCart />} />
        <Route path="/customer/checkout" element={<CustomerCheckout />} />
        <Route path="/customer/payment" element={<CustomerPayment />} />
        <Route path="/customer/success" element={<CustomerOrderSuccess />} />
        <Route path="/customer/orders/ongoing" element={<CustomerOngoingOrder/>} />
        <Route path="/customer/orders/ongoing/:id" element={<CustomerViewOngoingOrder/>} />
        <Route path="/customer/orders/past" element={<CustomerPastOrder/>} />
        <Route path="/customer/orders/past/:id" element={<CustomerViewPastOrder/>} />
        <Route path="/customer/nearby-vendors" element={<CustomerNearbyVendor/>} />
        <Route path="/customer/track-order/:id" element={<CustomerTrackOrder />} />
        <Route path="/customer/track-orderxx" element={<CustomerTrackOrderxx />} />
        <Route path="/customer/topsales" element={<CustomerTopSales />} />


        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/customers" element={<AdminListCustomer />} />
        <Route path="/admin/customers/:username" element={<AdminViewCustomer />} />
        <Route path="/admin/generate-customer-report" element={<AdminGenerateCustomerReport />} />
        <Route path="/admin/report-view" element={<AdminViewCustomerReport />} />
        <Route path="/admin/vendors" element={<AdminListVendor />} />
        <Route path="/admin/vendors/:businessName" element={<AdminViewVendor />} />
        <Route path="/admin/generate-vendor-report" element={<AdminGenerateVendorReport />} />
        <Route path="/admin/request/email/:email" element={<AdminRegistrationRequest />} />
        <Route path="/admin/notification" element={<AdminNotification />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
    
      </Routes>
    </Router>
  );
}

export default App;
