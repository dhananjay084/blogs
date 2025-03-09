import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/NavBar';
import '../styles/globals.css';
import "react-toastify/dist/ReactToastify.css";
function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
        <Navbar />
        <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;